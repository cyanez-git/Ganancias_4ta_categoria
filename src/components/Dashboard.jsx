import { useMemo } from 'react';
import { MONTHS_SHORT } from '../engine/defaultParams';
import { formatCurrency, formatPercent } from '../engine/calculationEngine';
import { generatePDFReport } from '../engine/pdfReportGenerator';
import { exportToExcel } from '../engine/excelExporter';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement, PointElement,
    ChartTitle, Tooltip, Legend, Filler
);

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#94a3b8',
                font: { family: 'Inter', size: 11 },
                boxWidth: 12,
                padding: 16,
            },
        },
        tooltip: {
            backgroundColor: 'rgba(26, 31, 53, 0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderWidth: 1,
            padding: 12,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'Inter' },
            callbacks: {
                label: function (context) {
                    return context.dataset.label + ': ' + formatCurrency(context.raw);
                }
            }
        },
    },
    scales: {
        x: {
            grid: { color: 'rgba(99, 102, 241, 0.08)' },
            ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        },
        y: {
            grid: { color: 'rgba(99, 102, 241, 0.08)' },
            ticks: {
                color: '#64748b',
                font: { family: 'Inter', size: 10 },
                callback: function (value) {
                    if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
                    return '$' + value;
                }
            },
        },
    },
};

export default function Dashboard({ results, config, params }) {
    const totals = useMemo(() => {
        let totalRetenido = 0;
        let totalBruto = 0;
        let totalNeto = 0;
        let mesesConDatos = 0;

        results.forEach(r => {
            totalRetenido += r.retencionEfectiva;
            totalBruto += r.gananciaBrutaMes;
            totalNeto += r.sueldoNetoFinal;
            if (r.totalIngresos > 0) mesesConDatos++;
        });

        const alicuotaEfectiva = totalBruto > 0 ? totalRetenido / totalBruto : 0;
        const promedioNeto = mesesConDatos > 0 ? totalNeto / mesesConDatos : 0;

        return { totalRetenido, totalBruto, totalNeto, mesesConDatos, alicuotaEfectiva, promedioNeto };
    }, [results]);

    const barData = useMemo(() => ({
        labels: MONTHS_SHORT,
        datasets: [
            {
                label: 'Retención Efectiva',
                data: results.map(r => r.retencionEfectiva),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    }), [results]);

    const lineData = useMemo(() => ({
        labels: MONTHS_SHORT,
        datasets: [
            {
                label: 'Ganancia Bruta',
                data: results.map(r => r.gananciaBrutaMes),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#8b5cf6',
            },
            {
                label: 'Sueldo Neto',
                data: results.map(r => r.sueldoNetoFinal),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
            },
        ],
    }), [results]);

    const compositionData = useMemo(() => ({
        labels: MONTHS_SHORT,
        datasets: [
            {
                label: 'Descuentos',
                data: results.map(r => r.totalDescuentos),
                backgroundColor: 'rgba(251, 191, 36, 0.6)',
                borderColor: '#f59e0b',
                borderWidth: 1,
                borderRadius: 3,
            },
            {
                label: 'Retención',
                data: results.map(r => r.retencionEfectiva),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: '#ef4444',
                borderWidth: 1,
                borderRadius: 3,
            },
            {
                label: 'Neto',
                data: results.map(r => r.sueldoNetoFinal),
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: '#10b981',
                borderWidth: 1,
                borderRadius: 3,
            },
        ],
    }), [results]);

    const stackedOptions = {
        ...chartDefaults,
        plugins: {
            ...chartDefaults.plugins,
        },
        scales: {
            ...chartDefaults.scales,
            x: { ...chartDefaults.scales.x, stacked: true },
            y: { ...chartDefaults.scales.y, stacked: true },
        },
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>📊 Dashboard</h1>
                    <p className="subtitle">Resumen general del ejercicio fiscal 2025</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => exportToExcel(results, config, params)}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        📊 Exportar Excel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => generatePDFReport(results, config, params)}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        📄 Generar Informe PDF
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-label">Total Retenido Acumulado</div>
                    <div className="kpi-value negative">{formatCurrency(totals.totalRetenido)}</div>
                    <div className="kpi-change">{totals.mesesConDatos} meses con datos</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Sueldo Neto Promedio</div>
                    <div className="kpi-value positive">{formatCurrency(totals.promedioNeto)}</div>
                    <div className="kpi-change">Promedio mensual</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Alícuota Efectiva</div>
                    <div className="kpi-value accent">{formatPercent(totals.alicuotaEfectiva)}</div>
                    <div className="kpi-change">Retención / Ganancia Bruta</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Bruto Anual</div>
                    <div className="kpi-value">{formatCurrency(totals.totalBruto)}</div>
                    <div className="kpi-change">Ganancia bruta acumulada</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <span className="icon">📊</span>
                            Retención Mensual
                        </div>
                    </div>
                    <div className="chart-container">
                        <Bar data={barData} options={chartDefaults} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <span className="icon">📈</span>
                            Evolución Bruto vs. Neto
                        </div>
                    </div>
                    <div className="chart-container">
                        <Line data={lineData} options={chartDefaults} />
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="card-header">
                    <div className="card-title">
                        <span className="icon">📉</span>
                        Composición del Sueldo
                    </div>
                </div>
                <div className="chart-container">
                    <Bar data={compositionData} options={stackedOptions} />
                </div>
            </div>

            {/* Summary Table (Resumen cálculo like Excel sheet) */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <span className="icon">📋</span>
                        Resumen por ARCA Mapeo V3
                    </div>
                </div>
                <div className="annual-table-container">
                    <table className="annual-table">
                        <thead>
                            <tr>
                                <th>Paso</th>
                                {MONTHS_SHORT.map(m => <th key={m}>{m}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1. Ganancia bruta (A)</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.gananciaBrutaMes)}</td>)}
                            </tr>
                            <tr>
                                <td>2. Ret. no habituales (B)</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.data.noRemunerativosNoHabituales)}</td>)}
                            </tr>
                            <tr>
                                <td>3. SAC (C)</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.sacProporcional)}</td>)}
                            </tr>
                            <tr>
                                <td>4. Deducciones (D)</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.totalDeduccionesGenerales)}</td>)}
                            </tr>
                            <tr>
                                <td>8. Gan. neta acum.</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.gananciaBrutaConSACAcum)}</td>)}
                            </tr>
                            <tr>
                                <td>9. Ded. personales acum. (E)</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.deduccionesPersonalesAcum)}</td>)}
                            </tr>
                            <tr>
                                <td>10. Gan. neta sujeta imp.</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.gananciaNeta)}</td>)}
                            </tr>
                            <tr>
                                <td>11. Impuesto det. (F)</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.impuestoDeterminado)}</td>)}
                            </tr>
                            <tr className="highlight-row">
                                <td>15. Retención efectiva</td>
                                {results.map((r, i) => <td key={i}>{formatCurrency(r.retencionEfectiva)}</td>)}
                            </tr>
                            <tr className="highlight-row">
                                <td style={{ color: 'var(--text-green)' }}>Sueldo Neto</td>
                                {results.map((r, i) => <td key={i} style={{ color: 'var(--text-green)' }}>{formatCurrency(r.sueldoNetoFinal)}</td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
