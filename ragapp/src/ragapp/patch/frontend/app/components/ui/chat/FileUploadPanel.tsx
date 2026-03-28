"use client";

import React from "react";
import {
  AlertTriangle,
  Archive,
  Files,
  FolderOpen,
  Loader2,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";

import { Button } from "../button";
import { cn } from "../lib/utils";
import type { LoadedContextFile, FileSelectionMode } from "./hooks/useFileContext";

type FileUploadPanelProps = {
  files: LoadedContextFile[];
  busy: boolean;
  applyToCurrentMessage: boolean;
  selectionMode: FileSelectionMode;
  acceptedFileHint: string;
  approxTokens: number;
  contextWindowTokens: number | null;
  usagePercent: number | null;
  modelLabel: string | null;
  providerLabel: string | null;
  message: string | null;
  error: string | null;
  onApplyToCurrentMessageChange: (value: boolean) => void;
  onFilesAdded: (files: File[]) => Promise<void>;
  onRemoveFile: (id: string) => void;
  onClearFiles: () => void;
};

function formatTokens(tokens: number): string {
  return new Intl.NumberFormat("es-ES").format(tokens);
}

export default function FileUploadPanel({
  files,
  busy,
  applyToCurrentMessage,
  selectionMode,
  acceptedFileHint,
  approxTokens,
  contextWindowTokens,
  usagePercent,
  modelLabel,
  providerLabel,
  message,
  error,
  onApplyToCurrentMessageChange,
  onFilesAdded,
  onRemoveFile,
  onClearFiles,
}: FileUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileCountLabel = useMemo(() => {
    if (!files.length) return "Sin archivos cargados";
    return `${files.length} archivo${files.length === 1 ? "" : "s"} cargado${
      files.length === 1 ? "" : "s"
    }`;
  }, [files.length]);

  const usageTone =
    usagePercent == null
      ? "text-slate-500"
      : usagePercent >= 100
        ? "text-red-600"
        : usagePercent >= 80
          ? "text-amber-600"
          : "text-emerald-600";

  const openPicker = () => inputRef.current?.click();

  const handleSelection = async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return;
    await onFilesAdded(Array.from(selectedFiles));
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (busy) return;
    await onFilesAdded(Array.from(event.dataTransfer.files));
  };

  return (
    <section className="relative z-20 rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept={
          ".bms,.cpy,.cbl,.cob,.ts,.tsx,.js,.jsx,.java,.cs,.py,.sql,.json,.yaml,.yml,.xml,.html,.css,.scss,.md,.txt,.env,.properties,.conf,.ini,.toml,.go,.rb,.php,.kt,.swift,.rs,.c,.cpp,.h,.hpp,.sh,.ps1,.tsv,.csv,.zip,text/*,application/json,application/xml"
        }
        onChange={(event) => void handleSelection(event.target.files)}
        disabled={busy}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Archivos locales</p>
            <p className="text-xs text-slate-500">
              Sube texto o código para enriquecer el mensaje sin tocar el RAG.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={applyToCurrentMessage}
            onClick={() => onApplyToCurrentMessageChange(!applyToCurrentMessage)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition",
              applyToCurrentMessage
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
                : "border-slate-200 bg-slate-50 text-slate-600",
            )}
          >
            {applyToCurrentMessage ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {applyToCurrentMessage ? "Aplicar al mensaje actual" : "Contexto desactivado"}
          </button>
        </div>

        <div
          onDragEnter={(event) => {
            event.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!busy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => void handleDrop(event)}
          className={cn(
            "rounded-2xl border border-dashed p-4 transition",
            isDragging
              ? "border-sky-400 bg-sky-50"
              : "border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.92))]",
            busy && "cursor-not-allowed opacity-60",
          )}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5">
                <FolderOpen className="h-5 w-5 text-sky-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">
                  Arrastra y suelta archivos o selecciona desde tu equipo
                </p>
                <p className="text-xs text-slate-500">
                  {acceptedFileHint}. ZIP excluyente con archivos sueltos.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openPicker}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Seleccionar archivos
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearFiles}
                disabled={busy || files.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Archivos</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{fileCountLabel}</p>
            <p className="text-xs text-slate-500">
              Modo actual: {selectionMode === "zip" ? "ZIP" : selectionMode === "files" ? "archivos sueltos" : "vacío"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Tokens estimados</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatTokens(approxTokens)} tokens aprox.
            </p>
            <p className={cn("text-xs", usageTone)}>
              {usagePercent == null
                ? "No se pudo calcular la ventana de contexto"
                : `${usagePercent}% de la ventana del modelo`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Modelo activo</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {modelLabel ?? "No detectado"}
            </p>
            <p className="text-xs text-slate-500">
              {providerLabel ? `Proveedor: ${providerLabel}` : "Proveedor no disponible"}
            </p>
            <p className="text-xs text-slate-500">
              Ventana: {contextWindowTokens ? formatTokens(contextWindowTokens) : "N/D"} tokens
            </p>
          </div>
        </div>

        {message && !error && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <Files className="mt-0.5 h-4 w-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Archivos cargados</p>
                <p className="text-xs text-slate-500">
                  Se procesan localmente y permanecen en memoria.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                {files.length} elementos
              </div>
            </div>

            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {files.map((file) => (
                <article
                  key={file.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-slate-500" />
                      <p className="truncate text-sm font-medium text-slate-900">{file.path}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {file.source === "zip" ? "Extraído desde ZIP" : "Archivo suelto"} · {formatTokens(Math.max(1, Math.ceil(file.content.length / 4)))} tokens aprox.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                    onClick={() => onRemoveFile(file.id)}
                    aria-label={`Eliminar ${file.path}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
