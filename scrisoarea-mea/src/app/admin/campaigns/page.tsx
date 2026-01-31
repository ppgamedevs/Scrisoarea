import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function CampaignsPage() {
    const campaigns = await prisma.campaign.findMany({
        include: { matchingRules: true, _count: { select: { scrisori: true } } },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Campanii</h1>
                <Button>+ Campanie Nouă (WIP)</Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nume</TableHead>
                            <TableHead>Perioadă</TableHead>
                            <TableHead>Scrisori</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Matching</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map(c => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.title}</TableCell>
                                <TableCell>{c.startsAt.toLocaleDateString()} - {c.endsAt ? c.endsAt.toLocaleDateString() : 'Nedeterminat'}</TableCell>
                                <TableCell>{c._count.scrisori}</TableCell>
                                <TableCell>{c.status}</TableCell>
                                <TableCell>
                                    {c.matchingRules.length > 0 ? (
                                        <span className="text-green-600 font-bold">Activ</span>
                                    ) : (
                                        <span className="text-slate-400">Inactiv</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
