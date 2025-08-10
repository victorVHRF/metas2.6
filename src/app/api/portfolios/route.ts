import { NextRequest, NextResponse } from 'next/server'
import { getMySQLPrisma } from '../../../lib/prisma'
import { z } from 'zod'

// Schema de validação para criação de carteira
const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  vehicle: z.enum(['TV', 'RADIO', 'INTERNET'] as const),
  userId: z.string().min(1, 'ID do usuário é obrigatório')
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
    const vehicle = searchParams.get('vehicle')

    // Se portfolioId for fornecido, buscar carteira específica
    if (portfolioId) {
      const portfolio = await mysqlPrisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              clients: true
            }
          }
        }
      })

      if (!portfolio) {
        return NextResponse.json(
          { error: 'Carteira não encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json([portfolio])
    }

    // Caso contrário, buscar por userId
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário ou ID da carteira é obrigatório' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      userId: userId
    }

    if (vehicle) {
      whereClause.vehicle = vehicle
    }

    const portfolios = await mysqlPrisma.portfolio.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            clients: true
          }
        }
      },
      orderBy: [
        { vehicle: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(portfolios)
  } catch (error) {
    console.error('Erro ao buscar carteiras:', error)
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
    const validatedData = createPortfolioSchema.parse(body)

    // Verificar se o usuário existe
    const user = await mysqlPrisma.user.findUnique({
      where: { id: validatedData.userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar a carteira
    const portfolio = await mysqlPrisma.portfolio.create({
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            clients: true
          }
        }
      }
    })

    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.format() },
        { status: 400 }
      )
    }

    console.error('Erro ao criar carteira:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}