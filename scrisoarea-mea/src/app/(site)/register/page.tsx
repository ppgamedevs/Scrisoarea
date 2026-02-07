export default function RegisterPage() {
    return (
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-4">Înregistrare Donator</h1>
                <p className="text-slate-500">
                    Funcționalitatea de înregistrare conturi noi va fi disponibilă în curând.
                    <br />
                    Pentru testare folosiți contul demo: <strong>donator / parola123</strong>.
                </p>
                <div className="mt-6">
                    <a href="/login" className="text-blue-600 hover:underline">Înapoi la Autentificare</a>
                </div>
            </div>
        </main>
    )
}
