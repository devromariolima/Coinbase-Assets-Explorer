import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../App.vue'),
    children: [
      {
        path: '/cryptocurrencies',
        component: () => import('../App.vue'),
        name: 'cryptocurrencies.listar'
      },
    //   {
    //     path: '/cryptocurrencies/visualizar/:id',
    //     component: () => import(''),
    //     name: 'cryptocurrencies.editar'
    //   }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../App.vue')
  }
]

export default routes
