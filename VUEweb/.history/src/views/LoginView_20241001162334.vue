<template>
  <div class="login-container">
    <h1>Sign in</h1>
    <p><input type="text" placeholder="Email" v-model="email" class="form-input" /></p>
    <p><input type="password" placeholder="Password" v-model="password" class="form-input" /></p>
    <p><button @click="signin" class="form-button">Sign in via Firebase</button></p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"
import { getFirestore, doc, getDoc } from "firebase/firestore" 

const email = ref("")
const password = ref("")
const errorMessage = ref("") 
const router = useRouter()
const auth = getAuth()
const db = getFirestore() 

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
          router.push("/") 
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
      if (error.code === 'auth/wrong-password') {
        errorMessage.value = "Incorrect password. Please try again."
      } else if (error.code === 'auth/user-not-found') {
        errorMessage.value = "No user found with this email."
      } else {
        errorMessage.value = "Error: " + error.message
      }
    })
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

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
