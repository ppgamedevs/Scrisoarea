import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to generate slugs
function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '')             // Trim - from end
}

// Local constants instead of Enums
const Category = {
  EDUCATIE: 'EDUCATIE',
  IMBRACAMINTE: 'IMBRACAMINTE',
  JUCARII: 'JUCARII',
  SPORT: 'SPORT',
  ARTISTIC: 'ARTISTIC',
  MEDICAL: 'MEDICAL',
  ALIMENTE: 'ALIMENTE',
  ALTCEVA: 'ALTCEVA'
}

const letters = [
  {
    childFirstName: 'Andrei',
    childAge: 7,
    childGender: 'M',
    county: 'Vaslui',
    story: 'Andrei locuiește cu bunica lui într-o casă mică. Îi place matematica și vrea să devină inginer. Are nevoie de un ghiozdan nou pentru școală.',
    wish: 'Ghiozdan echipat, rechizite, culegere mate',
    category: Category.EDUCATIE,
    amount: 250,
  },
  {
    childFirstName: 'Maria',
    childAge: 10,
    childGender: 'F',
    county: 'Botosani',
    story: 'Maria este talentată la desen, dar nu are culori și blocuri de desen. Părinții ei lucrează cu ziua și nu își permit materiale de artă.',
    wish: 'Set acuarele, bloc desen, pensule',
    category: Category.ARTISTIC,
    amount: 150,
  },
  {
    childFirstName: 'Ionut',
    childAge: 12,
    childGender: 'M',
    county: 'Iasi',
    story: 'Ionut joaca fotbal in curtea scolii descult. Isi doreste enorm o minge si adidasi marimea 38.',
    wish: 'Adidasi sport marimea 38, minge fotbal',
    category: Category.SPORT,
    amount: 300,
  },
  {
    childFirstName: 'Elena',
    childAge: 6,
    childGender: 'F',
    county: 'Suceava',
    story: 'Elena merge la gradinita si ii plac papusile. Nu a avut niciodata o papusa noua.',
    wish: 'Papusa, hainute iarna marimea 116',
    category: Category.JUCARII,
    amount: 200,
  },
  {
    childFirstName: 'Vasile',
    childAge: 14,
    childGender: 'M',
    county: 'Neamt',
    story: 'Vasile are nevoie de o gecuta de iarna calduroasa pentru a merge la liceu in orasul vecin.',
    wish: 'Geaca iarna marimea M, fular, manusi',
    category: Category.IMBRACAMINTE,
    amount: 350,
  },
  {
    childFirstName: 'Georgiana',
    childAge: 9,
    childGender: 'F',
    county: 'Bacau',
    story: 'Georgiana are probleme de vedere si are nevoie de ochelari noi, cei vechi s-au rupt.',
    wish: 'Consult oftalmologic si ochelari',
    category: Category.MEDICAL,
    amount: 500,
  },
  {
    childFirstName: 'Mihai',
    childAge: 8,
    childGender: 'M',
    county: 'Vaslui',
    story: 'Mihai isi doreste dulciuri si fructe de Craciun pentru fratiorii lui mai mici.',
    wish: 'Pachet alimente neperisabile, dulciuri, fructe',
    category: Category.ALIMENTE,
    amount: 150
  },
  {
    childFirstName: 'Ana',
    childAge: 5,
    childGender: 'F',
    county: 'Galati',
    story: 'Ana vrea o bicicleta sa invete sa mearga. Nu are nicio jucarie mare.',
    wish: 'Bicicleta pentru copii 5 ani',
    category: Category.JUCARII,
    amount: 400
  }
]

async function main() {
  console.log(`Start seeding ...`)

  // 1. Create Institution
  const institution = await prisma.institution.upsert({
    where: { cui: '12345678' },
    update: {},
    create: {
      name: 'Asociatia Speranta Tuturor',
      cui: '12345678',
      county: 'Bucuresti',
      city: 'Sector 1',
      verified: true
    }
  })

  // 2. Create Letters
  // Multiply data to look full
  let counter = 1
  for (let i = 0; i < 4; i++) { // 4x8 = 32 letters
    for (const l of letters) {
      const publicCode = `${l.childFirstName.toUpperCase()}-${counter++}-${Math.floor(Math.random() * 1000)}`
      // Generator Unic SLUG: nume-varsta-judet-random
      const baseSlug = slugify(`${l.childFirstName}-${l.childAge}-ani-${l.county}`)
      const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

      await prisma.scrisoare.create({
        data: {
          publicCode: publicCode,
          slug: uniqueSlug,
          childFirstName: l.childFirstName,
          childLastName: 'P.', // Hidden
          childAge: l.childAge,
          childGender: l.childGender,
          institutionId: institution.id,
          childStory: l.story,
          wishList: l.wish,
          category: l.category,
          targetAmount: l.amount,
          originalImgUrl: `https://placehold.co/600x800/png?text=Scrisoare+${l.childFirstName}`,
          status: 'ACTIV'
        }
      })
    }
  }

  console.log(`Seeding finished.`)
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
