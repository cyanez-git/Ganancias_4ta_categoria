# Plan de Implementación — Observaciones de la App Ganancias 4ta Categoría

A continuación se describe cada observación identificada en la imagen y los cambios propuestos para cada una. **Sin código ejecutado todavía — esperando aprobación.**

---

## Observaciones Identificadas

### 1. 📝 Aportes (Jubilación, Obra Social, INSSJP) — Autocalculados pero modificables

**Situación actual**: `calculationEngine.js` calcula `jubilacion`, `obraSocial` e `inssjp` siempre como `baseDescuentos × %`. Son valores solo de lectura en la UI (`LiquidacionMensual.jsx`).

**Observación del usuario**: Quiere que estén autocalculados pero que se puedan **sobreescribir manualmente** (por ej. cuando hay diferencias con el recibo real).

**Cambio propuesto**:
- En `defaultParams.js` (`createEmptyMonthData`): agregar campos `jubilacionManual`, `obraSocialManual`, `inssjpManual` (por defecto `null` = usa el calculado).
- En `calculationEngine.js` (Paso 3): si el campo manual está en `null` o vacío, usa el calculado; si tiene valor, usa el manual.
- En `LiquidacionMensual.jsx`: en la sección "Descuentos Obligatorios", mostrar los tres campos como editables con un placeholder que muestre el valor calculado (en gris) y un botón/ícono de "reset" para volver al auto.

---

### 2. ❓ Incremento 22% (Ley 27.743) — Aclarar cómo se calcula

**Situación actual**: En `defaultParams.js`, el incremento está definido como `incrementoDeduccionEspecial: 0.22`. En `calculationEngine.js` se calcula como `dedEspecial * 0.22`. En la UI se muestra la fila "Incremento 22% (Ley 27.743)" con el monto resultante.

**Observación del usuario**: Pregunta cómo se calcula. El texto en la imagen menciona que la **zona patagónica ya no está vigente** y que el incremento equivale a "la doceava parte de las deducciones personales desde abril de 2024". Quiere una aclaración en la UI.

**Cambio propuesto**:
- En `LiquidacionMensual.jsx`: agregar un tooltip o texto explicativo (`hint`) en la fila "Incremento 22% (Ley 27.743)" que diga: *"Equivalente al 22% de la Deducción Especial. Reemplazó el adicional por zona patagónica desde abril 2024 (Ley 27.743)."*
- No requiere cambio en la lógica de cálculo, solo en la presentación.
- Si el modo "Zona Desfavorable" está seleccionado, aclarar que **NO está vigente para 2° semestre 2025** (ya está en `defaultParams.js` con valor 0 y en `ConfigPersonal.jsx` hay una advertencia ⚠️ — solo mejorar el mensaje).

---

### 3. ❓ Deducciones sobre SAC (17%) — Aclarar cómo se calcula

**Situación actual**: En `calculationEngine.js` se calcula como `sacProporcional * 0.17`. Se muestra en la UI en la sección Deducciones Generales.

**Observación del usuario**: Pregunta cómo se calcula.

**Cambio propuesto**:
- En `LiquidacionMensual.jsx`: agregar un `hint` en la fila "Deducciones sobre SAC (17%)" con el texto: *"17% del SAC proporcional acumulado. Equivalente a los aportes previsionales sobre el aguinaldo."*

---

### 4. 🔧 Retención Efectiva — Opción de ingresar el monto real sufrido

**Situación actual**: `retencionEfectiva` es siempre calculado (`min(retencionDelMes, tope35)`). No hay campo de entrada manual.

**Observación del usuario**: Quiere poder ingresar la **retención realmente sufrida** según el recibo (para casos donde el empleador retuvo un monto diferente al calculado).

**Cambio propuesto**:
- En `defaultParams.js` (`createEmptyMonthData`): agregar campo `retencionEfectivaManual` (por defecto `null`).
- En `calculationEngine.js` (al calcular `retencionEfectiva`): si `retencionEfectivaManual` tiene valor, usarlo; sino, usar el calculado.
- En `LiquidacionMensual.jsx`: en la sección "Impuesto y Retención", agregar un campo de input opcional debajo del `retencionEfectiva` calculado, con label *"Retención real sufrida (opcional)"*.

---

### 5. 🐛 Bug: Topes de alquiler invertidos

**Situación actual** en `calculationEngine.js` (líneas 112-113):
```js
const alquiler40 = Math.min(data.alquilerPagado * 0.4, dedPersonales.gananciaNoImponible); // ← tope = GNI
const alquiler10 = data.alquilerPagado * 0.1; // ← sin tope
```

**Observación del usuario**: *"El cálculo de los topes de alquiler están invertidos parece."*

**Análisis**: Según la normativa:
- **40% (Art. 81 inc. c)**: el deducible es el 40% del alquiler, con tope en la **Ganancia No Imponible (GNI)** del período. ✅ Esto es correcto.
- **10% (Ley 27.737, desde 2024)**: el deducible es el 10% adicional del alquiler pagado, **sin tope explícito**. ✅ Esto también es correcto.

