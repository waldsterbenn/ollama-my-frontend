<template>
  <div id="app" class="container">
    <div v-if="errorMessage" class="alert alert-danger alert-dismissible mt-2" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    <!-- Dropdown to select modelId -->
    <div class="container-fluid d-flex flex-row h-100 mb-2">
      <label for="modelSelect" class="form-label"></label>
      <select id="modelSelect" v-model="selectedModel" class="form-select">
        <option v-for="model in models" :key="model.model" :value="model.model">
          {{ model.name }}
        </option>
      </select>

    </div>

    <ChatBot :modelId="selectedModel" />
  </div>
</template>

<script setup lang="ts">
import type { ModelResponse } from 'ollama';
import { onMounted, ref } from 'vue';
import ChatBot from './components/ChatBot.vue';
import { getListOfModels } from './services/ollamaApi';


const selectedModel = ref("deepseek-r1:7b");
const models = ref<ModelResponse[]>([]);
const errorMessage = ref("");

onMounted(async () => {
  try {
    const list = await getListOfModels();
    models.value = list;
    if (list.length && !list.find(m => m.model === selectedModel.value)) {
      selectedModel.value = list[0].model;
    }
  } catch (error) {
    errorMessage.value = "Unable to fetch models from OLLAMA: " + ((error as Error).cause as string ?? (error as Error).message);
  }
});

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>