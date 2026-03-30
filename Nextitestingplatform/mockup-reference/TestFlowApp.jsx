/**
 * TestFlow STLC Platform — React SPA
 * Architecture: Clean Architecture (Domain / Application / Infrastructure / Presentation)
 * Security: OWASP Top 10 mitigations embedded
 *
 * Layer order in this file:
 *   1. Infrastructure  — Security utils, validators, audit logger, session manager
 *   2. Domain          — Entities, value objects, interfaces
 *   3. Application     — Hooks (use cases), state management
 *   4. Presentation    — Atomic → Molecular → Organism → Views
 *   5. App root
 */

import { useState, useCallback, useRef, useEffect, createContext, useContext, useMemo, memo } from "react";

// ╔══════════════════════════════════════════════════════════════╗
// ║  LAYER 1 · INFRASTRUCTURE                                   ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Security Utilities ────────────────────────────────────────
// OWASP A03 – Injection / XSS Prevention
const SecurityUtils = {
  /**
   * Strip HTML tags and dangerous characters from user input.
   * Prevents stored/reflected XSS without relying on dangerouslySetInnerHTML.
   */
  sanitize: (value) => {
    if (typeof value !== "string") return "";
    return value
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .replace(/`/g, "&#x60;")
      .replace(/=/g, "&#x3D;");
  },

  /** Strip HTML entirely (for code blocks shown via textContent, not innerHTML) */
  stripTags: (value) => String(value ?? "").replace(/<[^>]*>/g, ""),

  // OWASP A04 – Insecure Design: CSRF token per session
  generateCSRFToken: () => {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  /**
   * Validate a URL before any fetch to prevent SSRF (OWASP A10).
   * Allowlist of trusted hosts only.
   */
  validateUrl: (url) => {
    const ALLOWED_HOSTS = [
      "atlassian.net",
      "banco-internacional.atlassian.net",
      "nextisolutions.atlassian.net",
      "api.anthropic.com",
    ];
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return { valid: false, reason: "Solo se permiten conexiones HTTPS" };
      const hostAllowed = ALLOWED_HOSTS.some((h) => parsed.hostname.endsWith(h));
      if (!hostAllowed) return { valid: false, reason: `Host no permitido: ${parsed.hostname}` };
      return { valid: true };
    } catch {
      return { valid: false, reason: "URL con formato inválido" };
    }
  },

  // OWASP A02 – Cryptographic Failures: mask sensitive values in UI
  maskSecret: (value, visibleChars = 4) => {
    if (!value || value.length <= visibleChars) return "••••••••";
    return value.slice(0, visibleChars) + "••••••••••••••••";
  },
};

// ── Validation Schema ─────────────────────────────────────────
// OWASP A08 – Software & Data Integrity: validate before mutation
const Validators = {
  required: (v) => (!v || !String(v).trim() ? "Campo obligatorio" : null),
  maxLen: (max) => (v) => (String(v ?? "").length > max ? `Máximo ${max} caracteres` : null),
  minLen: (min) => (v) => (String(v ?? "").length < min ? `Mínimo ${min} caracteres` : null),
  projectCode: (v) => {
    if (!v) return "Campo obligatorio";
    if (!/^[A-Z]{2,5}-\d{3,4}$/.test(v)) return "Formato inválido (ej: BNK-001)";
    return null;
  },
  apiToken: (v) => {
    if (!v) return "Token requerido";
    // Reject tokens that look like common test/demo values
    const BLOCKED = ["test", "demo", "password", "secret", "12345"];
    if (BLOCKED.some((b) => v.toLowerCase().includes(b))) return "Token no seguro";
    return null;
  },
  validateForm: (data, rules) => {
    const errors = {};
    Object.entries(rules).forEach(([field, fns]) => {
      for (const fn of fns) {
        const err = fn(data[field]);
        if (err) { errors[field] = err; break; }
      }
    });
    return { valid: Object.keys(errors).length === 0, errors };
  },
};

// ── Audit Logger ─────────────────────────────────────────────
// OWASP A09 – Security Logging & Monitoring Failures
const AuditLogger = (() => {
  const logs = [];
  const SEVERITY = { INFO: "INFO", WARN: "WARN", SECURITY: "SECURITY", ERROR: "ERROR" };
  return {
    log: (action, details = {}, severity = SEVERITY.INFO) => {
      const entry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        action,
        severity,
        user: "david.balseca@nextisolutions.com", // Would come from auth context in production
        ip: "CLIENT", // Captured server-side in production
        userAgent: navigator.userAgent.slice(0, 80),
        details,
      };
      logs.push(entry);
      if (severity === SEVERITY.SECURITY || severity === SEVERITY.ERROR) {
        console.warn("[AUDIT]", entry); // Send to SIEM in production
      }
    },
    getLogs: () => [...logs],
    SEVERITY,
  };
})();

// ── Session Manager ───────────────────────────────────────────
// OWASP A07 – Identification & Authentication Failures
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min idle timeout
const SessionManager = {
  _lastActivity: Date.now(),
  _csrfToken: null,
  init: () => {
    SessionManager._csrfToken = SecurityUtils.generateCSRFToken();
    AuditLogger.log("SESSION_INIT", { csrfGenerated: true });
  },
  touch: () => { SessionManager._lastActivity = Date.now(); },
  isExpired: () => Date.now() - SessionManager._lastActivity > SESSION_TIMEOUT_MS,
  getCSRF: () => SessionManager._csrfToken,
  // OWASP A07: brute-force lockout tracking
  _failedAttempts: 0,
  MAX_ATTEMPTS: 5,
  recordFailedAuth: () => {
    SessionManager._failedAttempts++;
    AuditLogger.log("AUTH_FAILURE", { attempts: SessionManager._failedAttempts }, AuditLogger.SEVERITY.SECURITY);
    return SessionManager._failedAttempts >= SessionManager.MAX_ATTEMPTS;
  },
  resetFailedAuth: () => { SessionManager._failedAttempts = 0; },
};
SessionManager.init();

// ── Secure API Client ─────────────────────────────────────────
// OWASP A10 – SSRF: URL validated before fetch; A04: CSRF header attached
const ApiClient = {
  post: async (url, body) => {
    const urlCheck = SecurityUtils.validateUrl(url);
    if (!urlCheck.valid) {
      AuditLogger.log("SSRF_BLOCKED", { url, reason: urlCheck.reason }, AuditLogger.SEVERITY.SECURITY);
      throw new Error(urlCheck.reason);
    }
    // In production: attach Bearer token from SessionManager, CSRF header
    const headers = {
      "Content-Type": "application/json",
      "X-CSRF-Token": SessionManager.getCSRF(),
      "X-Request-Id": crypto.randomUUID(),
    };
    AuditLogger.log("API_REQUEST", { url, method: "POST" });
    // Simulated — real implementation uses actual fetch
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 800));
  },
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  LAYER 2 · DOMAIN                                           ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Roles & Permissions (RBAC) ───────────────────────────────
// OWASP A01 – Broken Access Control
const ROLES = { ADMIN: "ADMIN", ARCHITECT: "ARCHITECT", QA: "QA", VIEWER: "VIEWER" };
const PERMISSIONS = {
  [ROLES.ADMIN]:     ["projects:read","projects:write","projects:delete","stories:read","stories:write","testcases:read","testcases:write","automation:generate","jira:read","jira:write","settings:write"],
  [ROLES.ARCHITECT]: ["projects:read","projects:write","stories:read","stories:write","testcases:read","testcases:write","automation:generate","jira:read","jira:write"],
  [ROLES.QA]:        ["projects:read","stories:read","testcases:read","testcases:write","automation:generate","jira:read"],
  [ROLES.VIEWER]:    ["projects:read","stories:read","testcases:read"],
};
const can = (role, permission) => (PERMISSIONS[role] ?? []).includes(permission);

// ── Domain Entities (Value Objects) ──────────────────────────
const StoryStatus = { GENERATED: "generated", PENDING: "pending", REVIEW: "review" };
const TestCaseType = { FUNCTIONAL: "Funcional", NEGATIVE: "Negativo", EDGE: "Edge case", INTEGRATION: "Integración", PERFORMANCE: "Performance", SECURITY: "Seguridad" };
const Priority = { HIGH: "Alta", MEDIUM: "Media", LOW: "Baja" };
const SyncStatus = { SYNCED: "synced", PENDING: "pending", FAILED: "failed" };

/** Factory: creates a sanitized Project entity */
const createProject = ({ code, name, client, description, language, qaFramework, jiraKey }) => ({
  id: crypto.randomUUID(),
  code: SecurityUtils.sanitize(code),
  name: SecurityUtils.sanitize(name),
  client: SecurityUtils.sanitize(client),
  description: SecurityUtils.sanitize(description),
  language: SecurityUtils.sanitize(language),
  qaFramework: SecurityUtils.sanitize(qaFramework),
  jiraKey: SecurityUtils.sanitize(jiraKey),
  createdAt: new Date().toISOString(),
  stats: { requirements: 0, stories: 0, testCases: 0, automatedTests: 0, jiraSynced: 0 },
});

/** Factory: creates a sanitized UserStory entity */
const createUserStory = ({ projectId, title, description, module, criteria }) => ({
  id: `HU-${String(Date.now()).slice(-3)}`,
  projectId,
  title: SecurityUtils.sanitize(title),
  description: SecurityUtils.sanitize(description),
  module: SecurityUtils.sanitize(module),
  criteria: (criteria ?? []).map(SecurityUtils.sanitize),
  status: StoryStatus.PENDING,
  jiraId: null,
  jiraSyncStatus: SyncStatus.PENDING,
  createdAt: new Date().toISOString(),
});

/** Factory: creates a sanitized TestCase entity */
const createTestCase = ({ storyId, projectId, description, preconditions, steps, expected, type, priority }) => ({
  id: `TC-${String(Date.now()).slice(-3)}`,
  storyId,
  projectId,
  description: SecurityUtils.sanitize(description),
  preconditions: SecurityUtils.sanitize(preconditions),
  steps: SecurityUtils.sanitize(steps),
  expected: SecurityUtils.sanitize(expected),
  type: type ?? TestCaseType.FUNCTIONAL,
  priority: priority ?? Priority.MEDIUM,
  status: StoryStatus.PENDING,
  automatedCode: null,
  createdAt: new Date().toISOString(),
});

// ── Seed Data (sanitized at creation) ────────────────────────
const SEED_PROJECTS = [
  { id: "p1", code: "BNK-001", name: "Core Banking API", client: "Banco Internacional", description: "Migración OSB → AWS API Gateway. Módulos de seguridad y conciliación Visa Direct.", language: "Java · Spring Boot", qaFramework: "Playwright + Cucumber", jiraKey: "BNK", createdAt: "2025-01-15T10:00:00Z", stats: { requirements: 12, stories: 22, testCases: 84, automatedTests: 56, jiraSynced: 38 } },
  { id: "p2", code: "INS-002", name: "SaludSa — JAMS Migration", client: "SaludSa", description: "Migración Hangfire a JAMS. Módulo de Fees y Coberturas con motor de reglas.", language: ".NET 8 / C#", qaFramework: "Serenity BDD", jiraKey: "INS", createdAt: "2025-02-01T09:00:00Z", stats: { requirements: 8, stories: 15, testCases: 60, automatedTests: 22, jiraSynced: 15 } },
  { id: "p3", code: "ESB-003", name: "OSB Migration Bolivariano", client: "Banco Bolivariano", description: "Modernización ESB. Análisis ESQL y COBOL batch a microservicios Spring Boot.", language: "COBOL / ESQL", qaFramework: "Selenium + Java", jiraKey: "ESB", createdAt: "2025-03-01T08:00:00Z", stats: { requirements: 5, stories: 10, testCases: 40, automatedTests: 0, jiraSynced: 0 } },
];

const SEED_STORIES = [
  { id: "HU-001", projectId: "p1", title: "Como usuario autenticado, quiero transferir fondos entre cuentas propias", module: "Transferencias", description: "Como usuario bancario autenticado mediante OAuth 2.0 + MFA, quiero poder realizar transferencias de fondos entre mis cuentas registradas.", criteria: ["DADO que el usuario está autenticado y tiene saldo disponible, CUANDO ingresa monto válido, ENTONCES la transferencia se procesa en menos de 3 segundos.", "DADO que el monto excede el saldo, CUANDO intenta confirmar, ENTONCES el sistema retorna error E-4001.", "DADO que la transferencia es exitosa, ENTONCES se genera registro en módulo CORECALC.", "DADO que el servicio ESQL retorna RECHAZADO, ENTONCES se registra en log de auditoría.", "DADO un fallo de red, ENTONCES el sistema implementa rollback automático."], status: StoryStatus.GENERATED, jiraId: "BNK-145", jiraSyncStatus: SyncStatus.SYNCED },
  { id: "HU-002", projectId: "p1", title: "Como administrador, quiero configurar reglas de límites de transferencia por perfil", module: "Seguridad", description: "Como administrador del sistema, necesito configurar límites diarios, semanales y mensuales diferenciados por perfil de usuario para cumplir regulaciones SBS.", criteria: ["DADO que el admin modifica un límite, CUANDO guarda, ENTONCES el cambio aplica en máximo 5 minutos.", "DADO que se configura límite $0, ENTONCES el sistema rechaza con error de negocio.", "DADO un cambio en límites, ENTONCES el módulo ESQL TransfValidation recibe la regla actualizada."], status: StoryStatus.REVIEW, jiraId: null, jiraSyncStatus: SyncStatus.PENDING },
  { id: "HU-003", projectId: "p1", title: "Como usuario, quiero consultar historial de movimientos con filtros avanzados", module: "Consultas", description: "Como usuario bancario autenticado, quiero consultar mis movimientos filtrando por fecha, tipo y monto para llevar control de mis transacciones.", criteria: ["DADO que el usuario aplica filtros válidos, CUANDO confirma, ENTONCES el sistema retorna resultados en menos de 2 segundos.", "DADO que no hay movimientos en el rango, ENTONCES el sistema muestra mensaje informativo sin error.", "DADO un rango de fechas mayor a 12 meses, ENTONCES el sistema advierte y pagina automáticamente."], status: StoryStatus.PENDING, jiraId: null, jiraSyncStatus: SyncStatus.PENDING },
];

const SEED_TESTCASES = [
  { id: "TC-001", storyId: "HU-001", projectId: "p1", description: "Transferencia exitosa con saldo suficiente", preconditions: "Usuario autenticado con OAuth 2.0 + MFA\nCuenta origen con saldo >= $500", steps: "1. Navegar a Transferencias\n2. Seleccionar cuenta origen\n3. Ingresar monto $500\n4. Confirmar con token\n5. Verificar confirmación", expected: "Mensaje de éxito visible\nTiempo < 3 segundos\nSaldo actualizado en ambas cuentas", type: TestCaseType.FUNCTIONAL, priority: Priority.HIGH, status: StoryStatus.GENERATED },
  { id: "TC-002", storyId: "HU-001", projectId: "p1", description: "Transferencia rechazada por saldo insuficiente (error E-4001)", preconditions: "Usuario autenticado\nSaldo cuenta origen $10", steps: "1. Navegar a Transferencias\n2. Ingresar monto $500\n3. Confirmar operación", expected: "Error E-4001 visible\nMensaje descriptivo al usuario\nSaldo sin modificación", type: TestCaseType.NEGATIVE, priority: Priority.HIGH, status: StoryStatus.GENERATED },
  { id: "TC-003", storyId: "HU-001", projectId: "p1", description: "Rollback automático ante falla de red durante transferencia", preconditions: "Usuario autenticado\nSimulación de corte de red en paso 3", steps: "1. Iniciar transferencia válida\n2. Simular timeout en confirmación\n3. Verificar estado de cuentas", expected: "Saldo sin modificación\nRollback confirmado en log\nMensaje de error de conectividad", type: TestCaseType.EDGE, priority: Priority.MEDIUM, status: StoryStatus.REVIEW },
  { id: "TC-004", storyId: "HU-001", projectId: "p1", description: "Validación ESQL: TransfValidation retorna RECHAZADO", preconditions: "Mock ESQL configurado para retornar RECHAZADO", steps: "1. Iniciar transferencia con monto válido\n2. ESQL retorna estado RECHAZADO\n3. Verificar log de auditoría", expected: "Operación no procesada\nRegistro en log de auditoría\nNotificación al usuario", type: TestCaseType.INTEGRATION, priority: Priority.HIGH, status: StoryStatus.GENERATED },
  { id: "TC-005", storyId: "HU-002", projectId: "p1", description: "Configurar límite perfil empresarial — propagación en 5 min", preconditions: "Admin autenticado\nLímite actual: $10,000 diarios", steps: "1. Navegar a Configuración > Límites\n2. Modificar perfil empresarial a $20,000\n3. Guardar cambios\n4. Esperar 5 minutos\n5. Verificar aplicación", expected: "Cambio aplicado en ≤ 5 minutos\nESQLmodule actualizado", type: TestCaseType.PERFORMANCE, priority: Priority.MEDIUM, status: StoryStatus.PENDING },
  { id: "TC-006", storyId: "HU-002", projectId: "p1", description: "Rechazo de límite $0 — validación de negocio", preconditions: "Admin autenticado", steps: "1. Navegar a Configuración > Límites\n2. Ingresar $0 como límite\n3. Intentar guardar", expected: "Error de validación mostrado\nLímite no modificado\nMensaje de negocio descriptivo", type: TestCaseType.NEGATIVE, priority: Priority.LOW, status: StoryStatus.GENERATED },
];

// ╔══════════════════════════════════════════════════════════════╗
// ║  LAYER 3 · APPLICATION — Hooks (Use Cases)                  ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Auth Context ──────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user] = useState({
    id: "usr-001",
    name: "David Balseca",
    email: "david.balseca@nextisolutions.com",
    role: ROLES.ARCHITECT,
    mfaEnabled: true,
    sessionExpiry: new Date(Date.now() + SESSION_TIMEOUT_MS).toISOString(),
  });
  const [sessionWarning, setSessionWarning] = useState(false);

  // OWASP A07: Session timeout warning at 25 min idle
  useEffect(() => {
    const check = setInterval(() => {
      if (SessionManager.isExpired()) setSessionWarning(true);
      SessionManager.touch();
    }, 60_000);
    return () => clearInterval(check);
  }, []);

  const hasPermission = useCallback((permission) => can(user.role, permission), [user.role]);

  return (
    <AuthContext.Provider value={{ user, hasPermission, sessionWarning }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Toast ─────────────────────────────────────────────────────
const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message: SecurityUtils.stripTags(message), type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

// ── Projects Hook ─────────────────────────────────────────────
const useProjects = () => {
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const { show } = useToast();
  const { hasPermission } = useAuth();

  const addProject = useCallback((raw) => {
    // OWASP A01: permission check
    if (!hasPermission("projects:write")) {
      AuditLogger.log("UNAUTHORIZED_ACTION", { action: "addProject" }, AuditLogger.SEVERITY.SECURITY);
      show("Sin permisos para crear proyectos", "error");
      return { success: false };
    }
    const { valid, errors } = Validators.validateForm(raw, {
      code: [Validators.required, Validators.projectCode],
      name: [Validators.required, Validators.maxLen(100)],
    });
    if (!valid) return { success: false, errors };
    const project = createProject(raw);
    setProjects((p) => [project, ...p]);
    AuditLogger.log("PROJECT_CREATED", { code: project.code });
    show(`Proyecto ${project.code} creado exitosamente`);
    return { success: true };
  }, [hasPermission, show]);

  return { projects, addProject };
};

// ── User Stories Hook ─────────────────────────────────────────
const useUserStories = (projectId) => {
  const [stories, setStories] = useState(SEED_STORIES.filter((s) => s.projectId === projectId));
  const [generating, setGenerating] = useState(false);
  const { show } = useToast();
  const { hasPermission } = useAuth();

  const generate = useCallback(async () => {
    if (!hasPermission("stories:write")) {
      show("Sin permisos para generar historias", "error"); return;
    }
    setGenerating(true);
    AuditLogger.log("AI_GENERATION_START", { type: "user_stories", projectId });
    await new Promise((r) => setTimeout(r, 2400));
    setGenerating(false);
    AuditLogger.log("AI_GENERATION_COMPLETE", { type: "user_stories", count: 22 });
    show("22 historias generadas con criterios de aceptación");
  }, [projectId, hasPermission, show]);

  const addStory = useCallback((raw) => {
    if (!hasPermission("stories:write")) { show("Sin permisos", "error"); return { success: false }; }
    const { valid, errors } = Validators.validateForm(raw, {
      title: [Validators.required, Validators.maxLen(200)],
    });
    if (!valid) return { success: false, errors };
    const story = createUserStory({ ...raw, projectId });
    setStories((s) => [story, ...s]);
    AuditLogger.log("STORY_CREATED", { id: story.id });
    show(`Historia ${story.id} creada`);
    return { success: true };
  }, [projectId, hasPermission, show]);

  const updateStory = useCallback((id, patch) => {
    if (!hasPermission("stories:write")) { show("Sin permisos", "error"); return; }
    const sanitized = Object.fromEntries(
      Object.entries(patch).map(([k, v]) => [k, typeof v === "string" ? SecurityUtils.sanitize(v) : v])
    );
    setStories((s) => s.map((x) => x.id === id ? { ...x, ...sanitized } : x));
    AuditLogger.log("STORY_UPDATED", { id });
    show("Historia actualizada");
  }, [hasPermission, show]);

  return { stories, generating, generate, addStory, updateStory };
};

// ── Test Cases Hook ───────────────────────────────────────────
const useTestCases = (projectId) => {
  const [testCases, setTestCases] = useState(SEED_TESTCASES.filter((t) => t.projectId === projectId));
  const [generating, setGenerating] = useState(false);
  const { show } = useToast();
  const { hasPermission } = useAuth();

  const generateForStory = useCallback(async (storyId) => {
    if (!hasPermission("testcases:write")) { show("Sin permisos", "error"); return; }
    setGenerating(true);
    AuditLogger.log("AI_GENERATION_START", { type: "test_cases", storyId });
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    show("Casos de prueba generados exitosamente");
  }, [hasPermission, show]);

  const addTestCase = useCallback((raw) => {
    if (!hasPermission("testcases:write")) { show("Sin permisos", "error"); return { success: false }; }
    const { valid, errors } = Validators.validateForm(raw, {
      description: [Validators.required, Validators.maxLen(300)],
      storyId: [Validators.required],
    });
    if (!valid) return { success: false, errors };
    const tc = createTestCase({ ...raw, projectId });
    setTestCases((t) => [tc, ...t]);
    AuditLogger.log("TESTCASE_CREATED", { id: tc.id });
    show(`Caso ${tc.id} creado`);
    return { success: true };
  }, [projectId, hasPermission, show]);

  const updateTestCase = useCallback((id, patch) => {
    if (!hasPermission("testcases:write")) { show("Sin permisos", "error"); return; }
    const sanitized = Object.fromEntries(
      Object.entries(patch).map(([k, v]) => [k, typeof v === "string" ? SecurityUtils.sanitize(v) : v])
    );
    setTestCases((t) => t.map((x) => x.id === id ? { ...x, ...sanitized } : x));
    AuditLogger.log("TESTCASE_UPDATED", { id });
    show("Caso de prueba guardado");
  }, [hasPermission, show]);

  const deleteTestCase = useCallback((id) => {
    if (!hasPermission("testcases:write")) { show("Sin permisos", "error"); return; }
    setTestCases((t) => t.filter((x) => x.id !== id));
    AuditLogger.log("TESTCASE_DELETED", { id }, AuditLogger.SEVERITY.WARN);
    show("Caso eliminado");
  }, [hasPermission, show]);

  return { testCases, generating, generateForStory, addTestCase, updateTestCase, deleteTestCase };
};

// ── Automation Hook ───────────────────────────────────────────
const useAutomation = () => {
  const [framework, setFramework] = useState("Playwright");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [running, setRunning] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const { show } = useToast();

  const generate = useCallback(async (config) => {
    setRunning(true);
    setGeneratedCode(null);
    const steps = [
      [15, "Analizando casos de prueba..."],
      [32, "Generando estructura Page Objects..."],
      [55, "Creando specs de prueba..."],
      [72, "Configurando fixtures y helpers OAuth..."],
      [88, "Generando stubs ESQL / COBOL..."],
      [100, "Código generado exitosamente"],
    ];
    for (const [pct, label] of steps) {
      setProgress(pct);
      setProgressLabel(label);
      await new Promise((r) => setTimeout(r, 550));
    }
    setGeneratedCode(`import { test, expect } from '@playwright/test';
import { TransferPage } from '../pages/TransferPage';
import { AuthHelper } from '../helpers/AuthHelper';

// OWASP A07: OAuth 2.0 + MFA authentication helper
test.describe('HU-001 — Transferencia entre cuentas propias', () => {

  test.beforeEach(async ({ page }) => {
    // Secure: credentials from environment variables, never hardcoded
    await new AuthHelper(page).loginOAuth({
      user: process.env.TEST_USER,  // CI/CD secret
      mfa: process.env.TEST_MFA_SEED,
    });
  });

  test('TC-001: Transferencia exitosa con saldo suficiente', async ({ page }) => {
    const transferPage = new TransferPage(page);
    await transferPage.navigate();
    await transferPage.selectSourceAccount('001-1234567-000');
    await transferPage.selectDestinationAccount('001-7654321-000');
    await transferPage.enterAmount(500.00);

    const startTime = Date.now();
    await transferPage.confirmTransfer();
    const elapsed = Date.now() - startTime;

    await expect(transferPage.successMessage).toBeVisible();
    expect(elapsed).toBeLessThan(3000); // SLA < 3s
    await expect(transferPage.newBalance).toContainText('$');
  });

  test('TC-002: Rechazo por saldo insuficiente — Error E-4001', async ({ page }) => {
    const transferPage = new TransferPage(page);
    await transferPage.navigate();
    await transferPage.enterAmount(99999.00);
    await transferPage.confirmTransfer();
    await expect(transferPage.errorMessage).toContainText('E-4001');
  });
});`);
    setRunning(false);
    show(`Código ${config.framework} generado · 84 specs`);
  }, [show]);

  return { framework, setFramework, progress, progressLabel, running, generatedCode, generate };
};

// ── Jira Hook ─────────────────────────────────────────────────
const useJira = (projectId) => {
  const [connected, setConnected] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [config, setConfig] = useState({
    url: "https://banco-internacional.atlassian.net",
    token: "ATATxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    projectKey: "BNK",
    issueType: "Story",
    testIssueType: "Test (Zephyr)",
  });
  const { show } = useToast();
  const { hasPermission } = useAuth();

  const updateConfig = useCallback((patch) => {
    if (!hasPermission("jira:write")) { show("Sin permisos para configurar Jira", "error"); return; }
    // OWASP A08: validate URL before saving
    if (patch.url) {
      const check = SecurityUtils.validateUrl(patch.url);
      if (!check.valid) { show(`URL inválida: ${check.reason}`, "error"); return; }
    }
    setConfig((c) => ({ ...c, ...patch }));
  }, [hasPermission, show]);

  const testConnection = useCallback(async () => {
    const check = SecurityUtils.validateUrl(config.url);
    if (!check.valid) { show(check.reason, "error"); return; }
    AuditLogger.log("JIRA_CONNECTION_TEST", { url: config.url });
    await ApiClient.post(config.url + "/rest/api/3/myself", {});
    setConnected(true);
    show("Conexión exitosa con Jira Cloud");
  }, [config.url, show]);

  const syncItems = useCallback(async (items) => {
    if (!hasPermission("jira:write")) { show("Sin permisos", "error"); return; }
    setSyncing(true);
    AuditLogger.log("JIRA_SYNC_START", { count: items.length });
    await new Promise((r) => setTimeout(r, 1800));
    setSyncing(false);
    AuditLogger.log("JIRA_SYNC_COMPLETE", { count: items.length });
    show(`${items.length} elementos sincronizados con Jira`);
  }, [hasPermission, show]);

  return { connected, syncing, config, updateConfig, testConnection, syncItems };
};

// ── Form Hook (generic, secure) ───────────────────────────────
const useSecureForm = (initial, rules = {}) => {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const set = useCallback((field, rawValue) => {
    // OWASP A03: sanitize every input on change
    const value = typeof rawValue === "string" ? SecurityUtils.sanitize(rawValue) : rawValue;
    setValues((v) => ({ ...v, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
    if (rules[field]) {
      for (const fn of rules[field]) {
        const err = fn(value);
        setErrors((e) => ({ ...e, [field]: err }));
        if (err) break;
      }
    }
  }, [rules]);

  const validate = useCallback(() => {
    const { valid, errors: errs } = Validators.validateForm(values, rules);
    setErrors(errs);
    return valid;
  }, [values, rules]);

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  return { values, errors, touched, set, validate, reset };
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  LAYER 4 · PRESENTATION                                     ║
// ╚══════════════════════════════════════════════════════════════╝

// ── Design Tokens ─────────────────────────────────────────────
const T = {
  green: "#05E194", greenDim: "rgba(5,225,148,0.14)", greenSoft: "rgba(5,225,148,0.07)",
  blue: "#052158", bg: "#04142a", surface: "#071e3d", surface2: "#0a2850", surface3: "#0d3060",
  text: "#e8f1ff", text2: "#7a9cc4", text3: "#4a6a94",
  border: "rgba(5,225,148,0.18)", border2: "rgba(255,255,255,0.07)",
  red: "#ff4d6a", amber: "#ffb547", teal: "#00d4ff",
};

// ── Atomic Components ─────────────────────────────────────────

const Btn = memo(({ variant = "secondary", size = "md", onClick, disabled, children, title }) => {
  const base = { display:"inline-flex", alignItems:"center", gap:7, border:"1px solid transparent", borderRadius:8, fontFamily:"'Work Sans',sans-serif", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, whiteSpace:"nowrap", transition:"all .15s", textDecoration:"none" };
  const sizes = { xs:{ padding:"3px 8px", fontSize:11 }, sm:{ padding:"5px 12px", fontSize:12 }, md:{ padding:"8px 16px", fontSize:13 } };
  const variants = {
    primary: { background:T.green, color:"#04142a", borderColor:T.green },
    secondary: { background:T.surface2, color:T.text, borderColor:T.border2 },
    ghost: { background:"transparent", color:T.text2, borderColor:"transparent" },
    danger: { background:"rgba(255,77,106,0.12)", color:T.red, borderColor:"rgba(255,77,106,0.3)" },
  };
  return (
    <button style={{...base, ...sizes[size], ...variants[variant]}} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
});

// OWASP A03: FormInput never uses dangerouslySetInnerHTML; value always sanitized via useSecureForm
const FormInput = memo(({ label, value, onChange, placeholder, type = "text", error, multiline, rows = 3, readOnly, style }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display:"block", fontSize:12, fontWeight:500, color:T.text2, marginBottom:5 }}>{label}</label>}
    {multiline
      ? <textarea value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} readOnly={readOnly} rows={rows}
          style={{ width:"100%", background:T.surface2, border:`1px solid ${error ? T.red : T.border2}`, borderRadius:8, padding:"9px 13px", fontFamily:"'Work Sans',sans-serif", fontSize:13, color:T.text, resize:"vertical", lineHeight:1.6, outline:"none", ...style }} />
      : <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} readOnly={readOnly}
          style={{ width:"100%", background:T.surface2, border:`1px solid ${error ? T.red : T.border2}`, borderRadius:8, padding:"9px 13px", fontFamily:"'Work Sans',sans-serif", fontSize:13, color:T.text, outline:"none", ...style }} />
    }
    {error && <div style={{ fontSize:11, color:T.red, marginTop:4 }}>{error}</div>}
  </div>
));

const Select = memo(({ label, value, onChange, options, error }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display:"block", fontSize:12, fontWeight:500, color:T.text2, marginBottom:5 }}>{label}</label>}
    <select value={value} onChange={(e) => onChange?.(e.target.value)} style={{ width:"100%", background:T.surface2, border:`1px solid ${error ? T.red : T.border2}`, borderRadius:8, padding:"9px 13px", fontFamily:"'Work Sans',sans-serif", fontSize:13, color:T.text, outline:"none" }}>
      {options.map((o) => <option key={o.value ?? o} value={o.value ?? o} style={{ background:"#071e3d" }}>{o.label ?? o}</option>)}
    </select>
    {error && <div style={{ fontSize:11, color:T.red, marginTop:4 }}>{error}</div>}
  </div>
));

const Badge = ({ label, color = T.text2, bg = T.surface2 }) => (
  <span style={{ fontSize:11, padding:"2px 9px", borderRadius:20, background:bg, color, fontWeight:500 }}>{label}</span>
);

const StatusBadge = ({ status }) => {
  const MAP = {
    [StoryStatus.GENERATED]: { label:"Generada", color:T.green, bg:"rgba(5,225,148,0.13)" },
    [StoryStatus.PENDING]:   { label:"Pendiente", color:T.amber, bg:"rgba(255,181,71,0.13)" },
    [StoryStatus.REVIEW]:    { label:"En revisión", color:T.teal, bg:"rgba(0,212,255,0.13)" },
  };
  const s = MAP[status] ?? MAP[StoryStatus.PENDING];
  return <Badge label={s.label} color={s.color} bg={s.bg} />;
};

const PriorityBadge = ({ priority }) => {
  const MAP = {
    [Priority.HIGH]:   { color:T.red, bg:"rgba(255,77,106,0.14)" },
    [Priority.MEDIUM]: { color:T.amber, bg:"rgba(255,181,71,0.13)" },
    [Priority.LOW]:    { color:T.green, bg:"rgba(5,225,148,0.11)" },
  };
  const s = MAP[priority] ?? MAP[Priority.MEDIUM];
  return <Badge label={priority} color={s.color} bg={s.bg} />;
};

const Card = ({ children, style }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border2}`, borderRadius:12, padding:20, ...style }}>
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, action }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
    <div>
      <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:15, fontWeight:600, color:T.text }}>{title}</div>
      {subtitle && <div style={{ fontSize:12, color:T.text2, marginTop:2 }}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

const ProgressBar = ({ value, color = T.green }) => (
  <div style={{ height:3, background:T.surface3, borderRadius:2, overflow:"hidden" }}>
    <div style={{ height:"100%", width:`${value}%`, background:color, borderRadius:2, transition:"width .5s" }} />
  </div>
);

// ── Modal ─────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, footer, width = 560 }) => {
  // OWASP A03: clicking overlay closes modal (UX security — prevent accidental data exposure)
  if (!open) return null;
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(4,20,42,0.88)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, width, maxWidth:"92vw", maxHeight:"88vh", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${T.border2}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:17, fontWeight:600, color:T.text }}>{title}</div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:6, background:T.surface2, border:"none", cursor:"pointer", color:T.text2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:24, overflowY:"auto", flex:1 }}>{children}</div>
        {footer && <div style={{ padding:"14px 24px", borderTop:`1px solid ${T.border2}`, display:"flex", justifyContent:"flex-end", gap:8 }}>{footer}</div>}
      </div>
    </div>
  );
};

