import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { LetterWithMeta } from "@/lib/letters"
import { formatCurrency } from "@/lib/utils"

export function ScrisoareCard({ letter }: { letter: LetterWithMeta }) {
    // Logic for status badge
    let statusLabel = "Nou"
    let statusColor = "bg-blue-100 text-blue-800"

    if (letter.percentage >= 100) {
        statusLabel = "Complet"
        statusColor = "bg-green-100 text-green-800"
    } else if (letter.percentage > 75) {
        statusLabel = "Aproape Gata"
        statusColor = "bg-orange-100 text-orange-800"
    }

    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md border-neutral-200">
            <CardHeader className="p-0">
                <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                    {/* Fallback image or real crop */}
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                        {letter.originalImgUrl.includes('placehold') ? (
                            <img src={letter.originalImgUrl} alt="Scrisoare" className="object-cover w-full h-full opacity-80" />
                        ) : (
                            <span className="text-sm">Imagine Scrisoare</span>
                        )}
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-5 space-y-4">
                {/* Child Info */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-medium text-neutral-900">{letter.childFirstName}</h3>
                        <p className="text-sm text-neutral-500">{letter.childAge} ani • {letter.institution.county}</p>
                    </div>
                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide border px-2 py-0.5 rounded">
                        {letter.category}
                    </div>
                </div>

                {/* Wish */}
                <div className="text-sm text-neutral-700 line-clamp-2">
                    {letter.wishList}
                </div>

                {/* Funding */}
                <div className="space-y-2 mt-auto pt-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-semibold text-neutral-900">{formatCurrency(letter.collectedAmount + letter.reservedAmount)}</span>
                        <span className="text-neutral-500">din {formatCurrency(letter.targetAmount)}</span>
                    </div>
                    <Progress value={letter.percentage} className="h-2" />
                    <p className="text-xs text-neutral-500 text-right">
                        {letter.percentage}% finanțat
                    </p>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Button asChild className="w-full bg-neutral-900 hover:bg-neutral-800 text-white">
                    <Link href={`/scrisori/${letter.id}`}>
                        Vezi cererea
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
