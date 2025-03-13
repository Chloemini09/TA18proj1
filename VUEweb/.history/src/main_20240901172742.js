// import './assets/main.css'
// import '@/assets/style.css'
import 'bootstrap/dist/css/bootstrap.min.css'


import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      next('/');
    } else if (to.path === '/' && isAuthenticated) {
      const userRole = localStorage.getItem('userRole');
      next(userRole === 'admin' ? '/admin' : '/home');
    } else {
      next();
    }
  });

// import DataTable from 'primevue/datatable'
// import Column from 'primevue/Column'

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')
