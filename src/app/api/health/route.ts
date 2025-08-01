import { NextResponse } from 'next/server'
import { createMySQLConnection, createPostgreSQLConnection, getMySQLTables, getPostgreSQLTables, getMySQLPrisma, getPostgresPrisma } from '@/lib/prisma'

interface DatabaseStatus {
  name: string
  status: 'healthy' | 'unhealthy'
  tables: any[]
  error?: string
}

interface HealthResponse {
  api: 'healthy' | 'unhealthy'
  databases: DatabaseStatus[]
  timestamp: string
}

export async function GET() {
  const healthData: HealthResponse = {
    api: 'healthy',
    databases: [],
    timestamp: new Date().toISOString()
  }

  // Teste MySQL
  try {
    const mysqlConnection = await createMySQLConnection()
    try {
      // Testa a conexão e busca tabelas na mesma conexão
      await mysqlConnection.execute('SELECT 1')
      const [rows] = await mysqlConnection.execute(
        "SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'metas_mysql'"
      )

      // Test Prisma client
      const mysqlPrisma = await getMySQLPrisma()
      let prismaStatus = 'not available'
      if (mysqlPrisma) {
        await mysqlPrisma.$queryRaw`SELECT 1`
        prismaStatus = 'connected'
      }

      healthData.databases.push({
        name: 'MySQL',
        status: 'healthy',
        tables: Array.isArray(rows) ? rows : [rows],
        prismaClient: prismaStatus
      })
    } finally {
      await mysqlConnection.end()
    }
  } catch (error) {
    healthData.databases.push({
      name: 'MySQL',
      status: 'unhealthy',
      tables: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      prismaClient: 'error'
    })
  }

  // Teste PostgreSQL
  try {
    const pgClient = await createPostgreSQLConnection()
    try {
      // Testa a conexão e busca tabelas na mesma conexão
      await pgClient.query('SELECT 1')
      const result = await pgClient.query(`
        SELECT 
          table_name,
          table_schema
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `)

      // Test Prisma client
      const postgresPrisma = await getPostgresPrisma()
      let prismaStatus = 'not available'
      if (postgresPrisma) {
        await postgresPrisma.$queryRaw`SELECT 1`
        prismaStatus = 'connected'
      }

      healthData.databases.push({
        name: 'PostgreSQL',
        status: 'healthy',
        tables: result.rows,
        prismaClient: prismaStatus
      })
    } finally {
      await pgClient.end()
    }
  } catch (error) {
    healthData.databases.push({
      name: 'PostgreSQL',
      status: 'unhealthy',
      tables: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      prismaClient: 'error'
    })
  }

  // Determina o status geral
  const hasUnhealthyDb = healthData.databases.some(db => db.status === 'unhealthy')
  const statusCode = hasUnhealthyDb ? 503 : 200

  return NextResponse.json(healthData, { status: statusCode })
}