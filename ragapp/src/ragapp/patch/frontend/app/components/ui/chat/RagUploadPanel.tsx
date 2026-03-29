"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, Upload, Database, CheckCircle2, AlertTriangle, X } from "lucide-react";

import { Button } from "../button";
import { cn } from "../lib/utils";
import { appConfig } from "../../../config";

type RagUploadPanelProps = {
  backend?: string;
};

type PendingFile = {
  name: string;
  file: File;
};

export default function RagUploadPanel({ backend }: RagUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = useMemo(() => backend || appConfig.backendUrl, [backend]);

  const openPicker = () => inputRef.current?.click();

  const addSelection = (selected: FileList | null) => {
    if (!selected?.length) return;
    setMessage(null);
    setError(null);
    setFiles((current) => [
      ...current,
      ...Array.from(selected).map((file) => ({ name: file.name, file })),
    ]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (name: string) => {
    setFiles((current) => current.filter((file) => file.name !== name));
  };

  const clearFiles = () => {
    setFiles([]);
    setMessage(null);
    setError(null);
  };

  const uploadFiles = async () => {
    if (!files.length || busy) return;
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      for (let index = 0; index < files.length; index += 1) {
        const item = files[index];
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("fileIndex", String(index + 1));
        formData.append("totalFiles", String(files.length));

        const response = await fetch(`${backendUrl}/api/management/files`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const detail = await response.text();
          throw new Error(detail || `HTTP ${response.status}`);
        }
      }

      setMessage(`${files.length} archivo${files.length === 1 ? "" : "s"} subido${files.length === 1 ? "" : "s"} al RAG.`);
      setFiles([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir al RAG");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative z-10 rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-sm sm:p-5">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => addSelection(event.target.files)}
        disabled={busy}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Archivos para RAG</p>
            <p className="text-xs text-slate-500">Estos archivos se suben al índice del sistema.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={openPicker} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Seleccionar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={clearFiles} disabled={busy || files.length === 0}>
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {files.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                </div>
                <button type="button" className="text-slate-500 hover:text-slate-900" onClick={() => removeFile(item.name)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {message && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.92))] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5">
              <Database className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Subida al RAG</p>
              <p className="text-xs text-slate-500">Backend: {backendUrl}</p>
            </div>
          </div>

          <Button type="button" onClick={uploadFiles} disabled={busy || files.length === 0} className="min-w-[140px]">
            {busy ? <Loader2 className={cn("mr-2 h-4 w-4 animate-spin")} /> : null}
            Subir al RAG
          </Button>
        </div>
      </div>
    </section>
  );
}
