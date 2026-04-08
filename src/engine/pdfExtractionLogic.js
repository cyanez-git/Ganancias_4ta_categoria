/**
 * Logic to extract values from PDF text for Ganancias 4ta Categoria
 *
 * PDF format discovered (text extracted by pdf.js from the browser):
 *
 * DEDUCCIONES:
 *   The PDFs show cumulative monthly values in a table.
 *   The ENERO accumulated value = the real monthly value for sem1.
 *   The JULIO accumulated value = the real monthly value for sem2.
 *   Format of raw text: "A) Ganancias no imponibles [Artículo \n30, inciso a)]: 326.355,70652.711,40979.067,09"
 *   (Three values per row: Jan, Feb, Mar accumulated - all in one line with no separator)
 *   We need to extract the FIRST number in each concept row.
 *
 * ESCALAS:
 *   The PDF shows cumulative scales per month.
 *   We need the ENERO block for sem1 and JULIO block for sem2.
 *   Format: "ENERO0,00 126.697,64 0,00 5 0,00" (month name glued to first number)
 */

// Helper to clean and convert AR format strings (e.g. "3.916.268,37") to valid float
function parseArNumber(str) {
    if (!str) return 0;
    const cleaned = str.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(cleaned) || 0;
}

/**
 * Extract just the first AR-formatted number from a string.
 * The PDFs concatenate multiple monthly values in one line with no separator,
 * e.g.: "326.355,70652.711,40979.067,09"
 * We want only the first one.
 */
function extractFirstNumber(str) {
    if (!str) return 0;
    // Match the first number in Argentine format (digits, dots as thousands, comma as decimal)
    const match = str.match(/[\d]{1,3}(?:\.[\d]{3})*,[\d]{2}/);
    return match ? parseArNumber(match[0]) : 0;
}

/**
 * Extract a deducción value from the accumulated monthly table by its lettered prefix (C), D), etc).
 * In the PDF accumulated table, the structure is:
 *   C) Deducción Especial [Artículo 30,
 *   1.142.244,94 2.284.489,88 3.426.734,83    ← numbers line (ENERO, FEB, MAR)
 *   inciso c), Apartado 1]:
 *
 * We search ONLY in the "IMPORTES ACUMULADOS" section (not the annual summary at the top).
 * Returns the first AR number found near the prefix (= ENERO/JULIO monthly value).
 */
function extractDeduccionByPrefix(text, prefix) {
    const lines = text.split('\n');

    // Find where the accumulated table starts
    const acumStart = lines.findIndex(l => /IMPORTES?\s*ACUMULADOS?\s*CORRESPONDIENTES/i.test(l));
    if (acumStart === -1) return 0;

    // Search from there for the prefix (e.g. "D)" or "C)")
    const prefixPattern = new RegExp(`^${prefix}\\s*Deducci`, 'i');
    for (let i = acumStart; i < lines.length; i++) {
        if (prefixPattern.test(lines[i].trim())) {
            // Found the header. Look at neighboring lines for numbers.
            // The numbers could be on the next line or on the same line after the header.
            for (let j = i; j < Math.min(i + 3, lines.length); j++) {
                const num = extractFirstNumber(lines[j]);
                if (num > 0) return num;
            }
        }
    }
    return 0;
}

/**
 * Parse deducciones personales from the PDF text.
 * Works for both sem1 (ene-jun) and sem2 (jul-dic) PDFs.
 * Extracts the FIRST accumulated monthly value (ENERO or JULIO column).
 *
 * @param {string} text - Raw text extracted from the PDF
 * @returns {Object} Monthly deductions object
 */
