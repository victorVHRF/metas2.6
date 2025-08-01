import { PrismaClient } from '@prisma/client'
import mysql from 'mysql2/promise'
import { Client } from 'pg'

// Cliente Prisma principal (PostgreSQL)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  mysqlPrisma: any | undefined
  postgresPrisma: any | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Clientes Prisma específicos para cada banco
let mysqlPrisma: any = null
let postgresPrisma: any = null

// Função para obter cliente MySQL Prisma
export async function getMySQLPrisma() {
  if (!mysqlPrisma) {
    try {
      const { PrismaClient: MySQLPrismaClient } = await import('../../node_modules/.prisma/mysql-client')
      mysqlPrisma = globalForPrisma.mysqlPrisma ?? new MySQLPrismaClient()
      if (process.env.NODE_ENV !== 'production') globalForPrisma.mysqlPrisma = mysqlPrisma
    } catch (error) {
      console.warn('MySQL Prisma client not available. Run: npm run db:mysql:generate')
      return null
    }
  }
  return mysqlPrisma
}

// Função para obter cliente PostgreSQL Prisma
export async function getPostgresPrisma() {
  if (!postgresPrisma) {
    try {
      const { PrismaClient: PostgresPrismaClient } = await import('../../node_modules/.prisma/postgres-client')
      postgresPrisma = globalForPrisma.postgresPrisma ?? new PostgresPrismaClient()
      if (process.env.NODE_ENV !== 'production') globalForPrisma.postgresPrisma = postgresPrisma
    } catch (error) {
      console.warn('PostgreSQL Prisma client not available. Run: npm run db:postgres:generate')
      return null
    }
  }
  return postgresPrisma
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Cliente MySQL direto
export async function createMySQLConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'metas_user',
      password: 'metas_password',
      database: 'metas_mysql',
      connectTimeout: 5000
    })
    return connection
  } catch (error) {
    console.error('MySQL connection error:', error)
    throw error
  }
}

// Cliente PostgreSQL direto
export async function createPostgreSQLConnection() {
  try {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'metas_user',
      password: 'metas_password',
      database: 'metas_postgres',
      connectionTimeoutMillis: 5000,
      query_timeout: 5000
    })
    await client.connect()
    return client
  } catch (error) {
    console.error('PostgreSQL connection error:', error)
    throw error
  }
}

// Função para obter informações das tabelas
export async function getMySQLTables() {
  const connection = await createMySQLConnection()
  try {
    const [rows] = await connection.execute(
      "SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'metas_mysql'"
    )
    return rows
  } catch (error) {
    console.error('Error getting MySQL tables:', error)
    throw error
  } finally {
    await connection.end()
  }
}

export async function getPostgreSQLTables() {
  const client = await createPostgreSQLConnection()
  try {
    const result = await client.query(`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    return result.rows
  } catch (error) {
    console.error('Error getting PostgreSQL tables:', error)
    throw error
  } finally {
    await client.end()
  }
}