<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import AnimatedBackground from '../components/AnimatedBackground.vue'

interface Props {
  showHeader?: boolean
  showFooter?: boolean
  showMenuButton?: boolean
  showFavorites?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showFooter: true,
  showMenuButton: true,
  showFavorites: true
})

// Inicialização
const $q = useQuasar()
const route = useRoute()

// Estados
const leftDrawerOpen = ref(false)
const darkMode = ref($q.dark.isActive)
const globalLoading = ref(false)
const refreshing = ref(false)
const backgroundIntensity = ref(3)
const favoritesCount = ref(0)

const currentYear = computed(() => new Date().getFullYear())
const lastUpdateTime = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleDarkMode(value: boolean) {
  $q.dark.set(value)
  localStorage.setItem('darkMode', value.toString())
}

function refreshData() {
  refreshing.value = true
  window.dispatchEvent(new CustomEvent('refresh-crypto-data'))
  setTimeout(() => {
    refreshing.value = false
    $q.notify({
      type: 'positive',
      message: 'Dados atualizados com sucesso!',
      position: 'top',
      timeout: 2000
    })
  }, 1500)
}

function openSettings() {
  leftDrawerOpen.value = true
}

// Watchers
watch(
  () => route.fullPath,
  () => {
    if ($q.screen.lt.md) {
      leftDrawerOpen.value = false
    }
  }
)

// Lifecycle Hooks
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    darkMode.value = savedDarkMode === 'true'
    $q.dark.set(darkMode.value)
  }

  window.addEventListener('show-global-loading', () => {
    globalLoading.value = true
  })

  window.addEventListener('hide-global-loading', () => {
    globalLoading.value = false
  })

  setTimeout(() => {
    favoritesCount.value = 5
  }, 1000)
})
</script>

<!-- src/layouts/MainLayout.vue -->
<template>
  <q-layout view="hHh lpR fFf">
    <!-- Animated Background para todas as páginas -->
    <AnimatedBackground 
      class="animated-background"
      :intensity="backgroundIntensity"
    />
    
    <!-- Header (opcional, se precisar de cabeçalho fixo) -->
    <q-header
      v-if="showHeader"
      elevated
      class="bg-primary text-white"
      style="z-index: 2000;"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          v-if="showMenuButton"
        />
        
        <q-toolbar-title>
          <q-icon name="currency_bitcoin" class="q-mr-sm" />
          Crypto Explorer
        </q-toolbar-title>
        
        <!-- Espaço para ações do header -->
        <div class="q-gutter-sm row items-center">
          <q-btn
            flat
            round
            dense
            icon="refresh"
            @click="refreshData"
            :loading="refreshing"
          >
            <q-tooltip>Atualizar dados</q-tooltip>
          </q-btn>
          
          <q-btn
            flat
            round
            dense
            icon="settings"
            @click="openSettings"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- Drawer/Navegação Lateral (opcional) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :breakpoint="700"
      class="bg-grey-1"
      style="z-index: 2001;"
    >
      <q-scroll-area class="fit">
        <q-list padding class="text-primary">
          <q-item-label header class="text-weight-bold">
            Navegação
          </q-item-label>
          
          <q-item
            clickable
            v-ripple
            :to="{ name: 'cryptocurrencies.list' }"
            exact
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="list" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Lista de Criptomoedas</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item
            clickable
            v-ripple
            :to="{ name: 'favorites' }"
            v-if="showFavorites"
          >
            <q-item-section avatar>
              <q-icon name="star" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Favoritos</q-item-label>
              <q-item-label caption>{{ favoritesCount }} moedas</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-separator class="q-my-md" />
          
          <q-item-label header class="text-weight-bold">
            Configurações
          </q-item-label>
          
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Background Animado</q-item-label>
              <q-item-label caption>Intensidade dos efeitos</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-slider
                v-model="backgroundIntensity"
                :min="1"
                :max="10"
                :step="1"
                label
                label-always
                color="primary"
                style="width: 100px;"
              />
            </q-item-section>
          </q-item>
          
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>Modo Escuro</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="darkMode"
                color="primary"
                @update:model-value="toggleDarkMode"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Área Principal de Conteúdo -->
    <q-page-container class="page-container">
      <!-- Transição suave entre páginas -->
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

    <!-- Footer (opcional) -->
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

    <!-- Loading Global (opcional) -->
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