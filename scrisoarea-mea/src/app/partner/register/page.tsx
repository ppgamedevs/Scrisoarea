export default function PartnerRegisterPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-4">Aplică pentru Parteneriat</h1>
                <p className="text-slate-500">
                    Procesul de verificare și înregistrare a partenerilor (ONG-uri, Instituții) necesită contact direct.
                    <br /><br />
                    Te rugăm să ne contactezi la <a href="mailto:parteneri@scrisoarea-mea.ro" className="text-blue-600 underline">parteneri@scrisoarea-mea.ro</a>.
                </p>
                <div className="mt-6">
                    <a href="/partner/login" className="text-blue-600 hover:underline">Înapoi la Portal</a>
                </div>
            </div>
        </main>
    )
}
