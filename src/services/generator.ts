import {
  AMBITOS,
  EXPERIENCIAS,
  GRADOS,
  GRUPOS_EDAD,
  PERFILES,
  PREGUNTAS,
  RESPUESTAS_LIKERT,
  RESIDENCIAS,
  SEXOS,
  type Ambito,
  type Distribuciones,
  type Experiencia,
  type Grado,
  type GrupoEdad,
  type PerfilProfesional,
  type PreguntaId,
  type RespuestaEncuesta,
  type RespuestaLikert,
  type Sexo,
} from "@/types/survey";

export const DISTRIBUCIONES_INICIALES: Distribuciones = {
  ambito: {
    "Entidad Pública": 40,
    "Empresa Distribuidora de medicamentos": 35,
    Independiente: 25,
  },
  experiencia: {
    "Menos de 1 año": 10,
    "1 a 3 años": 30,
    "4 a 6 años": 30,
    "+ 6 años": 30,
  },
  gradoInstruccion: {
    "Secundaria completa": 3,
    "Técnico completo": 7,
    "Universitario completo": 35,
    "Maestría incompleta": 15,
    "Maestría completa": 25,
    "Doctorado incompleto": 8,
    "Doctorado completo": 7,
  },
  sexo: { F: 55, M: 45 },
  edad: { "18–25": 12, "26–35": 38, "36–45": 32, "46–60": 18 },
  perfilProfesional: {
    Derecho: 45,
    "Farmacia y Bioquímica": 25,
    "Administración / Gestión pública": 20,
    "Otra área profesional": 10,
  },
};

const NOMBRES = [
  "Alex", "Sam", "Andrea", "Cris", "Pat", "Dani", "Robin", "Noa",
  "Ariel", "Taylor", "René", "Sol", "Mar", "Gabriel", "Nicolás", "Camila",
];
const APELLIDOS = [
  "Muestra", "Simulado", "Ejemplo", "Ficticio", "Prueba", "Demo", "Sintético",
];
const EDADES: Record<GrupoEdad, [number, number]> = {
  "18–25": [18, 25],
  "26–35": [26, 35],
  "36–45": [36, 45],
  "46–60": [46, 60],
};
const PESOS_BASE_LIKERT = [0.07, 0.16, 0.34, 0.31, 0.12];

function createRandom(seed: string): () => number {
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedChoice<T extends string>(
  distribution: Record<T, number>,
  random: () => number,
): T {
  const entries = Object.entries(distribution) as [T, number][];
  const threshold = random() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cumulative = 0;
  for (const [value, weight] of entries) {
    cumulative += weight;
    if (threshold < cumulative) return value;
  }
  return entries[entries.length - 1][0];
}

function responseForPerception(
  latentPerception: number,
  random: () => number,
): RespuestaLikert {
  const weights = PESOS_BASE_LIKERT.map((baseWeight, index) => {
    const score = index + 1;
    return baseWeight * Math.exp(0.48 * latentPerception * (score - 3));
  });
  const draw = random() * weights.reduce((sum, weight) => sum + weight, 0);
  let cumulative = 0;
  for (let index = 0; index < weights.length; index += 1) {
    cumulative += weights[index];
    if (draw < cumulative) return RESPUESTAS_LIKERT[index];
  }
  return RESPUESTAS_LIKERT[RESPUESTAS_LIKERT.length - 1];
}

export function distribucionesValidas(
  distribuciones: Distribuciones,
): string | null {
  for (const [dimension, values] of Object.entries(distribuciones)) {
    const total = Object.values(values).reduce((sum, value) => sum + value, 0);
    if (Object.values(values).some((value) => value < 0 || value > 100)) {
      return `Los porcentajes de ${dimension} deben estar entre 0 y 100.`;
    }
    if (Math.abs(total - 100) > 0.001) {
      return `Los porcentajes de ${dimension} deben sumar 100% (actual: ${total}%).`;
    }
  }
  return null;
}

export function generarDataset(
  cantidad: number,
  seed: string,
  distribuciones: Distribuciones,
): RespuestaEncuesta[] {
  const error = distribucionesValidas(distribuciones);
  if (error) throw new Error(error);
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 500) {
    throw new Error("La cantidad debe ser un entero entre 1 y 500.");
  }

  const random = createRandom(seed);
  return Array.from({ length: cantidad }, (_, index) => {
    const perfilProfesional: PerfilProfesional = weightedChoice(
      distribuciones.perfilProfesional,
      random,
    );
    const grupoEdad: GrupoEdad = weightedChoice(distribuciones.edad, random);
    const [minEdad, maxEdad] = EDADES[grupoEdad];
    const sexo: Sexo = weightedChoice(distribuciones.sexo, random);
    const ambito: Ambito = weightedChoice(distribuciones.ambito, random);
    const experiencia: Experiencia = weightedChoice(
      distribuciones.experiencia,
      random,
    );
    const gradoInstruccion: Grado = weightedChoice(
      distribuciones.gradoInstruccion,
      random,
    );
    const latentPerception = Math.max(
      -2,
      Math.min(2, (random() + random() + random() + random() - 2) * 1.35),
    );
    const respuestas = Object.fromEntries(
      PREGUNTAS.map((pregunta: PreguntaId) => [
        pregunta,
        responseForPerception(latentPerception, random),
      ]),
    ) as Record<PreguntaId, RespuestaLikert>;

    return {
      nombresApellidos: `${NOMBRES[Math.floor(random() * NOMBRES.length)]} ${APELLIDOS[Math.floor(random() * APELLIDOS.length)]} ${String(index + 1).padStart(3, "0")}`,
      sexo,
      edad: minEdad + Math.floor(random() * (maxEdad - minEdad + 1)),
      residePeru: weightedChoice({ Si: 94, No: 6 }, random),
      gradoInstruccion,
      experiencia,
      ambito,
      perfilProfesional,
      respuestas,
      esSintetico: true,
    };
  });
}

export const CATEGORIAS = {
  ambito: AMBITOS,
  experiencia: EXPERIENCIAS,
  gradoInstruccion: GRADOS,
  sexo: SEXOS,
  edad: GRUPOS_EDAD,
  perfilProfesional: PERFILES,
} satisfies { [K in keyof Distribuciones]: readonly string[] };