> [!NOTE]
> La confusión visual en la screenshot viene de que `alquiler40` (con tope GNI = $326.355,70) queda como $326.355,70, mientras que `alquiler10` (sin tope) resulta en $1.148.907,31 — número mayor, lo que se ve "invertido". 
>
> El cálculo **técnicamente es correcto** según la ley. El problema es de **presentación**: el usuario ingresó un alquiler pagado de ~$11.489.073 (mensual total enorme). Al mostrar ambas filas, el 10% ($1.148.907) parece ser más que el 40% ($326.355) incorrecto pero es por el tope.

**Cambio propuesto**:
- En `LiquidacionMensual.jsx`: agregar un `hint` a la fila "Alquiler deducible 40%" que aclare: *"40% del alquiler pagado, con tope en la GNI del período ($326.355,70). El excedente no es transferible."*
- Agregar `hint` a "Alquiler deducible 10% (Ley 27.737)": *"10% adicional sin tope —Ley 27.737—."*
- El cálculo en sí no cambia (es correcto).

---

### 6. 📊 Exportar Vista Anual a Excel

**Situación actual**: No existe función de exportación a Excel. Solo existe `exportData()` en `useAppState.js` que genera un JSON con los datos de entrada.

**Observación del usuario**: Quiere poder **exportar la vista anual a Excel** (la tabla del péquete completo con los 12 meses).

**Cambio propuesto**:
- Instalar la librería `xlsx` (SheetJS, ampliamente usada, licencia Apache).
- Crear una función `exportToExcel(results, config, params)` en un nuevo archivo `src/engine/excelExporter.js`.
- La función generará un libro con al menos una hoja: *"Liquidación Anual 2025"* con todas las filas de la `AnnualView` (los mismos conceptos que ya se muestran en la tabla anual de `LiquidacionMensual.jsx`).
- En `Dashboard.jsx`: agregar un botón "📊 Exportar Excel" junto al botón de PDF.
- En `LiquidacionMensual.jsx` (vista anual): agregar el mismo botón de exportar Excel.

---

### 7. 💾 Borradores — Guardar y retomar trabajo (Import/Export JSON mejorado)

**Situación actual**: Ya existe `exportData()` e `importData()` en `useAppState.js` y son funcionales. Pero **no están expuestos en la UI** de manera visible/amigable.

**Observación del usuario**: *"Posibilidad de generar un exportable que en caso de querer continuar trabajando sobre un mismo borrador permita importarlo y retomar. Lo ideal sería poder guardar un borrador para continuar luego."* También agrega que no sabe si el tema de hardware (localStorage ya persiste igual).

> [!NOTE]
> Ya existe **auto-guardado en localStorage** — el estado se persiste automáticamente en el navegador. Esto cubre el caso "hardware puro" (mismo navegador, misma PC).
>
> Lo que falta es la **exportación explícita** para poder compartir entre computadoras o hacer backups manuales.

**Cambio propuesto**:
- En `Sidebar.jsx` o en un nuevo panel dedicado: agregar dos botones visibles:
  - **"💾 Guardar borrador"** → llama a `exportData()` (ya implementado) y descarga el `.json`.
  - **"📂 Cargar borrador"** → abre un `<input type="file">` que lee el JSON y llama a `importData()`.
- Agregar un pequeño indicador visual de "✅ Auto-guardado" en el sidebar para que el usuario sepa que el localStorage ya guarda automáticamente.
- El formato de exportación/importación es el JSON que ya existe, no cambia la estructura.

---

## Archivos Afectados

| Archivo | Cambios |
|---|---|
| `src/engine/defaultParams.js` | Agregar campos manuales: `jubilacionManual`, `obraSocialManual`, `inssjpManual`, `retencionEfectivaManual` |
| `src/engine/calculationEngine.js` | Usar campos manuales cuando están definidos (Paso 3 y Paso 15) |
| `src/engine/excelExporter.js` | **[NEW]** Función `exportToExcel` con SheetJS |
| `src/components/LiquidacionMensual.jsx` | Campos editables para aportes, hints de alquiler/SAC/incremento, botón exportar Excel en vista anual |
| `src/components/Dashboard.jsx` | Botón "Exportar Excel" |
| `src/components/Sidebar.jsx` | Botones "Guardar borrador" / "Cargar borrador" + indicador auto-guardado |
| `package.json` | Instalar `xlsx` (SheetJS) |

---

## Verificación

Como la app es una SPA local (Vite/React), no hay tests unitarios actualmente. La verificación será **manual en el navegador**:

1. **Aportes modificables**: En Liquidación Mensual → Descuentos, cambiar jubilación manualmente → verificar que el total cambia. Borrar el valor → verificar que vuelve al autocalculado.
2. **Hints**: Verificar que los tooltips/textos aparecen en Incremento 22%, Deducciones sobre SAC y filas de Alquiler.
3. **Retención manual**: Ingresar un valor en "Retención real sufrida" y verificar que el Sueldo Neto se recalcula.
4. **Exportar Excel**: Clic en "Exportar Excel" → se descarga un `.xlsx` → abrir en Excel/LibreOffice y verificar que tiene las 12 columnas de meses con todos los conceptos.
5. **Borradores**: Clic en "Guardar borrador" → descarga JSON. Modificar datos. Clic en "Cargar borrador" → seleccionar el JSON → verificar que los datos vuelven al estado guardado.
