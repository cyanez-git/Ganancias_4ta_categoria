# Corrección en el Cómputo del Sueldo Anual Complementario (SAC)

Se ha resuelto exitosamente el problema detectado donde el pago interactivo del SAC (Aguinaldo) en los meses de Junio/Diciembre generaba una doble adición impositiva al sumarse a la base de cálculo y al mismo tiempo utilizarse para engrosar la reserva legal 1/12 (`sacProporcional`).

## Cambios Implementados

### 1. Refactorización del Core de Cálculo (`calculationEngine.js`)
* Se introdujeron las variables `gananciaBrutaPuraMes` y `gananciaBrutaPuraAcum` que calculan los ingresos excluyendo explícitamente cualquier concepto cargado en `sacAguinaldo` y `sacPluriempleo`.
* El `sacProporcionalAcum` (reserva de la doceava parte legal) pasó a calcularse **exclusivamente** sobre la base pura, evitando el crecimiento recursivo y la doble suma.
* Se agregó la variable `sacRealAcum` y el tope normativo (`topeSACParaCalculos = Math.max(sacProporcionalAcum, sacRealAcum)`).
* La `gananciaBrutaConSACAcum` (base de retención definitiva) incorpora el tope normativo, comparando y alineando perfectamente la provisión con el pago real devengado.

### 2. Aclaración Conceptual en Interfaz (`LiquidacionMensual.jsx` y `Dashboard.jsx`)
* Se segmentó visualmente la sección de `Ganancia Bruta` en el detalle mensual.
* Ahora la aplicación expone transparentemente:
  * Ganancia Bruta Pura (Sin SAC)
  * SAC Proporcional Acumulado (Reserva Legal de 1/12)
  * SAC Real Pagado (Monto cargado por el usuario)
  * Tope de SAC Aplicado para Carga Impositiva 
* Las tablas resumen ahora muestran estas filas desglosadas en lugar de una base mezclada y opaca.

### 3. Actualización de Exportadores (`excelExporter.js` y `pdfReportGenerator.js`)
* Se replicó la lógica de desglose financiero en las exportaciones a formato `.xlsx` de Microsoft Excel.
* Se actualizaron las matrices de las 3 páginas del informe formal en PDF para que los asientos reflejen el aguinaldo real adicionado o la doceava provisoria (lo que resulte aplicable cada mes).

## Verificación de Integridad
* [x] **Construcción del proyecto**: Se corrió de manera exitosa la cadena de construcción `npm run build` en Vite, garantizando cero errores sintácticos u omisiones de dependencias con los nuevos desgloses en los componentes React de la Interfaz.
* [x] La corrección es **100% retrocompatible** y compila en `dist/`.

> [!TIP]
> **Próximos pasos recomendados**: Puedes usar el comando `npm run dev` para levantar el servidor de pruebas local o compilar a producción subiendo los archivos modificados a tu repositorio Github.
