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

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const clients = await mysqlPrisma.client.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

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

    // Criar o cliente
    const client = await mysqlPrisma.client.create({
      data: validatedData
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