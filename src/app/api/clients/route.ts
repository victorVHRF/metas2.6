import { NextRequest, NextResponse } from 'next/server'
import { getMySQLPrisma } from '../../../lib/prisma'
import { z } from 'zod'

// Schema de validação para criação de cliente
const createClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  portfolioId: z.string().min(1, 'ID da carteira é obrigatório')
})

export async function GET(request: NextRequest) {
  try {
    const mysqlPrisma = await getMySQLPrisma()
    if (!mysqlPrisma) {
      return NextResponse.json(
        { error: 'Banco de dados não disponível' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const portfolioId = searchParams.get('portfolioId')

    if (!userId && !portfolioId) {
      return NextResponse.json(
        { error: 'ID do usuário ou ID da carteira é obrigatório' },
        { status: 400 }
      )
    }

    let clients
    
    if (portfolioId) {
      // Buscar clientes de uma carteira específica
      clients = await mysqlPrisma.client.findMany({
        where: {
          portfolioId: portfolioId
        },
        include: {
          portfolio: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Buscar todos os clientes de um usuário (através de suas carteiras)
      clients = await mysqlPrisma.client.findMany({
        where: {
          portfolio: {
            userId: userId
          }
        },
        include: {
          portfolio: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const mysqlPrisma = await getMySQLPrisma()
    if (!mysqlPrisma) {
      return NextResponse.json(
        { error: 'Banco de dados não disponível' },
        { status: 500 }
      )
    }

    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = createClientSchema.parse(body)

    // Verificar se a carteira existe
    const portfolio = await mysqlPrisma.portfolio.findUnique({
      where: { id: validatedData.portfolioId },
      include: {
        user: true
      }
    })

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Carteira não encontrada' },
        { status: 404 }
      )
    }

    // Criar o cliente
    const client = await mysqlPrisma.client.create({
      data: validatedData,
      include: {
        portfolio: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.format() },
        { status: 400 }
      )
    }

    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}