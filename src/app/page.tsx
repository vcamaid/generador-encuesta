"use client";

import { useMemo, useState } from "react";
import { DistributionEditor } from "@/components/distribution-editor";
import { EditDialog } from "@/components/edit-dialog";
import { buildGoogleFormPayload } from "@/config/google-form";
import {
  CATEGORIAS,
  DISTRIBUCIONES_INICIALES,
  distribucionesValidas,
  generarDataset,
} from "@/services/generator";
import {
  ETIQUETAS_PREGUNTAS,
  PREGUNTAS,
  RESPUESTAS_LIKERT,
  type Distribuciones,
  type RespuestaLikert,
} from "@/types/survey";

const ENABLE_TEST_SUBMISSION =
  process.env.NEXT_PUBLIC_ENABLE_TEST_SUBMISSION === "true";

const categoryLabels = {
  ...Object.fromEntries(CATEGORIAS.ambito.map((value) => [value, value])),
  ...Object.fromEntries(CATEGORIAS.experiencia.map((value) => [value, value])),
  ...Object.fromEntries(
    CATEGORIAS.gradoInstruccion.map((value) => [value, value]),
  ),
  ...Object.fromEntries(CATEGORIAS.sexo.map((value) => [value, value])),
  ...Object.fromEntries(["Si", "No"].map((value) => [value, value])),
  ...Object.fromEntries(
    CATEGORIAS.edad.map((value) => [value, `${value} años`]),
  ),
  ...Object.fromEntries(
    CATEGORIAS.perfilProfesional.map((value) => [value, value]),
  ),
};

