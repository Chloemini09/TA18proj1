import { createRouter, createWebHistory } from 'vue-router';
import AboutView from '../views/AboutView.vue';
import Recommendation from '@/views/Recommendation.vue';
import Visualisation from '@/views/Visualisation.vue';

const routes = [
  {
    path: '/',
    name: 'Recommendation',
    component: Recommendation,
  },
  {
    path: '/visualisation',
    name: 'Visualisation',
    component: Visualisation,
    meta: { requiresAuth: false },
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 移除了 Firebase 身份验证检查
// 如果你仍然需要某种身份验证逻辑，可以在这里实现一个替代方案
// 例如使用本地存储或其他身份验证服务

router.beforeEach((to, from, next) => {
  // 由于不再使用 Firebase，暂时移除了身份验证检查
  // 所有路由都会直接通过
  next();
  
  // 如果将来需要实现自定义身份验证，可以在这里添加逻辑
  // const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // if (requiresAuth && !userIsAuthenticated()) {
  //   alert('Please log in to access this page.');
  //   next('/login');
  // } else {
  //   next();
  // }
});

export default router;