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
    <div class="text-h5 text-weight-bold text-dark q-mb-md">
      DADOS DA CRIPTOMOEDA
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
      class="bg-yellow-2 text-dark"
    >
      Não foi possível encontrar os dados da criptomoeda.
    </q-banner>

    <!-- Exibição dos detalhes da criptomoeda selecionada -->
    <q-card v-if="selectedCoin" class="q-mt-md">
      <q-card-section>
        <div class="row items-center">
          <q-avatar size="lg" class="q-mr-md">
            <img :src="selectedCoin.image_url" />
          </q-avatar>
          <div class="text-h6 text-weight-bold">{{ selectedCoin.name }}</div>
        </div>
        <div class="text-body1 q-mt-md">{{ selectedCoin.description }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div><strong>Preço Atual:</strong> {{ selectedCoin.latest_price.amount.amount }} {{ selectedCoin.latest_price.amount.currency }}</div>
        <div><strong>Cap. de Mercado:</strong> {{ selectedCoin.market_cap  }}</div>
        <div><strong>Volume 24h:</strong> {{ selectedCoin.volume_24h  }}</div>
        <div><strong>Fornecimento Circulante:</strong> {{ selectedCoin.circulating_supply }}</div>
        <div><strong>Dominância:</strong> {{ selectedCoin.dominance }}%</div>
      </q-card-section>

      <q-separator />

      <!-- Mudanças de Preço -->
      <q-card-section>
        <div><strong>Alteração (última hora):</strong> {{ selectedCoin.latest_price.percent_change.hour }}%</div>
        <div><strong>Alteração (último dia):</strong> {{ selectedCoin.latest_price.percent_change.day }}%</div>
        <div><strong>Alteração (última semana):</strong> {{ selectedCoin.latest_price.percent_change.week }}%</div>
      </q-card-section>

      <!-- Links úteis -->
      <q-separator />
      <q-card-section>
        <div class="q-mb-md"><strong>Links úteis</strong></div>
        <q-list>
          <q-item v-for="resource in selectedCoin.resource_urls" :key="resource.title">
            <q-item-section>
              <q-item-label>{{ resource.title }}</q-item-label>
              <q-item-label><a :href="resource.link" target="_blank">{{ resource.link }}</a></q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.q-item {
  min-height: 100px;
}

.q-item:hover {
  background-color: #f8f9fa;
}
</style>