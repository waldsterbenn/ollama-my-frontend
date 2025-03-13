<template>
    <div class="container d-flex">
        <button type="button" class="btn btn-outline-secondary me-2" data-bs-toggle="modal"
            data-bs-target="#llmInfoModal">
            <i class="bi bi-info-circle"></i>
        </button>

        <div>

            <select id="modelSelect" v-model="selectedModel" class="form-select">
                <option v-for="model in models" :key="model.model" :value="model.model">
                    {{ model.name }}
                </option>
            </select>
        </div>
    </div>
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                <strong class="me-auto">{{ toastMessage.header }}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                {{ toastMessage.message }}
            </div>
        </div>
    </div>
    <!-- Modal -->
    <div class="modal fade" id="llmInfoModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">{{ selectedModel }}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <LlmInfoAsyncComponent />
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Toast } from 'bootstrap';
import type { ModelResponse } from 'ollama';
import { defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { getListOfModels } from '../services/ollamaApi';
import { useChatAppStore } from '../stores/app_store';
const appStore = useChatAppStore();
const selectedModel = ref("gemma3:4b");
const models = ref<ModelResponse[]>([]);
const toastMessage = ref({ header: "", message: "" });

if (selectedModel.value !== appStore.modelId)
    appStore.update(selectedModel.value);


//Lazy Load the LlmInfo component
let LlmInfoAsyncComponent = defineAsyncComponent(() =>
    import('./LlmInfo.vue')
);

watch(selectedModel, (newModel: string) => {
    appStore.update(newModel);
    //Lazy Load the LlmInfo component
    LlmInfoAsyncComponent = defineAsyncComponent(() =>
        import('./LlmInfo.vue')
    );
});

onMounted(async () => {

    try {
        const list = await getListOfModels();
        models.value = list;
        if (list.length && !list.find(m => m.model === selectedModel.value)) {
            selectedModel.value = list[0].model;
            appStore.update(list[0].model);
        }
    } catch (error: any) {
        if (error instanceof TypeError && error.message.startsWith("NetworkError")) {
            toastMessage.value.header = "OLLAMA";
            toastMessage.value.message = "OLLAMA is not running. Please start the program.";
        } else {
            toastMessage.value.header = "Error";
            toastMessage.value.message = "Unable to fetch models: " + error;
        }
        const toaster = document.getElementById('liveToast');
        Toast.getOrCreateInstance(toaster).show();
    }
});



</script>

<style scoped>
/* No custom styles needed as we are using Bootstrap classes */
</style>
