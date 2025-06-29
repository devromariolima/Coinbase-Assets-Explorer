import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/cryptocurrencies',
    component: () => import('../App.vue'),
    children: [
      {
        path: '',
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
    // component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