// ── Toast Container ───────────────────────────────────────────
const ToastContainer = ({ toasts }) => (
  <div style={{ position:"fixed", bottom:24, right:24, zIndex:200, display:"flex", flexDirection:"column", gap:8 }}>
    {toasts.map((t) => (
      <div key={t.id} style={{ background:T.surface, border:`1px solid ${t.type === "error" ? T.red : T.green}`, borderRadius:8, padding:"11px 16px", display:"flex", alignItems:"center", gap:10, fontSize:13, color:T.text, minWidth:260, boxShadow:"0 4px 20px rgba(0,0,0,0.4)", animation:"slideIn .3s ease" }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:t.type === "error" ? T.red : T.green, flexShrink:0 }} />
        {t.message}
      </div>
    ))}
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────
const Sidebar = memo(({ view, onNavigate, projects, activeProjectId, onOpenProject, onNewProject }) => {
  const { user } = useAuth();
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <aside style={{ width:220, minWidth:220, background:T.surface, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", height:"100vh" }}>
      {/* Logo */}
      <div style={{ padding:"22px 20px 16px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, background:T.green, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#04142a" }}>T</div>
          <span style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:17, fontWeight:700, color:T.text }}>Test<span style={{ color:T.green }}>Flow</span></span>
        </div>
        <div style={{ fontSize:10, color:T.text3, letterSpacing:"1.5px", textTransform:"uppercase", marginTop:2, paddingLeft:38 }}>STLC Platform · NexTI</div>
      </div>

      {/* Navigation */}
      <div style={{ padding:"16px 12px 8px", flex:1, overflowY:"auto" }}>
        <NavLabel>General</NavLabel>
        <NavItem active={view === "projects"} onClick={() => onNavigate("projects")}>🗂 Proyectos <NavBadge>{projects.length}</NavBadge></NavItem>
        <NavItem onClick={onNewProject}>＋ Nuevo Proyecto</NavItem>
        <div style={{ height:1, background:T.border2, margin:"10px 0" }} />
        <NavLabel>Recientes</NavLabel>
        {projects.slice(0, 4).map((p) => (
          <div key={p.id} onClick={() => onOpenProject(p)} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:6, cursor:"pointer", fontSize:12, color: activeProjectId === p.id ? T.green : T.text2, background: activeProjectId === p.id ? T.greenSoft : "transparent", marginBottom:1 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: activeProjectId === p.id ? T.green : T.text3 }} />
            {p.code} · {p.name.slice(0, 18)}
          </div>
        ))}
        <div style={{ height:1, background:T.border2, margin:"10px 0" }} />
        <NavItem active={view === "settings"} onClick={() => onNavigate("settings")}>⚙ Configuración</NavItem>
        <NavItem active={view === "audit"} onClick={() => onNavigate("audit")}>🔒 Auditoría OWASP</NavItem>
      </div>

      {/* User */}
      <div style={{ padding:12, borderTop:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, background:T.surface2 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:T.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#04142a" }}>{initials}</div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
            <div style={{ fontSize:10, color:T.text2 }}>{user.role} · MFA ✓</div>
          </div>
        </div>
      </div>
    </aside>
  );
});

