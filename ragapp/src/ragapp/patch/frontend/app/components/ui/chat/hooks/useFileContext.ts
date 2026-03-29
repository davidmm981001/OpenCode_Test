"use client";

import JSZip from "jszip";
import { useCallback, useEffect, useMemo, useState } from "react";

import { appConfig } from "../../../../config";
import { isIgnoredPath, normalizePath } from "../ignorePatterns";

export { isIgnoredPath, normalizePath };

export type LoadedContextFile = {
  id: string;
  path: string;
  name: string;
  content: string;
  size: number;
  source: "file" | "zip";
};

export type FileSelectionMode = "empty" | "files" | "zip";

export type FileContextMetrics = {
  approxTokens: number;
  contextWindowTokens: number | null;
  usagePercent: number | null;
  modelLabel: string | null;
  providerLabel: string | null;
  selectionMode: FileSelectionMode;
};

const ALLOWED_EXTENSIONS = [
  ".bms",
  ".cpy",
  ".cbl",
  ".cob",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".java",
  ".cs",
  ".py",
  ".sql",
  ".json",
  ".yaml",
  ".yml",
  ".xml",
  ".html",
  ".css",
  ".scss",
  ".md",
  ".txt",
  ".env",
  ".properties",
  ".conf",
  ".ini",
  ".toml",
  ".go",
  ".rb",
  ".php",
  ".kt",
  ".swift",
  ".rs",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".sh",
  ".ps1",
  ".tsv",
  ".csv",
  ".zip",
];

const OPENAI_CONTEXT_WINDOWS: Record<string, number> = {
  "gpt-5.4": 1048576,
  "gpt-4o": 128000,
  "gpt-4o-mini": 128000,
  "gpt-4.1": 1048576,
  "gpt-4.1-mini": 1048576,
  "gpt-4.1-nano": 1048576,
  "gpt-4-turbo": 128000,
  "gpt-4": 8192,
  "gpt-3.5-turbo": 16385,
};

