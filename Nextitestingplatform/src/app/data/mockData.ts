import type { ApiResource } from '../types/generation';
import type { ProjectFrameworkCategoryPersisted } from '../lib/projectFrameworkArchetypeSelection';

export type ProjectStatus = 'Activo' | 'Planificación' | 'Completado' | 'En Espera' | 'En Riesgo';

export interface NomenclatureConfig {
  testCaseFormat: string;
  scriptFormat: string;
  apiFormat: string;
  manualTestFormat: string;
  performanceFormat: string;
  e2eFormat: string;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  startDate: string;
  endDate: string;
  realStartDate?: string;
  realEndDate?: string;
  /** Mock/demo; UI desactivada hasta integración con backend. */
  components: number;
  /** 0–100; dato mock/demo. La UI de barra de progreso está desactivada hasta que exista cálculo real. */
  progress: number;
  status: ProjectStatus;
  description: string;
  nomenclature?: NomenclatureConfig;
  /** API resources (multiple) for generation context. */
  apiResources?: ApiResource[];
  /** Persisted dropdown picks for API/Web/Performance frameworks. */
  frameworkSelection?: ProjectFrameworkCategoryPersisted;
  /** Jira project sync settings used by stories sync flow. */
  jiraConfig?: {
    baseUrl: string;
    projectKey: string;
    storyIssueType: string;
    defaultLabels?: string[];
    jiraUserEmail?: string;
    credentialId?: number;
  };
  /** Orchestrator project id (cuid) for embedded app-generation tab. */
  sddProjectId?: string;
}