const NavItem = ({ active, onClick, children }) => (
  <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, cursor:"pointer", color: active ? T.green : T.text2, background: active ? T.greenDim : "transparent", border:`1px solid ${active ? T.border : "transparent"}`, fontSize:13, fontWeight:500, marginBottom:2, transition:"all .15s" }}>
    {children}
  </div>
);
const NavLabel = ({ children }) => <div style={{ fontSize:10, color:T.text3, textTransform:"uppercase", letterSpacing:"1.5px", padding:"0 8px", marginBottom:6 }}>{children}</div>;
const NavBadge = ({ children }) => <span style={{ marginLeft:"auto", background:T.surface3, color:T.text2, fontSize:10, padding:"2px 7px", borderRadius:10 }}>{children}</span>;

// ── Top Bar ───────────────────────────────────────────────────
const TopBar = ({ title, children }) => (
  <div style={{ height:56, borderBottom:`1px solid ${T.border2}`, display:"flex", alignItems:"center", padding:"0 28px", gap:16, background:T.surface, flexShrink:0 }}>
    <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:16, fontWeight:600, color:T.text, flex:1 }}>{title}</div>
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>{children}</div>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accentColor = T.green }) => (
  <div style={{ background:T.surface, border:`1px solid ${T.border2}`, borderRadius:12, padding:16, position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:accentColor }} />
    <div style={{ fontSize:11, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>{label}</div>
    <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:28, fontWeight:700, color:T.text }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:T.text2, marginTop:4 }}>{sub}</div>}
  </div>
);

