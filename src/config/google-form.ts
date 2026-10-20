import {
  PREGUNTAS,
  type PreguntaId,
  type RespuestaEncuesta,
} from "@/types/survey";

type CampoGoogle =
  | "nombresApellidos"
  | "sexo"
  | "edad"
  | "residePeru"
  | "gradoInstruccion"
  | "experiencia"
  | "ambito"
  | PreguntaId;

/* =========================================================
   CAMPOS GENERALES DEL GOOGLE FORM
========================================================= */

const CAMPOS_GENERALES_ENTRY_IDS = {
  nombresApellidos: "entry.1730289034",
  sexo: "entry.680386060",
  edad: "entry.477590649",
  residePeru: "entry.836159993",
  gradoInstruccion: "entry.430151187",
  experiencia: "entry.1857536346",
  ambito: "entry.928851152",
} as const;

/* =========================================================
   18 PREGUNTAS LIKERT

   IMPORTANTE:
   El orden debe coincidir exactamente con PREGUNTAS
   definido en "@/types/survey".
========================================================= */

const PREGUNTAS_ENTRY_IDS = [
  "entry.1000001",     // Pregunta 1
  "entry.460937884",   // Pregunta 2
  "entry.1794812308",  // Pregunta 3
  "entry.2112848501",  // Pregunta 4
  "entry.2078742008",  // Pregunta 5
  "entry.1103286784",  // Pregunta 6
  "entry.796804731",   // Pregunta 7
  "entry.1123194790",  // Pregunta 8
  "entry.1501805673",  // Pregunta 9
  "entry.1047350466",  // Pregunta 10
  "entry.1069235581",  // Pregunta 11
  "entry.1877349719",  // Pregunta 12
  "entry.1745742627",  // Pregunta 13
  "entry.1592498419",  // Pregunta 14
  "entry.520542155",   // Pregunta 15
  "entry.569890705",   // Pregunta 16
  "entry.1224078021",  // Pregunta 17
  "entry.2010756056",  // Pregunta 18
] as const;

/* =========================================================
   MAPEO AUTOMÁTICO PreguntaId -> entry.xxxxx
========================================================= */

const preguntaEntryIds = Object.fromEntries(
  PREGUNTAS.map((pregunta, index) => {
    const entryId = PREGUNTAS_ENTRY_IDS[index];

    if (!entryId) {
      throw new Error(
        `No existe un entry ID configurado para la pregunta ${String(
          pregunta,
        )}.`,
      );
    }

    return [pregunta, entryId];
  }),
) as Record<PreguntaId, string>;

/* =========================================================
   MAPEO COMPLETO DEL GOOGLE FORM
========================================================= */

export const GOOGLE_FORM_ENTRY_IDS: Record<CampoGoogle, string> = {
  ...CAMPOS_GENERALES_ENTRY_IDS,
  ...preguntaEntryIds,
};

/* =========================================================
   VALIDACIÓN
========================================================= */

export function validarConfiguracionGoogleForm(): void {
  if (PREGUNTAS.length !== PREGUNTAS_ENTRY_IDS.length) {
    throw new Error(
      `La encuesta contiene ${PREGUNTAS.length} preguntas, ` +
        `pero existen ${PREGUNTAS_ENTRY_IDS.length} IDs configurados.`,
    );
  }

  const ids = Object.values(GOOGLE_FORM_ENTRY_IDS);

  const idInvalido = ids.find(
    (id) => !/^entry\.\d+$/.test(id),
  );

  if (idInvalido) {
    throw new Error(
      `ID de Google Forms inválido: ${idInvalido}`,
    );
  }

  if (new Set(ids).size !== ids.length) {
    throw new Error(
      "Cada campo debe tener un ID entry distinto.",
    );
  }

  if (ids.length !== 25) {
    throw new Error(
      `Se esperaban 25 campos de Google Forms, pero se encontraron ${ids.length}.`,
    );
  }
}

/* =========================================================
   CONVERTIR RESPUESTA -> PAYLOAD GOOGLE FORMS
========================================================= */

export function buildGoogleFormPayload(
  respuesta: RespuestaEncuesta,
): Record<string, string> {
  const campos: Record<CampoGoogle, string> = {
    nombresApellidos:
      respuesta.nombresApellidos,

    sexo:
      respuesta.sexo,

    edad:
      String(respuesta.edad),

    residePeru:
      respuesta.residePeru,

    gradoInstruccion:
      respuesta.gradoInstruccion,

    experiencia:
      respuesta.experiencia,

    ambito:
      respuesta.ambito,

    ...respuesta.respuestas,
  };

  return Object.fromEntries(
    Object.entries(campos).map(
      ([campo, valor]) => [
        GOOGLE_FORM_ENTRY_IDS[
          campo as CampoGoogle
        ],
        String(valor),
      ],
    ),
  );
}