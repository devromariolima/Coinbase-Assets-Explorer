import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../App.vue'),
    children: [
      {
        path: '/cryptocurrencies',
        component: () => import('../components/CryptoList.vue'),
        name: 'cryptocurrencies.listar'
      },
      {
        path: '/cryptocurrencies/visualizar/:symbol',
        component: () => import('../components/CryptoListDetails.vue'),
        name: 'cryptocurrencies.details'
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../App.vue')
  }
]

export default routes