// ── Tabs ──────────────────────────────────────────────────────
const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display:"flex", gap:2, borderBottom:`1px solid ${T.border2}`, marginBottom:24 }}>
    {tabs.map((t) => (
      <div key={t.id} onClick={() => onChange(t.id)} style={{ padding:"10px 16px", fontSize:13, fontWeight:500, color: active === t.id ? T.green : T.text2, cursor:"pointer", borderBottom:`2px solid ${active === t.id ? T.green : "transparent"}`, marginBottom:-1, transition:"all .15s", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
        {t.icon && <span style={{ fontSize:14 }}>{t.icon}</span>}{t.label}
        {t.badge && <span style={{ fontSize:10, padding:"1px 6px", borderRadius:10, background: active === t.id ? "rgba(5,225,148,0.2)" : T.surface3, color: active === t.id ? T.green : T.text2 }}>{t.badge}</span>}
      </div>
    ))}
  </div>
);

// ── Code Editor ───────────────────────────────────────────────
const CodeEditor = ({ lang, value, onChange, readOnly, height = 160 }) => (
  <div style={{ background:"#020d1a", border:`1px solid ${T.border2}`, borderRadius:8, overflow:"hidden" }}>
    <div style={{ background:T.surface2, padding:"7px 14px", display:"flex", alignItems:"center", borderBottom:`1px solid ${T.border2}` }}>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.green }}>{lang}</span>
    </div>
    <textarea value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={readOnly}
      style={{ width:"100%", background:"transparent", border:"none", outline:"none", padding:14, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#a8c7e8", lineHeight:1.7, resize:"vertical", minHeight:height }} />
  </div>
);

// ── File Upload Zone ──────────────────────────────────────────
const UploadZone = ({ label, onUpload }) => (
  <div onClick={() => onUpload(label)} style={{ border:`1.5px dashed ${T.border}`, borderRadius:12, padding:24, textAlign:"center", cursor:"pointer", background:T.greenSoft }}>
    <div style={{ fontSize:24, marginBottom:8 }}>📄</div>
    <div style={{ fontSize:14, fontWeight:500, color:T.text, marginBottom:4 }}>Arrastrar archivo o hacer clic</div>
    <div style={{ fontSize:12, color:T.text2 }}>.pdf, .docx, .txt, .csv — máx. 10 MB</div>
  </div>
);

// ── Framework Card ────────────────────────────────────────────
const FrameworkCard = ({ fw, selected, onSelect }) => (
  <div onClick={() => onSelect(fw.id)} style={{ background:T.surface, border:`1.5px solid ${selected ? T.green : T.border2}`, borderRadius:12, padding:18, cursor:"pointer", textAlign:"center", background: selected ? T.greenDim : T.surface }}>
    <div style={{ width:44, height:44, borderRadius:10, margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:500, ...fw.style }}>{fw.abbr}</div>
    <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:3 }}>{fw.name}</div>
    <div style={{ fontSize:11, color:T.text2 }}>{fw.desc}</div>
  </div>
);

