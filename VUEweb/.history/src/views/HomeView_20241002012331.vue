<template>
  <div class="home-container">
    <header class="home-header">
      <div class="header-left">
        <h1>Hi, {{ username }}</h1>
        <p class="tagline">Mending Minds, Healing Hearts</p>
      </div>
      <div class="header-right">
        <p class="date">{{ currentDate }}</p>
        <button @click="logout" class="btn-logout">Logout</button>
      </div>
    </header>

    <nav class="home-nav">
      <router-link to="/home" class="nav-item" :class="{ active: currentRoute === '/home' }">Home</router-link>
      <router-link to="/course" class="nav-item" :class="{ active: currentRoute === '/course' }">Courses</router-link>
      
      <!-- Diary dropdown with click effect -->
      <div class="dropdown">
        <button @click="toggleDiary" class="nav-item dropbtn" :class="{ active: isDiaryOpen }">Diary</button>
        <div v-if="isDiaryOpen" class="dropdown-content">
          <router-link to="/healthtest">TEST</router-link>
          <router-link to="/testHistory">TEST HISTORY</router-link>
          <router-link to="/averageScore">SCORES AND ADVICE</router-link>
          <router-link to="/diary">DIARY</router-link>
        </div>
      </div>

      <router-link to="/community" class="nav-item" :class="{ active: currentRoute === '/community' }">Community</router-link>
      <router-link to="/clinic" class="nav-item" :class="{ active: currentRoute === '/clinic' }">Clinic</router-link>
      <router-link to="/counselling" class="nav-item" :class="{ active: currentRoute === '/counselling' }">Counselling</router-link>
      <router-link to="/my" class="nav-item" :class="{ active: currentRoute === '/my' }">My</router-link>
    </nav>

    <!-- 其他内容部分 -->
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const auth = getAuth();
    const db = getFirestore();
    const username = ref('User');
    const currentDate = ref('');
    const isDiaryOpen = ref(false);

    const currentRoute = computed(() => route.path);

    function formatDate(date) {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }

    function logout() {
      auth.signOut().then(() => {
        router.push('/');
      }).catch((error) => {
        console.error("Error during logout:", error);
      });
    }

    function toggleDiary() {
      isDiaryOpen.value = !isDiaryOpen.value;
    }

    onMounted(async () => {
      const today = new Date();
      currentDate.value = formatDate(today);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          username.value = userDoc.data().username;
        } else {
          console.log("No such user document!");
        }
      } else {
        console.log("No user is logged in.");
        router.push('/login');
      }
    });

    return {
      username,
      currentDate,
      logout,
      isDiaryOpen,
      toggleDiary,
      currentRoute
    };
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1rem 2rem;
  background-color: #ffffff;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.home-header h1 {
  font-size: 2rem;
  color: #333;
}

.tagline {
  margin: 0;
  font-style: italic;
  color: #666;
  font-size: 1.1rem;
}

.date {
  font-size: 1.2rem;
  color: #4caf50;
  margin-bottom: 0.5rem;
}

.btn-logout {
  background-color: #d9534f;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.home-nav {
  display: flex;
  justify-content: space-around;
  padding: 1rem 0;
  background-color: #f8f8f8;
  border-bottom: 2px solid #e0e0e0;
}

.nav-item, .dropbtn {
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: #333;
  white-space: nowrap;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-item.active,
.nav-item:hover,
.dropbtn:hover,
.dropbtn.active {
  background-color: #4caf50;
  color: white;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: block;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
}

.dropdown-content a:nth-child(odd) {
  background-color: #4caf50;
  color: white;
}

.dropdown-content a:nth-child(even) {
  background-color: #ffffff;
  color: black;
}

.dropdown-content a:hover {
  background-color: #ddd;
}
</style>