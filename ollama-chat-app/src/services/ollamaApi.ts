import { ChatResponse, Message, ModelResponse, Ollama } from "ollama";

const API_URL = "http://localhost:11434/";

export const sendMessageToBot = async (
  history: Message[],
  modelId: string
): Promise<Message> => {
  try {
    const ollama = new Ollama({ host: "http://127.0.0.1:11434" });
    const response: ChatResponse = await ollama.chat({
      model: modelId,

      messages: history,
    });
    return response.message;
  } catch (error) {
    console.error("Error sending message to bot:", error);
    throw new Error("Failed to communicate with the bot", { cause: error });
  }
};

export const getListOfModels = async (): Promise<ModelResponse[]> => {
  try {
    const ollama = new Ollama({ host: "http://127.0.0.1:11434" });
    const response = await ollama.list();
    return response.models;
  } catch (error) {
    console.error("Error sending message to bot:", error);
    throw new Error("Failed to communicate with the bot", { cause: error });
  }
};
