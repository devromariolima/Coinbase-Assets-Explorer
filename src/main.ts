import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { QBtn, QItem, QItemLabel, QItemSection, QLayout, QList, QPage, QPageContainer, QSeparator, QSkeleton, Quasar } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './style.css'
import App from './App.vue'
import routes from '../src/router/routes'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)

app.use(Quasar, {
  plugins: {},
  config: {},
 components: {
    QBtn: QBtn,
    QPage: QPage,
    QSeparator: QSeparator,
    QLayout: QLayout,
    QList: QList,
    QPageContainer: QPageContainer,
    QItem: QItem,
    QItemLabel: QItemLabel,
    QItemSection: QItemSection,
    QSkeleton: QSkeleton
  }
})

app.use(createPinia())

app.mount('#app')