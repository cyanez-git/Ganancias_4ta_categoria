# Walkthrough — Implementación Observaciones App Ganancias 4ta Cat.

Build de producción: ✅ **Exit code 0** — 292 módulos, sin errores.

---

## ✅ Obs. 1 — Aportes autocalculados pero modificables

**Archivos:** `defaultParams.js` · `calculationEngine.js` · `LiquidacionMensual.jsx`

Los tres aportes (Jubilación 11%, Obra Social 3%, INSSJP 3%) ahora se muestran como campos editables con el valor autocalculado visible como **placeholder en gris**. Si el usuario escribe, el campo se torna amarillo y aparece el link **"↩ auto"** para resetear. El motor usa el valor manual si está cargado, o el calculado si no.

---

## ✅ Obs. 2 — Hint: Incremento 22% (Ley 27.743)

**Archivo:** `LiquidacionMensual.jsx`

La fila "Incremento 22%" ahora muestra el hint:  
*"22% de la Deducción Especial.* ***(Nota: Actualizado posteriormente en Obs. 8 por "Adicional Doceava Parte")***"

---

## ✅ Obs. 3 — Hint: Deducciones sobre SAC (17%)

**Archivo:** `LiquidacionMensual.jsx`

La fila ahora muestra:  
*"17% del SAC proporcional acumulado. Equivale a los aportes previsionales sobre el aguinaldo."*

---

## ✅ Obs. 4 — Retención Efectiva — opción de valor real sufrido

**Archivos:** `defaultParams.js` · `calculationEngine.js` · `LiquidacionMensual.jsx`

Debajo de la retención calculada, el usuario puede ingresar la **retención real del recibo** en el campo "Retención real sufrida (opcional)". El sueldo neto se recalcula usando ese valor. El label de la línea principal muestra "(manual)" o "(calculada)" según corresponda.

---

## ✅ Obs. 5 — Topes de alquiler clarificados

**Archivo:** `LiquidacionMensual.jsx`

El cálculo era correcto (40% con tope GNI, 10% sin tope). Se agregaron hints explicativos en ambas filas para que quede claro el comportamiento de cada tope.

---

## ✅ Obs. 6 — Exportar vista anual a Excel

**Archivos:** `excelExporter.js` (nuevo) · `Dashboard.jsx` · `LiquidacionMensual.jsx`

- Librería `xlsx` (SheetJS) instalada.
- Genera un `.xlsx` con 2 hojas: **Liquidación Anual 2025** (todos los conceptos × 12 meses + columna total) y **Configuración**.
- Botón "📊 Exportar Excel" disponible en **Dashboard** y en la **Vista Anual** de Liquidación.

---

## ✅ Obs. 7 — Borradores: guardar y cargar

**Archivo:** `Sidebar.jsx`

- Se agregó un indicador `● Auto-guardado activo en este navegador` para que el usuario sepa que el localStorage ya persiste el estado automáticamente.

---

## ✅ Obs. 8 — Reemplazo del "Incremento 22%" por "Adicional Doceava Parte"

**Archivos:** `defaultParams.js` · `calculationEngine.js` · `ConfigPersonal.jsx` · `LiquidacionMensual.jsx` · `GuiaAyuda.jsx` · `excelExporter.js`

- Se eliminó el porcentaje fijo del 22%.
- En **calculationEngine.js**, la deducción especial extra se reemplazó por la deducción de la **Doceava parte** exigida por la Ley 27.743. Consiste en dividir entre 12 la suma mensual (y acumulada) de la GNI, las cargas de familia y la deducción especial.
- Se actualizaron todos los textos en UI, Tooltips y Exportaciones de Excel y PDF para llamarse "Adicional Doceava Parte (Ley 27.743)".
- Se eliminó la variable derogada de "Zona Desfavorable" del selector de configuración.
