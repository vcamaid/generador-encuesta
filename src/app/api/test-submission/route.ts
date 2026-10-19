import { NextResponse } from "next/server";
import {
  buildGoogleFormPayload,
  validarConfiguracionGoogleForm,
} from "@/config/google-form";
import { PREGUNTAS, type RespuestaEncuesta } from "@/types/survey";

export const runtime = "nodejs";

function isSyntheticResponse(value: unknown): value is RespuestaEncuesta {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  if (
    row.esSintetico !== true ||
    typeof row.nombresApellidos !== "string" ||
    typeof row.edad !== "number" ||
    typeof row.respuestas !== "object" ||
    row.respuestas === null
  ) {
    return false;
  }
  const answers = row.respuestas as Record<string, unknown>;
  return PREGUNTAS.every((pregunta) => typeof answers[pregunta] === "string");
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ENABLE_TEST_SUBMISSION !== "true") {
    return NextResponse.json(
      { error: "El envío de prueba está desactivado en el servidor." },
      { status: 403 },
    );
  }

  const formUrl = process.env.GOOGLE_TEST_FORM_URL;
  if (!formUrl) {
    return NextResponse.json(
      { error: "Configura GOOGLE_TEST_FORM_URL para el formulario de prueba." },
      { status: 503 },
    );
  }

  let destination: URL;
  try {
    destination = new URL(formUrl);
    if (
      destination.protocol !== "https:" ||
      destination.hostname !== "docs.google.com" ||
      !destination.pathname.includes("/forms/")
    ) {
      throw new Error("URL inválida");
    }
    validarConfiguracionGoogleForm();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "La configuración del formulario no es válida.",
      },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray((body as { registros?: unknown }).registros)
  ) {
    return NextResponse.json(
      { error: "Se requiere una lista de registros sintéticos." },
      { status: 400 },
    );
  }
  const records = (body as { registros: unknown[] }).registros;
  if (
    records.length < 1 ||
    records.length > 120 ||
    !records.every(isSyntheticResponse)
  ) {
    return NextResponse.json(
      { error: "El lote debe contener de 1 a 120 registros sintéticos válidos." },
      { status: 400 },
    );
  }

  let enviados = 0;
  for (const record of records) {
    const response = await fetch(destination, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(buildGoogleFormPayload(record)),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok && (response.status < 300 || response.status >= 400)) {
      return NextResponse.json(
        {
          error: `Google Forms rechazó el registro ${enviados + 1} (HTTP ${response.status}); se enviaron ${enviados}.`,
          enviados,
        },
        { status: 502 },
      );
    }
    enviados += 1;
  }
  return NextResponse.json({ enviados });
}
