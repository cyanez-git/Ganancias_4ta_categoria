# Corrección: Retenciones Negativas (Devoluciones) y Signo de Reintegros

**Fecha:** 2026-04-07  
**Archivos modificados:**
- `src/engine/calculationEngine.js`
- `src/components/LiquidacionMensual.jsx`

---

## Problema Detectado

### 1. Retención del mes nunca podía ser negativa

El cálculo de la retención mensual usaba `Math.max(..., 0)`, lo que impedía que el sistema generara devoluciones cuando el impuesto determinado acumulado bajaba respecto a meses anteriores:

```javascript
// ANTES (incorrecto)
const retencionDelMes = Math.max(
    impuestoDeterminado - data.pagosACuenta - retencionesAnteriores + data.retencionesReintegradas,
    0  // ← Impedía devoluciones
);
```

**Ejemplo del problema:**

| Mes | Imp. Determinado Acum | Ret. Anteriores | Retención del Mes (antes) | Correcto |
|-----|----------------------|----------------|--------------------------|----------|
| Ene | 100.000 | 0 | 100.000 | 100.000 |
| Feb | 180.000 | 100.000 | 80.000 | 80.000 |
| Mar | 200.000 | 180.000 | 20.000 | 20.000 |
| Abr | 150.000 | 200.000 | **0** ← mal | **-50.000** (devolución) |

Según la RG 4003 de AFIP, el empleador actúa como agente de retención y **debe ajustar mensualmente**. Si retuvo de más en meses anteriores, debe devolver la diferencia.

### 2. Signo invertido en retenciones reintegradas

En la acumulación de retenciones anteriores, las `retencionesReintegradas` (montos devueltos al empleado) se **sumaban** cuando deberían **restarse**:

```javascript
// ANTES (incorrecto)
retencionesAnteriores += results[p].data.retencionesReintegradas; // sumaba

// Expandido: 
// retencionesAnteriores = Σ retenciones + Σ reintegros ← MAL
// Debería ser: Σ retenciones - Σ reintegros
```

### 3. Tope 35% aplicaba a devoluciones

El tope del 35% del sueldo neto se aplicaba siempre, incluso en devoluciones, lo cual no tiene sentido (el tope solo limita cuánto puede retener el empleador, no cuánto debe devolver).

---

## Solución Implementada

### calculationEngine.js

```javascript
// 1. Signo corregido para reintegros
let retencionesAnteriores = 0;
for (let p = 0; p < m; p++) {
    retencionesAnteriores += results[p].retencionEfectiva;
    retencionesAnteriores -= results[p].data.retencionesReintegradas; // ← RESTAR
}

// 2. Sin Math.max → permite negativos (devoluciones)
const retencionDelMes =
    impuestoDeterminado - data.pagosACuenta - retencionesAnteriores + data.retencionesReintegradas;

// 3. Tope 35% solo para retenciones positivas
const retencionEfectivaCalculada = retencionDelMes > 0
    ? Math.min(retencionDelMes, tope35)
    : retencionDelMes; // devolución completa, sin tope

// 4. Diferencia no retenida solo cuando hay retención positiva
const diferenciaNoRetenida = retencionDelMes > 0
    ? retencionDelMes - retencionEfectivaCalculada
    : 0;
```

### LiquidacionMensual.jsx — UI

- **Retención del Mes**: Si es negativa, muestra "💚 Devolución del Mes" con hint explicativo.
- **Retención Efectiva**: Si es negativa, muestra "💚 DEVOLUCIÓN (calculada)".
- **Tope 35%**: Se oculta cuando hay devolución (no aplica).
- **Color**: Las devoluciones se muestran en **verde** (clase `positive`) en vez de rojo, ya que son favorables para el empleado. Se agregó prop `isRefund` al componente `CalcField`.

---

## Fórmula Final

```
Retención Neta del Mes = Impuesto Determinado Acumulado
                         - Pagos a Cuenta
                         - Σ(Retenciones Efectivas anteriores)
                         + Σ(Reintegros anteriores)
                         + Reintegros del mes actual

Si > 0 → Retención (con tope 35% del sueldo neto)
Si < 0 → Devolución (sin tope, se devuelve íntegramente)
```

---

## Impacto

- **Sin datos de reintegros**: El cambio de signo no tiene impacto si `retencionesReintegradas` es siempre 0 (caso más común).
- **Con variación de impuesto determinado**: Ahora el sistema genera correctamente devoluciones cuando el impuesto acumulado baja (por ejemplo, al cambiar de semestre con nuevos parámetros de deducciones, o al incorporar deducciones retroactivas).
- **Sueldo neto**: El sueldo neto final (`ingresoBolsillo + pluriempleoBolsillo - totalDescuentos - retencionEfectiva`) ahora puede **aumentar** en meses con devolución, ya que `retencionEfectiva` puede ser negativa.
