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
    if (session?.role !== "ADMIN") redirect("/login")

    const [individuals, companies] = await Promise.all([
        prisma.taxRedirectionRequest.findMany({
            where: { type: "INDIVIDUAL_230" },
            orderBy: { createdAt: "desc" },
            take: 100,
        }),
        prisma.companySponsorshipRequest.findMany({
            orderBy: { createdAt: "desc" },
            take: 100,
        }),
    ])

    const rows = [
        ...individuals.map((r) => ({
            id: r.id,
            kind: "230" as const,
            createdAt: r.createdAt,
            label: `${r.lastName || ""} ${r.firstName || ""}`.trim() || r.email,
            email: r.email,
            status: r.status,
            detail: "—",
            href: `/admin/redirectionari/${r.id}`,
            badge: "230 (Indiv.)",
        })),
        ...companies.map((r) => ({
            id: r.id,
            kind: "company" as const,
            createdAt: r.createdAt,
            label: r.companyName,
            email: r.email,
            status: r.status,
            detail: `${Number(r.sponsorshipAmount || r.requestedRedirectAmount || 0)} RON · ${r.flowType}`,
            href: `/admin/redirectionari/s/${r.id}`,
            badge: r.flowType === "FORM_177" ? "177 Draft" : "Sponsorizare",
        })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Redirecționări & Sponsorizări</h1>
            </div>

            <div className="rounded-md border bg-white">
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
                        {rows.map((req) => (
                            <TableRow key={`${req.kind}-${req.id}`}>
                                <TableCell>{req.createdAt.toLocaleDateString("ro-RO")}</TableCell>
                                <TableCell>
                                    <Badge variant={req.kind === "company" ? "default" : "secondary"}>
                                        {req.badge}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{req.label}</div>
                                    <div className="text-xs text-slate-500">{req.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{req.status}</Badge>
                                </TableCell>
                                <TableCell>{req.detail}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild size="sm" variant="ghost">
                                        <Link href={req.href}>Vezi</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
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
