import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { approveInstitution } from "@/app/actions/auth-actions"
import { revalidatePath } from "next/cache"

export default async function PartnersAdminPage() {
    await requireAdmin()

    const institutions = await prisma.institution.findMany({
        include: {
            users: { select: { email: true, firstName: true, lastName: true } },
            _count: { select: { scrisori: true } },
        },
        orderBy: [{ verified: "asc" }, { createdAt: "desc" }],
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Parteneri / Instituții</h1>
                <p className="text-sm text-neutral-500 mt-1">
                    Aprobă instituțiile înainte ca acestea să poată publica scrisori.
                </p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 border-b">
                        <tr>
                            <th className="p-4">Instituție</th>
                            <th className="p-4">Tip</th>
                            <th className="p-4">Locație</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {institutions.map((inst) => {
                            const contact = inst.users[0]
                            return (
                                <tr key={inst.id} className="border-b last:border-0">
                                    <td className="p-4">
                                        <div className="font-medium">{inst.publicName || inst.name}</div>
                                        <div className="text-xs text-neutral-500">
                                            CUI: {inst.cui || "—"} · {inst._count.scrisori} scrisori
                                        </div>
                                    </td>
                                    <td className="p-4">{inst.institutionType}</td>
                                    <td className="p-4">
                                        {inst.city}, {inst.county}
                                    </td>
                                    <td className="p-4 text-xs">
                                        <div>{inst.contactName || `${contact?.firstName || ""} ${contact?.lastName || ""}`}</div>
                                        <div>{inst.contactEmail || contact?.email}</div>
                                        <div>{inst.contactPhone}</div>
                                    </td>
                                    <td className="p-4">
                                        {inst.verified ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 border-none">
                                                Aprobată
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">În așteptare</Badge>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {!inst.verified && (
                                            <form
                                                action={async () => {
                                                    "use server"
                                                    await approveInstitution(inst.id)
                                                    revalidatePath("/admin/partners")
                                                }}
                                            >
                                                <Button size="sm" type="submit">
                                                    Aprobă
                                                </Button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {institutions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-neutral-500">
                                    Nicio instituție înregistrată.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
