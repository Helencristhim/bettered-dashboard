# Better Edtech - Dashboard de Marketing

Dashboard para gerenciamento de dados de marketing da Better Edtech.

## Funcionalidades

- **Autenticacao por Email**: Login seguro via magic link
- **Dashboard INPUT**: Formulario para inserir dados de Google Ads, Meta Ads e canais adicionais
- **Dashboard VISUALIZACAO**: Cards de KPIs com metricas calculadas (CPL, CAC)
- **Google Sheets como DB**: Integracao direta com planilha existente

## Stack

- Next.js 14 (App Router)
- NextAuth.js (autenticacao por email)
- Google Sheets API
- Vercel (deploy)

---

## Configuracao do Ambiente

### 1. Criar Service Account no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a **Google Sheets API**:
   - Menu > APIs e Servicos > Biblioteca
   - Busque "Google Sheets API" e ative
4. Crie uma Service Account:
   - Menu > APIs e Servicos > Credenciais
   - Criar credenciais > Conta de servico
   - Preencha nome e clique em Criar
5. Gere a chave JSON:
   - Clique na service account criada
   - Aba "Chaves" > Adicionar chave > Criar nova chave > JSON
   - Baixe o arquivo JSON

### 2. Compartilhar Planilha com Service Account

1. Abra a planilha: https://docs.google.com/spreadsheets/d/1ybghGlCJnaXhR56I4eYSL3tSSwMCkeihXG4TA5OTMn4
2. Clique em "Compartilhar"
3. Adicione o email da service account (ex: `nome@projeto.iam.gserviceaccount.com`)
4. Conceda permissao de **Editor**

### 3. Configurar Header da Planilha

Certifique-se de que a primeira aba se chama **"Dados"** e tenha estas colunas na linha 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mes | Ano | Fonte | Investimento | Leads | Vendas | Receita | CPL | CAC | Leads Social | Receita Social | Leads Influencer | Receita Influencer | Leads Aula Experimental | Receita Aula Experimental | Leads Email | Receita Email | Leads Site | Receita Site |

### 4. Configurar Email SMTP (Gmail)

Para envio de magic links, configure uma senha de app do Gmail:

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Seguranca > Verificacao em duas etapas (ative se nao estiver)
3. Senhas de app > Gerar nova senha
4. Selecione "Email" e "Outro (nome personalizado)"
5. Copie a senha gerada (16 caracteres)

---

## Variaveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-uma-chave-secreta-aqui

# Email SMTP (Gmail)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=seu-email@gmail.com
EMAIL_SERVER_PASSWORD=sua-senha-de-app-16-caracteres
EMAIL_FROM=Better Edtech <seu-email@gmail.com>

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=sua-service-account@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nCOLE_SUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1ybghGlCJnaXhR56I4eYSL3tSSwMCkeihXG4TA5OTMn4
```

**Importante**: A `GOOGLE_PRIVATE_KEY` deve estar entre aspas duplas e com `\n` no lugar das quebras de linha.

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## Desenvolvimento Local

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## Deploy na Vercel

### Opcao 1: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Opcao 2: Via GitHub

1. Suba o codigo para um repositorio GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositorio
4. Configure as variaveis de ambiente (igual ao `.env.local`)
5. Deploy

### Variaveis de Ambiente na Vercel

No painel da Vercel, va em:
**Settings > Environment Variables**

Adicione TODAS as variaveis:

| Nome | Valor |
|------|-------|
| `NEXTAUTH_URL` | `https://seu-dominio.vercel.app` |
| `NEXTAUTH_SECRET` | `sua-chave-secreta` |
| `EMAIL_SERVER_HOST` | `smtp.gmail.com` |
| `EMAIL_SERVER_PORT` | `587` |
| `EMAIL_SERVER_USER` | `seu-email@gmail.com` |
| `EMAIL_SERVER_PASSWORD` | `senha-app-16-chars` |
| `EMAIL_FROM` | `Better Edtech <seu-email@gmail.com>` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `email-service-account` |
| `GOOGLE_PRIVATE_KEY` | `chave-privada-completa` |
| `GOOGLE_SHEET_ID` | `1ybghGlCJnaXhR56I4eYSL3tSSwMCkeihXG4TA5OTMn4` |

**Dica**: Para `GOOGLE_PRIVATE_KEY`, copie do JSON baixado e cole diretamente (a Vercel lida com as quebras de linha).

---

## Estrutura do Projeto

```
bettered-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js  # Rotas NextAuth
│   │   └── sheets/route.js              # API Google Sheets
│   ├── dashboard/
│   │   ├── input/page.js                # Dashboard INPUT
│   │   ├── view/page.js                 # Dashboard VISUALIZACAO
│   │   ├── layout.js                    # Layout protegido
│   │   └── dashboard.module.css
│   ├── login/
│   │   ├── page.js                      # Pagina de login
│   │   └── login.module.css
│   ├── globals.css                      # Estilos globais
│   ├── layout.js                        # Layout raiz
│   └── page.js                          # Redirect inicial
├── components/
│   ├── AuthProvider.js                  # Provider SessionProvider
│   ├── Header.js                        # Header do dashboard
│   └── Sidebar.js                       # Navegacao lateral
├── lib/
│   ├── auth.js                          # Configuracao NextAuth
│   └── sheets.js                        # Funcoes Google Sheets
├── middleware.js                        # Protecao de rotas
├── .env.local.example                   # Exemplo de variaveis
└── package.json
```

---

## Logica de Negocio

- **CPL** = Investimento / Leads
- **CAC** = Investimento / Vendas
- Dois registros por mes (Google e Meta)
- Canais adicionais: apenas leads e receita
- Sobrescrita automatica se mes/ano/fonte ja existir

---

## Suporte

Em caso de duvidas sobre a implementacao, consulte este README ou entre em contato com a equipe de desenvolvimento.
