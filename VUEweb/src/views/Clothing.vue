<template>
    <div class="container">
        <!-- 标题部分 -->
        <div class="title-container">
            <!-- 主标题 -->
            <h1 class="title">PERSONALISED CLOTHING RECOMMENDATIONS</h1>
            <!-- 副标题 -->
            <p class="subtitle">
                "Get Personalised Clothing Suggestions based on different activities"
            </p>
        </div>

        <!-- 选择活动类型 -->
        <div class="activity-area">
            <h3 class="section-title">Please Choose Type of Activity:</h3>
            <div class="activity-buttons">
                <button 
                    @click="selectedActivity = 'office'" 
                    class="activity-button" 
                    :class="{ 'active': selectedActivity === 'office' }"
                >
                    OFFICE
                </button>
                <button 
                    @click="selectedActivity = 'beach'" 
                    class="activity-button" 
                    :class="{ 'active': selectedActivity === 'beach' }"
                >
                    BEACH
                </button>
                <button 
                    @click="selectedActivity = 'hiking'" 
                    class="activity-button" 
                    :class="{ 'active': selectedActivity === 'hiking' }"
                >
                    HIKING
                </button>
            </div>
        </div>

        <!-- 服装推荐 -->
        <div class="recommendation-container">
            <!-- 男性服装推荐 -->
            <div class="recommendation-box">
                <div class="recommendation-content">
                    <img :src="activityRecommendations[selectedActivity].male.image" class="outfit-image" />
                    <div class="recommendation-text">
                        <h3 class="recommendation-title">YOUR'S TODAY'S OUTFIT SHOULD INCLUDE:</h3>
                        <ul>
                            <li v-for="(item, index) in activityRecommendations[selectedActivity].male.items"
                                :key="index">
                                {{ item }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 女性服装推荐 -->
            <div class="recommendation-box">
                <div class="recommendation-content">
                    <img :src="activityRecommendations[selectedActivity].female.image" class="outfit-image" />
                    <div class="recommendation-text">
                        <h3 class="recommendation-title">YOUR'S TODAY'S OUTFIT SHOULD INCLUDE:</h3>
                        <ul>
                            <li v-for="(item, index) in activityRecommendations[selectedActivity].female.items"
                                :key="index">
                                {{ item }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- 去服装推荐页面的按钮 -->
        <div class="footer">
            <button class="more-link" @click="goToVisa">
                EXPLORE UV IMPACT
            </button>
        </div>
    </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from 'vue-router';
import officeMaleImage from "@/assets/office_male.jpg";
import officeFemaleImage from "@/assets/office_female.jpg";
import beachMaleImage from "@/assets/beach_male.jpg";
import beachFemaleImage from "@/assets/beach_female.jpg";
import hikingMaleImage from "@/assets/hiking_male.jpg";
import hikingFemaleImage from "@/assets/hiking_female.jpg";

export default {
    setup() {
        const selectedActivity = ref("office");
        const router = useRouter();

        const activityRecommendations = {
            office: {
                male: {
                    image: officeMaleImage,
                    items: [
                        "A Full Sleeve T-shirt to protect you from Sun harmful UV rays.",
                        "A full-length Formal Chinos to protect your legs from sun exposure."
                    ]
                },
                female: {
                    image: officeFemaleImage,
                    items: [
                        "A Full Sleeve to protect you from Sun harmful UV rays.",
                        "A full-length Formal Dress to protect your legs from sun exposure."
                    ]
                }
            },
            beach: {
                male: {
                    image: beachMaleImage,
                    items: [
                        "A UV-protective Swim Shirt.",
                        "Knee-length swimming shorts to cover your legs."
                    ]
                },
                female: {
                    image: beachFemaleImage,
                    items: [
                        "A Sun-protective swimsuit.",
                        "A lightweight cover-up for extra protection."
                    ]
                }
            },
            hiking: {
                male: {
                    image: hikingMaleImage,
                    items: [
                        "A long sleeve moisture-wicking shirt.",
                        "Full-length breathable hiking pants."
                    ]
                },
                female: {
                    image: hikingFemaleImage,
                    items: [
                        "A lightweight hiking jacket with UV protection.",
                        "Long trekking pants to protect from sun and insects."
                    ]
                }
            }
        };

        const goToVisa = () => {
            router.push('/visualisation');  // 导航到推荐界面
        };

        return {
            goToVisa,
            selectedActivity,
            activityRecommendations
        };
    }
};
</script>

<style scoped>
/* 🌟 主要布局 */
.container {
    max-width: 1000px;
    margin: auto;
    text-align: center;
    font-family: "Roboto Serif", serif;
    color: #5A3E2B;
}

/* 去可视化的按钮 */
.footer {
    width: 100%;
    text-align: center;
    margin-top: 30px;
    padding: 10px 0;
}

.footer-title {
    width: 100%;
    text-align: center;
    margin-top: 0px;
    padding: 10px 0;
    color: #5A4132;
}

.more-link {
    background-color: #b0906a;
    color: white;
    font-size: 22px;
    font-weight: 600;
    padding: 16px 40px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 5px 15px rgba(176, 144, 106, 0.4);
}

.more-link:hover {
    background-color: #9a7b58;
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(176, 144, 106, 0.5);
}

/* 活动选择按钮 */
.activity-area {
    margin: 30px 0;
    text-align: center;
}

.section-title {
    color: #A2845E;
    font-size: 24px;
    margin-bottom: 20px;
}

.activity-buttons {
    display: flex;
    justify-content: space-around;
    margin: 20px auto;
    max-width: 800px;
}

.activity-button {
    background-color: #FFFFFF;
    color: #A2845E;
    font-size: 22px;
    font-weight: bold;
    padding: 15px 40px;
    border: 2px solid #A2845E;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.activity-button:hover, .activity-button.active {
    background-color: #A2845E;
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(162, 132, 94, 0.4);
}

/* 🌟 标题部分 */
.title-box {
    background: #F5F2EA;
    padding: 20px;
    border-radius: 8px;
    border: 2px solid #A2845E;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

/* 外部容器样式 */
.title-container {
    border: 4px solid #A2845E;
    /* 设置边框颜色 */
    padding: 15px 25px;
    /* 设置内边距 */
    text-align: center;
    /* 文字居中 */
    width: fit-content;
    /* 适应内容宽度 */
    background: white;
    /* 背景颜色 */
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    /* 轻微阴影 */
    margin: 20px auto;
    /* 居中对齐 */
}

.title {
    font-size: 30px;
    /* 设置字体大小 */
    font-weight: bold;
    /* 加粗字体 */
    color: #b08d57;
    /* 文字颜色 */
    margin: 0;
    /* 去除默认外边距 */
}

.subtitle {
    font-family: 'Roboto Serif', serif;
    font-size: 20px;
    /* 字体大小 */
    font-weight: bold;
    /* 加粗字体 */
    color: #939393;
    /* 字体颜色 */
    margin: 5px 0 0;
    /* 调整外边距 */
}

/* 🌟 服装推荐区域 */
.recommendation-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 20px;
}

.recommendation-box {
    background: #fefcf8;
    padding: 15px;
    border-radius: 10px;
    border: 2px solid #A2845E;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    width: 45%;
}

.recommendation-content {
    display: flex;
    color: #A2845E;
    gap: 15px;
}

/* 🌟 服装图片 */
.outfit-image {
    width: 50%;
    height: auto;
    align-items: center;
    border-radius: 5px;
}

/* 🌟 服装推荐文本 */
.recommendation-text {
    text-align: left;
}

.recommendation-title {
    font-size: 20px;
    font-weight: bold;
    color: #8B6A40;
    margin-bottom: 10px;
}

.recommendation-text ul {
    list-style-type: disc;
    padding-left: 15px;
    color: #5A3E2B;
    font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .recommendation-container {
        flex-direction: column;
        align-items: center;
    }
    
    .recommendation-box {
        width: 90%;
    }
    
    .activity-buttons {
        flex-direction: column;
        gap: 15px;
    }
    
    .activity-button {
        width: 80%;
        margin: 0 auto;
    }
}
</style>