<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <input type="email" placeholder="Email" v-model="email" required />
      </div>
      <div class="form-group">
        <input type="password" placeholder="Password" v-model="password" required />
      </div>
      <button type="submit" class="submit-button">Login</button>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// 初始化状态
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();
const auth = getAuth();
const db = getFirestore();

const login = () => {
  errorMessage.value = ""; // 重置错误消息
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(async (userCredential) => {
      console.log("Login Successful!");

      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        
        // 根据用户的角色跳转到不同的页面
        if (userRole === "admin") {
          router.push("/admin");
        } else if (userRole === "user") {
          router.push("/home");
        } else {
          errorMessage.value = "Unknown user role. Access denied.";
        }
      } else {
        errorMessage.value = "User role not found in database.";
      }
    })
    .catch((error) => {
      if (error.code === 'auth/wrong-password') {
        errorMessage.value = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage.value = "No user found with this email.";
      } else {
        errorMessage.value = "Error: " + error.message;
      }
    });
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #45a049;
}

.error-message {
  color: red;
  font-size: 0.85em;
  text-align: center;
  margin-top: 10px;
}
</style>
