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

    // MNI - "Ganancias no imponibles"
    const mniMatch =
        text.match(/Ganancias no imponibles\s*\[Art[^\]]*\]\s*:?\s*([\d\.]+,\d{2})/i) ||
        text.match(/Ganancias no imponibles\s*\[Art[^)]*\)\]\s*:?\s*([\d\.]+,\d{2})/i) ||
        text.match(/inciso a\)\]:\s*([\d\.]+,\d{2})/i);

    // Cónyuge
    const conyugeMatch =
        text.match(/1\.\s*C[oó]nyuge:\s*([\d\.]+,\d{2})/i);

    // Hijo
    const hijoMatch =
        text.match(/2\.\s*Hijo:\s*([\d\.]+,\d{2})/i);

    // Hijo incapacitado
    const hijoIncMatch =
        text.match(/2\.1\.\s*Hijo incapacitado para el trabajo\s*([\d\.]+,\d{2})/i);

    // Deducción Especial General (Apartado 1)
    const dedEspMatch =
        text.match(/Apartado 1\]\s*([\d\.]+,\d{2})/i) ||
        text.match(/Apartado 1\]:\s*([\d\.]+,\d{2})/i) ||
        text.match(/inciso c\),\s*Apartado 1\]\s*([\d\.]+,\d{2})/i);

    // Deducción Especial Profesionales (Apartado 1 - nuevos profesionales)
    const dedEspProfMatch =
        text.match(/profesionales\/emprendedores[»\]"']\s*([\d\.]+,\d{2})/i) ||
        text.match(/emprendedores[^\n]*\]\s*([\d\.]+,\d{2})/i);

    const mni = mniMatch ? extractFirstNumber(mniMatch[1]) : 0;
    const conyuge = conyugeMatch ? extractFirstNumber(conyugeMatch[1]) : 0;
    const hijo = hijoMatch ? extractFirstNumber(hijoMatch[1]) : 0;
    const hijoIncapacitado = hijoIncMatch ? extractFirstNumber(hijoIncMatch[1]) : 0;
    const dedEspGeneral = dedEspMatch ? extractFirstNumber(dedEspMatch[1]) : 0;
    const dedEspProfesionales = dedEspProfMatch ? extractFirstNumber(dedEspProfMatch[1]) : 0;

    console.debug('[parseDeducciones] Matches found:', {
        mni: mniMatch?.[1]?.slice(0, 15),
        conyuge: conyugeMatch?.[1]?.slice(0, 15),
        hijo: hijoMatch?.[1]?.slice(0, 15),
        hijoInc: hijoIncMatch?.[1]?.slice(0, 15),
        dedEsp: dedEspMatch?.[1]?.slice(0, 15),
        dedEspProf: dedEspProfMatch?.[1]?.slice(0, 15),
    });
    console.debug('[parseDeducciones] Parsed values:', { mni, conyuge, hijo, hijoIncapacitado, dedEspGeneral, dedEspProfesionales });

    // Fallback: if primary extraction fails, compute from known AFIP proportions
    if (!mni) {
        console.warn('[parseDeducciones] Primary regex failed — attempting fallback heuristic');
        return deduccionesFallback(text);
    }

    return {
        gananciaNoImponible: mni,
        conyuge: conyuge || Math.round(mni * 0.9418 * 100) / 100,
        hijo: hijo || Math.round(mni * 0.4748 * 100) / 100,
        hijoIncapacitado: hijoIncapacitado || Math.round(mni * 0.9495 * 100) / 100,
        deduccionEspecialGeneral: dedEspGeneral || Math.round(mni * 3.5007 * 100) / 100,
        deduccionEspecialProfesionales: dedEspProfesionales || Math.round(mni * 4.0013 * 100) / 100,
    };
}

/**
 * Heuristic fallback for parseDeducciones when regex fails.
 * Tries to extract large Argentine-format numbers and assign by known AFIP proportions.
 */
