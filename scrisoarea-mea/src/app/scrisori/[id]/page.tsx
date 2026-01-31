import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default async function ScrisoareDetailPage({ params }: { params: { id: string } }) {
    const { id } = params

    const letter = await prisma.scrisoare.findUnique({
        where: { id },
        include: {
            institution: true,
            reservations: { where: { expiresAt: { gt: new Date() } } }
        }
    })

    // Basic compute logic duplicata
    if (!letter) notFound()

    const reserved = letter.reservations.reduce((acc, r) => acc + Number(r.amount), 0)
    const paid = Number(letter.collectedAmount)
    const target = Number(letter.targetAmount)
    const totalFunded = paid + reserved
    const remaining = Math.max(0, target - totalFunded)
    const percentage = Math.min(100, Math.round((totalFunded / target) * 100))

    return (
        <main className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 py-8">
                <Link href="/scrisori" className="text-sm text-neutral-500 hover:text-neutral-900 mb-6 block">
                    &larr; Înapoi la listă
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Scrisoare Viewer */}
                    <div className="lg:col-span-2 space-y-8">
                        <h1 className="text-4xl font-light text-neutral-900 leading-tight">
                            Dorința lui {letter.childFirstName}: <span className="font-semibold">{letter.wishList}</span>
                        </h1>

                        <div className="bg-neutral-100 p-4 rounded-lg overflow-hidden border">
                            {/* Image Placeholder */}
                            <img
                                src={letter.originalImgUrl}
                                alt="Scrisoare Originala"
                                className="w-full h-auto object-contain max-h-[800px]"
                            />
                        </div>

                        <div className="prose prose-neutral max-w-none">
                            <h3 className="text-lg font-medium">Transcriere</h3>
                            <p className="text-neutral-600 bg-neutral-50 p-6 rounded italic">
                                "{letter.childStory || "Text indisponibil."}"
                            </p>
                        </div>
                    </div>

                    {/* Right: Donation Module Stick */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 bg-white border border-neutral-200 shadow-xl rounded-xl p-8 space-y-6">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-1">Stadiu Finanțare</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-neutral-900">{formatCurrency(totalFunded)}</span>
                                    <span className="text-neutral-500">din {formatCurrency(target)}</span>
                                </div>
                                <Progress value={percentage} className="h-3 mt-4" />
                                <p className="text-sm text-neutral-500 mt-2 text-right">
                                    Mai sunt necesari <strong>{formatCurrency(remaining)}</strong>
                                </p>
                            </div>

                            <div className="border-t pt-6 space-y-4">
                                <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded">
                                    <strong>Cum funcționează?</strong> Suma ta este blocată temporar (rezervată) până la confirmarea plății pentru a evita dubla finanțare.
                                </div>

                                {letter.status === 'ACTIV' && remaining > 0 ? (
                                    <Button className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700" disabled>
                                        Donează (Coming Soon)
                                    </Button>
                                ) : (
                                    <Button disabled className="w-full text-lg py-6" variant="secondary">
                                        Fonduri Colectate Integral
                                    </Button>
                                )}
                            </div>

                            <div className="text-xs text-neutral-400 text-center">
                                Verificat de {letter.institution.name} • {letter.institution.county}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
