<template>
  <div class="login-container">
    <button class="back-btn" @click="goBack">← Back</button>
    <h1>Sign in</h1>
    <p><input type="text" placeholder="Email" v-model="email" class="form-input" /></p>
    <p><input type="password" placeholder="Password" v-model="password" class="form-input" /></p>
    <p><button @click="signin" class="form-button">Sign in</button></p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- 忘记密码按钮 -->
    <p><a href="#" @click.prevent="forgotPassword">Forgot your password?</a></p>

    <!-- Google 登录按钮 -->
    <p><button @click="googleSignin" class="google-button">Sign in with Google</button></p>

    <!-- 自定义模态框 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <p>Account does not exist. Would you like to register a new account?</p>
        <button @click="registerUser">Yes, register</button>
        <button @click="goHome">No, go home</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth"
import { useRouter } from "vue-router"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/firebase/init"
import { useRouter } from 'vue-router'

const email = ref("")
const password = ref("")
const errorMessage = ref("") 
const router = useRouter()
const showModal = ref(false)

const goBack = () => {
  router.push('/')
}
const signin = () => {
  errorMessage.value = "" 
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(async (data) => {
      console.log("Login Successful!")
      
      const user = data.user
      const userDoc = await getDoc(doc(db, "users", user.uid))
      
      if (userDoc.exists()) {
        const userRole = userDoc.data().role
        
        if (userRole === "admin") {
          router.push("/admin") 
        } else if (userRole === "user") {
          router.push("/home") 
        } else {
          console.log("Unknown role: " + userRole) 
          errorMessage.value = "Unauthorized role."
        }
      } else {
        console.log("No such user in Firestore!")
        errorMessage.value = "User not found in database."
      }
    })
    .catch((error) => {
      console.log(error.code)
      if (error.code === 'auth/user-not-found') {
        // 当用户未找到时，显示注册提示
        showModal.value = true
      } else if (error.code === 'auth/wrong-password') {
        errorMessage.value = "Incorrect password. Please try again."
      } else {
        errorMessage.value = "Error: " + error.message
      }
    })
}

// Google 登录逻辑
const googleSignin = () => {
  const provider = new GoogleAuthProvider()

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user
      console.log("Google Login Successful!", user)

      const userDoc = await getDoc(doc(db, "users", user.uid))
      
      if (userDoc.exists()) {
        const userRole = userDoc.data().role
        
        if (userRole === "admin") {
          router.push("/admin") 
        } else if (userRole === "user") {
          router.push("/home") 
        } else {
          console.log("Unknown role: " + userRole)
          errorMessage.value = "Unauthorized role."
        }
      } else {
        // 如果用户不存在于 Firestore，创建新用户
        await setDoc(doc(db, "users", user.uid), {
          username: user.displayName || "Google User",
          email: user.email,
          role: "user"  // 默认角色为 user
        })
        router.push("/home")
      }
    })
    .catch((error) => {
      console.error("Google Sign-In Error: ", error)
      errorMessage.value = "Error: " + error.message
    })
}

// 忘记密码逻辑
const forgotPassword = () => {
  if (!email.value) {
    errorMessage.value = "Please enter your email to reset your password."
    return
  }
  
  sendPasswordResetEmail(auth, email.value)
    .then(() => {
      alert("Password reset email sent! Please check your inbox.")
    })
    .catch((error) => {
      console.error("Error sending password reset email:", error)
      errorMessage.value = "Error: " + error.message
    })
}

// 模态框按钮逻辑
const registerUser = () => {
  showModal.value = false
  router.push("/register")
}

const goHome = () => {
  showModal.value = false
  router.push("/")
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
}

h1 {
  text-align: center;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.form-button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.form-button:hover {
  background-color: #218838;
}

.google-button {
  background-color: #4285F4;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}

.google-button:hover {
  background-color: #357ae8;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}

/* 模态框样式 */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}
</style>
