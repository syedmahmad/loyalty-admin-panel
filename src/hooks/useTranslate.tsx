import { openAIService, TranslateTextResponse } from "@/services/openAiService";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useId } from "react";
import { useDebounce } from "./useDebounce";

export interface UseTranslateOptions<T = string> {
  value: T;
  targetLanguages: string[];
  sourceLanguage?: string;
  onTranslate?: (result: TranslateTextResponse<T>) => void;
  isEnabled: boolean;
}

export interface UseTranslateResult<T = string> {
  isLoading: boolean;
  result?: TranslateTextResponse<T>;
}

export const useTranslate = <T = string,>({
  value,
  targetLanguages,
  sourceLanguage,
  onTranslate,
  isEnabled,
}: UseTranslateOptions<T>): UseTranslateResult<T> => {
  const debounceValue = useDebounce(value, 750);
  const id = useId();

  const query = useQuery({
    queryKey: ["translate", id, debounceValue, targetLanguages, sourceLanguage],
    queryFn: async () => {
      const result = await openAIService.translateText({
        text: debounceValue,
        targetLanguage: targetLanguages,
        sourceLanguage,
      });
      onTranslate?.(result);
      return result;
    },
    enabled:
      isEnabled &&
      !!targetLanguages.length &&
      !!(debounceValue as string)?.length,
    refetchOnWindowFocus: false,
  });

  const handleEmptyValue = useCallback(() => {
    if (!(debounceValue as string)?.length && isEnabled) {
      onTranslate?.({
        translatedText: targetLanguages.reduce(
          (acc, cur) => ({ ...acc, [cur]: "" }),
          {}
        ) as Record<string, T>,
      });
    }
  }, [debounceValue, isEnabled]);

  useEffect(() => {
    handleEmptyValue();
  }, [handleEmptyValue]);

  return {
    isLoading: query.isLoading,
    result: query.data,
  };
};
