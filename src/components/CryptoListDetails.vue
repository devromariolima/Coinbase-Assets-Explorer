<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCryptocurrenciesStore } from '../store/cryptocurrencies-Store'
import type { CryptoCurrency } from '../types/CoinBaseId'

const loading = ref<boolean>(true)
const selectedCoin = ref<CryptoCurrency | null>(null)
const useStore = useCryptocurrenciesStore()
const route = useRoute()

async function getDataByid(symbol: string) {
  try {
    loading.value = true
    await useStore.GetCryptocurrenciesByid(symbol)

    const coin = useStore.Coinbase.find(c => c.symbol === symbol)
    if (coin) {
      selectedCoin.value = coin
    }
  } catch (error) {
    if (error instanceof Error) {
      // Tratar erro aqui se necessário
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const symbol = route.params.symbol as string
  getDataByid(symbol)
})
</script>

<template>
  <div class="q-pa-md">
    <div class="text-h5 text-weight-bold text-black q-mb-md">
      DETALHES DA CRIPTOMOEDA
    </div>

    <q-separator class="q-my-md" />

    <!-- Exibição do loading -->
    <div v-if="loading" class="q-gutter-y-md q-mt-md">
      <q-skeleton height="50px" />
      <q-skeleton height="50px" />
      <q-skeleton height="50px" />
    </div>

    <!-- Banner caso não encontre a criptomoeda -->
    <q-banner
      v-if="!loading && !selectedCoin"
      class="bg-yellow-2 text-black"
    >
      Não foi possível encontrar os dados da criptomoeda.
    </q-banner>

    <!-- Exibição dos detalhes da criptomoeda selecionada -->
    <div v-if="selectedCoin">
      <!-- Cabeçalho com informações básicas -->
      <q-card class="q-mb-md">
        <q-card-section class="row items-center">
          <q-avatar size="xl" class="q-mr-md">
            <img :src="selectedCoin.image_url" />
          </q-avatar>
          <div>
            <div class="text-h4 text-weight-bold text-black">{{ selectedCoin.name }} ({{ selectedCoin.symbol }})</div>
            <div class="text-subtitle1 text-black">Rank #{{ selectedCoin.rank }}</div>
            <div class="text-caption text-grey-8">Lançado {{ selectedCoin.launched_at }}</div>
          </div>
        </q-card-section>
        
        <q-card-section>
          <div class="text-body1 text-black">{{ selectedCoin.description }}</div>
        </q-card-section>
      </q-card>

      <!-- Informações de preço e mercado -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Preço atual -->
        <div class="col-md-4 col-sm-6 col-xs-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-black">Preço Atual</div>
              <div class="text-h4 text-weight-bold text-black">
                {{ selectedCoin.latest_price.amount.amount }} {{ selectedCoin.latest_price.amount.currency }}
              </div>
              <div :class="selectedCoin.percent_change >= 0 ? 'text-green' : 'text-red'">
                {{ selectedCoin.percent_change >= 0 ? '+' : '' }}{{ (selectedCoin.percent_change * 100).toFixed(2) }}% (24h)
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Capitalização de mercado -->
        <div class="col-md-4 col-sm-6 col-xs-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-black">Capitalização de Mercado</div>
              <div class="text-h4 text-weight-bold text-black">
                ${{ parseFloat(selectedCoin.market_cap).toLocaleString() }}
              </div>
              <div class="text-caption text-grey-8">Dominância: {{ (parseFloat(selectedCoin.dominance) * 100).toFixed(2) }}%</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Volume e suprimento -->
        <div class="col-md-4 col-sm-6 col-xs-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-black">Volume (24h)</div>
              <div class="text-h4 text-weight-bold text-black">
                ${{ parseFloat(selectedCoin.volume_24h).toLocaleString() }}
              </div>
              <div class="text-caption text-grey-8 q-mt-sm">Suprimento Circulante: {{ parseFloat(selectedCoin.circulating_supply).toLocaleString() }} {{ selectedCoin.symbol }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Variação de preço -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-black">Variação de Preço</div>
          <div class="row">
            <div class="col-4" v-for="(value, period) in selectedCoin.latest_price.percent_change" :key="period">
              <div class="text-caption text-grey-8 text-capitalize">{{ period.replace('_', ' ') }}</div>
              <div :class="value >= 0 ? 'text-green' : 'text-red'">
                {{ value >= 0 ? '+' : '' }}{{ (value * 100).toFixed(2) }}%
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Links úteis -->
      <q-card>
        <q-card-section>
          <div class="text-h6 text-black">Links Úteis</div>
          <div class="row q-col-gutter-md">
            <div class="col-md-4 col-sm-6 col-xs-12" v-for="resource in selectedCoin.resource_urls" :key="resource.title">
              <q-card flat bordered>
                <q-card-section class="row items-center">
                  <q-avatar size="md" class="q-mr-sm">
                    <img :src="resource.icon_url" />
                  </q-avatar>
                  <div>
                    <div class="text-subtitle2 text-black">{{ resource.title }}</div>
                    <a :href="resource.link" target="_blank" class="text-caption text-primary text-black">{{ resource.link }}</a>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>



<style scoped>
.q-item {
  min-height: 100px;
}

.q-item:hover {
  background-color: #f8f9fa;
}

a {
  text-decoration: none;
  word-break: break-all;
  color: #000000 !important;
}

.text-black {
  color: #000000;
}

.text-grey-8 {
  color: #616161;
}
</style>