
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCryptocurrenciesStore } from '../store/cryptocurrencies-Store'
import { CryptoCurrency } from '../'  // Importe a interface corretamente

const loading = ref<boolean>(true)
const selectedCoin = ref<CryptoCurrency | null>(null)
const useStore = useCryptocurrenciesStore()

const coinbaseList = computed(() => useStore.Coinbase)

async function getData () {
  try {
    loading.value = true 
    await useStore.GetCryptocurrencies()
  } catch (error) {
    if (error instanceof Error) {
      // notify.error(error.message ?? 'Erro ao buscar criptomoedas')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => getData())

const selectCoin = (coin: CryptoCurrency) => {
  selectedCoin.value = coin
}

watch(selectedCoin, (newCoin) => {
  if (newCoin) {
    // Executa algo sempre que uma nova moeda for selecionada
  }
})
</script>

<template>
  <div class="q-pa-md">
    <!-- Cabeçalho e botão de atualização -->
    <div class="text-h5 text-weight-bold text-dark q-mb-md">
      GERENCIAR CRIPTOMOEDAS
      <q-btn
        class="float-right"
        icon="refresh"
        label="Atualizar"
        color="primary"
        @click="getData()"
      />
    </div>

    <q-separator class="q-my-md" />

    <!-- Exibição da lista de criptomoedas -->
    <q-card flat class="bg-white">
      <q-list
        v-if="!loading && coinbaseList.length > 0"
        bordered
        separator
      >
        <q-item
          v-for="coin in coinbaseList"
          :key="coin.id"
          class="q-py-sm"
          @click="selectCoin(coin)"
        >
          <q-item-section avatar>
            <q-avatar size="md" color="grey-4">
              <img 
                :src="coin.image_url" 
                v-if="coin.image_url" 
                style="width: 70px; height: 70px; object-fit: contain"
              />
              <q-icon v-else name="payments" color="grey-7" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label class="text-weight-medium text-dark">{{ coin.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Exibição do loading -->
      <div v-if="loading" class="q-gutter-y-md q-mt-md">
        <q-skeleton height="50px" />
        <q-skeleton height="50px" />
        <q-skeleton height="50px" />
      </div>

      <!-- Banner caso não encontre criptomoedas -->
      <q-banner
        v-if="!loading && coinbaseList.length === 0"
        class="bg-yellow-2 text-dark"
      >
        Não foram encontradas criptomoedas.
      </q-banner>
    </q-card>

    <!-- Exibição dos detalhes da criptomoeda selecionada -->
    <q-card v-if="selectedCoin" class="q-mt-md">
      <q-card-section>
        <div class="text-h6 text-weight-bold">{{ selectedCoin.name }}</div>
        <q-avatar size="lg" class="q-mb-md">
          <img :src="selectedCoin.image_url" />
        </q-avatar>
        <div class="text-body1">{{ selectedCoin.description }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div><strong>Preço Atual:</strong> {{ selectedCoin.latest_price.amount.amount }} {{ selectedCoin.latest_price.amount.currency }}</div>
        <div><strong>Cap. de Mercado:</strong> {{ selectedCoin.market_cap | currency }}</div>
        <div><strong>Volume 24h:</strong> {{ selectedCoin.volume_24h | currency }}</div>
        <div><strong>Fornecimento Circulante:</strong> {{ selectedCoin.circulating_supply | currency }}</div>
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
