import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminRedirectionsPage() {
    const session = await getSession()
    if (session?.role !== 'ADMIN') redirect('/login')

    const requests = await prisma.taxRedirectionRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Redirecționări Impozit</h1>
                <div className="flex gap-2">
                    <Button variant="outline">Export CSV</Button>
                </div>
            </div>

            <div className="bg-white rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Tip</TableHead>
                            <TableHead>Nume / Companie</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Detalii</TableHead>
                            <TableHead className="text-right">Acțiuni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>{req.createdAt.toLocaleDateString('ro-RO')}</TableCell>
                                <TableCell>
                                    <Badge variant={req.type === 'COMPANY_177' ? 'default' : 'secondary'}>
                                        {req.type === 'COMPANY_177' ? '177 (Firma)' : '230 (Indiv.)'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">
                                        {req.type === 'COMPANY_177' ? req.companyName : `${req.lastName} ${req.firstName}`}
                                    </div>
                                    <div className="text-xs text-slate-500">{req.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        req.status === 'SUBMITTED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            req.status === 'FILED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                ''
                                    }>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {req.type === 'COMPANY_177' ? (
                                        <span>{req.amountRON?.toString()} RON</span>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild size="sm" variant="ghost">
                                        <Link href={`/admin/redirectionari/${req.id}`}>Vezi</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                                    Nicio cerere înregistrată.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
