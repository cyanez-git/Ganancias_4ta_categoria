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
 * Parse escalas Art. 94 from the PDF text.
 * Extracts the tax brackets for the given starting month (ENERO for sem1, JULIO for sem2).
 *
 * @param {string} text - Raw text extracted from the PDF
 * @param {string} startMonth - Starting month name to look for ('ENERO' or 'JULIO')
 * @returns {Array} Array of tax bracket objects
 */
export function parseEscalas(text, startMonth = 'ENERO') {
    console.debug(`[parseEscalas] Looking for month: ${startMonth}. Total lines: ${text.split('\n').length}`);
    const lines = text.split('\n');
    let isParsingBlock = false;
    const currentScale = [];

    // Pattern to detect the start of the target month's block.
    // The month name appears glued to the first number: e.g. "ENERO0,00 126.697,64 0,00 5 0,00"
    // or at the start of a line followed by the first bracket row.
    const startPattern = new RegExp(`^${startMonth}\\s*0,00`, 'i');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect the start of our target month block
        if (!isParsingBlock && startPattern.test(line)) {
            isParsingBlock = true;
        }

        if (isParsingBlock) {
            // Strip the month name prefix if it's glued to the line (e.g. "JULIO0,00 ...")
            const cleanLine = line.replace(/^[A-ZÁÉÍÓÚ]+/i, '').trim();

            // Match a bracket row: number number number digit(s) number
            // Handles spaces within large numbers (PDF extraction artifact): "14.716.229, 04"
            const numPart = '([\\d\\.]+(?:,\\d{0,2})?)';
            const spacedNumPart = '([\\d\\.]+(?:,\\s*\\d{0,2})?)';
            const numPattern = new RegExp(
                `^${spacedNumPart}\\s+${spacedNumPart}\\s+${spacedNumPart}\\s+(\\d{1,2})\\s+${spacedNumPart}$`,
                'i'
            );

            const match = cleanLine.match(numPattern);

            if (match) {
                const hasta = match[2].toLowerCase().includes('adelante')
                    ? Infinity
                    : parseArNumber(match[2].replace(/\s/g, ''));

                currentScale.push({
                    desde: parseArNumber(match[1].replace(/\s/g, '')),
                    hasta,
                    fijo: parseArNumber(match[3].replace(/\s/g, '')),
                    porcentaje: parseInt(match[4]) / 100,
                    excedenteDe: parseArNumber(match[5].replace(/\s/g, '')),
                });
            }

            // Also handle "en adelante" rows which may have text instead of a number
            if (!match && cleanLine.includes('en adelante') && currentScale.length > 0) {
                const enAdelantePattern = new RegExp(
                    `^${numPart}\\s+en adelante\\s+${numPart}\\s+(\\d{1,2})\\s+${numPart}`,
                    'i'
                );
                const adMatch = cleanLine.match(enAdelantePattern);
                if (adMatch) {
                    currentScale.push({
                        desde: parseArNumber(adMatch[1]),
                        hasta: Infinity,
                        fijo: parseArNumber(adMatch[2]),
                        porcentaje: parseInt(adMatch[3]) / 100,
                        excedenteDe: parseArNumber(adMatch[4]),
                    });
                }
                break; // Last bracket found — stop
            }

            // Stop if we hit the next month block (avoid parsing FEBRERO, AGOSTO, etc.)
            if (currentScale.length > 0 && !match) {
                // If we encounter another month header, stop
                if (/^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)/i.test(line)) {
                    break;
                }
            }
        }
    }

    if (currentScale.length === 0) {
        // Log the first few lines to help debug
        const preview = text.split('\n').slice(0, 20).join('\n');
        console.error(`[parseEscalas] No tramos found for ${startMonth}. First 20 lines:\n`, preview);
        throw new Error(`No se encontraron tramos Art. 94 para el mes ${startMonth} en el PDF.`);
    }

    console.debug(`[parseEscalas] ${startMonth}: extraídos ${currentScale.length} tramos. Tramo 0:`, currentScale[0]);
    return currentScale;
}
