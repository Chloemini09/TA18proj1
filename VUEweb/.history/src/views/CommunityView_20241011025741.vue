<template>
  <div class="community-feed-view">
    <header class="header">
      <img src="@/assets/logo.png" alt="Community Logo" class="logo" />
      <div class="header-text">
        <h1>Community Feed</h1>
        <p>{{ formattedDate }}</p>
      </div>
    </header>

    <section class="latest-posts">
      <h2>Latest Posts</h2>
      <div v-if="latestPosts.length === 0">No posts available.</div>
      <div v-else class="post-card" v-for="post in latestPosts" :key="post.id">
        <h3>{{ post.title }}</h3>
        <p><strong>Channel:</strong> {{ post.channel }}</p>
        <p><strong>Posted by:</strong> {{ post.username }}</p>
        <p>{{ post.content }}</p>
        <p class="post-date">Posted on: {{ new Date(post.timestamp.seconds * 1000).toLocaleDateString() }}</p>
      </div>
    </section>

    <section class="channel-filter">
      <h2>Channels</h2>
      <div class="channel-buttons">
        <button 
          v-for="ch in channels" 
          :key="ch" 
          @click="filterByChannel(ch)" 
          :class="{'selected-channel': selectedChannel === ch, 'channel-button': true}">
          {{ ch }}
        </button>
      </div>
    </section>

    <section class="filtered-posts" v-if="selectedChannel">
      <h2>Posts in {{ selectedChannel }} Channel</h2>
      <div v-if="filteredPosts.length === 0">No posts available in this channel.</div>
      <div v-else class="post-card" v-for="post in filteredPosts" :key="post.id">
        <h3>{{ post.title }}</h3>
        <p><strong>Posted by:</strong> {{ post.username }}</p>
        <p>{{ post.content }}</p>
        <p class="post-date">Posted on: {{ new Date(post.timestamp.seconds * 1000).toLocaleDateString() }}</p>
      </div>
    </section>

    <button @click="goToPostPage" class="floating-post-button">Post</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const db = getFirestore();
const router = useRouter();
const formattedDate = new Date().toLocaleDateString();

const latestPosts = ref([]);
const filteredPosts = ref([]);
const selectedChannel = ref('');
const channels = ['Life', 'Treatment', 'Education', 'Entertainment', 'Help', 'Other'];

const fetchLatestPosts = async () => {
  const querySnapshot = await getDocs(collection(db, 'posts'));
  const allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  latestPosts.value = allPosts.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds).slice(0, 3);
};

const filterByChannel = (channel) => {
  selectedChannel.value = channel;
  fetchFilteredPosts(channel);
};

const fetchFilteredPosts = async (channel) => {
  const querySnapshot = await getDocs(collection(db, 'posts'));
  const allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filteredPosts.value = allPosts.filter(post => post.channel === channel);
};

const goToPostPage = () => {
  router.push('/post');
};

onMounted(() => {
  fetchLatestPosts();
});
</script>

<style scoped>
.community-feed-view {
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
.latest-posts, .channel-filter, .filtered-posts {
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
.channel-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.channel-button {
  padding: 10px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.channel-button:hover {
  background-color: #45a049;
}
.selected-channel {
  background-color: white;
  color: #4caf50;
  border: 2px solid #4caf50;
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