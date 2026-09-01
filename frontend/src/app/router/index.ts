import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

export type ModuleId = 'armarium' | 'turris' | 'collegium'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/app/pages/HomeView.vue'),
  },
  {
    path: '/armarium',
    component: () => import('@/shared/components/ModuleLayout.vue'),
    meta: { module: 'armarium' },
    children: [
      {
        path: '',
        name: 'armarium',
        component: () => import('@/features/armarium/views/ArmariumView.vue'),
      },
      {
        path: 'entities',
        name: 'armarium-entities',
        component: () => import('@/features/armarium/views/AnomaliesView.vue'),
      },
      {
        path: 'spaces',
        name: 'armarium-spaces',
        component: () => import('@/features/armarium/views/SpacesView.vue'),
      },
      {
        path: 'books',
        name: 'armarium-books',
        component: () => import('@/features/armarium/views/BooksView.vue'),
      },
      {
        path: 'repositories',
        name: 'armarium-repositories',
        component: () => import('@/features/armarium/views/RepositoriesView.vue'),
      },
    ],
  },
  {
    path: '/turris',
    component: () => import('@/shared/components/ModuleLayout.vue'),
    meta: { module: 'turris' },
    children: [
      {
        path: '',
        name: 'turris',
        component: () => import('@/features/turris/views/TurrisView.vue'),
      },
      {
        path: 'floors',
        name: 'turris-floors',
        component: () => import('@/features/turris/views/FloorsView.vue'),
      },
      {
        path: 'dictionary',
        name: 'turris-dictionary',
        component: () => import('@/features/turris/views/TermsView.vue'),
      },
      {
        path: 'invitations',
        name: 'turris-invitations',
        component: () => import('@/features/turris/views/InvitationsView.vue'),
      },
    ],
  },
  {
    path: '/armarium/project/pvz',
    component: () => import('@/features/armarium/projects/pvzwiki/PvzProjectView.vue'),
    children: [
      { path: '', redirect: '/armarium/project/pvz/plants' },
      {
        path: 'plants',
        name: 'armarium-project-pvz-plants',
        component: () => import('@/features/armarium/projects/pvzwiki/views/AlmanacPage.vue'),
      },
      {
        path: 'plants/:codename',
        name: 'armarium-project-pvz-plant-detail',
        component: () => import('@/features/armarium/projects/pvzwiki/views/PlantDetailPage.vue'),
      },
      {
        path: 'zombies',
        name: 'armarium-project-pvz-zombies',
        component: () => import('@/features/armarium/projects/pvzwiki/views/AlmanacPage.vue'),
      },
    ],
  },
  {
    path: '/armarium/project/:projectId',
    name: 'armarium-project-spa',
    component: () => import('@/features/armarium/views/ProjectView.vue'),
  },
  {
    path: '/collegium',
    component: () => import('@/shared/components/ModuleLayout.vue'),
    meta: { module: 'collegium' },
    children: [
      {
        path: '',
        name: 'collegium',
        component: () => import('@/features/collegium/views/CollegiumView.vue'),
      },
      {
        path: 'explorers',
        name: 'collegium-explorers',
        component: () => import('@/features/collegium/views/ExplorersView.vue'),
      },
      {
        path: 'packs',
        name: 'collegium-packs',
        component: () => import('@/features/collegium/views/PagePacksView.vue'),
      },
      {
        path: 'railway',
        name: 'collegium-railway',
        component: () => import('@/features/collegium/views/RailwayView.vue'),
      },
    ],
  },
  {
    path: '/director',
    name: 'director',
    component: () => import('@/app/pages/DirectorView.vue'),
  },
  {
    path: '/factions',
    name: 'factions',
    component: () => import('@/app/pages/FactionsView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/app/pages/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // SPA 跳转默认回到页面顶部；浏览器前进/后退保留原滚动位置
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