export function estimateTokens(text: string): number {
  if (!text.trim()) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getFileExtension(fileName: string): string {
  const sanitized = normalizePath(fileName).toLowerCase();
  const index = sanitized.lastIndexOf(".");
  return index >= 0 ? sanitized.slice(index) : "";
}

export function isZipFile(fileName: string): boolean {
  return getFileExtension(fileName) === ".zip";
}

export function isAcceptedFileName(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  if (!extension) return false;
  return ALLOWED_EXTENSIONS.includes(extension);
}

export function getAcceptedFileHint(): string {
  return ALLOWED_EXTENSIONS.filter((ext) => ext !== ".zip")
    .map((ext) => ext.slice(1))
    .join(", ");
}

export function getOpenAIContextWindow(modelName?: string | null): number | null {
  if (!modelName) return null;
  const key = modelName.toLowerCase().trim();
  return OPENAI_CONTEXT_WINDOWS[key] ?? null;
}

export function getSelectionMode(files: LoadedContextFile[]): FileSelectionMode {
  if (!files.length) return "empty";
  return files.some((file) => file.source === "zip") ? "zip" : "files";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function createId(prefix: string, index: number): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${index}`;
}

function readTextFile(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
    reader.readAsText(file);
  });
}

function looksBinary(text: string): boolean {
  if (text.includes("\u0000")) return true;
  const sample = text.slice(0, 4096);
  if (!sample) return false;
  let suspicious = 0;
  for (const char of sample) {
    const code = char.charCodeAt(0);
    if (code < 9 || (code > 13 && code < 32)) suspicious++;
  }
  return suspicious / sample.length > 0.2;
}

function normalizeRelativePath(path: string): string {
  const normalized = normalizePath(path).replace(/^\.?\//, "");
  return normalized || path;
}

export function buildContextText(files: LoadedContextFile[]): string {
  return files
    .map((file, index) => {
      const header = [
        `Archivo ${index + 1}: ${file.path}`,
        `Nombre: ${file.name}`,
        `Tamaño: ${formatBytes(file.size)}`,
        `Tokens aprox.: ${estimateTokens(file.content)}`,
      ].join("\n");
      return `${header}\n\n${file.content}`;
    })
    .join("\n\n---\n\n");
}

export function composeMessageWithContext(
  message: string,
  files: LoadedContextFile[],
  applyToCurrentMessage: boolean,
): string {
  if (!applyToCurrentMessage || files.length === 0) {
    return message;
  }

  const contextText = buildContextText(files);
  const escapedContext = escapeHtml(contextText);
  return `<code>${escapedContext}</code>\n\n${message}`;
}

function hasZipConflict(existing: LoadedContextFile[], incoming: File[]): boolean {
  const currentMode = getSelectionMode(existing);
  const incomingHasZip = incoming.some((file) => isZipFile(file.name));
  const incomingHasNonZip = incoming.some((file) => !isZipFile(file.name));

  if (incomingHasZip && incomingHasNonZip) return true;
  if (currentMode === "zip" && incomingHasNonZip) return true;
  if (currentMode === "files" && incomingHasZip) return true;
  return false;
}

async function readZipEntries(file: File): Promise<LoadedContextFile[]> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer(), {
    createFolders: true,
    checkCRC32: true,
  });

  const entries: LoadedContextFile[] = [];
  const reads: Promise<void>[] = [];

  zip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;
    const entryPath = normalizeRelativePath(relativePath);
    if (isIgnoredPath(entryPath)) return;

    reads.push(
      zipEntry.async("string").then((content) => {
        if (!content.trim() || looksBinary(content)) return;
        entries.push({
          id: createId(entryPath, entries.length),
          path: entryPath,
          name: entryPath.split("/").pop() || entryPath,
          content,
          size: content.length,
          source: "zip",
        });
      }),
    );
  });

  await Promise.all(reads);
  return entries.sort((a, b) => a.path.localeCompare(b.path));
}

async function readRegularFiles(files: File[]): Promise<LoadedContextFile[]> {
  const results: LoadedContextFile[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const path = normalizeRelativePath(file.webkitRelativePath || file.name);
    if (isIgnoredPath(path)) continue;

    const text = await readTextFile(file);
    if (!text.trim() || looksBinary(text)) continue;

    results.push({
      id: createId(path, index),
      path,
      name: file.name,
      content: text,
      size: file.size,
      source: "file",
    });
  }

  return results;
}

export type UseFileContextArgs = {
  backend?: string;
};

export function useFileContext({ backend }: UseFileContextArgs = {}) {
  const [files, setFiles] = useState<LoadedContextFile[]>([]);
  const [applyToCurrentMessage, setApplyToCurrentMessage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelLabel, setModelLabel] = useState<string | null>(appConfig.modelName);
  const [providerLabel, setProviderLabel] = useState<string | null>(
    appConfig.modelProviderLabel,
  );
  const [contextWindowTokens, setContextWindowTokens] = useState<number | null>(
    appConfig.modelContextWindow,
  );

  useEffect(() => {
    if (!backend) return;

    const abortController = new AbortController();

    fetch(`${backend}/api/management/config/models`, {
      signal: abortController.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        const model = typeof data?.model === "string" ? data.model : null;
        const provider =
          typeof data?.model_provider === "string" ? data.model_provider : null;
        setModelLabel(model ?? appConfig.modelName);
        setProviderLabel(provider ?? appConfig.modelProviderLabel);
        setContextWindowTokens(
          getOpenAIContextWindow(model) ?? appConfig.modelContextWindow,
        );
      })
      .catch(() => {
        setModelLabel(appConfig.modelName);
        setProviderLabel(appConfig.modelProviderLabel);
        setContextWindowTokens(appConfig.modelContextWindow);
      });

    return () => abortController.abort();
  }, [backend]);

  const selectionMode = useMemo(() => getSelectionMode(files), [files]);

  const contextText = useMemo(() => buildContextText(files), [files]);

  const approxTokens = useMemo(
    () => estimateTokens(contextText),
    [contextText],
  );

  const usagePercent = useMemo(() => {
    if (!contextWindowTokens || contextWindowTokens <= 0) return null;
    return Math.round((approxTokens / contextWindowTokens) * 1000) / 10;
  }, [approxTokens, contextWindowTokens]);

  const clearFeedback = useCallback(() => {
    setMessage(null);
    setError(null);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    clearFeedback();
  }, [clearFeedback]);

  const removeFile = useCallback((id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
  }, []);

  const addFiles = useCallback(
    async (incomingFiles: File[]) => {
      const filesToAdd = incomingFiles.filter(Boolean);
      if (!filesToAdd.length) return;

      clearFeedback();
      setBusy(true);

      try {
        if (hasZipConflict(files, filesToAdd)) {
          setError(
            "No se pueden mezclar archivos sueltos con un ZIP. Elimina lo actual o carga solo una de las dos opciones.",
          );
          return;
        }

        const incomingZip = filesToAdd.filter((file) => isZipFile(file.name));

        if (incomingZip.length > 1) {
          setError("Solo se permite un archivo ZIP a la vez.");
          return;
        }

        if (incomingZip.length === 1) {
          if (files.length > 0) {
            setError(
              "Primero limpia los archivos cargados. El ZIP no se puede combinar con archivos sueltos.",
            );
            return;
          }

          const zipFiles = await readZipEntries(incomingZip[0]);
          if (!zipFiles.length) {
            setError(
              "El ZIP no contiene archivos de texto compatibles después del filtrado.",
            );
            return;
          }

          setFiles(zipFiles);
          setMessage(`ZIP procesado: ${zipFiles.length} archivos cargados en memoria.`);
          return;
        }

        if (files.some((file) => file.source === "zip")) {
          setError(
            "No puedes agregar archivos sueltos porque ya existe un ZIP cargado. Limpia la selección primero.",
          );
          return;
        }

        const regularFiles = filesToAdd.filter((file) => !isZipFile(file.name));
        const loadedFiles = await readRegularFiles(regularFiles);

        if (!loadedFiles.length) {
          setError(
            "No se detectaron archivos de texto compatibles para agregar al contexto.",
          );
          return;
        }

        setFiles((current) => {
          const existing = new Set(current.map((file) => file.path));
          const unique = loadedFiles.filter((file) => !existing.has(file.path));
          return [...current, ...unique].sort((a, b) => a.path.localeCompare(b.path));
        });

        setMessage(
          `${loadedFiles.length} archivos agregados. Se mantienen en memoria y no se enviarán salvo que actives el toggle.`,
        );
      } catch (cause) {
        const errorMessage =
          cause instanceof Error
            ? cause.message
            : "No se pudieron procesar los archivos cargados.";
        setError(errorMessage);
      } finally {
        setBusy(false);
      }
    },
    [clearFeedback, files],
  );

  const composeMessage = useCallback(
    (message: string) => composeMessageWithContext(message, files, applyToCurrentMessage),
    [applyToCurrentMessage, files],
  );

  return {
    files,
    busy,
    message,
    error,
    modelLabel,
    providerLabel,
    contextWindowTokens,
    approxTokens,
    usagePercent,
    selectionMode,
    applyToCurrentMessage,
    setApplyToCurrentMessage,
    addFiles,
    removeFile,
    clearFiles,
    composeMessage,
    clearFeedback,
    acceptedExtensions: ALLOWED_EXTENSIONS,
    acceptedFileHint: getAcceptedFileHint(),
  };
}
