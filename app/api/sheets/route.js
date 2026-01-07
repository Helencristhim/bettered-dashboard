import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getData, getDataByPeriod, saveData } from '@/lib/sheets'

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')

  try {
    let data
    if (mes && ano) {
      data = await getDataByPeriod(mes, ano)
    } else {
      data = await getData()
    }
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados da planilha' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const result = await saveData(body)
    return NextResponse.json({
      success: true,
      message: result.action === 'updated'
        ? 'Dados atualizados com sucesso'
        : 'Dados salvos com sucesso',
      ...result
    })
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar dados na planilha' },
      { status: 500 }
    )
  }
}