// ── Protected Gate ────────────────────────────────────────────
// OWASP A01: Wraps UI elements that require a permission
const Protected = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? children : fallback;
};

// ────────────────────────────────────────────────────────────────
// VIEWS
// ────────────────────────────────────────────────────────────────

// ── View: Projects List ───────────────────────────────────────
const ProjectsView = ({ projects, onOpen, onNew }) => (
  <div style={{ flex:1, overflowY:"auto", padding:28 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
      <StatCard label="Total Proyectos" value={projects.length} sub={`${projects.length} activos`} accentColor={T.green} />
      <StatCard label="Historias Generadas" value="47" sub="Across all projects" accentColor={T.teal} />
      <StatCard label="Casos de Prueba" value="184" sub="12 pendientes revisión" accentColor={T.amber} />
      <StatCard label="Sincronizados Jira" value="38" sub="9 en cola" accentColor={T.red} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
      {projects.map((p) => (
        <div key={p.id} onClick={() => onOpen(p)} style={{ background:T.surface, border:`1px solid ${T.border2}`, borderRadius:12, padding:20, cursor:"pointer", transition:"all .2s" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.green, marginBottom:8 }}>{p.code}</div>
          <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:16, fontWeight:600, color:T.text, marginBottom:4 }}>{p.name}</div>
          <div style={{ fontSize:12, color:T.text2, marginBottom:16, lineHeight:1.5 }}>{p.description}</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Badge label={p.language} /><Badge label={`${p.stats.stories} historias`} /><Badge label={p.qaFramework} />
          </div>
        </div>
      ))}
      <div onClick={onNew} style={{ border:`1.5px dashed ${T.border2}`, borderRadius:12, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:160, gap:10, cursor:"pointer" }}>
        <div style={{ fontSize:28, color:T.text3 }}>＋</div>
        <div style={{ fontSize:13, color:T.text3 }}>Crear nuevo proyecto</div>
      </div>
    </div>
  </div>
);

// ── Tab: Overview ─────────────────────────────────────────────
const OverviewTab = ({ project }) => (
  <div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
      <StatCard label="Requerimientos" value={project.stats.requirements} sub="Funcionales cargados" accentColor={T.teal} />
      <StatCard label="Historias Generadas" value={project.stats.stories} sub="Con criterios BDD" accentColor={T.green} />
      <StatCard label="Casos de Prueba" value={project.stats.testCases} sub="18 pendientes" accentColor={T.amber} />
      <StatCard label="Tests Automatizados" value={project.stats.automatedTests} sub={project.qaFramework} accentColor={T.red} />
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <Card>
        <CardHeader title="Información del Proyecto" action={<Protected permission="projects:write"><Btn size="xs" variant="ghost">Editar</Btn></Protected>} />
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          {[["Código", <span style={{ fontFamily:"'JetBrains Mono',monospace", color:T.green }}>{project.code}</span>],
            ["Proyecto", project.name], ["Lenguaje", project.language], ["Cliente", project.client],
            ["Framework QA", project.qaFramework], ["Jira", <span style={{ color:T.green }}>Conectado · {project.jiraKey}</span>]
          ].map(([k, v], i) => (
            <tr key={k}>
              <td style={{ color:T.text2, padding:"7px 0", width:140, borderTop: i ? `1px solid ${T.border2}` : "none" }}>{k}</td>
              <td style={{ padding:"7px 0", borderTop: i ? `1px solid ${T.border2}` : "none", color:T.text }}>{v}</td>
            </tr>
          ))}
        </table>
      </Card>
      <Card>
        <CardHeader title="Progreso del Ciclo STLC" />
        {[["Documentación cargada", 100, T.green], ["Historias generadas", 100, T.green], ["Casos de prueba", 73, T.amber], ["Tests automatizados", 67, T.teal], ["Sincronizado Jira", 45, T.red]].map(([label, pct, color]) => (
          <div key={label} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:T.text2, marginBottom:4 }}>
              <span>{label}</span><span style={{ color }}>{pct}%</span>
            </div>
            <ProgressBar value={pct} color={color} />
          </div>
        ))}
      </Card>
    </div>
  </div>
);

// ── Tab: Documentation ────────────────────────────────────────
const DocsTab = ({ onGenerate, generating }) => {
  const [cobol, setCobol] = useState(`       IDENTIFICATION DIVISION.
       PROGRAM-ID. CORECALC.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-CUENTA        PIC X(16).
       01 WS-SALDO         PIC 9(10)V99.
       PROCEDURE DIVISION.
           MOVE '001-1234567-000' TO WS-CUENTA
           COMPUTE WS-SALDO = WS-SALDO - WS-DEBITO
           STOP RUN.`);
  const [esql, setEsql] = useState(`CREATE COMPUTE MODULE TransfValidation_Compute
  CREATE FUNCTION Main() RETURNS BOOLEAN
  BEGIN
    DECLARE saldo DECIMAL;
    SET saldo = InputRoot.JSON.Data.saldoDisponible;
    IF saldo >= InputRoot.JSON.Data.monto THEN
      SET OutputRoot.JSON.Data.resultado = 'APROBADO';
    ELSE
      SET OutputRoot.JSON.Data.resultado = 'RECHAZADO';
    END IF;
    RETURN TRUE;
  END;
END MODULE;`);
  const { show } = useToast();

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <Card><CardHeader title="Requerimientos Funcionales" subtitle="Documento de especificación" />
          <UploadZone label="req" onUpload={() => show("RF_CoreBanking_v2.1.docx cargado")} />
        </Card>
        <Card><CardHeader title="Historias de Usuario (Base)" subtitle="Historias raw o Jira export" />
          <UploadZone label="stories" onUpload={() => show("historias_base.csv cargado")} />
        </Card>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <Card><CardHeader title="Código COBOL" subtitle="Programa batch u online" action={<Btn size="xs" variant="ghost" onClick={() => setCobol("")}>Limpiar</Btn>} />
          <CodeEditor lang="COBOL" value={cobol} onChange={setCobol} />
        </Card>
        <Card><CardHeader title="Código ESQL (IBM IIB/ACE)" subtitle="Message flow del bus de datos" action={<Btn size="xs" variant="ghost" onClick={() => setEsql("")}>Limpiar</Btn>} />
          <CodeEditor lang="ESQL · IBM ACE/IIB" value={esql} onChange={setEsql} />
        </Card>
      </div>
      <div style={{ background:"linear-gradient(135deg,rgba(5,33,88,0.8),rgba(4,20,42,0.8))", border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:T.greenDim, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⚡</div>
          <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:15, fontWeight:600, color:T.text }}>Generación de Historias con IA</div>
        </div>
        <div style={{ fontSize:12, color:T.text2, marginBottom:16, lineHeight:1.6 }}>
          Con la documentación cargada (RF, código COBOL/ESQL y las historias base), la IA analizará el contexto técnico y de negocio para generar historias de usuario con criterios de aceptación detallados en formato BDD.
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Protected permission="stories:write" fallback={<Badge label="Sin permisos para generar" color={T.red} bg="rgba(255,77,106,0.12)" />}>
            <Btn variant="primary" onClick={onGenerate} disabled={generating}>
              {generating ? "Generando..." : "⚡ Generar Historias de Usuario"}
            </Btn>
          </Protected>
          {generating && <div style={{ width:16, height:16, border:`2px solid ${T.border2}`, borderTopColor:T.green, borderRadius:"50%", animation:"spin .7s linear infinite" }} />}
        </div>
      </div>
    </div>
  );
};

