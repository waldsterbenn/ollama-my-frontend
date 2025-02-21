import { createRouter, createWebHistory } from "vue-router";
import ChatBot from "../components/ChatBot.vue";
import CtxCal from "../components/CtxCal.vue";
import ModelConfig from "../components/LlmSelector.vue";

const routes = [
  { path: "/", name: "ChatBot", component: ChatBot },
  { path: "/ctxcal", name: "CtxCal", component: CtxCal },
  { path: "/config", name: "ModelConfig", component: ModelConfig },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
