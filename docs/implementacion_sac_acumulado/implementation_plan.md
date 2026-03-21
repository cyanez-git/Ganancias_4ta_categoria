# Plan de Corrección: Cálculo del SAC Acumulado

## Descripción del Problema
He analizado el archivo Excel (`ganancias-4ta-cat-2025-2026-03-20_DR_Ver17_03_26.xlsx`) y comparado con la lógica en `src/engine/calculationEngine.js`. El problema ocurre por cómo se calcula el **SAC Proporcional Acumulado** para los meses del segundo semestre (Julio en adelante).

Actualmente, el motor calcula la provisión del SAC acumulada así:
`sacProporcionalAcum = gananciaBrutaPuraAcum / 12; // (Total del año / 12)`
Y luego toma el mayor valor entre el `sacProporcionalAcum` y el `sacRealAcum`.

**¿Qué causa el error?**
En Julio o Agosto, la variable `gananciaBrutaPuraAcum` incluye todas las remuneraciones desde Enero. Al dividirlas por 12, estamos calculando de nuevo una provisión sobre el primer semestre. Sin embargo, **el SAC del primer semestre ya se pagó y se volvió definitivo en Junio**.
En los primeros meses del segundo semestre (Jul, Ago), esta provisión re-calculada es inferior al SAC real ya abonado, pero hacia Septiembre/Octubre, el falso `sacProporcionalAcum` (que usa la suma de 9 o 10 meses) supera al `sacRealAcum` y el sistema lo empieza a usar, elevando incorrectamente la base imponible del empleado y generando retenciones indebidas.

## User Review Required
> [!IMPORTANT]  
> Esta modificación separará definitivamente el cómputo del SAC en **dos semestres**, alineándose con la RG de AFIP para el cálculo de la doceava parte y el ajuste de Junio/Diciembre. Confirmá si estás de acuerdo con aislar el semestre 1 de la suma proporcional del semestre 2.

## Proposed Changes

### Motor de Cálculo

#### [MODIFY] src/engine/calculationEngine.js
- Se modificará el **PASO 4** donde se calcula el SAC Acumulado.
- **Antes:** Se sacaba `gananciaBrutaPuraAcum / 12`.
- **Nuevo enfoque (por Semestres):**
  - **Enero a Mayo:** Se toma el mayor entre 1/12 acumulado o el SAC real cobrado.
  - **Junio (Mes 6):** Cierre del 1er semestre. Se computa exactamente el SAC Real pagado en el semestre como definitivo (para que las doceavas queden ajustadas matemáticamente).
  - **Julio a Noviembre:** La base acumulada será el `SAC Real del 1er Semestre Definitivo` **más** la provisión del 2do Semestre (`(gananciasBrutasMes 7 al actual) / 12`).
  - **Diciembre (Mes 12):** Cierre final. Se toma el `SAC Real Total` pagado en el año como definitivo.

El código modificado inyectará la variable `sacComputableAcum` y la asignará a `topeSACParaCalculos` y `sacProporcionalAcum`, garantizando que todas las proyecciones visuales e impositivas sean 100% correctas sin impactar el esquema actual.

**Corrección Adicional Crítica descubierta:**
La variable de deducciones (`deduccionesTotalesAcum`) no se estaba ajustando correctamente. El sistema calcula la deducción del 17% sobre el SAC (Jubilación, Obra Social, INSSJP). Actualmente ese descuento es una suma de los proporcionales mensuales (`sacProporcionalMensual * 0.17`).
Para asegurar el ajuste automático perfecto, **se separará esta deducción de la sumatoria rígida**, de modo que en el acumulado anual tome como valor `sacComputableAcum * 0.17`. Así, cuando el SAC salta al valor real en Junio/Diciembre, las *Deducciones Generales Acumuladas* también saltarán para aplicarle el 17% a ese SAC real abonado.

### Ajuste de Retención Acumulada (SAC Real vs. Proyectado)
El ajuste normativo de la retención al abonar el SAC concreto (en Junio o Diciembre) se producirá de forma automática y transparente debido a la naturaleza **acumulativa** del impuesto:
1. En **Junio** (o Diciembre), la variable `sacComputableAcum` descartará todo lo proyectado y se igualará **exactamente** al SAC Real abonado en el semestre.
2. Esto provocará que la **Ganancia Neta Sujeta a Impuesto** acumulada del año corrija cualquier pequeña desviación que se haya venido arrastrando con los 1/12 previos.
3. El **Impuesto Determinado** (acumulado) será 100% exacto para el semestre.
4. Como la *Retención del Mes* surge de restarle a ese Impuesto Determinado exacto las *Retenciones Anteriores* (Ene-May), la liquidación de Junio absorberá el impacto:
   - Si se proyectó de más, la retención de Junio bajará (o será nula/a devolver).
   - Si se proyectó de menos, la retención de Junio subirá para compensar el saldo del SAC de forma unificada.
Por lo tanto, al corregir la base gravable acumulada del SAC en el Paso 4, los pasos 11 (Impuesto) y 15 (Retención) no requieren cambios adicionales para cumplir con el ajuste normativo.

## Verification Plan

### Testeo Manual
1. Ejecutar el código actualizado.
2. Ingresar los datos de ganancias brutas idénticos a los del Excel de ejemplo (Julio, Agosto, Sept...).
3. Corroborar en la interfaz y en el exportable Excel que el `Adicional Doceava Parte` a partir de Julio sea estrictamente proporcional a la remuneración del segundo semestre, y no al total anual.
4. Validar que la Ganancia Neta y la Retención Efectiva de los meses de Septiembre/Octubre ya no sufran saltos atípicos producto del falso acumulado anual.
