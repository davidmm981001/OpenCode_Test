import type { ChangeEventHandler } from "react";

/** Loose shape for UI chat message list (create-llama + Vercel AI SDK). */
export type ChatHandlerMessage = {
  role?: string;
  annotations?: unknown[];
  [key: string]: unknown;
};

export type ChatHandler = {
  isLoading: boolean;
  input: string;
  onFileUpload?: (...args: any[]) => void;
  onFileError?: (...args: any[]) => void;
  handleSubmit?: (...args: any[]) => void;
  handleInputChange: ChangeEventHandler<HTMLTextAreaElement>;
  messages?: ChatHandlerMessage[];
  setInput?: (value: string) => void;
  append?: (...args: any[]) => Promise<void>;
  stop?: () => void;
  reload?: () => void;
};
