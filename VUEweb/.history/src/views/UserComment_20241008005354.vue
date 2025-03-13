<template>
    <div class="comment-list-container">
      <header class="header">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <div class="header-text">
          <h1>User Comments</h1>
          <p>{{ currentDate }}</p>
        </div>
      </header>
      <button class="back-btn" @click="goBack">← Back</button>
  
      <!-- Search input for Username and Email -->
      <section class="filters">
        <label>
          Search by Username or Email:
          <input type="text" v-model="searchQuery" placeholder="Search..." />
        </label>
  
        <!-- Sort by Date -->
        <label>
          Sort by Date: 
          <select v-model="dateSortOrder" @change="sortByDate">
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
        </label>
      </section>
  
      <!-- Comments Grid -->
      <div class="comment-grid">
        <div class="comment-item" v-for="(comment, index) in paginatedComments" :key="comment.timestamp">
          <p><strong>Username:</strong> {{ comment.username || 'N/A' }}</p> <!-- Display username -->
          <p><strong>User Email:</strong> {{ comment.userEmail }}</p>
          <p><strong>Date:</strong> {{ formatDate(new Date(comment.timestamp.seconds * 1000)) }}</p>
  
          <!-- Show partial content, click button for full comment -->
          <p><strong>Comment:</strong> 
            <span>{{ comment.advice.slice(0, 20) }}...</span>
            <button @click="openModal(comment)" class="toggle-btn">Show More</button>
          </p>
        </div>
      </div>
  
      <!-- Pagination -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">Next</button>
      </div>
  
      <!-- Modal for showing full comment content -->
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h2>User Email: {{ selectedComment.userEmail }}</h2>
          <p><strong>Username:</strong> {{ selectedComment.username || 'N/A' }}</p>
          <p><strong>Date:</strong> {{ formatDate(new Date(selectedComment.timestamp.seconds * 1000)) }}</p>
          <p><strong>Comment:</strong> {{ selectedComment.advice }}</p>
          <button @click="closeModal" class="close-btn">Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getFirestore, collection, query, getDocs, orderBy } from 'firebase/firestore';
  
  const db = getFirestore();
  const router = useRouter();
  
  const goBack = () => {
    router.push('/admin');
  }
  
  const currentDate = new Date().toLocaleDateString();
  const comments = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = 10;
  const dateSortOrder = ref('recent');
  const searchQuery = ref(''); // Search query for filtering comments
  
  // Modal handling
  const isModalOpen = ref(false);
  const selectedComment = ref({});
  
  const openModal = (comment) => {
    selectedComment.value = comment;
    isModalOpen.value = true;
  }
  
  const closeModal = () => {
    isModalOpen.value = false;
  }
  
  // Fetch comments from Firestore
  const getComments = async () => {
    const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    comments.value = querySnapshot.docs.map(doc => doc.data());
  }
  onMounted(getComments);
  
  // Sorting comments by date
  const sortByDate = () => {
    if (dateSortOrder.value === 'recent') {
      comments.value.sort((a, b) => new Date(b.timestamp.seconds * 1000) - new Date(a.timestamp.seconds * 1000));
    } else {
      comments.value.sort((a, b) => new Date(a.timestamp.seconds * 1000) - new Date(b.timestamp.seconds * 1000));
    }
  }
  
  // Filter comments by search query (username or email)
  const filteredComments = computed(() => {
    const query = searchQuery.value.toLowerCase();
    return comments.value.filter(comment => 
      comment.userEmail.toLowerCase().includes(query) ||
      (comment.username && comment.username.toLowerCase().includes(query)) // Optional username field
    );
  })
  
  // Pagination
  const paginatedComments = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredComments.value.slice(start, end);
  })
  
  const totalPages = computed(() => Math.ceil(filteredComments.value.length / itemsPerPage));
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
  }
  
  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
  }
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString();
  }
  </script>
  
  <style scoped>
  .comment-list-container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    position: relative;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #ddd;
  }
  .logo {
    width: 60px;
    height: auto;
  }
  .header-text {
    flex-grow: 1;
    text-align: right;
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
  .filters {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  .comment-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .comment-item {
    border-radius: 10px;
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    min-height: 150px;
    width: 100%; 
    max-width: 350px;
  }
  .toggle-btn {
    background: none;
    border: none;
    color: #4CAF50;
    cursor: pointer;
    margin-left: 5px;
  }
  .toggle-btn:hover {
    text-decoration: underline;
  }
  .pagination-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 500px;
    width: 100%;
    word-wrap: break-word;
    white-space: normal;
  }
  .close-btn {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    margin-top: 20px;
    border-radius: 5px;
  }
  </style>
  