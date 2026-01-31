import { PrismaClient, Category, ScrisoareStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create Institutions
  const inst1 = await prisma.institution.upsert({
    where: { cui: 'RO123456' },
    update: {},
    create: {
      name: 'DGASPC Sector 1',
      cui: 'RO123456',
      verified: true,
      county: 'Bucuresti',
      city: 'Bucuresti'
    }
  })

  const inst2 = await prisma.institution.upsert({
    where: { cui: 'RO987654' },
    update: {},
    create: {
      name: 'Asociatia Speranta Iasi',
      cui: 'RO987654',
      verified: true,
      county: 'Iasi',
      city: 'Iasi'
    }
  })

  // 2. Create Letters
  const lettersData = [
    {
      name: 'Andrei', age: 9, category: Category.EDUCATIE, 
      wish: 'Ghiozdan complet si rechizite pentru scoala', 
      target: 250, status: ScrisoareStatus.ACTIV, paid: 50
    },
    {
      name: 'Maria', age: 14, category: Category.IMBRACAMINTE, 
      wish: 'O geaca de iarna calduroasa si ghete marimea 38', 
      target: 400, status: ScrisoareStatus.ACTIV, paid: 150
    },
    {
      name: 'Ionut', age: 12, category: Category.SPORT, 
      wish: 'Minge de fotbal si echipament', 
      target: 150, status: ScrisoareStatus.FINANTAT, paid: 150
    },
    {
      name: 'Elena', age: 7, category: Category.JUCARII, 
      wish: 'Papusa si set de colorat', 
      target: 120, status: ScrisoareStatus.ACTIV, paid: 0
    },
    {
      name: 'Cristian', age: 16, category: Category.EDUCATIE, 
      wish: 'Curs optional de informatica', 
      target: 500, status: ScrisoareStatus.ACTIV, paid: 450
    },
    {
      name: 'Ana', age: 10, category: Category.ARTISTIC, 
      wish: 'Set pictura profesional', 
      target: 300, status: ScrisoareStatus.ACTIV, paid: 0
    }
  ]

  // Generate 30 variations
  for (let i = 0; i < 30; i++) {
    const template = lettersData[i % lettersData.length]
    const institution = i % 2 === 0 ? inst1 : inst2
    const publicCode = `SCR-${2024}-${1000 + i}`
    
    // Slight random variations
    const actualTarget = Math.min(500, template.target + (i * 10) % 50)
    const actualPaid = template.status === ScrisoareStatus.FINANTAT ? actualTarget : Math.min(template.paid, actualTarget)

    const letter = await prisma.scrisoare.upsert({
      where: { publicCode },
      update: {},
      create: {
        publicCode,
        childFirstName: template.name,
        childLastName: 'Confidential', // Internal
        childAge: template.age + (i % 3), // 9, 10, 11
        childGender: i % 2 === 0 ? 'M' : 'F',
        category: template.category,
        wishList: template.wish,
        childStory: 'Scrisoare transcrisa: Imi doresc mult sa pot merge la scoala pregatit...',
        originalImgUrl: 'https://placehold.co/600x800/png?text=Scrisoare+Originala',
        targetAmount: actualTarget,
        collectedAmount: actualPaid,
        status: template.status,
        institutionId: institution.id,
      }
    })

    // If paid amount > 0, create a fake donation to back it up
    if (actualPaid > 0) {
      await prisma.donation.create({
        data: {
          scrisoareId: letter.id,
          amount: actualPaid,
          donorEmail: 'test@example.com',
          stripePaymentIntentId: `pi_seed_${publicCode}`,
          status: 'SUCCEEDED'
        }
      })
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
