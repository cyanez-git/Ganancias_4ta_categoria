# Tareas — Implementación Observaciones Ganancias 4ta Cat.

## Observación 1 — Aportes modificables (jubilación, obra social, INSSJP)
- [x] `defaultParams.js`: agregar campos `jubilacionManual`, `obraSocialManual`, `inssjpManual` (null por defecto)
- [x] `calculationEngine.js`: usar campos manuales cuando estén definidos (Paso 3)
- [x] `LiquidacionMensual.jsx`: convertir las filas de aportes en inputs editables con reset al auto

## Observación 2 — Hint: Incremento 22% (Ley 27.743)
- [x] `LiquidacionMensual.jsx`: agregar hint explicativo en la fila del Incremento 22%

## Observación 3 — Hint: Deducciones sobre SAC (17%)
- [x] `LiquidacionMensual.jsx`: agregar hint explicativo en la fila de Deducciones sobre SAC

## Observación 4 — Retención efectiva manual (real sufrida)
- [x] `defaultParams.js`: agregar campo `retencionEfectivaManual` (null por defecto)
- [x] `calculationEngine.js`: usar valor manual si está definido
- [x] `LiquidacionMensual.jsx`: agregar input opcional "Retención real sufrida"

## Observación 5 — Aclarar topes de alquiler (no es un bug real)
- [x] `LiquidacionMensual.jsx`: agregar hints en filas de Alquiler 40% y Alquiler 10%

## Observación 6 — Exportar vista anual a Excel
- [x] Instalar librería `xlsx` (SheetJS)
- [x] Crear `src/engine/excelExporter.js` con función `exportToExcel`
- [x] `Dashboard.jsx`: agregar botón "Exportar Excel"
- [x] `LiquidacionMensual.jsx`: agregar botón "Exportar Excel" en vista anual

## Observación 7 — Borradores (guardar/cargar JSON en UI)
- [x] `Sidebar.jsx`: agregar botones "Guardar borrador" y "Cargar borrador"
- [x] `Sidebar.jsx`: agregar indicador de auto-guardado activo
- [x] `App.jsx`: pasar `exportData` e `importData` al Sidebar
