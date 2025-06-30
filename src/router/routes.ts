import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/cryptocurrencies'
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
    props: true
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/cryptocurrencies'
  }
]

export default routes