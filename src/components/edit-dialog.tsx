"use client";

import { useState } from "react";
import { CATEGORIAS } from "@/services/generator";
import {
  ETIQUETAS_PREGUNTAS,
  PREGUNTAS,
  RESPUESTAS_LIKERT,
  type PreguntaId,
  type RespuestaEncuesta,
  type RespuestaLikert,
} from "@/types/survey";

export function EditDialog({
  row,
  onSave,
  onClose,
}: {
  row: RespuestaEncuesta;
  onSave: (updated: RespuestaEncuesta) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(row);
  const setField = <K extends keyof RespuestaEncuesta>(
    key: K,
    value: RespuestaEncuesta[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const setAnswer = (question: PreguntaId, value: RespuestaLikert) => {
    setDraft((current) => ({
      ...current,
      respuestas: { ...current.respuestas, [question]: value },
    }));
  };
  const validName =
    draft.nombresApellidos.trim().length > 0 &&
    draft.nombresApellidos.trim().length <= 100;
  const validAge = Number.isInteger(draft.edad) && draft.edad >= 18 && draft.edad <= 100;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="edit-title"
        aria-modal="true"
        className="edit-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">REGISTRO SINTÉTICO</span>
            <h2 id="edit-title">Editar participante</h2>
          </div>
          <button aria-label="Cerrar" className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="edit-grid">
          <label className="form-field">
            <span>Nombres y apellidos ficticios</span>
            <input
              maxLength={100}
              value={draft.nombresApellidos}
              onChange={(event) => setField("nombresApellidos", event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Sexo</span>
            <select
              value={draft.sexo}
              onChange={(event) => setField("sexo", event.target.value as RespuestaEncuesta["sexo"])}
            >
              {CATEGORIAS.sexo.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Edad</span>
            <input
              type="number"
              min="18"
              max="100"
              value={draft.edad}
              onChange={(event) => setField("edad", Number(event.target.value))}
            />
          </label>
          <label className="form-field">
            <span>Reside en Perú</span>
            <select
              value={draft.residePeru}
              onChange={(event) => setField("residePeru", event.target.value as RespuestaEncuesta["residePeru"])}
            >
              <option>Si</option><option>No</option>
            </select>
          </label>
          <label className="form-field">
            <span>Grado de instrucción</span>
            <select
              value={draft.gradoInstruccion}
              onChange={(event) => setField("gradoInstruccion", event.target.value as RespuestaEncuesta["gradoInstruccion"])}
            >
              {CATEGORIAS.gradoInstruccion.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Experiencia</span>
            <select
              value={draft.experiencia}
              onChange={(event) => setField("experiencia", event.target.value as RespuestaEncuesta["experiencia"])}
            >
              {CATEGORIAS.experiencia.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Ámbito laboral</span>
            <select
              value={draft.ambito}
              onChange={(event) => setField("ambito", event.target.value as RespuestaEncuesta["ambito"])}
            >
              {CATEGORIAS.ambito.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Perfil profesional (simulado)</span>
            <select
              value={draft.perfilProfesional}
              onChange={(event) => setField("perfilProfesional", event.target.value as RespuestaEncuesta["perfilProfesional"])}
            >
              {CATEGORIAS.perfilProfesional.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        {!validName && <p className="feedback error">Ingresa un nombre ficticio de 1 a 100 caracteres.</p>}
        {!validAge && <p className="feedback error">La edad debe ser un entero entre 18 y 100.</p>}
        <h3 className="question-heading">Respuestas Likert</h3>
        <div className="answers-grid">
          {PREGUNTAS.map((question) => (
            <label className="form-field" key={question}>
              <span>{ETIQUETAS_PREGUNTAS[question]}</span>
              <select
                value={draft.respuestas[question]}
                onChange={(event) => setAnswer(question, event.target.value as RespuestaLikert)}
              >
                {RESPUESTAS_LIKERT.map((answer) => <option key={answer}>{answer}</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="dialog-actions">
          <button className="button secondary" onClick={onClose}>Cancelar</button>
          <button
            className="button primary"
            disabled={!validName || !validAge}
            onClick={() => onSave({ ...draft, nombresApellidos: draft.nombresApellidos.trim() })}
          >
            Guardar cambios
          </button>
        </div>
      </section>
    </div>
  );
}
