import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

const Category = {
  EDUCATIE: 'EDUCATIE',
  ALTCEVA: 'ALTCEVA'
}

async function main() {
  console.log(`Start seeding Admin & Partner ...`)

  // 1. Create Partner Institution
  const institution = await prisma.institution.upsert({
    where: { cui: '12345678' },
    update: {
      addressPrivate: "Strada Secreta nr 15, Sector 1, Bucuresti",
      contactName: "Director Popescu",
      contactEmail: "contact@speranta.ro"
    },
    create: {
      name: 'Asociatia Speranta Tuturor',
      cui: '12345678',
      county: 'Bucuresti',
      city: 'Sector 1',
      verified: true,
      addressPrivate: "Strada Secreta nr 15, Sector 1, Bucuresti",
      contactName: "Director Popescu",
      contactEmail: "contact@speranta.ro"
    }
  })

  // 2. Create Profiles (Simulating Auth)
  // Admin User
  await prisma.profile.upsert({
    where: { email: 'admin@scrisoarea.ro' },
    update: {},
    create: {
      authId: 'admin-uid-123',
      email: 'admin@scrisoarea.ro',
      role: 'ADMIN',
      firstName: 'Super',
      lastName: 'Admin'
    }
  })

  // Partner User
  await prisma.profile.upsert({
    where: { email: 'partner@speranta.ro' },
    update: {},
    create: {
      authId: 'partner-uid-456',
      email: 'partner@speranta.ro',
      role: 'PARTNER',
      firstName: 'Ion',
      lastName: 'Popescu',
      institutionId: institution.id
    }
  })

  console.log(`Seeding finished. Added Admin & Partner.`)
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
