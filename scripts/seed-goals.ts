import { PrismaClient as MySQLPrismaClient } from '../node_modules/.prisma/mysql-client'
import { faker } from '@faker-js/faker'

const mysqlPrisma = new MySQLPrismaClient()

async function main() {
  console.log('🌱 Seeding goals...')

  // Buscar todos os clientes existentes
  const clients = await mysqlPrisma.client.findMany()
  
  if (clients.length === 0) {
    console.log('❌ No clients found. Please seed clients first.')
    return
  }

  const currentYear = new Date().getFullYear()
  const goals = []

  // Para cada cliente, criar metas para os próximos 12 meses
  for (const client of clients) {
    for (let month = 1; month <= 12; month++) {
      const tvGoal = faker.number.float({ min: 5000, max: 50000, fractionDigits: 2 })
      const radioGoal = faker.number.float({ min: 3000, max: 30000, fractionDigits: 2 })
      const internetGoal = faker.number.float({ min: 2000, max: 25000, fractionDigits: 2 })
      const totalGoal = tvGoal + radioGoal + internetGoal

      goals.push({
        clientId: client.id,
        month,
        year: currentYear,
        tvGoal,
        radioGoal,
        internetGoal,
        totalGoal,
      })
    }
  }

  // Inserir todas as metas
  const createdGoals = await mysqlPrisma.goal.createMany({
    data: goals,
    skipDuplicates: true, // Evita erro se já existirem metas para o mesmo cliente/mês/ano
  })

  console.log(`✅ Created ${createdGoals.count} goals for ${clients.length} clients`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding goals:', e)
    process.exit(1)
  })
  .finally(async () => {
    await mysqlPrisma.$disconnect()
  })