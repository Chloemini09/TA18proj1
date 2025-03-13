<template>
    <div class="admin-community-container">
      <header class="header">
        <h1>Manage Community Posts</h1>
      </header>
  
      <!-- Search and Filter Section -->
      <div class="filter-section">
        <input type="text" v-model="searchText" placeholder="Search by User or Content" class="search-input" />
        <label>
          Sort by Date:
          <select v-model="sortOrder" @change="sortByDate">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </label>
      </div>
  
      <!-- Posts Table -->
      <div class="posts-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Channel</th>
              <th>Title</th>
              <th>Content</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in filteredPosts" :key="post.id">
              <td>{{ post.username }}</td>
              <td>{{ post.channel }}</td>
              <td>{{ post.title }}</td>
              <td>{{ post.content }}</td>
              <td>{{ formatDate(post.timestamp) }}</td>
              <td>
                <button @click="deletePost(post.id)" class="btn-delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
  
  export default {
    setup() {
      const db = getFirestore();
      const posts = ref([]);
      const searchText = ref('');
      const sortOrder = ref('desc');
  
      const fetchPosts = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'posts'));
          posts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          sortByDate();
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      };
  
      const deletePost = async (postId) => {
        if (confirm('Are you sure you want to delete this post?')) {
          try {
            await deleteDoc(doc(db, 'posts', postId));
            posts.value = posts.value.filter(post => post.id !== postId);
            alert('Post deleted successfully');
          } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
          }
        }
      };
  
      const sortByDate = () => {
        posts.value.sort((a, b) => {
          if (sortOrder.value === 'desc') {
            return new Date(b.timestamp.seconds * 1000) - new Date(a.timestamp.seconds * 1000);
          } else {
            return new Date(a.timestamp.seconds * 1000) - new Date(b.timestamp.seconds * 1000);
          }
        });
      };
  
      const filteredPosts = computed(() => {
        return posts.value.filter(post =>
          post.username.toLowerCase().includes(searchText.value.toLowerCase()) ||
          post.content.toLowerCase().includes(searchText.value.toLowerCase())
        );
      });
  
      const formatDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      };
  
      onMounted(() => {
        fetchPosts();
      });
  
      return {
        posts,
        searchText,
        sortOrder,
        deletePost,
        sortByDate,
        filteredPosts,
        formatDate,
      };
    },
  };
  </script>
  
  <style scoped>
  .admin-community-container {
    max-width: 1200px;
    margin: auto;
    padding: 20px;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .filter-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .search-input {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    width: 300px;
  }
  
  .posts-table table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .posts-table th, .posts-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .btn-delete {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .btn-delete:hover {
    background-color: #c0392b;
  }
  </style>