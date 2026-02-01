import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, calculateAgeBucket } from "@/lib/utils"

// Minimal simplified card for reuse
interface ScrisoareCardProps {
    letter: any // using any for MVP velocity, ideally Prisma type
}

export function ScrisoareCard({ letter }: ScrisoareCardProps) {
    const percent = Math.min(100, Math.round((Number(letter.collectedAmount) / Number(letter.targetAmount)) * 100))
    const isFunded = letter.status === 'FINANTAT' || letter.status === 'IN_ACHIZITIE' || letter.status === 'LIVRAT' || letter.status === 'INCHIS'
    const institution = letter.institution

    return (
        <article className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all h-full flex flex-col relative group">
            <Link href={`/scrisori/${letter.slug || letter.id}`} className="absolute inset-0 z-0">
                <span className="sr-only">Vezi detalii</span>
            </Link>

            <div className="aspect-[16/10] bg-neutral-100 relative overflow-hidden">
                <img src={letter.originalImgUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                {letter.campaign && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                        Matching Activ
                    </div>
                )}
                {isFunded && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-sm">
                            Finanțat
                        </span>
                    </div>
                )}
            </div>
            <div className="p-5 flex-1 flex flex-col z-10 relative pointer-events-none">
                <div className="mb-4">
                    <div className="flex justify-between items-start mb-2 pointer-events-auto">
                        <Link href={`/scrisori/${letter.slug || letter.id}`} className="font-bold text-lg hover:underline decoration-slate-300 underline-offset-4">
                            {letter.childFirstName}, {calculateAgeBucket(letter.childAge)} ani
                        </Link>
                        <Badge variant="secondary" className="text-xs font-mono">{letter.category}</Badge>
                    </div>

                    {/* Partner Line */}
                    {institution && (
                        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1 pointer-events-auto">
                            <span>Publicat de</span>
                            {institution.slug ? (
                                <Link href={`/partener/${institution.slug}`} className="font-medium text-slate-700 hover:text-blue-600 hover:underline">
                                    {institution.publicName || institution.name}
                                </Link>
                            ) : (
                                <span className="font-medium text-slate-700">{institution.publicName || institution.name}</span>
                            )}
                            {institution.verified && (
                                <span className="inline-block w-3 h-3 text-blue-500" title="Partener Verificat">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                </span>
                            )}
                        </div>
                    )}

                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{letter.childStory || "Povestea copilului..."}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>{formatCurrency(Number(letter.collectedAmount))}</span>
                        <span>din {formatCurrency(Number(letter.targetAmount))}</span>
                    </div>
                </div>
            </div>
        </article>
    )
}
