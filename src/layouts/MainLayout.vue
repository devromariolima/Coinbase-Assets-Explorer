<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import AnimatedBackground from '../components/AnimatedBackground.vue'

interface Props {
  showHeader?: boolean
  showFooter?: boolean
  showMenuButton?: boolean
  showFavorites?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: true,
  showMenuButton: true,
  showFavorites: true
})

const $q = useQuasar()
const route = useRoute()

const leftDrawerOpen = ref(false)
const globalLoading = ref(false)
const backgroundIntensity = ref(3)

const currentYear = computed(() => new Date().getFullYear())
const lastUpdateTime = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})


watch(
  () => route.fullPath,
  () => {
    if ($q.screen.lt.md) {
      leftDrawerOpen.value = false
    }
  }
)

</script>

<template>
  <q-layout view="hHh lpR fFf">
    <AnimatedBackground 
      class="animated-background"
      :intensity="backgroundIntensity"
    />
    
    <q-header
      v-if="showHeader"
      elevated
      class="bg-primary text-white"
      style="z-index: 2000;"
    >
      <q-toolbar>       
        <q-toolbar-title>
          <q-icon name="currency_bitcoin" class="q-mr-sm" />
          Crypto Explorer
        </q-toolbar-title>
    
      </q-toolbar>
    </q-header>

    <q-page-container class="page-container">
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        mode="out-in"
        :duration="300"
      >
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </transition>
    </q-page-container>

    <q-footer v-if="showFooter" bordered class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title class="text-caption">
          <div class="row items-center justify-between full-width">
            <div>
              Crypto Explorer &copy; {{ currentYear }} - Dados fornecidos por Coinbase API
            </div>
            <div class="text-grey-5">
              Última atualização: {{ lastUpdateTime }}
            </div>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

    <q-inner-loading
      :showing="globalLoading"
      label="Carregando..."
      label-class="text-primary"
      label-style="font-size: 1.1em"
    />
  </q-layout>
</template>

<style scoped>
.page-container {
  position: relative;
  z-index: 1000;
  min-height: calc(100vh - 50px - 40px);
}

.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; 
  pointer-events: none;
}

:deep(.fadeIn) {
  animation-duration: 0.3s;
}

:deep(.fadeOut) {
  animation-duration: 0.2s;
}

@media (max-width: 600px) {
  .page-container {
    padding: 8px;
    min-height: calc(100vh - 50px);
  }
  
  :deep(.q-drawer) {
    width: 100% !important;
  }
}

:deep(.q-dark) .q-header {
  background-color: #1e1e1e !important;
}

:deep(.q-dark) .q-footer {
  background-color: #121212 !important;
}
</style>