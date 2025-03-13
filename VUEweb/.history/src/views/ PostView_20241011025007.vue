<template>
    <div class="post-creation-view">
      <header class="header">
        <img src="@/assets/logo.png" alt="Post Logo" class="logo" />
        <div class="header-text">
          <h1>Create Post</h1>
          <p>{{ formattedDate }}</p>
        </div>
      </header>
  
      <section class="post-form">
        <h2>New Post</h2>
        <div>
          <label for="title">Title:</label>
          <input type="text" v-model="title" id="title" />
        </div>
  
        <div class="channels">
          <label>Channel:</label>
          <div class="channel-buttons">
            <button 
              v-for="ch in channels" 
              :key="ch" 
              @click="selectChannel(ch)" 
              :class="{'selected-channel': selectedChannel === ch, 'channel-button': true}">
              {{ ch }}
            </button>
          </div>
        </div>
  
        <div>
          <label for="content">Content:</label>
          <textarea v-model="content" id="content"></textarea>
        </div>
  
        <button @click="createPost" class="green-button">Submit Post</button>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  
  const db = getFirestore();
  const auth = getAuth();
  const formattedDate = new Date().toLocaleDateString();
  
  const title = ref('');
  const content = ref('');
  const channels = ['Life', 'Treatment', 'Education', 'Entertainment', 'Help', 'Other'];
  const selectedChannel = ref('');
  
  const selectChannel = (channel) => {
    selectedChannel.value = channel;
  };
  
  const createPost = async () => {
    const user = auth.currentUser;
    if (user && title.value.trim() && content.value.trim() && selectedChannel.value) {
      try {
        await addDoc(collection(db, 'posts'), {
          userId: user.uid,
          username: user.displayName || 'Anonymous',
          title: title.value,
          channel: selectedChannel.value,
          content: content.value,
          timestamp: serverTimestamp(),
        });
        alert('Post created successfully!');
        title.value = '';
        content.value = '';
        selectedChannel.value = '';
      } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
      }
    } else {
      alert('Please fill in all fields and select a channel.');
    }
  };
  </script>
  
  <style scoped>
  .post-creation-view {
    max-width: 600px;
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
  .post-form {
    margin-bottom: 30px;
  }
  .post-form label {
    display: block;
    margin-top: 10px;
  }
  .post-form input[type="text"], .post-form textarea {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
  }
  textarea {
    resize: vertical;
    height: 150px;
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
  .green-button {
    margin-top: 20px;
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
  </style>