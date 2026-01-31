import prisma from '../src/lib/prisma'

async function main() {
    const count = await prisma.scrisoare.count()
    console.log(`Total letters: ${count}`)

    const one = await prisma.scrisoare.findFirst({
        include: { institution: true }
    })
    console.log('First letter:', one ? one.childFirstName : 'None')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
