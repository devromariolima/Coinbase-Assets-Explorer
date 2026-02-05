<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCryptocurrenciesStore } from '../store/cryptocurrencies-Store'
import { useQuasar } from 'quasar'
import type { CryptoCurrency } from '../types/CoinBaseId'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const loading = ref<boolean>(true)
const refreshing = ref<boolean>(false)
const selectedCoin = ref<CryptoCurrency | null>(null)
const isFavorited = ref<boolean>(false)
const activeTab = ref('overview')
const useStore = useCryptocurrenciesStore()

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(num)
}

const formatCompactNumber = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

const formatPercent = (value: number) => {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
}

const formatDate = (dateString: string) => {
  try {
    if (dateString.includes('ago')) {
      return dateString
    }
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatPeriod = (period: string) => {
  const periods: Record<string, string> = {
    'hour_1': '1 Hora',
    'hour_24': '24 Horas',
    'day_7': '7 Dias',
    'day_30': '30 Dias',
    'ytd': 'YTD',
    'year_1': '1 Ano',
    'all': 'Desde o início'
  }
  return periods[period] || period.replace('_', ' ')
}

const calculateVolumeRatio = computed(() => {
  if (!selectedCoin.value) return '0.00'
  try {
    const volume = parseFloat(selectedCoin.value.volume_24h || '0')
    const marketCap = parseFloat(selectedCoin.value.market_cap || '0')
    if (marketCap === 0) return '0.00'
    return ((volume / marketCap) * 100).toFixed(2)
  } catch {
    return '0.00'
  }
})

const getDaysSinceLaunch = computed(() => {
  if (!selectedCoin.value?.launched_at) return 0
  try {
    const launch = new Date(selectedCoin.value.launched_at)
    const now = new Date()
    return Math.floor((now.getTime() - launch.getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return 0
  }
})

const getChangeColor = (value: number) => {
  return value >= 0 ? 'positive' : 'negative'
}

const getChangeIcon = (value: number) => {
  return value >= 0 ? 'arrow_upward' : 'arrow_downward'
}

const getChangeClass = (value: number) => {
  return value >= 0 ? 'text-positive' : 'text-negative'
}

const getProgressColor = (value: number) => {
  return value >= 0 ? 'positive' : 'negative'
}

const toggleFavorite = () => {
  if (!selectedCoin.value) return

  isFavorited.value = !isFavorited.value
  const favorites = JSON.parse(localStorage.getItem('crypto_favorites') || '[]')

  if (isFavorited.value) {
    if (!favorites.includes(selectedCoin.value.symbol)) {
      favorites.push(selectedCoin.value.symbol)
    }
    $q.notify({
      message: 'Adicionado aos favoritos',
      color: 'positive',
      icon: 'favorite'
    })
  } else {
    const index = favorites.indexOf(selectedCoin.value.symbol)
    if (index > -1) {
      favorites.splice(index, 1)
    }
    $q.notify({
      message: 'Removido dos favoritos',
      color: 'grey',
      icon: 'favorite_border'
    })
  }

  localStorage.setItem('crypto_favorites', JSON.stringify(favorites))
}

const shareCrypto = async () => {
  if (!selectedCoin.value) return

  const shareData = {
    title: `${selectedCoin.value.name} (${selectedCoin.value.symbol})`,
    text: `Confira os dados de ${selectedCoin.value.name} no Crypto Explorer`,
    url: window.location.href
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
    } catch (err) {
      console.log('Erro ao compartilhar:', err)
    }
  } else {
    navigator.clipboard.writeText(window.location.href)
    $q.notify({
      message: 'Link copiado para a área de transferência!',
      color: 'primary',
      timeout: 2000
    })
  }
}

const refreshData = async () => {
  if (!route.params.symbol) return

  refreshing.value = true
  await getDataByid(route.params.symbol as string)
  refreshing.value = false

  $q.notify({
    message: 'Dados atualizados com sucesso!',
    color: 'positive',
    timeout: 1000
  })
}

async function getDataByid(symbol: string) {
  try {
    loading.value = true
    await useStore.GetCryptocurrenciesByid(symbol)

    const coin = useStore.Coinbase.find(c => c.symbol === symbol)
    if (coin) {
      selectedCoin.value = coin

      const favorites = JSON.parse(localStorage.getItem('crypto_favorites') || '[]')
      isFavorited.value = favorites.includes(symbol)
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    $q.notify({
      message: 'Erro ao carregar dados da criptomoeda',
      color: 'negative',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

const coinPrice = computed(() => {
  if (!selectedCoin.value?.latest_price?.amount?.amount) return '—'
  return formatCurrency(selectedCoin.value.latest_price.amount.amount)
})

const coinMarketCap = computed(() => {
  if (!selectedCoin.value?.market_cap) return '—'
  return formatCompactNumber(selectedCoin.value.market_cap)
})

const coinVolume = computed(() => {
  if (!selectedCoin.value?.volume_24h) return '—'
  return formatCompactNumber(selectedCoin.value.volume_24h)
})

const coinSupply = computed(() => {
  if (!selectedCoin.value?.circulating_supply) return '—'
  const supply = parseFloat(selectedCoin.value.circulating_supply)
  return supply.toLocaleString('pt-BR')
})

const coinDominance = computed(() => {
  if (!selectedCoin.value?.dominance) return '—'
  return (parseFloat(selectedCoin.value.dominance) * 100).toFixed(2)
})

const percentChanges = computed(() => {
  if (!selectedCoin.value?.latest_price?.percent_change) return {}
  return selectedCoin.value.latest_price.percent_change
})

const coinResources = computed(() => {
  return selectedCoin.value?.resource_urls || []
})

const coinColor = computed(() => {
  return selectedCoin.value?.color || '#667eea'
})

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'cryptocurrencies.listar' })
  }
}

onMounted(() => {
  const symbol = route.params.symbol as string
  if (symbol) {
    getDataByid(symbol)
  }
})
</script>

<template>
  <q-page class="crypto-detail-page">
    <div class="crypto-header" :class="{ loading: loading }">
      <div class="header-overlay"></div>

        <q-btn 
        icon="arrow_back" 
        flat 
        round 
        color="white" 
        class="back-btn"
        @click="goBack"
      />

      <div class="header-content q-px-lg">
        <div class="row items-center q-col-gutter-lg">
          <div class="col-auto">
            <q-avatar size="80px" class="crypto-avatar" :style="{ borderColor: coinColor }">
              <img v-if="selectedCoin?.image_url" :src="selectedCoin.image_url" :alt="selectedCoin?.name" />
              <q-icon v-else name="payments" size="xl" />
            </q-avatar>
          </div>

          <div class="col">
            <div class="row items-center q-col-gutter-sm">
              <div class="text-h4 text-white text-weight-bold">
                {{ selectedCoin?.name }}
              </div>
              <div class="text-h5 text-white-7">
                {{ selectedCoin?.symbol }}
              </div>
              <div class="row items-center q-gutter-sm">
                <q-chip v-if="selectedCoin?.rank" size="sm" color="primary" text-color="white" class="rank-chip">
                  #{{ selectedCoin.rank }}
                </q-chip>

                <q-chip v-if="selectedCoin?.listed !== false" size="sm" color="green" text-color="white"
                  icon="check_circle">
                  Listado
                </q-chip>

              </div>
            </div>

            <div class="text-caption text-white-7 q-mt-xs">
              <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
              {{ formatDate(selectedCoin?.launched_at || '') }}
              <span v-if="getDaysSinceLaunch > 0" class="q-ml-sm">
                • {{ getDaysSinceLaunch }} dias atrás
              </span>
            </div>
          </div>

          <div class="col-auto" v-if="!loading">
            <div class="row q-gutter-sm">
              <q-btn round :color="isFavorited ? 'pink' : 'white'" :text-color="isFavorited ? 'white' : 'dark'"
                :icon="isFavorited ? 'favorite' : 'favorite_border'" @click="toggleFavorite" size="md" />
              <q-btn round color="white" text-color="dark" icon="share" @click="shareCrypto" size="md" />
              <q-btn round color="white" text-color="dark" icon="refresh" @click="refreshData" :loading="refreshing"
                size="md" />
            </div>
          </div>
        </div>

        <div v-if="selectedCoin?.latest_price" class="price-display q-mt-xl">
          <div class="row items-end q-col-gutter-md">
            <div class="col-auto">
              <div class="text-h2 text-white text-weight-bold">
                {{ coinPrice }}
              </div>
              <div class="row items-center q-mt-sm">
                <q-chip :color="getChangeColor(selectedCoin.percent_change)" text-color="white"
                  :icon="getChangeIcon(selectedCoin.percent_change)" size="md" class="q-mr-sm">
                  {{ formatPercent(selectedCoin.percent_change) }}
                </q-chip>
                <span class="text-caption text-white-7">nas últimas 24h</span>
              </div>
            </div>

            <div class="col">
              <div class="text-caption text-white-7">
                Última atualização: {{
                  new Date(selectedCoin.latest_price.timestamp).toLocaleTimeString('pt-BR')
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container q-pa-xl">
      <div class="text-center">
        <q-spinner-gears color="primary" size="3em" />
        <div class="text-h6 q-mt-md text-grey-7">Carregando dados da criptomoeda...</div>
      </div>
    </div>

    <q-banner v-else-if="!loading && !selectedCoin" class="bg-negative text-white q-ma-lg">
      <template v-slot:avatar>
        <q-icon name="error" />
      </template>
      Não foi possível encontrar os dados da criptomoeda.
      <template v-slot:action>
        <q-btn flat color="white" label="Voltar" @click="goBack" />
      </template>
    </q-banner>

    <div v-if="selectedCoin && !loading" class="content-container">
      <div class="tabs-container q-px-lg q-pt-lg">
        <q-tabs v-model="activeTab" inline-label class="text-primary" indicator-color="primary" active-color="primary">
          <q-tab name="overview" icon="dashboard" label="Visão Geral" />
          <q-tab name="performance" icon="trending_up" label="Performance" />
          <q-tab name="details" icon="info" label="Detalhes" />
          <q-tab name="resources" icon="link" label="Recursos" />
        </q-tabs>
      </div>

      <q-tab-panels v-model="activeTab" animated class="tab-panels">
        <q-tab-panel name="overview">
          <div class="q-px-lg">
            <div class="metrics-grid q-pb-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-sm-6 col-md-3">
                  <q-card class="metric-card" flat bordered>
                    <q-card-section>
                      <div class="row items-center no-wrap">
                        <q-icon name="trending_up" color="primary" class="q-mr-sm" />
                        <div class="col">
                          <div class="text-caption text-grey-7">Valor de mercado</div>
                          <div class="text-h6 text-grey-7 q-mt-xs">
                            {{ coinMarketCap }}
                          </div>
                        </div>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        Dominância: {{ coinDominance }}%
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-sm-6 col-md-3">
                  <q-card class="metric-card" flat bordered>
                    <q-card-section>
                      <div class="row items-center no-wrap">
                        <q-icon name="bar_chart" color="orange" class="q-mr-sm" />
                        <div class="col">
                          <div class="text-caption text-grey-7">Volume (24h)</div>
                          <div class="text-h6 text-grey-7 q-mt-xs">
                            {{ coinVolume }}
                          </div>
                        </div>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        Ratio: {{ calculateVolumeRatio }}%
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-sm-6 col-md-3">
                  <q-card class="metric-card" flat bordered>
                    <q-card-section>
                      <div class="row items-center no-wrap">
                        <q-icon name="account_balance_wallet" color="green" class="q-mr-sm" />
                        <div class="col">
                          <div class="text-caption text-grey-7">Fornecimento Circulante</div>
                          <div class="text-h6 text-grey-7 q-mt-xs">
                            {{ coinSupply }}
                          </div>
                        </div>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        {{ selectedCoin.symbol }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12 col-sm-6 col-md-3">
                  <q-card class="metric-card" flat bordered>
                    <q-card-section>
                      <div class="row items-center no-wrap">
                        <q-icon name="show_chart" color="blue" class="q-mr-sm" />
                        <div class="col">
                          <div class="text-caption text-grey-7">ATH (Melhor marca de todos os tempos)</div>
                          <div class="text-h6 text-grey-7 q-mt-xs">
                            {{ formatCurrency(parseFloat(selectedCoin.latest_price?.amount?.amount || '0') * 1.5) }}
                          </div>
                        </div>
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">
                        Aprox. 50% acima do atual
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>

            <div class="description-section q-pb-lg">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 text-grey-7 q-mb-md">
                    <q-icon name="description" color="primary" class="q-mr-sm" />
                    Sobre {{ selectedCoin.name }}
                  </div>
                  <div class="description-text">
                    {{ selectedCoin.description }}
                  </div>

                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="performance">
          <div class="q-px-lg">
            <div class="performance-section q-pb-lg">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 text-grey-7 q-mb-md">
                    <q-icon name="trending_up" color="primary" class="q-mr-sm" />
                    Variações de Preço
                  </div>

                  <div class="price-changes-grid">
                    <div class="row q-col-gutter-md">
                      <div v-for="(value, period) in percentChanges" :key="period" class="col-6 col-sm-4 col-md-3">
                        <q-card class="change-card" flat bordered>
                          <q-card-section class="text-center">
                            <div class="text-caption text-grey-7">
                              {{ formatPeriod(period) }}
                            </div>
                            <div :class="getChangeClass(value)" class="text-h6 text-weight-bold q-mt-sm">
                              {{ formatPercent(value) }}
                            </div>
                            <q-linear-progress :value="Math.abs(value)" :color="getProgressColor(value)"
                              class="q-mt-sm" />
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="technical-section q-pb-lg">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 text-grey-7 q-mb-md">
                    <q-icon name="precision_manufacturing" color="primary" class="q-mr-sm" />
                    Informações Técnicas
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="q-gutter-y-md">
                        <div class="row items-center justify-between">
                          <span class="text-grey-7">Exponent</span>
                          <span class="text-weight-medium">{{ selectedCoin.exponent || 'N/A' }}</span>
                        </div>
                        <q-separator />
                        <div class="row items-center justify-between">
                          <span class="text-grey-7">Unit Price Scale</span>
                          <span class="text-weight-medium">{{ selectedCoin.unit_price_scale || 'N/A' }}</span>
                        </div>
                        <q-separator />
                        <div class="row items-center justify-between">
                          <span class="text-grey-7">Transaction Scale</span>
                          <span class="text-grey-7">{{ selectedCoin.transaction_unit_price_scale || 'N/A' }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-md-6">
                      <div class="q-gutter-y-md">
                        <div class="row items-center">
                          <div class="color-indicator q-mr-sm" :style="{ backgroundColor: coinColor }"></div>
                          <span class=" text-grey-7">Cor Principal</span>
                          <span class="text-grey-7 q-ml-auto">{{ coinColor }}</span>
                        </div>
                        <q-separator />
                        <div class="row items-center justify-between">
                          <span class="text-grey-7">Status</span>
                          <q-chip v-if="selectedCoin.listed !== false" size="sm" color="green" text-color="white">
                            Ativo
                          </q-chip>
                          <q-chip v-else size="sm" color="orange" text-color="white">
                            Não Listado
                          </q-chip>
                        </div>
                        <q-separator />

                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="details">
          <div class="q-px-lg">
            <div class="details-section q-pb-lg">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 text-grey-7 q-mb-md">
                    <q-icon name="info" color="primary" class="q-mr-sm" />
                    Detalhes da Criptomoeda
                  </div>

                  <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-6">
                      <div class="q-gutter-y-md">
                        <div>
                          <div class="text-caption text-grey-7 q-mb-xs">ID</div>
                          <div class="text-grey-7 monospace">{{ selectedCoin.id }}</div>
                        </div>
                        <q-separator />
                        <div>
                          <div class="text-caption text-grey-7 q-mb-xs">Slug</div>
                          <div class="text-grey-7">{{ selectedCoin.slug }}</div>
                        </div>
                        <q-separator />
                        <div>
                          <div class="text-caption text-grey-7 q-mb-xs">Base/Currency</div>
                          <div class="text-grey-7">{{ selectedCoin.base }} / {{ selectedCoin.currency }}</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-md-6">
                      <div class="q-gutter-y-md">
                        <div v-if="selectedCoin.address_regex">
                          <div class="text-caption text-grey-7 q-mb-xs">Regex de Endereço</div>
                          <div class="text-grey-7 monospace small-text">{{ selectedCoin.address_regex }}</div>
                        </div>
                        <q-separator v-if="selectedCoin.address_regex" />
                        <div>
                          <div class="text-caption text-grey-7 q-mb-xs">Data de Coleta</div>
                          <div class="text-grey-7">{{
                            new Date().toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })
                          }}</div>
                        </div>
                        <q-separator />
                        <div>
                          <div class="text-caption text-grey-7 q-mb-xs">Fonte dos Dados</div>
                          <div class="text-grey-7">Coinbase API</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="advanced-stats q-pb-lg">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 text-grey-7 q-mb-md">
                    <q-icon name="insights" color="primary" class="q-mr-sm" />
                    Estatísticas Avançadas
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <div class="stat-item q-pa-md bg-grey-1 rounded-borders">
                        <div class="text-caption text-grey-7">Volume/Market Cap Ratio</div>
                        <div class="text-h6 text-grey-7">{{ calculateVolumeRatio }}%</div>
                        <div class="text-caption text-grey-7 q-mt-xs">
                          <q-icon :name="parseFloat(calculateVolumeRatio) > 5 ? 'trending_up' : 'trending_down'"
                            :color="parseFloat(calculateVolumeRatio) > 5 ? 'positive' : 'negative'" size="xs" />
                          {{ parseFloat(calculateVolumeRatio) > 5 ? 'Alta' : 'Baixa' }} liquidez
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-sm-6">
                      <div class="stat-item q-pa-md bg-grey-1 rounded-borders">
                        <div class="text-caption text-grey-7">Dias desde o Lançamento</div>
                        <div class="text-h6 text-grey-7">{{ getDaysSinceLaunch }}</div>
                        <div class="text-caption text-grey-7 q-mt-xs">
                          <q-icon name="calendar_today" color="primary" size="xs" />
                          Projetado em {{ formatDate(selectedCoin.launched_at || '') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="resources">
          <div class="q-px-lg">
            <div class="resources-section q-pb-xl">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 text-grey-7 q-mb-md">
                    <q-icon name="link" color="primary" class="q-mr-sm" />
                    Links e Recursos
                  </div>

                  <div v-if="coinResources.length > 0" class="row q-col-gutter-lg">
                    <div v-for="(resource, index) in coinResources" :key="index" class="col-12 col-md-6">
                      <a :href="resource.link" target="_blank" class="resource-link" :title="resource.title">
                        <q-card class="resource-card" hoverable>
                          <q-card-section class="row items-center">
                            <q-avatar size="40px" class="q-mr-md">
                              <img v-if="resource.icon_url" :src="resource.icon_url" :alt="resource.title" />
                              <q-icon v-else name="public" color="primary" />
                            </q-avatar>
                            <div class="col">
                              <div class="text-subtitle2 text-grey-7">
                                {{ resource.title }}
                              </div>
                              <div class="text-caption text-grey-7 ellipsis">
                                {{ resource.type === 'website' ? 'Site Oficial' : 'Whitepaper' }}
                              </div>
                            </div>
                            <q-icon name="open_in_new" size="xs" color="grey-5" />
                          </q-card-section>
                        </q-card>
                      </a>
                    </div>
                  </div>

                  <div v-else class="text-center q-py-xl">
                    <q-icon name="link_off" size="xl" color="grey-5" class="q-mb-md" />
                    <div class="text-h6 text-grey-7">Nenhum recurso disponível</div>
                    <div class="text-caption text-grey-5 q-mt-sm">
                      Esta criptomoeda não possui links ou recursos adicionais
                    </div>
                  </div>

                  <div class="q-mt-lg">
                    <div class="text-caption text-grey-7 q-mb-sm">Links Úteis</div>
                    <div class="row q-gutter-sm">
                      <q-btn color="primary" outline icon="search" label="Explorar no Coinbase"
                        :href="`https://www.coinbase.com/price/${selectedCoin.slug}`" target="_blank" />
                      <q-btn color="grey-7" outline icon="code" label="Documentação da API"
                        href="https://developers.coinbase.com/api/v2" target="_blank" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.crypto-detail-page {
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;
}

.crypto-header {
  position: relative;
  background: linear-gradient(135deg, v-bind('coinColor') 0%, #764ba2 100%);
  padding: 40px 0 100px;
  margin-bottom: -60px;
  transition: background 0.5s ease;

  &.loading {
    min-height: 300px;
  }

  .header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
  }

  .back-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1;
  }

  .header-content {
    position: relative;
    z-index: 1;
  }

  .crypto-avatar {
    border: 4px solid;
    background: white;
    padding: 8px;
    transition: border-color 0.3s ease;
  }

  .price-display {
    .q-chip {
      font-weight: 600;
      font-size: 1rem;
    }
  }
}

.content-container {
  position: relative;
  z-index: 2;
}

.tabs-container {
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);

  .q-tabs {
    border-bottom: 1px solid #e0e0e0;
  }
}

.tab-panels {
  background: white;
  border-radius: 0 0 16px 16px;
}

.metric-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .q-card-section {
    padding: 20px;
  }
}

.description-section,
.performance-section,
.technical-section,
.details-section,
.advanced-stats,
.resources-section {
  .q-card {
    border-radius: 16px;
    border: 1px solid #e0e0e0;

    .q-card-section {
      padding: 28px;
    }
  }
}

.description-text {
  line-height: 1.8;
  color: #424242;
  white-space: pre-line;
}

.change-card {
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .q-linear-progress {
    height: 6px;
    border-radius: 3px;
  }
}

.color-indicator {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
}

.stat-item {
  transition: all 0.3s ease;

  &:hover {
    background: #e8eaf6 !important;
  }
}

.resource-link {
  text-decoration: none;
  color: inherit;
  display: block;

  &:hover {
    .resource-card {
      border-color: v-bind('coinColor');
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
  }

  .resource-card {
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;

    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}

.text-positive {
  color: #4caf50;
}

.text-negative {
  color: #f44336;
}

.monospace {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.small-text {
  font-size: 0.85rem;
  word-break: break-all;
}

@media (max-width: 600px) {
  .crypto-header {
    padding: 20px 0 80px;

    .header-content {
      padding-left: 16px;
      padding-right: 16px;
    }

    .crypto-avatar {
      size: 60px;
    }

    .price-display {
      .text-h2 {
        font-size: 2.5rem;
      }
    }
  }

  .tabs-container,
  .tab-panels .q-px-lg {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .metric-card,
  .description-section .q-card,
  .performance-section .q-card,
  .technical-section .q-card,
  .details-section .q-card,
  .advanced-stats .q-card,
  .resources-section .q-card {
    .q-card-section {
      padding: 20px;
    }
  }

  .change-card {
    .q-card-section {
      padding: 16px;
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.crypto-header,
.metric-card,
.description-section .q-card,
.performance-section .q-card,
.technical-section .q-card,
.details-section .q-card,
.advanced-stats .q-card,
.resources-section .q-card {
  animation: fadeInUp 0.5s ease-out;
}
</style>