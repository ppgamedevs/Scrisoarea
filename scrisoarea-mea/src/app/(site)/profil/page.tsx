import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function ProfilePage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const donations = await prisma.donation.findMany({
        where: { donorEmail: session.email, status: 'SUCCEEDED' },
        include: { scrisoare: { include: { institution: true, proofs: true } } },
        orderBy: { createdAt: 'desc' }
    })

    const totalGiven = donations.reduce((acc, d) => acc + Number(d.amount), 0)
    const impactCount = new Set(donations.map(d => d.scrisoareId)).size

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Salut, {session.email.split('@')[0]}</h1>
                    <form action={async () => {
                        "use server"
                        const { logout } = await import("@/lib/auth")
                        await logout()
                        redirect('/')
                    }}>
                        <button className="text-sm text-red-600 hover:underline">Deconectare</button>
                    </form>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Total Donat</div>
                        <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalGiven)}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Copii Susținuți</div>
                        <div className="text-3xl font-bold text-blue-600">{impactCount}</div>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center">
                        <p className="text-blue-800 text-sm">
                            Mulțumim că faci parte din comunitatea noastră de bine! Fiecare donație ajunge 100% la copii.
                        </p>
                    </div>
                </div>

                {/* History */}
                <h2 className="text-xl font-bold mb-6">Istoric Donații</h2>
                {donations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <div className="text-4xl mb-4">🌱</div>
                        <p className="text-slate-500 mb-4">Încă nu ai făcut nicio donație.</p>
                        <Link href="/scrisori" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                            Descoperă o cauză
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 font-medium text-slate-500">Data</th>
                                    <th className="p-4 font-medium text-slate-500">Cauza</th>
                                    <th className="p-4 font-medium text-slate-500">Suma</th>
                                    <th className="p-4 font-medium text-slate-500 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {donations.map(d => (
                                    <tr key={d.id} className="hover:bg-slate-50">
                                        <td className="p-4 text-slate-600">
                                            {new Date(d.createdAt).toLocaleDateString('ro-RO')}
                                        </td>
                                        <td className="p-4 font-medium">
                                            <Link href={`/scrisori/${d.scrisoare.slug || d.scrisoare.id}`} className="hover:underline text-blue-900">
                                                Dorința lui {d.scrisoare.childFirstName}
                                            </Link>
                                        </td>
                                        <td className="p-4 font-bold text-slate-900">{formatCurrency(Number(d.amount))}</td>
                                        <td className="p-4 text-right">
                                            {d.scrisoare.status === 'LIVRAT' || d.scrisoare.status === 'INCHIS' ? (
                                                <Badge className="bg-emerald-100 text-emerald-800 border-none">Îndeplinit 🎉</Badge>
                                            ) : (
                                                <Badge variant="secondary">În proces</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    )
}
