import { faker } from '@faker-js/faker'
import { PrismaClient as MySQLPrismaClient } from '../node_modules/.prisma/mysql-client'

async function seedUsers() {
  const mysqlPrisma = new MySQLPrismaClient()
  
  console.log('🔌 Conectando ao MySQL...')
  
  try {
    await mysqlPrisma.$connect()
    console.log('✅ Conectado ao MySQL com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error)
    process.exit(1)
  }

  console.log('🌱 Iniciando seed de usuários...')

  try {
    // Limpar usuários existentes (opcional)
    await mysqlPrisma.user.deleteMany({})
    console.log('🗑️  Usuários existentes removidos')

    // Criar 20 usuários fake
    const users = []
    for (let i = 0; i < 20; i++) {
      const user = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
      }
      users.push(user)
    }

    // Inserir usuários no banco
    const createdUsers = await mysqlPrisma.user.createMany({
      data: users,
      skipDuplicates: true
    })

    console.log(`✅ ${createdUsers.count} usuários criados com sucesso!`)

    // Mostrar alguns usuários criados
    const sampleUsers = await mysqlPrisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    console.log('\n📋 Exemplos de usuários criados:')
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
    })

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error)
    process.exit(1)
  } finally {
    await mysqlPrisma.$disconnect()
    console.log('\n🔌 Conexão com o banco encerrada')
  }
}

seedUsers()
  .then(() => {
    console.log('\n🎉 Seed concluído com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro durante o seed:', error)
    process.exit(1)
  })