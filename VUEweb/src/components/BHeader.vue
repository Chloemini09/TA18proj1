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
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-container">
        <h2>Set Sunscreen Reminder</h2>
        <div class="modal-content">
          <input v-model="timeInput" type="text" class="form-input" placeholder="Enter time (e.g., 1s, 2m, 3h)" />
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button @click="startTimer" class="btn-submit">Start Timer</button>
          <button @click="stopTimer" class="btn-cancel">Cancel Timer</button>
        </div>
        <button @click="closeReminderModal" class="btn-close"></button>


        <!-- 计时状态（放入弹窗） -->
        <div v-if="isTimerRunning" class="main-timer-status">
          <p>Time Remaining: {{ countdown }}s</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTimer } from "@/composables/useTimer";

export default {
  name: 'BHeader',
  props: {
    // 可以从父组件传入自定义导航项
    customNavItems: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const route = useRoute();
    const currentPath = computed(() => route.path);
    const navRefs = reactive({});

    const {
      isModalOpen,
      openReminderModal,
      closeReminderModal,
      timeInput,
      countdown,
      isTimerRunning,
      errorMessage,
      startTimer,
      stopTimer
    } = useTimer();

    // 默认导航项
    const defaultNavItems = [
      { label: 'HOME', path: '/', index: 0 },
      { label: 'ABOUT', path: '/about', index: 1 },
      { label: 'CONTACT', path: '/contact', index: 2 },
      { label: 'CLOTHING', path: '/clothing', index: 3 },
      { label: 'RECOMMENDATION', path: '/recommendation', index: 4 }
    ];

    // 合并自定义导航项与默认导航项
    const navItems = computed(() => {
      if (props.customNavItems && props.customNavItems.length > 0) {
        return props.customNavItems.map((item, index) => ({
          ...item,
          index
        }));
      }
      return defaultNavItems;
    });

    // 键盘导航功能
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
      openReminderModal,
      closeReminderModal,
      isModalOpen,
      timeInput,
      countdown,
      isTimerRunning,
      errorMessage,
      startTimer,
      stopTimer
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

/* 计时器 */
.btn-submit,
.btn-cancel {
  display: inline-block;
  /* 确保按钮在同一行 */
  width: auto;
  /* 确保按钮大小不会被压缩 */
  border: none;
  /* 清除所有边框 */
  background-color: #a67c52;
  /* 适当调整背景色 */
  color: white;
  /* 按钮文本颜色 */
  padding: 10px 20px;
  /* 适当的内边距 */
  margin: 5px;
  /* 避免按钮挤在一起 */
  border-radius: 5px;
  /* 轻微圆角 */
  cursor: pointer;
  text-align: center;
}

.btn-submit:hover,
.btn-cancel:hover {
  background-color: #8b5e3c;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 300px;
}

.main-timer-status {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

/* 其他 */

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