import { faker } from '@faker-js/faker'
import { PrismaClient as MySQLPrismaClient } from '../node_modules/.prisma/mysql-client'

async function seedPortfolios() {
  const mysqlPrisma = new MySQLPrismaClient()
  
  console.log('🔌 Conectando ao MySQL...')
  
  try {
    await mysqlPrisma.$connect()
    console.log('✅ Conectado ao MySQL com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error)
    process.exit(1)
  }

  console.log('🌱 Iniciando seed de carteiras...')

  try {
    // Buscar todos os usuários
    const users = await mysqlPrisma.user.findMany()
    
    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado. Execute o seed de usuários primeiro.')
      return
    }

    console.log(`👥 Encontrados ${users.length} usuários`)

    // Limpar carteiras existentes
    await mysqlPrisma.portfolio.deleteMany({})
    console.log('🗑️  Carteiras existentes removidas')

    const vehicles = ['TV', 'RADIO', 'INTERNET']
    const portfolios = []

    // Criar 3 carteiras para cada veículo para cada usuário
    for (const user of users) {
      for (const vehicle of vehicles) {
        for (let i = 1; i <= 3; i++) {
          const portfolio = {
            name: `${vehicle} Carteira ${i}`,
            vehicle: vehicle,
            userId: user.id,
          }
          portfolios.push(portfolio)
        }
      }
    }

    // Inserir todas as carteiras
    const createdPortfolios = await mysqlPrisma.portfolio.createMany({
      data: portfolios,
    })

    console.log(`✅ ${createdPortfolios.count} carteiras criadas com sucesso!`)
    console.log(`📊 Distribuição:`)
    console.log(`   - ${users.length} usuários`)
    console.log(`   - 3 veículos (TV, RADIO, INTERNET)`)
    console.log(`   - 3 carteiras por veículo`)
    console.log(`   - Total: ${users.length * 3 * 3} carteiras`)

  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
  } finally {
    await mysqlPrisma.$disconnect()
    console.log('🔌 Desconectado do MySQL')
  }
}

seedPortfolios()
  .then(() => {
    console.log('🎉 Seed de carteiras concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })