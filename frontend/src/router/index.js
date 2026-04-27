import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/video-tools',
    name: 'VideoTools',
    component: () => import('../views/VideoTools.vue')
  },
  {
    path: '/pdf-tools',
    name: 'PdfTools',
    component: () => import('../views/PdfTools.vue')
  },
  {
    path: '/converters',
    name: 'Converters',
    component: () => import('../views/Converters.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
