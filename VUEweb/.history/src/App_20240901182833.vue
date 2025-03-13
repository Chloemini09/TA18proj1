<template>
  <div class="main-container">
    <!-- Conditionally render the header -->
    <header v-if="showHeader">
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

    <!-- About View button -->
    <button class="about-view-button" @click="goToAbout">About View</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true');
const router = useRouter();
const route = useRoute();

// Control header visibility based on the route
const showHeader = ref(route.path !== '/');

watch(route, () => {
  if (!isAuthenticated.value && route.path === '/home') {
    router.push('/');
  }
  // Update header visibility based on the route
  showHeader.value = route.path !== '/';
});

function logout() {
  localStorage.removeItem('isAuthenticated');
  isAuthenticated.value = false;
  router.push('/');
}

function goToAbout() {
  router.push('/about');
}
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

.about-view-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ffcc00; /* Yellow */
  color: #333;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  font-family: 'Nerko One', cursive;
}

.about-view-button:hover {
  background-color: #ffb700; /* Darker Yellow on Hover */
}
</style>
