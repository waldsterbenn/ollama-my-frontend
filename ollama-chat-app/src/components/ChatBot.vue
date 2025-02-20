<template>
  <div class="container-fluid d-flex flex-column h-100">
    <div class="chat-window border rounded flex-grow-1 d-flex flex-column overflow-hidden">
      <div class="messages flex-grow-1 p-2 overflow-auto" ref="messagesContainer">
        <div v-for="(message, index) in chatMessages" :key="index" class="message mb-2 p-2 rounded"
          :class="{ 'bg-light align-self-end': message.role === 'user', 'bg-info-subtle align-self-start': message.role === 'assistant' }">

          <!-- Render main content for assistant messages -->
          <div v-if="message.role === 'assistant'" v-html="renderMainContent(message.content)"></div>
          <div v-else>
            {{ message.content }}
          </div>
          <div class="flex-grow-1 d-flex justify-content-end">

            <!-- Add copy button for non-system messages with tooltip -->
            <div v-if="message.role !== 'system'" class="mt-1">
              <button @click="copyToClipboard(message.content)" class="btn btn-subtle btn-sm" title="Copy to clipboard"
                data-bs-toggle="tooltip" data-bs-placement="top">
                <i class="bi bi-clipboard-plus"></i>
              </button>
            </div>
            <!-- Render thought toggle button with tooltip -->
            <div v-if="message.role === 'assistant' && renderThinkSection(message.content)">
              <button class="btn btn-subtle" type="button" :data-bs-target="`#collapseThought-${index}`"
                :aria-controls="`collapseThought-${index}`" aria-expanded="false" title="Show thought process"
                data-bs-toggle="collapse" data-bs-placement="top">
                <i class="bi bi-robot"></i>
              </button>
            </div>
          </div>
          <div class="collapse" :id="`collapseThought-${index}`"
            v-if="message.role === 'assistant' && renderThinkSection(message.content)">
            <div class="card card-body" v-html="renderThinkSection(message.content)"></div>
          </div>
        </div>
        <!-- New bottom element to scroll into view -->
        <div ref="bottomElement"></div>
        <div v-if="isLoading" class="loading-indicator text-center text-muted">
          Thinking...
        </div>
      </div>
      <!-- Display error message if any -->
      <div v-if="errorMessage" class="alert alert-danger alert-dismissible mt-2" role="alert">
        Failed during api call: {{ errorMessage }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
      <div class="input-area d-flex p-2 bg-light">
        <input ref="userInputField" v-model="userInput" @keyup.enter="sendMessage" class="form-control me-2"
          placeholder="Type your message..." />
        <button @click="sendMessage" class="btn btn-primary" :disabled="isLoading || !userInput">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import { Message } from 'ollama';
import { defineProps, nextTick, ref, watch } from 'vue';
import { sendMessageToBot } from '../services/ollamaApi';

const props = defineProps<{ modelId: string }>();

const md = new MarkdownIt();

// Process markdown text to extract <think> section.
const renderThinkSection = (text: string) => {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const match = thinkRegex.exec(text);
  if (match) {
    const thinkSection = match[1].trim();
    return `${md.render(thinkSection)}`;
  }
  return '';
};

// Render the main content excluding the <think> section.
const renderMainContent = (text: string) => {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const remainingText = text.replace(thinkRegex, '').trim();
  return `<div class="text-start">${md.render(remainingText)}</div>`;
};

// Update copyToClipboard to accept text parameter.
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  } catch (error) {
    alert("Failed to copy: " + error);
  }
}

// New error message ref:
const errorMessage = ref("");

// Existing reactive variables
const userInput = ref('');
const chatMessages = ref<Message[]>([{ content: `I'm your expert chatbot. How can I help you today?`, role: "system" }]);
const isLoading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const bottomElement = ref<HTMLElement | null>(null);
const userInputField = ref<HTMLInputElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    bottomElement.value?.scrollIntoView({ behavior: 'smooth' });
  });
};

watch(chatMessages, () => {
  scrollToBottom();
  nextTick(() => {
    userInputField.value?.focus();
  });
}, { deep: true });

const sendMessage = async () => {
  if (userInput.value.trim() === '') return;
  // Clear previous error.
  errorMessage.value = "";
  chatMessages.value.push({ content: userInput.value, role: "user" });
  isLoading.value = true;
  try {
    const responseMessage: Message = await sendMessageToBot(chatMessages.value, props.modelId);
    chatMessages.value.push(responseMessage);
  } catch (error) {
    console.error("Send message error:", error);
    errorMessage.value = (error as Error).cause as string ?? (error as Error).message;
  } finally {
    isLoading.value = false;
  }
  userInput.value = '';
};

</script>

<style scoped>
/* No custom styles needed as we are using Bootstrap classes */
</style>