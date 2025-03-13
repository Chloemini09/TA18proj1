<template>
  <div class="main-container">
    <main class="main-box">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true');
const router = useRouter();

function logout() {
  localStorage.removeItem('isAuthenticated');
  isAuthenticated.value = false;
  router.push('/');
}

// Check if the user is authenticated, and if not, ensure that the user cannot access pages that require authentication
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login'); // If the user is not authenticated, redirect to the login page
  } else {
    next(); // Otherwise, keep navigating.
  }
});
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  gap: 1rem;
}

.main-box {
  flex-grow: 1;
  padding: 2rem;
  background-color: #ffffff;
}
</style>
