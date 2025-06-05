import { createApp } from 'vue'
import App from './src/App.vue'
import { Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

const app = createApp(App)

app.use(Quasar, {
  plugins: {}, 
  config: {

  }
})

app.mount('#app')