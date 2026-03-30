import type {
  BDDCoverageSummary,
  BDDGeneratePayload,
  BDDGenerateResponse,
  CodeContextItem,
} from '../types/generation';

const WEBHOOK_URL = (import.meta as unknown as { env?: { VITE_N8N_WEBHOOK_URL?: string } })
  .env?.VITE_N8N_WEBHOOK_URL;
const FAILED_FETCH_HINT = [
  'Use production URL in .env: https://n8n.nextisolutions.com/webhook/test-case-generation',
  'Scripts flow URL in .env: https://n8n.nextisolutions.com/webhook/bdd-to-tests',
  'In n8n: activate the workflow (toggle On) so the webhook listens for requests.',
  'If using webhook-test: in n8n click "Listen for test event" on Webhook node.',
  'If using localhost, ensure n8n allows CORS for your app origin.',
].join('\n');

// ─── Payload ──────────────────────────────────────────────────────────────────

export type BDDCodeContext = CodeContextItem;
export type BDDGenerationPayload = BDDGeneratePayload;

// ─── Response ─────────────────────────────────────────────────────────────────

export type BDDGenerationResponse = BDDGenerateResponse;

// ─── Error ────────────────────────────────────────────────────────────────────

export class BDDServiceError extends Error {
  constructor(
    message: string,
    public readonly isOffline: boolean = false,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'BDDServiceError';
  }
}

// ─── Demo / Mock data (TransformCustomer.esql — respuesta real de N8N) ────────

export const DEMO_FORM_DATA = {
  featureId: 'ESQL-TRANS-001',
  requirementTitle: 'Transformación de mensajes JSON para clientes en ESQL',
  requirementText: `Como sistema de integración,
Necesito transformar mensajes JSON de clientes recibidos en InputRoot
Para generar una salida estructurada en OutputRoot con los campos clientId, fullName y contact.email.`,
  codeFiles: [
    {
      fileName: 'TransformCustomer.esql',
      language: 'plaintext',
      content: `CREATE COMPUTE MODULE TransformCustomer

    CREATE FUNCTION Main() RETURNS BOOLEAN
    BEGIN
        CALL CopyMessageHeaders();
        CREATE LASTCHILD OF OutputRoot DOMAIN('JSON');
        SET OutputRoot.JSON.Data.clientId = InputRoot.JSON.Data.customer.id;
        SET OutputRoot.JSON.Data.fullName = InputRoot.JSON.Data.customer.name;
        SET OutputRoot.JSON.Data.contact.email = InputRoot.JSON.Data.customer.email;
        RETURN TRUE;
    END;

    CREATE PROCEDURE CopyMessageHeaders() BEGIN
        DECLARE I INTEGER 1;
        DECLARE J INTEGER CARDINALITY(InputRoot.*[]);
        WHILE I < J DO
            SET OutputRoot.*[I] = InputRoot.*[I];
            SET I = I + 1;
        END WHILE;
    END;

END MODULE;`,
    },
  ] satisfies BDDCodeContext[],
};

