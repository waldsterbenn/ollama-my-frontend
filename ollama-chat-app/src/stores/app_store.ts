import { defineStore } from "pinia";
import { ref } from "vue";

export const useChatAppStore = defineStore("app_store", () => {
  const modelId = ref<string>("");

  function update(newVal: string) {
    modelId.value = newVal;
  }

  return { modelId: modelId, update };
});
