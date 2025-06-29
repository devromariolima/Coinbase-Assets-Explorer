<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCryptocurrenciesStore } from '../store/cryptocurrencies-Store'

const loading = ref<boolean>(true)
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
</script>

<template>
  <div class="q-pa-md">
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
        >
          <q-item-section avatar>
            <q-avatar size="md" color="grey-4">
              <img 
                :src="coin.image_url" 
                v-if="coin.image_url" 
                style="width: 70px; height: 70px; object-fit: contain"
              >
              <q-icon v-else name="payments" color="grey-7" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label class="text-weight-medium text-dark">{{ coin.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-if="loading" class="q-gutter-y-md q-mt-md">
        <q-skeleton height="50px" />
        <q-skeleton height="50px" />
        <q-skeleton height="50px" />
      </div>

      <q-banner
        v-if="!loading && coinbaseList.length === 0"
        class="bg-yellow-2 text-dark"
      >
        Não foram encontradas criptomoedas.
      </q-banner>
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