function deduccionesFallback(text) {
    // Extract all numbers ≥ 100.000 (likely to be monthly deductions, not percentages)
    const allNumbers = [...text.matchAll(/([\d]{1,3}(?:\.[\d]{3})+,\d{2})/g)]
        .map(m => parseArNumber(m[1]))
        .filter(n => n >= 100000)
        .sort((a, b) => a - b);

    if (allNumbers.length === 0) {
        throw new Error('No se pudieron extraer montos de deducciones del PDF.');
    }

    // Smallest number is likely MNI (Ganancia No Imponible)
    const mni = allNumbers[0];
    return {
        gananciaNoImponible: mni,
        conyuge: Math.round(mni * 0.9418 * 100) / 100,
        hijo: Math.round(mni * 0.4748 * 100) / 100,
        hijoIncapacitado: Math.round(mni * 0.9495 * 100) / 100,
        deduccionEspecialGeneral: Math.round(mni * 3.5007 * 100) / 100,
        deduccionEspecialProfesionales: Math.round(mni * 4.0013 * 100) / 100,
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

export function parseEscalas(text, startMonth = 'ENERO') {
    console.debug(`[parseEscalas] Looking for month: ${startMonth}. Total lines: ${text.split('\n').length}`);

    // Pre-process to recombine split lines (affects 2026+ PDFs)
    const normalizedText = preprocessEscalasText(text);

    // Try Format A first (month on separate line)
    let result = parseEscalasFormatA(normalizedText, startMonth);
    if (result.length > 0) {
        console.debug(`[parseEscalas] Format A matched: ${result.length} tramos for ${startMonth}`);
        return result;
    }

    // Fall back to Format B (month glued to first number)
    result = parseEscalasFormatB(normalizedText, startMonth);
    if (result.length > 0) {
        console.debug(`[parseEscalas] Format B (legacy) matched: ${result.length} tramos for ${startMonth}`);
        return result;
    }

    // Neither format worked
    const preview = normalizedText.split('\n').slice(0, 30).join('\n');
    console.error(`[parseEscalas] No tramos found for ${startMonth}. First 30 lines:\n`, preview);
    throw new Error(`No se encontraron tramos Art. 94 para el mes ${startMonth} en el PDF.`);
}

/**
 * Format A: Month name appears on its own line between tramo rows.
 * Strategy:
 *   1. Find the line that says exactly the month name (e.g. "Enero")
 *   2. Collect tramo rows going UP from that line (before the month name)
 *   3. Collect tramo rows going DOWN from that line (after the month name)
 *   4. Combine in order
 */
function parseEscalasFormatA(text, startMonth) {
    const lines = text.split('\n').map(l => l.trim());
    const monthPattern = new RegExp(`^${startMonth}$`, 'i');

    // Find the line index of the target month
    const monthLineIdx = lines.findIndex(l => monthPattern.test(l));
    if (monthLineIdx === -1) return [];

    const tramos = [];

    // Collect tramos ABOVE the month name (walk upwards)
    const tramosAbove = [];
    for (let i = monthLineIdx - 1; i >= 0; i--) {
        const tramo = parseTramoLine(lines[i]);
        if (tramo) {
            tramosAbove.unshift(tramo); // prepend to maintain order
        } else {
            break; // stop at first non-tramo line (table header)
        }
    }
    tramos.push(...tramosAbove);

    // Collect tramos BELOW the month name (walk downwards)
    for (let i = monthLineIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        const tramo = parseTramoLine(line);
        if (tramo) {
            tramos.push(tramo);
            if (tramo.hasta === Infinity) break; // last tramo
        } else if (MONTH_LINE_RE.test(line)) {
            break; // hit the next month
        } else if (/Ganancia neta acumulada/i.test(line)) {
            break; // hit the next table header
        }
        // Skip non-matching lines (empty lines, headers, etc.)
    }

    return tramos;
}

/**
 * Format B (legacy): Month name glued to a tramo row.
 * e.g. "ENERO570.139,38 1.140.278,75 61.448,36 19 570.139,38"
 * The month name can appear on any tramo (not necessarily the first).
 * Strategy: find the line, parse the glued tramo, then collect tramos above and below.
 */
function parseEscalasFormatB(text, startMonth) {
    const lines = text.split('\n').map(l => l.trim());
    // Match month name followed by a digit (glued to the tramo row)
    const gluedPattern = new RegExp(`^${startMonth}\\d`, 'i');

    const monthLineIdx = lines.findIndex(l => gluedPattern.test(l));
    if (monthLineIdx === -1) return [];

    const tramos = [];

    // Collect tramos ABOVE the glued line (walk upwards)
    const tramosAbove = [];
    for (let i = monthLineIdx - 1; i >= 0; i--) {
        const tramo = parseTramoLine(lines[i]);
        if (tramo) {
            tramosAbove.unshift(tramo);
        } else {
            break;
        }
    }
    tramos.push(...tramosAbove);

    // Parse the glued line itself (parseTramoLine strips the month prefix)
    const gluedTramo = parseTramoLine(lines[monthLineIdx]);
    if (gluedTramo) tramos.push(gluedTramo);

    // Collect tramos BELOW the glued line (walk downwards)
    for (let i = monthLineIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        // Stop if we hit another month (glued or standalone)
        if (MONTH_LINE_RE.test(line)) break;
        if (/^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\d/i.test(line)) break;
        if (/Ganancia [Nn]eta [Aa]cumulada/i.test(line)) break;

        const tramo = parseTramoLine(line);
        if (tramo) {
            tramos.push(tramo);
            if (tramo.hasta === Infinity) break;
        }
    }

    return tramos;
}
