export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-white py-20 px-4">
            <div className="container mx-auto max-w-3xl prose prose-slate">
                <h1>Politica Cookies</h1>

                <p>Acest site folosește un număr minim de cookie-uri necesare pentru funcționarea corectă.</p>

                <h3>Ce cookie-uri folosim:</h3>
                <ul>
                    <li><strong>Esențiale:</strong> Pentru logare și menținerea sesiunii securizate.</li>
                    <li><strong>Funcționale:</strong> Pentru a ține minte preferințele tale (ex: acceptul acestui banner).</li>
                    <li><strong>Analitice:</strong> Folosim analitice anonime pentru a vedea numărul de vizitatori.</li>
                </ul>

                <p>Nu folosim cookie-uri de marketing sau tracking invaziv.</p>
            </div>
        </main>
    )
}
