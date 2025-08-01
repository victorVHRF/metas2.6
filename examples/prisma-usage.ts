// Exemplo de uso dos clientes Prisma para MySQL e PostgreSQL

import { getMySQLPrisma, getPostgresPrisma, prisma } from '@/lib/prisma'

// Exemplo de uso do cliente MySQL
export async function createUser() {
  const mysqlPrisma = await getMySQLPrisma()
  
  if (!mysqlPrisma) {
    throw new Error('MySQL Prisma client not available')
  }

  const user = await mysqlPrisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@example.com'
    }
  })

  return user
}

// Exemplo de uso do cliente MySQL para produtos
export async function createProduct() {
  const mysqlPrisma = await getMySQLPrisma()
  
  if (!mysqlPrisma) {
    throw new Error('MySQL Prisma client not available')
  }

  const product = await mysqlPrisma.product.create({
    data: {
      name: 'Produto Exemplo',
      price: 99.99,
      description: 'Descrição do produto'
    }
  })

  return product
}

// Exemplo de uso do cliente PostgreSQL para pedidos
export async function createOrder() {
  const postgresPrisma = await getPostgresPrisma()
  
  if (!postgresPrisma) {
    throw new Error('PostgreSQL Prisma client not available')
  }

  const order = await postgresPrisma.order.create({
    data: {
      userId: 1,
      productId: 1,
      quantity: 2,
      total: 199.98
    }
  })

  return order
}

// Exemplo de uso do cliente PostgreSQL para analytics
export async function createAnalytics() {
  const postgresPrisma = await getPostgresPrisma()
  
  if (!postgresPrisma) {
    throw new Error('PostgreSQL Prisma client not available')
  }

  const analytics = await postgresPrisma.analytics.create({
    data: {
      event: 'page_view',
      userId: 1,
      metadata: { page: '/home' }
    }
  })

  return analytics
}

// Exemplo de consulta complexa usando ambos os bancos
export async function getUserWithOrders(userId: number) {
  const mysqlPrisma = await getMySQLPrisma()
  const postgresPrisma = await getPostgresPrisma()
  
  if (!mysqlPrisma || !postgresPrisma) {
    throw new Error('One or both Prisma clients not available')
  }

  // Buscar usuário no MySQL
  const user = await mysqlPrisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    return null
  }

  // Buscar pedidos no PostgreSQL
  const orders = await postgresPrisma.order.findMany({
    where: { userId: userId }
  })

  return {
    user,
    orders
  }
}

// Exemplo de transação usando raw SQL
export async function complexTransaction() {
  const mysqlPrisma = await getMySQLPrisma()
  const postgresPrisma = await getPostgresPrisma()
  
  if (!mysqlPrisma || !postgresPrisma) {
    throw new Error('One or both Prisma clients not available')
  }

  try {
    // Transação no MySQL
    const result1 = await mysqlPrisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: 'Usuário Transação',
          email: 'transacao@example.com'
        }
      })

      const product = await tx.product.create({
        data: {
          name: 'Produto Transação',
          price: 149.99
        }
      })

      return { user, product }
    })

    // Transação no PostgreSQL
    const result2 = await postgresPrisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: result1.user.id,
          productId: result1.product.id,
          quantity: 1,
          total: result1.product.price
        }
      })

      const analytics = await tx.analytics.create({
        data: {
          event: 'order_created',
          userId: result1.user.id,
          metadata: { orderId: order.id }
        }
      })

      return { order, analytics }
    })

    return {
      mysql: result1,
      postgres: result2
    }
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}