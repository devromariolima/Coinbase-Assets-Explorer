import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/cryptocurrencies' // Redireciona para a lista por padrão
  },
  {
    path: '/cryptocurrencies',
    component: () => import('../components/CryptoList.vue'),
    name: 'cryptocurrencies.listar'
  },
  {
    path: '/cryptocurrencies/:symbol',
    component: () => import('../components/CryptoListDetails.vue'),
    name: 'cryptocurrencies.details',
    props: true // Isso permite passar os parâmetros da rota como props
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/cryptocurrencies' // Redireciona para a lista se a rota não existir
  }
]

export default routes