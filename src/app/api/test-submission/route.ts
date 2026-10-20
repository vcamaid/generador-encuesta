import { NextResponse } from "next/server";

import {
  buildGoogleFormPayload,
  validarConfiguracionGoogleForm,
} from "@/config/google-form";

import {
  AMBITOS,
  EXPERIENCIAS,
  GRADOS,
  PERFILES,
  PREGUNTAS,
  RESPUESTAS_LIKERT,
  RESIDENCIAS,
  SEXOS,
  type RespuestaEncuesta,
} from "@/types/survey";

/* =========================================================
   VALIDAR REGISTRO SINTÉTICO
========================================================= */

function isSyntheticResponse(
  value: unknown,
): value is RespuestaEncuesta {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const row =
    value as Record<string, unknown>;

  if (
    row.esSintetico !== true ||
    typeof row.nombresApellidos !==
      "string" ||
    row.nombresApellidos.length < 1 ||
    row.nombresApellidos.length > 100 ||
    typeof row.edad !== "number" ||
    !Number.isInteger(row.edad) ||
    row.edad < 18 ||
    row.edad > 100 ||
    !isOneOf(row.sexo, SEXOS) ||
    !isOneOf(
      row.residePeru,
      RESIDENCIAS,
    ) ||
    !isOneOf(
      row.gradoInstruccion,
      GRADOS,
    ) ||
    !isOneOf(
      row.experiencia,
      EXPERIENCIAS,
    ) ||
    !isOneOf(
      row.ambito,
      AMBITOS,
    ) ||
    !isOneOf(
      row.perfilProfesional,
      PERFILES,
    ) ||
    typeof row.respuestas !==
      "object" ||
    row.respuestas === null
  ) {
    return false;
  }

  const answers =
    row.respuestas as Record<
      string,
      unknown
    >;

  return PREGUNTAS.every(
    (pregunta) =>
      isOneOf(
        answers[pregunta],
        RESPUESTAS_LIKERT,
      ),
  );
}

/* =========================================================
   VALIDACIÓN DE OPCIONES
========================================================= */

function isOneOf<
  T extends readonly string[],
>(
  value: unknown,
  options: T,
): value is T[number] {
  return (
    typeof value === "string" &&
    options.some(
      (option) =>
        option === value,
    )
  );
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request,
) {
  /* =======================================================
     ENVÍO DE PRUEBA HABILITADO
  ======================================================= */

  if (
    process.env
      .NEXT_PUBLIC_ENABLE_TEST_SUBMISSION !==
    "true"
  ) {
    return NextResponse.json(
      {
        error:
          "El envío de prueba está desactivado en el servidor.",
      },
      {
        status: 403,
      },
    );
  }

  /* =======================================================
     URL DEL FORMULARIO DE PRUEBA
  ======================================================= */

  const formUrl =
    process.env
      .GOOGLE_TEST_FORM_URL;

  if (!formUrl) {
    return NextResponse.json(
      {
        error:
          "Configura GOOGLE_TEST_FORM_URL para el formulario de prueba.",
      },
      {
        status: 503,
      },
    );
  }

  /* =======================================================
     VALIDAR URL
  ======================================================= */

  let destination: URL;

  try {
    destination =
      new URL(formUrl);

    if (
      destination.protocol !==
        "https:" ||
      destination.hostname !==
        "docs.google.com" ||
      !/^\/forms\/d\/e\/[^/]+\/(viewform|formResponse)\/?$/.test(
        destination.pathname,
      )
    ) {
      throw new Error(
        "URL inválida",
      );
    }

    destination.pathname =
      destination.pathname.replace(
        /\/viewform\/?$/,
        "/formResponse",
      );

    validarConfiguracionGoogleForm();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "La configuración del formulario no es válida.",
      },
      {
        status: 400,
      },
    );
  }

  /* =======================================================
     LEER BODY
  ======================================================= */

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "JSON inválido.",
      },
      {
        status: 400,
      },
    );
  }

  /* =======================================================
     VALIDAR ESTRUCTURA
  ======================================================= */

  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray(
      (
        body as {
          registros?: unknown;
        }
      ).registros,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Se requiere una lista de registros sintéticos.",
      },
      {
        status: 400,
      },
    );
  }

  const records =
    (
      body as {
        registros: unknown[];
      }
    ).registros;

  /*
   * IMPORTANTE:
   *
   * Esta API ahora procesa
   * UN SOLO registro.
   *
   * El cliente controla
   * la espera de 1–5 minutos.
   */

  if (
    records.length !== 1 ||
    !isSyntheticResponse(
      records[0],
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Esta ruta acepta exactamente un registro sintético válido por petición.",
      },
      {
        status: 400,
      },
    );
  }

  const record =
    records[0];

  /* =======================================================
     CONSTRUIR PAYLOAD GOOGLE
  ======================================================= */

  const googlePayload =
    buildGoogleFormPayload(
      record,
    );

  const formBody =
    new URLSearchParams(
      googlePayload,
    );

  /*
   * El formulario tiene
   * 7 páginas:
   *
   * 0,1,2,3,4,5,6
   */

  formBody.set(
    "pageHistory",
    "0,1,2,3,4,5,6",
  );

  formBody.set(
    "fvv",
    "1",
  );

  formBody.set(
    "submit",
    "Submit",
  );

  /* =======================================================
     DEBUG
  ======================================================= */

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    console.log(
      "GOOGLE URL:",
      destination.toString(),
    );

    console.log(
      "GOOGLE PAYLOAD:",
      Object.fromEntries(
        formBody.entries(),
      ),
    );
  }

  /* =======================================================
     ENVÍO
  ======================================================= */

  let response: Response;

  try {
    response =
      await fetch(
        destination,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            formBody.toString(),

          /*
           * Google Forms puede
           * responder 302/303.
           */

          redirect:
            "manual",

          signal:
            AbortSignal.timeout(
              10_000,
            ),
        },
      );
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "error de red";

    return NextResponse.json(
      {
        error:
          `No se pudo contactar con Google Forms: ${detail}.`,
      },
      {
        status: 502,
      },
    );
  }

  /* =======================================================
     VALIDAR RESPUESTA GOOGLE
  ======================================================= */

  const esRedireccionExitosa =
    response.status >= 300 &&
    response.status < 400;

  if (
    !response.ok &&
    !esRedireccionExitosa
  ) {
    const responseText =
      await response.text();

    console.error(
      "GOOGLE FORM ERROR",
      {
        status:
          response.status,

        statusText:
          response.statusText,

        url:
          destination.toString(),

        body:
          responseText.slice(
            0,
            3000,
          ),
      },
    );

    return NextResponse.json(
      {
        error:
          `Google Forms rechazó el registro ` +
          `(HTTP ${response.status} ${response.statusText}).`,

        googleResponse:
          process.env.NODE_ENV ===
          "development"
            ? responseText.slice(
                0,
                1000,
              )
            : undefined,
      },
      {
        status: 502,
      },
    );
  }

  /* =======================================================
     OK
  ======================================================= */

  return NextResponse.json({
    enviados: 1,

    registro: {
      nombresApellidos:
        record.nombresApellidos,

      esSintetico:
        true,
    },
  });
}