export function parseDeducciones(text) {
    // Debug: print the first 400 chars of the extracted text so we can verify
    // the structure during testing (visible in browser DevTools > Console)
    console.debug('[parseDeducciones] First 400 chars:\n', text.slice(0, 400));

    // Strategy: Extract the first number from each concept row in the accumulated table.
    // The ENERO/JULIO accumulated value = monthly value for that semester.
    
    // CRÍTICO: El PDF tiene una tabla ANUAL al principio y una MENSUAL abajo.
    // Debemos ignorar la tabla anual para no capturar los valores totales (mucho más altos).
    const lines = text.split('\n');
    const acumStart = lines.findIndex(l => /IMPORTES?\s*ACUMULADOS?\s*CORRESPONDIENTES/i.test(l) || /IMPORTE\s*DE\s*LAS\s*DEDUCCIONES\s*ACUMULADAS/i.test(l));
    const accumulatedText = acumStart !== -1 ? lines.slice(acumStart).join('\n') : text;

    // Extraemos el PRIMER NÚMERO después de la etiqueta de la fila (A, B, 1, 2, C, D)
    // El [^]*? salta cualquier texto o salto de línea (non-greedy) hasta llegar al formato numérico.
    const mniMatch = accumulatedText.match(/A\)\s*Ganancias[^]*?([\d\.]+,\d{2})/i);
    const conyugeMatch = accumulatedText.match(/1\.\s*C[oó]nyuge[^]*?([\d\.]+,\d{2})/i);
    const hijoMatch = accumulatedText.match(/2\.\s*Hijo[^]*?([\d\.]+,\d{2})/i);
    const hijoIncMatch = accumulatedText.match(/2\.1\.\s*Hijo[^]*?([\d\.]+,\d{2})/i);
    const dedEspApt1Match = accumulatedText.match(/C\)\s*Deducci[^]*?([\d\.]+,\d{2})/i);
    const dedEspGeneralMatch = accumulatedText.match(/D\)\s*Deducci[^]*?([\d\.]+,\d{2})/i);
    const dedEspProfMatch = accumulatedText.match(/nuevos profesionales[^]*?([\d\.]+,\d{2})/i);

    const mni = mniMatch ? extractFirstNumber(mniMatch[1]) : 0;
    const conyuge = conyugeMatch ? extractFirstNumber(conyugeMatch[1]) : 0;
    const hijo = hijoMatch ? extractFirstNumber(hijoMatch[1]) : 0;
    const hijoIncapacitado = hijoIncMatch ? extractFirstNumber(hijoIncMatch[1]) : 0;
    const dedEspGeneral = dedEspGeneralMatch ? extractFirstNumber(dedEspGeneralMatch[1]) 
                          : (dedEspApt1Match ? extractFirstNumber(dedEspApt1Match[1]) : 0);
    const dedEspProfesionales = dedEspProfMatch ? extractFirstNumber(dedEspProfMatch[1]) : 0;

    console.debug('[parseDeducciones] Parsed values:', { mni, conyuge, hijo, hijoIncapacitado, dedEspGeneral, dedEspProfesionales });

    // Si no pudimos extraer el MNI, la tabla no se parseó correctamente
    if (!mni) {
        throw new Error("No se pudo extraer la Ganancia No Imponible (MNI) del PDF. El formato del documento no coincide con las etiquetas (A, B, C) esperadas.");
    }

    return {
        gananciaNoImponible: mni,
        // Si no aparecen en el PDF (pueden ser 0), los forzamos a 0 en lugar de fallback ciego
        conyuge: conyuge || 0,
        hijo: hijo || 0,
        hijoIncapacitado: hijoIncapacitado || 0,
        deduccionEspecialGeneral: dedEspGeneral || 0,
        deduccionEspecialProfesionales: dedEspProfesionales || 0,
    };
}



/**
 * Regex helpers for matching bracket rows in Art. 94 PDFs.
 * A bracket row looks like: "0,00 126.697,64 0,00 5 0,00"
 * or with "en adelante":     "7.696.881,59 en adelante 1.858.971,11 35 7.696.881,59"
 */
const NUM_PART = '([\\d\\.]+(?:,\\d{0,2})?)';
const SPACED_NUM_PART = '([\\d\\.]+(?:,\\s*\\d{0,2})?)';
const TRAMO_PATTERN = new RegExp(
    `^${SPACED_NUM_PART}\\s+${SPACED_NUM_PART}\\s+${SPACED_NUM_PART}\\s+(\\d{1,2})\\s+${SPACED_NUM_PART}$`,
    'i'
);
const EN_ADELANTE_PATTERN = new RegExp(
    `^${NUM_PART}\\s+en adelante\\s+${NUM_PART}\\s+(\\d{1,2})\\s+${NUM_PART}`,
    'i'
);
const MONTH_NAMES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
const MONTH_LINE_RE = new RegExp(`^(${MONTH_NAMES.join('|')})$`, 'i');

/**
 * Try to parse a single tramo from a line. Returns the tramo object or null.
 */
