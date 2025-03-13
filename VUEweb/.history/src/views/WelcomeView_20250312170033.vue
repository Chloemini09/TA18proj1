<template>
  <div class="uv-info-container" v-keyboard-navigation>
    <header class="uv-header">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="UV Safe Logo" class="logo" />
      </div>
      <nav class="uv-nav">
        <router-link ref="aboutLink" to="/about" class="nav-item">ABOUT</router-link>
        <router-link ref="contactLink" to="/contact" class="nav-item">CONTACT</router-link>
      </nav>
    </header>

    <section class="info-section">
      <h1 class="info-title">Please tell us your information</h1>
      
      <div class="form-container">
        <div class="form-left">
          <img src="@/assets/info.png" alt="Sunscreen Protection" class="info-image" />
        </div>
        
        <div class="form-right">
          <div class="form-group">
            <label for="age" class="form-label">AGE</label>
            <input 
              ref="ageInput"
              type="number" 
              id="age" 
              v-model="userInfo.age" 
              class="form-input" 
              @keydown.enter="focusSexInput"
            />
          </div>
          
          <div class="form-group">
            <label for="sex" class="form-label">SEX</label>
            <input 
              ref="sexInput"
              type="text" 
              id="sex" 
              v-model="userInfo.sex" 
              class="form-input" 
              @keydown.enter="focusSkinTypeInput"
            />
          </div>
          
          <div class="form-group">
            <label for="skinColor" class="form-label">SKIN COLOR</label>
            <div class="skin-color-selector">
              <div 
                v-for="(color, index) in skinColors" 
                :key="index"
                :class="['skin-color-option', {'selected': userInfo.skinColor === color}]"
                :style="{ backgroundColor: color }"
                @click="selectSkinColor(color)"
                tabindex="0"
                @keydown.enter="selectSkinColor(color)"
                @keydown.space.prevent="selectSkinColor(color)"
              ></div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="skinType" class="form-label">SKIN TYPE</label>
            <input 
              ref="skinTypeInput"
              type="text" 
              id="skinType" 
              v-model="userInfo.skinType" 
              class="form-input" 
              @keydown.enter="focusLocationInput"
            />
          </div>
          
          <div class="form-group">
            <label for="location" class="form-label">LOCATION</label>
            <input 
              ref="locationInput"
              type="text" 
              id="location" 
              v-model="userInfo.location" 
              class="form-input" 
              @keydown.enter="submitInfo"
            />
          </div>
          
          <div class="submit-container">
            <button 
              ref="submitBtn"
              @click="submitInfo" 
              class="btn-submit"
              @keydown.enter="submitInfo"
            >
              SUBMIT TO GET ADVICE
            </button>
          </div>
        </div>
      </div>
    </section>
    
    <footer class="uv-footer">
      <p>Take care of your skin from sunshine.</p>
    </footer>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    
    // Refs for form elements
    const ageInput = ref(null);
    const sexInput = ref(null);
    const skinTypeInput = ref(null);
    const locationInput = ref(null);
    const submitBtn = ref(null);
    const aboutLink = ref(null);
    const contactLink = ref(null);
    
    // Available skin colors
    const skinColors = [
      '#8B4513', // SaddleBrown
      '#CD853F', // Peru
      '#DEB887', // BurlyWood
      '#F5DEB3', // Wheat
      '#FFE4C4'  // Bisque
    ];
    
    // User information object
    const userInfo = reactive({
      age: '',
      sex: '',
      skinColor: skinColors[2], // Default selection
      skinType: '',
      location: ''
    });
    
    // Select skin color
    function selectSkinColor(color) {
      userInfo.skinColor = color;
    }
    
    // Focus functions for keyboard navigation
    function focusSexInput() {
      sexInput.value.focus();
    }
    
    function focusSkinTypeInput() {
      skinTypeInput.value.focus();
    }
    
    function focusLocationInput() {
      locationInput.value.focus();
    }
    
    // Submit user information
    function submitInfo() {
      // Validate form
      if (!userInfo.age || !userInfo.sex || !userInfo.skinType || !userInfo.location) {
        alert('Please fill in all fields');
        return;
      }
      
      // Save to localStorage
      localStorage.setItem('uvUserInfo', JSON.stringify(userInfo));
      
      // Navigate to advice page
      router.push('/uv-advice');
    }
    
    onMounted(() => {
      // Check if user data exists in localStorage
      const savedUserInfo = localStorage.getItem('uvUserInfo');
      if (savedUserInfo) {
        Object.assign(userInfo, JSON.parse(savedUserInfo));
      }
      
      // Set initial focus
      ageInput.value.focus();
    });
    
    return {
      userInfo,
      skinColors,
      selectSkinColor,
      submitInfo,
      // Return refs for template
      ageInput,
      sexInput,
      skinTypeInput,
      locationInput,
      submitBtn,
      aboutLink,
      contactLink,
      // Return focus functions
      focusSexInput,
      focusSkinTypeInput,
      focusLocationInput
    };
  }
}
</script>

<style scoped>
.uv-info-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  font-family: Arial, sans-serif;
}

.uv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 50px;
  object-fit: contain;
}

.uv-nav {
  display: flex;
  gap: 2rem;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 0;
}

.nav-item:hover {
  color: #a67c52;
}

.info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  flex-grow: 1;
}

.info-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 3rem;
  text-align: center;
}

.form-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 3rem;
}

.form-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: cover;
}

.form-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 1.2rem;
  color: #a67c52;
  font-weight: 500;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.skin-color-selector {
  display: flex;
  gap: 0.5rem;
}

.skin-color-option {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.skin-color-option:hover, .skin-color-option.selected {
  transform: scale(1.1);
  box-shadow: 0 0 0 2px #a67c52;
}

.submit-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.btn-submit {
  background-color: #a67c52;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover {
  background-color: #8b6b43;
}

.uv-footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid #e0e0e0;
  font-size: 1rem;
  color: #666;
}

@media (max-width: 768px) {
  .form-container {
    flex-direction: column;
  }
  
  .form-left {
    margin-bottom: 2rem;
  }
}
</style>