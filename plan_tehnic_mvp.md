# Plan Tehnic de Implementare - MVP Scrisoarea Mea

## 1. Stack Tehnologic
Am ales **Opțiunea A** pentru viteză și stabilitate:
*   **Framework:** Next.js 14+ (App Router)
*   **Database:** Postgres (Supabase)
*   **Auth:** Supabase Auth (Integrat ușor cu RLS)
*   **ORM:** Prisma (Schema-first, type-safe)
*   **Payments:** Stripe (Dezvoltare rapidă, webhook-uri clare)
*   **UI:** TailwindCSS + shadcn/ui

---

## 2. Ghid de Inițializare (Comenzi)

Rulează aceste comenzi în terminal pentru a crea structura de bază:

### Pas 1: Scaffolding
```bash
npx create-next-app@latest . --typescript --tailwind --eslint
# La prompturi:
# - Would you like to use src/ directory? -> Yes
# - Would you like to use App Router? -> Yes
# - Would you like to customize the default import alias? -> No
```

### Pas 2: Instalare Dependențe Cheie
```bash
# UI Components
npx shadcn-ui@latest init
# (Accept defaults: Zinc/Slate, CSS variables: Yes)

# Prisma & Database
npm install prisma --save-dev
npm install @prisma/client

# Supabase Auth Helper & Stripe
npm install @supabase/ssr @supabase/supabase-js stripe
```

### Pas 3: Configurare Mediu
1.  Copiază `.env.example` în `.env`.
2.  Completează cheile din dashboard-ul Supabase și Stripe.
3.  Generează clientul Prisma:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

---

## 3. Schema Prisma
Schema completă a fost creată în fișierul `prisma/schema.prisma`.
Include modelele:
*   `Scrisoare`: Cu status logic și protecție date personale.
*   `Reservation`: Pentru blocarea sumelor timp de 30 minute.
*   `Profile`: Extensie pentru userii admin/parteneri.

---

## 4. Implementare RBAC (Snippet Middleware)

Creează `src/middleware.ts` pentru a proteja rutele `/admin` și `/partner`.

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect Admin Routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    // Aici ar trebui un check suplimentar în DB pentru rolul 'ADMIN'
    // Pentru MVP, poți seta Claim-uri custom în Supabase sau interoga tabela Profile
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/partner/:path*', '/login'],
}
```

---

## 5. Skeleton Plăți (Stripe + Reservations)

Logica atomică pentru a preveni "Overfunding":

**Pas A: Server Action `createReservation`**
```typescript
// src/app/actions/donate.ts
"use server"
import prisma from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function createReservation(letterId: string, amount: number) {
    // 1. Start Transaction
    return await prisma.$transaction(async (tx) => {
        const letter = await tx.scrisoare.findUnique({ where: { id: letterId } })
        
        // 2. Calculate available space (Target - (Collected + ActiveReservations))
        const activeReservations = await tx.reservation.findMany({
            where: { scrisoareId: letterId, expiresAt: { gt: new Date() } }
        })
        const reservedTotal = activeReservations.reduce((acc, r) => acc + Number(r.amount), 0)
        const currentTotal = Number(letter.collectedAmount) + reservedTotal
        
        if (currentTotal + amount > Number(letter.targetAmount)) {
            throw new Error("Suma depășește necesarul rămas.")
        }

        // 3. Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // in bani
            currency: 'ron',
            metadata: { letterId }
        })

        // 4. Save Reservation
        await tx.reservation.create({
            data: {
                amount,
                stripePaymentIntentId: paymentIntent.id,
                scrisoareId: letterId,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 mins
            }
        })

        return { clientSecret: paymentIntent.client_secret }
    })
}
```

**Pas B: Webhook Handler `src/app/api/webhooks/route.ts`**
Când plata e confirmată:
1. Găsești `Reservation` după `paymentIntentId`.
2. Creezi `Donation` (Status PAID).
3. Ștergi `Reservation`.
4. Updatezi `Scrisoare.collectedAmount` += suma.
5. Verifici dacă `collectedAmount` >= `targetAmount`. Dacă da, update status Scrisoare la `FINANTAT`.

---

## 6. Structură Pagini (Folder Structure)

```text
src/
├── app/
│   ├── (public)/              # Layout public (fără sidebar)
│   │   ├── page.tsx           # Homepage ("Scrisorile")
│   │   ├── scrisori/
│   │   │   ├── page.tsx       # Lista (Browse)
│   │   │   └── [id]/page.tsx  # Detaliu + Modul Donare
│   ├── (auth)/
│   │   ├── login/page.tsx     # Login Admin/Partner
│   ├── admin/                 # Layout Admin
│   │   ├── page.tsx           # Dashboard
│   │   ├── partners/          # Gestiune parteneri
│   │   └── approvals/         # Moderare Scrisori/Dovezi
│   └── partner/               # Layout Partner
│       ├── page.tsx           # Dashboard propriu
│       └── scrisoare/
│           ├── new/page.tsx   # Upload formular
│           └── [id]/proof/    # Upload dovadă
├── components/
│   ├── ui/                    # shadcn components
│   ├── letter-card.tsx
│   └── donation-form.tsx
└── lib/
    ├── prisma.ts              # Singleton Prisma
    ├── stripe.ts              # Stripe init
    └── utils.ts
```

Fiecare pagină trebuie să fie un "Server Component" implicit, folosind "Client Components" doar pentru interactivitate (formulare, butoane).
