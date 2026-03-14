/**
 * Excel export utility for Ganancias 4ta Categoría
 * Uses SheetJS (xlsx) to generate a downloadable .xlsx
 */
import * as XLSX from 'xlsx';
import { MONTHS_SHORT } from './defaultParams';
import { formatCurrency } from './calculationEngine';

/**
 * Rows to include in the annual summary sheet.
 * Each entry: { label, key } where key is a field of the result object,
 * or key starts with 'data.' for input fields.
 */
const ROWS = [
    { label: '1. INGRESOS', section: true },
    { label: 'Sueldo Básico', key: 'data.sueldoBasico' },
    { label: 'Total Ingresos del Mes', key: 'totalIngresos' },

    { label: '2. PLURIEMPLEO', section: true },
    { label: 'Total Pluriempleo', key: 'totalPluriempleo' },

    { label: '3. DESCUENTOS OBLIGATORIOS', section: true },
    { label: 'Base Descuentos (tope MoPRe)', key: 'baseDescuentos' },
    { label: 'Jubilación 11%', key: 'jubilacion' },
    { label: 'Obra Social 3%', key: 'obraSocial' },
    { label: 'INSSJP 3%', key: 'inssjp' },
    { label: 'Total Descuentos', key: 'totalDescuentos' },

    { label: '4. GANANCIA BRUTA', section: true },
    { label: 'Ganancia Bruta Pura (Sin SAC)', key: 'gananciaBrutaPuraMes' },
    { label: 'SAC Real Pagado', key: 'sacRealMes' },
    { label: 'Ganancia Bruta con SAC (Base Mes)', key: 'gananciaBrutaMes' },
    { label: 'Ganancia Bruta Pura Acumulada', key: 'gananciaBrutaPuraAcum', isCumulative: true },
    { label: 'SAC Real Acum.', key: 'sacRealAcum', isCumulative: true },
    { label: 'SAC Proporcional Prov. Acum', key: 'sacProporcionalAcum', isCumulative: true },
    { label: 'Ganancia Bruta Acumulada', key: 'gananciaBrutaAcum', isCumulative: true },

    { label: '5. DEDUCCIONES GENERALES', section: true },
    { label: 'Alquiler Pagado', key: 'data.alquilerPagado' },
    { label: 'Alquiler deducible 40% (c/tope GNI)', key: 'alquiler40' },
    { label: 'Alquiler deducible 10% (Ley 27.737)', key: 'alquiler10' },
    { label: 'Medicina Prepaga deducible', key: 'medicinaPreDeducible' },
    { label: 'Educación deducible', key: 'educacionDeducible' },
    { label: 'Seguro de Vida deducible', key: 'seguroVidaDeducible' },
    { label: 'Donaciones deducibles', key: 'donacionesDeducible' },
    { label: 'Deducciones sobre SAC (17%)', key: 'deduccionesSobreSAC' },
    { label: 'Total Deducciones Generales', key: 'totalDeduccionesGenerales' },

    { label: '6. DEDUCCIONES PERSONALES', section: true },
    { label: 'Ganancia No Imponible (MNI)', key: 'mni' },
    { label: 'Cónyuge', key: 'dedConyuge' },
    { label: 'Hijos', key: 'dedHijos' },
    { label: 'Hijos Incapacitados', key: 'dedHijosIncap' },
    { label: 'Deducción Especial', key: 'dedEspecial' },
    { label: 'Adicional Doceava Parte (Ley 27.743)', key: 'dedEspecialDoceavaParte' },
    { label: 'Total Deducciones Personales', key: 'totalDeduccionesPersonales' },

    { label: '7. RESULTADO', section: true },
    { label: 'Deducciones Totales Acumuladas', key: 'deduccionesTotalesAcum', isCumulative: true },
    { label: 'Ganancia Neta Imponible', key: 'gananciaNeta' },
    { label: 'Impuesto Determinado (Art. 94)', key: 'impuestoDeterminado' },
    { label: 'Retenciones Meses Anteriores', key: 'retencionesAnteriores', isCumulative: true },
    { label: 'Retención del Mes (antes de tope)', key: 'retencionDelMes' },
    { label: 'Tope 35% del Sueldo Neto', key: 'tope35' },
    { label: 'RETENCIÓN EFECTIVA', key: 'retencionEfectiva' },
    { label: 'SUELDO NETO FINAL', key: 'sueldoNetoFinal' },
];

function getValue(result, key) {
    if (key.startsWith('data.')) {
        return result.data[key.replace('data.', '')] ?? 0;
    }
    return result[key] ?? 0;
}

/**
 * Export the annual results to an Excel file (.xlsx) and trigger download.
 * @param {Array} results - Array of 12 month result objects from calculateAllMonths
 * @param {Object} config - Personal configuration
 * @param {Object} params - Year parameters
 */
export function exportToExcel(results, config, params) {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Liquidación Anual ──────────────────────────────
    const header = ['Concepto', ...MONTHS_SHORT, 'TOTAL / PROMEDIO'];
    const sheetData = [header];

    for (const row of ROWS) {
        if (row.section) {
            // Section separator row
            sheetData.push([row.label, ...Array(13).fill('')]);
        } else {
            const values = results.map(r => getValue(r, row.key));
            
            // Si la fila representa un valor acumulado a lo largo del año,
            // el total anual no es la suma de los 12 meses acumulándose sobre sí mismos, 
            // sino directamente el valor del último mes (ej. diciembre).
            const total = row.isCumulative 
                ? values[values.length - 1] 
                : values.reduce((a, b) => a + b, 0);
                
            sheetData.push([row.label, ...values, total]);
        }
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Column widths
    ws['!cols'] = [
        { wch: 42 },
        ...Array(12).fill({ wch: 16 }),
        { wch: 18 },
    ];

    // Apply number format to all value cells (skip header and section rows)
    const numFmt = '#,##0.00';
    for (let r = 1; r < sheetData.length; r++) {
        const rowData = sheetData[r];
        if (rowData.length < 2 || rowData[1] === '') continue; // section row
        for (let c = 1; c < rowData.length; c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
                ws[cellRef].z = numFmt;
            }
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Liquidación Anual 2025');

    // ── Sheet 2: Configuración ──────────────────────────────────
    const configData = [
        ['Parámetro', 'Valor'],
        ['Año fiscal', params.year],
        ['Cónyuge a cargo', config.tieneConyuge ? 'SÍ' : 'NO'],
        ['Cantidad de hijos', config.cantidadHijos],
        ['Hijos incapacitados', config.hijosIncapacitados],
        ['Tipo deducción especial', config.tipoDeduccionEspecial],
        ['Incremento deducción especial', `${(params.incrementoDeduccionEspecial * 100).toFixed(0)}%`],
        ['Tope retención', `${(params.topeRetencion * 100).toFixed(0)}%`],
    ];
    const wsConfig = XLSX.utils.aoa_to_sheet(configData);
    wsConfig['!cols'] = [{ wch: 32 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuración');

    // ── Generate file ──────────────────────────────────────────
    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `ganancias-4ta-cat-${params.year}-${today}.xlsx`);
}
