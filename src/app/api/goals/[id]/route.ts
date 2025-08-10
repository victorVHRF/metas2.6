import { NextRequest, NextResponse } from 'next/server'
import { getMySQLPrisma } from '../../../../lib/prisma'
import { z } from 'zod'

// Schema para validação dos dados de atualização
const updateGoalSchema = z.object({
  amount: z.number().min(0)
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

    const { id: goalId } = await params

    if (!goalId) {
      return NextResponse.json(
        { error: 'ID da meta é obrigatório' },
        { status: 400 }
      )
    }

    const goal = await mysqlPrisma.goal.findUnique({
      where: { id: goalId },
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

    if (!goal) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Erro ao buscar meta:', error)
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

    const { id: goalId } = await params
    const body = await request.json()

    if (!goalId) {
      return NextResponse.json(
        { error: 'ID da meta é obrigatório' },
        { status: 400 }
      )
    }

    // Validar os dados recebidos
    const validatedData = updateGoalSchema.parse(body)

    // Verificar se a meta existe
    const existingGoal = await mysqlPrisma.goal.findUnique({
      where: { id: goalId }
    })

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar a meta
    const updatedGoal = await mysqlPrisma.goal.update({
      where: { id: goalId },
      data: {
        amount: validatedData.amount,
        updatedAt: new Date()
      },
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

    return NextResponse.json(updatedGoal)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.format() },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const { id: goalId } = await params

    if (!goalId) {
      return NextResponse.json(
        { error: 'ID da meta é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a meta existe
    const existingGoal = await mysqlPrisma.goal.findUnique({
      where: { id: goalId }
    })

    if (!existingGoal) {
      return NextResponse.json(
        { error: 'Meta não encontrada' },
        { status: 404 }
      )
    }

    // Deletar a meta
    await mysqlPrisma.goal.delete({
      where: { id: goalId }
    })

    return NextResponse.json(
      { message: 'Meta deletada com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao deletar meta:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}