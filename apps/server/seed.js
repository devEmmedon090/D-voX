require('dotenv').config();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.voter.createMany({
    data: [
      { nin: "12345678901", fingerprint: "hash1", eligible: true },
      { nin: "98765432109", fingerprint: "hash2", eligible: true },
      { nin: "11111111111", fingerprint: "hash3", eligible: false },
    ]
  })
  console.log("3 test voters seeded!")
}

main()
