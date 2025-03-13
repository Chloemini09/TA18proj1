<template>
  <div class="admin-user-view">
    <header class="header">
      <img src="@/assets/logo.png" alt="Health Test Logo" class="logo" />
      <div class="header-text">
        <h1>Manage Users</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>

    <button class="back-btn" @click="goBack">← Back</button>

    <section class="user-search">
      <h2>Search Users</h2>
      <div class="search-filters">
        <label for="filterType">Select Filter:</label>
        <select v-model="selectedFilter" id="filterType">
          <option value="userName">User Name</option>
          <option value="userEmail">Email</option>
          <option value="userRole">Role</option>
        </select>
      </div>
      <input type="text" v-model="searchTerm" :placeholder="`Search by ${selectedFilter}`" />
      <button @click="filterUsers" class="green-button">Search</button>
      <button @click="clearSearch" class="green-button">Clear</button>
    </section>

    <section class="user-list">
      <h2>User List</h2>
      <div v-if="filteredUsers.length === 0">No users found.</div>
      <div v-else>
        <table class="user-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.userName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button @click="editUser(user)" class="green-button">Edit</button>
                <button @click="deleteUser(user.id)" class="red-button">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'vue-router'

const db = getFirestore();
const users = ref([]);
const filteredUsers = ref([]);
const searchTerm = ref('');
const formattedDate = new Date().toLocaleDateString();
const selectedFilter = ref('userName');
const router = useRouter()

const goBack = () => {
    router.push('/admin') // 返回上一个路由视图
  }
const fetchUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  users.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filteredUsers.value = users.value;
};

const filterUsers = () => {
  const term = searchTerm.value.toLowerCase();
  filteredUsers.value = users.value.filter(user => {
    return user[selectedFilter.value].toLowerCase().includes(term);
  });
};

const clearSearch = () => {
  searchTerm.value = '';
  filteredUsers.value = users.value;
};

const editUser = (user) => {
  alert(`Edit user: ${user.userName}`);
  // Add edit logic here
};

const deleteUser = async (userId) => {
  const confirmed = confirm('Are you sure you want to delete this user?');
  if (confirmed) {
    await deleteDoc(doc(db, 'users', userId));
    alert('User deleted successfully');
    fetchUsers();
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.admin-user-view {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.logo {
  width: 60px;
  height: auto;
}
.header-text {
  flex-grow: 1;
  text-align: right;
}
.user-search, .user-list {
  margin-bottom: 30px;
}
.search-filters {
  margin-bottom: 10px;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th, .user-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
.user-table th {
  background-color: #f4f4f4;
}
.green-button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.green-button:hover {
  background-color: #45a049;
}
.back-btn {
    background-color: transparent;
    border: none;
    font-size: 1.2rem;
    color: #4caf50;
    cursor: pointer;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  
.back-btn:hover {
    text-decoration: underline;
  }
.red-button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  background-color: #f44336;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.red-button:hover {
  background-color: #e53935;
}
input[type="text"] {
  margin-bottom: 10px;
  padding: 8px;
  width: calc(100% - 16px);
}
</style>