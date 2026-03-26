# Corrección: Ganancia Neta Imponible y Parser Escalas Art. 94

## Corrección 1: Descuentos Obligatorios Acumulados

### Problema
La **Ganancia Neta Imponible** estaba inflada porque los descuentos obligatorios (jubilación 11%, obra social 3%, INSSJP 3%, sindicales) se calculaban mes a mes pero **no se restaban en la cadena acumulada**.

Fórmula incorrecta:
```
gananciaNeta = gananciaBrutaConSACAcum − deduccionesGeneralesAcum − deduccionesPersonalesAcum
```

Fórmula correcta:
```
gananciaNeta = gananciaBrutaConSACAcum − descuentosObligatoriosAcum − deduccionesGeneralesAcum − deduccionesPersonalesAcum
```

### Cambios en `src/engine/calculationEngine.js`
- Nuevo: acumulación de `descuentosObligatoriosAcum` (loop sobre meses previos)
- Corregido: `deduccionesTotalesAcum` ahora incluye `descuentosObligatoriosAcum`
- Expuesto: `descuentosObligatoriosAcum` en el objeto de resultados

### Commit
`b74b9e1` — `fix: restar descuentos obligatorios acumulados en Ganancia Neta Imponible`

---

## Corrección 2: Parser Escalas Art. 94

### Problema
El parser de `pdfExtractionLogic.js` esperaba que el nombre del mes estuviera pegado al primer número (`ENERO0,00 126.697,64...`), pero los PDFs reales de AFIP tienen formatos diferentes según el año.

### Formatos descubiertos

| Formato | Ejemplo | PDFs |
|---------|---------|------|
| A | Mes en línea separada (`Enero`) entre tramos | enero-junio-2025 |
| B | Mes pegado a un tramo medio (`JULIO4.077...`) | julio-diciembre-2025 |
| B + split | Igual a B pero con % y "en adelante" en líneas partidas | ene-a-jun-2026 |

### Cambios en `src/engine/pdfExtractionLogic.js`
- **`preprocessEscalasText()`** — recombina líneas partidas (% suelto, "en adelante" separado)
- **`parseTramoLine()`** — helper reutilizable para parsear cualquier fila de tramo
- **`parseEscalasFormatA()`** — mes como línea independiente, colecta tramos arriba y abajo
- **`parseEscalasFormatB()`** — mes pegado a un tramo, mismo enfoque bidireccional
- **`parseEscalas()`** — orquesta: preprocesa → intenta A → fallback B → error

### Verificación
Testeado contra los 3 PDFs en `Parametros AFIP/`: los 3 extraen exactamente 9 tramos (5% → 35%).

### Commit
`4c7a080` — `fix: parser escalas Art.94 - soporte dual formato PDF y preprocessing lineas partidas`
