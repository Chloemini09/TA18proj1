<template>
  <div class="user-courses">
    <header class="header">
      <h1>User Courses</h1>
    </header>

    <div class="latest-videos">
      <h2>Latest Videos by Channel</h2>
      <div class="channel-grid">
        <div class="channel-card" v-for="channel in channels.slice(1)" :key="channel">
          <h3>{{ channel }}</h3>
          <div class="video-grid">
            <div class="video-card" v-for="course in getLatestVideos(channel)" :key="course.id">
              <img :src="course.coverUrl" alt="Cover Image" class="video-cover" />
              <h4>{{ course.title }}</h4>
              <p><strong>Category:</strong> {{ course.category }}</p>
              <div class="actions">
                <button @click="likeCourse(course)" class="btn-like">
                  👍 {{ course.likes }}
                </button>
                <button @click="openComments(course)" class="btn-comment">
                  💬 Comments
                </button>
              </div>
              <div v-if="selectedCourse && selectedCourse.id === course.id" class="comments-section">
                <div v-for="comment in course.comments" :key="comment.id" class="comment">
                  <strong>{{ comment.user }}:</strong> {{ comment.text }}
                </div>
                <textarea v-model="newComment" placeholder="Add a comment..."></textarea>
                <button @click="addComment(course)" class="btn-add-comment">Add Comment</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

export default {
  setup() {
    const courses = ref([]);
    const selectedChannel = ref('All');
    const channels = ['All', 'ADHD', 'BIPOLAR DISORDER', 'GENDER', 'anxiety', 'TEEN', 'EATING PROBLEMS', 'PTSD', 'SOCIAL ANXIETY', 'SLEEP DISORDERS', 'Other'];
    const filteredCourses = ref([]);
    const selectedCourse = ref(null);
    const newComment = ref('');
    const db = getFirestore();

    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        courses.value = querySnapshot.docs.map(doc => ({ id: doc.id, likes: 0, comments: [], ...doc.data() }));
        filterCourses();
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

    const getLatestVideos = (channel) => {
      return courses.value.filter(course => course.category === channel).slice(-3).reverse();
    };

    const likeCourse = async (course) => {
      try {
        const courseRef = doc(db, 'courses', course.id);
        await updateDoc(courseRef, {
          likes: increment(1)
        });
        course.likes += 1; // 更新本地状态
      } catch (error) {
        console.error('Error liking course:', error);
      }
    };

    const openComments = (course) => {
      selectedCourse.value = selectedCourse.value && selectedCourse.value.id === course.id ? null : course;
    };

    const addComment = async (course) => {
      if (newComment.value.trim()) {
        const newCommentData = {
          id: Date.now(),
          user: 'User',
          text: newComment.value.trim()
        };

        try {
          const courseRef = doc(db, 'courses', course.id);
          await updateDoc(courseRef, {
            comments: arrayUnion(newCommentData)
          });
          course.comments.push(newCommentData); // 更新本地状态
          newComment.value = '';
        } catch (error) {
          console.error('Error adding comment:', error);
        }
      }
    };

    onMounted(() => {
      fetchCourses();
    });

    return {
      courses,
      selectedChannel,
      channels,
      filteredCourses,
      selectedCourse,
      newComment,
      fetchCourses,
      filterByChannel,
      filterCourses,
      getLatestVideos,
      likeCourse,
      openComments,
      addComment,
    };
  },
};

</script>

<style scoped>
.btn-like, .btn-comment {
  background-color: transparent;
  color: #333;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  margin-right: 5px;
}

.btn-like:hover, .btn-comment:hover {
  color: #388e3c;
}

.comments-section {
  margin-top: 10px;
  text-align: left;
}

.comment {
  margin-bottom: 5px;
}

textarea {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn-add-comment {
  margin-top: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 5px;
}

.btn-add-comment:hover {
  background-color: #388e3c;
}

.user-courses {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
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

.latest-videos {
  margin-bottom: 40px;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.channel-card {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.video-card {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  text-align: center;
}

.video-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 10px;
}

.actions {
  margin-top: 10px;
}

.btn-like, .btn-comment {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.9rem;
  border-radius: 5px;
  margin-right: 5px;
}

.btn-like:hover, .btn-comment:hover {
  background-color: #388e3c;
}
</style>