export const DEMO_BDD_RESPONSE: BDDGenerationResponse = {
  requirement_id: 'unknown',
  feature_title: 'Transformación de mensajes JSON para clientes en ESQL',
  gherkin: `Funcionalidad: Transformación de mensajes JSON para clientes en ESQL

  Antecedentes:
    Dado Existe un flujo en ESQL que transforma mensajes JSON de clientes para una salida específica.
    Y El módulo copia los encabezados del mensaje original y luego transforma campos seleccionados del JSON.

  Escenario: Transformación correcta de un mensaje JSON de cliente válido
    Dado Un mensaje JSON de entrada con datos de cliente válidos que incluyen id, name y email
    Cuando Se ejecuta la función Main() del módulo TransformCustomer
    Entonces Se copian correctamente los encabezados del mensaje de entrada al mensaje de salida
    Y El mensaje de salida JSON contiene Data.clientId igual al valor de customer.id de entrada
    Y El mensaje de salida JSON contiene Data.fullName igual al valor de customer.name de entrada
    Y El mensaje de salida JSON contiene Data.contact.email igual al valor de customer.email de entrada

  Escenario: Manejo de ausencia del campo customer en el JSON de entrada
    Dado Un mensaje JSON de entrada que no tiene el nodo customer en Data
    Cuando Se ejecuta la función Main() del módulo TransformCustomer
    Entonces El proceso debería manejar la ausencia sin generar error o debería documentarse la falla
    Y Los campos de salida Data.clientId, Data.fullName y Data.contact.email no deberían asignarse o deberían quedar vacíos

  Escenario: Copiado correcto y completo de todos los encabezados del mensaje original
    Dado Un mensaje con múltiples encabezados en InputRoot de cualquier dominio
    Cuando Se ejecuta el procedimiento CopyMessageHeaders
    Entonces Todos los encabezados presentes en InputRoot se copian al OutputRoot sin omisiones
    Y No se sobrescriben ni se pierden encabezados durante el copiado

  Escenario: Transformación con valores nulos o vacíos en campos customer.id, customer.name y customer.email
    Dado Un mensaje JSON de entrada donde los campos customer.id, customer.name o customer.email están nulos o vacíos
    Cuando Se ejecuta la función Main() del módulo TransformCustomer
    Entonces Se asignan dichos valores nulos o vacíos a los campos correspondientes de salida sin errores
    Y El flujo no debería fallar por la presencia de valores nulos o vacíos en esos campos

  Escenario: Retorno exitoso de la función Main tras la transformación
    Dado Un mensaje JSON de entrada con todos los datos necesarios
    Cuando Se ejecuta la función Main()
    Entonces La función retorna TRUE indicando éxito en la transformación`,
  scenarios: [
    {
      name: 'Transformación correcta de un mensaje JSON de cliente válido',
      source: ['code'],
      type: 'happy_path',
      given: ['Un mensaje JSON de entrada con datos de cliente válidos que incluyen id, name y email'],
      when: ['Se ejecuta la función Main() del módulo TransformCustomer'],
      then: [
        'Se copian correctamente los encabezados del mensaje de entrada al mensaje de salida',
        'El mensaje de salida JSON contiene Data.clientId igual al valor de customer.id de entrada',
        'El mensaje de salida JSON contiene Data.fullName igual al valor de customer.name de entrada',
        'El mensaje de salida JSON contiene Data.contact.email igual al valor de customer.email de entrada',
      ],
      requirement_refs: [],
      code_refs: ['TransformCustomer.esql - función Main', 'TransformCustomer.esql - procedimiento CopyMessageHeaders'],
      examples: [],
    },
    {
      name: 'Manejo de ausencia del campo customer en el JSON de entrada',
      source: ['code'],
      type: 'negative',
      given: ['Un mensaje JSON de entrada que no tiene el nodo customer en Data'],
      when: ['Se ejecuta la función Main() del módulo TransformCustomer'],
      then: [
        'El proceso debería manejar la ausencia sin generar error o debería documentarse la falla',
        'Los campos de salida Data.clientId, Data.fullName y Data.contact.email no deberían asignarse o deberían quedar vacíos',
      ],
      requirement_refs: [],
      code_refs: ['TransformCustomer.esql - función Main'],
      examples: [],
    },
    {
      name: 'Copiado correcto y completo de todos los encabezados del mensaje original',
      source: ['code'],
      type: 'boundary',
      given: ['Un mensaje con múltiples encabezados en InputRoot de cualquier dominio'],
      when: ['Se ejecuta el procedimiento CopyMessageHeaders'],
      then: [
        'Todos los encabezados presentes en InputRoot se copian al OutputRoot sin omisiones',
        'No se sobrescriben ni se pierden encabezados durante el copiado',
      ],
      requirement_refs: [],
      code_refs: ['TransformCustomer.esql - procedimiento CopyMessageHeaders'],
      examples: [],
    },
    {
      name: 'Transformación con valores nulos o vacíos en campos customer.id, customer.name y customer.email',
      source: ['code'],
      type: 'validation',
      given: ['Un mensaje JSON de entrada donde los campos customer.id, customer.name o customer.email están nulos o vacíos'],
      when: ['Se ejecuta la función Main() del módulo TransformCustomer'],
      then: [
        'Se asignan dichos valores nulos o vacíos a los campos correspondientes de salida sin errores',
        'El flujo no debería fallar por la presencia de valores nulos o vacíos en esos campos',
      ],
      requirement_refs: [],
      code_refs: ['TransformCustomer.esql - función Main'],
      examples: [],
    },
    {
      name: 'Retorno exitoso de la función Main tras la transformación',
      source: ['code'],
      type: 'happy_path',
      given: ['Un mensaje JSON de entrada con todos los datos necesarios'],
      when: ['Se ejecuta la función Main()'],
      then: ['La función retorna TRUE indicando éxito en la transformación'],
      requirement_refs: [],
      code_refs: ['TransformCustomer.esql - función Main'],
      examples: [],
    },
  ],
  mismatches: [
    'No existe manejo explícito en el código para escenarios donde el nodo customer no está presente en el JSON de entrada.',
    'No se valida la presencia ni el formato de datos en customer.id, customer.name o customer.email, lo cual podría causar problemas downstream.',
  ],
  ambiguities: [
    'No está claro qué ocurre si InputRoot no contiene nodos o encabezados para copiar; el procedimiento CopyMessageHeaders podría no copiar nada sin notificar.',
    'No se especifica si la función Main debe manejar errores de estructura JSON u otros fallos de parsing.',
    'No hay indicación sobre la validación o transformación adicional de los campos de email o nombre.',
  ],
  coverage_summary: {
    happy_path: 2,
    validation: 1,
    negative: 1,
    boundary: 1,
    permission: 0,
    state_transition: 0,
  },
  raw_structured_output: {
    requirement_id: 'unknown',
    feature_title: 'Transformación de mensajes JSON para clientes en ESQL',
    background: [
      'Existe un flujo en ESQL que transforma mensajes JSON de clientes para una salida específica.',
      'El módulo copia los encabezados del mensaje original y luego transforma campos seleccionados del JSON.',
    ],
    scenarios: [],
    mismatches: [],
    ambiguities: [],
    coverage_summary: {
      happy_path: 2,
      validation: 1,
      negative: 1,
      boundary: 1,
      permission: 0,
      state_transition: 0,
    },
  },
};

