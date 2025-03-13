<template>
    <div class="manage-courses">
      <header class="header">
        <h1>Manage Courses</h1>
      </header>
  
      <!-- Upload Video Section -->
      <form @submit.prevent="uploadVideo" class="upload-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" v-model="title" required />
        </div>
  
        <div class="form-group">
          <label for="introduction">Introduction</label>
          <textarea id="introduction" v-model="introduction" required></textarea>
        </div>
  
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="category" required>
            <option value="ADHD">ADHD</option>
            <option value="BIPOLAR DISORDER">BIPOLAR DISORDER</option>
            <option value="GENDER">GENDER</option>
            <option value="anxiety">anxiety</option>
            <option value="TEEN">TEEN</option>
            <option value="EATING PROBLEMS">EATING PROBLEMS</option>
            <option value="PTSD">PTSD</option>
            <option value="SOCIAL ANXIETY">SOCIAL ANXIETY</option>
            <option value="SLEEP DISORDERS">SLEEP DISORDERS</option>
            <option value="Other">Other</option>
          </select>
        </div>
  
        <div class="form-group">
          <label for="video">Upload Video</label>
          <input type="file" id="video" @change="handleFileUpload" accept="video/*" required />
        </div>
  
        <button type="submit" class="btn-upload">Upload Video</button>
      </form>
  
      <!-- Course List Section -->
      <div class="course-list">
        <h2>Uploaded Courses</h2>
        <div v-if="courses.length === 0">
          <p>No courses available.</p>
        </div>
        <div v-else class="course-card" v-for="course in courses" :key="course.id">
          <h3>{{ course.title }}</h3>
          <p>{{ course.introduction }}</p>
          <p><strong>Category:</strong> {{ course.category }}</p>
          <video controls :src="course.videoUrl" class="course-video"></video>
          <button @click="editCourse(course)" class="btn-edit">Edit</button>
          <button @click="deleteCourse(course.id)" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
  
  export default {
    setup() {
      const title = ref('');
      const introduction = ref('');
      const category = ref('ADHD');
      const videoFile = ref(null);
      const courses = ref([]);
      const storage = getStorage();
      const db = getFirestore();
  
      const handleFileUpload = (event) => {
        videoFile.value = event.target.files[0];
      };
  
      const uploadVideo = async () => {
        if (!videoFile.value) {
          alert('Please select a video file to upload.');
          return;
        }
  
        try {
          const videoRef = storageRef(storage, `courses/${videoFile.value.name}`);
          await uploadBytes(videoRef, videoFile.value);
          const videoUrl = await getDownloadURL(videoRef);
  
          await addDoc(collection(db, 'courses'), {
            title: title.value,
            introduction: introduction.value,
            category: category.value,
            videoUrl,
            timestamp: new Date(),
          });
  
          alert('Video uploaded successfully!');
          title.value = '';
          introduction.value = '';
          category.value = 'ADHD';
          videoFile.value = null;
          fetchCourses();
        } catch (error) {
          console.error('Error uploading video:', error);
          alert('Error uploading video. Please try again.');
        }
      };
  
      const fetchCourses = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'courses'));
          courses.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error('Error fetching courses:', error);
        }
      };
  
      const deleteCourse = async (courseId) => {
        try {
          await deleteDoc(doc(db, 'courses', courseId));
          alert('Course deleted successfully!');
          fetchCourses();
        } catch (error) {
          console.error('Error deleting course:', error);
          alert('Error deleting course. Please try again.');
        }
      };
  
      const editCourse = (course) => {
        const newTitle = prompt('Enter new title', course.title);
        const newIntroduction = prompt('Enter new introduction', course.introduction);
        if (newTitle && newIntroduction) {
          updateDoc(doc(db, 'courses', course.id), {
            title: newTitle,
            introduction: newIntroduction,
          }).then(() => {
            alert('Course updated successfully!');
            fetchCourses();
          }).catch((error) => {
            console.error('Error updating course:', error);
            alert('Error updating course. Please try again.');
          });
        }
      };
  
      onMounted(() => {
        fetchCourses();
      });
  
      return {
        title,
        introduction,
        category,
        videoFile,
        courses,
        handleFileUpload,
        uploadVideo,
        fetchCourses,
        deleteCourse,
        editCourse,
      };
    },
  };
  </script>
  
  <style scoped>
  .manage-courses {
    max-width: 800px;
    margin: auto;
    padding: 20px;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .upload-form {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input[type="text"],
  textarea,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .btn-upload {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 1rem;
    border-radius: 5px;
  }
  
  .btn-upload:hover {
    background-color: #388e3c;
  }
  
  .course-list {
    margin-top: 40px;
  }
  
  .course-card {
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    margin-bottom: 20px;
  }
  
  .course-card h3 {
    margin-top: 0;
  }
  
  .course-video {
    width: 100%;
    height: 200px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  
  .btn-edit, .btn-delete {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 0.9rem;
    border-radius: 5px;
    margin-right: 10px;
  }
  
  .btn-delete {
    background-color: #e74c3c;
  }
  
  .btn-edit:hover {
    background-color: #388e3c;
  }
  
  .btn-delete:hover {
    background-color: #c0392b;
  }
  </style>