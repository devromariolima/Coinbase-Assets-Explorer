<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useCryptocurrenciesStore } from '../store/cryptocurrencies-Store'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import type { CryptoCurrency } from '../types/CoinBaseId'

const router = useRouter()
const $q = useQuasar()
const loading = ref(true)
const refreshing = ref(false)
const searchQuery = ref('')
const sortBy = ref('rank')
const sortOrder = ref('asc')
const showFavoritesOnly = ref(false)
const store = useCryptocurrenciesStore()

const coinbaseList = computed(() => store.Coinbase)

const favorites = computed(() => {
  return JSON.parse(localStorage.getItem('crypto_favorites') || '[]')
})

const coinsToDisplay = computed(() => {
  let coins = coinbaseList.value
  
  if (showFavoritesOnly.value) {
    coins = coins.filter(coin => favorites.value.includes(coin.symbol))
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    coins = coins.filter(coin => 
      coin.name.toLowerCase().includes(query) || 
      coin.symbol.toLowerCase().includes(query)
    )
  }
  
  return sortCoins(coins)
})

const hasFavorites = computed(() => {
  return favorites.value.length > 0
})

function sortCoins(coins: CryptoCurrency[]) {
  const sorted = [...coins]
  
  sorted.sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'symbol':
        aValue = a.symbol.toLowerCase()
        bValue = b.symbol.toLowerCase()
        break
      case 'price':
        aValue = parseFloat(a.latest_price?.amount?.amount || '0')
        bValue = parseFloat(b.latest_price?.amount?.amount || '0')
        break
      case 'market_cap':
        aValue = parseFloat(a.market_cap || '0')
        bValue = parseFloat(b.market_cap || '0')
        break
      case 'change':
        aValue = a.percent_change || 0
        bValue = b.percent_change || 0
        break
      case 'rank':
      default:
        aValue = a.rank || 9999999
        bValue = b.rank || 9999999
        break
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return sorted
}

function toggleFavorite(symbol: string, event: Event) {
  event.stopPropagation()
  
  const favoritesList = [...favorites.value]
  const index = favoritesList.indexOf(symbol)
  
  if (index > -1) {
    favoritesList.splice(index, 1)
    $q.notify({
      message: 'Removido dos favoritos',
      color: 'grey',
      icon: 'favorite_border',
      timeout: 1000
    })
  } else {
    favoritesList.push(symbol)
    $q.notify({
      message: 'Adicionado aos favoritos',
      color: 'pink',
      icon: 'favorite',
      timeout: 1000
    })
  }
  
  localStorage.setItem('crypto_favorites', JSON.stringify(favoritesList))
}

function isFavorite(symbol: string) {
  return favorites.value.includes(symbol)
}

function formatCurrency(amount: string | number) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (num === 0) return '—'
  
  if (num < 0.01) {
    return `$${num.toFixed(6)}`
  } else if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`
  } else if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`
  }
  return `$${num.toFixed(2)}`
}

function formatPercent(value: number) {
  if (value === 0) return '0.00%'
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
}

function getChangeColor(value: number) {
  return value >= 0 ? 'positive' : 'negative'
}

