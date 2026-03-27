/**
 * Excel export utility for Ganancias 4ta Categoría
 * Uses xlsx-js-style (SheetJS fork with styling) to generate a styled .xlsx
 */
import XLSX from 'xlsx-js-style';
import { MONTHS_SHORT } from './defaultParams';

// ── Style Definitions ────────────────────────────────────────────
const COLORS = {
    headerBg:    'FF1F2937',  // dark slate
    headerFont:  'FFFFFFFF',
    sectionBg:   'FF2563EB',  // blue
    sectionFont: 'FFFFFFFF',
    totalBg:     'FFF1F5F9',  // light gray-blue
    totalFont:   'FF0F172A',
    highlightBg: 'FFFEF3C7',  // warm yellow
    highlightFont: 'FF92400E',
    resultBg:    'FFECFDF5',  // green subtle
    resultFont:  'FF065F46',
    acumBg:      'FFF0F9FF',  // sky subtle
    borderColor: 'FFD1D5DB',
    borderDark:  'FF9CA3AF',
    white:       'FFFFFFFF',
    black:       'FF000000',
};

const FONT_BASE    = { name: 'Calibri', sz: 10, color: { rgb: COLORS.black } };
const FONT_HEADER  = { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLORS.headerFont } };
const FONT_SECTION = { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLORS.sectionFont } };
const FONT_BOLD    = { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLORS.black } };
const FONT_HIGHLIGHT = { name: 'Calibri', sz: 11, bold: true, color: { rgb: COLORS.highlightFont } };
const FONT_RESULT  = { name: 'Calibri', sz: 10, bold: true, color: { rgb: COLORS.resultFont } };

const BORDER_THIN = {
    top:    { style: 'thin', color: { rgb: COLORS.borderColor } },
    bottom: { style: 'thin', color: { rgb: COLORS.borderColor } },
    left:   { style: 'thin', color: { rgb: COLORS.borderColor } },
    right:  { style: 'thin', color: { rgb: COLORS.borderColor } },
};

const BORDER_BOTTOM_MEDIUM = {
    ...BORDER_THIN,
    bottom: { style: 'medium', color: { rgb: COLORS.borderDark } },
};

const NUM_FMT = '#,##0.00';

// ── Row Definitions ──────────────────────────────────────────────
const ROWS = [
    { label: '1. INGRESOS', section: true },
    { label: 'Sueldo Básico', key: 'data.sueldoBasico' },
    { label: 'Total Ingresos del Mes', key: 'totalIngresos', isTotal: true },

    { label: '2. PLURIEMPLEO', section: true },
    { label: 'Total Pluriempleo', key: 'totalPluriempleo', isTotal: true },

    { label: '3. DESCUENTOS OBLIGATORIOS', section: true },
    { label: 'Base Sueldo (tope MoPRe)', key: 'baseDescuentosSueldo' },
    { label: 'Base SAC (tope 50% MoPRe)', key: 'baseDescuentosSAC' },
    { label: 'Total Base Descuentos', key: 'baseDescuentos', isTotal: true },
    { label: 'Jubilación 11%', key: 'jubilacion' },
    { label: 'Obra Social 3%', key: 'obraSocial' },
    { label: 'INSSJP 3%', key: 'inssjp' },
    { label: 'Total Descuentos', key: 'totalDescuentos', isTotal: true },

    { label: '4. GANANCIA BRUTA', section: true },
    { label: 'Ganancia Bruta Pura (Sin SAC)', key: 'gananciaBrutaPuraMes' },
    { label: 'SAC Real Pagado', key: 'sacRealMes' },
    { label: 'Ganancia Bruta con SAC (Base Mes)', key: 'gananciaBrutaMes', isTotal: true },
    { label: 'Ganancia Bruta Pura Acumulada', key: 'gananciaBrutaPuraAcum', isCumulative: true, isAccum: true },
    { label: 'SAC Real Acum.', key: 'sacRealAcum', isCumulative: true, isAccum: true },
    { label: 'SAC Proporcional Prov. Acum', key: 'sacProporcionalAcum', isCumulative: true, isAccum: true },
    { label: 'Ganancia Bruta Acumulada', key: 'gananciaBrutaAcum', isCumulative: true, isTotal: true },

    { label: '5. DEDUCCIONES GENERALES', section: true },
    { label: 'Alquiler Pagado', key: 'data.alquilerPagado' },
    { label: 'Alquiler deducible 40% (c/tope GNI)', key: 'alquiler40' },
    { label: 'Alquiler deducible 10% (Ley 27.737)', key: 'alquiler10' },
    { label: 'Medicina Prepaga deducible', key: 'medicinaPreDeducible' },
    { label: 'Educación deducible', key: 'educacionDeducible' },
    { label: 'Seguro de Vida deducible', key: 'seguroVidaDeducible' },
    { label: 'Donaciones deducibles', key: 'donacionesDeducible' },
    { label: 'Ded. SAC 17% (mensual)', key: 'deduccionesSobreSAC' },
    { label: 'Ded. SAC 17% Acumulada (definitiva)', key: 'deduccionesSobreSACAcum', isCumulative: true, isAccum: true },
    { label: 'Total Deducciones Generales', key: 'totalDeduccionesGenerales', isTotal: true },

    { label: '6. DEDUCCIONES PERSONALES', section: true },
    { label: 'Ganancia No Imponible (MNI)', key: 'mni' },
    { label: 'Cónyuge', key: 'dedConyuge' },
    { label: 'Hijos', key: 'dedHijos' },
    { label: 'Hijos Incapacitados', key: 'dedHijosIncap' },
    { label: 'Deducción Especial', key: 'dedEspecial' },
    { label: 'Adicional Doceava Parte (Ley 27.743)', key: 'dedEspecialDoceavaParte' },
    { label: 'Total Deducciones Personales', key: 'totalDeduccionesPersonales', isTotal: true },

    { label: '7. RESULTADO', section: true },
    { label: 'Desc. Obligatorios Acum.', key: 'descuentosObligatoriosAcum', isCumulative: true, isAccum: true },
    { label: 'Ded. Generales Acum. (ajustada)', key: 'deduccionesGeneralesAcum', isCumulative: true, isAccum: true },
    { label: 'Ded. Personales Acum.', key: 'deduccionesPersonalesAcum', isCumulative: true, isAccum: true },
    { label: 'Deducciones Totales Acumuladas', key: 'deduccionesTotalesAcum', isCumulative: true, isTotal: true },
    { label: 'Ganancia Neta Imponible', key: 'gananciaNeta', isCumulative: true, isResult: true },
    { label: 'Impuesto Determinado (Art. 94)', key: 'impuestoDeterminado', isCumulative: true, isResult: true },
    { label: 'Retenciones Meses Anteriores', key: 'retencionesAnteriores', isCumulative: true, isAccum: true },
    { label: 'Retención del Mes (antes de tope)', key: 'retencionDelMes' },
    { label: 'Tope 35% del Sueldo Neto', key: 'tope35' },
    { label: 'RETENCIÓN EFECTIVA', key: 'retencionEfectiva', isHighlight: true },
    { label: 'SUELDO NETO FINAL', key: 'sueldoNetoFinal', isHighlight: true },
];

