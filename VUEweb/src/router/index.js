import { createRouter, createWebHistory } from 'vue-router';
import Recommendation from '@/views/Recommendation.vue';
import Visualisation from '@/views/Visualisation.vue';
import HomeView from '../views/HomeView.vue';
import Clothing from '@/views/Clothing.vue';
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/clothing',
    name: 'Clothing',
    component: Clothing,
  },
  {
    path: '/recommendation',
    name: 'Recommendation',
    component: Recommendation,
  },
  {
    path: '/visualisation',
    name: 'Visualisation',
    component: Visualisation,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from, next) => {
  next();

});

export default router;