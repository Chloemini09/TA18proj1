<template>
  <div class="create-account-container">
    <h1>Create an Account</h1>
    <form @submit.prevent="register" class="create-account-form">
      <div class="form-group">
        <input type="text" placeholder="Username" v-model="username" required />
      </div>
      <div class="form-group">
        <input type="email" placeholder="Email" v-model="email" required />
      </div>
      <div class="form-group">
        <input type="password" placeholder="Password" v-model="password" required />
        <small v-if="passwordError" class="error-message">{{ passwordError }}</small>
      </div>
      <div class="form-group">
        <select v-model="gender" required>
          <option value="" disabled>Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <input type="text" placeholder="Country" v-model="country" required />
      </div>
      <button type="submit" class="submit-button">Register</button>
    </form>
    <button @click="googleRegister" class="google-button">
      Sign up/Login with Google
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useRouter } from "vue-router"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const username = ref("")
const email = ref("")
const password = ref("")
const gender = ref("")
const country = ref("")
const passwordError = ref("")
const router = useRouter()
const auth = getAuth()
const db = getFirestore()

// 验证密码
const validatePassword = (password) => {
  const lengthCheck = password.length >= 8
  const letterCheck = /[a-zA-Z]/.test(password)
  const numberCheck = /\d/.test(password)
  const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (!lengthCheck) return "Password must be at least 8 characters long."
  if (!letterCheck) return "Password must contain at least one letter."
  if (!numberCheck) return "Password must contain at least one number."
  if (!specialCharCheck) return "Password must contain at least one special character."
  
  return ""
}

// 注册用户
const register = () => {
  passwordError.value = validatePassword(password.value)
  
  if (passwordError.value) return

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(async (data) => {
      console.log("Firebase 注册成功！")
      const user = data.user

      // 保存用户信息到 Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username.value,
        email: user.email,
        gender: gender.value,
        country: country.value,
        role: "user"
      })

      // 发送欢迎邮件
      sendWelcomeEmail(user.email, username.value)

      router.push("/login")
    })
    .catch((error) => {
      console.log(error.code)
    })
}

// 发送欢迎邮件
const sendWelcomeEmail = (email, username) => {
  fetch('https://<your-cloud-function-url>/sendWelcomeEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, username })
  })
  .then(response => response.json())
  .then(data => {
    console.log('邮件发送成功:', data)
  })
  .catch((error) => {
    console.error('邮件发送错误:', error)
  })
}

// Google 登录/注册
const googleRegister = () => {
  const provider = new GoogleAuthProvider()

  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user
      console.log("Google 注册/登录成功!", user)

      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, {
        username: user.displayName || "Google User",
        email: user.email,
        gender: "unknown",
        country: "unknown",
        role: "user"
      }, { merge: true })

      router.push("/home")
    })
    .catch((error) => {
      console.log("Google 登录错误: ", error)
    })
}
</script>
