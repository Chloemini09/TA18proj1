<template>
  <div class="main-container">
    <header>
      <BHeader />
      <nav>
        <router-link to="/">Welcome</router-link>
        <router-link to="/home" v-if="isAuthenticated">Home</router-link>
        <router-link to="/login" v-else>Login</router-link>
        <button v-if="isAuthenticated" @click="logout">Logout</button>
      </nav>
    </header>
    <main class="main-box">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true');
const router = useRouter();
const route = useRoute();

function logout() {
  localStorage.removeItem('isAuthenticated');
  isAuthenticated.value = false;
  router.push('/');
}

// 如果用户未认证且尝试访问 /home，将其重定向到 Welcome 页面
watch(route, (newRoute) => {
  if (!isAuthenticated.value && newRoute.path === '/home') {
    router.push('/');
  }
});
</script>f

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