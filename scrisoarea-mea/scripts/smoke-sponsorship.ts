import { writeFileSync } from "fs"
import { generateSponsorshipContract } from "../src/lib/pdf/sponsorship-contract"
import { generateForm177Draft } from "../src/lib/pdf/form177"
import { getSponsorshipBeneficiary } from "../src/lib/sponsorship/beneficiary"

const png =
    "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC"

async function main() {
    const beneficiary = getSponsorshipBeneficiary()
    const contract = await generateSponsorshipContract({
        contractNumber: "SP-2026-000001",
        contractDate: new Date(),
        companyName: "SC Exemplu cu Șță SRL",
        companyCif: "RO1234567",
        representativeName: "Ion Popescu",
        representativeRole: "Administrator",
        email: "a@b.ro",
        county: "Ilfov",
        city: "Pantelimon",
        street: "Pădurii",
        streetNumber: "5",
        amountRon: 5000,
        signatureBase64: `data:image/png;base64,${png}`,
        beneficiary,
    })
    writeFileSync("private/forms/_smoke-contract.pdf", contract)
    console.log("contract bytes", contract.length)

    const draft = await generateForm177Draft({
        fiscalYear: 2025,
        companyCif: "1234567",
        companyName: "SC Exemplu SRL",
        county: "Ilfov",
        city: "Pantelimon",
        street: "Padurii",
        streetNumber: "5",
        email: "a@b.ro",
        maximumRedirectableAmount: 10000,
        previouslyRedirectedAmount: 1000,
        remainingRedirectableAmount: 9000,
        requestedRedirectAmount: 5000,
        contractNumber: "SP-2025-000001",
        contractDate: new Date(),
        disclosureConsent: false,
        signatureBase64: `data:image/png;base64,${png}`,
        beneficiary,
    })
    writeFileSync("private/forms/_smoke-177.pdf", draft)
    console.log("draft177 bytes", draft.length)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