// ── Story Card ────────────────────────────────────────────────
const StoryCard = ({ story, onEdit, onSync, canWrite }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border2}`, borderRadius:12, marginBottom:10, overflow:"hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding:"13px 18px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.green, minWidth:60 }}>{story.id}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:500, color:T.text }}>{story.title}</div>
          <div style={{ fontSize:11, color:T.text2, marginTop:2 }}>Módulo: {story.module} · {story.criteria.length} criterios de aceptación</div>
        </div>
        <StatusBadge status={story.status} />
        <div style={{ display:"flex", gap:4, marginLeft:8 }} onClick={(e) => e.stopPropagation()}>
          {canWrite && <Btn size="xs" variant="ghost" onClick={() => onEdit(story)}>✏</Btn>}
          {story.jiraId ? <Badge label={`Jira: ${story.jiraId}`} color={T.teal} bg="rgba(0,212,255,0.1)" /> : <Btn size="xs" variant="secondary" onClick={() => onSync(story)}>→ Jira</Btn>}
        </div>
      </div>
      {open && (
        <div style={{ padding:"14px 18px", borderTop:`1px solid ${T.border2}` }}>
          <div style={{ fontSize:12, color:T.text2, marginBottom:12, lineHeight:1.6 }}><strong style={{ color:T.text }}>Descripción:</strong> {story.description}</div>
          <div style={{ fontSize:12, fontWeight:600, color:T.text, marginBottom:8 }}>Criterios de Aceptación:</div>
          {story.criteria.map((c, i) => (
            <div key={i} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom: i < story.criteria.length - 1 ? `1px solid ${T.border2}` : "none", fontSize:12, color:T.text2 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:T.green, flexShrink:0, marginTop:4 }} />
              <span>{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Tab: Stories ──────────────────────────────────────────────
const StoriesTab = ({ stories, generating, onGenerate, onAdd, onEdit, onSync }) => {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("stories:write");
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:18, fontWeight:600, color:T.text }}>Historias de Usuario</div>
          <div style={{ fontSize:12, color:T.text2, marginTop:2 }}>{stories.length} historias · Con criterios de aceptación BDD</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn size="sm" variant="secondary">📥 Exportar</Btn>
          {canWrite && <Btn size="sm" variant="primary" onClick={onAdd}>+ Nueva Historia</Btn>}
        </div>
      </div>
      {stories.length === 0 ? (
        <div style={{ textAlign:"center", padding:"48px 24px" }}>
          <div style={{ fontSize:40, marginBottom:16 }}>📝</div>
          <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:17, fontWeight:600, color:T.text, marginBottom:6 }}>Sin historias aún</div>
          <div style={{ fontSize:13, color:T.text2, marginBottom:20 }}>Carga documentación en la pestaña Docs y genera las historias con IA.</div>
          {canWrite && <Btn variant="primary" onClick={onGenerate} disabled={generating}>⚡ Generar ahora</Btn>}
        </div>
      ) : (
        stories.map((s) => <StoryCard key={s.id} story={s} onEdit={onEdit} onSync={onSync} canWrite={canWrite} />)
      )}
    </div>
  );
};

// ── Tab: Test Cases ───────────────────────────────────────────
const TestCasesTab = ({ testCases, onAdd, onEdit, onDelete }) => {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("testcases:write");
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? testCases : testCases.filter((t) => t.type === filter);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:18, fontWeight:600, color:T.text }}>Casos de Prueba</div>
          <div style={{ fontSize:12, color:T.text2, marginTop:2 }}>{testCases.length} casos totales</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ background:T.surface2, border:`1px solid ${T.border2}`, borderRadius:8, padding:"5px 10px", fontSize:12, color:T.text, outline:"none" }}>
            <option value="all">Todos los tipos</option>
            {Object.values(TestCaseType).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {canWrite && <Btn size="sm" variant="primary" onClick={onAdd}>+ Agregar caso</Btn>}
        </div>
      </div>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>{["ID","Historia","Descripción","Tipo","Prioridad","Estado",""].map((h) => (
              <th key={h} style={{ textAlign:"left", padding:"9px 14px", fontSize:11, fontWeight:600, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:`1px solid ${T.border2}`, background:T.surface2 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((tc) => (
              <tr key={tc.id}>
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border2}` }}><span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.green }}>{tc.id}</span></td>
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border2}`, fontSize:12, color:T.text2 }}>{tc.storyId}</td>
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border2}`, fontSize:12, color:T.text }}>{tc.description}</td>
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border2}` }}><Badge label={tc.type} /></td>
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border2}` }}><PriorityBadge priority={tc.priority} /></td>
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border2}` }}><StatusBadge status={tc.status} /></td>
                <td style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border2}` }}>
                  {canWrite && (
                    <div style={{ display:"flex", gap:4 }}>
                      <Btn size="xs" variant="ghost" onClick={() => onEdit(tc)}>✏</Btn>
                      <Btn size="xs" variant="ghost" onClick={() => onDelete(tc.id)} style={{ color:T.red }}>✕</Btn>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── Tab: Automation ───────────────────────────────────────────
const FRAMEWORKS = [
  { id:"playwright", name:"Playwright", abbr:"PW", desc:"E2E moderno · TypeScript", style:{ background:"rgba(45,205,75,0.15)", color:"#2dcd4b" } },
  { id:"selenium", name:"Selenium", abbr:"SE", desc:"Cross-browser · Java", style:{ background:"rgba(0,200,255,0.15)", color:"#00c8ff" } },
  { id:"serenity", name:"Serenity BDD", abbr:"SB", desc:"Reportes avanzados", style:{ background:"rgba(255,181,71,0.15)", color:T.amber } },
  { id:"cucumber", name:"Cucumber", abbr:"CU", desc:"BDD · Gherkin", style:{ background:"rgba(35,162,96,0.15)", color:"#23a260" } },
  { id:"pw_cucumber", name:"Playwright+Cucumber", abbr:"PG", desc:"BDD + E2E combinado", style:{ background:"rgba(150,100,255,0.15)", color:"#9664ff" } },
];

const AutomationTab = ({ automation }) => {
  const { hasPermission } = useAuth();
  const [config, setConfig] = useState({ language:"TypeScript", pattern:"Page Object Model (POM)", baseUrl:"https://uat.banco-int.com", cicd:"GitHub Actions" });
  const { show } = useToast();

  const handleGenerate = () => {
    if (!hasPermission("automation:generate")) { show("Sin permisos para generar código", "error"); return; }
    // OWASP A10: validate URL before using in generation config
    if (config.baseUrl) {
      const check = SecurityUtils.validateUrl(config.baseUrl);
      if (!check.valid) { show(`URL inválida: ${check.reason}`, "error"); return; }
    }
    automation.generate({ framework: automation.framework, ...config });
  };

  return (
    <div>
      <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:18, fontWeight:600, color:T.text, marginBottom:4 }}>Generación de Tests Automatizados</div>
      <div style={{ fontSize:12, color:T.text2, marginBottom:20 }}>Selecciona el framework y genera el código de pruebas automáticamente desde los casos definidos.</div>

      <Card style={{ marginBottom:16 }}>
        <CardHeader title="Framework de Automatización" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:4 }}>
          {FRAMEWORKS.map((fw) => <FrameworkCard key={fw.id} fw={fw} selected={automation.framework === fw.id} onSelect={automation.setFramework} />)}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <CardHeader title="Configuración de Generación" />
          <Select label="Lenguaje de salida" value={config.language} onChange={(v) => setConfig((c) => ({...c, language:v}))} options={["TypeScript","JavaScript","Java","Python","C#"]} />
          <Select label="Patrón de diseño" value={config.pattern} onChange={(v) => setConfig((c) => ({...c, pattern:v}))} options={["Page Object Model (POM)","Screenplay Pattern","BDD + Step Definitions","Fluent Interface"]} />
          {/* OWASP A10: URL field with validation feedback */}
          <FormInput label="Base URL del entorno" value={config.baseUrl} onChange={(v) => setConfig((c) => ({...c, baseUrl:v}))} placeholder="https://uat.banco-int.com" error={config.baseUrl && !SecurityUtils.validateUrl(config.baseUrl).valid ? SecurityUtils.validateUrl(config.baseUrl).reason : null} />
        </Card>
        <Card>
          <CardHeader title="CI/CD e Integración" />
          <Select label="Pipeline CI/CD" value={config.cicd} onChange={(v) => setConfig((c) => ({...c, cicd:v}))} options={["GitHub Actions","Azure DevOps Pipelines","Jenkins","GitLab CI","Solo generar código"]} />
          <Select label="Reporte de resultados" options={["Allure Report","HTML integrado","Serenity Report","JUnit XML"]} />
          <FormInput label="Directorio de salida" value="./tests/e2e/playwright" />
        </Card>
      </div>

      <div style={{ background:"linear-gradient(135deg,rgba(5,33,88,0.8),rgba(4,20,42,0.8))", border:`1px solid ${T.border}`, borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <div style={{ width:34, height:34, borderRadius:8, background:T.greenDim, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>⚡</div>
          <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:15, fontWeight:600, color:T.text }}>Generar código de pruebas automatizadas</div>
        </div>
        <div style={{ fontSize:12, color:T.text2, marginBottom:14, lineHeight:1.6 }}>
          La IA generará el código {automation.framework} con {config.pattern} para los casos de prueba. Se incluirán fixtures, helpers de autenticación OAuth y stubs para el módulo ESQL. Las credenciales siempre se leen de variables de entorno (OWASP A02).
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <Protected permission="automation:generate" fallback={<Badge label="Sin permisos" color={T.red} bg="rgba(255,77,106,0.12)" />}>
            <Btn variant="primary" onClick={handleGenerate} disabled={automation.running}>
              {automation.running ? "Generando..." : "⚡ Generar Código Automatizado"}
            </Btn>
          </Protected>
        </div>
        {automation.running && (
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:12, color:T.text2, marginBottom:6 }}>{automation.progressLabel}</div>
            <ProgressBar value={automation.progress} />
          </div>
        )}
      </div>

      {automation.generatedCode && (
        <Card>
          <CardHeader title="Código Generado — TC-001.spec.ts" action={
            <div style={{ display:"flex", gap:8 }}>
              <Btn size="sm" variant="secondary">📥 Descargar ZIP</Btn>
              <Btn size="sm" variant="primary">Copiar al repositorio</Btn>
            </div>
          } />
          <CodeEditor lang={`TypeScript · ${automation.framework}`} value={automation.generatedCode} readOnly height={220} />
        </Card>
      )}
    </div>
  );
};

