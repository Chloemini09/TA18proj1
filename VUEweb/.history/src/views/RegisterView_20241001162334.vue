<template>
  <div class="create-account-container">
    <h1>Create an Account</h1>
    <form @submit.prevent="register" class="create-account-form">
      <div class="form-group">
        <input type="email" placeholder="Email" v-model="email" required />
      </div>
      <div class="form-group">
        <input type="password" placeholder="Password" v-model="password" required />
      </div>
      <button type="submit" class="submit-button">Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"
import { getFirestore, doc, setDoc } from "firebase/firestore"
const email = ref("")
const password = ref("")
const router = useRouter()
const auth = getAuth()
const db = getFirestore()
const register = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(async (data) => {
      console.log("Firebase Register Successfully!")
      const user = data.user
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user" 
      })
      router.push("/fireLogin")
    })
    .catch((error) => {
      console.log(error.code)
    })
}
</script>


<style scoped>
.create-account-container {
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

.create-account-form {
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
</style>