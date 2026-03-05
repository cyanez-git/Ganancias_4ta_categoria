# Tareas — Implementación Observaciones Ganancias 4ta Cat.

*(Las observaciones 1 a 7 de la fase anterior han sido completadas).*

## Observación 8 — Nueva Deducción Especial "Doceava Parte" (Ley 27.743)

- [x] **`defaultParams.js`**:
  - Eliminar parámetro obsoleto `incrementoDeduccionEspecial: 0.22`.
  - Quitar lógica obsoleta sobre "zona desfavorable" 22%.

- [x] **`calculationEngine.js`**:
  - En Paso 6, dejar de calcular el "incremento 22%".
  - Calcular la suma base de deducciones personales: `(MNI + Familia + Especial)`.
  - Calcular la "doceava parte": `suma / 12`.
  - Sumar la doceava parte al total de deducciones personales mensuales y acumulados.
  - Renombrar variable generada en `results` de `dedEspecialIncremento` a `dedEspecialDoceavaParte`.

- [x] **Visibles UI (`LiquidacionMensual.jsx`, `Dashboard.jsx`)**:
  - Renombrar los labels de "Incremento 22%" a "Adicional Doceava Parte (Ley 27.743)".
  - Actualizar el texto explicativo (hint) para reflejar su naturaleza proporcional a los 3 rubros de deducciones personales.

- [x] **Exportaciones (`excelExporter.js`, `pdfReportGenerator.js`)**:
  - Renombrar el encabezado/fila de la exportación de "Incremento 22%" a "Adicional Doceava Parte".
  - Asegurar que impacte correctamente en la suma total del excel/pdf.
