<template>
    <div class="upload-courses">
      <header class="header">
        <h1>Upload Course Video</h1>
      </header>
      <form @submit.prevent="uploadVideo">
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
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
  
  export default {
    setup() {
      const title = ref('');
      const introduction = ref('');
      const category = ref('ADHD');
      const videoFile = ref(null);
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
        } catch (error) {
          console.error('Error uploading video:', error);
          alert('Error uploading video. Please try again.');
        }
      };
  
      return {
        title,
        introduction,
        category,
        videoFile,
        handleFileUpload,
        uploadVideo,
      };
    },
  };
  </script>
  
  <style scoped>
  .upload-courses {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
  }
  
  .header {
    text-align: center;
    margin-bottom: 20px;
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
  </style>