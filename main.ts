import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import { QBtn, QPage, QSeparator } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './style.css'
import App from './src/App.vue'

// Crie a aplicação
const app = createApp(App)

// Configure o Quasar com auto-import de componentes
app.use(Quasar, {
  plugins: {},
  config: {},
  components: {
    QBtn,
    QPage,
    QSeparator
    // Adicione outros componentes que está usando
  }
})

// Use o Pinia
app.use(createPinia())

// Monte a aplicação
app.mount('#app')