import {
  AbortableAsyncIterator,
  ChatResponse,
  Message,
  ModelResponse,
  Ollama,
  ShowRequest,
  ShowResponse,
} from "ollama";

const ollama_addr = `http://${window.location.hostname}:${11434}`;

export const sendMessageToBot = async (
  history: Message[],
  modelId: string,
  tokenEstimate: number,
  onMessage: (message: Message) => void,
  onCancelHook: (cancelHook: AbortableAsyncIterator<ChatResponse>) => void
): Promise<AbortableAsyncIterator<ChatResponse>> => {
  try {
    const ollama = new Ollama({ host: ollama_addr });
    const response: AbortableAsyncIterator<ChatResponse> = await ollama.chat({
      model: modelId,
      options: tokenEstimate > 2048 ? { num_ctx: tokenEstimate } : {},
      messages: history,
      stream: true,
    });
    onCancelHook(response);
    for await (const part of response) {
      onMessage(part.message);
    }
    return response;
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
