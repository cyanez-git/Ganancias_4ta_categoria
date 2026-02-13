/**
 * PDF Report Generator for Ganancias 4ta Categoría
 * Generates a professional 3-page PDF report using jsPDF + jspdf-autotable
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MONTHS, MONTHS_SHORT } from './defaultParams';
import { formatCurrency, formatPercent } from './calculationEngine';

// ── Color Palette ────────────────────────────────────────────
const COLORS = {
    primary: [99, 102, 241],       // Indigo
    primaryDark: [79, 82, 221],    // Darker indigo
    accent: [139, 92, 246],        // Purple
    dark: [11, 14, 23],            // Background
    cardBg: [26, 31, 53],          // Card background
    text: [241, 245, 249],         // Primary text
    textSecondary: [148, 163, 184],// Secondary text
    green: [16, 185, 129],         // Success
    red: [239, 68, 68],            // Danger
    yellow: [245, 158, 11],        // Warning
    white: [255, 255, 255],
    headerRow: [35, 42, 74],       // Table header
    evenRow: [20, 25, 45],         // Even rows
    oddRow: [15, 19, 35],          // Odd rows
};

// ── Helpers ──────────────────────────────────────────────────
function fmtCur(v) {
    if (v === null || v === undefined || isNaN(v)) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(v);
}

function addFooter(doc, pageNum, totalPages) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Separator line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.3);
    doc.line(20, pageHeight - 18, pageWidth - 20, pageHeight - 18);

    // Left text
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text('Generado por Calculadora Ganancias 4ta Cat. — Uso informativo, no reemplaza asesoramiento profesional', 20, pageHeight - 12);

    // Right page number
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.primary);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 20, pageHeight - 12, { align: 'right' });
}

function drawGradientHeader(doc, y, height) {
    const pageWidth = doc.internal.pageSize.getWidth();
    // Simulate gradient with multiple rectangles
    const steps = 20;
    const stepWidth = pageWidth / steps;
    for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = Math.round(COLORS.primary[0] + (COLORS.accent[0] - COLORS.primary[0]) * ratio);
        const g = Math.round(COLORS.primary[1] + (COLORS.accent[1] - COLORS.primary[1]) * ratio);
        const b = Math.round(COLORS.primary[2] + (COLORS.accent[2] - COLORS.primary[2]) * ratio);
        doc.setFillColor(r, g, b);
        doc.rect(i * stepWidth, y, stepWidth + 1, height, 'F');
    }
}

// ── Main Export ──────────────────────────────────────────────
export function generatePDFReport(results, config, params) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const totalPages = 3;

    // Compute summary
    let totalRetenido = 0, totalBruto = 0, totalNeto = 0, mesesConDatos = 0;
    results.forEach(r => {
        totalRetenido += r.retencionEfectiva;
        totalBruto += r.gananciaBrutaMes;
        totalNeto += r.sueldoNetoFinal;
        if (r.totalIngresos > 0) mesesConDatos++;
    });
    const alicuotaEfectiva = totalBruto > 0 ? totalRetenido / totalBruto : 0;
    const promedioNeto = mesesConDatos > 0 ? totalNeto / mesesConDatos : 0;

    // ═══════════════════════════════════════════════════════════
    // PAGE 1 — Cover & KPIs
    // ═══════════════════════════════════════════════════════════

    // Dark background
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

    // Gradient header bar
    drawGradientHeader(doc, 0, 40);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.white);
    doc.text('INFORME DE RETENCIONES', 20, 18);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Impuesto a las Ganancias — 4ta Categoría', 20, 28);

    // Year badge
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const yearText = `Año Fiscal ${params.year || 2025}`;
    const yearWidth = doc.getTextWidth(yearText) + 16;
    doc.setFillColor(255, 255, 255, 40);
    doc.roundedRect(pageWidth - 20 - yearWidth, 12, yearWidth, 16, 3, 3, 'F');
    doc.setTextColor(...COLORS.white);
    doc.text(yearText, pageWidth - 20 - yearWidth + 8, 23);

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.white);
    doc.text(`Generado: ${dateStr}`, pageWidth - 20, 34, { align: 'right' });

    // ── KPI Cards ────────────────────────────────────────────
    const kpiY = 52;
    const kpiWidth = (pageWidth - 60) / 4;
    const kpiHeight = 38;
    const kpis = [
        { label: 'Total Retenido Acumulado', value: fmtCur(totalRetenido), color: COLORS.red },
        { label: 'Sueldo Neto Promedio', value: fmtCur(promedioNeto), color: COLORS.green },
        { label: 'Alícuota Efectiva', value: formatPercent(alicuotaEfectiva), color: COLORS.primary },
        { label: 'Total Bruto Anual', value: fmtCur(totalBruto), color: COLORS.accent },
    ];

    kpis.forEach((kpi, i) => {
        const x = 20 + i * (kpiWidth + 6.67);

        // Card background
        doc.setFillColor(...COLORS.cardBg);
        doc.roundedRect(x, kpiY, kpiWidth, kpiHeight, 3, 3, 'F');

        // Top accent bar
        doc.setFillColor(...kpi.color);
        doc.rect(x, kpiY, kpiWidth, 3, 'F');

        // Label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textSecondary);
        doc.text(kpi.label, x + 8, kpiY + 14);

        // Value
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...kpi.color);
        doc.text(kpi.value, x + 8, kpiY + 28);
    });

    // ── Personal Config Section ──────────────────────────────
    const configY = kpiY + kpiHeight + 16;

    doc.setFillColor(...COLORS.cardBg);
    doc.roundedRect(20, configY, pageWidth - 40, 30, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('CONFIGURACIÓN PERSONAL', 30, configY + 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);

    const configItems = [
        `Cónyuge a cargo: ${config.tieneConyuge ? 'Sí' : 'No'}`,
        `Hijos: ${config.cantidadHijos}`,
        `Hijos incapacitados: ${config.hijosIncapacitados}`,
        `Tipo deducción especial: ${config.tipoDeduccionEspecial}`,
    ];

    const configItemWidth = (pageWidth - 60) / 4;
    configItems.forEach((item, i) => {
        doc.text(item, 30 + i * configItemWidth, configY + 22);
    });

    // ── Monthly Summary Mini Table ───────────────────────────
    const miniTableY = configY + 40;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('RESUMEN MENSUAL', 20, miniTableY);

    doc.autoTable({
        startY: miniTableY + 4,
        margin: { left: 20, right: 20 },
        head: [['Concepto', ...MONTHS_SHORT]],
        body: [
            ['Ganancia Bruta', ...results.map(r => fmtCur(r.gananciaBrutaMes))],
            ['Descuentos', ...results.map(r => fmtCur(r.totalDescuentos))],
            ['Retención', ...results.map(r => fmtCur(r.retencionEfectiva))],
            ['Sueldo Neto', ...results.map(r => fmtCur(r.sueldoNetoFinal))],
        ],
        theme: 'plain',
        styles: {
            fillColor: COLORS.oddRow,
            textColor: COLORS.text,
            fontSize: 7,
            cellPadding: 2,
            font: 'helvetica',
            lineWidth: 0,
        },
        headStyles: {
            fillColor: COLORS.headerRow,
            textColor: COLORS.primary,
            fontStyle: 'bold',
            fontSize: 7,
            halign: 'right',
        },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold', cellWidth: 30 },
        },
        alternateRowStyles: {
            fillColor: COLORS.evenRow,
        },
        didParseCell: function (data) {
            if (data.column.index > 0) {
                data.cell.styles.halign = 'right';
            }
            // Highlight "Sueldo Neto" row
            if (data.row.index === 3 && data.section === 'body') {
                data.cell.styles.textColor = COLORS.green;
                data.cell.styles.fontStyle = 'bold';
            }
            // Highlight "Retención" row
            if (data.row.index === 2 && data.section === 'body') {
                data.cell.styles.textColor = COLORS.red;
            }
        },
    });

    addFooter(doc, 1, totalPages);

    // ═══════════════════════════════════════════════════════════
    // PAGE 2 — ARCA Mapeo V3 Summary Table
    // ═══════════════════════════════════════════════════════════
    doc.addPage('a4', 'landscape');

    // Dark background
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

    // Header bar
    drawGradientHeader(doc, 0, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.white);
    doc.text('RESUMEN CÁLCULO — ARCA MAPEO V3', 20, 14);

    const v3Rows = [
        { label: '1. Ganancia bruta del mes', values: results.map(r => r.gananciaBrutaMes), style: 'normal' },
        { label: '2. Ret. no habituales', values: results.map(r => r.data.noRemunerativosNoHabituales), style: 'normal' },
        { label: '3. SAC Proporcional', values: results.map(r => r.sacProporcional), style: 'normal' },
        { label: '4. Descuentos obligatorios', values: results.map(r => r.totalDescuentos), style: 'normal' },
        { label: '5. Deducciones generales', values: results.map(r => r.totalDeduccionesGenerales), style: 'normal' },
        { label: '8. Gan. neta acumulada', values: results.map(r => r.gananciaBrutaConSACAcum), style: 'accent' },
        { label: '9. Ded. personales acum.', values: results.map(r => r.deduccionesPersonalesAcum), style: 'normal' },
        { label: '10. Gan. neta suj. impuesto', values: results.map(r => r.gananciaNeta), style: 'accent' },
        { label: '11. Impuesto determinado', values: results.map(r => r.impuestoDeterminado), style: 'warning' },
        { label: '12-14. Ret. anteriores + p/cta', values: results.map(r => r.retencionesAnteriores + r.data.pagosACuenta), style: 'normal' },
        { label: '15. RETENCIÓN EFECTIVA', values: results.map(r => r.retencionEfectiva), style: 'danger' },
        { label: 'SUELDO NETO FINAL', values: results.map(r => r.sueldoNetoFinal), style: 'success' },
    ];

    doc.autoTable({
        startY: 28,
        margin: { left: 10, right: 10 },
        head: [['Paso / Concepto', ...MONTHS_SHORT]],
        body: v3Rows.map(row => [row.label, ...row.values.map(v => fmtCur(v))]),
        theme: 'plain',
        styles: {
            fillColor: COLORS.oddRow,
            textColor: COLORS.text,
            fontSize: 7.5,
            cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
            font: 'helvetica',
            lineWidth: 0,
        },
        headStyles: {
            fillColor: COLORS.headerRow,
            textColor: COLORS.primary,
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'right',
        },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold', cellWidth: 48 },
        },
        alternateRowStyles: {
            fillColor: COLORS.evenRow,
        },
        didParseCell: function (data) {
            if (data.column.index > 0) {
                data.cell.styles.halign = 'right';
            }

            if (data.section === 'body') {
                const rowStyle = v3Rows[data.row.index]?.style;

                if (rowStyle === 'success') {
                    data.cell.styles.textColor = COLORS.green;
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [16, 30, 28];
                } else if (rowStyle === 'danger') {
                    data.cell.styles.textColor = COLORS.red;
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [40, 15, 15];
                } else if (rowStyle === 'warning') {
                    data.cell.styles.textColor = COLORS.yellow;
                } else if (rowStyle === 'accent') {
                    data.cell.styles.textColor = COLORS.primary;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
    });

    addFooter(doc, 2, totalPages);

    // ═══════════════════════════════════════════════════════════
    // PAGE 3 — Monthly Detail
    // ═══════════════════════════════════════════════════════════
    doc.addPage('a4', 'landscape');

    // Dark background
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

    // Header bar
    drawGradientHeader(doc, 0, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.white);
    doc.text('DETALLE DE INGRESOS Y DESCUENTOS POR MES', 20, 14);

    const detailRows = [
        { label: 'Sueldo Básico', values: results.map(r => r.data.sueldoBasico) },
        { label: 'Adicionales Habituales', values: results.map(r => r.data.adicionalesHabituales) },
        { label: 'Antigüedad', values: results.map(r => r.data.antiguedad) },
        { label: 'Comisiones', values: results.map(r => r.data.comisiones) },
        { label: 'Plus Vacacional', values: results.map(r => r.data.plusVacacional) },
        { label: 'Otros Remunerativos', values: results.map(r => r.data.otrosRemunerativos) },
        { label: 'SAC / Aguinaldo', values: results.map(r => r.data.sacAguinaldo) },
        { label: 'TOTAL INGRESOS', values: results.map(r => r.totalIngresos), style: 'total' },
        { label: '—', values: Array(12).fill(''), style: 'separator' },
        { label: 'Jubilación (11%)', values: results.map(r => r.jubilacion) },
        { label: 'Obra Social (3%)', values: results.map(r => r.obraSocial) },
        { label: 'INSSJP (3%)', values: results.map(r => r.inssjp) },
        { label: 'Aportes Sindicales', values: results.map(r => r.data.aportesSindicales) },
        { label: 'TOTAL DESCUENTOS', values: results.map(r => r.totalDescuentos), style: 'total-red' },
        { label: '—', values: Array(12).fill(''), style: 'separator' },
        { label: 'Retención Ganancias', values: results.map(r => r.retencionEfectiva), style: 'danger' },
        { label: 'SUELDO NETO FINAL', values: results.map(r => r.sueldoNetoFinal), style: 'success' },
    ];

    doc.autoTable({
        startY: 28,
        margin: { left: 10, right: 10 },
        head: [['Concepto', ...MONTHS_SHORT]],
        body: detailRows.map(row => [
            row.label,
            ...row.values.map(v => typeof v === 'string' ? v : fmtCur(v))
        ]),
        theme: 'plain',
        styles: {
            fillColor: COLORS.oddRow,
            textColor: COLORS.text,
            fontSize: 7,
            cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
            font: 'helvetica',
            lineWidth: 0,
        },
        headStyles: {
            fillColor: COLORS.headerRow,
            textColor: COLORS.primary,
            fontStyle: 'bold',
            fontSize: 7.5,
            halign: 'right',
        },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 },
        },
        alternateRowStyles: {
            fillColor: COLORS.evenRow,
        },
        didParseCell: function (data) {
            if (data.column.index > 0) {
                data.cell.styles.halign = 'right';
            }

            if (data.section === 'body') {
                const rowStyle = detailRows[data.row.index]?.style;

                if (rowStyle === 'total') {
                    data.cell.styles.textColor = COLORS.primary;
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = COLORS.headerRow;
                } else if (rowStyle === 'total-red') {
                    data.cell.styles.textColor = COLORS.yellow;
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = COLORS.headerRow;
                } else if (rowStyle === 'separator') {
                    data.cell.styles.fillColor = COLORS.dark;
                    data.cell.styles.cellPadding = { top: 1, bottom: 1 };
                    data.cell.styles.fontSize = 4;
                } else if (rowStyle === 'success') {
                    data.cell.styles.textColor = COLORS.green;
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [16, 30, 28];
                } else if (rowStyle === 'danger') {
                    data.cell.styles.textColor = COLORS.red;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
    });

    addFooter(doc, 3, totalPages);

    // ── Save ─────────────────────────────────────────────────
    const filename = `Informe_Ganancias_4ta_Cat_${params.year || 2025}_${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
}
