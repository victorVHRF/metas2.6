import { NextRequest, NextResponse } from 'next/server'
import { getMySQLPrisma } from '../../../lib/prisma'
import { z } from 'zod'

// Schema para validação dos dados de criação
const createGoalSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  amount: z.number().min(0),
  portfolioId: z.string().min(1, 'ID da carteira é obrigatório'),
  clientId: z.string().optional()
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
    const portfolioId = searchParams.get('portfolioId')
    const clientId = searchParams.get('clientId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!portfolioId && !clientId) {
      return NextResponse.json(
        { error: 'ID da carteira ou ID do cliente é obrigatório' },
        { status: 400 }
      )
    }

    const whereClause: any = {}
    
    if (portfolioId) {
      whereClause.portfolioId = portfolioId
    }
    
    if (clientId) {
      whereClause.clientId = clientId
    }
    
    if (year) {
      whereClause.year = parseInt(year)
    }
    
    if (month) {
      whereClause.month = parseInt(month)
    }

    const goals = await mysqlPrisma.goal.findMany({
      where: whereClause,
      include: {
        portfolio: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Erro ao buscar metas:', error)
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
    const validatedData = createGoalSchema.parse(body)

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

    // Se clientId foi fornecido, verificar se o cliente existe e pertence à carteira
    if (validatedData.clientId) {
      const client = await mysqlPrisma.client.findFirst({
        where: {
          id: validatedData.clientId,
          portfolioId: validatedData.portfolioId
        }
      })

      if (!client) {
        return NextResponse.json(
          { error: 'Cliente não encontrado ou não pertence a esta carteira' },
          { status: 404 }
        )
      }
    }

    // Verificar se já existe uma meta para este período
    const existingGoal = await mysqlPrisma.goal.findFirst({
      where: {
        portfolioId: validatedData.portfolioId,
        clientId: validatedData.clientId || null,
        month: validatedData.month,
        year: validatedData.year
      }
    })

    if (existingGoal) {
      return NextResponse.json(
        { error: 'Já existe uma meta para este período' },
        { status: 409 }
      )
    }

    // Criar a meta
    const goal = await mysqlPrisma.goal.create({
      data: validatedData,
      include: {
        portfolio: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.format() },
        { status: 400 }
      )
    }

    console.error('Erro ao criar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}