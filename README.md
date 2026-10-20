# Dataset Lab — generador sintético para encuesta

Aplicación local en Next.js + TypeScript para simular perfiles y respuestas de una encuesta de 7 variables generales y 18 preguntas Likert.

## Iniciar localmente

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Abre <http://localhost:3000>. El envío al formulario está desactivado de forma predeterminada.

## Configuración y uso

- Selecciona de 1 a 500 registros, una semilla reproducible y las distribuciones de ámbito, experiencia, instrucción, sexo, residencia en Perú, edad y perfil profesional. Cada distribución debe sumar 100%.
- El perfil profesional es metadato del simulador; no forma parte de las siete variables de la encuesta ni se envía al formulario.
- La percepción latente individual (−2 a +2) correlaciona las respuestas Likert de cada participante. La semilla junto a la misma configuración reproduce el resultado.
- La tabla permite editar o eliminar registros. JSON y CSV exportan los datos; **Copiar payload** copia la lista de campos `entry.xxxxx` del Google Form.
- Nombres con etiquetas como “Muestra”, “Ficticio” o “Sintético” son marcadores inventados, no identidades verificadas ni personas reclutadas.

Los datos generados son exclusivamente sintéticos: no son respuestas auténticas, no deben presentarse como datos fehacientes ni utilizarse como evidencia, muestra o resultado de investigación.

## Google Forms — solo formulario de prueba

1. Crea un Google Form separado para pruebas y toma su URL pública, por ejemplo `https://docs.google.com/forms/d/e/FORM_ID/viewform`.
2. En `src/config/google-form.ts`, sustituye los 25 valores de `GOOGLE_FORM_ENTRY_IDS` con los IDs `entry.xxxxx` de las siete variables y las 18 preguntas. Los IDs de ejemplo son inválidos y el servidor rechazará el envío mientras no se reemplacen.
3. En `.env.local`, habilita de forma explícita:

   ```dotenv
   NEXT_PUBLIC_ENABLE_TEST_SUBMISSION=true
   GOOGLE_TEST_FORM_URL=https://docs.google.com/forms/d/e/FORM_ID/viewform
   ```

4. Reinicia el servidor de desarrollo para que cargue el entorno. En producción, `NEXT_PUBLIC_ENABLE_TEST_SUBMISSION` se incorpora al bundle al compilar; define la bandera antes de ejecutar `npm run build`. La interfaz mostrará **MODO DE PRUEBA — LOS REGISTROS SE ENVIARÁN A UN FORMULARIO DE TEST** y pedirá confirmar cada lote. El servidor también verifica la bandera, la URL HTTPS de Google Forms, los IDs configurados y que todos los registros estén marcados como sintéticos.

La bandera `NEXT_PUBLIC_ENABLE_TEST_SUBMISSION` habilita el botón en la interfaz; el envío solo funciona si el servidor también la recibe como `"true"`. Mantén ambos valores en `false` o ausentes salvo durante pruebas deliberadas y apunta únicamente a un formulario de test. El navegador enviará al backend local y el backend hará las solicitudes a Google Forms.

## Validación

```powershell
npm run lint
npm run build
```
