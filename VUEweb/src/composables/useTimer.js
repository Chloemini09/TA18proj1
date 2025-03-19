// src/composables/useTimer.js
import { ref, onUnmounted } from "vue";

export function useTimer() {
  const isModalOpen = ref(false);
  const timeInput = ref("");
  const countdown = ref(0);
  const isTimerRunning = ref(false);
  const errorMessage = ref("");
  let timer = null;

  // 解析时间格式 (如 1h, 2m, 3s)
  const parseTimeInput = (input) => {
    const regex = /^(\d+h)?(\d+m)?(\d+s)?$/;
    if (!regex.test(input)) return null;

    let totalSeconds = 0;
    const match = input.match(/(\d+)h/);
    if (match) totalSeconds += parseInt(match[1]) * 3600;

    const matchMinutes = input.match(/(\d+)m/);
    if (matchMinutes) totalSeconds += parseInt(matchMinutes[1]) * 60;

    const matchSeconds = input.match(/(\d+)s/);
    if (matchSeconds) totalSeconds += parseInt(matchSeconds[1]);

    return totalSeconds;
  };

  // 发送提醒
  const sendAlert = () => {
    alert("Hello! It's time to reapply your sunscreen.");
  };

  // 开始倒计时
  const startTimer = () => {
    if (isTimerRunning.value) return; // 防止重复启动

    const totalSeconds = parseTimeInput(timeInput.value);
    if (!totalSeconds || totalSeconds <= 0) {
      errorMessage.value = "Invalid time format. Use 1s, 2m, 3h, etc.";
      return;
    }

    countdown.value = totalSeconds;
    isTimerRunning.value = true;
    errorMessage.value = "";
    isModalOpen.value = false; // 关闭弹窗

    timer = setInterval(() => {
      if (countdown.value > 1) {
        countdown.value--;
      } else {
        sendAlert();
        countdown.value = totalSeconds; // 自动重置并重新开始
      }
    }, 1000);
  };

  // 停止倒计时
  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isTimerRunning.value = false;
    countdown.value = 0;
  };

  // 组件销毁时，清理定时器
  onUnmounted(() => {
    stopTimer();
  });

  return {
    isModalOpen,
    openReminderModal: () => {
      isModalOpen.value = true;
      errorMessage.value = "";
    },
    closeReminderModal: () => {
      isModalOpen.value = false;
    },
    timeInput,
    countdown,
    isTimerRunning,
    errorMessage,
    startTimer,
    stopTimer,
  };
}
