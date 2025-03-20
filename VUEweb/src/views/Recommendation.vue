<template>
    <div class="title-container">
        <!-- 主标题 -->
        <h1 class="title">MY UV-SHIELD</h1>
        <!-- 副标题 -->
        <p class="subtitle">
            "Get an estimated sunscreen amount based on your Skin type, Colour, and Sun exposure."
        </p>
    </div>
    <div class="home-container">
        <!-- Left Section -->
        <!-- 左侧区域 -->
        <div class="left-section">
            <h2 class="left-title">Please provide the following below details:</h2>
            <!-- 选择肤质类型 -->
            <div class="activity-area">
                <h3 class="section-title">SKIN TYPE:</h3>
                <div class="search-container">
                    <div class="mapbox-search">
                        <div class="search-input-group">
                            <select v-model="tempSelectedSkinType" class="input-box">
                                <option value="" disabled>Select your skin type</option> <!-- 默认占位选项 -->
                                <option value="dry">Dry</option>
                                <option value="combination">Combination</option>
                                <option value="normal">Normal</option>
                                <option value="oily">Oily</option>
                            </select>
                            <button @click="updateSkinType" class="search-button">
                                <i class="search-icon"></i>
                                <span>Get type</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Skin Colour 选择 -->
            <div class="skin-color-selector">
                <label class="section-title">SKIN COLOUR :</label>
                <div class="skin-color-options">
                    <template v-for="(color, index) in skinColors" :key="index">
                        <div class="skin-color-item" :style="{ backgroundColor: color.hex }"
                            :class="{ active: selectedSkinColorType === index + 1 }"
                            @click="selectedSkinColorType = index + 1"></div>
                        <div v-if="index < skinColors.length - 1" class="skin-color-divider"></div>
                    </template>
                </div>
            </div>

            <!-- 防晒建议 -->
            <div class="sunscreen-recommendations">
                <div class="sunscreen-image">
                    <img src="@/assets/suncream.png" alt="Sunscreen" />
                </div>
                <div class="sunscreen-info">
                    <h2 class="spf-recommendation">{{ getSPFRecommendation() }}</h2>
                    <h3 class="reapplication-time">{{ getReapplicationTime() }}</h3>
                </div>
            </div>

            <!-- 额外防护建议 -->
            <div class="extra-protection-advice">
                <p>{{ getExtraProtectionAdvice() }}</p>
            </div>
        </div>

        <!-- 右侧区域 -->
        <!-- UV显示区域 -->
        <div class="right-section">
            <div class="uv-section">
                <div class="uv-display">
                    <h2 class="right-section-title">YOUR LOCATION:</h2>
                    <p class="location-text">{{ getLocation() }}</p>

                    <h2 class="right-section-title">CURRENT UV INDEX:</h2>
                    <div class="uv-circle">
                        <span class="uv-value">{{ Math.floor(getUVData()) }}</span>
                    </div>
                    <p class="uv-level">MODERATE</p>
                    <p class="uv-tip"><strong class="tip-highlight">Tip:</strong> {{ getUVLevelText() }}.
                    </p>
                </div>
            </div>
            <!-- 去服装推荐页面的按钮 -->
            <div class="footer">
                <button class="more-link" @click="goToClothing">
                    GET CLOTHING INFO ?
                </button>
                <p class="subtitle">(Please click on above button to get personalised clothing recommendation)</p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
// 注意：需要安装mapbox-gl包
// npm install mapbox-gl
// 如果只使用geocoding API可能不需要完整的mapbox-gl
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

