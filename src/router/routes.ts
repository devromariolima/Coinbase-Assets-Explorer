import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/cryptocurrencies'
      },
      {
        path: 'cryptocurrencies',
        name: 'cryptocurrencies',
        children: [
          {
            path: '',
            component: () => import('../components/CryptoList.vue'),
            name: 'cryptocurrencies.list'
          },
          {
            path: ':symbol',
            component: () => import('../components/CryptoListDetails.vue'),
            name: 'cryptocurrencies.details',
            props: true
          }
        ]
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/cryptocurrencies'
  }
]

export default routes