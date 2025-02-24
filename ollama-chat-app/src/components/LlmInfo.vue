<template>
    <div class="container text-start">
        <section>
            <h3>Model Details</h3>
            <p>Format: {{ modelInfo?.details.format }}</p>
            <p>Params: {{ modelInfo?.details.parameter_size }}</p>
            <p>Quantization: {{ modelInfo?.details.quantization_level }}</p>
            <p>Family: {{ modelInfo?.details.family }}</p>
        </section>
        <section>
            <h3>Model info</h3>

            <p v-for="(msg, index) in modelInfo?.model_info" :key="index">
                {{ index }}: {{ msg }}
            </p>

        </section>
    </div>
</template>

<script setup lang="ts">

import { ShowResponse } from 'ollama';
import { onMounted, ref } from 'vue';
import { getModelInfo } from '../services/ollamaApi';
import { useChatAppStore } from '../stores/app_store';


const modelInfo = ref<ShowResponse>();
const appStore = useChatAppStore();

onMounted(async () => {
    const response = await getModelInfo(appStore.modelId);
    modelInfo.value = response;
});

</script>