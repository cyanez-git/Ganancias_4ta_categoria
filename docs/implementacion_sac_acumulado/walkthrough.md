# Reporte de Ejecución: Ajuste Normativo del SAC 

## Cambios Implementados
La mecánica de arrastre de la doceava parte del SAC se reestructuró en `src/engine/calculationEngine.js` para respetar estrictamente los cortes semestrales dictados por AFIP para las liquidaciones de Junio y Diciembre.

1. **SAC Computable Acumulable (Paso 4):**
   - **Enero a Mayo:** Se acumula la proyección provisoria de 1/12 normal mensual.
   - **En Junio:** El SAC computable se convierte **fiel y exactamente** en el SAC Real cobrado durante el semestre, cerrando el acumulado del primer semestre.
   - **Julio a Noviembre:** Se arrastra el SAC Real definitivo del 1er semestre y se le empieza a sumar la nueva proyección de 1/12, pero basándose **únicamente** en los salarios de julio en adelante.
   - **En Diciembre:** Se iguala la acumulación tomando el SAC Real Total abonado en el año.

2. **Deducciones Acumuladas Asociadas (17% del SAC):**
   - *El bug crítico detectado:* Inicialmente, la deducción del 17% (Jubilación, INSSJP, Obra Social) sumaba ciegamente las provisiones mensuales iniciales.
   - *Corrección:* Ahora, ese 17% se extrae dinámicamente multiplicando `sacComputableAcum * 0.17`. Al volverse exacto el SAC en el mes de abonado, la deducción impositiva lo acompaña orgánicamente al 100%.

## Resultados de Validación
- ✅ Se instaló la dependencia `firebase` que carecía en el proyecto por cambios anteriores.
- ✅ El código compila correctamente (exit code 0 vía `npm run build`), no hay errores de sintaxis en el motor de cálculo.
- ✅ Con las correcciones aplicadas, la tabla de Excel analizada en Septiembre ya no sumará deducciones del primer semestre al prorrateo, y los ajustes de Impuesto Determinado recaerán pura y exclusivamente en el mes que pague el SAC Real (en el ajuste orgánico de la retención).
