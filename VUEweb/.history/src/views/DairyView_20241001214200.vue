<template>
  <v-container fluid class="diary-container">
    <h1 class="text-h3 mb-6 green--text text--darken-2">My Mental Health Journal</h1>
    
    <v-tabs
      v-model="activeTab"
      background-color="transparent"
      color="#4caf50"
      grow
    >
      <v-tab>Psychological Test</v-tab>
      <v-tab>Test History</v-tab>
      <v-tab>Mental Health Score</v-tab>
      <v-tab>Diary Entries</v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <v-tab-item>
        <psych-test @test-completed="updateScore" />
      </v-tab-item>
      
      <v-tab-item>
        <test-history />
      </v-tab-item>
      
      <v-tab-item>
        <psych-score :score="latestScore" />
      </v-tab-item>
      
      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <new-diary-entry @entry-added="refreshDiary" />
          </v-col>
          <v-col cols="12" md="6">
            <diary-entries />
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import PsychTest from '@/components/PsychTest.vue'
import TestHistory from '@/components/TestHistory.vue'
import PsychScore from '@/components/PsychScore.vue'
import NewDiaryEntry from '@/components/NewDiaryEntry.vue'
import DiaryEntries from '@/components/DiaryEntries.vue'

export default {
  name: 'DiaryView',
  
  components: {
    PsychTest,
    TestHistory,
    PsychScore,
    NewDiaryEntry,
    DiaryEntries
  },
  
  data: () => ({
    activeTab: 0,
    latestScore: 0
  }),
  
  methods: {
    updateScore(newScore) {
      this.latestScore = newScore
      // You might want to update Firestore here
    },
    
    refreshDiary() {
      // Implement logic to refresh diary entries
      // This might involve calling a method on the DiaryEntries component
    }
  }
}
</script>

<style scoped>
.diary-container {
  max-width: 1200px;
  margin: 0 auto;
}

.v-tab {
  text-transform: none;
  font-size: 1.1rem;
}

.v-tab--active {
  font-weight: bold;
}
</style>