<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// import { useRouter } from 'vue-router'
import { useCryptocurrenciesStore } from './store/cryptocurrencies-Store'
import type BitcoinData from './types/Coinbase'
// import { useNotify } from 'src/composables/useNotify'

const loading = ref<boolean>(true)
const useStore = useCryptocurrenciesStore()
const coinbaseList = computed(() => useStore.Coinbase)

async function getData () {
  try {
    loading.value = true // Começa a carregar
    await useStore.GetCryptocurrencies()
  } catch (error) {
    if (error instanceof Error) {
      // notify.error(error.message ?? 'Erro ao buscar produtos')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => getData())
</script>

<template>
   <q-layout>
       <q-page-container>
  <q-page padding>
    <div class="text-h6 text-weight-medium row">
      <div class="col-10">
        GERENCIAR CRIPTOMOEDAS
      </div>
    </div>

    <q-separator class="q-my-md" />
<q-list
 q-list
  v-if="!loading && coinbaseList.length > 0"
  bordered
  separator
  class="q-mt-md rounded-borders"
>
  <q-item
    v-for="coin in coinbaseList"
    :key="coin.id"
  >
    <q-item-section>
      <q-item-label>{{ coin.name }}</q-item-label>
    </q-item-section>
  </q-item>
</q-list>

    <div
      v-if="loading"
      class="q-gutter-y-md q-mt-md"
    >
      <q-skeleton height="45px" />
      <q-skeleton height="45px" />
      <q-skeleton height="45px" />
    </div>

    <div v-if="!loading && !useStore.Coinbase">
      Não foram encontrados produtos cadastrados.
    </div>
  </q-page>
   </q-page-container>
  </q-layout>
</template>

<style scoped>

</style>
