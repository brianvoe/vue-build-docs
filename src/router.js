import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// Components
import home from './components/home.vue'
import gettingStarted from './components/getting-started.vue'
import development from './components/development.vue'
import production from './components/production.vue'
import unit from './components/unit-testing.vue'
import e2e from './components/e2e-testing.vue'
import env from './components/env.vue'
import webpack from './components/webpack.vue'
import library from './components/library.vue'
import structure from './components/structure.vue'

export default new VueRouter({
  mode: 'history',
  base: '/',
  linkActiveClass: 'active',
  routes: [
    { path: '/', component: home },
    { path: '/getting-started', component: gettingStarted },
    { path: '/development', component: development },
    { path: '/production', component: production },
    { path: '/unit-testing', component: unit },
    { path: '/e2e-testing', component: e2e },
    { path: '/env', component: env },
    { path: '/webpack', component: webpack },
    { path: '/library', component: library },
    { path: '/structure', component: structure }
  ]
})