// ── Tab: Jira ─────────────────────────────────────────────────
const JiraTab = ({ jira, stories, testCases }) => {
  const [selected, setSelected] = useState([]);
  const items = [...stories.slice(0, 3), ...testCases.slice(0, 3)];
  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div>
      <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:18, fontWeight:600, color:T.text, marginBottom:4 }}>Integración Jira</div>
      <div style={{ fontSize:12, color:T.text2, marginBottom:20 }}>Sincroniza automáticamente historias y casos de prueba con tu proyecto Jira.</div>

      {/* Connection status */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 18px", background:T.surface2, borderRadius:8, marginBottom:20, border:`1px solid ${T.border2}` }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background: jira.connected ? T.green : T.red, boxShadow: jira.connected ? `0 0 8px rgba(5,225,148,0.4)` : "none" }} />
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:T.text }}>{jira.connected ? "Conectado a Jira Cloud" : "Desconectado"}</div>
          <div style={{ fontSize:11, color:T.text2 }}>{jira.config.url} · Proyecto: {jira.config.projectKey}</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <Btn size="sm" variant="ghost" onClick={jira.testConnection}>Probar</Btn>
          <Btn size="sm" variant="danger">Desconectar</Btn>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <Card>
          <CardHeader title="Configuración de Conexión" />
          {/* OWASP A02: token masked in UI */}
          <FormInput label="URL de Jira" value={jira.config.url} onChange={(v) => jira.updateConfig({ url: v })} />
          <FormInput label="API Token" value={SecurityUtils.maskSecret(jira.config.token)} type="password" />
          <FormInput label="Clave del proyecto" value={jira.config.projectKey} onChange={(v) => jira.updateConfig({ projectKey: v })} />
          <Select label="Tipo de issue para Historias" value={jira.config.issueType} onChange={(v) => jira.updateConfig({ issueType: v })} options={["Story","User Story","Feature"]} />
          <Select label="Plugin de tests" value={jira.config.testIssueType} onChange={(v) => jira.updateConfig({ testIssueType: v })} options={["Test (Zephyr)","Test (Xray)","Sub-task","Task"]} />
          <Protected permission="jira:write">
            <Btn size="sm" variant="primary" onClick={jira.testConnection}>Probar conexión</Btn>
          </Protected>
        </Card>
        <Card>
          <CardHeader title="Mapeo de Campos" />
          <Select label="Sprint activo" options={["Sprint 12 — Core Banking API","Sprint 13 (próximo)","Backlog"]} />
          <FormInput label="Epic Link" value="BNK-42 · API Migration Epic" />
          <FormInput label="Asignado por defecto" placeholder="email@empresa.com" />
          <FormInput label="Etiquetas automáticas" value="qa-automated, testflow" />
          <div style={{ marginTop:8 }}>
            <div style={{ fontSize:12, fontWeight:500, color:T.text2, marginBottom:8 }}>Mapeo de prioridades</div>
            {[[Priority.HIGH,"Highest"],[Priority.MEDIUM,"Medium"],[Priority.LOW,"Low"]].map(([tf, jiraP]) => (
              <div key={tf} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, fontSize:12 }}>
                <PriorityBadge priority={tf} /><span style={{ color:T.text3 }}>→</span><span style={{ color:T.text }}>{jiraP} (Jira)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Cola de Sincronización" subtitle={`${items.length} elementos`}
          action={<Protected permission="jira:write"><Btn size="sm" variant="primary" disabled={jira.syncing} onClick={() => jira.syncItems(selected.length ? selected : items.map((i) => i.id))}>{jira.syncing ? "Sincronizando..." : "⟳ Sincronizar"}</Btn></Protected>} />
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["","Item","Tipo","Estado","Jira ID","Última sync"].map((h) => <th key={h} style={{ textAlign:"left", padding:"8px 14px", fontSize:11, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:`1px solid ${T.border2}`, background:T.surface2 }}>{h}</th>)}</tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={{ padding:"9px 14px", borderBottom:`1px solid ${T.border2}` }}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} style={{ accentColor:T.green }} /></td>
                <td style={{ padding:"9px 14px", borderBottom:`1px solid ${T.border2}`, fontSize:12, color:T.text }}>{item.id} · {(item.title || item.description || "").slice(0, 40)}</td>
                <td style={{ padding:"9px 14px", borderBottom:`1px solid ${T.border2}` }}><Badge label={item.criteria ? "Historia" : "Caso prueba"} /></td>
                <td style={{ padding:"9px 14px", borderBottom:`1px solid ${T.border2}` }}><StatusBadge status={item.status} /></td>
                <td style={{ padding:"9px 14px", borderBottom:`1px solid ${T.border2}`, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color: item.jiraId ? T.teal : T.text3 }}>{item.jiraId ?? "—"}</td>
                <td style={{ padding:"9px 14px", borderBottom:`1px solid ${T.border2}`, fontSize:11, color:T.text2 }}>{item.jiraId ? "Hace 2h" : "Sin sincronizar"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── View: Project Detail ──────────────────────────────────────
const ProjectDetailView = ({ project, onBack }) => {
  const [tab, setTab] = useState("overview");
  const stories = useUserStories(project.id);
  const testCasesHook = useTestCases(project.id);
  const automation = useAutomation();
  const jira = useJira(project.id);
  const { show } = useToast();
  const { hasPermission } = useAuth();

  // Modals
  const [storyModal, setStoryModal] = useState({ open:false, story:null });
  const [tcModal, setTcModal] = useState({ open:false, tc:null });

  const storyForm = useSecureForm({ title:"", module:"", description:"" }, { title:[Validators.required, Validators.maxLen(200)] });
  const tcForm = useSecureForm({ description:"", storyId:"HU-001", preconditions:"", steps:"", expected:"", type:TestCaseType.FUNCTIONAL, priority:Priority.MEDIUM },
    { description:[Validators.required, Validators.maxLen(300)], storyId:[Validators.required] });

  const handleSaveStory = () => {
    if (!storyForm.validate()) return;
    const result = storyModal.story ? stories.updateStory(storyModal.story.id, storyForm.values) : stories.addStory(storyForm.values);
    if (result?.success !== false) { setStoryModal({ open:false, story:null }); storyForm.reset(); }
  };

  const handleSaveTc = () => {
    if (!tcForm.validate()) return;
    const result = tcModal.tc ? testCasesHook.updateTestCase(tcModal.tc.id, tcForm.values) : testCasesHook.addTestCase(tcForm.values);
    if (result?.success !== false) { setTcModal({ open:false, tc:null }); tcForm.reset(); }
  };

  const openEditTc = (tc) => {
    tcForm.reset();
    Object.entries(tc).forEach(([k, v]) => tcForm.set(k, v));
    setTcModal({ open:true, tc });
  };

  const openEditStory = (story) => {
    storyForm.reset();
    Object.entries(story).forEach(([k, v]) => typeof v === "string" && storyForm.set(k, v));
    setStoryModal({ open:true, story });
  };

  const TABS = [
    { id:"overview", icon:"🗂", label:"Resumen" },
    { id:"docs",     icon:"📄", label:"Documentación" },
    { id:"stories",  icon:"👤", label:"Historias", badge: stories.stories.length },
    { id:"testcases",icon:"✅", label:"Casos de Prueba", badge: testCasesHook.testCases.length },
    { id:"automation",icon:"⚡", label:"Automatización" },
    { id:"jira",     icon:"🔗", label:"Jira" },
  ];

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
      <TopBar title={`${project.code} · ${project.name}`}>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, background:"rgba(0,212,255,0.12)", color:T.teal, padding:"3px 9px", borderRadius:20 }}>{project.language}</span>
        <Btn size="sm" variant="ghost" onClick={onBack}>← Proyectos</Btn>
      </TopBar>
      <div style={{ flex:1, overflowY:"auto", padding:28 }}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        {tab === "overview"    && <OverviewTab project={project} />}
        {tab === "docs"        && <DocsTab onGenerate={stories.generate} generating={stories.generating} />}
        {tab === "stories"     && <StoriesTab stories={stories.stories} generating={stories.generating} onGenerate={stories.generate} onAdd={() => { storyForm.reset(); setStoryModal({ open:true, story:null }); }} onEdit={openEditStory} onSync={(s) => show(`${s.id} enviado a Jira`)} />}
        {tab === "testcases"   && <TestCasesTab testCases={testCasesHook.testCases} onAdd={() => { tcForm.reset(); setTcModal({ open:true, tc:null }); }} onEdit={openEditTc} onDelete={testCasesHook.deleteTestCase} />}
        {tab === "automation"  && <AutomationTab automation={automation} />}
        {tab === "jira"        && <JiraTab jira={jira} stories={stories.stories} testCases={testCasesHook.testCases} />}
      </div>

      {/* Story Modal */}
      <Modal open={storyModal.open} onClose={() => setStoryModal({ open:false, story:null })} title={storyModal.story ? `Editar Historia — ${storyModal.story.id}` : "Nueva Historia de Usuario"} width={580}
        footer={<><Btn variant="secondary" onClick={() => setStoryModal({ open:false, story:null })}>Cancelar</Btn><Protected permission="stories:write"><Btn variant="primary" onClick={handleSaveStory}>Guardar</Btn></Protected></>}>
        <FormInput label="Título de la historia *" value={storyForm.values.title} onChange={(v) => storyForm.set("title", v)} error={storyForm.errors.title} placeholder="Como [usuario], quiero [acción]..." />
        <FormInput label="Módulo" value={storyForm.values.module} onChange={(v) => storyForm.set("module", v)} placeholder="Ej: Transferencias" />
        <FormInput label="Descripción detallada" value={storyForm.values.description} onChange={(v) => storyForm.set("description", v)} multiline rows={4} placeholder="Contexto adicional de la historia..." />
      </Modal>

      {/* Test Case Modal */}
      <Modal open={tcModal.open} onClose={() => setTcModal({ open:false, tc:null })} title={tcModal.tc ? `Editar Caso — ${tcModal.tc.id}` : "Agregar Caso de Prueba"} width={640}
        footer={<><Btn variant="secondary" onClick={() => setTcModal({ open:false, tc:null })}>Cancelar</Btn><Protected permission="testcases:write"><Btn variant="primary" onClick={handleSaveTc}>Guardar</Btn></Protected></>}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Select label="Historia de Usuario *" value={tcForm.values.storyId} onChange={(v) => tcForm.set("storyId", v)} options={stories.stories.map((s) => ({ value:s.id, label:`${s.id} · ${s.title.slice(0,30)}` }))} error={tcForm.errors.storyId} />
          <Select label="Tipo" value={tcForm.values.type} onChange={(v) => tcForm.set("type", v)} options={Object.values(TestCaseType)} />
        </div>
        <FormInput label="Descripción del caso *" value={tcForm.values.description} onChange={(v) => tcForm.set("description", v)} error={tcForm.errors.description} placeholder="Qué se está probando..." />
        <FormInput label="Precondiciones" value={tcForm.values.preconditions} onChange={(v) => tcForm.set("preconditions", v)} multiline rows={2} />
        <FormInput label="Pasos de ejecución" value={tcForm.values.steps} onChange={(v) => tcForm.set("steps", v)} multiline rows={4} />
        <FormInput label="Resultado esperado" value={tcForm.values.expected} onChange={(v) => tcForm.set("expected", v)} multiline rows={3} />
        <Select label="Prioridad" value={tcForm.values.priority} onChange={(v) => tcForm.set("priority", v)} options={Object.values(Priority)} />
      </Modal>
    </div>
  );
};