// ─── Service ──────────────────────────────────────────────────────────────────

export async function generateBDD(
  payload: BDDGenerationPayload,
  timeoutMs = 90_000,
): Promise<BDDGenerationResponse> {
  if (!WEBHOOK_URL?.trim()) {
    throw new BDDServiceError(
      'VITE_N8N_WEBHOOK_URL is not set. Add it to your .env file.',
      false,
    );
  }

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new BDDServiceError(
        `El servidor N8N respondió con estado ${response.status}. Verifique el webhook.`,
        false,
        response.status,
      );
    }

    const data = await response.json();
    return data as BDDGenerationResponse;
  } catch (err) {
    if (err instanceof BDDServiceError) throw err;

    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    if (isAbort) {
      throw new BDDServiceError(
        'La solicitud superó el tiempo límite (90s). Verifique que el workflow de N8N esté activo.',
        true,
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    if (
      message === 'Failed to fetch' ||
      message.includes('NetworkError') ||
      message.includes('Load failed')
    ) {
      throw new BDDServiceError(
        `Network error (could not reach n8n).\n\n${FAILED_FETCH_HINT}`,
        true,
      );
    }

    throw new BDDServiceError(message, true);
  } finally {
    clearTimeout(timerId);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Detect language from file extension for the codeContext payload */
export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'TypeScript', tsx: 'TypeScript',
    js: 'JavaScript', jsx: 'JavaScript',
    java: 'Java',
    py: 'Python',
    cs: 'C#',
    rb: 'Ruby',
    go: 'Go',
    cob: 'COBOL', cbl: 'COBOL',
    esql: 'plaintext',
    sql: 'SQL',
    xml: 'XML',
    json: 'JSON',
    md: 'Markdown',
    txt: 'plaintext',
  };
  return map[ext] ?? 'plaintext';
}

/** Read a File object as text (returns a Promise) */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`No se pudo leer el archivo: ${file.name}`));
    reader.readAsText(file);
  });
}

/** Calculate total scenarios from a coverage summary */
export function coverageTotal(summary: BDDCoverageSummary): number {
  return Object.values(summary).reduce((a, b) => a + b, 0);
}
