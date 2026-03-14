# Tareas: Solucionar Duplicación de SAC

- [x] Modificar `src/engine/calculationEngine.js` para separar cálculos puros del concepto de SAC Real y Proporcional
- [x] Incorporar `sacRealAcum` y usarlo para reemplazar la doceava de las deducciones acumuladas en los momentos oportunos
- [x] Actualizar campos expuestos por el motor (`gananciaBrutaPuraMes`, `gananciaBrutaPuraAcum`, etc.)
- [x] Actualizar interfaces e hint strings en `src/components/LiquidacionMensual.jsx` y `Dashboard` (si aplica)
- [x] Reestructurar las filas en `src/engine/excelExporter.js` para separar y hacer transparente el Ajuste de SAC (Proporcional vs Real)
- [x] Reestructurar el backend de diseño del PDF de AFIP `src/engine/pdfReportGenerator.js` para reflejar con igual claridad las variables de SAC y Ganancia Bruta Pura
