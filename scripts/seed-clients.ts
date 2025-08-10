import { PrismaClient as MySQLPrismaClient } from '../node_modules/.prisma/mysql-client'
import { faker } from '@faker-js/faker'

const mysqlPrisma = new MySQLPrismaClient()

async function seedClients() {
  try {
    console.log('🔌 Conectando ao MySQL...')
    await mysqlPrisma.$connect()
    console.log('✅ Conectado ao MySQL com sucesso!')

    console.log('🌱 Iniciando seed de clientes...')

    // Buscar todas as carteiras existentes
    const portfolios = await mysqlPrisma.portfolio.findMany({
      include: {
        user: true
      }
    })
    
    if (portfolios.length === 0) {
      console.log('❌ Nenhuma carteira encontrada. Execute primeiro o seed de carteiras.')
      return
    }

    // Limpar clientes existentes
    await mysqlPrisma.client.deleteMany()
    console.log('🗑️  Clientes existentes removidos')

    // Criar clientes para cada carteira (3-8 clientes por carteira)
    const clientsToCreate: {
      name: string;
      email: string;
      phone: string;
      company: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      portfolioId: number;
    }[] = [];
    
    for (const portfolio of portfolios) {
      const clientCount = faker.number.int({ min: 3, max: 8 })
      
      for (let i = 0; i < clientCount; i++) {
        clientsToCreate.push({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          company: faker.company.name(),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          portfolioId: Number(portfolio.id)
        })
      }
    }

    // Inserir todos os clientes
    await mysqlPrisma.client.createMany({
      data: clientsToCreate.map(client => ({
        ...client,
        portfolioId: String(client.portfolioId)
      }))
    })

    console.log(`✅ ${clientsToCreate.length} clientes criados com sucesso!`)
    console.log(`📊 Distribuição por carteira:`)
    
    const portfolioGroups = portfolios.reduce((acc, portfolio) => {
      const userKey = portfolio.user.name || portfolio.user.email
      if (!acc[userKey]) acc[userKey] = {}
      if (!acc[userKey][portfolio.vehicle]) acc[userKey][portfolio.vehicle] = 0
      
      const portfolioClients = clientsToCreate.filter(client => client.portfolioId === Number(portfolio.id))
      acc[userKey][portfolio.vehicle] += portfolioClients.length
      
      return acc
    }, {} as Record<string, Record<string, number>>)
    
    Object.entries(portfolioGroups).forEach(([userName, vehicles]) => {
      console.log(`   - ${userName}:`)
      Object.entries(vehicles).forEach(([vehicle, count]) => {
        console.log(`     * ${vehicle}: ${count} clientes`)
      })
    })

    // Mostrar alguns exemplos de clientes
    const sampleClients = await mysqlPrisma.client.findMany({
      take: 5,
      include: {
        portfolio: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    console.log('\n📋 Exemplos de clientes criados:')
    sampleClients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} (${client.email}) - ${client.company}`)
      console.log(`   📁 Carteira: ${client.portfolio.vehicle} - Usuário: ${client.portfolio.user.name} (${client.portfolio.user.email})`)
    })

  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
  } finally {
    await mysqlPrisma.$disconnect()
    console.log('🔌 Conexão com o banco encerrada')
  }
}

seedClients()
  .then(() => {
    console.log('🎉 Seed de clientes concluído com sucesso!')
  })
  .catch((error) => {
    console.error('💥 Falha no seed de clientes:', error)
    process.exit(1)
  })