function getValue(result, key) {
    if (key.startsWith('data.')) {
        return result.data[key.replace('data.', '')] ?? 0;
    }
    return result[key] ?? 0;
}

// ── Style helpers ────────────────────────────────────────────────
function makeStyle(row, isLabelCol = false, isTotalCol = false) {
    if (row.section) {
        return {
            font: FONT_SECTION,
            fill: { fgColor: { rgb: COLORS.sectionBg } },
            border: BORDER_THIN,
            alignment: { horizontal: isLabelCol ? 'left' : 'center', vertical: 'center' },
        };
    }
    if (row.isHighlight) {
        return {
            font: FONT_HIGHLIGHT,
            fill: { fgColor: { rgb: COLORS.highlightBg } },
            border: BORDER_BOTTOM_MEDIUM,
            alignment: { horizontal: isLabelCol ? 'left' : 'right', vertical: 'center' },
            numFmt: isLabelCol ? undefined : NUM_FMT,
        };
    }
    if (row.isResult) {
        return {
            font: FONT_RESULT,
            fill: { fgColor: { rgb: COLORS.resultBg } },
            border: BORDER_THIN,
            alignment: { horizontal: isLabelCol ? 'left' : 'right', vertical: 'center' },
            numFmt: isLabelCol ? undefined : NUM_FMT,
        };
    }
    if (row.isTotal) {
        return {
            font: FONT_BOLD,
            fill: { fgColor: { rgb: COLORS.totalBg } },
            border: BORDER_BOTTOM_MEDIUM,
            alignment: { horizontal: isLabelCol ? 'left' : 'right', vertical: 'center' },
            numFmt: isLabelCol ? undefined : NUM_FMT,
        };
    }
    if (row.isAccum) {
        return {
            font: { ...FONT_BASE, italic: true, color: { rgb: 'FF475569' } },
            fill: { fgColor: { rgb: COLORS.acumBg } },
            border: BORDER_THIN,
            alignment: { horizontal: isLabelCol ? 'left' : 'right', vertical: 'center' },
            numFmt: isLabelCol ? undefined : NUM_FMT,
        };
    }
    // Normal data row
    return {
        font: FONT_BASE,
        fill: { fgColor: { rgb: COLORS.white } },
        border: BORDER_THIN,
        alignment: { horizontal: isLabelCol ? 'left' : 'right', vertical: 'center' },
        numFmt: isLabelCol ? undefined : NUM_FMT,
    };
}

