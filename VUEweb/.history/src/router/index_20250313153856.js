import { createRouter, createWebHistory } from 'vue-router';
import { getAuth} from 'firebase/auth';

import WelcomeView from '../views/WelcomeView.vue';

import Recommendation from '@/views/Recommendation.vue';
import Visualisation from '@/views/VIsualisation.vue';
const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomeView,
    meta: { requiresAuth: false },
  },
  {
    path: '/recommendation',
    name: 'Recommendation',
    component: Recommendation,
    meta: { requiresAuth: false },
  },
  {
    path: '/visualisation',
    name: 'Visualisation',
    component: Visualisation,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  const currentUser = auth.currentUser;

  if (requiresAuth && !currentUser) {
    alert('Please log in to access this page.');
    next('/login');
  } else {
    next();
  }
});

export default router;
