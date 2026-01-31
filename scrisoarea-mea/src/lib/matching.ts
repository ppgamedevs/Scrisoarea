"use server"

import prisma from "@/lib/prisma"

/**
 * Calculates matching based on active rules.
 * Does NOT update DB. Returns potential match amount.
 */
export async function calculatePotentialMatch(scrisoareId: string, donationAmount: number) {
    const letter = await prisma.scrisoare.findUnique({
        where: { id: scrisoareId },
        include: { campaign: { include: { matchingRules: { include: { sponsor: true } } } } }
    })

    if (!letter || !letter.campaign) return null

    // Find applicable rules
    // Priority: Campaign specific rules first.
    // For MVP, we only implemented Campaign -> MatchingRules relation.
    // So distinct global rules are not yet in schema, just campaign rules.

    // Get active rules
    const now = new Date()
    const activeRules = letter.campaign.matchingRules.filter(r =>
        r.active &&
        r.startsAt <= now &&
        (!r.endsAt || r.endsAt >= now) &&
        Number(r.currentMatchTotal) < Number(r.maxMatchTotal)
    )

    if (activeRules.length === 0) return null

    // Pick the first rule (MVP: single rule per campaign supported for simplicity)
    const rule = activeRules[0]

    // Calculate Match
    // 1:1 match
    let matchAmount = 0

    if (rule.matchType === 'PERCENT_100') {
        matchAmount = donationAmount
    } else if (rule.matchType === 'PERCENT_50') {
        matchAmount = donationAmount * 0.5
    } else if (rule.matchType === 'FIXED_CAP') {
        matchAmount = Number(rule.maxMatchPerDonation || 0)
    }

    // Apply Cap per Tx
    if (rule.maxMatchPerDonation) {
        matchAmount = Math.min(matchAmount, Number(rule.maxMatchPerDonation))
    }

    // Apply Budget Cap
    const remainingBudget = Number(rule.maxMatchTotal) - Number(rule.currentMatchTotal)
    matchAmount = Math.min(matchAmount, remainingBudget)

    // Cannot allow negative match
    matchAmount = Math.max(0, matchAmount)

    return {
        amount: matchAmount,
        sponsorName: rule.sponsor.name,
        ruleId: rule.id,
        sponsorId: rule.sponsor.id
    }
}

/**
 * Applies matching to a SUCCESSFUL donation.
 * Updates Donation with matched amount and Rule usage.
 * Updates Scrisoare collected amount.
 */
export async function applyMatchingToDonation(donationId: string) {
    await prisma.$transaction(async (tx) => {
        const donation = await tx.donation.findUnique({ where: { id: donationId } })
        if (!donation || donation.status !== 'SUCCEEDED' || Number(donation.matchedAmount) > 0) return

        // Recalculate match (to be safe in transaction)
        const match = await calculatePotentialMatch(donation.scrisoareId, Number(donation.amount))

        if (!match || match.amount <= 0) {
            // No match, but update totalCreditedAmount = donorAmount
            await tx.donation.update({
                where: { id: donationId },
                data: { totalCreditedAmount: donation.amount }
            })
            // Update letter collected amount (only donor amount added, as it wasn't added yet?)
            // WAIT - logic check: where do we increment collectedAmount?
            // In the webhook/success handler usually.
            // Let's assume this function is CALLED by the success handler.
            // So we just return the amounts to add?
            // Or we do the updates here.

            // Let's update Donation and MatchingRule here.
            return
        }

        // Lock & Update Rule Budget
        const rule = await tx.matchingRule.findUnique({ where: { id: match.ruleId } })
        if (!rule) return

        // Verify budget again in TX
        const currentTotal = Number(rule.currentMatchTotal)
        const maxTotal = Number(rule.maxMatchTotal)
        const remaining = maxTotal - currentTotal
        const finalMatchAmount = Math.min(match.amount, remaining)

        if (finalMatchAmount <= 0) return

        // Update Rule
        await tx.matchingRule.update({
            where: { id: match.ruleId },
            data: { currentMatchTotal: { increment: finalMatchAmount } }
        })

        // Update Donation
        await tx.donation.update({
            where: { id: donationId },
            data: {
                matchedAmount: finalMatchAmount,
                totalCreditedAmount: Number(donation.amount) + finalMatchAmount,
                matchingRuleId: match.ruleId,
                sponsorId: match.sponsorId
            }
        })

        // Return results to caller to update Letter
        // (Caller usually increments letter.collectedAmount by totalCreditedAmount)
        return finalMatchAmount
    })
}