export interface AIRole {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

/** Catálogo global de lenguajes para scripts en Análisis Funcional (sincronizado con administración). */
export interface ProgrammingLanguage {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface AcceptanceCriterion {
  id: string;
  text: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Rediseño Plataforma E-Commerce',
    owner: 'Sarah Johnson',
    startDate: '2026-01-15',
    endDate: '2026-06-30',
    realStartDate: '2026-01-20',
    components: 24,
    progress: 65,
    status: 'Activo',
    description: 'Rediseño completo de la plataforma de comercio electrónico con un enfoque de pruebas dirigido por BDD. Cubre autenticación de usuarios, catálogo de productos, carrito de compras, flujos de pago y checkout.',
    nomenclature: {
      testCaseFormat: '[PROJECT]-TC-[NUM]',
      scriptFormat: '[PROJECT]-SC-[FRAMEWORK]-[NUM]',
      apiFormat: '[PROJECT]-API-[NUM]',
      manualTestFormat: '[PROJECT]-MT-[NUM]',
      performanceFormat: '[PROJECT]-PERF-[NUM]',
      e2eFormat: '[PROJECT]-E2E-[NUM]',
    },
  },
  {
    id: '2',
    name: 'Modernización Core Bancario',
    owner: 'Michael Torres',
    startDate: '2026-02-01',
    endDate: '2026-12-31',
    realStartDate: '2026-02-05',
    components: 48,
    progress: 28,
    status: 'Activo',
    description: 'Modernización del sistema bancario central que incluye gestión de cuentas, procesamiento de transacciones y pruebas de cumplimiento regulatorio con integración de sistemas legados COBOL.',
    nomenclature: {
      testCaseFormat: '[PROJECT]-TC-[NUM]',
      scriptFormat: '[PROJECT]-SC-[FRAMEWORK]-[NUM]',
      apiFormat: '[PROJECT]-API-[NUM]',
      manualTestFormat: '[PROJECT]-MT-[NUM]',
      performanceFormat: '[PROJECT]-PERF-[NUM]',
      e2eFormat: '[PROJECT]-E2E-[NUM]',
    },
  },
  {
    id: '3',
    name: 'Portal de Reclamaciones de Seguros',
    owner: 'Amanda Lee',
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    realStartDate: '2025-10-01',
    realEndDate: '2026-04-05',
    components: 16,
    progress: 100,
    status: 'Completado',
    description: 'Suite de pruebas de extremo a extremo para el portal de procesamiento de reclamaciones de seguros, incluyendo flujos de envío, verificación, aprobación y detección de fraude.',
  },
  {
    id: '4',
    name: 'Plataforma de Autoservicio RRHH',
    owner: 'David Park',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    components: 20,
    progress: 5,
    status: 'Planificación',
    description: 'Generación de escenarios BDD para la nueva plataforma de autoservicio de RRHH, cubriendo incorporación de empleados, gestión de vacaciones, integración de nómina y evaluaciones de desempeño.',
  },
  {
    id: '5',
    name: 'Gateway API Cadena de Suministro',
    owner: 'Elena Vasquez',
    startDate: '2026-01-10',
    endDate: '2026-04-30',
    realStartDate: '2026-01-15',
    components: 32,
    progress: 42,
    status: 'En Riesgo',
    description: 'Pruebas del gateway API para integraciones de cadena de suministro, incluyendo gestión de inventario, procesamiento de órdenes y conexiones con proveedores logísticos.',
  },
  {
    id: '6',
    name: 'Plataforma de Datos de Clientes',
    owner: 'James Chen',
    startDate: '2026-02-15',
    endDate: '2026-07-15',
    components: 28,
    progress: 0,
    status: 'En Espera',
    description: 'Pruebas de la plataforma de datos que cubren pipelines de ingesta, segmentación, canales de activación y validación de cumplimiento con normativas de protección de datos.',
  },
];

export const mockRoles: AIRole[] = [
  {
    id: '1',
    name: 'Experto COBOL',
    description: 'Amplia experiencia en sistemas COBOL y arquitectura mainframe. Especializado en pruebas de sistemas legados, escenarios de procesamiento por lotes y análisis de transacciones CICS.',
    createdAt: '2026-01-10',
  },
  {
    id: '2',
    name: 'Ingeniero QA',
    description: 'Especialista en aseguramiento de calidad full-stack con experiencia en diseño de estrategias de prueba, pruebas basadas en riesgo e implementación de metodología BDD.',
    createdAt: '2026-01-10',
  },
  {
    id: '3',
    name: 'Especialista UX',
    description: 'Experto en pruebas de experiencia de usuario y accesibilidad. Se enfoca en escenarios de usabilidad, cumplimiento WCAG y validación del recorrido del usuario final.',
    createdAt: '2026-01-15',
  },
  {
    id: '4',
    name: 'Analista de Seguridad',
    description: 'Experto en evaluación de vulnerabilidades de seguridad y pruebas de penetración. Genera escenarios BDD orientados a seguridad cubriendo el OWASP Top 10 y requisitos de cumplimiento.',
    createdAt: '2026-01-20',
  },
  {
    id: '5',
    name: 'Ingeniero de Rendimiento',
    description: 'Especialista en pruebas de carga, estrés y rendimiento. Crea escenarios orientados al rendimiento con validación de SLA e identificación de cuellos de botella.',
    createdAt: '2026-02-01',
  },
];

export const mockProgrammingLanguages: ProgrammingLanguage[] = [
  {
    id: 'pl1',
    name: 'TypeScript',
    description: 'Lenguaje tipado sobre JavaScript; habitual en frontends y Node para pruebas con Playwright o similares.',
    createdAt: '2026-01-10',
  },
  {
    id: 'pl2',
    name: 'Java',
    description: 'Ecosistema empresarial, JUnit, Cucumber JVM y herramientas de integración continua.',
    createdAt: '2026-01-10',
  },
  {
    id: 'pl3',
    name: 'ESQL',
    description: 'SQL embebido en flujos de integración (p. ej. IBM Integration Bus / ACE) para validar transformaciones.',
    createdAt: '2026-01-10',
  },
  {
    id: 'pl4',
    name: 'Python',
    description: 'Automatización, pytest, Behave y scripts de prueba rápidos.',
    createdAt: '2026-01-10',
  },
  {
    id: 'pl5',
    name: 'COBOL',
    description: 'Sistemas legados y mainframe; escenarios BDD alineados a lotes y CICS.',
    createdAt: '2026-01-10',
  },
  {
    id: 'pl6',
    name: 'C#',
    description: '.NET, SpecFlow y pruebas de APIs y UI en entornos Microsoft.',
    createdAt: '2026-01-10',
  },
  {
    id: 'pl7',
    name: 'Ruby',
    description: 'Cucumber clásico, RSpec y automatización web.',
    createdAt: '2026-01-10',
  },
  {
    id: 'pl8',
    name: 'Go',
    description: 'Pruebas de contratos, microservicios y herramientas CLI de testing.',
    createdAt: '2026-01-10',
  },
];

export const MOCK_BDD_OUTPUT = {
  scenarios: `Feature: User Authentication and Session Management

  Scenario: TC-001 - Successful login with valid credentials
    Given the user is on the login page "/auth/login"
    When the user enters valid email "user@example.com"
    And the user enters valid password "ValidPass@123!"
    And the user clicks the "Sign In" button
    Then the user should be redirected to "/app/dashboard"
    And a success toast "Welcome back, John!" should be displayed
    And the JWT token should be stored in an HTTP-only cookie
    And the session should expire after 8 hours of inactivity

  Scenario: TC-002 - Login attempt with invalid password
    Given the user is on the login page "/auth/login"
    When the user enters valid email "user@example.com"
    And the user enters invalid password "wrongpass"
    And the user clicks the "Sign In" button
    Then an error message "Invalid email or password" should be displayed
    And the user should remain on the login page "/auth/login"
    And the failed attempts counter should increment by 1
    And no session token should be created

  Scenario: TC-003 - Account lockout after maximum failed attempts
    Given the user has already failed login 4 consecutive times
    When the user makes the 5th attempt with invalid credentials
    Then the account should be temporarily locked for 15 minutes
    And an error "Account temporarily locked. Try again in 15 minutes." should appear
    And a security notification email should be sent to the account owner
    And the event should be logged in the security audit trail

  Scenario: TC-004 - Password reset via email
    Given the user is on the login page "/auth/login"
    When the user clicks the "Forgot Password?" link
    And the user enters registered email "user@example.com"
    And the user clicks "Send Reset Link"
    Then a confirmation message should be displayed
    And a password reset email should arrive within 2 minutes
    And the reset link should be valid for 30 minutes
    And using the link after expiry should show an error`,

  ambiguities: [
    {
      id: '1',
      text: 'The requirement does not define the maximum number of consecutive failed login attempts before lockout. Assumed 5 based on industry standard — please confirm.',
    },
    {
      id: '2',
      text: 'Session expiration time is not specified. TC-001 assumes 8 hours of inactivity; business may require different values for different user roles.',
    },
    {
      id: '3',
      text: 'The acceptance criteria for "notification email" does not define the email template, sender address, or required content. TC-003 uses a generic description.',
    },
    {
      id: '4',
      text: 'It is unclear whether "remember me" functionality should affect session duration. No scenario was generated for this case — clarification needed.',
    },
  ],

  coverage: {
    happy_path: 1,
    validation: 2,
    negative: 3,
    boundary: 1,
    permissions: 0,
    state_transition: 2,
    total: 9,
    percentage: 72,
  },
};