import { pageMetadata } from "@/lib/seo/metadata"
import { getSponsorshipBeneficiary } from "@/lib/sponsorship/beneficiary"
import Directioneaza20Client from "@/components/forms/directioneaza-20-client"

export const metadata = pageMetadata({
    title: "Sponsorizare pentru companii",
    description:
        "Susține Visuri pe hârtie printr-un contract de sponsorizare sau, dacă firma este eligibilă, prin redirecționarea impozitului pe profit cu Formularul 177.",
    path: "/directioneaza-20",
    keywords: ["formular 177", "sponsorizare companii", "impozit pe profit", "CSR", "Legea 32/1994"],
})

export default function Directioneaza20Page() {
    const beneficiary = getSponsorshipBeneficiary()

    return (
        <Directioneaza20Client
            beneficiaryName={beneficiary.name}
            anafRegistryConfirmed={beneficiary.anafRegistryConfirmed}
        />
    )
}
