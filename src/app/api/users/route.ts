import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient as MySQLPrismaClient } from '../../../../node_modules/.prisma/mysql-client'
import { z } from 'zod'

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
})

const mysqlPrisma = new MySQLPrismaClient()

export async function GET() {
  try {

    const users = await mysqlPrisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação usando Zod
    const validatedData = createUserSchema.parse(body)

    const user = await mysqlPrisma.user.create({
      data: validatedData
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}