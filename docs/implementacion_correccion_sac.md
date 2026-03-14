# Corrección de la Duplicación del SAC en la Base Imponible

El usuario identificó correctamente un problema conceptual en el cálculo: si se informa el importe real cobrado de SAC (por ejemplo en junio y diciembre), el sistema actual lo incluye en la `gananciaBrutaMes`, lo que a su vez engrosa la `gananciaBrutaAcum`, sobre la cual se calcula el `sacProporcional` (1/12). Finalmente, la `gananciaBrutaConSACAcum` suma ambas cosas, generando una duplicación del impuesto sobre el SAC.

De acuerdo a la RG 5531/2024 de ARCA (ex-AFIP), el empleador debe adicionar mensualmente una doceava parte (1/12) de las remuneraciones para provisionar el impuesto sobre el aguinaldo. Cuando se abona el SAC real, **ese mes se debe comparar el SAC real pagado contra la doceava parte acumulada**. Si el pago real es superior, la diferencia se suma a la base de cálculo; si es inferior, se resta.
Simplificadamente, la base gravada anual termina siendo la suma de las remuneraciones mensuales puras + el SAC real depositado (o en su defecto, 12 doceavas partes provisionales).

## Proposed Changes

### Motor de Cálculo

#### [MODIFY] calculationEngine.js
1. **Paso 1 y 2 (Ingresos)**:
   - Mantendremos `sacAguinaldo` y `sacPluriempleo` en `totalIngresos` / `totalPluriempleo` solo para propósitos informativos de recibo de sueldo, pero crearemos una variable `ingresosPurosMes` que excluya el rubro SAC.
   - La `gananciaBrutaMes` actual se convertirá en `gananciaBrutaPuraMes` (es decir, excluyendo el SAC real reportado).
   
2. **Paso 4 (Ganancia Bruta y SAC Proporcional)**:
   - Acumularemos la `gananciaBrutaPuraMes` para obtener un `gananciaBrutaPuraAcum`.
   - El `sacProporcionalMensual` será `gananciaBrutaPuraMes / 12`.
   - El `sacProporcionalAcum` será `gananciaBrutaPuraAcum / 12`.
   - Sumaremos a la base el `SAC Real Acumulado`.

3. **Paso 7-8 (Ganancia Neta Acumulada)**:
   - La `gananciaBrutaConSACAcum` pasará a calcularse como:
     `gananciaBrutaPuraAcum + Math.max(sacProporcionalAcum, sacRealAcum)` (esta es una aproximación legal que simplifica el engorroso ajuste semestral de la liquidación de AFIP, donde liquidaciones de meses 1 al 5 y 7 al 11 van por doceava, y meses 6 y 12 toman el mayor entre lo devengado y la doceava acumulada. Ajustaremos según la ley vigente).

### Componentes de React

#### [MODIFY] LiquidacionMensual.jsx
1. Modificar la descripción del campo `SAC / Aguinaldo` para indicar más claramente: "Aguinaldo real cobrado en el mes (ej: en junio o diciembre)".
2. Reflejar en la UI cómo el SAC real y el proporcional interactúan (mostrando al usuario si se está tomando la base presunta o el real cobrado).

#### [MODIFY] excelExporter.js y pdfReportGenerator.js
Para evitar confusiones a la hora de leer el reporte, vamos a desglosar las dos variables de SAC de forma transparente en la sección 4 (GANANCIA BRUTA):
- `Ganancia Bruta Pura (Sin SAC)`
- `SAC Proporcional Adicionado (Doceava parte legal acumulada)`
- `SAC Real Pagado` (el aguinaldo real devengado en junio/diciembre)
- `Ganancia Bruta con Ajuste SAC`: el total sobre el cual se calculará el impuesto.

De esta forma, en el Excel y PDF el usuario verá cómo, cuando se informa el SAC real en junio o diciembre, se compara con todo el SAC Proporcional que se venía reservando desde enero, mostrando con precisión absoluta qué importe está sumando a la ganancia para la retención.

## User Review Required
> [!WARNING]  
> **Ajuste Técnico Normativo:** Según la RG 5531/2024 (Art. 3) y la Ley de Ganancias, en los meses donde **no** se cobra el aguinaldo (ej: Enero a Mayo), se debe liquidar sumando el SAC Proporcional prescrito (la doceava parte). En los meses de liquidación del SAC (Junio y Diciembre), se debe agregar a la base de cálculo la liquidación **real** del SAC, y descontar las doceavas partes que se vinieron adelantando.
>
> Propongo la siguiente lógica exacta a implementar en `calculationEngine.js` para cumplir con AFIP pero hacer el sistema matemáticamente correcto:
> - `gananciaBrutaMes`: Remuneración normal del mes **SIN** SAC.
> - `gananciaBrutaAcum`: Suma de las remuneraciones normales acumuladas en el año.
> - `sacProporcional`: Doceava parte (`gananciaBrutaAcum / 12`).
> - `sacRealAcum`: Todo SAC / Aguinaldo cargado por el usuario acumulado a ese mes.
> - `baseImponibleBruta` (Paso 7/8): `gananciaBrutaAcum + Math.max(sacProporcional, sacRealAcum)`.
>
> ¿Estás de acuerdo con este enfoque metodológico para solventar el problema de la duplicación?

## Verification Plan
### Automated Tests
* N/A. No implementado en este proyecto.

### Manual Verification
1. Abrir la aplicación y cargar ingresos en Enero a Mayo (sin SAC). Verificar que la aplicación suma el 8.33% (1/12) de SAC Proporcional a la base.
2. En el mes de Junio, además de cargar ingresos, cargar **SAC Real**.
3. Verificar si el impuesto determinado no se dispara el doble y el recibo cuadra con las nuevas normas de AFIP.
