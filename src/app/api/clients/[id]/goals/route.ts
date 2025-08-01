import { NextRequest, NextResponse } from 'next/server'
import { getMySQLPrisma } from '../../../../../lib/prisma'
import { z } from 'zod'

// Schema para validação dos dados de atualização
const updateGoalsSchema = z.object({
  goals: z.array(z.object({
    id: z.string(),
    tvGoal: z.number().min(0),
    radioGoal: z.number().min(0),
    internetGoal: z.number().min(0),
    totalGoal: z.number().min(0)
  }))
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mysqlPrisma = await getMySQLPrisma()
    if (!mysqlPrisma) {
      return NextResponse.json(
        { error: 'Banco de dados não disponível' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const { id: clientId } = await params

    if (!clientId) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400 }
      )
    }

    // Se não especificar o ano, usar o ano atual
    const targetYear = year ? parseInt(year) : new Date().getFullYear()

    // Buscar as metas do cliente para o ano especificado
    const goals = await mysqlPrisma.goal.findMany({
      where: {
        clientId: clientId,
        year: targetYear
      },
      orderBy: {
        month: 'asc'
      }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mysqlPrisma = await getMySQLPrisma()
    if (!mysqlPrisma) {
      return NextResponse.json(
        { error: 'Banco de dados não disponível' },
        { status: 500 }
      )
    }

    const { id: clientId } = await params
    const body = await request.json()

    if (!clientId) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400 }
      )
    }

    // Validar os dados recebidos
    const validatedData = updateGoalsSchema.parse(body)

    // Atualizar cada meta
    const updatePromises = validatedData.goals.map(goal => 
      mysqlPrisma.goal.update({
        where: { id: goal.id },
        data: {
          tvGoal: goal.tvGoal,
          radioGoal: goal.radioGoal,
          internetGoal: goal.internetGoal,
          totalGoal: goal.totalGoal,
          updatedAt: new Date()
        }
      })
    )

    await Promise.all(updatePromises)

    // Retornar as metas atualizadas
    const updatedGoals = await mysqlPrisma.goal.findMany({
      where: {
        clientId: clientId
      },
      orderBy: {
        month: 'asc'
      }
    })

    return NextResponse.json(updatedGoals)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar metas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}