function parseTramoLine(line) {
    const clean = line.replace(/^[A-ZÁÉÍÓÚ]+/i, '').trim();

    // Standard row: desde hasta fijo % excedenteDe
    const m = clean.match(TRAMO_PATTERN);
    if (m) {
        return {
            desde: parseArNumber(m[1].replace(/\s/g, '')),
            hasta: parseArNumber(m[2].replace(/\s/g, '')),
            fijo: parseArNumber(m[3].replace(/\s/g, '')),
            porcentaje: parseInt(m[4]) / 100,
            excedenteDe: parseArNumber(m[5].replace(/\s/g, '')),
        };
    }

    // "en adelante" row
    const a = clean.match(EN_ADELANTE_PATTERN);
    if (a) {
        return {
            desde: parseArNumber(a[1]),
            hasta: Infinity,
            fijo: parseArNumber(a[2]),
            porcentaje: parseInt(a[3]) / 100,
            excedenteDe: parseArNumber(a[4]),
        };
    }

    return null;
}

/**
 * Parse escalas Art. 94 from the PDF text.
 * Supports TWO PDF formats:
 *
 * FORMAT A (new — current AFIP PDFs):
 *   The month name appears on its own line BETWEEN tramo rows:
 *     0,00 126.697,64 0,00 5 0,00       ← tramo 1
 *     126.697,64 253.395,28 ...          ← tramo 2
 *     253.395,28 380.092,92 ...          ← tramo 3
 *     Enero                              ← month name (standalone)
 *     380.092,92 570.139,38 ...          ← tramo 4
 *     ...
 *     7.696.881,59 en adelante ...       ← last tramo
 *
 * FORMAT B (old — legacy):
 *   The month name is glued to the first number:
 *     ENERO0,00 126.697,64 0,00 5 0,00
 *
 * We try Format A first (more common); if no tramos found, fall back to Format B.
 *
 * @param {string} text - Raw text extracted from the PDF
 * @param {string} startMonth - Starting month name to look for ('ENERO' or 'JULIO')
 * @returns {Array} Array of tax bracket objects
 */
/**
 * Pre-process the PDF text to recombine lines that were split during extraction.
 * Some AFIP PDFs (e.g. 2026) have the percentage or "en adelante" on a separate
 * line due to PDF text-extraction Y-coordinate grouping issues.
 *
 * Patterns handled:
 *  - Line with 4 numbers (missing %) followed by a lone "5" or "12" → merge % into previous
 *  - Line with numbers followed by "en adelante 35" on next line → merge
 *  - Line with partial "en adelante" data split across two lines
 */
function preprocessEscalasText(text) {
    const lines = text.split('\n');
    const merged = [];

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        // Check if this line is a lone percentage (1-2 digit number, alone on line)
        if (/^\d{1,2}\s*$/.test(trimmed) && merged.length > 0) {
            // Merge with the previous line by inserting the % into the right position
            const prevLine = merged[merged.length - 1];
            // The previous line has 4 numbers but needs a % between the 3rd and 4th:
            // "0,00 166.669,17 0,00 0,00" + "5" → "0,00 166.669,17 0,00 5 0,00"
            // Strategy: find the last space-separated number and insert % before it
            const parts = prevLine.trim().split(/\s+/);
            if (parts.length >= 4) {
                const lastPart = parts.pop();
                parts.push(trimmed.trim());
                parts.push(lastPart);
                merged[merged.length - 1] = parts.join(' ');
            } else {
                merged[merged.length - 1] = prevLine + ' ' + trimmed;
            }
            continue;
        }

        // Check if this line is "en adelante 35" or "en adelante 35 " (split from previous)
        if (/^en adelante\s+\d{1,2}\s*$/i.test(trimmed) && merged.length > 0) {
            merged[merged.length - 1] = merged[merged.length - 1].trim() + ' ' + trimmed;
            continue;
        }

        merged.push(lines[i]);
    }

    return merged.join('\n');
}

/**
 * Parse ALL monthly escalas Art. 94 from a single ARCA PDF.
 *
 * ARCA PDFs contain up to 12 monthly accumulated tables. Each table
 * corresponds to one month and is separated by the month name (e.g. ENERO, JULIO).
 *
 * The function detects month names as delimiters and collects the tramos
 * that follow each month header. If a tramo appears BEFORE any month header,
 * it belongs to the first month found.
 *
 * @param {string} text - Raw text extracted from the PDF
 * @returns {Object} Object keyed by month index (0-11), each value is an array of tramo objects.
 *                   Only months found in the PDF are included.
 */
