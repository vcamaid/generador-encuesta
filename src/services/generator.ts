import {
  AMBITOS,
  EXPERIENCIAS,
  GRADOS,
  GRUPOS_EDAD,
  PERFILES,
  PREGUNTAS,
  RESPUESTAS_LIKERT,
  SEXOS,
  type Ambito,
  type Distribuciones,
  type Experiencia,
  type Grado,
  type GrupoEdad,
  type PerfilProfesional,
  type PreguntaId,
  type Residencia,
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
  residePeru: { Si: 94, No: 6 },
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

const NOMBRES_POR_SEXO: Record<Sexo, readonly string[]> = {
  F: [
    "Carla Fernanda",
    "María Elena",
    "Andrea Lucía",
    "Valeria Sofía",
    "Patricia Isabel",
    "Fiorella Alexandra",
    "Daniela Milagros",
    "Rosa María",
    "Gabriela Alejandra",
    "Pamela Andrea",
    "Lucía Fernanda",
    "Karen Melissa",
    "Alejandra Sofía",
    "María Fernanda",
    "Claudia Patricia",
    "Diana Carolina",
    "Jessica Milagros",
    "Vanessa Andrea",
    "Paola Cristina",
    "Natalia Alejandra",
  ],
  M: [
    "Luis Alberto",
    "José Antonio",
    "Diego Alejandro",
    "Miguel Ángel",
    "Jorge Eduardo",
    "Renato Alonso",
    "Carlos Enrique",
    "Víctor Manuel",
    "Christian David",
    "Juan Carlos",
    "Marco Antonio",
    "César Augusto",
    "Fernando Javier",
    "Ricardo Andrés",
    "Javier Eduardo",
    "Roberto Carlos",
    "Daniel Alejandro",
    "Manuel Antonio",
    "José Luis",
    "Álvaro Renato",
  ],
};

const APELLIDOS = [
  "Quispe Mendoza",
  "Rojas Huamán",
  "Cárdenas Salazar",
  "Paredes Flores",
  "Torres Chávez",
  "Vargas Ramos",
  "Castillo Peña",
  "Medina Gutiérrez",
  "Sánchez León",
  "Romero Díaz",
  "Cabrera Soto",
  "Núñez Castro",
  "Palomino Vega",
  "Herrera Ponce",
  "Alarcón Espinoza",
  "Huerta Campos",
  "Aguilar Zamora",
  "Mendoza Ruiz",
  "Salas Valdivia",
  "Córdova Reyes",
  "Villanueva Ríos",
  "Espino Huamán",
  "Navarro Pacheco",
  "Bustamante Lara",
  "Acosta Carrillo",
] as const;

const EDADES: Record<GrupoEdad, readonly [number, number]> = {
  "18–25": [18, 25],
  "26–35": [26, 35],
  "36–45": [36, 45],
  "46–60": [46, 60],
};

const EDAD_MINIMA_GRADO: Record<Grado, number> = {
  "Secundaria completa": 18,
  "Técnico completo": 20,
  "Universitario completo": 22,
  "Maestría incompleta": 23,
  "Maestría completa": 25,
  "Doctorado incompleto": 27,
  "Doctorado completo": 30,
};

const EDAD_INICIO_CAMPO: Record<PerfilProfesional, number> = {
  Derecho: 22,
  "Farmacia y Bioquímica": 22,
  "Administración / Gestión pública": 20,
  "Otra área profesional": 18,
};

const GRADOS_PERMITIDOS_POR_PERFIL: Record<PerfilProfesional, readonly Grado[]> = {
  Derecho: [
    "Universitario completo",
    "Maestría incompleta",
    "Maestría completa",
    "Doctorado incompleto",
    "Doctorado completo",
  ],
  "Farmacia y Bioquímica": [
    "Universitario completo",
    "Maestría incompleta",
    "Maestría completa",
    "Doctorado incompleto",
    "Doctorado completo",
  ],
  "Administración / Gestión pública": [
    "Técnico completo",
    "Universitario completo",
    "Maestría incompleta",
    "Maestría completa",
    "Doctorado incompleto",
    "Doctorado completo",
  ],
  "Otra área profesional": GRADOS,
};

const AMBITO_FACTOR_POR_PERFIL: Record<
  PerfilProfesional,
  Record<Ambito, number>
> = {
  Derecho: {
    "Entidad Pública": 1.8,
    "Empresa Distribuidora de medicamentos": 0.75,
    Independiente: 1.25,
  },
  "Farmacia y Bioquímica": {
    "Entidad Pública": 1.05,
    "Empresa Distribuidora de medicamentos": 2.2,
    Independiente: 0.55,
  },
  "Administración / Gestión pública": {
    "Entidad Pública": 1.85,
    "Empresa Distribuidora de medicamentos": 1.15,
    Independiente: 0.55,
  },
  "Otra área profesional": {
    "Entidad Pública": 0.9,
    "Empresa Distribuidora de medicamentos": 1.3,
    Independiente: 1.15,
  },
};

const DIMENSIONES: readonly (readonly PreguntaId[])[] = [
  ["pregunta1", "pregunta2", "pregunta3"],
  ["pregunta4", "pregunta5", "pregunta6"],
  ["pregunta7", "pregunta8", "pregunta9"],
  ["pregunta10", "pregunta11", "pregunta12"],
  ["pregunta13", "pregunta14", "pregunta15"],
  ["pregunta16", "pregunta17", "pregunta18"],
];

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
  const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);

  if (entries.length === 0 || total <= 0) {
    throw new Error("No hay opciones con peso válido para realizar la selección.");
  }

  const threshold = random() * total;
  let cumulative = 0;

  for (const [value, weight] of entries) {
    cumulative += Math.max(0, weight);
    if (threshold < cumulative) return value;
  }

  return entries[entries.length - 1][0];
}

