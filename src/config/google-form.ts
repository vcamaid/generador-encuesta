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

const entryIds = Array.from({ length: 25 }, (_, index) => {
  return `entry.${String(index + 1).padStart(10, "0")}`;
});

export const GOOGLE_FORM_ENTRY_IDS: Record<CampoGoogle, string> = {
  nombresApellidos: entryIds[0],
  sexo: entryIds[1],
  edad: entryIds[2],
  residePeru: entryIds[3],
  gradoInstruccion: entryIds[4],
  experiencia: entryIds[5],
  ambito: entryIds[6],
  ...Object.fromEntries(
    PREGUNTAS.map((pregunta, index) => [pregunta, entryIds[index + 7]]),
  ),
};

export function validarConfiguracionGoogleForm(): void {
  const ids = Object.values(GOOGLE_FORM_ENTRY_IDS);
  if (ids.some((id) => !/^entry\.\d+$/.test(id) || id.endsWith("0000000000"))) {
    throw new Error(
      "Configura los IDs entry.xxxxx reales del formulario de prueba en src/config/google-form.ts.",
    );
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error("Cada campo debe tener un ID entry distinto.");
  }
}

export function buildGoogleFormPayload(
  respuesta: RespuestaEncuesta,
): Record<string, string> {
  const campos: Record<CampoGoogle, string> = {
    nombresApellidos: respuesta.nombresApellidos,
    sexo: respuesta.sexo,
    edad: String(respuesta.edad),
    residePeru: respuesta.residePeru,
    gradoInstruccion: respuesta.gradoInstruccion,
    experiencia: respuesta.experiencia,
    ambito: respuesta.ambito,
    ...respuesta.respuestas,
  };
  return Object.fromEntries(
    Object.entries(campos).map(([campo, valor]) => [
      GOOGLE_FORM_ENTRY_IDS[campo as CampoGoogle],
      valor,
    ]),
  );
}
