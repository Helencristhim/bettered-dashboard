import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

async function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  })
  return auth
}

async function getSheets() {
  const auth = await getAuthClient()
  return google.sheets({ version: 'v4', auth })
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const SHEET_NAME = 'Dados'

// Colunas da planilha
const COLUMNS = {
  MES: 0,
  ANO: 1,
  FONTE: 2,
  INVESTIMENTO: 3,
  LEADS: 4,
  VENDAS: 5,
  RECEITA: 6,
  CPL: 7,
  CAC: 8,
  LEADS_SOCIAL: 9,
  RECEITA_SOCIAL: 10,
  LEADS_INFLUENCER: 11,
  RECEITA_INFLUENCER: 12,
  LEADS_AULA_EXP: 13,
  RECEITA_AULA_EXP: 14,
  LEADS_EMAIL: 15,
  RECEITA_EMAIL: 16,
  LEADS_SITE: 17,
  RECEITA_SITE: 18,
}

export async function getData() {
  const sheets = await getSheets()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:S`,
  })

  const rows = response.data.values || []

  // Pula o header (primeira linha)
  if (rows.length <= 1) return []

  return rows.slice(1).map((row) => ({
    mes: row[COLUMNS.MES] || '',
    ano: row[COLUMNS.ANO] || '',
    fonte: row[COLUMNS.FONTE] || '',
    investimento: parseFloat(row[COLUMNS.INVESTIMENTO]) || 0,
    leads: parseInt(row[COLUMNS.LEADS]) || 0,
    vendas: parseInt(row[COLUMNS.VENDAS]) || 0,
    receita: parseFloat(row[COLUMNS.RECEITA]) || 0,
    cpl: parseFloat(row[COLUMNS.CPL]) || 0,
    cac: parseFloat(row[COLUMNS.CAC]) || 0,
    leadsSocial: parseInt(row[COLUMNS.LEADS_SOCIAL]) || 0,
    receitaSocial: parseFloat(row[COLUMNS.RECEITA_SOCIAL]) || 0,
    leadsInfluencer: parseInt(row[COLUMNS.LEADS_INFLUENCER]) || 0,
    receitaInfluencer: parseFloat(row[COLUMNS.RECEITA_INFLUENCER]) || 0,
    leadsAulaExp: parseInt(row[COLUMNS.LEADS_AULA_EXP]) || 0,
    receitaAulaExp: parseFloat(row[COLUMNS.RECEITA_AULA_EXP]) || 0,
    leadsEmail: parseInt(row[COLUMNS.LEADS_EMAIL]) || 0,
    receitaEmail: parseFloat(row[COLUMNS.RECEITA_EMAIL]) || 0,
    leadsSite: parseInt(row[COLUMNS.LEADS_SITE]) || 0,
    receitaSite: parseFloat(row[COLUMNS.RECEITA_SITE]) || 0,
  }))
}

export async function getDataByPeriod(mes, ano) {
  const data = await getData()
  return data.filter((row) => row.mes === mes && row.ano === ano)
}

export async function findRowIndex(mes, ano, fonte) {
  const sheets = await getSheets()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:C`,
  })

  const rows = response.data.values || []

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === mes && rows[i][1] === ano && rows[i][2] === fonte) {
      return i + 1 // +1 porque o Sheets é 1-indexed
    }
  }

  return null
}

export async function saveData(data) {
  const sheets = await getSheets()
  const { mes, ano, fonte } = data

  // Calcula CPL e CAC
  const cpl = data.leads > 0 ? data.investimento / data.leads : 0
  const cac = data.vendas > 0 ? data.investimento / data.vendas : 0

  const rowData = [
    mes,
    ano,
    fonte,
    data.investimento || 0,
    data.leads || 0,
    data.vendas || 0,
    data.receita || 0,
    cpl.toFixed(2),
    cac.toFixed(2),
    data.leadsSocial || 0,
    data.receitaSocial || 0,
    data.leadsInfluencer || 0,
    data.receitaInfluencer || 0,
    data.leadsAulaExp || 0,
    data.receitaAulaExp || 0,
    data.leadsEmail || 0,
    data.receitaEmail || 0,
    data.leadsSite || 0,
    data.receitaSite || 0,
  ]

  // Verifica se já existe registro para este mês/ano/fonte
  const existingRowIndex = await findRowIndex(mes, ano, fonte)

  if (existingRowIndex) {
    // Sobrescreve a linha existente
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A${existingRowIndex}:S${existingRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    })
    return { action: 'updated', row: existingRowIndex }
  } else {
    // Adiciona nova linha
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:S`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    })
    return { action: 'created' }
  }
}
