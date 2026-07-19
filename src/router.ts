import { createRouter, createWebHistory, type Router } from 'vue-router'
import CatalogView from './catalog/CatalogView.vue'
import ReqPageView from './views/ReqPageView.vue'
import DocView from './views/DocView.vue'
import ColorsView from './colors/ColorsView.vue'
import PrintView from './print/PrintView.vue'

export function createAppRouter(): Router {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', redirect: '/catalog' },
      { path: '/catalog', name: 'catalog', component: CatalogView },
      { path: '/docs/:name', name: 'doc', component: DocView },
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
      { path: '/print/all', name: 'print-all', component: PrintView, props: { scope: 'all' } },
      {
        path: '/print/components/:name',
        name: 'print-component',
        component: PrintView,
        props: (route) => ({ scope: 'item', kind: 'component', name: route.params.name }),
      },
      {
        path: '/print/pages/:name',
        name: 'print-page',
        component: PrintView,
        props: (route) => ({ scope: 'item', kind: 'page', name: route.params.name }),
      },
      {
        path: '/print/docs/:name',
        name: 'print-doc',
        component: PrintView,
        props: (route) => ({ scope: 'document', name: route.params.name }),
      },
    ],
  })
}
