import {
  ChatResponse,
  Message,
  ModelResponse,
  Ollama,
  ShowRequest,
  ShowResponse,
} from "ollama";

const ollama_addr = "http://127.0.0.1:11434";

export const sendMessageToBot = async (
  history: Message[],
  modelId: string,
  tokenEstimate: number
): Promise<Message> => {
  try {
    const ollama = new Ollama({ host: ollama_addr });
    const response: ChatResponse = await ollama.chat({
      model: modelId,
      options: tokenEstimate > 2048 ? { num_ctx: tokenEstimate } : {},
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
    const ollama = new Ollama({ host: ollama_addr });
    const response = await ollama.list();
    return response.models;
  } catch (error) {
    console.error("Error sending message to Ollama:", error);
    throw error;
  }
};

export const getModelInfo = async (modelId: string): Promise<ShowResponse> => {
  try {
    const req: ShowRequest = { model: modelId };

    const ollama = new Ollama({ host: ollama_addr });
    const response: ShowResponse = await ollama.show(req);
    return response;
  } catch (error) {
    console.error("Error sending message to Ollama:", error);
    throw error;
  }
};
