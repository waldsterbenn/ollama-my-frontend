<template>
    <div class="container">
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible" role="alert">
            {{ errorMessage }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <div>
            <select id="modelSelect" v-model="selectedModel" class="form-select">
                <option v-for="model in models" :key="model.model" :value="model.model">
                    {{ model.name }}
                </option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ModelResponse } from 'ollama';
import { onMounted, ref } from 'vue';
import { getListOfModels } from '../services/ollamaApi';

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
        errorMessage.value = "Unable to fetch models: " + (((error as Error).cause as string) ?? (error as Error).message);
    }
});
</script>

<style scoped>
/* No custom styles needed as we are using Bootstrap classes */
</style>
