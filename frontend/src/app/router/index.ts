import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRecentPageTracking } from '@/app/services/recentPages'
import { loadUiVersion } from '@/app/theme'

export type ModuleId = 'armarium' | 'turris' | 'collegium'

// 界面版本在模块加载时读一次（切版本会整页 reload，路由表随之重新生成）。
// 迎书楼按版本选外壳与子组件：旧版 = ModuleLayout + views/ 旧组件，新版 = MoltenLayout + molten/ 新组件。
const isLegacyUi = loadUiVersion() === 'legacy'

const turrisLayout = isLegacyUi
  ? () => import('@/shared/components/ModuleLayout.vue')
  : () => import('@/features/turris/molten/MoltenLayout.vue')
const turrisOverview = isLegacyUi
  ? () => import('@/features/turris/views/TurrisOverviewView.vue')
  : () => import('@/features/turris/molten/MoltenOverviewView.vue')
const turrisFloors = isLegacyUi
  ? () => import('@/features/turris/views/FloorsView.vue')
  : () => import('@/features/turris/molten/MoltenFloorsView.vue')
const turrisTerms = isLegacyUi
  ? () => import('@/features/turris/views/TermsView.vue')
  : () => import('@/features/turris/molten/MoltenTermsView.vue')
const turrisSystems = isLegacyUi
  ? () => import('@/features/turris/views/SystemsView.vue')
  : () => import('@/features/turris/molten/MoltenSystemsView.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/app/pages/HomeView.vue'),
  },
  {
    // 旧版仪表盘（界面版本开关切到「旧版」时首页跳转到此）：
    // 与新版 HomeView.vue 并列，挂旧版 HomeViewV1 + 旧版子组件，供开发对照与回退。
    path: '/home-v1',
    name: 'home-v1',
    component: () => import('@/app/pages/HomeViewV1.vue'),
  },
  // 异常实体报告单整页（预览/编辑）：独立于 ModuleLayout——不带 page-header 与五 Tab，
  // 报告纸面与草稿双栏编辑器需要完整视口（2026-09-16 二次决议：顶栏 SiteNav 保留）。
  // 注意必须排在 '/armarium' 父路由之外（同级），静态段优先级不受影响。
  {
    path: '/armarium/entities/:id',
    name: 'armarium-entity-report',
    component: () => import('@/features/armarium/entities/EntityReportView.vue'),
  },
  {
    path: '/armarium/entities/:id/edit',
    name: 'armarium-entity-edit',
    component: () => import('@/features/armarium/entities/EntityEditView.vue'),
    // window.open 独立窗口：隐藏全站顶栏并解除 site-main 容器约束（App.vue 消费）
    meta: { chromeless: true },
  },
  {
    // 服务端 PDF 导出的无 UI 打印路由（后端无头浏览器加载）：chromeless + 零工具栏，
    // 分页完成信号 window.__PAPER_READY 由 EntityPrintView 发出。
    path: '/print/armarium/anomaly/:id',
    name: 'print-armarium-anomaly',
    component: () => import('@/features/armarium/entities/EntityPrintView.vue'),
    meta: { chromeless: true },
  },
  // 超自然空间报告单整页（预览/编辑/打印）：与异常实体报告单同一套布局约定。
  {
    path: '/armarium/spaces/:id',
    name: 'armarium-space-report',
    component: () => import('@/features/armarium/spaces/SpaceReportView.vue'),
  },
  {
    path: '/armarium/spaces/:id/edit',
    name: 'armarium-space-edit',
    component: () => import('@/features/armarium/spaces/SpaceEditView.vue'),
    // window.open 独立窗口：隐藏全站顶栏并解除 site-main 容器约束（App.vue 消费）
    meta: { chromeless: true },
  },
  {
    // 服务端 PDF 导出的无 UI 打印路由（后端无头浏览器加载）：
    // 分页完成信号 window.__PAPER_READY 由 SpacePrintView 发出。
    path: '/print/armarium/space/:id',
    name: 'print-armarium-space',
    component: () => import('@/features/armarium/spaces/SpacePrintView.vue'),
    meta: { chromeless: true },
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
        component: () => import('@/features/armarium/views/ArmariumView.vue'),
      },
      {
        path: 'spaces',
        name: 'armarium-spaces',
        component: () => import('@/features/armarium/views/ArmariumView.vue'),
      },
      {
        path: 'projects',
        name: 'armarium-projects',
        component: () => import('@/features/armarium/views/ArmariumView.vue'),
      },
      {
        path: 'librarians',
        name: 'armarium-librarians',
        component: () => import('@/features/armarium/views/ArmariumView.vue'),
      },
    ],
  },
  {
    path: '/turris/battle',
    name: 'turris-battle',
    component: () => import('@/features/turris/battle/BattleSimulatorView.vue'),
  },
  {
    path: '/turris',
    // 按界面版本选外壳：旧版走 ModuleLayout（旧组件），新版走 MoltenLayout（熔核战线）。
    component: turrisLayout,
    meta: { module: 'turris' },
    children: [
      {
        // 总览（方案 B 塔楼剖面，2026-09-22）：/turris 根路径即主页，
        // 原先"重定向到 /turris/floors"的旧形态已退役，楼层页独占「楼层」Tab。
        path: '',
        name: 'turris',
        component: turrisOverview,
      },
      {
        path: 'floors',
        name: 'turris-floors',
        component: turrisFloors,
      },
      {
        path: 'dictionary',
        name: 'turris-dictionary',
        component: turrisTerms,
      },
      {
        path: 'systems',
        name: 'turris-systems',
        component: turrisSystems,
      },
      {
        // 邀请函页目前新旧版共用同一组件（新版未做独立熔核版）。
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
    path: '/settings',
    name: 'settings',
    component: () => import('@/app/pages/SettingsView.vue'),
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
  // SPA 跳转默认回到页面顶部；浏览器前进/后退保留原滚动位置。
  // 同一路径仅 query 变化（如切楼层、切 tab）不滚动，避免视窗被强制拉回顶部。
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

// 最近足迹（主页右栏）：localStorage 记录，见 app/services/recentPages.ts
setupRecentPageTracking(router)

export default router
