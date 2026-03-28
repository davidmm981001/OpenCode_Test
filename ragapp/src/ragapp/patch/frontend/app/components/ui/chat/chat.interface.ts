import type { ChangeEventHandler } from "react";

export type ChatHandler = {
  isLoading: boolean;
  input: string;
  onFileUpload?: (...args: any[]) => void;
  onFileError?: (...args: any[]) => void;
  handleSubmit?: (...args: any[]) => void;
  handleInputChange: ChangeEventHandler<HTMLTextAreaElement>;
  messages?: unknown[];
  setInput?: (value: string) => void;
  append?: (...args: any[]) => Promise<void>;
};