function quoteCsv(value: string | number | boolean): string {
  const text = String(value);
  const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function randomDelayMs(minMinutes = 1, maxMinutes = 5) {
  const minutes =
    Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;

  return {
    minutes,
    ms: minutes * 60 * 1000,
  };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function Home() {
  const [cantidad, setCantidad] = useState(10);
  const [semilla, setSemilla] = useState("encuesta-2026");
  const [distribuciones, setDistribuciones] = useState(
    DISTRIBUCIONES_INICIALES,
  );
  const [registros, setRegistros] = useState(() =>
    generarDataset(10, "encuesta-2026", DISTRIBUCIONES_INICIALES),
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  const distributionError = distribucionesValidas(distribuciones);
  const statistics = useMemo(() => {
    const totalAnswers = registros.length * PREGUNTAS.length;
    const counts = Object.fromEntries(
      RESPUESTAS_LIKERT.map((answer) => [answer, 0]),
    ) as Record<RespuestaLikert, number>;
    for (const row of registros) {
      for (const question of PREGUNTAS) counts[row.respuestas[question]] += 1;
    }
    const average =
      totalAnswers === 0
        ? 0
        : registros.reduce(
            (sum, row) =>
              sum +
              PREGUNTAS.reduce(
                (rowSum, question) =>
                  rowSum +
                  RESPUESTAS_LIKERT.indexOf(row.respuestas[question]) +
                  1,
                0,
              ),
            0,
          ) / totalAnswers;
    return { totalAnswers, counts, average };
  }, [registros]);

  const updateDistribution = <K extends keyof Distribuciones>(
    key: K,
    value: keyof Distribuciones[K],
    amount: number,
  ) => {
    setDistribuciones((current) => ({
      ...current,
      [key]: { ...current[key], [value]: Number.isFinite(amount) ? amount : 0 },
    }));
  };

  const regenerate = () => {
  setError("");
  setNotice("");

  try {
    /*
     * Nueva semilla en cada clic.
     *
     * Esto hace que cada dataset sea diferente,
     * aunque mantengamos las mismas distribuciones.
     */
    const nuevaSemilla =
      `encuesta-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    setSemilla(nuevaSemilla);

    setRegistros(
      generarDataset(
        cantidad,
        nuevaSemilla,
        distribuciones,
      ),
    );
  } catch (reason) {
    setError(
      reason instanceof Error
        ? reason.message
        : "No se pudo generar el dataset.",
    );
  }
};

  const exportCsv = () => {
    const fields = [
      "nombresApellidos",
      "sexo",
      "edad",
      "residePeru",
      "gradoInstruccion",
      "experiencia",
      "ambito",
      "perfilProfesional",
      "esSintetico",
      ...PREGUNTAS,
    ];
    const rows = registros.map((row) => [
      row.nombresApellidos,
      row.sexo,
      row.edad,
      row.residePeru,
      row.gradoInstruccion,
      row.experiencia,
      row.ambito,
      row.perfilProfesional,
      row.esSintetico,
      ...PREGUNTAS.map((question) => row.respuestas[question]),
    ]);
    const csv = [
      fields.map(quoteCsv).join(","),
      ...rows.map((row) => row.map(quoteCsv).join(",")),
    ].join("\r\n");
    downloadFile(
      "dataset-sintetico.csv",
      `\uFEFF${csv}`,
      "text/csv;charset=utf-8",
    );
  };

  const copyPayload = async () => {
    try {
      const payload = registros.map((row) => buildGoogleFormPayload(row));
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setNotice("Payload con formato entry.xxxxx copiado.");
      setError("");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo copiar el payload.",
      );
    }
  };

  const sendToTestForm = async () => {
    if (
      !window.confirm(
        `Se enviarán ${registros.length} registros SINTÉTICOS al Google Form de prueba, uno por uno. ¿Deseas continuar?`,
      )
    ) {
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    let enviados = 0;

    try {
      for (let index = 0; index < registros.length; index++) {
        const registro = registros[index];

        /*
         * Espera únicamente para
         * pruebas de procesamiento.
         *
         * El primer registro sale
         * inmediatamente.
         */
        if (index > 0) {
          const delay = randomDelayMs(3, 10);

          setNotice(
            `Enviados ${enviados}/${registros.length}. ` +
              `Siguiente envío en ${delay.minutes} minuto${
                delay.minutes === 1 ? "" : "s"
              }...`,
          );

          await sleep(delay.ms);
        }

        setNotice(
          `Enviando ${index + 1}/${registros.length}: ${registro.nombresApellidos}`,
        );

        const response = await fetch("/api/test-submission", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            registros: [registro],
          }),
        });

        const result = (await response.json()) as {
          enviados?: number;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            result.error ?? `No se pudo enviar el registro ${index + 1}.`,
          );
        }

        enviados += 1;

        setNotice(`Enviados ${enviados}/${registros.length}.`);
      }

      setNotice(`Envío de prueba completado: ${enviados} registros enviados.`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Error desconocido durante el envío.",
      );

      setNotice(
        `Proceso detenido. Se enviaron ${enviados} de ${registros.length} registros.`,
      );
    } finally {
      setSending(false);
    }
  };

  const openEdit = editingIndex === null ? null : registros[editingIndex];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Inicio">
          <span className="brand-icon">D</span>
          <span>
            Dataset <b>Lab</b>
          </span>
        </a>
        <span className="local-badge">
          <span /> GENERADOR LOCAL
        </span>
      </header>

      <div className="workspace">
        <section className="intro">
          <div>
            <span className="eyebrow">HERRAMIENTA DE SIMULACIÓN ACADÉMICA</span>
            <h1>Generador de respuestas</h1>
            <p>
              Construye datasets reproducibles para probar análisis sobre
              regulación sanitaria y distribución de medicamentos.
            </p>
          </div>
          <div className="synthetic-stamp">
            <span>✳</span> DATOS 100% SINTÉTICOS
          </div>
        </section>

        <section className="notice synthetic-notice">
          <span className="notice-mark">i</span>
          <p>
            <b>Solo para pruebas.</b> Los nombres son ficticios, las personas no
            representan participantes reales y estos registros no son respuestas
            auténticas ni evidencia de investigación.
          </p>
        </section>

        {ENABLE_TEST_SUBMISSION && (
          <section className="notice test-mode">
            <span className="notice-mark">!</span>
            <p>
              <b>
                MODO DE PRUEBA — LOS REGISTROS SE ENVIARÁN A UN FORMULARIO DE
                TEST
              </b>
              <br />
              El envío requiere confirmación explícita y la configuración del
              formulario de prueba.
            </p>
          </section>
        )}

        <div className="layout">
          <aside className="sidebar">
            <section className="panel settings-panel">
              <div className="panel-title">
                <span className="step">01</span>
                <div>
                  <h2>Configurar dataset</h2>
                  <p>Define el tamaño y las características</p>
                </div>
              </div>
              <label className="form-field">
                <span>Número de registros</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={cantidad}
                  onChange={(event) => setCantidad(Number(event.target.value))}
                />
                <small>Entre 1 y 500 participantes sintéticos</small>
              </label>
              <label className="form-field">
                <span>Semilla aleatoria</span>
                <input
                  value={semilla}
                  onChange={(event) => setSemilla(event.target.value)}
                  maxLength={100}
                />
                <small>
                  La misma semilla y configuración producen el mismo dataset
                </small>
              </label>
            </section>

            <section className="panel distribution-panel">
              <div className="panel-title">
                <span className="step">02</span>
                <div>
                  <h2>Distribución de perfiles</h2>
                  <p>Cada dimensión debe sumar 100%</p>
                </div>
              </div>
              <div className="distribution-list">
                <DistributionEditor
                  title="Ámbito laboral"
                  distribution={distribuciones.ambito}
                  labels={categoryLabels}
                  onChange={(value, amount) =>
                    updateDistribution("ambito", value, amount)
                  }
                />
                <DistributionEditor
                  title="Experiencia"
                  distribution={distribuciones.experiencia}
                  labels={categoryLabels}
                  onChange={(value, amount) =>
                    updateDistribution("experiencia", value, amount)
                  }
                />
                <DistributionEditor
                  title="Grado de instrucción"
                  distribution={distribuciones.gradoInstruccion}
                  labels={categoryLabels}
                  onChange={(value, amount) =>
                    updateDistribution("gradoInstruccion", value, amount)
                  }
                />
                <DistributionEditor
                  title="Sexo"
                  distribution={distribuciones.sexo}
                  labels={categoryLabels}
                  onChange={(value, amount) =>
                    updateDistribution("sexo", value, amount)
                  }
                />
                <DistributionEditor
                  title="Reside en Perú"
                  distribution={distribuciones.residePeru}
                  labels={categoryLabels}
                  onChange={(value, amount) =>
                    updateDistribution("residePeru", value, amount)
                  }
                />
                <DistributionEditor
                  title="Edad"
                  distribution={distribuciones.edad}
                  labels={categoryLabels}
                  onChange={(value, amount) =>
                    updateDistribution("edad", value, amount)
                  }
                />
                <DistributionEditor
                  title="Perfil profesional"
                  distribution={distribuciones.perfilProfesional}
                  labels={categoryLabels}
                  onChange={(value, amount) =>
                    updateDistribution("perfilProfesional", value, amount)
                  }
                />
              </div>
              <p className="professional-note">
                El perfil profesional es metadato de simulación; no se incluye
                entre las variables del formulario.
              </p>
              <button
                className="button primary generate-button"
                disabled={Boolean(distributionError)}
                onClick={regenerate}
              >
                <span>✳</span> Generar dataset
              </button>
            </section>
          </aside>

          <div className="main-column">
            <section className="panel analysis-panel">
              <div className="panel-title">
                <span className="step">03</span>
                <div>
                  <h2>Modelo de respuestas</h2>
                  <p>Variación coherente para las 18 preguntas</p>
                </div>
              </div>
              <div className="model-description">
                <span className="model-icon">↗</span>
                <p>
                  Cada perfil recibe una <b>percepción latente</b> entre −2 y
                  +2. Esta influye en sus respuestas a todas las preguntas, con
                  variación aleatoria individual.
                </p>
              </div>
              <div className="likert-scale">
                {RESPUESTAS_LIKERT.map((answer, index) => (
                  <span
                    className={`scale-item scale-${index + 1}`}
                    key={answer}
                  >
                    <i />
                    {answer}
                  </span>
                ))}
              </div>
              <p className="distribution-caption">
                Distribución agregada de respuestas ·{" "}
                <b>{statistics.totalAnswers.toLocaleString("es-PE")}</b>{" "}
                respuestas
              </p>
              <div className="response-bars">
                {RESPUESTAS_LIKERT.map((answer, index) => {
                  const count = statistics.counts[answer];
                  const percent = statistics.totalAnswers
                    ? (count / statistics.totalAnswers) * 100
                    : 0;
                  return (
                    <div className="response-bar-row" key={answer}>
                      <span>{answer}</span>
                      <div className="bar-track">
                        <div
                          className={`bar-fill fill-${index + 1}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <b>{percent.toFixed(1)}%</b>
                      <small>{count}</small>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="metrics-grid" aria-label="Estadísticas básicas">
              <article className="metric panel">
                <span>PARTICIPANTES SINTÉTICOS</span>
                <strong>{registros.length}</strong>
                <small>registros generados</small>
              </article>
              <article className="metric panel">
                <span>RESPUESTAS TOTALES</span>
                <strong>
                  {statistics.totalAnswers.toLocaleString("es-PE")}
                </strong>
                <small>18 preguntas por perfil</small>
              </article>
              <article className="metric panel">
                <span>PROMEDIO LIKERT</span>
                <strong>
                  {statistics.average.toFixed(2)}
                  <em> / 5</em>
                </strong>
                <small>escala de desacuerdo a acuerdo</small>
              </article>
            </section>

            <section className="panel table-panel">
              <div className="table-heading">
                <div className="panel-title">
                  <span className="step">04</span>
                  <div>
                    <h2>Vista previa</h2>
                    <p>
                      {registros.length} filas · variables y respuestas Likert
                    </p>
                  </div>
                </div>
                <div className="table-actions">
                  <button
                    className="button secondary compact"
                    onClick={() => {
                      downloadFile(
                        "dataset-sintetico.json",
                        JSON.stringify(
                          { esSintetico: true, semilla, registros },
                          null,
                          2,
                        ),
                        "application/json",
                      );
                    }}
                  >
                    JSON
                  </button>
                  <button
                    className="button secondary compact"
                    onClick={exportCsv}
                  >
                    CSV
                  </button>
                  <button
                    className="button secondary compact"
                    onClick={copyPayload}
                  >
                    Copiar payload
                  </button>
                  {ENABLE_TEST_SUBMISSION && (
                    <button
                      className="button test-submit compact"
                      disabled={sending || registros.length === 0}
                      onClick={sendToTestForm}
                    >
                      {sending ? "Enviando…" : "Enviar a formulario de test"}
                    </button>
                  )}
                </div>
              </div>
              {error && (
                <p className="feedback error" role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p className="feedback success" role="status">
                  {notice}
                </p>
              )}
              {distributionError && (
                <p className="feedback error" role="alert">
                  {distributionError}
                </p>
              )}
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Participante sintético</th>
                      <th>Sexo</th>
                      <th>Edad</th>
                      <th>Reside en Perú</th>
                      <th>Grado</th>
                      <th>Experiencia</th>
                      <th>Ámbito</th>
                      <th>Perfil (simulado)</th>
                      {PREGUNTAS.map((question) => (
                        <th key={question}>{ETIQUETAS_PREGUNTAS[question]}</th>
                      ))}
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((row, index) => (
                      <tr key={`${row.nombresApellidos}-${index}`}>
                        <td>
                          <span className="person-cell">
                            <i>✳</i>
                            {row.nombresApellidos}
                          </span>
                        </td>
                        <td>{row.sexo}</td>
                        <td>{row.edad}</td>
                        <td>{row.residePeru}</td>
                        <td>{row.gradoInstruccion}</td>
                        <td>{row.experiencia}</td>
                        <td>{row.ambito}</td>
                        <td>{row.perfilProfesional}</td>
                        {PREGUNTAS.map((question) => (
                          <td
                            className="answer-cell"
                            key={question}
                            title={row.respuestas[question]}
                          >
                            {RESPUESTAS_LIKERT.indexOf(
                              row.respuestas[question],
                            ) + 1}
                          </td>
                        ))}
                        <td>
                          <div className="row-actions">
                            <button
                              aria-label={`Editar ${row.nombresApellidos}`}
                              onClick={() => setEditingIndex(index)}
                            >
                              Editar
                            </button>
                            <button
                              aria-label={`Eliminar ${row.nombresApellidos}`}
                              onClick={() =>
                                setRegistros((current) =>
                                  current.filter(
                                    (_, rowIndex) => rowIndex !== index,
                                  ),
                                )
                              }
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {registros.length === 0 && (
                      <tr>
                        <td className="empty-cell" colSpan={27}>
                          No hay registros. Genera un dataset para comenzar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span>
                  <b>Nota:</b> 1 = Total desacuerdo · 5 = Total acuerdo
                </span>
                <span className="table-seed">Semilla: {semilla}</span>
              </div>
            </section>
            <footer className="footer-note">
              Dataset de simulación académica · No utilizar como evidencia,
              muestra ni dato de investigación real.
            </footer>
          </div>
        </div>
      </div>
      {openEdit && (
        <EditDialog
          row={openEdit}
          onClose={() => setEditingIndex(null)}
          onSave={(updated) => {
            setRegistros((current) =>
              current.map((row, index) =>
                index === editingIndex ? updated : row,
              ),
            );
            setEditingIndex(null);
          }}
        />
      )}
    </main>
  );
}
