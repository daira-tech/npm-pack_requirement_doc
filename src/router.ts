import { createRouter, createWebHistory, type Router } from 'vue-router'
import CatalogView from './catalog/CatalogView.vue'
import ReqPageView from './views/ReqPageView.vue'
import ColorsView from './colors/ColorsView.vue'

export function createAppRouter(): Router {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: '/catalog' },
      { path: '/catalog', name: 'catalog', component: CatalogView },
      { path: '/colors', name: 'colors', component: ColorsView },
      {
        path: '/components/:name/:ver?',
        name: 'component',
        component: ReqPageView,
        props: (route) => ({
          kind: 'component',
          name: route.params.name,
          ver: route.params.ver,
        }),
      },
      {
        path: '/pages/:name/:ver?',
        name: 'page',
        component: ReqPageView,
        props: (route) => ({
          kind: 'page',
          name: route.params.name,
          ver: route.params.ver,
        }),
      },
    ],
  })
}
