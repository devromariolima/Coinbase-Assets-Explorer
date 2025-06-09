<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import { useRouter } from 'vue-router'
import { useCryptocurrenciesStore } from './store/cryptocurrencies-Store'
// import { useNotify } from 'src/composables/useNotify'

const loading = ref<boolean>(true)
const useStore = useCryptocurrenciesStore()
// const router = useRouter()
// const notify = useNotify()

async function getData () {
  try {
    await useStore.GetCryptocurrencies()
    loading.value = true
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
  <q-page padding>
    <div class="text-h6 text-weight-medium row">
      <div class="col-10">
        GERENCIAR PRODUTOS
      </div>
      <div class="col-2">
        <q-btn
          class="float-right"
          icon="add"
          label="Cadastrar"
          color="primary"
        />
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- <q-list
      v-if="!loading && store.produtos"
      bordered
      separator
      class="q-mt-md rounded-borders"
    >
      <q-item
        v-for="item in store.produtos"
        :key="item.id"
        clickable
        @click="() => router.push({ name: 'produtos.editar', params: { id: item.id } })"
      >
        <q-item-section>
          <q-item-label>{{ item.nome.toUpperCase() }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list> -->

    <!-- <div
      v-if="loading"
      class="q-gutter-y-md q-mt-md"
    >
      <q-skeleton height="45px" />
      <q-skeleton height="45px" />
      <q-skeleton height="45px" />
    </div> -->
<!-- 
    <div v-if="!loading && !store.produtos">
      Não foram encontrados produtos cadastrados.
    </div> -->
  </q-page>
</template>

<style scoped>

</style>
