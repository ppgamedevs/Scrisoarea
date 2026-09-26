import { prisma } from "../src/lib/prisma"
import { auth } from "../src/lib/auth"

async function ensureUser(opts: {
  email: string
  password: string
  role: "ADMIN" | "PARTNER" | "DONOR"
  firstName: string
  lastName: string
  institutionId?: string
  emailVerified?: boolean
}) {
  const email = opts.email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    await prisma.session.deleteMany({ where: { userId: existing.id } })
    await prisma.account.deleteMany({ where: { userId: existing.id } })
    await prisma.user.delete({ where: { id: existing.id } })
  }

  await auth.api.signUpEmail({
    body: {
      email,
      password: opts.password,
      name: `${opts.firstName} ${opts.lastName}`,
      firstName: opts.firstName,
      lastName: opts.lastName,
    },
  })

  await prisma.user.update({
    where: { email },
    data: {
      role: opts.role,
      emailVerified: opts.emailVerified ?? true,
      institutionId: opts.institutionId,
      firstName: opts.firstName,
      lastName: opts.lastName,
    },
  })
}

async function main() {
  console.log("Start seeding (Better Auth)...")

  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required for seed")
  }

  const institution = await prisma.institution.upsert({
    where: { cui: "12345678" },
    update: {
      publicName: "Asociația Speranța Copiilor",
      slug: "asociatia-speranta-copiilor",
      verified: true,
      institutionType: "ONG",
    },
    create: {
      name: "Asociatia Speranta Tuturor",
      publicName: "Asociația Speranța Copiilor",
      slug: "asociatia-speranta-copiilor",
      descriptionPublic:
        "O organizație dedicată sprijinirii copiilor din medii defavorizate.",
      website: "https://speranta.ro",
      logoUrl: "https://placehold.co/400x400?text=Speranta",
      cui: "12345678",
      county: "Iași",
      city: "Pașcani",
      verified: true,
      institutionType: "ONG",
      addressPrivate: "Strada Secreta nr 15",
      contactName: "Director Popescu",
      contactEmail: "contact@speranta.ro",
    },
  })

  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding.")
  }

  await ensureUser({
    email: adminEmail,
    password: adminPassword,
    role: "ADMIN",
    firstName: "Admin",
    lastName: "Vise",
    emailVerified: true,
  })
  console.log(`Admin ready: ${adminEmail}`)

  await ensureUser({
    email: "partner@speranta.ro",
    password: "parola1234",
    role: "PARTNER",
    firstName: "Ion",
    lastName: "Popescu",
    institutionId: institution.id,
    emailVerified: true,
  })

  await ensureUser({
    email: "donor@gmail.com",
    password: "parola1234",
    role: "DONOR",
    firstName: "Ana",
    lastName: "Donatoare",
    emailVerified: true,
  })

  console.log("Seed finished. Dev passwords use parola1234 (not shown in UI).")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
