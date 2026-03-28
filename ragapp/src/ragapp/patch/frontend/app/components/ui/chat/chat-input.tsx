import React from "react";

import { Button } from "../button";
import { Textarea } from "../textarea";
import type { ChatHandler } from "./chat.interface";
import FileUploadPanel from "./FileUploadPanel";
import { useFileContext } from "./hooks/useFileContext";
import { useClientConfig } from "./hooks/use-config";
import { LlamaCloudSelector } from "./widgets/LlamaCloudSelector";

export default function ChatInput(
  props: Pick<
    ChatHandler,
    | "isLoading"
    | "input"
    | "onFileUpload"
    | "onFileError"
    | "handleSubmit"
    | "handleInputChange"
    | "messages"
    | "setInput"
    | "append"
  > & {
    requestParams?: any;
    setRequestData?: React.Dispatch<any>;
  },
) {
  const { backend } = useClientConfig();
  const fileContext = useFileContext({ backend });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!props.append || !props.setInput) return;
    if (fileContext.busy) return;
    const content = props.input;
    if (!content.trim()) return;

    const finalMessage = fileContext.composeMessage(content);

    await props.append(
      {
        content: finalMessage,
        role: "user",
        createdAt: new Date(),
      },
      { data: props.requestParams?.params },
    );

    props.setInput("");
  };

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="relative z-10 flex shrink-0 flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-sm sm:p-5"
    >
      <FileUploadPanel
        files={fileContext.files}
        busy={props.isLoading || fileContext.busy}
        applyToCurrentMessage={fileContext.applyToCurrentMessage}
        selectionMode={fileContext.selectionMode}
        acceptedFileHint={fileContext.acceptedFileHint}
        approxTokens={fileContext.approxTokens}
        contextWindowTokens={fileContext.contextWindowTokens}
        usagePercent={fileContext.usagePercent}
        modelLabel={fileContext.modelLabel}
        providerLabel={fileContext.providerLabel}
        message={fileContext.message}
        error={fileContext.error}
        onApplyToCurrentMessageChange={fileContext.setApplyToCurrentMessage}
        onFilesAdded={fileContext.addFiles}
        onRemoveFile={fileContext.removeFile}
        onClearFiles={fileContext.clearFiles}
      />

      <div className="flex w-full flex-col gap-3">
        <Textarea
          id="chat-input"
          autoFocus
          name="message"
          placeholder="Escribe tu consulta y, si activas el toggle, se agregará el contexto cargado."
          className="min-h-[120px] resize-none border-slate-200 bg-slate-50/80"
          maxLength={1600000}
          value={props.input}
          onChange={props.handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={props.isLoading}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {process.env.NEXT_PUBLIC_USE_LLAMACLOUD === "true" &&
              props.setRequestData && (
                <LlamaCloudSelector setRequestData={props.setRequestData} />
              )}
          </div>

          <Button
            type="submit"
            disabled={props.isLoading || !props.input.trim()}
            className="min-w-[140px]"
          >
            Enviar mensaje
          </Button>
        </div>
      </div>
    </form>
  );
}
