<template>
    <transition name="modal">
        <div v-if="isModalOpen" class="modal-overlay">
            <div class="modal-container">
                <h2>Sunscreen Reminder</h2>

                <!-- 时间选择器 -->
                <div class="time-picker">
                    <select v-model="selectedHours">
                        <option v-for="h in 25" :key="h - 1" :value="h - 1">{{ h - 1 }}</option>
                    </select>
                    <span>hours</span>

                    <select v-model="selectedMinutes">
                        <option v-for="m in 61" :key="m - 1" :value="m - 1">{{ m - 1 }}</option>
                    </select>
                    <span>min</span>

                    <select v-model="selectedSeconds">
                        <option v-for="s in 61" :key="s - 1" :value="s - 1">{{ s - 1 }}</option>
                    </select>
                    <span>sec</span>
                </div>

                <div class="btn-group">
                    <button @click="handleStartTimer" class="btn-submit">Start Timer</button>
                    <button @click="stopTimer" class="btn-cancel">Cancel Timer</button>
                </div>
                <button @click="closeReminderModal" class="btn-close"></button>

                <!-- 计时状态 -->
                <div v-if="isTimerRunning" class="main-timer-status">
                    <p>Time Remaining: {{ countdown }}s</p>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { ref, watch } from "vue";

export default {
    props: {
        isModalOpen: Boolean,
        closeReminderModal: Function,
        startTimer: Function,
        stopTimer: Function,
        countdown: Number,
        isTimerRunning: Boolean
    },
    setup(props) {
        const selectedHours = ref(0);
        const selectedMinutes = ref(0);
        const selectedSeconds = ref(0);

        // 当用户修改时间时，更新倒计时的总秒数
        const handleStartTimer = () => {
            const totalSeconds = selectedHours.value * 3600 + selectedMinutes.value * 60 + selectedSeconds.value;

            if (totalSeconds <= 0) {
                alert("Please select a valid time greater than 0 seconds.");
                return;
            }

            props.startTimer(totalSeconds); // 传递总秒数到 `BHeader.vue`
        };

        return {
            selectedHours,
            selectedMinutes,
            selectedSeconds,
            handleStartTimer
        };
    }
};
</script>

<style scoped>
/* 弹窗背景 */
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

/* 弹窗内容 */
.modal-container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    width: 400px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* 时间选择器 */
.time-picker {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 40px;
    margin-bottom: 40px;
}

select {
    padding: 5px;
    font-size: 16px;
}

/* 按钮 */
.btn-group {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.btn-submit,
.btn-cancel {
    background: #a67c52;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
}

.btn-cancel {
    background: #a67c52;
}

.main-timer-status {
    font-size: 18px;
    font-weight: bold;
    margin-top: 10px;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s;
}

.modal-enter,
.modal-leave-to {
    opacity: 0;
}
</style>
