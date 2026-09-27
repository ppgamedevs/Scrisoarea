export type LetterCategory = {
    value: string
    slug: string
    label: string
    title: string
    description: string
    keywords: string[]
}

export const LETTER_CATEGORIES: LetterCategory[] = [
    {
        value: "EDUCATIE",
        slug: "educatie",
        label: "Educație",
        title: "Scrisori pentru educație și rechizite școlare",
        description:
            "Donează pentru rechizite, ghiozdane, cărți și materiale școlare cerute de copii din România, prin scrisori verificate de Visuri pe hârtie.",
        keywords: ["rechizite", "ghiozdan", "școală", "donație educație copii", "caiete", "manuale"],
    },
    {
        value: "IMBRACAMINTE",
        slug: "imbracaminte",
        label: "Îmbrăcăminte",
        title: "Scrisori pentru haine și încălțăminte",
        description:
            "Ajută un copil din România cu haine, ghete sau echipament de iarnă. Fiecare scrisoare este verificată de un partener instituțional.",
        keywords: ["haine copii", "încălțăminte", "ghete", "donație haine", "îmbrăcăminte"],
    },
    {
        value: "JUCARII",
        slug: "jucarii",
        label: "Jucării",
        title: "Scrisori pentru jucării și cadouri de Moș Crăciun",
        description:
            "Îndeplinește dorința de jucării a unui copil. Scrisori către Moș Crăciun și Iepuraș, verificate, cu dovadă după livrare.",
        keywords: ["jucării", "Moș Crăciun", "cadou copil", "scrisoare Moș Crăciun", "iepuraș"],
    },
    {
        value: "SPORT",
        slug: "sport",
        label: "Sport",
        title: "Scrisori pentru sport și echipament",
        description:
            "Donează echipament sportiv, biciclete sau ghete de fotbal pentru copii din medii vulnerabile din România.",
        keywords: ["echipament sportiv", "bicicletă", "fotbal", "donație sport copii"],
    },
    {
        value: "ARTISTIC",
        slug: "artistic",
        label: "Artistic",
        title: "Scrisori pentru materiale artistice",
        description:
            "Susține talentul copiilor cu creioane, pensule, instrumente muzicale sau materiale de desen, prin scrisori verificate.",
        keywords: ["desen", "muzică", "materiale artistice", "instrument muzical"],
    },
    {
        value: "PROVIZII",
        slug: "provizii",
        label: "Alimente și igienă",
        title: "Scrisori pentru alimente și produse de igienă",
        description:
            "Ajută cu alimente, pachete de igienă sau provizii de bază pentru copii din centre și familii vulnerabile.",
        keywords: ["alimente", "igienă", "pachet alimentar", "provizii"],
    },
    {
        value: "MEDICAL",
        slug: "medical",
        label: "Medical",
        title: "Scrisori pentru nevoi medicale",
        description:
            "Contribuie la dispozitive, ochelari sau materiale medicale cerute prin scrisori verificate de instituții partenere.",
        keywords: ["medical", "ochelari", "dispozitiv medical", "donație sănătate copii"],
    },
    {
        value: "ALTCEVA",
        slug: "altele",
        label: "Alte dorințe",
        title: "Alte scrisori verificate de ajutor",
        description:
            "Dorințe care nu se încadrează într-o categorie unică: mobilier, tehnologie educațională sau nevoi mixte, toate verificate.",
        keywords: ["donație copii România", "scrisoare ajutor", "dorință copil"],
    },
]

const ALIASES: Record<string, string> = {
    HAINE: "IMBRACAMINTE",
    RECHIZITE: "EDUCATIE",
    IMBRACAMINTE: "IMBRACAMINTE",
    EDUCATIE: "EDUCATIE",
    JUCARII: "JUCARII",
    SPORT: "SPORT",
    ARTISTIC: "ARTISTIC",
    PROVIZII: "PROVIZII",
    MEDICAL: "MEDICAL",
    ALTCEVA: "ALTCEVA",
}

export function resolveCategory(input: string): LetterCategory | undefined {
    const normalized = ALIASES[input.toUpperCase()] || input.toUpperCase()
    return (
        LETTER_CATEGORIES.find((c) => c.value === normalized) ||
        LETTER_CATEGORIES.find((c) => c.slug === input.toLowerCase())
    )
}

export function categoryLabel(value?: string | null): string {
    if (!value) return "Dorință"
    return resolveCategory(value)?.label || value
}

export function slugifyRo(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/ș/g, "s")
        .replace(/ț/g, "t")
        .replace(/ă/g, "a")
        .replace(/â/g, "a")
        .replace(/î/g, "i")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}
