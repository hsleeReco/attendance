import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/remote-work/request',
      name: 'remote-work-request',
      component: () => import('@/views/RemoteWorkRequestView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/leave/request',
      name: 'leave-request',
      component: () => import('@/views/LeaveRequestView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  await authStore.getSession()

  if (to.meta.requiresAuth && !authStore.user) {
    next('/')
  } else if (!to.meta.requiresAuth && authStore.user) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
