import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  const diagnostics = {
    env: {
      hasSheetId: !!process.env.GOOGLE_SHEET_ID,
      sheetId: process.env.GOOGLE_SHEET_ID ? process.env.GOOGLE_SHEET_ID.substring(0, 10) + '...' : null,
      hasServiceEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      serviceEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      privateKeyStart: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.substring(0, 30) : null,
    },
    auth: null,
    sheets: null,
    error: null,
  }

  try {
    // Testar autenticacao
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    diagnostics.env.privateKeyProcessed = privateKey ? privateKey.substring(0, 50) + '...' : null

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    diagnostics.auth = 'OK - Auth criado'

    const sheets = google.sheets({ version: 'v4', auth })
    diagnostics.sheets = 'OK - Sheets client criado'

    // Testar acesso a planilha
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    })

    diagnostics.spreadsheet = {
      title: response.data.properties.title,
      sheets: response.data.sheets.map(s => s.properties.title),
    }

    // Testar leitura
    const firstSheet = response.data.sheets[0].properties.title
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'${firstSheet}'!A1:S1`,
    })

    diagnostics.read = {
      success: true,
      firstRow: readResponse.data.values?.[0] || 'vazio',
    }

    // Testar escrita (adicionar linha de teste)
    const testRow = [
      'TESTE', '2024', 'Teste', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'${firstSheet}'!A:S`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [testRow],
      },
    })

    diagnostics.write = 'OK - Linha de teste adicionada (pode deletar da planilha)'

    return NextResponse.json({ success: true, diagnostics })
  } catch (error) {
    diagnostics.error = {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.errors || null,
    }
    return NextResponse.json({ success: false, diagnostics }, { status: 500 })
  }
}
