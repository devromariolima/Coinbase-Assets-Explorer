<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCryptocurrenciesStore } from '../store/cryptocurrencies-Store'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const searchQuery = ref('')
const store = useCryptocurrenciesStore()
const coinbaseList = computed(() => store.Coinbase)

// Função de filtro corrigida e otimizada
const filteredCoins = computed(() => {
  if (!searchQuery.value) return coinbaseList.value
  
  const query = searchQuery.value.toLowerCase()
  return coinbaseList.value.filter(coin => 
    coin.name.toLowerCase().includes(query) || 
    coin.symbol.toLowerCase().includes(query)
  )
})

async function getData() {
  try {
    loading.value = true
    await store.GetCryptocurrencies()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
  <q-page padding class="bg-grey-2 justify-center" style="min-height: 100vh;">
    <div class="col-12 col-md-8 col-lg-6">
      <div class="text-h5 text-weight-bold text-black q-mb-md text-center">
        Coinbase Assets Explorer
      </div>

      <q-input
        v-model="searchQuery"
        filled
        label="Pesquisar por nome"
        class="q-mb-md"
        clearable
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-separator class="q-my-sm" />

      <q-list
        v-if="!loading && filteredCoins.length > 0"
        bordered
        separator
        class="rounded-borders bg-white shadow-1 q-mt-md"
      >
        <q-item
          v-for="coin in filteredCoins"
          :key="coin.id"
          clickable
          @click="() => router.push({ name: 'cryptocurrencies.details', params: { symbol: coin.symbol } })"
          class="q-py-md"
        >
          <q-item-section avatar>
            <q-avatar rounded size="50px">
              <img
                v-if="coin.image_url"
                :src="coin.image_url"
                style="object-fit: contain"
              />
              <q-icon v-else name="payments" color="grey-6" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold text-black">
              {{ coin.name }}
            </q-item-label>
            <q-item-label caption class="text-grey-7">
              {{ coin.symbol }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="chevron_right" color="grey-6" />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Estados de loading e empty -->
      <div v-if="loading" class="q-gutter-y-md q-mt-md">
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
        <q-skeleton height="60px" />
      </div>

      <div v-if="!loading && coinbaseList.length === 0" class="text-grey-7 q-mt-md text-center">
        Nenhuma criptomoeda encontrada.
      </div>

      <div v-if="!loading && coinbaseList.length > 0 && filteredCoins.length === 0" class="text-grey-7 q-mt-md text-center">
        Nenhuma criptomoeda encontrada com o termo "{{ searchQuery }}".
      </div>
    </div>
  </q-page>
</template>