/**
 * Export the annual results to a styled Excel file (.xlsx) and trigger download.
 */
export function exportToExcel(results, config, params) {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Liquidación Anual ──────────────────────────────
    const header = ['Concepto', ...MONTHS_SHORT, 'TOTAL / PROMEDIO'];
    const sheetData = [header];

    // Track row metadata for styling
    const rowMeta = [{ isHeader: true }];

    for (const row of ROWS) {
        if (row.section) {
            sheetData.push([row.label, ...Array(13).fill('')]);
            rowMeta.push(row);
        } else {
            const values = results.map(r => getValue(r, row.key));
            const total = row.isCumulative
                ? values[values.length - 1]
                : values.reduce((a, b) => a + b, 0);
            sheetData.push([row.label, ...values, total]);
            rowMeta.push(row);
        }
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // ── Apply styles to each cell ────────────────────────────────
    const totalCols = header.length;

    for (let r = 0; r < sheetData.length; r++) {
        const meta = rowMeta[r];

        for (let c = 0; c < totalCols; c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            if (!ws[cellRef]) {
                ws[cellRef] = { v: '', t: 's' };
            }

            if (meta.isHeader) {
                // Header row
                ws[cellRef].s = {
                    font: FONT_HEADER,
                    fill: { fgColor: { rgb: COLORS.headerBg } },
                    border: BORDER_THIN,
                    alignment: {
                        horizontal: c === 0 ? 'left' : 'center',
                        vertical: 'center',
                        wrapText: true,
                    },
                };
            } else {
                const isLabelCol = c === 0;
                const isTotalCol = c === totalCols - 1;
                const style = makeStyle(meta, isLabelCol, isTotalCol);
                ws[cellRef].s = style;

                // Apply number format to numeric cells
                if (!isLabelCol && typeof ws[cellRef].v === 'number') {
                    ws[cellRef].z = NUM_FMT;
                }
            }
        }
    }

    // ── Column widths ────────────────────────────────────────────
    ws['!cols'] = [
        { wch: 42 },
        ...Array(12).fill({ wch: 17 }),
        { wch: 20 },
    ];

    // ── Row heights ──────────────────────────────────────────────
    ws['!rows'] = sheetData.map((_, i) => {
        if (i === 0) return { hpt: 28 }; // header
        if (rowMeta[i]?.section) return { hpt: 24 };
        if (rowMeta[i]?.isHighlight) return { hpt: 22 };
        return { hpt: 18 };
    });

    // Freeze first row and first column
    ws['!freeze'] = { xSplit: 1, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, ws, `Liquidación Anual ${params.year}`);

    // ── Sheet 2: Configuración ──────────────────────────────────
    const configRows = [
        ['Parámetro', 'Valor'],
        ['Año fiscal', params.year],
        ['Cónyuge a cargo', config.tieneConyuge ? 'SÍ' : 'NO'],
        ['Cantidad de hijos', config.cantidadHijos],
        ['Hijos incapacitados', config.hijosIncapacitados],
        ['Tipo deducción especial', config.tipoDeduccionEspecial],
        ['Incremento deducción especial', `${(params.incrementoDeduccionEspecial * 100).toFixed(0)}%`],
        ['Tope retención', `${(params.topeRetencion * 100).toFixed(0)}%`],
    ];
    const wsConfig = XLSX.utils.aoa_to_sheet(configRows);



    // Style config sheet
    for (let r = 0; r < configRows.length; r++) {
        for (let c = 0; c < 2; c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            if (!wsConfig[cellRef]) continue;
            if (r === 0) {
                wsConfig[cellRef].s = {
                    font: FONT_HEADER,
                    fill: { fgColor: { rgb: COLORS.headerBg } },
                    border: BORDER_THIN,
                    alignment: { horizontal: 'center', vertical: 'center' },
                };
            } else {
                wsConfig[cellRef].s = {
                    font: c === 0 ? FONT_BOLD : FONT_BASE,
                    fill: { fgColor: { rgb: r % 2 === 0 ? COLORS.totalBg : COLORS.white } },
                    border: BORDER_THIN,
                    alignment: { horizontal: c === 0 ? 'left' : 'center', vertical: 'center' },
                };
            }
        }
    }
    wsConfig['!cols'] = [{ wch: 36 }, { wch: 24 }];
    wsConfig['!rows'] = configRows.map((_, i) => ({ hpt: i === 0 ? 28 : 22 }));

    XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuración');

    // ── Generate file ──────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `ganancias-4ta-cat-${params.year}-${today}.xlsx`);
}
