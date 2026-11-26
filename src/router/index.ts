import GameSettings from '../components/gamesettings/GameSettings.vue'
import MainMenu from '../components/mainmenu/MainMenu.vue'
import Result from '../components/screens/Result.vue'
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'MainMenu',
    component: MainMenu
  },
  {
    path: '/settings',
    name: 'settings',
    component: GameSettings
  },
  {
    path: '/gameplay',
    name: 'gameplay',
    // Phaser solo se descarga al empezar la partida
    component: () => import('../components/gameplay/Gameplay.vue')
  },
  {
    path: '/result',
    name: 'result',
    component: Result
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
