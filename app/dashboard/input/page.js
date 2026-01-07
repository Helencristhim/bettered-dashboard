'use client'

import { useState } from 'react'
import styles from './input.module.css'

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const ANOS = ['2024', '2025', '2026']

// Formata valor para exibicao (10000.50 -> "10.000,50")
function formatCurrency(value) {
  if (!value && value !== 0) return ''
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value
  if (isNaN(num)) return ''
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Converte string formatada para numero (10.000,50 -> 10000.50)
function parseCurrency(value) {
  if (!value) return 0
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

// Mascara de moeda enquanto digita
function handleCurrencyInput(value) {
  // Remove tudo que nao e numero
  let numbers = value.replace(/\D/g, '')
  if (!numbers) return ''

  // Converte para centavos
  let cents = parseInt(numbers, 10)
  let reais = (cents / 100).toFixed(2)

  // Formata com pontos e virgula
  return parseFloat(reais).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const initialAdsData = {
  investimento: '',
  leads: '',
  vendas: '',
  receita: '',
}

const initialChannelsData = {
  leadsSocial: '',
  receitaSocial: '',
  leadsInfluencer: '',
  receitaInfluencer: '',
  leadsAulaExp: '',
  receitaAulaExp: '',
  leadsEmail: '',
  receitaEmail: '',
  leadsSite: '',
  receitaSite: '',
}

export default function InputPage() {
  const [mes, setMes] = useState('')
  const [ano, setAno] = useState('')
  const [googleAds, setGoogleAds] = useState(initialAdsData)
  const [metaAds, setMetaAds] = useState(initialAdsData)
  const [channels, setChannels] = useState(initialChannelsData)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleGoogleChange = (field, value, isCurrency = false) => {
    const newValue = isCurrency ? handleCurrencyInput(value) : value
    setGoogleAds(prev => ({ ...prev, [field]: newValue }))
  }

  const handleMetaChange = (field, value, isCurrency = false) => {
    const newValue = isCurrency ? handleCurrencyInput(value) : value
    setMetaAds(prev => ({ ...prev, [field]: newValue }))
  }

  const handleChannelChange = (field, value, isCurrency = false) => {
    const newValue = isCurrency ? handleCurrencyInput(value) : value
    setChannels(prev => ({ ...prev, [field]: newValue }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!mes || !ano) {
      setMessage({ type: 'error', text: 'Selecione o mes e o ano.' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Salvar dados do Google Ads
      const googleResponse = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes,
          ano,
          fonte: 'Google',
          investimento: parseCurrency(googleAds.investimento),
          leads: parseInt(googleAds.leads) || 0,
          vendas: parseInt(googleAds.vendas) || 0,
          receita: parseCurrency(googleAds.receita),
          leadsSocial: parseInt(channels.leadsSocial) || 0,
          receitaSocial: parseCurrency(channels.receitaSocial),
          leadsInfluencer: parseInt(channels.leadsInfluencer) || 0,
          receitaInfluencer: parseCurrency(channels.receitaInfluencer),
          leadsAulaExp: parseInt(channels.leadsAulaExp) || 0,
          receitaAulaExp: parseCurrency(channels.receitaAulaExp),
          leadsEmail: parseInt(channels.leadsEmail) || 0,
          receitaEmail: parseCurrency(channels.receitaEmail),
          leadsSite: parseInt(channels.leadsSite) || 0,
          receitaSite: parseCurrency(channels.receitaSite),
        }),
      })

      if (!googleResponse.ok) {
        const errorData = await googleResponse.json()
        throw new Error(errorData.error || 'Erro ao salvar Google Ads')
      }

      // Salvar dados do Meta Ads
      const metaResponse = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes,
          ano,
          fonte: 'Meta',
          investimento: parseCurrency(metaAds.investimento),
          leads: parseInt(metaAds.leads) || 0,
          vendas: parseInt(metaAds.vendas) || 0,
          receita: parseCurrency(metaAds.receita),
          leadsSocial: parseInt(channels.leadsSocial) || 0,
          receitaSocial: parseCurrency(channels.receitaSocial),
          leadsInfluencer: parseInt(channels.leadsInfluencer) || 0,
          receitaInfluencer: parseCurrency(channels.receitaInfluencer),
          leadsAulaExp: parseInt(channels.leadsAulaExp) || 0,
          receitaAulaExp: parseCurrency(channels.receitaAulaExp),
          leadsEmail: parseInt(channels.leadsEmail) || 0,
          receitaEmail: parseCurrency(channels.receitaEmail),
          leadsSite: parseInt(channels.leadsSite) || 0,
          receitaSite: parseCurrency(channels.receitaSite),
        }),
      })

      if (!metaResponse.ok) {
        const errorData = await metaResponse.json()
        throw new Error(errorData.error || 'Erro ao salvar Meta Ads')
      }

      setMessage({ type: 'success', text: 'Dados salvos com sucesso!' })

      // Limpar formularios
      setGoogleAds(initialAdsData)
      setMetaAds(initialAdsData)
      setChannels(initialChannelsData)
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar dados. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inserir Dados</h1>
        <p className={styles.subtitle}>Adicione os dados de marketing do periodo selecionado</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Seletor de Periodo */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Periodo</h2>
          <div className={styles.periodSelectors}>
            <div className={styles.selectGroup}>
              <label className={styles.label}>Mes</label>
              <select
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Selecione</option>
                {MESES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className={styles.selectGroup}>
              <label className={styles.label}>Ano</label>
              <select
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Selecione</option>
                {ANOS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Google Ads */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>G</span>
            Google Ads
          </h2>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Investimento (R$)</label>
              <input
                type="text"
                value={googleAds.investimento}
                onChange={(e) => handleGoogleChange('investimento', e.target.value, true)}
                className={styles.input}
                placeholder="0,00"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Leads</label>
              <input
                type="number"
                min="0"
                value={googleAds.leads}
                onChange={(e) => handleGoogleChange('leads', e.target.value)}
                className={styles.input}
                placeholder="0"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Vendas</label>
              <input
                type="number"
                min="0"
                value={googleAds.vendas}
                onChange={(e) => handleGoogleChange('vendas', e.target.value)}
                className={styles.input}
                placeholder="0"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Receita (R$)</label>
              <input
                type="text"
                value={googleAds.receita}
                onChange={(e) => handleGoogleChange('receita', e.target.value, true)}
                className={styles.input}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        {/* Meta Ads */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIconMeta}>M</span>
            Meta Ads
          </h2>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Investimento (R$)</label>
              <input
                type="text"
                value={metaAds.investimento}
                onChange={(e) => handleMetaChange('investimento', e.target.value, true)}
                className={styles.input}
                placeholder="0,00"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Leads</label>
              <input
                type="number"
                min="0"
                value={metaAds.leads}
                onChange={(e) => handleMetaChange('leads', e.target.value)}
                className={styles.input}
                placeholder="0"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Vendas</label>
              <input
                type="number"
                min="0"
                value={metaAds.vendas}
                onChange={(e) => handleMetaChange('vendas', e.target.value)}
                className={styles.input}
                placeholder="0"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Receita (R$)</label>
              <input
                type="text"
                value={metaAds.receita}
                onChange={(e) => handleMetaChange('receita', e.target.value, true)}
                className={styles.input}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        {/* Canais Adicionais */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Canais Adicionais</h2>
          <p className={styles.sectionHint}>Apenas leads e receita</p>

          <div className={styles.channelsGrid}>
            {/* Social */}
            <div className={styles.channelCard}>
              <h3 className={styles.channelTitle}>Social</h3>
              <div className={styles.channelInputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Leads</label>
                  <input
                    type="number"
                    min="0"
                    value={channels.leadsSocial}
                    onChange={(e) => handleChannelChange('leadsSocial', e.target.value)}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Receita (R$)</label>
                  <input
                    type="text"
                    value={channels.receitaSocial}
                    onChange={(e) => handleChannelChange('receitaSocial', e.target.value, true)}
                    className={styles.input}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* Influencer */}
            <div className={styles.channelCard}>
              <h3 className={styles.channelTitle}>Influencer</h3>
              <div className={styles.channelInputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Leads</label>
                  <input
                    type="number"
                    min="0"
                    value={channels.leadsInfluencer}
                    onChange={(e) => handleChannelChange('leadsInfluencer', e.target.value)}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Receita (R$)</label>
                  <input
                    type="text"
                    value={channels.receitaInfluencer}
                    onChange={(e) => handleChannelChange('receitaInfluencer', e.target.value, true)}
                    className={styles.input}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* Aula Experimental */}
            <div className={styles.channelCard}>
              <h3 className={styles.channelTitle}>Aula Experimental</h3>
              <div className={styles.channelInputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Leads</label>
                  <input
                    type="number"
                    min="0"
                    value={channels.leadsAulaExp}
                    onChange={(e) => handleChannelChange('leadsAulaExp', e.target.value)}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Receita (R$)</label>
                  <input
                    type="text"
                    value={channels.receitaAulaExp}
                    onChange={(e) => handleChannelChange('receitaAulaExp', e.target.value, true)}
                    className={styles.input}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className={styles.channelCard}>
              <h3 className={styles.channelTitle}>Email</h3>
              <div className={styles.channelInputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Leads</label>
                  <input
                    type="number"
                    min="0"
                    value={channels.leadsEmail}
                    onChange={(e) => handleChannelChange('leadsEmail', e.target.value)}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Receita (R$)</label>
                  <input
                    type="text"
                    value={channels.receitaEmail}
                    onChange={(e) => handleChannelChange('receitaEmail', e.target.value, true)}
                    className={styles.input}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* Site */}
            <div className={styles.channelCard}>
              <h3 className={styles.channelTitle}>Site</h3>
              <div className={styles.channelInputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Leads</label>
                  <input
                    type="number"
                    min="0"
                    value={channels.leadsSite}
                    onChange={(e) => handleChannelChange('leadsSite', e.target.value)}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Receita (R$)</label>
                  <input
                    type="text"
                    value={channels.receitaSite}
                    onChange={(e) => handleChannelChange('receitaSite', e.target.value, true)}
                    className={styles.input}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem */}
        {message.text && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        {/* Botao Enviar */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.buttonLoader} />
          ) : (
            'Enviar Dados'
          )}
        </button>
      </form>
    </div>
  )
}
