<template>
  <div class="community-view">
    <header class="header">
      <img src="@/assets/logo.png" alt="Community Logo" class="logo" />
      <div class="header-text">
        <h1>Community</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>

    <section class="user-posts">
      <h2>My Posts</h2>
      <div v-if="userPosts.length === 0">You have not made any posts yet.</div>
      <div v-else class="post-card" v-for="post in userPosts" :key="post.id">
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
        <p class="post-date">Posted on: {{ new Date(post.timestamp.seconds * 1000).toLocaleDateString() }}</p>
      </div>
    </section>

    <section class="group-chat">
      <h2>Group Chat</h2>
      <div v-if="!isMember">
        <button @click="applyToJoinGroup" class="green-button">Apply to Join Group</button>
      </div>
      <div v-else class="chat-box">
        <div class="chat-messages">
          <div v-for="message in groupMessages" :key="message.id" class="chat-message">
            <p><strong>{{ message.username }}:</strong> {{ message.content }}</p>
          </div>
        </div>
        <div class="chat-input">
          <input type="text" v-model="newMessage" placeholder="Type your message..." />
          <button @click="sendMessage" class="green-button">Send</button>
        </div>
      </div>
    </section>

    <button @click="goToPostPage" class="floating-post-button">Post</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router';

const db = getFirestore();
const auth = getAuth();
const router = useRouter();
const formattedDate = new Date().toLocaleDateString();

const userPosts = ref([]);
const groupMessages = ref([]);
const newMessage = ref('');
const isMember = ref(false);

const fetchUserPosts = async () => {
  const user = auth.currentUser;
  if (user) {
    const querySnapshot = await getDocs(collection(db, 'posts'));
    userPosts.value = querySnapshot.docs
      .filter(doc => doc.data().userId === user.uid)
      .map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

const fetchGroupMessages = async () => {
  const querySnapshot = await getDocs(collection(db, 'groupMessages'));
  groupMessages.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const applyToJoinGroup = () => {
  // Simulating the user becoming a group member
  isMember.value = true;
  alert('You have successfully joined the group!');
};

const sendMessage = async () => {
  const user = auth.currentUser;
  if (user && newMessage.value.trim() !== '') {
    try {
      await addDoc(collection(db, 'groupMessages'), {
        userId: user.uid,
        username: user.displayName || 'Anonymous',
        content: newMessage.value,
        timestamp: serverTimestamp(),
      });
      newMessage.value = '';
      fetchGroupMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  }
};

const goToPostPage = () => {
  router.push('/post');
};

onMounted(() => {
  fetchUserPosts();
  fetchGroupMessages();
});
</script>

<style scoped>
.community-view {
  max-width: 800px;
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
.user-posts, .group-chat {
  margin-bottom: 30px;
}
.post-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #fff;
}
.post-date {
  font-size: 0.9em;
  color: #555;
}
.chat-box {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
}
.chat-messages {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
}
.chat-message {
  margin-bottom: 10px;
}
.chat-input {
  display: flex;
  gap: 10px;
}
.chat-input input[type="text"] {
  flex-grow: 1;
  padding: 8px;
}
.green-button {
  padding: 10px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.green-button:hover {
  background-color: #45a049;
}
.floating-post-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}
.floating-post-button:hover {
  background-color: #45a049;
}
</style>