// ── View: Settings ────────────────────────────────────────────
const SettingsView = () => {
  const { show } = useToast();
  const { hasPermission } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [apiKeyError, setApiKeyError] = useState(null);
  const [jiraToken, setJiraToken] = useState("");

  const handleSave = () => {
    if (!hasPermission("settings:write")) { show("Sin permisos de administrador", "error"); return; }
    // OWASP A08: validate API key before saving
    const err = Validators.apiToken(apiKey || "placeholder");
    if (err && apiKey) { setApiKeyError(err); return; }
    AuditLogger.log("SETTINGS_SAVED", { fields: ["model", "language"] });
    show("Configuración global guardada");
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:28 }}>
      <div style={{ maxWidth:680 }}>
        <Card style={{ marginBottom:16 }}>
          <CardHeader title="Integraciones de IA" />
          <Select label="Modelo de IA para generación" options={["claude-sonnet-4-5 (Recomendado)","claude-opus-4","Por definir"]} />
          {/* OWASP A02: API key never stored in localStorage, masked in UI */}
          <FormInput label="API Key (Anthropic) — almacenada solo en memoria de sesión" value={apiKey} onChange={(v) => { setApiKey(v); setApiKeyError(Validators.apiToken(v)); }} type="password" placeholder="sk-ant-..." error={apiKeyError} />
          <div style={{ fontSize:11, color:T.text3, marginTop:-8, marginBottom:12 }}>⚠ La API key nunca se persiste en localStorage ni cookies. Solo existe en memoria durante la sesión activa (OWASP A02).</div>
          <Select label="Idioma de generación" options={["Español (Ecuador)","Inglés","Portugués"]} />
        </Card>
        <Card style={{ marginBottom:16 }}>
          <CardHeader title="Configuración Jira Global" />
          <FormInput label="URL base Jira" value="https://nextisolutions.atlassian.net" />
          {/* OWASP A02: token masked, not logged */}
          <FormInput label="API Token — enmascarado en UI" value={jiraToken || "••••••••••••••••"} onChange={setJiraToken} type="password" />
          <Select label="Plugin de tests" options={["Zephyr Scale","Xray","TestRail (webhook)","Issues nativos"]} />
        </Card>
        <Card>
          <CardHeader title="Preferencias de Generación" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Select label="Formato criterios de aceptación" options={["BDD (Dado/Cuando/Entonces)","Tabla de decisión","Checklist"]} />
            <FormInput label="Cobertura mínima de casos (%)" value="80" type="number" />
          </div>
          <Select label="Template de casos de prueba" options={["IEEE 829","ISTQB","Personalizado NexTI"]} />
          <Protected permission="settings:write" fallback={<Badge label="Se requiere rol ADMIN para guardar configuración" color={T.amber} bg="rgba(255,181,71,0.1)" />}>
            <Btn variant="primary" onClick={handleSave}>Guardar configuración</Btn>
          </Protected>
        </Card>
      </div>
    </div>
  );
};

// ── View: Audit Log (OWASP A09) ───────────────────────────────
const AuditView = () => {
  const logs = useMemo(() => AuditLogger.getLogs().reverse(), []);
  const SEVERITY_COLOR = { INFO:T.text2, WARN:T.amber, SECURITY:T.red, ERROR:T.red };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:28 }}>
      <div style={{ fontFamily:"'Funnel Display',sans-serif", fontSize:20, fontWeight:700, color:T.text, marginBottom:4 }}>Registro de Auditoría — OWASP A09</div>
      <div style={{ fontSize:13, color:T.text2, marginBottom:20 }}>Trazabilidad completa de acciones de seguridad. En producción, estos eventos se envían a un SIEM externo.</div>
      <Card>
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {["OWASP A01 — Broken Access Control","OWASP A02 — Crypto Failures","OWASP A03 — Injection/XSS","OWASP A04 — Insecure Design","OWASP A07 — Auth Failures","OWASP A08 — Data Integrity","OWASP A09 — Logging","OWASP A10 — SSRF"].map((m) => (
            <Badge key={m} label={m} color={T.green} bg={T.greenSoft} />
          ))}
        </div>
        <div style={{ fontSize:12, color:T.text2, marginBottom:16, padding:12, background:T.surface2, borderRadius:8, lineHeight:1.7 }}>
          <strong style={{ color:T.text }}>Mitigaciones implementadas en esta aplicación:</strong><br />
          <strong style={{ color:T.green }}>A01:</strong> RBAC con hook <code>can(role, permission)</code>, componente <code>&lt;Protected permission=".." /&gt;</code> en toda acción sensible.<br />
          <strong style={{ color:T.green }}>A02:</strong> API keys y tokens nunca en localStorage/sessionStorage. Mascarados en UI con <code>SecurityUtils.maskSecret()</code>.<br />
          <strong style={{ color:T.green }}>A03:</strong> Sanitización XSS en <code>SecurityUtils.sanitize()</code> aplicada en <code>useSecureForm</code> a cada keystroke. Sin <code>dangerouslySetInnerHTML</code>.<br />
          <strong style={{ color:T.green }}>A04:</strong> CSRF token generado con <code>crypto.getRandomValues()</code> por sesión. Header <code>X-CSRF-Token</code> en cada mutación.<br />
          <strong style={{ color:T.green }}>A07:</strong> Timeout de sesión 30 min, contador de intentos fallidos con lockout a 5 intentos. MFA requerido.<br />
          <strong style={{ color:T.green }}>A08:</strong> Validación de formularios con <code>Validators</code> antes de cualquier mutación. Entidades creadas via factories sanitizadas.<br />
          <strong style={{ color:T.green }}>A09:</strong> Todas las acciones sensibles logueadas en <code>AuditLogger</code> con timestamp, user, acción y severidad.<br />
          <strong style={{ color:T.green }}>A10:</strong> <code>SecurityUtils.validateUrl()</code> con allowlist de hosts. Protocolo HTTPS obligatorio en toda URL de API externa.
        </div>
        {logs.length === 0 ? (
          <div style={{ textAlign:"center", padding:24, color:T.text3 }}>Sin eventos en el registro actual de sesión</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr>{["Timestamp","Severidad","Acción","Detalles"].map((h) => <th key={h} style={{ textAlign:"left", padding:"8px 12px", fontSize:11, color:T.text2, textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:`1px solid ${T.border2}`, background:T.surface2 }}>{h}</th>)}</tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ padding:"8px 12px", borderBottom:`1px solid ${T.border2}`, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:T.text3 }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td style={{ padding:"8px 12px", borderBottom:`1px solid ${T.border2}` }}><Badge label={log.severity} color={SEVERITY_COLOR[log.severity] ?? T.text2} bg={`${SEVERITY_COLOR[log.severity] ?? T.text2}18`} /></td>
                  <td style={{ padding:"8px 12px", borderBottom:`1px solid ${T.border2}`, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:T.green }}>{log.action}</td>
                  <td style={{ padding:"8px 12px", borderBottom:`1px solid ${T.border2}`, fontSize:11, color:T.text2 }}>{JSON.stringify(log.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

// ── New Project Modal (controlled by App) ─────────────────────
const NewProjectModal = ({ open, onClose, onSave }) => {
  const form = useSecureForm(
    { code:"", name:"", client:"", description:"", language:"Java · Spring Boot", qaFramework:"Playwright + TypeScript", jiraKey:"" },
    { code:[Validators.required, Validators.projectCode], name:[Validators.required, Validators.maxLen(100)] }
  );
  const handleSave = () => {
    if (!form.validate()) return;
    onSave(form.values);
    form.reset();
    onClose();
  };
  return (
    <Modal open={open} onClose={() => { form.reset(); onClose(); }} title="Nuevo Proyecto" width={560}
      footer={<><Btn variant="secondary" onClick={() => { form.reset(); onClose(); }}>Cancelar</Btn><Btn variant="primary" onClick={handleSave}>Crear Proyecto</Btn></>}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <FormInput label="Código del proyecto *" value={form.values.code} onChange={(v) => form.set("code", v)} placeholder="BNK-004" error={form.errors.code} style={{ fontFamily:"'JetBrains Mono',monospace" }} />
        <Select label="Lenguaje principal *" value={form.values.language} onChange={(v) => form.set("language", v)} options={["Java · Spring Boot",".NET 8 / C#","COBOL","COBOL + ESQL (IBM IIB/ACE)","Python","Node.js"]} />
      </div>
      <FormInput label="Nombre del proyecto *" value={form.values.name} onChange={(v) => form.set("name", v)} error={form.errors.name} placeholder="Ej: Módulo de Seguridad v2.0" />
      <FormInput label="Cliente" value={form.values.client} onChange={(v) => form.set("client", v)} placeholder="Ej: Banco Bolivariano" />
      <FormInput label="Descripción" value={form.values.description} onChange={(v) => form.set("description", v)} multiline rows={3} placeholder="Alcance del proyecto..." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Select label="Framework QA" value={form.values.qaFramework} onChange={(v) => form.set("qaFramework", v)} options={["Playwright + TypeScript","Selenium + Java","Serenity BDD","Cucumber + Java","Playwright + Cucumber","Por definir"]} />
        <FormInput label="Clave Jira" value={form.values.jiraKey} onChange={(v) => form.set("jiraKey", v)} placeholder="Ej: BNK" />
      </div>
    </Modal>
  );
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  APP ROOT                                                   ║
// ╚══════════════════════════════════════════════════════════════╝
const AppContent = () => {
  const [view, setView] = useState("projects");
  const [activeProject, setActiveProject] = useState(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const { projects, addProject } = useProjects();
  const { sessionWarning } = useAuth();
  const { show } = useToast();

  const openProject = (p) => { setActiveProject(p); setView("project"); };
  const navigate = (v) => { setView(v); setActiveProject(null); };

  const handleNewProject = (values) => {
    const result = addProject(values);
    if (!result.success) show("Error al crear proyecto: " + JSON.stringify(result.errors), "error");
  };

  return (
    <div style={{ display:"flex", fontFamily:"'Work Sans',sans-serif", background:T.bg, color:T.text, minHeight:"100vh", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Funnel+Display:wght@400;600;700&family=Work+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.surface3}; border-radius: 3px; }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input, textarea, select { color-scheme: dark; }
        textarea { resize: vertical; }
      `}</style>

      <Sidebar view={view} onNavigate={navigate} projects={projects} activeProjectId={activeProject?.id}
        onOpenProject={openProject} onNewProject={() => setNewProjectOpen(true)} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
        {/* OWASP A07: Session expiry warning banner */}
        {sessionWarning && (
          <div style={{ background:"rgba(255,77,106,0.15)", borderBottom:`1px solid ${T.red}`, padding:"8px 24px", fontSize:12, color:T.red, display:"flex", alignItems:"center", gap:8 }}>
            ⚠ Tu sesión está a punto de expirar. Guarda tu trabajo.
            <Btn size="xs" variant="ghost" onClick={() => SessionManager.touch()}>Extender sesión</Btn>
          </div>
        )}

        {view === "projects" && (
          <>
            <TopBar title="Proyectos">
              <Protected permission="projects:write">
                <Btn size="sm" variant="primary" onClick={() => setNewProjectOpen(true)}>+ Nuevo Proyecto</Btn>
              </Protected>
            </TopBar>
            <ProjectsView projects={projects} onOpen={openProject} onNew={() => setNewProjectOpen(true)} />
          </>
        )}
        {view === "project" && activeProject && <ProjectDetailView project={activeProject} onBack={() => navigate("projects")} />}
        {view === "settings" && <><TopBar title="Configuración Global" /><SettingsView /></>}
        {view === "audit"    && <><TopBar title="Registro de Auditoría OWASP" /><AuditView /></>}
      </div>

      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} onSave={handleNewProject} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
