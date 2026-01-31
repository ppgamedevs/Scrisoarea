import prisma from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AuditLogPage() {
    const session = await getSession()
    if (session?.role !== 'ADMIN') redirect('/login')

    const logs = await prisma.actionLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Jurnal de Audit (Ultimele 100)</h1>
            <div className="bg-white border rounded shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Dată</TableHead>
                            <TableHead>Actor</TableHead>
                            <TableHead>Acțiune</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Meta</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map(log => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap text-xs text-slate-500">
                                    {log.createdAt.toLocaleString('ro-RO')}
                                </TableCell>
                                <TableCell className="text-sm">
                                    <span className="font-mono text-xs bg-slate-100 px-1 rounded">{log.actorType}</span> {log.actorId.substring(0, 6)}...
                                </TableCell>
                                <TableCell className="font-bold text-xs">{log.actionType}</TableCell>
                                <TableCell className="text-xs">
                                    {log.targetType}: {log.targetId.substring(0, 8)}
                                </TableCell>
                                <TableCell className="text-xs font-mono max-w-xs truncate text-slate-400">
                                    {log.metadata || '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