export function parseEscalas(text) {
    console.debug(`[parseEscalas] Extracting monthly tables. Total chars: ${text.length}`);

    // Pre-process to recombine split lines (affects 2026+ PDFs)
    const normalizedText = preprocessEscalasText(text);
    const lines = normalizedText.split('\n').map(l => l.trim());

    // Map month names to 0-based indices
    const MONTH_TO_INDEX = {};
    MONTH_NAMES.forEach((name, i) => { MONTH_TO_INDEX[name.toUpperCase()] = i; });

    const result = {};
    let currentMonthIdx = null;
    let currentTramos = [];
    let orphanTramos = []; // tramos before any month header

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        // Check if this line is a month name
        const monthMatch = line.match(MONTH_LINE_RE);
        if (monthMatch) {
            // Save previous month's tramos
            if (currentMonthIdx !== null && currentTramos.length > 0) {
                result[currentMonthIdx] = currentTramos;
            }
            currentMonthIdx = MONTH_TO_INDEX[monthMatch[0].toUpperCase()];
            currentTramos = [...orphanTramos]; // include any tramos found before this header
            orphanTramos = [];
            continue;
        }

        // Try to parse as a tramo line
        const tramo = parseTramoLine(line);
        if (tramo) {
            if (currentMonthIdx !== null) {
                currentTramos.push(tramo);
            } else {
                orphanTramos.push(tramo);
            }

            // If this is the last tramo (hasta = Infinity), finalize current month
            if (tramo.hasta === Infinity && currentMonthIdx !== null) {
                result[currentMonthIdx] = currentTramos;
                currentMonthIdx = null;
                currentTramos = [];
                orphanTramos = [];
            }
            continue;
        }

        // Skip unrelated text (headers, footers, etc.)
        // But if we hit "Ganancia" or "Art" type text after collecting tramos, break
        if (currentTramos.length > 0 && /^(Ganancia|GANANCIA|Escala|ESCALA)/i.test(line)) {
            // Could be a new section, but keep going
        }
    }

    // Save last month if pending
    if (currentMonthIdx !== null && currentTramos.length > 0) {
        result[currentMonthIdx] = currentTramos;
    }

    // If we only got orphan tramos and no months detected, try to infer
    // This handles PDFs where month names are glued to the first tramo line (Format B)
    if (Object.keys(result).length === 0 && orphanTramos.length > 0) {
        console.warn('[parseEscalas] No month headers found. Trying Format B (month glued to first number)');
        // Fall back: try to extract month from first line of each block
        let fallbackTramos = [];
        for (const line of lines) {
            if (!line) continue;
            // Try extracting month name from beginning of line
            const monthPrefix = line.match(/^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)/i);
            if (monthPrefix) {
                if (fallbackTramos.length > 0 && currentMonthIdx !== null) {
                    result[currentMonthIdx] = fallbackTramos;
                    fallbackTramos = [];
                }
                currentMonthIdx = MONTH_TO_INDEX[monthPrefix[0].toUpperCase()];
                // Parse the rest of the line as a tramo
                const restOfLine = line.substring(monthPrefix[0].length);
                const tramo = parseTramoLine(restOfLine);
                if (tramo) fallbackTramos.push(tramo);
            } else {
                const tramo = parseTramoLine(line);
                if (tramo) fallbackTramos.push(tramo);
                if (tramo?.hasta === Infinity && currentMonthIdx !== null) {
                    result[currentMonthIdx] = fallbackTramos;
                    fallbackTramos = [];
                    currentMonthIdx = null;
                }
            }
        }
        if (currentMonthIdx !== null && fallbackTramos.length > 0) {
            result[currentMonthIdx] = fallbackTramos;
        }
    }

    const monthCount = Object.keys(result).length;
    console.debug(`[parseEscalas] Extracted tables for ${monthCount} months: ${Object.keys(result).map(k => MONTH_NAMES[k]).join(', ')}`);

    if (monthCount === 0) {
        throw new Error('No se encontraron escalas del Art. 94 en el PDF. Verificá que el archivo sea correcto.');
    }

    return result;
}

