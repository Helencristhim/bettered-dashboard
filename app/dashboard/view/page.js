'use client'

import { useState, useEffect } from 'react'
import styles from './view.module.css'

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const ANOS = ['2024', '2025', '2026']

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value || 0)
}

function KPICard({ title, value, subtitle, icon, color = 'blue' }) {
  return (
    <div className={`${styles.kpiCard} ${styles[color]}`}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div className={styles.kpiContent}>
        <span className={styles.kpiTitle}>{title}</span>
        <span className={styles.kpiValue}>{value}</span>
        {subtitle && <span className={styles.kpiSubtitle}>{subtitle}</span>}
      </div>
    </div>
  )
}

function ChannelCard({ title, leads, receita }) {
  return (
    <div className={styles.channelCard}>
      <h4 className={styles.channelTitle}>{title}</h4>
      <div className={styles.channelMetrics}>
        <div className={styles.channelMetric}>
          <span className={styles.channelLabel}>Leads</span>
          <span className={styles.channelValue}>{formatNumber(leads)}</span>
        </div>
        <div className={styles.channelMetric}>
          <span className={styles.channelLabel}>Receita</span>
          <span className={styles.channelValue}>{formatCurrency(receita)}</span>
        </div>
      </div>
    </div>
  )
}

export default function ViewPage() {
  const [mes, setMes] = useState('')
  const [ano, setAno] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!mes || !ano) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/sheets?mes=${mes}&ano=${ano}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      setData(result.data || [])
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados. Tente novamente.')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [mes, ano])

  const googleData = data.find((d) => d.fonte === 'Google') || {}
  const metaData = data.find((d) => d.fonte === 'Meta') || {}

  // Totais
  const totalInvestimento = (googleData.investimento || 0) + (metaData.investimento || 0)
  const totalLeads = (googleData.leads || 0) + (metaData.leads || 0)
  const totalVendas = (googleData.vendas || 0) + (metaData.vendas || 0)
  const totalReceita = (googleData.receita || 0) + (metaData.receita || 0)
  const totalCPL = totalLeads > 0 ? totalInvestimento / totalLeads : 0
  const totalCAC = totalVendas > 0 ? totalInvestimento / totalVendas : 0

  // Canais (pegar de qualquer fonte, pois sao os mesmos)
  const channels = googleData.leadsSocial !== undefined ? googleData : metaData

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Visualizar Dados</h1>
          <p className={styles.subtitle}>Analise os KPIs de marketing do periodo selecionado</p>
        </div>

        <div className={styles.periodSelectors}>
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className={styles.select}
          >
            <option value="">Mes</option>
            {MESES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className={styles.select}
          >
            <option value="">Ano</option>
            {ANOS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loader} />
          <span>Carregando dados...</span>
        </div>
      ) : !mes || !ano ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3>Selecione um periodo</h3>
          <p>Escolha o mes e ano para visualizar os dados</p>
        </div>
      ) : data.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>Nenhum dado encontrado</h3>
          <p>Nao ha dados para {mes} de {ano}</p>
        </div>
      ) : (
        <>
          {/* Resumo Geral */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Resumo Geral</h2>
            <div className={styles.kpiGrid}>
              <KPICard
                title="Investimento Total"
                value={formatCurrency(totalInvestimento)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                }
              />
              <KPICard
                title="Leads Totais"
                value={formatNumber(totalLeads)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                }
              />
              <KPICard
                title="Vendas Totais"
                value={formatNumber(totalVendas)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                color="green"
              />
              <KPICard
                title="Receita Total"
                value={formatCurrency(totalReceita)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
              />
              <KPICard
                title="CPL Medio"
                value={formatCurrency(totalCPL)}
                subtitle="Custo por Lead"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                color="orange"
              />
              <KPICard
                title="CAC Medio"
                value={formatCurrency(totalCAC)}
                subtitle="Custo por Aquisicao"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                color="orange"
              />
            </div>
          </section>

          {/* Google Ads */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>G</span>
              Google Ads
            </h2>
            <div className={styles.kpiGrid}>
              <KPICard
                title="Investimento"
                value={formatCurrency(googleData.investimento)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                }
              />
              <KPICard
                title="Leads"
                value={formatNumber(googleData.leads)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  </svg>
                }
              />
              <KPICard
                title="Vendas"
                value={formatNumber(googleData.vendas)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  </svg>
                }
                color="green"
              />
              <KPICard
                title="Receita"
                value={formatCurrency(googleData.receita)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                  </svg>
                }
                color="green"
              />
              <KPICard
                title="CPL"
                value={formatCurrency(googleData.cpl)}
                subtitle="Custo por Lead"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                }
                color="orange"
              />
              <KPICard
                title="CAC"
                value={formatCurrency(googleData.cac)}
                subtitle="Custo por Aquisicao"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                color="orange"
              />
            </div>
          </section>

          {/* Meta Ads */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIconMeta}>M</span>
              Meta Ads
            </h2>
            <div className={styles.kpiGrid}>
              <KPICard
                title="Investimento"
                value={formatCurrency(metaData.investimento)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                }
              />
              <KPICard
                title="Leads"
                value={formatNumber(metaData.leads)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  </svg>
                }
              />
              <KPICard
                title="Vendas"
                value={formatNumber(metaData.vendas)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  </svg>
                }
                color="green"
              />
              <KPICard
                title="Receita"
                value={formatCurrency(metaData.receita)}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                  </svg>
                }
                color="green"
              />
              <KPICard
                title="CPL"
                value={formatCurrency(metaData.cpl)}
                subtitle="Custo por Lead"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                }
                color="orange"
              />
              <KPICard
                title="CAC"
                value={formatCurrency(metaData.cac)}
                subtitle="Custo por Aquisicao"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                color="orange"
              />
            </div>
          </section>

          {/* Canais Adicionais */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Canais Adicionais</h2>
            <div className={styles.channelsGrid}>
              <ChannelCard
                title="Social"
                leads={channels.leadsSocial}
                receita={channels.receitaSocial}
              />
              <ChannelCard
                title="Influencer"
                leads={channels.leadsInfluencer}
                receita={channels.receitaInfluencer}
              />
              <ChannelCard
                title="Aula Experimental"
                leads={channels.leadsAulaExp}
                receita={channels.receitaAulaExp}
              />
              <ChannelCard
                title="Email"
                leads={channels.leadsEmail}
                receita={channels.receitaEmail}
              />
              <ChannelCard
                title="Site"
                leads={channels.leadsSite}
                receita={channels.receitaSite}
              />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
