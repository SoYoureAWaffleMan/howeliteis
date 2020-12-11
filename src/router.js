import { createRouter, createWebHistory } from 'vue-router'
import Organ from './views/Organ.vue'

const routes = [
  {
    path: '/',
    name: 'Organ',
    component: Organ
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
