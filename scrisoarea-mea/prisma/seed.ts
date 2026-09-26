import prisma from '../src/lib/prisma'

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

  // 1. Create Partner Institution (With Public Profile)
  const institution = await prisma.institution.upsert({
    where: { cui: '12345678' },
    update: {
      publicName: "Asociația Speranța Copiilor",
      slug: "asociatia-speranta-copiilor",
      descriptionPublic: "O organizație dedicată sprijinirii copiilor din medii defavorizate, oferindu-le șansa la educație și o viață mai bună prin programe sociale și suport material.",
      website: "https://speranta.ro",
      logoUrl: "https://placehold.co/400x400?text=Speranta",
      verified: true
    },
    create: {
      name: 'Asociatia Speranta Tuturor',
      publicName: 'Asociația Speranța Copiilor',
      slug: 'asociatia-speranta-copiilor',
      descriptionPublic: "O organizație dedicată sprijinirii copiilor din medii defavorizate, oferindu-le șansa la educație și o viață mai bună prin programe sociale și suport material.",
      website: "https://speranta.ro",
      logoUrl: "https://placehold.co/400x400?text=Speranta",
      cui: '12345678',
      county: 'Iași',
      city: 'Pașcani',
      verified: true,
      addressPrivate: "Strada Secreta nr 15",
      contactName: "Director Popescu",
      contactEmail: "contact@speranta.ro"
    }
  })


  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.hash('parola123', 10)

  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment (e.g. .env / .env.local) before seeding.'
    )
  }
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10)

  // 2. Create Users
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'Vise'
    }
  })
  console.log(`Admin user ready: ${adminEmail}`)

  await prisma.user.upsert({
    where: { email: 'partner@speranta.ro' },
    update: {
      passwordHash: hashedPassword
    },
    create: {
      email: 'partner@speranta.ro',
      passwordHash: hashedPassword,
      role: 'PARTNER',
      firstName: 'Ion',
      lastName: 'Popescu',
      institutionId: institution.id
    }
  })

  // Create Donor User
  await prisma.user.upsert({
    where: { email: 'donor@gmail.com' },
    update: {
      passwordHash: hashedPassword
    },
    create: {
      email: 'donor@gmail.com',
      passwordHash: hashedPassword,
      role: 'DONOR',
      firstName: 'Donator',
      lastName: 'Generic'
    }
  })

  // 3. Create Sample Letters
  const lettersData = [
    {
      childFirstName: "Andrei",
      childLastName: "Ionescu",
      childAge: 7,
      childStory: "Andrei este un băiețel plin de energie, pasionat de dinozauri și construcții. Anul acesta a început școala cu mult entuziasm, dar îi lipsește un ghiozdan rezistent și rechizitele necesare pentru a-și face temele cu drag. Familia lui face eforturi mari să îl susțină, însă veniturile sunt modeste.",
      wishList: "Ghiozdan echipat, penar cu instrumente de scris, caiete, enciclopedie cu dinozauri.",
      category: "EDUCATIE",
      targetAmount: 350,
      originalImgUrl: "https://placehold.co/600x800?text=Scrisoare+Andrei"
    },
    {
      childFirstName: "Maria",
      childLastName: "Popa",
      childAge: 10,
      childStory: "Maria visează să devină pictoriță. Are un talent nativ deosebit și umple caietele de schițe cu peisaje colorate. Din păcate, nu are materiale de calitate pentru a exersa. Un set de acuarele profesionale și un șevalet ar însemna enorm pentru ea și ar încuraja-o să nu renunțe la visul ei artistic.",
      wishList: "Set acuarele, pensule, bloc de desen, șevalet mic.",
      category: "ALTCEVA",
      targetAmount: 280,
      originalImgUrl: "https://placehold.co/600x800?text=Scrisoare+Maria"
    },
    {
      childFirstName: "Ștefan",
      childLastName: "Radu",
      childAge: 12,
      childStory: "Pasionat de fotbal, Ștefan bate mingea în curtea școlii până se înserează. Singura lui pereche de adidași s-a rupt, iar părinții nu își permit momentan alții noi de calitate. Își dorește o pereche de ghete de fotbal și o minge, pentru a putea juca alături de colegii săi în echipa școlii.",
      wishList: "Ghete fotbal mărimea 38, minge de fotbal, echipament sportiv.",
      category: "ALTCEVA",
      targetAmount: 450,
      originalImgUrl: "https://placehold.co/600x800?text=Scrisoare+Stefan"
    }
  ]

  for (const l of lettersData) {
    const code = `S-${l.childFirstName.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 1000)}`
    await prisma.scrisoare.upsert({
      where: { publicCode: code },
      update: {},
      create: {
        publicCode: code,
        childFirstName: l.childFirstName,
        childLastName: l.childLastName,
        childAge: l.childAge,
        childStory: l.childStory,
        wishList: l.wishList,
        category: l.category,
        targetAmount: l.targetAmount,
        submittedTargetAmount: l.targetAmount,
        approvedTargetAmount: l.targetAmount,
        originalImgUrl: l.originalImgUrl,
        institutionId: institution.id,
        status: 'ACTIV',
        moderationStatus: 'approved',
        approvedAt: new Date(),
      }
    })
  }

  console.log(`Seeding finished. Added Partner, Users & ${lettersData.length} Letters.`)
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
