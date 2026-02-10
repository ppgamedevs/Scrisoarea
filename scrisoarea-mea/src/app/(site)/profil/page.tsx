import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getDonorDashboardData } from "@/lib/donor-data"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Receipt, Heart, Trophy, ArrowRight, Gift, LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth-actions"

export default async function DonorProfilePage() {
    const session = await getSession()
    if (!session || session.role !== 'DONOR') {
        redirect('/login')
    }

    const data = await getDonorDashboardData(session.id)
    if (!data) return <div>Incarcare...</div>

    const { stats, recentDonations, impactGallery } = data
    const firstName = session.email.split('@')[0] // Fallback if name is missing

    return (
        <main className="min-h-screen bg-neutral-50 pb-20">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-12 pb-24 px-4">
                <div className="max-w-5xl mx-auto flex justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Salut, {data.user.firstName || firstName}! 👋</h1>
                        <p className="opacity-90 max-w-lg text-lg">
                            Mulțumim că faci parte din comunitatea noastră de bine! Fiecare donație ajunge 100% la copii.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                        <div className="hidden md:block bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm text-center min-w-[140px]">
                            <div className="text-xs uppercase tracking-widest opacity-70 mb-1">Nivel Curent</div>
                            <div className="font-bold text-xl flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-300" />
                                {stats.badge}
                            </div>
                        </div>

                        <form action={logout}>
                            <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                                <LogOut className="w-4 h-4" /> Deconectare
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-16 space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-lg border-none">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500 font-medium">Total Donat</p>
                                <h3 className="text-2xl font-bold mt-1 text-neutral-900">{formatCurrency(stats.totalDonated)}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Receipt className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-none">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500 font-medium">Copii Susținuți</p>
                                <h3 className="text-2xl font-bold mt-1 text-neutral-900">{stats.uniqueChildrenSupported}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                <Heart className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-none">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500 font-medium">Donații Totale</p>
                                <h3 className="text-2xl font-bold mt-1 text-neutral-900">{stats.donationCount}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Impact Gallery */}
                <section>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900">Impactul Tău</h2>
                            <p className="text-neutral-500 text-sm mt-1">Copiii cărora le-ai îndeplinit visul.</p>
                        </div>
                        {stats.donationCount > 0 && (
                            <Link href="/scrisori">
                                <Button variant="outline" size="sm" className="gap-2">
                                    Caută o nouă cauză <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        )}
                    </div>

                    {stats.donationCount === 0 ? (
                        <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-12 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <Heart className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">Încă nu ai făcut nicio donație</h3>
                            <p className="text-neutral-500 max-w-md mx-auto mt-2 mb-6">
                                Sute de copii așteaptă un gest mic din partea ta. Fiecare donație contează, indiferent de sumă.
                            </p>
                            <Link href="/scrisori">
                                <Button className="bg-blue-600 hover:bg-blue-700 px-8">Descoperă Scrisori</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {impactGallery.map(child => (
                                <Link href={`/scrisori/${child.slug}`} key={child.slug} className="group block h-full">
                                    <div className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                                        <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={child.imageUrl}
                                                alt={child.childName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                    {child.age} ani
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-bold text-lg text-neutral-900 group-hover:text-blue-600 transition-colors">{child.childName}</h3>
                                            <div className="mt-2 text-sm text-neutral-600">
                                                Ai contribuit cu <span className="font-semibold text-blue-600">{formatCurrency(child.totalGivenToThisChild)}</span>
                                            </div>

                                            <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-medium w-fit">
                                                {child.status === 'FINANTAT' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                                        <Gift className="w-3.5 h-3.5" /> Complet Finanțat
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                        <Heart className="w-3.5 h-3.5" /> Susținut parțial
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Recent History Table */}
                {stats.donationCount > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-neutral-900 mb-6">Istoric Donații Recente</h2>
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[600px]">
                                <thead className="bg-neutral-50 text-neutral-600 font-medium border-b text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Copil</th>
                                        <th className="px-6 py-4">Sumă</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Acțiune</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {recentDonations.map(donation => (
                                        <tr key={donation.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4 text-neutral-600 font-medium">
                                                {new Date(donation.date).toLocaleDateString('ro-RO')}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-neutral-900">{donation.childName}</td>
                                            <td className="px-6 py-4 font-bold text-neutral-900">{formatCurrency(donation.amount)}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Succes
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/scrisori/${donation.letterSlug}`} className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-semibold uppercase tracking-wide">
                                                    Vezi Scrisoare
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}