function weightedChoiceWithFactors<T extends string>(
  distribution: Record<T, number>,
  factors: Partial<Record<T, number>>,
  random: () => number,
): T {
  const adjusted = Object.fromEntries(
    (Object.entries(distribution) as [T, number][]).map(([value, weight]) => [
      value,
      Math.max(0, weight) * Math.max(0, factors[value] ?? 1),
    ]),
  ) as Record<T, number>;

  const total = (Object.values(adjusted) as number[]).reduce(
    (sum, weight) => sum + weight,
    0,
  );
  return total > 0
    ? weightedChoice(adjusted, random)
    : weightedChoice(distribution, random);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomNormalLike(random: () => number): number {
  return random() + random() + random() + random() - 2;
}

function randomInt(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function pickOne<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)];
}

function generarNombreUnico(
  sexo: Sexo,
  random: () => number,
  usados: Set<string>,
): string {
  const nombres = NOMBRES_POR_SEXO[sexo];
  const maxCombinaciones = nombres.length * APELLIDOS.length;

  for (let intento = 0; intento < maxCombinaciones * 2; intento += 1) {
    const nombre = `${pickOne(nombres, random)} ${pickOne(APELLIDOS, random)}`;
    if (!usados.has(nombre)) {
      usados.add(nombre);
      return nombre;
    }
  }

  // Para el límite actual de 500 registros este fallback prácticamente no se usa.
  const fallback = `${pickOne(nombres, random)} ${pickOne(APELLIDOS, random)}`;
  usados.add(fallback);
  return fallback;
}

function generarEdad(
  grupo: GrupoEdad,
  perfil: PerfilProfesional,
  random: () => number,
): number {
  const [minGrupo, maxGrupo] = EDADES[grupo];
  const minCoherente = Math.max(minGrupo, EDAD_INICIO_CAMPO[perfil]);

  if (minCoherente > maxGrupo) {
    throw new Error(
      `El grupo de edad ${grupo} no es compatible con el perfil ${perfil}.`,
    );
  }

  return randomInt(minCoherente, maxGrupo, random);
}

function gradoCompatible(
  edad: number,
  perfil: PerfilProfesional,
  distribucion: Record<Grado, number>,
  random: () => number,
): Grado {
  const permitidosPerfil = new Set(GRADOS_PERMITIDOS_POR_PERFIL[perfil]);
  const factors = Object.fromEntries(
    GRADOS.map((grado) => {
      const porEdad = edad >= EDAD_MINIMA_GRADO[grado];
      const porPerfil = permitidosPerfil.has(grado);

      if (!porEdad || !porPerfil) return [grado, 0];

      let factor = 1;
      if (grado === "Universitario completo") factor = 1.25;
      if (grado === "Maestría incompleta") factor = edad >= 25 ? 1.05 : 0.6;
      if (grado === "Maestría completa") factor = edad >= 30 ? 1.25 : 0.8;
      if (grado === "Doctorado incompleto") factor = edad >= 32 ? 1 : 0.45;
      if (grado === "Doctorado completo") factor = edad >= 35 ? 1 : 0.35;

      return [grado, factor];
    }),
  ) as Record<Grado, number>;

  return weightedChoiceWithFactors(distribucion, factors, random);
}

function maxExperienciaPosible(edad: number, perfil: PerfilProfesional): number {
  return Math.max(0, edad - EDAD_INICIO_CAMPO[perfil]);
}

