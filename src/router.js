import Vue from 'vue'
import App from './App'
import Bar from './components/Bar'
import Display from './components/Display'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

/* eslint-disable no-new */
const router = new VueRouter({
  transitionOnLoad: true
})

router.map({
  '/': {
    name: 'App',
    component: App,
    subRoutes: {
      '/display': {
        name: 'Display',
        component: Display
      },
      '/bar': {
        name: 'Bar',
        component: Bar
      }
    }
  }
})

export default router
