"use client";

import { useEffect, useMemo, useState } from "react";

import { appConfig } from "../../../../config";

export interface ChatConfig {
  backend?: string;
  starterQuestions?: string[];
}

export function useClientConfig(): ChatConfig {
  const chatAPI = process.env.NEXT_PUBLIC_CHAT_API ?? appConfig.backendUrl;
  const [config, setConfig] = useState<ChatConfig>();

  const backendOrigin = useMemo(() => {
    if (chatAPI) return chatAPI;

    if (typeof window !== "undefined") {
      return (window as any).ENV?.BASE_URL || appConfig.backendUrl;
    }

    return appConfig.backendUrl;
  }, [chatAPI]);

  const configAPI = `${backendOrigin}/api/management/config/models`;

  useEffect(() => {
    const abortController = new AbortController();

    void fetch(configAPI, { signal: abortController.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })
      .then((data) => setConfig({ ...data, backend: backendOrigin }))
      .catch(() => {
        setConfig({
          backend: backendOrigin,
        });
      });

    return () => abortController.abort();
  }, [backendOrigin, configAPI]);

  return {
    backend: backendOrigin,
    starterQuestions: config?.starterQuestions,
  };
}
