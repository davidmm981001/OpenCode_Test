/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_WEBHOOK_URL?: string;
  /** User stories generation (US Generation n8n workflow). Prefer over VITE_N8N_WEBHOOK_URL for stories. */
  readonly VITE_N8N_US_WEBHOOK_URL?: string;
  readonly VITE_N8N_SCRIPTS_WEBHOOK_URL?: string;
  readonly VITE_N8N_TC_WEBHOOK_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Embedded app-generation frontend URL (iframe), e.g. http://localhost:3002 */
  readonly VITE_SDD_ORCHESTRATOR_URL?: string;
  /** App-generation orchestrator API (parent-origin fetch for sync), e.g. http://localhost:8003 */
  readonly VITE_SDD_ORCHESTRATOR_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
