import Link from "next/link"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { DeleteTeamMemberButton, TeamMemberForm, TeamToast } from "./team-member-form"

export default async function AdminTeamPage({
    searchParams,
}: {
    searchParams: Promise<{ edit?: string; nou?: string }>
}) {
    await requireAdmin()
    const { edit, nou } = await searchParams
    const members = await prisma.teamMember.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })
    const editing = edit ? members.find((member) => member.id === edit) : null
    const adding = !editing && nou === "1"
    const canAdd = members.length < 5

    return (
        <div className="space-y-8 max-w-4xl">
            <TeamToast />
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Echipă</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Numele, titlul, poza și poziția apar pe pagina Despre. Maximum 5 membri.
                    </p>
                </div>
                {canAdd && !adding && !editing ? (
                    <Button asChild>
                        <Link href="/admin/echipa?nou=1">Adaugă membru</Link>
                    </Button>
                ) : null}
            </div>

            {editing ? <TeamMemberForm member={editing} /> : null}
            {adding ? (
                <TeamMemberForm
                    defaultPosition={[1, 2, 3, 4, 5].find((slot) => !members.some((member) => member.sortOrder === slot)) ?? 5}
                />
            ) : null}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 border-b">
                        <tr>
                            <th className="p-4">Poză</th>
                            <th className="p-4">Poziție</th>
                            <th className="p-4">Nume</th>
                            <th className="p-4">Titlu</th>
                            <th className="p-4">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length === 0 ? (
                            <tr>
                                <td className="p-4 text-neutral-500" colSpan={5}>
                                    Niciun membru în echipă.
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="border-b last:border-0">
                                    <td className="p-4">
                                        {member.imageUrl ? (
                                            <img
                                                src={member.imageUrl}
                                                alt=""
                                                className="h-12 w-12 rounded-full object-cover bg-neutral-100"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 font-semibold text-neutral-500">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">{member.sortOrder}</td>
                                    <td className="p-4 font-medium">{member.name}</td>
                                    <td className="p-4">{member.title}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/echipa?edit=${member.id}`}
                                                className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-neutral-50"
                                            >
                                                Editează
                                            </Link>
                                            <DeleteTeamMemberButton id={member.id} name={member.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
