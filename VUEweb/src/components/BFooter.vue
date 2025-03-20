<template>
    <footer class="site-footer">
      <div class="footer-container">
        <!-- 第一列 - UV SAFE 简介 -->
        <div class="footer-column">
          <h3 class="footer-heading">UV SAFE:</h3>
          <p class="footer-text">
            A go-to platform for sun protection awareness and personalised recommendations.
          </p>
        </div>
        
        <!-- 第二列 - 链接支持 -->
        <div class="footer-column">
          <h3 class="footer-heading">Links Support</h3>
          <ul class="footer-links">
            <li><router-link to="/impacts">UV Impacts</router-link></li>
            <li><router-link to="/alert">Safety Alert</router-link></li>
            <li><router-link to="/shield">My UV-Shield</router-link></li>
            <li><router-link to="/safety-plan">Safety Plan</router-link></li>
          </ul>
        </div>
        
        <!-- 第三列 - 联系我们 -->
        <div class="footer-column">
          <h3 class="footer-heading">Contact Us</h3>
          <p class="footer-text">
            <a href="mailto:info@uv-safe.com.au">info@uv-safe.com.au</a>
          </p>
        </div>
        
        <!-- 第四列 - FAQ -->
        <div class="footer-column">
          <h3 class="footer-heading">FAQ</h3>
          <p class="footer-text">
            <router-link to="/faq">View Frequently Asked Questions</router-link>
          </p>
        </div>
        
        <!-- 第五列 - 关注我们 -->
        <div class="footer-column">
          <h3 class="footer-heading">Follow Us</h3>
          <div class="social-icons">
            <a href="#" class="social-icon" aria-label="Mobile App">
              <span class="icon">📱</span>
            </a>
            <a href="#" class="social-icon" aria-label="Instagram">
              <span class="icon">📷</span>
            </a>
            <a href="#" class="social-icon" aria-label="Twitter">
              <span class="icon">🐦</span>
            </a>
          </div>
        </div>
      </div>
      
      <div class="copyright">
        <p>&copy; 2025 UV-Safe. All rights reserved.</p>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'BFooter'
  }
  </script>
  
  <style scoped>
  .site-footer {
    background-color: #A2845E;
    color: white;
    padding: 40px 0 20px;
    margin-top: auto;
  }
  
  .footer-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 20px;
  }
  
  .footer-column {
    flex: 1;
    min-width: 200px;
    margin-bottom: 30px;
    padding: 0 15px;
  }
  
  .footer-heading {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.3);
    position: relative;
  }
  
  .footer-heading::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 50px;
    height: 2px;
    background-color: white;
  }
  
  .footer-text {
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .footer-links li {
    margin-bottom: 12px;
  }
  
  .footer-links a, .footer-text a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
  }
  
  .footer-links a:hover, .footer-text a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
  
  .social-icons {
    display: flex;
    gap: 15px;
  }
  
  .social-icon {
    font-size: 24px;
    color: white;
    text-decoration: none;
    transition: transform 0.3s;
  }
  
  .social-icon:hover {
    transform: scale(1.2);
  }
  
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: background-color 0.3s;
  }
  
  .social-icon:hover .icon {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .copyright {
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 14px;
  }
  
  /* 响应式调整 */
  @media (max-width: 992px) {
    .footer-column {
      flex: 0 0 33.333%;
    }
  }
  
  @media (max-width: 768px) {
    .footer-column {
      flex: 0 0 50%;
    }
  }
  
  @media (max-width: 576px) {
    .footer-column {
      flex: 0 0 100%;
    }
  }
  </style>