function experienciaCompatible(
  edad: number,
  perfil: PerfilProfesional,
  distribucion: Record<Experiencia, number>,
  random: () => number,
): Experiencia {
  const maxAnios = maxExperienciaPosible(edad, perfil);

  const factors: Record<Experiencia, number> = {
    "Menos de 1 año": maxAnios >= 0 ? (maxAnios <= 1 ? 2.3 : 0.45) : 0,
    "1 a 3 años": maxAnios >= 1 ? (maxAnios <= 4 ? 1.8 : 0.8) : 0,
    "4 a 6 años": maxAnios >= 4 ? (maxAnios <= 7 ? 1.7 : 1) : 0,
    "+ 6 años": maxAnios >= 7 ? (maxAnios >= 10 ? 1.7 : 1) : 0,
  };

  return weightedChoiceWithFactors(distribucion, factors, random);
}

function ambitoCompatible(
  perfil: PerfilProfesional,
  distribucion: Record<Ambito, number>,
  random: () => number,
): Ambito {
  return weightedChoiceWithFactors(
    distribucion,
    AMBITO_FACTOR_POR_PERFIL[perfil],
    random,
  );
}

function conocimientoTecnico(
  grado: Grado,
  experiencia: Experiencia,
  perfil: PerfilProfesional,
): number {
  const gradoScore: Record<Grado, number> = {
    "Secundaria completa": 0.1,
    "Técnico completo": 0.25,
    "Universitario completo": 0.45,
    "Maestría incompleta": 0.58,
    "Maestría completa": 0.72,
    "Doctorado incompleto": 0.82,
    "Doctorado completo": 0.9,
  };

  const experienciaScore: Record<Experiencia, number> = {
    "Menos de 1 año": 0.1,
    "1 a 3 años": 0.35,
    "4 a 6 años": 0.65,
    "+ 6 años": 0.9,
  };

  const perfilScore: Record<PerfilProfesional, number> = {
    Derecho: 0.9,
    "Farmacia y Bioquímica": 0.82,
    "Administración / Gestión pública": 0.78,
    "Otra área profesional": 0.55,
  };

  return clamp(
    gradoScore[grado] * 0.3 +
      experienciaScore[experiencia] * 0.45 +
      perfilScore[perfil] * 0.25,
    0,
    1,
  );
}

function scoreToLikert(score: number): RespuestaLikert {
  const rounded = Math.round(clamp(score, 1, 5));
  return RESPUESTAS_LIKERT[rounded - 1];
}

function likertToScore(value: RespuestaLikert): number {
  return RESPUESTAS_LIKERT.indexOf(value) + 1;
}

function generarScoreItem(
  dimension: number,
  conocimiento: number,
  random: () => number,
): number {
  // A mayor experiencia/conocimiento, menos ruido y menos respuestas neutras por indecisión.
  const noiseAmplitude = 0.95 - conocimiento * 0.45;
  const noise = randomNormalLike(random) * noiseAmplitude;
  return clamp(3 + dimension + noise, 1, 5);
}

function limitarDiferencia(score: number, referencia: number, maxDiff = 1): number {
  return clamp(score, referencia - maxDiff, referencia + maxDiff);
}

