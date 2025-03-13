<template>
  <div class="admin-user-view">
    <header class="header">
      <h1>User List</h1>
    </header>
    <div class="user-list">
      <div class="user-card" v-for="user in users" :key="user.id">
        <img :src="user.avatarUrl" alt="User Avatar" class="avatar" />
        <div class="user-info">
          <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Country:</strong> {{ user.country }}</p>
          <p><strong>Gender:</strong> {{ user.gender }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';

export default {
  setup() {
    const db = getFirestore();
    const storage = getStorage();
    const users = ref([]);

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let avatarUrl = '';
          if (data.avatarUrl) {
            avatarUrl = data.avatarUrl;
          } else {
            const defaultAvatarRef = storageRef(storage, 'avatars/defaultuserphoto.jpeg');
            avatarUrl = await getDownloadURL(defaultAvatarRef);
          }
          return {
            id: doc.id,
            username: data.username || 'N/A',
            email: data.email || 'N/A',
            country: data.country || 'N/A',
            gender: data.gender || 'N/A',
            avatarUrl
          };
        }));
        users.value = userData;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    onMounted(fetchUsers);

    return {
      users
    };
  }
}
</script>

<style scoped>
.admin-user-view {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: 200px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.user-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}
</style>