async function getData() {
  try {
    loading.value = true
    await store.GetCryptocurrencies()
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    $q.notify({
      message: 'Erro ao carregar dados das criptomoedas',
      color: 'negative',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

async function refreshData() {
  refreshing.value = true
  await getData()
  refreshing.value = false
  $q.notify({
    message: 'Dados atualizados com sucesso!',
    color: 'positive',
    timeout: 1000
  })
}

function goToDetails(coin: CryptoCurrency) {
  router.push({ 
    name: 'cryptocurrencies.details', 
    params: { symbol: coin.symbol } 
  })
}

watch(searchQuery, () => {
  clearTimeout((window as any).searchTimeout)
  ;(window as any).searchTimeout = setTimeout(() => {
  }, 300)
})

onMounted(() => {
  getData()
})
</script>

<template>
  <q-page class="crypto-list-page">
    <div class="list-header q-px-lg q-pt-lg q-pb-md">
      <div class="row items-center justify-between">
        <div>
          <div class="text-h4 text-weight-bold">Coinbase Explorer</div>
          <div class="text-subtitle1 text-grey-7 q-mt-xs">
            Explore todas as criptomoedas disponíveis na Coinbase
          </div>
        </div>
        
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            round
            :color="showFavoritesOnly ? 'pink' : 'grey'"
            :icon="showFavoritesOnly ? 'favorite' : 'favorite_border'"
            @click="showFavoritesOnly = !showFavoritesOnly"
          >
            <q-tooltip>
              {{ showFavoritesOnly ? 'Mostrar todas' : 'Mostrar apenas favoritos' }}
            </q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            round
            color="primary"
            icon="refresh"
            @click="refreshData"
            :loading="refreshing"
          >
            <q-tooltip>Atualizar dados</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <div class="filters-section q-px-lg q-pb-lg">
      <div class="row items-center q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <q-input
            v-model="searchQuery"
            filled
            dense
            placeholder="Buscar por nome ou símbolo..."
            clearable
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon v-if="searchQuery" name="clear" class="cursor-pointer" @click="searchQuery = ''" />
            </template>
          </q-input>
        </div>
      </div>
      
      <div class="row items-center justify-between q-mt-md">
        <div class="text-caption text-grey-7">
          <span v-if="showFavoritesOnly && hasFavorites">
            Mostrando {{ coinsToDisplay.length }} de {{ favorites.length }} favoritos
          </span>
          <span v-else-if="searchQuery">
            {{ coinsToDisplay.length }} resultado(s) para "{{ searchQuery }}"
          </span>
          <span v-else>
            Total de {{ coinbaseList.length }} criptomoedas
          </span>
        </div>
        
        <div v-if="hasFavorites" class="row items-center q-gutter-xs">
          <q-icon name="favorite" size="xs" color="pink" />
          <span class="text-caption">{{ favorites.length }} favoritos</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container q-px-lg">
      <div class="text-center q-pa-xl">
        <q-spinner-gears color="primary" size="3em" />
        <div class="text-h6 q-mt-md text-grey-7">Carregando criptomoedas...</div>
      </div>
    </div>

    <div v-else-if="!loading && coinbaseList.length === 0" class="empty-state q-pa-xl">
      <div class="text-center">
        <q-icon name="currency_bitcoin" size="xl" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">Nenhuma criptomoeda encontrada</div>
        <q-btn
          color="primary"
          label="Tentar novamente"
          @click="getData"
          class="q-mt-md"
        />
      </div>
    </div>

    <div v-else-if="showFavoritesOnly && !hasFavorites" class="empty-state q-pa-xl">
      <div class="text-center">
        <q-icon name="favorite_border" size="xl" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">Você ainda não tem favoritos</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          Clique no ícone de coração em qualquer criptomoeda para adicionar aos favoritos
        </div>
      </div>
    </div>

    <div v-else-if="searchQuery && coinsToDisplay.length === 0" class="empty-state q-pa-xl">
      <div class="text-center">
        <q-icon name="search_off" size="xl" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">
          Nenhuma criptomoeda encontrada com "{{ searchQuery }}"
        </div>
        <q-btn
          flat
          color="primary"
          label="Limpar busca"
          @click="searchQuery = ''"
          class="q-mt-md"
        />
      </div>
    </div>

    <div v-else class="crypto-grid q-px-lg q-pb-xl">
      <div class="row q-col-gutter-lg">
        <div
          v-for="coin in coinsToDisplay"
          :key="coin.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card 
            class="crypto-card"
            @click="goToDetails(coin)"
            :class="{ 'favorite-card': isFavorite(coin.symbol) }"
          >
            <div class="card-header" :style="{ background: coin.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
              <div class="header-overlay"></div>
              
              <div class="row items-center justify-between">
                <q-chip
                  v-if="coin.rank"
                  size="sm"
                  color="white"
                  text-color="dark"
                  class="rank-chip"
                >
                  #{{ coin.rank }}
                </q-chip>
                
                <q-btn
                  flat
                  round
                  :color="isFavorite(coin.symbol) ? 'pink' : 'white'"
                  :icon="isFavorite(coin.symbol) ? 'favorite' : 'favorite_border'"
                  @click.stop="toggleFavorite(coin.symbol, $event)"
                  size="sm"
                  class="favorite-btn"
                />
              </div>
              
              <div class="coin-image-container">
                <q-avatar size="60px" class="coin-avatar">
                  <img
                    v-if="coin.image_url"
                    :src="coin.image_url"
                    :alt="coin.name"
                  />
                  <q-icon v-else name="payments" size="xl" />
                </q-avatar>
              </div>
            </div>
            
            <q-card-section class="card-content">
              <div class="text-center q-mb-sm">
                <div class="text-h6 text-grey-7 ellipsis">{{ coin.name }}</div>
                <div class="text-caption text-grey-7">{{ coin.symbol }}</div>
              </div>
              
              <div class="text-center q-my-md">
                <div class="text-h5 text-grey-7">
                  {{ formatCurrency(coin.latest_price?.amount?.amount || 0) }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ coin.latest_price?.amount?.currency || 'USD' }}
                </div>
              </div>
              
              <div class="row items-center justify-between q-mt-md">
                <div class="col">
                  <div class="text-caption text-grey-7">24h</div>
                  <div :class="getChangeColor(coin.percent_change || 0)" class="text-subtitle2 text-grey-7">
                    {{ formatPercent(coin.percent_change || 0) }}
                  </div>
                </div>
                
                <div class="col text-right">
                  <div class="text-caption text-grey-7">Valor de mercado</div>
                  <div class="text-subtitle2 text-grey-7">
                    {{ formatCurrency(coin.market_cap || 0) }}
                  </div>
                </div>
              </div>
            </q-card-section>
            
            <q-card-actions class="card-footer">
              <q-btn
                flat
                color="primary"
                label="Ver detalhes"
                icon="chevron_right"
                class="full-width"
                @click.stop="goToDetails(coin)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.crypto-list-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.list-header {
  background: white;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.filters-section {
  background: white;
  border-radius: 16px;
  margin: 0 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  .search-input {
    .q-field__control {
      border-radius: 12px;
    }
  }
}

.crypto-grid {
  .crypto-card {
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    height: 100%;
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
    }
    
    &.favorite-card {
      border: 2px solid #ec407a;
    }
    
    .card-header {
      position: relative;
      padding: 20px 20px 40px;
      color: white;
      
      .header-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
      }
      
      .rank-chip,
      .favorite-btn {
        position: relative;
        z-index: 1;
      }
      
      .coin-image-container {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: center;
        margin-top: 10px;
        
        .coin-avatar {
          border: 4px solid rgba(255, 255, 255, 0.3);
          background: white;
          padding: 8px;
        }
      }
    }
    
    .card-content {
      padding: 60px 20px 20px;
      margin-top: -40px;
      background: white;
      position: relative;
      z-index: 2;
      border-radius: 20px 20px 0 0;
      
      .ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .card-footer {
      padding: 0 20px 20px;
      background: white;
      
      .q-btn {
        border-radius: 12px;
        padding: 8px;
      }
    }
  }
}

.loading-container,
.empty-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-positive {
  color: #10b981;
  font-weight: 600;
}

.text-negative {
  color: #ef4444;
  font-weight: 600;
}

@media (max-width: 599px) {
  .list-header,
  .filters-section {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  
  .filters-section {
    margin: 0 16px;
  }
  
  .crypto-grid {
    padding-left: 16px !important;
    padding-right: 16px !important;
    
    .crypto-card {
      .card-header {
        padding: 16px 16px 40px;
      }
      
      .card-content {
        padding: 50px 16px 16px;
      }
      
      .card-footer {
        padding: 0 16px 16px;
      }
    }
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .crypto-grid {
    .crypto-card {
      .card-header {
        padding: 18px 18px 40px;
      }
      
      .card-content {
        padding: 55px 18px 18px;
      }
      
      .card-footer {
        padding: 0 18px 18px;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.crypto-card {
  animation: fadeIn 0.5s ease-out;
}

.crypto-grid .crypto-card:nth-child(1) { animation-delay: 0.1s; }
.crypto-grid .crypto-card:nth-child(2) { animation-delay: 0.2s; }
.crypto-grid .crypto-card:nth-child(3) { animation-delay: 0.3s; }
.crypto-grid .crypto-card:nth-child(4) { animation-delay: 0.4s; }
.crypto-grid .crypto-card:nth-child(5) { animation-delay: 0.5s; }
.crypto-grid .crypto-card:nth-child(6) { animation-delay: 0.6s; }
.crypto-grid .crypto-card:nth-child(7) { animation-delay: 0.7s; }
.crypto-grid .crypto-card:nth-child(8) { animation-delay: 0.8s; }
.crypto-grid .crypto-card:nth-child(9) { animation-delay: 0.9s; }
.crypto-grid .crypto-card:nth-child(10) { animation-delay: 1.0s; }
.crypto-grid .crypto-card:nth-child(11) { animation-delay: 1.1s; }
.crypto-grid .crypto-card:nth-child(12) { animation-delay: 1.2s; }

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.loading-skeleton {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 1000px 100%;
}
</style>