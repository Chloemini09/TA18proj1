import { ref, onUnmounted } from "vue";

export function useTimer() {
  const isModalOpen = ref(false);
  const countdown = ref(0);
  const isTimerRunning = ref(false);
  let timer = null;

  // 发送提醒
  const sendAlert = () => {
    alert("⏳ Reminder: It's time to reapply your sunscreen! 🌞");
  };

  // 开始计时器
  const startTimer = (totalSeconds) => { // 让它接受时间
    if (isTimerRunning.value) return;

    countdown.value = totalSeconds;
    isTimerRunning.value = true;
    isModalOpen.value = false;

    timer = setInterval(() => {
        if (countdown.value > 1) {
            countdown.value--;
        } else {
            alert("It's time to reapply sunscreen!");
            countdown.value = totalSeconds; // 重新开始
        }
    }, 1000);
};

  // 设定自定义倒计时时间
  const setCustomTime = (seconds) => {
    countdown.value = seconds;
  };

  // 停止计时器
  const stopTimer = () => {
    if (timer) clearInterval(timer);
    isTimerRunning.value = false;
    countdown.value = 0;
  };

  // 组件卸载时清除定时器
  onUnmounted(() => {
    stopTimer();
  });

  return {
    isModalOpen,
    openReminderModal: () => (isModalOpen.value = true),
    closeReminderModal: () => (isModalOpen.value = false),
    countdown,
    isTimerRunning,
    startTimer,
    stopTimer,
    setCustomTime
  };
}
