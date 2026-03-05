# Plan de Implementación — Corrección Deducción Especial "Doceava Parte" (Ley 27.743)

## Objetivo
Reemplazar el cálculo obsoleto del "Incremento 22% por zona patagónica" (derogado) por la nueva "Deducción especial de la doceava parte" (Ley 27.743, art. 30 inc. c) ap. 2). Esta nueva deducción aplica a empleados en relación de dependencia y consiste en adicionar un monto equivalente a la 12va parte de la suma de sus deducciones personales (MNI + Cargas de Familia + Deducción Especial Base).

---

## 🏗️ Propuesta de Cambios

### 1. Modificación de Parámetros (`defaultParams.js`)

**Actual:** Existe un porcentaje fijo llamado `incrementoDeduccionEspecial: 0.22`. Y un toggle obsoleto `deduccionEspecialZonaDesfavorable`.

**Nuevo Enfoque:**
- Mantendremos `incrementoDeduccionEspecial` pero su significado cambia: ahora será la **fracción de la doceava parte** (ej. `1/12` aprox `0.08333...`).
- Lo ideal para evitar errores de redondeo es eliminar el coeficiente del 22% y dividir directamente por 12 en el motor de cálculo.
- Eliminaremos del `defaultParams.js` la constante literal `0.22` para no confundir.

### 2. Modificación del Motor (`calculationEngine.js`)

**Actual:** (líneas 162 y 178)
```javascript
const dedEspecialIncremento = dedEspecial * params.incrementoDeduccionEspecial;
```
Calcula un extra aplicando el porcentaje **solo sobre la deducción especial**.

**Nuevo Enfoque:**
La nueva ley indica que la doceava parte se calcula sobre **la suma de las tres deducciones personales**.

Para el cálculo del mes (`deduccionesPersonales` del mes $m$):
```javascript
const subtotalPersonalesMensual = mni + dedConyuge + dedHijos + dedHijosIncap + dedEspecial;
const dedEspecialDoceavaParte = subtotalPersonalesMensual / 12;
const totalDeduccionesPersonales = subtotalPersonalesMensual + dedEspecialDoceavaParte;
```

Para el cálculo **acumulado** (que es fundamental para la retención acumulada, línea 170+):
```javascript
const pSubtotal = pMni + pConyuge + pHijos + pHijosIncap + pEspecial;
const pDoceavaParte = pSubtotal / 12;
deduccionesPersonalesAcum += pSubtotal + pDoceavaParte;
```

**Condición:** Esta doceava parte aplica *siempre* para la renta `art82c` (relación de dependencia / jubilaciones), ya que es inherente al "apartado 2". En nuestra app, el config asume trabajadores en relación de dependencia, por lo que aplicará a las deducciones de todos ellos.

### 3. Modificación de la UI (`LiquidacionMensual.jsx` y `Dashboard.jsx`)

**Actual:** Existe la fila `Incremento 22% (Ley 27.743)`.

**Nuevo Enfoque:**
- Renombrar en JS y UI cualquier referencia de `Incremento 22%` a `Adicional doceava parte`.
- Actualizar el label a: **"Deducción Doceava Parte (Ley 27.743)"**.
- Actualizar el *hint* (hecho en el commit anterior) para que diga: *"Equivale a 1/12 de la suma de MNI, Cargas de Familia y Deducción Especial."*
- Actualizar la exportación a Excel (`excelExporter.js`) y `Dashboard` (tabla de resumen) para reflejar el nuevo nombre.

---

## 📋 Archivos Afectados

| Archivo | Cambio requerido |
|---|---|
| `src/engine/defaultParams.js` | Quitar `incrementoDeduccionEspecial: 0.22`. |
| `src/engine/calculationEngine.js` | Cambiar lógica matemática en PASO 6. Sumar `(MNI + Familia + Especial) / 12`. Reemplazar las variables de salida `dedEspecialIncremento` por `dedEspecialDoceavaParte`. |
| `src/components/LiquidacionMensual.jsx` | Renombrar fila de UI en pantalla Mensual y Anual. |
| `src/components/Dashboard.jsx` | Renombrar fila en la tabla Resumen Liquidación Anual. |
| `src/engine/excelExporter.js` | Renombrar fila en la exportación Excel. |
| `src/engine/pdfReportGenerator.js` | Renombrar fila en la generación de PDF. |

---

## 🙋‍♂️ Requiere Aprobación

Por favor, confirma si el enfoque propuesto (dividir directamente la suma de las tres deducciones por 12 en el código) es correcto para avanzar con la implementación.
