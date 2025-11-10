import { POST } from "@/utils/AxiosUtility";

export interface TranslateTextPayload<T = string | object | string[]> {
  text: T;
  targetLanguage: string[];
  sourceLanguage?: string;
}

export interface TranslateTextResponse<T = string | object | string[]> {
  translatedText: Record<string, T>;
}

export const openAIService = {
  translateText: async <T = string | object | string[]>(
    payload: TranslateTextPayload<T>
  ): Promise<TranslateTextResponse<T>> => {
    const response = await POST("/openai/translate-text", payload);
    return response?.data;
  },
};
