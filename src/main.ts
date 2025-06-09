import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'

// Importe os ícones e estilos do Quasar
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import './style.css'
import App from './App.vue'

// Crie e configure o app Vue
const app = createApp(App)
const pinia = createPinia()

// Use o Pinia
app.use(pinia)

// Use o Quasar
app.use(Quasar, {
  plugins: {}, // Adicione plugins do Quasar aqui se necessário
  config: {
    // Configurações do Quasar
  }
})

// Monte o app (note que você tinha uma linha duplicada)
app.mount('#app')