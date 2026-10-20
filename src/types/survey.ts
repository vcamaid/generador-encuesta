export const SEXOS = ["F", "M"] as const;
export const RESIDENCIAS = ["Si", "No"] as const;
export const GRADOS = [
  "Secundaria completa",
  "Técnico completo",
  "Universitario completo",
  "Maestría incompleta",
  "Maestría completa",
  "Doctorado incompleto",
  "Doctorado completo",
] as const;
export const EXPERIENCIAS = [
  "Menos de 1 año",
  "1 a 3 años",
  "4 a 6 años",
  "+ 6 años",
] as const;
export const AMBITOS = [
  "Entidad Pública",
  "Empresa Distribuidora de medicamentos",
  "Independiente",
] as const;
export const PERFILES = [
  "Derecho",
  "Farmacia y Bioquímica",
  "Administración / Gestión pública",
  "Otra área profesional",
] as const;
export const GRUPOS_EDAD = ["18–25", "26–35", "36–45", "46–60"] as const;
export const RESPUESTAS_LIKERT = [
  "Total desacuerdo",
  "En desacuerdo",
  "Neutral",
  "De acuerdo",
  "Total acuerdo",
] as const;

export type Sexo = (typeof SEXOS)[number];
export type Residencia = (typeof RESIDENCIAS)[number];
export type Grado = (typeof GRADOS)[number];
export type Experiencia = (typeof EXPERIENCIAS)[number];
export type Ambito = (typeof AMBITOS)[number];
export type PerfilProfesional = (typeof PERFILES)[number];
export type GrupoEdad = (typeof GRUPOS_EDAD)[number];
export type RespuestaLikert = (typeof RESPUESTAS_LIKERT)[number];
export type PreguntaId = `pregunta${number}`;

export interface RespuestaEncuesta {
  nombresApellidos: string;
  sexo: Sexo;
  edad: number;
  residePeru: Residencia;
  gradoInstruccion: Grado;
  experiencia: Experiencia;
  ambito: Ambito;
  perfilProfesional: PerfilProfesional;
  respuestas: Record<PreguntaId, RespuestaLikert>;
  esSintetico: true;
}

export interface Distribuciones {
  ambito: Record<Ambito, number>;
  experiencia: Record<Experiencia, number>;
  gradoInstruccion: Record<Grado, number>;
  sexo: Record<Sexo, number>;
  residePeru: Record<Residencia, number>;
  edad: Record<GrupoEdad, number>;
  perfilProfesional: Record<PerfilProfesional, number>;
}

export const PREGUNTAS = Array.from(
  { length: 18 },
  (_, index) => `pregunta${index + 1}` as PreguntaId,
);

export const ETIQUETAS_PREGUNTAS = Object.fromEntries(
  PREGUNTAS.map((pregunta, index) => [pregunta, `P${index + 1}`]),
) as Record<PreguntaId, string>;
