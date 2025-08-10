import { PrismaClient as MySQLPrismaClient } from '../node_modules/.prisma/mysql-client'
import { faker } from '@faker-js/faker'

const mysqlPrisma = new MySQLPrismaClient()

async function main() {
  console.log('🌱 Seeding goals...')

  // Limpar metas existentes
  await mysqlPrisma.goal.deleteMany({})
  console.log('🗑️ Cleared existing goals')

  // Buscar todos os portfólios com seus clientes
  const portfolios = await mysqlPrisma.portfolio.findMany({
    include: {
      clients: true,
      user: true
    }
  })
  
  if (portfolios.length === 0) {
    console.log('❌ No portfolios found. Please seed portfolios and clients first.')
    return
  }

  const currentYear = new Date().getFullYear()
  const goals = []
  let totalClients = 0

  // Para cada portfólio, criar metas para seus clientes
  for (const portfolio of portfolios) {
    if (portfolio.clients.length === 0) continue

    totalClients += portfolio.clients.length

    // Definir valores base baseados no tipo de veículo
    const getGoalRanges = (vehicle: string) => {
      switch (vehicle) {
        case 'TV':
          return {
            tv: { min: 15000, max: 80000 },
            radio: { min: 8000, max: 40000 },
            internet: { min: 5000, max: 30000 }
          }
        case 'RADIO':
          return {
            tv: { min: 5000, max: 25000 },
            radio: { min: 12000, max: 60000 },
            internet: { min: 4000, max: 25000 }
          }
        case 'INTERNET':
          return {
            tv: { min: 3000, max: 20000 },
            radio: { min: 5000, max: 30000 },
            internet: { min: 10000, max: 50000 }
          }
        default:
          return {
            tv: { min: 5000, max: 50000 },
            radio: { min: 3000, max: 30000 },
            internet: { min: 2000, max: 25000 }
          }
      }
    }

    const ranges = getGoalRanges(portfolio.vehicle)

    // Para cada cliente do portfólio, criar metas para 12 meses (6 passados + 6 futuros)
    for (const client of portfolio.clients) {
      for (let monthOffset = -6; monthOffset <= 5; monthOffset++) {
        const date = new Date()
        date.setMonth(date.getMonth() + monthOffset)
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        const tvGoal = faker.number.float({ min: ranges.tv.min, max: ranges.tv.max, fractionDigits: 2 })
        const radioGoal = faker.number.float({ min: ranges.radio.min, max: ranges.radio.max, fractionDigits: 2 })
        const internetGoal = faker.number.float({ min: ranges.internet.min, max: ranges.internet.max, fractionDigits: 2 })
        const totalGoal = tvGoal + radioGoal + internetGoal

        goals.push({
          portfolioId: portfolio.id,
          clientId: client.id,
          month,
          year,
          amount: totalGoal,
        })
      }
    }
  }

  // Inserir todas as metas
  const createdGoals = await mysqlPrisma.goal.createMany({
    data: goals,
    skipDuplicates: true
  })

  console.log(`✅ Created ${createdGoals.count} goals for ${totalClients} clients across ${portfolios.length} portfolios`)
  
  // Estatísticas por veículo
  const vehicleStats = portfolios.reduce((acc, portfolio) => {
    if (!acc[portfolio.vehicle]) {
      acc[portfolio.vehicle] = { portfolios: 0, clients: 0 }
    }
    acc[portfolio.vehicle].portfolios++
    acc[portfolio.vehicle].clients += portfolio.clients.length
    return acc
  }, {} as Record<string, { portfolios: number, clients: number }>)

  console.log('📊 Goals distribution by vehicle:')
  Object.entries(vehicleStats).forEach(([vehicle, stats]) => {
    const goalsPerVehicle = stats.clients * 12 // 12 meses por cliente
    console.log(`   ${vehicle}: ${stats.portfolios} portfolios, ${stats.clients} clients, ${goalsPerVehicle} goals`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding goals:', e)
    process.exit(1)
  })
  .finally(async () => {
    await mysqlPrisma.$disconnect()
  })