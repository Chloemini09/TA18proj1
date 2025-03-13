<template>
  <div class="user-courses">
    <header class="header">
      <h1>Courses</h1>
    </header>

    <!-- Latest Videos Section -->
    <div class="latest-videos">
      <h2>Latest Courses</h2>
      <div class="latest-videos-grid">
        <div v-for="course in latestCourses" :key="course.id" class="latest-video-card">
          <video controls :src="course.videoUrl" class="video"></video>
          <h3>{{ course.title }}</h3>
          <p><strong>Category:</strong> {{ course.category }}</p>
          <div class="interaction-section">
            <button @click="likeCourse(course.id)" class="btn-like">Like ({{ course.likes || 0 }})</button>
            <button @click="addComment(course.id)" class="btn-comment">Comment</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Channel Filter Section -->
    <div class="channel-filter">
      <button v-for="channel in channels" :key="channel" @click="filterByChannel(channel)" :class="{ 'active-channel': selectedChannel === channel }">
        {{ channel }}
      </button>
    </div>

    <!-- Course List Section -->
    <div class="course-list">
      <h2>Courses by Category</h2>
      <div v-if="filteredCourses.length === 0">
        <p>No courses available in this category.</p>
      </div>
      <div class="course-card-row" v-for="(courseRow, index) in courseRows" :key="index">
        <div v-for="course in courseRow" :key="course.id" class="course-card">
          <video controls :src="course.videoUrl" class="video"></video>
          <h3>{{ course.title }}</h3>
          <p><strong>Category:</strong> {{ course.category }}</p>
          <div class="interaction-section">
            <button @click="likeCourse(course.id)" class="btn-like">Like ({{ course.likes || 0 }})</button>
            <button @click="addComment(course.id)" class="btn-comment">Comment</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';

export default {
  setup() {
    const db = getFirestore();
    const courses = ref([]);
    const selectedChannel = ref('All');
    const channels = ['All', 'ADHD', 'BIPOLAR DISORDER', 'GENDER', 'anxiety', 'TEEN', 'EATING PROBLEMS', 'PTSD', 'SOCIAL ANXIETY', 'SLEEP DISORDERS', 'Other'];
    const filteredCourses = ref([]);
    const latestCourses = ref([]);

    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        courses.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filterCourses();
        getLatestCourses();
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const filterByChannel = (channel) => {
      selectedChannel.value = channel;
      filterCourses();
    };

    const filterCourses = () => {
      if (selectedChannel.value === 'All') {
        filteredCourses.value = courses.value;
      } else {
        filteredCourses.value = courses.value.filter(course => course.category === selectedChannel.value);
      }
    };

    const getLatestCourses = () => {
      latestCourses.value = [...courses.value].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    };

    const likeCourse = async (courseId) => {
      try {
        const courseRef = doc(db, 'courses', courseId);
        const course = courses.value.find(c => c.id === courseId);
        if (course) {
          const newLikes = (course.likes || 0) + 1;
          await updateDoc(courseRef, { likes: newLikes });
          course.likes = newLikes;
        }
      } catch (error) {
        console.error('Error liking course:', error);
      }
    };

    const addComment = (courseId) => {
      const comment = prompt('Enter your comment:');
      if (comment) {
        const courseRef = doc(db, 'courses', courseId);
        updateDoc(courseRef, {
          comments: arrayUnion({ comment, timestamp: new Date() })
        }).then(() => {
          alert('Comment added successfully!');
        }).catch((error) => {
          console.error('Error adding comment:', error);
        });
      }
    };

    onMounted(() => {
      fetchCourses();
    });

    const courseRows = computed(() => {
      const rows = [];
      for (let i = 0; i < filteredCourses.value.length; i += 3) {
        rows.push(filteredCourses.value.slice(i, i + 3));
      }
      return rows;
    });

    return {
      courses,
      latestCourses,
      selectedChannel,
      channels,
      filteredCourses,
      fetchCourses,
      filterByChannel,
      likeCourse,
      addComment,
      courseRows,
    };
  },
};
</script>

<style scoped>
.user-courses {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.latest-videos-grid {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.latest-video-card {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-align: center;
}

.video {
  width: 100%;
  height: 200px;
  margin-bottom: 10px;
}

.interaction-section {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.btn-like, .btn-comment {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-like:hover, .btn-comment:hover {
  background-color: #388e3c;
}

.channel-filter {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.channel-filter button {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1rem;
}

.channel-filter button.active-channel {
  background-color: #4caf50;
  color: white;
}

.channel-filter button:hover {
  background-color: #d3d3d3;
}

.course-list {
  margin-top: 40px;
}

.course-card-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.course-card {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-align: center;
}
</style>