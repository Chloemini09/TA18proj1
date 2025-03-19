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
            <h3 class="section-title">Please Select Your Activity to Get Recommended Outfit:</h3>
            <div class="search-container">
                <div class="mapbox-search">
                    <div class="search-input-group">
                        <select v-model="tempSelectedActivity" class="input-box">
                            <option value="office">Office</option>
                            <option value="beach">Beach</option>
                            <option value="hiking">Hiking</option>
                        </select>
                        <button @click="updateActivity" class="search-button">
                            <i class="search-icon">👕</i>
                            <span>Get Outfit</span>
                        </button>
                    </div>
                </div>
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
// import beachMaleImage from "@/assets/beach_male.jpg";
// import beachFemaleImage from "@/assets/beach_female.jpg";
// import hikingMaleImage from "@/assets/hiking_male.jpg";
// import hikingFemaleImage from "@/assets/hiking_female.jpg";

export default {
    setup() {
        const selectedActivity = ref("office");
        // 临时存储用户选择的活动类型
        const tempSelectedActivity = ref("office");
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
                    //image: beachMaleImage,
                    items: [
                        "A UV-protective Swim Shirt.",
                        "Knee-length swimming shorts to cover your legs."
                    ]
                },
                female: {
                    //image: beachFemaleImage,
                    items: [
                        "A Sun-protective swimsuit.",
                        "A lightweight cover-up for extra protection."
                    ]
                }
            },
            hiking: {
                male: {
                    //image: hikingMaleImage,
                    items: [
                        "A long sleeve moisture-wicking shirt.",
                        "Full-length breathable hiking pants."
                    ]
                },
                female: {
                    //image: hikingFemaleImage,
                    items: [
                        "A lightweight hiking jacket with UV protection.",
                        "Long trekking pants to protect from sun and insects."
                    ]
                }
            }
        };
        // 点击按钮时更新 selectedActivity
        const updateActivity = () => {
            selectedActivity.value = tempSelectedActivity.value;
        };
        const goToVisa = () => {
            router.push('/visualisation');  // 导航到推荐界面
        };

        return {
            goToVisa,
            selectedActivity,
            tempSelectedActivity,
            activityRecommendations,
            updateActivity
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

/* 按钮 */
.activity-area {
    margin: 30px 0;
    text-align: center;
}

.search-container {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
}

.mapbox-search {
    position: relative;
    width: 100%;
    z-index: 1
}

.search-input-group {
    display: flex;
    align-items: center;
    width: 100%;
}

.input-box {
    flex: 1;
    padding: 15px 20px;
    border: 2px solid #ddd;
    border-radius: 30px 0 0 30px;
    font-size: 17px;
    box-sizing: border-box;
    transition: all 0.3s;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.input-box:focus {
    outline: none;
    border-color: #b0906a;
    box-shadow: 0 3px 15px rgba(0, 123, 255, 0.2);
}

.search-button {
    background-color: #b0906a;
    color: white;
    border: none;
    border-radius: 0 30px 30px 0;
    padding: 16px 25px;
    height: 100%;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.search-button:hover {
    background-color: #b0906a;
}

.search-button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}

.search-icon {
    margin-right: 5px;
    font-size: 16px;
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

/* 🌟 选择框 */
.activity-selector {
    margin: 20px 0;
    font-size: 20px;
    font-weight: bold;
    color: #A2845E;
}

.activity-selector select {
    width: 50%;
    padding: 10px 15px;
    border: 2px solid #5A4132;
    border-radius: 25px;
    font-size: 16px;
    background-color: white;
    margin-bottom: 20px;
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

/* 🌟 按钮 */
.button-container {
    display: flex;
    justify-content: flex-end;
    /* 靠左 */
    margin-top: 20px;
}

/* 🌟 按钮 */
.cta-button {
    background: #8B6A40;
    color: white;
    font-weight: bold;
    padding: 12px 25px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: background 0.3s ease;
}

.cta-button:hover {
    background: #5A3E2B;
}
</style>