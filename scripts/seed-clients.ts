import { PrismaClient as MySQLPrismaClient } from '../node_modules/.prisma/mysql-client'
import { faker } from '@faker-js/faker'

const mysqlPrisma = new MySQLPrismaClient()

async function seedClients() {
  try {
    console.log('🔌 Conectando ao MySQL...')
    await mysqlPrisma.$connect()
    console.log('✅ Conectado ao MySQL com sucesso!')

    console.log('🌱 Iniciando seed de clientes...')

    // Buscar todos os usuários existentes
    const users = await mysqlPrisma.user.findMany()
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado. Execute primeiro o seed de usuários.')
      return
    }

    // Limpar clientes existentes
    await mysqlPrisma.client.deleteMany()
    console.log('🗑️  Clientes existentes removidos')

    // Criar clientes para cada usuário (5-15 clientes por usuário)
    const clientsToCreate = []
    
    for (const user of users) {
      const clientCount = faker.number.int({ min: 5, max: 15 })
      
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
          userId: user.id
        })
      }
    }

    // Inserir todos os clientes
    await mysqlPrisma.client.createMany({
      data: clientsToCreate
    })

    console.log(`✅ ${clientsToCreate.length} clientes criados com sucesso!`)

    // Mostrar estatísticas por usuário
    console.log('\n📊 Estatísticas por usuário:')
    for (const user of users) {
      const clientCount = await mysqlPrisma.client.count({
        where: { userId: user.id }
      })
      console.log(`👤 ${user.name} (${user.email}): ${clientCount} clientes`)
    }

    // Mostrar alguns exemplos de clientes
    const sampleClients = await mysqlPrisma.client.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log('\n📋 Exemplos de clientes criados:')
    sampleClients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} (${client.email}) - ${client.company}`)
      console.log(`   👤 Usuário: ${client.user.name} (${client.user.email})`)
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