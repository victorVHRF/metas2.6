import { NextRequest, NextResponse } from 'next/server'
import { getMySQLPrisma } from '../../../../lib/prisma'

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
    const userId = searchParams.get('userId')
    const { id: clientId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      )
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar o cliente específico
    const client = await mysqlPrisma.client.findFirst({
      where: {
        id: clientId,
        userId: userId
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}