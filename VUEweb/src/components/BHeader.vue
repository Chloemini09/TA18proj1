<template>
  <header class="b-header">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="UV Safe Logo" class="logo" />
    </div>

    <nav class="b-nav">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path"
        :ref="el => { if (el) navRefs[item.path] = el }" class="nav-item"
        :class="{ 'active': currentPath === item.path }" @keydown.left="navigatePrev(item.index)"
        @keydown.right="navigateNext(item.index)">
        {{ item.label }}
      </router-link>
    </nav>

    <!-- 计时器按钮 -->
    <button @click="openReminderModal" class="btn-reminder">Set Reminder</button>

    <!-- 计时器弹窗 -->
    <ReminderModal :isModalOpen="isModalOpen" :closeReminderModal="closeReminderModal" :startTimer="startTimer"
      :stopTimer="stopTimer" :countdown="countdown" :isTimerRunning="isTimerRunning" />
  </header>
</template>

<script>
import { reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ReminderModal from "@/components/ReminderModal.vue";
import { useTimer } from "@/composables/useTimer";

export default {
  name: 'BHeader',
  components: { ReminderModal },
  props: {
    customNavItems: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const route = useRoute();
    const currentPath = computed(() => route.path);
    const navRefs = reactive({});

    // 计时器相关
    const {
      isModalOpen,
      openReminderModal,
      closeReminderModal,
      startTimer,
      stopTimer,
      countdown,
      isTimerRunning
    } = useTimer();

    // 默认导航项
    const defaultNavItems = [
      { label: 'HOME', path: '/', index: 0 },
      { label: 'ABOUT', path: '/about', index: 1 },
      { label: 'CONTACT', path: '/contact', index: 2 },
      { label: 'CLOTHING', path: '/clothing', index: 3 },
      { label: 'RECOMMENDATION', path: '/recommendation', index: 4 }
    ];

    // 让 `startTimer` 接受参数
    const handleStartTimer = (totalSeconds) => {
      startTimer(totalSeconds);
    };

    const navItems = computed(() => {
      if (props.customNavItems.length > 0) {
        return props.customNavItems.map((item, index) => ({ ...item, index }));
      }
      return defaultNavItems;
    });

    function navigatePrev(currentIndex) {
      if (currentIndex > 0) {
        const prevItem = navItems.value[currentIndex - 1];
        if (navRefs[prevItem.path]) {
          navRefs[prevItem.path].focus();
        }
      }
    }

    function navigateNext(currentIndex) {
      if (currentIndex < navItems.value.length - 1) {
        const nextItem = navItems.value[currentIndex + 1];
        if (navRefs[nextItem.path]) {
          navRefs[nextItem.path].focus();
        }
      }
    }

    onMounted(() => {
      const currentItem = navItems.value.find(item => item.path === currentPath.value);
      if (currentItem && navRefs[currentItem.path]) {
        navRefs[currentItem.path].focus();
      }
    });

    return {
      navItems,
      currentPath,
      navRefs,
      navigatePrev,
      navigateNext,
      isModalOpen,
      openReminderModal,
      closeReminderModal,
      startTimer,
      stopTimer,
      countdown,
      isTimerRunning,
      handleStartTimer
    };
  }
}
</script>

<style scoped>
.b-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f7f6;
}

.btn-reminder {
  background: #FFD700;
  color: black;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 50px;
  object-fit: contain;
}

.b-nav {
  display: flex;
  gap: 2rem;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.active {
  color: #a67c52;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #a67c52;
}

.nav-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(166, 124, 82, 0.3);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .b-header {
    flex-direction: column;
    padding: 1rem;
  }

  .logo-container {
    margin-bottom: 1rem;
  }

  .b-nav {
    width: 100%;
    justify-content: space-around;
    gap: 0.5rem;
  }
}
</style>
