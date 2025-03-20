<template>
  <header class="b-header">
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="UV Safe Logo" class="logo" />
    </div>
    <nav class="b-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :ref="el => { if(el) navRefs[item.path] = el }"
        class="nav-item"
        :class="{ 'active': currentPath === item.path }"
        @keydown.left="navigatePrev(item.index)"
        @keydown.right="navigateNext(item.index)"
      >
        {{ item.label }}
      </router-link>
      <!-- SPF REMINDERS作为导航项但点击打开弹窗 -->
      <a 
        href="#" 
        class="nav-item" 
        @click.prevent="openReminderModal"
        :ref="el => { if(el) navRefs['spf-reminder'] = el }"
        @keydown.left="navigatePrevWithReminder"
        @keydown.right="navigateNextWithReminder"
      >
        SPF REMINDERS
      </a>
    </nav>
    
    <!-- 计时器弹窗 -->
    <ReminderModal 
      :isModalOpen="isModalOpen" 
      :closeReminderModal="closeReminderModal" 
      :startTimer="startTimer"
      :stopTimer="stopTimer" 
      :countdown="countdown" 
      :isTimerRunning="isTimerRunning" 
    />
  </header>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ReminderModal from "@/components/ReminderModal.vue";
import { useTimer } from "@/composables/useTimer";

export default {
  name: 'BHeader',
  components: { ReminderModal },
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
    
    // 计时器相关功能
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
      { label: 'UV IMPACTS', path: '/visualisation', index: 1 },
      { label: 'MY UV-SHIELD', path: '/recommendation', index: 2 },
      { label: 'CLOTHING PLAN', path: '/clothing', index: 3 }
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
    
    // 让 `startTimer` 接受参数
    const handleStartTimer = (totalSeconds) => {
      startTimer(totalSeconds);
    };
    
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
      } else if (currentIndex === navItems.value.length - 1) {
        // 如果在最后一个导航项，下一个是SPF REMINDERS
        if (navRefs['spf-reminder']) {
          navRefs['spf-reminder'].focus();
        }
      }
    }
    
    // SPF REMINDERS导航项的键盘导航
    function navigatePrevWithReminder() {
      // 导航到最后一个正常导航项
      const lastIndex = navItems.value.length - 1;
      const lastItem = navItems.value[lastIndex];
      if (navRefs[lastItem.path]) {
        navRefs[lastItem.path].focus();
      }
    }
    
    function navigateNextWithReminder() {
      // 让焦点回到第一个导航项
      const firstItem = navItems.value[0];
      if (navRefs[firstItem.path]) {
        navRefs[firstItem.path].focus();
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
      navigatePrevWithReminder,
      navigateNextWithReminder,
      // 计时器相关
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
  padding: 0.5rem 0.8rem; /* 增加了左右内边距以扩大悬停区域 */
  position: relative;
  transition: all 0.3s ease; /* 改为all，使所有变化都有过渡效果 */
  border-radius: 4px; /* 添加圆角 */
}

.nav-item:hover, .nav-item.active {
  color: #A2845E;
  background-color: rgba(162, 132, 94, 0.1); /* 添加浅色背景 */
  transform: translateY(-2px); /* 轻微上移效果 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%; /* 从10%开始 */
  width: 80%; /* 只占80%宽度，居中显示 */
  height: 2px;
  background-color: #A2845E;
  border-radius: 1px; /* 圆角下划线 */
}

.nav-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(162, 132, 94, 0.3);
  border-radius: 4px;
}

/* 为悬停添加下划线效果 */
.nav-item:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 2px;
  background-color: #A2845E;
  border-radius: 1px;
  animation: expandLine 0.3s ease forwards; /* 添加动画 */
}

/* 下划线展开动画 */
@keyframes expandLine {
  0% {
    width: 0;
    left: 50%;
  }
  100% {
    width: 80%;
    left: 10%;
  }
}



/* 响应式调整 */
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

@media (max-width: 480px) {
  .nav-item {
    font-size: 14px;
    padding: 0.5rem 0.4rem; /* 在小屏幕上减少内边距 */
  }
}
</style>