function generarRespuestasCoherentes(
  grado: Grado,
  experiencia: Experiencia,
  perfil: PerfilProfesional,
  random: () => number,
): Record<PreguntaId, RespuestaLikert> {
  const conocimiento = conocimientoTecnico(grado, experiencia, perfil);

  // Tendencia general de percepción: independiente del perfil para no "forzar" conclusiones.
  const general = clamp(randomNormalLike(random) * 0.7 + 0.2, -1.65, 1.65);

  // Cada dimensión conserva la tendencia general, con variación moderada propia.
  const dimensiones = DIMENSIONES.map(() =>
    clamp(general + randomNormalLike(random) * 0.32, -1.75, 1.75),
  );

  const scores = {} as Record<PreguntaId, number>;

  DIMENSIONES.forEach((preguntas, dimensionIndex) => {
    for (const pregunta of preguntas) {
      scores[pregunta] = generarScoreItem(
        dimensiones[dimensionIndex],
        conocimiento,
        random,
      );
    }
  });

  // Coherencia semántica fuerte entre afirmaciones casi equivalentes.
  const tipicidadRef = (scores.pregunta1 + scores.pregunta2) / 2;
  scores.pregunta2 = limitarDiferencia(scores.pregunta2, scores.pregunta1, 1);
  scores.pregunta17 = limitarDiferencia(
    (scores.pregunta17 + tipicidadRef) / 2,
    tipicidadRef,
    1,
  );

  const proporcionalidadRef =
    (scores.pregunta4 + scores.pregunta5 + scores.pregunta6) / 3;
  scores.pregunta5 = limitarDiferencia(scores.pregunta5, scores.pregunta4, 1);
  scores.pregunta6 = limitarDiferencia(scores.pregunta6, proporcionalidadRef, 1);
  scores.pregunta18 = limitarDiferencia(
    (scores.pregunta18 + proporcionalidadRef) / 2,
    proporcionalidadRef,
    1,
  );

  const sustentoRef = (scores.pregunta7 + scores.pregunta8 + scores.pregunta9) / 3;
  scores.pregunta8 = limitarDiferencia(scores.pregunta8, scores.pregunta7, 1);
  scores.pregunta9 = limitarDiferencia(scores.pregunta9, sustentoRef, 1);
  scores.pregunta16 = limitarDiferencia(
    (scores.pregunta16 + sustentoRef) / 2,
    sustentoRef,
    1,
  );

  const etapasRef = (scores.pregunta10 + scores.pregunta11 + scores.pregunta12) / 3;
  scores.pregunta11 = limitarDiferencia(scores.pregunta11, scores.pregunta10, 1);
  scores.pregunta12 = limitarDiferencia(scores.pregunta12, etapasRef, 1);

  const garantiasRef = (scores.pregunta13 + scores.pregunta14 + scores.pregunta15) / 3;
  scores.pregunta14 = limitarDiferencia(scores.pregunta14, scores.pregunta13, 1);
  scores.pregunta15 = limitarDiferencia(scores.pregunta15, garantiasRef, 1);

  const respuestas = Object.fromEntries(
    PREGUNTAS.map((pregunta) => [pregunta, scoreToLikert(scores[pregunta])]),
  ) as Record<PreguntaId, RespuestaLikert>;

  // Evita perfiles artificiales con las 18 respuestas idénticas.
  const valores = PREGUNTAS.map((pregunta) => respuestas[pregunta]);
  if (new Set(valores).size === 1) {
    const pregunta = PREGUNTAS[randomInt(0, PREGUNTAS.length - 1, random)];
    const actual = likertToScore(respuestas[pregunta]);
    const cambio = actual >= 5 ? -1 : actual <= 1 ? 1 : random() < 0.5 ? -1 : 1;
    respuestas[pregunta] = scoreToLikert(actual + cambio);
  }

  return respuestas;
}

export function distribucionesValidas(
  distribuciones: Distribuciones,
): string | null {
  for (const [dimension, values] of Object.entries(distribuciones)) {
    const numeros = Object.values(values).map(Number);

    if (numeros.some((value) => !Number.isFinite(value))) {
      return `Los porcentajes de ${dimension} deben ser números válidos.`;
    }

    if (numeros.some((value) => value < 0 || value > 100)) {
      return `Los porcentajes de ${dimension} deben estar entre 0 y 100.`;
    }

    const total = numeros.reduce((sum, value) => sum + value, 0);
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

  if (!seed.trim()) {
    throw new Error("La semilla no puede estar vacía.");
  }

  const random = createRandom(seed);
  const nombresUsados = new Set<string>();

  return Array.from({ length: cantidad }, () => {
    // 1) Sexo y nombre: consistencia directa.
    const sexo: Sexo = weightedChoice(distribuciones.sexo, random);
    const nombresApellidos = generarNombreUnico(sexo, random, nombresUsados);

    // 2) Perfil profesional.
    const perfilProfesional: PerfilProfesional = weightedChoice(
      distribuciones.perfilProfesional,
      random,
    );

    // 3) Edad exacta compatible con el perfil seleccionado.
    const grupoEdad: GrupoEdad = weightedChoice(distribuciones.edad, random);
    const edad = generarEdad(grupoEdad, perfilProfesional, random);

    // 4) Formación y experiencia condicionadas por edad/perfil.
    const gradoInstruccion = gradoCompatible(
      edad,
      perfilProfesional,
      distribuciones.gradoInstruccion,
      random,
    );

    const experiencia = experienciaCompatible(
      edad,
      perfilProfesional,
      distribuciones.experiencia,
      random,
    );

    // 5) Ámbito condicionado por el perfil profesional.
    const ambito = ambitoCompatible(
      perfilProfesional,
      distribuciones.ambito,
      random,
    );

    // 6) Residencia mantiene la distribución configurada.
    const residePeru: Residencia = weightedChoice(
      distribuciones.residePeru,
      random,
    );

    // 7) Respuestas: percepción general + dimensión + consistencia semántica.
    const respuestas = generarRespuestasCoherentes(
      gradoInstruccion,
      experiencia,
      perfilProfesional,
      random,
    );

    return {
      nombresApellidos,
      sexo,
      edad,
      residePeru,
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
  residePeru: ["Si", "No"],
  edad: GRUPOS_EDAD,
  perfilProfesional: PERFILES,
} satisfies { [K in keyof Distribuciones]: readonly string[] };
