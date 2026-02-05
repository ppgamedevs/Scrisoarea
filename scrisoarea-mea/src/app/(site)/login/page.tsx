import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/auth"
import { redirect } from "next/navigation"

export default function LoginPage() {
    async function handleLogin(formData: FormData) {
        "use server"
        const email = formData.get('email') as string
        if (email) {
            const role = await login(email)
            if (role === 'ADMIN') redirect('/admin')
            else if (role === 'PARTNER') redirect('/partner')
            else redirect('/profil')
        }
    }

    return (
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-2">Accesează Platforma</h1>
                <p className="text-slate-500 mb-8">Introdu adresa de email pentru a te loga ca Donator, Partener sau Administrator.</p>

                <form action={handleLogin} className="space-y-4">
                    <div className="text-left">
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <Input name="email" type="email" placeholder="nume@exemplu.ro" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Trimite Link de Acces (Simulat)
                    </Button>
                    <p className="text-xs text-slate-400 mt-4">
                        * În varianta demo, logarea este instantanee pe baza emailului introdus.
                    </p>
                </form>
            </div>
        </main>
    )
}
