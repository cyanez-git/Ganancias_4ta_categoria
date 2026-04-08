# Migración: Escalas Art. 94 de tablas semestrales a mensuales

**Fecha:** 2026-04-07  
**Commit:** `db4ba33`  
**Archivos modificados:** 6

---

## Motivación

ARCA publica tablas de escalas Art. 94 con **valores acumulados mensuales** (una tabla por cada mes). El engine anterior almacenaba solo 2 tablas anuales (sem1 y sem2) y las proporcionalizaba con `factorMes = (m+1)/12`.

**Problema:** Los valores proporcionalizados no coinciden exactamente con los de ARCA, especialmente en el cambio de semestre (julio), donde la tabla mensual acumulada mezcla 6 meses de sem1 + N meses de sem2 con ajuste de IPC.

## Cambios Realizados

### Estructura de datos

```
ANTES:
escalas: {
    sem1: [9 tramos anuales],
    sem2: [9 tramos anuales]
}

DESPUÉS:
escalas: [
    [9 tramos acumulados Enero],
    [9 tramos acumulados Febrero],
    ...
    [9 tramos acumulados Diciembre]
]
```

### `defaultParams.js`
- Nueva función exportada `generateMonthlyScalesFromAnnual(annual)` que genera 12 tablas acumuladas a partir de una tabla anual base
- Los defaults se generan con esta función (serán reemplazados al cargar el PDF real de ARCA)

### `calculationEngine.js`
- **Eliminada** la proporcionalización `factorMes = (m+1)/12`
- **Eliminado** `escalasAcumuladasMes = escalas.map(t => ({...}))`
- Ahora: `calcularImpuestoEscalas(gananciaNeta, params.escalas[m])` — acceso directo a la tabla del mes

### `pdfExtractionLogic.js`
- `parseEscalas()` reescrita para extraer **TODAS las tablas mensuales** de un solo PDF
- Detecta nombres de meses (ENERO, FEBRERO, etc.) como delimitadores entre tablas
- Retorna un objeto indexado por mes: `{ 0: [tramos], 1: [tramos], ..., 11: [tramos] }`
- Soporta Format A (mes en línea separada) y Format B (mes pegado al primer número)

### `AdminUploadParams.jsx`
- Simplificado de **4 archivos** a **3 archivos**:
  1. Deducciones Sem. 1 (Art. 30)
  2. Deducciones Sem. 2 (Art. 30)
  3. **Escalas Art. 94** (un solo PDF, contiene los 12 meses)
- Construye `Array[12]` combinando meses extraídos con fallback proporcionalizado

### `ConfigParametros.jsx`
- Reemplazado el toggle "Sem1/Sem2" por un **dropdown selector de mes** para la sección de escalas
- Se puede ver y editar la tabla de cualquier mes individual

### `useAppState.js`
- **Migración automática**: Si se detectan datos viejos (`{sem1, sem2}`), se convierten a `Array[12]`
- Restauración de `Infinity` adaptada para recorrer las 12 tablas mensuales

---

## Firebase

El documento en Firebase cambia de:
```json
{ "escalas": { "sem1": [...], "sem2": [...] } }
```
a:
```json
{ "escalas": [[...], [...], ..., [...]] }
```

Los datos existentes se migran automáticamente al cargar desde localStorage.

## Impacto

- **Precisión**: Los valores de impuesto determinado ahora coinciden exactamente con los de ARCA
- **Simplicidad**: Un solo archivo PDF para cargar las escalas
- **Retrocompatible**: Los datos viejos se migran automáticamente
