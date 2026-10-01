import { MonthlySupportCard } from "@/components/monthly-support"
import { isMonthlyAmount } from "@/lib/monthly-amounts"

export const metadata = {
    title: "Donație lunară",
    description: "Abonament lunar de 10, 25 sau 50 lei pentru funcționarea Visuri pe hârtie. Separat de donația pentru o scrisoare.",
}

export default async function DonatieLunaraPage({
    searchParams,
}: {
    searchParams: Promise<{ suma?: string }>
}) {
    const { suma } = await searchParams
    const parsed = Number(suma)
    const initialAmount = isMonthlyAmount(parsed) ? parsed : 25

    return (
        <main className="min-h-screen bg-[var(--pastel-cream)] py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <MonthlySupportCard initialAmount={initialAmount} />
            </div>
        </main>
    )
}