export default {
    name: 'recommendation',
    setup() {
        // Mapbox配置
        const mapboxToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY204YTdyNXA3MTloZjJqcHNhYjZ1c2thbCJ9.X4D17rgTFDpXuC8KUfvKLQ';

        // 响应式状态
        const locationInput = ref('Melbourne');
        const selectedLocation = ref({ lat: -37.8136, lng: 144.9631 }); // 默认墨尔本
        const suggestions = ref([]);
        const uvIndex = ref(5); // 默认UV指数为5
        const lastUpdated = ref('');
        const selectedSkinType = ref(null); // 默认干性
        const selectedSkinColorType = ref(null); // 默认1型
        const router = useRouter();
        const tempSelectedSkinType = ref("Dry");

        //获取UV数据
        const getUVData = () => {
            // 获取 localStorage 数据
            const dataString = localStorage.getItem('uvSearchData');

            // 如果数据为空，则返回 null
            if (!dataString) {
                console.warn("No UV data found in localStorage.");
                return null;
            }

            try {
                // 解析 JSON 数据
                const data = JSON.parse(dataString);
                console.log("UV Index from localStorage:", data.uvIndex);

                // 返回解析后的数据
                return data.uvIndex;
            } catch (error) {
                console.error("Error parsing localStorage data:", error);
                return null;
            }
        };
        //暂存skin type
        const updateSkinType = () => {
            selectedSkinType.value = tempSelectedSkinType.value;
        };

        // 获取地址
        const getLocation = () => {
            // 获取 localStorage 数据
            const dataString = localStorage.getItem('uvSearchData');

            // 如果数据为空，则返回 null
            if (!dataString) {
                console.warn("No location data found in localStorage.");
                return null;
            }

            try {
                // 解析 JSON 数据
                const data = JSON.parse(dataString);
                console.log("Location from localStorage:", data.location);

                // 返回位置数据
                return data.location;
            } catch (error) {
                console.error("Error parsing localStorage location data:", error);
                return null;
            }
        };

        // 肤色选项
        const skinColors = [
            { type: 1, hex: '#422E22' }, // I型
            { type: 2, hex: '#9C6D51' }, // II型
            { type: 3, hex: '#BE8A67' }, // III型
            { type: 4, hex: '#D7B195' }, // IV型
            { type: 5, hex: '#E5CDAF' }, // V型
            { type: 6, hex: '#F4E6D4' }  // VI型
        ];

        // 计算属性：基于UV指数决定显示哪些防护装备
        const shouldShowSunglasses = computed(() => uvIndex.value >= 5);
        const shouldShowUmbrella = computed(() => uvIndex.value >= 7);
        const shouldShowSunproof = computed(() => uvIndex.value >= 10);
        const shouldShowMask = computed(() => uvIndex.value >= 10);
        const shouldShowHat = computed(() => uvIndex.value >= 10);

        // 获取UV等级文本
        const getUVLevelText = () => {
            const index = uvIndex.value;

            if (index <= 2) return 'Minimal risk. Enjoy outdoor activities safely';
            if (index <= 4) return 'Wear sunglasses and sunscreen if staying outside';
            if (index <= 6) return 'Seek shade between 12pm - 4pm. Apply SPF 30+';
            if (index <= 9) return 'Please stay under shade around 12pm - 4pm. Stay Hydrated';
            return 'Extreme UV risk! Avoid outdoor activities. Wear protective clothing and sunscreen';
        };

        // 获取SPF推荐
        const getSPFRecommendation = () => {
            const index = uvIndex.value;
            const skinType = selectedSkinColorType.value;

            // 根据UV指数和肤色类型返回SPF推荐
            if (index <= 2) { // UV指数1级(0-2)
                if (skinType <= 2) return 'SPF 15+';
                return 'MOISTURIZER';
            } else if (index <= 4) { // UV指数2级(3-4)
                if (skinType === 1) return 'SPF 30+';
                if (skinType === 2) return 'SPF 15-30';
                if (skinType === 3) return 'SPF 15+';
                return 'SPF 15';
            } else if (index <= 6) { // UV指数3级(5-6)
                if (skinType === 1) return 'SPF 50+';
                if (skinType === 2) return 'SPF 30-50';
                if (skinType === 3) return 'SPF 30+';
                if (skinType === 4) return 'SPF 15-30';
                return 'SPF 15+';
            } else if (index <= 9) { // UV指数4级(7-9)
                if (skinType === 1) return 'WATER-PROOF SPF 50+';
                if (skinType === 2) return 'SPF 50+';
                if (skinType === 3) return 'SPF 30-50';
                if (skinType === 4) return 'SPF 30+';
                if (skinType === 5) return 'SPF 15-30';
                return 'SPF 15+';
            } else { // UV指数5级(≥10)
                if (skinType === 1) return 'SPF 50+ PA++++';
                if (skinType === 2) return 'SPF 50+ PA++++';
                if (skinType === 3) return 'SPF 50+';
                if (skinType === 4) return 'SPF 30-50';
                if (skinType === 5) return 'SPF 30+';
                return 'SPF 15-30';
            }
        };

        // 获取重新涂抹时间
        const getReapplicationTime = () => {
            const index = uvIndex.value;
            const skinType = selectedSkinColorType.value;

            // 根据UV指数和肤色类型返回重新涂抹时间
            if (index <= 2) { // UV指数1级(0-2)
                return '';
            } else if (index <= 4) { // UV指数2级(3-4)
                return 'EVERY SIX HOURS, 1 SPOON';
            } else if (index <= 6) { // UV指数3级(5-6)
                if (skinType === 1) return 'EVERY TWO HOURS,2 SPOONS';
                if (skinType === 2) return 'EVERY THREE HOURS,1 SPOON';
                if (skinType === 3 || skinType === 4) return 'EVERY FOUR HOURS,1 SPOON';
                return 'EVERY SIX HOURS, 1 SPOON';
            } else if (index <= 9) { // UV指数4级(7-9)
                if (skinType === 1) return 'EVERY 1-2 HOURS,2 SPOONS';
                if (skinType === 2) return 'EVERY TWO HOURS,2 SPOONS';
                if (skinType === 3) return 'EVERY THREE HOURS,2 SPOONS';
                if (skinType === 4) return 'EVERY FOUR HOURS,3 SPOONS';
                if (skinType === 5) return 'EVERY 4-6 HOURS,3 SPOONS';
                return 'EVERY SIX HOURS, SPOONS';
            } else { // UV指数5级(≥10)
                if (skinType === 1) return 'EVERY HOUR,1 SPOONS';
                if (skinType === 2) return 'EVERY 1-2 HOURS,2 SPOONS';
                if (skinType === 3) return 'EVERY TWO HOURS,3 SPOONS';
                if (skinType === 4) return 'EVERY THREE HOURS,3 SPOONS';
                if (skinType === 5) return 'EVERY FOUR HOURS,3 SPOONS';
                return 'EVERY 4-6 HOURS, 2 SPOONS';
            }
        };

        // 获取额外防护建议
        const getExtraProtectionAdvice = () => {
            const index = uvIndex.value;
            const skinType = selectedSkinColorType.value;
            const skinTextureType = selectedSkinType.value;

            let advice = '';

            // 根据肤质给出防晒霜类型建议 (英文版)
            if (skinTextureType === 'dry') {
                advice += 'Use hydrating sunscreen to prevent dryness';
            } else if (skinTextureType === 'oily') {
                advice += 'Use oil-control sunscreen to reduce shine';
            } else if (skinTextureType === 'combination') {
                advice += 'Use oil-control sunscreen for T-zone, hydrating formula for other areas';
            } else if (skinTextureType === 'normal') {
                advice += 'Any type of sunscreen suits well for your skin';
            }

            // 添加额外防护建议 (英文版)
            if (index >= 5 && skinType <= 3) {
                advice += advice ? ', wear sunglasses' : 'Wear sunglasses';
            }

            if (index >= 7) {
                if (skinType <= 2) {
                    advice += advice ? ', use umbrella and hat' : 'Use umbrella and hat';
                } else if (skinType <= 4 && index >= 8) {
                    advice += advice ? ', wear a hat' : 'Wear a hat';
                }
            }

            if (index >= 10 && skinType === 1) {
                advice += advice ? ', avoid outdoor activities' : 'Avoid outdoor activities';
            }

            return advice;
        };

        // 选择建议
        const selectSuggestion = async (index) => {
            if (suggestions.value.length <= index) return;

            const selected = suggestions.value[index];
            locationInput.value = selected.place_name;
            suggestions.value = [];

            // 更新位置坐标
            selectedLocation.value = {
                lng: selected.center[0],
                lat: selected.center[1]
            };

            // fetchUVData将由selectedLocation的watch处理
            // 数据将在fetchUVData中保存
        };

        // 获取UV数据
        const fetchUVData = async () => {
            try {
                const { lat, lng } = selectedLocation.value;

                // 使用环境变量获取 API 基础地址
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

                console.log('Request URL:', `${apiBaseUrl}/api/uv?lat=${lat}&lng=${lng}`);

                let dataSource = 'API';

                try {
                    // 使用环境变量拼接完整 URL
                    const response = await fetch(`${apiBaseUrl}/api/uv?lat=${lat}&lng=${lng}`);

                    if (!response.ok) {
                        throw new Error(`Request failed with status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('API response:', data);

                    if (data.success && data.data && data.data.result) {
                        uvIndex.value = parseFloat(data.data.result.uv);
                        const uvTime = new Date(data.data.result.uv_time);
                        lastUpdated.value = uvTime.toLocaleString();
                    } else {
                        throw new Error('Invalid API data format');
                    }
                } catch (error) {
                    console.error('Error fetching UV data, trying mock data:', error);
                    dataSource = 'Mock';

                    try {
                        const mockResponse = await fetch(`${apiBaseUrl}/api/uv/mock/coords?lat=${lat}&lng=${lng}`);

                        if (!mockResponse.ok) {
                            throw new Error(`Mock data request failed with status: ${mockResponse.status}`);
                        }

                        const mockData = await mockResponse.json();
                        console.log('Mock API response:', mockData);

                        if (mockData.success && mockData.data && mockData.data.result) {
                            uvIndex.value = parseFloat(mockData.data.result.uv);
                            const uvTime = new Date(mockData.data.result.uv_time);
                            lastUpdated.value = uvTime.toLocaleString() + ' (Mock data)';
                        } else {
                            throw new Error('Invalid mock API data format');
                        }
                    } catch (mockError) {
                        console.error('Error fetching mock data:', mockError);
                        dataSource = 'Default';

                        console.log('Real API and mock API both unavailable, using default UV value');
                        uvIndex.value = 5;
                        lastUpdated.value = new Date().toLocaleString() + ' (Default value)';
                    }
                }

                // 保存到localStorage，包括数据来源信息
                const currentTime = Date.now();
                const locationName = locationInput.value;
                saveToLocalStorage(locationName, uvIndex.value, lastUpdated.value, currentTime, dataSource);
            } catch (error) {
                console.error('Overall processing error:', error);
                uvIndex.value = 5;
                lastUpdated.value = new Date().toLocaleString() + ' (Default value)';

                const currentTime = Date.now();
                const locationName = locationInput.value;
                saveToLocalStorage(locationName, uvIndex.value, lastUpdated.value, currentTime, 'Default');
            }
        };

        // 保存到localStorage，使用统一的格式
        const saveToLocalStorage = (location, index, updated, timestamp, source = 'API') => {
            // 确保清理所有旧键
            cleanupLocalStorage();

            // 创建统一的数据结构
            const data = {
                location: location,
                coordinates: selectedLocation.value,
                lastUpdated: updated,
                skinColorType: selectedSkinColorType.value,
                skinType: selectedSkinType.value,
                uvIndex: index,
                timestamp: timestamp,
                source: source
            };

            // 使用单一键存储所有数据
            localStorage.setItem('uvSearchData', JSON.stringify(data));
            console.log('Saved to localStorage:', data);
        };

        // 从localStorage加载
        const loadFromLocalStorage = () => {
            try {
                // 加载数据
                const dataString = localStorage.getItem('uvSearchData');
                if (dataString) {
                    const data = JSON.parse(dataString);
                    console.log('Loaded data from localStorage:', data);

                    // 设置所有数据
                    locationInput.value = data.location || 'Melbourne';
                    selectedLocation.value = data.coordinates || { lat: -37.8136, lng: 144.9631 };
                    uvIndex.value = parseFloat(data.uvIndex) || 5;
                    lastUpdated.value = data.lastUpdated || new Date().toLocaleString();
                    selectedSkinType.value = data.skinType || 'dry';
                    selectedSkinColorType.value = data.skinColorType || 1;
                } else {
                    // 设置并保存默认值
                    console.log('No data found, setting defaults');
                    locationInput.value = 'Melbourne';
                    selectedLocation.value = { lat: -37.8136, lng: 144.9631 };
                    selectedSkinType.value = 'dry';
                    selectedSkinColorType.value = 1;

                    // 初始保存默认值到localStorage
                    saveToLocalStorage(
                        'Melbourne',
                        5,
                        new Date().toLocaleString(),
                        Date.now(),
                        'Default'
                    );
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);

                // 出错时设置默认值
                locationInput.value = 'Melbourne';
                selectedLocation.value = { lat: -37.8136, lng: 144.9631 };
                selectedSkinType.value = 'dry';
                selectedSkinColorType.value = 1;
            }
        };

        // 监听肤色和肤质选择变化，保存首选项
        watch([selectedSkinType, selectedSkinColorType], () => {
            // 当用户更改肤色/肤质设置时保存
            lastUpdated.value = new Date().toLocaleString() + ' (Default value)';
            saveToLocalStorage(
                getLocation(),
                getUVData(),
                lastUpdated.value,
                Date.now(),
                'User preference update'
            );
        }, { deep: true });

        // 组件挂载和卸载
        onMounted(() => {
            // 清理所有旧键
            cleanupLocalStorage();

            // 从localStorage加载数据
            loadFromLocalStorage();

            // 如果没有有效的UV数据或位置信息已更改，获取新数据
            if (!lastUpdated.value) {
                console.log('No valid UV data in localStorage, fetching new data');
                fetchUVData();
            } else {
                console.log('Using UV data from localStorage:', {
                    location: locationInput.value,
                    index: uvIndex.value,
                    lastUpdated: lastUpdated.value
                });
            }
        });

        // 清理localStorage中的旧键
        const cleanupLocalStorage = () => {
            const keysToRemove = [
                'sunscreenApp',
                'sunscreenApp_uvData',
                'sunscreenApp_preferences',
                'uvData',
                'uvUserInfo'
            ];

            keysToRemove.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`Removed old localStorage key: ${key}`);
                }
            });
        };


        // 组件卸载时，清理计时器
        onUnmounted(() => {
            stopTimer();
        });
        const goToClothing = () => {
            router.push('/clothing');  // 导航到推荐界面
        };
        return {
            // 状态
            locationInput,
            selectedLocation,
            suggestions,
            uvIndex,
            lastUpdated,
            selectedSkinType,
            selectedSkinColorType,
            skinColors,
            tempSelectedSkinType,
            //mapboxInput,

            // 计算属性
            shouldShowSunglasses,
            shouldShowUmbrella,
            shouldShowSunproof,
            shouldShowMask,
            shouldShowHat,

            // 方法
            updateSkinType,
            getLocation,
            getUVData,
            goToClothing,
            //handleLocationInput,
            selectSuggestion,
            getUVLevelText,
            getSPFRecommendation,
            getReapplicationTime,
            getExtraProtectionAdvice,
        };

    }

};

</script>

<style scoped>
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

/* 标题样式 */
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

.left-title {
    font-size: 30px;
    /* 字体大小 */
    font-weight: bold;
    /* 加粗字体 */
    color: #939393;
}

/* 副标题样式 */
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

.home-container {
    display: flex;
    flex-wrap: wrap;
    max-width: 1400px;
    margin: 0 auto;
    padding: 10px;
    font-family: 'Arial', sans-serif;
    color: #5A4132;
}

/* Banner Image */
.banner-container {
    position: relative;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    margin-bottom: 30px;
}

.banner-image {
    width: 100%;
    position: relative;
}

.full-width-banner {
    width: 100%;
    height: 500px;
    object-fit: cover;
    object-position: center 50%;
    display: block;
}

.banner-text-overlay {
    position: absolute;
    top: 80%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 10px;
    max-width: 100%;
}

.banner-text-overlay h1 {
    margin: 0;
    color: #5A4132;
    font-size: 28px;
    font-weight: bold;
}

/* 左右区域 */
.left-section,
.right-section {
    padding: 20px;
}

.left-section {
    flex: 1;
    min-width: 400px;
}

.right-section {
    flex: 1;
    margin-top: 30px;
    min-width: 400px;
}

.uv-section {
    margin: auto;
    width: 50%;
    background: rgba(162, 132, 94, 0.14);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.tip-highlight {
    color: #e82416;
    /* 你可以更改为合适的颜色 */
    font-weight: bold;
}

.section-title {
    font-size: 24px;
    margin-top: 20px;
    margin-bottom: 10px;
    color: #5A4132;
}

.right-section-title {
    font-size: 24px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 10px;
    color: #5A4132;
}

.mapbox-search {
    position: relative;
    margin-bottom: 20px;
}

.mapbox-search input {
    width: 100%;
    padding: 10px 15px;
    border: 2px solid #5A4132;
    border-radius: 25px;
    font-size: 16px;
}

.suggestions-dropdown {
    position: absolute;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 5px 5px;
    background-color: white;
    z-index: 10;
}

.suggestion-item {
    padding: 10px 15px;
    cursor: pointer;
}

.suggestion-item:hover {
    background-color: #f5f5f5;
}

/* 肤质选择 */
.skin-type-selector select {
    width: 100%;
    padding: 10px 15px;
    border: 2px solid #5A4132;
    border-radius: 25px;
    font-size: 16px;
    background-color: white;
    margin-bottom: 20px;
}

/* 肤色选择 */
.skin-color-options {
    display: flex;
    justify-content: space-between;
    margin: 15px 0 30px;
}

.skin-color-item {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.skin-color-divider {
    width: 2px;
    height: 60px;
    background-color: #8B6A40;
    opacity: 0.3;
}

.skin-color-item:hover {
    transform: scale(1.1);
}

.skin-color-item.active {
    transform: scale(1.2);
    box-shadow: 0 0 0 3px #5A4132;
}

/* 防晒建议 */
.sunscreen-recommendations {
    display: flex;
    align-items: center;
    margin: 20px 0;
}

.sunscreen-image {
    flex: 0 0 120px;
}

.sunscreen-image img {
    width: 100%;
    height: auto;
}

.sunscreen-info {
    flex: 1;
    padding-left: 20px;
}

.spf-recommendation {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

.reapplication-time {
    font-size: 18px;
}

/* 额外防护建议 */
.extra-protection-advice {
    margin: 20px 0;
    padding: 15px;
    background-color: #f8f4e9;
    border-radius: 10px;
    border-left: 4px solid #5A4132;
    font-size: 16px;
    line-height: 1.5;
}

.extra-protection-advice p {
    margin: 0;
    color: #5A4132;
}

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

.uv-display {
    text-align: center;
}

.uv-circle {
    background: yellow;
    margin: auto;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
}

.uv-tip {
    font-size: 15px;
    color: #8B6A40;
}
</style>