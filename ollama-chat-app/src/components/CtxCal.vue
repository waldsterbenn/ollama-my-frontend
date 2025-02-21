<template>
    <div class="container my-4">
        <h1 class="mb-3">LLM Context Window Calculator</h1>
        <!-- Description -->
        <p class="mb-5">
            Roughly estimates the maximum context window size for a language model based on model parameters (in
            billions), available VRAM (in GB), and the quantization type. Negative value means that model won't fit in
            memory.
        </p>
        <!-- Result -->
        <div class="mb-5">
            <strong>Estimated Context Window Size:</strong> {{ estimatedBestContextWindow }} <button
                @click="copyToClipboard(estimatedBestContextWindow.toString())" class="btn btn-subtle btn-sm"
                title="Copy to clipboard" data-bs-toggle="tooltip" data-bs-placement="top">
                <i class="bi bi-clipboard-plus"></i>
            </button>
        </div>
        <!-- Input for available VRAM -->
        <div class="mb-3">
            <label for="vramInput" class="form-label">Available VRAM (GB):</label>
            <input id="vramInput" type="number" min="1" step="0.1" v-model.number="availableVram"
                class="form-control" />
        </div>
        <!-- Input for model parameters -->
        <div class="mb-3">
            <label for="modelParamsInput" class="form-label">Model Parameters (in billions):</label>
            <input id="modelParamsInput" type="number" min="0.1" step="0.1" v-model.number="modelParams"
                class="form-control" />
        </div>
        <!-- Select quantization type -->
        <div class="mb-3">
            <label for="quantizationSelect" class="form-label">Quantization:</label>
            <select id="quantizationSelect" v-model="quantization" class="form-select">
                <option value="fp16">FP16</option>
                <option value="int8">INT8</option>
                <option value="int4">INT4</option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        alert("Failed to copy: " + error);
    }
}

function roughEstimateContextWindow(
    modelParams: number, // In billions
    vramGB: number,
    quantization: "fp16" | "int8" | "int4" = "int8"
): number {
    let bytesPerParam: number;

    switch (quantization) {
        case "fp16":
            bytesPerParam = 2;
            break;
        case "int8":
            bytesPerParam = 1;
            break;
        case "int4":
            bytesPerParam = 0.5; // 4 bits = 0.5 bytes
            break;
        default:
            bytesPerParam = 1; // Default to int8
    }
    // Convert model parameters from billions to actual count
    const modelWeightBytes = modelParams * 1e9 * bytesPerParam;
    const vramBytes = vramGB * 1024 * 1024 * 1024;
    const availableVramForKv = vramBytes - modelWeightBytes;
    // Example scaling: layers and heads approximate formulation
    let layers = Math.round(Math.sqrt(modelParams) * 4);
    let heads = Math.round(Math.sqrt(modelParams) * 4);
    let headSize = 128; // Assuming 128 as a common head size
    const kvCachePerTokenPerLayerPerHead = 2 * headSize * bytesPerParam;
    const kvCachePerToken = kvCachePerTokenPerLayerPerHead * layers * heads;
    const maxContextWindow = Math.floor(availableVramForKv / kvCachePerToken);
    return maxContextWindow > 0 ? maxContextWindow : -1;
}

const availableVram = ref(16);
const modelParams = ref(8);
const quantization = ref<"fp16" | "int8" | "int4">("int8");

const estimatedBestContextWindow = computed(() =>
    roughEstimateContextWindow(modelParams.value, availableVram.value, quantization.value)
);

</script>

<style scoped>
/* No custom styles needed as we are using Bootstrap classes */
</style>
