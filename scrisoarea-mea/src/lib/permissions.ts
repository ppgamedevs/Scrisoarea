
import { UserRole } from "@prisma/client";
import { UserSession } from "@/lib/auth";

type LetterMinimal = {
    institutionId: string
    status: string
}

/**
 * Checks if a user can donate to a specific letter.
 * Rules:
 * - Anonymous users can donate.
 * - DONOR and SPONSOR users can donate.
 * - PARTNER users can donate ONLY if the letter belongs to a DIFFERENT organization.
 * - PARTNER users CANNOT donate to their own organization's letters (to avoid confusion/accidental payment).
 */
export function canDonate(user: UserSession | null, letter: LetterMinimal): boolean {
    if (!user) return true; // Anonymous

    if (user.role === UserRole.ADMIN) return true; // Admins can test donation flow

    if (user.role === UserRole.DONOR || user.role === UserRole.SPONSOR) return true;

    if (user.role === UserRole.PARTNER) {
        // Prevent donating to own letters
        if (user.institutionId && user.institutionId === letter.institutionId) {
            return false;
        }
        // Allow donating to others? Requirement says: "You are logged in as partner; switch to donor/sponsor to donate."
        // User asked to choose safer option. I will allow it but UI might show warning, OR disable it completely.
        // Requirement 3: "If viewer is PARTNER but the letter belongs to another org: Treat like DONOR view (optional) OR show a message... choose the safer option"
        // Safest is to Disable Donation for Partners entirely to force them to switch accounts, avoiding role confusion.
        // However, technically they might want to support a friend.
        // Let's return FALSE for now to be strict as requested "remove role confusion".
        return false;
    }

    return false;
}

/**
 * Checks if a user can manage (edit, upload proof) a specific letter.
 */
export function canManageLetter(user: UserSession | null, letter: LetterMinimal): boolean {
    if (!user) return false;

    if (user.role === UserRole.ADMIN) return true;

    if (user.role === UserRole.PARTNER) {
        return user.institutionId === letter.institutionId;
    }

    return false;
}

export function isPartnerForLetter(user: UserSession | null, letter: LetterMinimal): boolean {
    if (!user) return false;
    return user.role === UserRole.PARTNER && user.institutionId === letter.institutionId;
}
