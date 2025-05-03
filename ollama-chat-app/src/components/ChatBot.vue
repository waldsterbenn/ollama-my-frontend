<template>
  <div class="container-fluid d-flex flex-column h-100">
    <div class="chat-window border rounded flex-grow-1 d-flex flex-column overflow-hidden">
      <div class="messages flex-grow-1 p-2 overflow-auto" ref="messagesContainer">
        <div v-for="(message, index) in chatMessages" :key="index" class="message mb-2 p-2 rounded"
          :class="{ 'bg-light align-self-end': message.role === 'user', 'bg-info-subtle align-self-start': message.role === 'assistant' }">

          <!-- Render main content for assistant messages -->
          <div v-if="message.role === 'assistant'" v-html="renderMainContent(message.content)"
            :class="isLoading ? 'bg-info' : ''"></div>
          <div v-else>
            <span class="text-start bg-info" v-html="md.render(message.content)"></span>

            <div v-if="message.images" class="d-flex flex-wrap">
              <img v-for="(image, i) in message.images" :key="i" :src="getImageURL(image as string)"
                class="img-thumbnail mt-2 me-2" style="max-width: 100%; max-height: 100%;" />
            </div>
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
          <div class="alert alert-primary alert-dismissible mt-2" role="alert">
            Token count: {{ totalTokenCount }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        </div>
      </div>
      <!-- Display error message if any -->
      <div v-if="errorMessage" class="alert alert-danger alert-dismissible mt-2" role="alert">
        Failed during api call: {{ errorMessage }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>

      <div class="d-grid gap-2 d-md-flex p-2">
        <!-- <input type="file" accept="image/*" ref="imageInput" style="display:none" @change="handleImageUpload" /> -->
        <input type="file" accept="image/*" multiple ref="imageInput" style="display:none"
          @change="handleImageUpload" />

        <!-- Button to trigger image picker -->
        <button @click="triggerImagePicker" class="btn btn-secondary" title="Upload an image">
          <i class="bi bi-image"></i> Image
        </button>

        <textarea wrap="hard" ref="userInputField" v-model="userInput" @keyup.enter="sendMessage"
          class="form-control mx-auto" placeholder="Type your message...">
        </textarea>

        <div class="d-grid gap-2">
          <button v-if="isLoading" @click="stopButton" class="btn btn-primary" :disabled="!isLoading" title="Ctrl+Enter"
            type="button">
            <span>
              <i class="bi bi-stop"></i>
            </span>
          </button>
          <button @click="sendMessage" class="btn btn-primary" :disabled="isLoading || !userInput" title="Ctrl+Enter"
            type="submit">
            <div v-if="isLoading" class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <span v-else>
              <i class="bi bi-send"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import { AbortableAsyncIterator, ChatResponse, Message } from 'ollama';
import { nextTick, ref, watch } from 'vue';
import { sendMessageToBot } from '../services/ollamaApi';
import { useChatAppStore } from '../stores/app_store';

const appStore = useChatAppStore();

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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    alert("Failed to copy: " + error);
  }
}

function triggerImagePicker() {
  imageInput.value?.click();
}

function getImageURL(image: string): string {
  if (image.startsWith('data:')) return image;
  return `data:image/png;base64,${image}`;
}

const errorMessage = ref("");

const userInput = ref('');
const chatMessages = ref<Message[]>([{ content: `I'm your expert chatbot. How can I help you today?`, role: "system", images: [] }]);
const isLoading = ref(false);
const totalTokenCount = ref(0);
const chatHook = ref();
const messagesContainer = ref<HTMLElement | null>(null);
const bottomElement = ref<HTMLElement | null>(null);
const userInputField = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    bottomElement.value?.scrollIntoView({ behavior: 'smooth' });
  });
};

watch(isLoading, () => {
  scrollToBottom();
  nextTick(() => {
    userInputField.value?.focus();
  });
}, { deep: true });

const stopButton = async (e: Event) => {
  if (chatHook.value) {
    chatHook.value.abort();
    chatHook.value = null;
    isLoading.value = false;
  }
};

const sendMessage = async (e: Event) => {
  if (userInput.value.trim() === '')
    return; const keyboard = (e as KeyboardEvent);
  if (e.type === 'keyup' && keyboard.key === 'Enter' && keyboard.ctrlKey !== true)
    return; errorMessage.value = "";
  chatMessages.value.push({ content: userInput.value, role: "user" } as Message);
  isLoading.value = true;
  totalTokenCount.value = chatMessages.value.reduce((acc: number, message: Message) => acc + estimateTokenCount(message.content), 500);
  try {

    userInput.value = '';
    chatMessages.value.push({ content: "", role: "assistant" } as Message);
    const onMessageFromBot = (message: Message) => {
      chatMessages.value[chatMessages.value.length - 1].content += message.content;
    };
    const onCancelHook = (cancelHook: AbortableAsyncIterator<ChatResponse>) => {
      chatHook.value = cancelHook;
    };
    chatHook.value = await sendMessageToBot(chatMessages.value, appStore.modelId, totalTokenCount.value,
      onMessageFromBot,
      onCancelHook
    );

  } catch (error) {
    console.error("Send message error:", error);
    errorMessage.value = (error as Error).cause as string ?? (error as Error).message;
  } finally {
    isLoading.value = false;
    chatHook.value = null;
  }
};

function estimateTokenCount(str: string): number {
  str = str.trim();
  const words = str.split(/\s+/);
  return words.length;
}

async function resizeImageFile(file: File, maxWidth: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate scale factor to maintain aspect ratio.
      const scale = Math.min(maxWidth / img.width, maxWidth / img.height);
      const width = img.width * scale;
      const height = img.height * scale;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Unable to get canvas context"));
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (err) => reject(err);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        img.src = reader.result;
      } else {
        reject(new Error("Unexpected result type."));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  for (const file of Array.from(target.files)) {
    try {
      const dataUrl = await resizeImageFile(file, 1024);
      const base64Data = dataUrl.split(',')[1];
      chatMessages.value.push({ role: "user", content: "image-" + file.name, images: [base64Data] } as Message);
    } catch (error) {
      console.error("Image upload error:", error);
      errorMessage.value = (error as Error).message;
    }
  }
  target.value = "";
}
</script>

<style scoped>
/* No custom styles needed as we are using Bootstrap classes */
</style>