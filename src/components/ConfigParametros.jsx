import { useState } from 'react';
import { DEFAULT_PARAMS_2025, MONTHS } from '../engine/defaultParams';
import { formatCurrency, formatPercent } from '../engine/calculationEngine';

function EditableCell({ value, onChange }) {
    return (
        <input
            type="number"
            className="form-input input-yellow"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            step="0.01"
            style={{ width: '130px', fontSize: 'var(--font-sm)', padding: '4px 8px', textAlign: 'right' }}
        />
    );
}

export default function ConfigParametros({ params, setParams, resetToDefaults }) {
    const [activeSem, setActiveSem] = useState('sem1');

    const updateDedPersonal = (sem, key, value) => {
        setParams(prev => ({
            ...prev,
            deduccionesPersonales: {
                ...prev.deduccionesPersonales,
                [sem]: { ...prev.deduccionesPersonales[sem], [key]: value },
            },
        }));
    };

    const updateEscala = (sem, index, key, value) => {
        setParams(prev => {
            const newEscalas = [...prev.escalas[sem]];
            newEscalas[index] = { ...newEscalas[index], [key]: value };
            return {
                ...prev,
                escalas: { ...prev.escalas, [sem]: newEscalas },
            };
        });
    };

    const updateMoPre = (index, value) => {
        setParams(prev => {
            const newTopes = [...prev.topesMoPre];
            newTopes[index] = value;
            return { ...prev, topesMoPre: newTopes };
        });
    };

    const dedFields = [
        { key: 'gananciaNoImponible', label: 'Ganancia No Imponible (MNI)' },
        { key: 'conyuge', label: 'Deducción por Cónyuge' },
        { key: 'hijo', label: 'Deducción por Hijo' },
        { key: 'hijoIncapacitado', label: 'Deducción por Hijo Incapacitado' },
        { key: 'deduccionEspecialGeneral', label: 'Deducción Especial - General' },
        { key: 'deduccionEspecialProfesionales', label: 'Deducción Especial - Profesionales' },
        { key: 'deduccionEspecialZonaDesfavorable', label: 'Deducción Especial - Zona Desfavorable' },
    ];

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>⚙️ Parámetros Anuales</h1>
                    <p className="subtitle">Configurá las deducciones, escalas y topes oficiales ARCA</p>
                </div>
                <button className="btn btn-ghost" onClick={() => {
                    if (confirm('¿Restaurar todos los valores a los predeterminados 2025?')) resetToDefaults();
                }}>
                    🔄 Restaurar 2025
                </button>
            </div>

            {/* Semester toggle */}
            <div className="view-toggle" style={{ marginBottom: 'var(--space-lg)' }}>
                <button className={`view-btn ${activeSem === 'sem1' ? 'active' : ''}`} onClick={() => setActiveSem('sem1')}>
                    Enero - Junio
                </button>
                <button className={`view-btn ${activeSem === 'sem2' ? 'active' : ''}`} onClick={() => setActiveSem('sem2')}>
                    Julio - Diciembre
                </button>
            </div>

            <div className="params-grid">
                {/* Deducciones Personales */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <span className="icon">👤</span>
                            Deducciones Personales ({activeSem === 'sem1' ? 'Ene-Jun' : 'Jul-Dic'})
                        </div>
                    </div>
                    <table className="params-table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th style={{ textAlign: 'right' }}>Valor Mensual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dedFields.map(f => (
                                <tr key={f.key}>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{f.label}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <EditableCell
                                            value={params.deduccionesPersonales[activeSem][f.key]}
                                            onChange={(v) => updateDedPersonal(activeSem, f.key, v)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Topes MoPRe */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <span className="icon">📊</span>
                            Topes MoPRe Mensuales
                        </div>
                    </div>
                    <table className="params-table">
                        <thead>
                            <tr>
                                <th>Mes</th>
                                <th style={{ textAlign: 'right' }}>Tope</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MONTHS.map((month, i) => (
                                <tr key={i}>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{month}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <EditableCell
                                            value={params.topesMoPre[i]}
                                            onChange={(v) => updateMoPre(i, v)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Escalas Progresivas */}
            <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
                <div className="card-header">
                    <div className="card-title">
                        <span className="icon">📈</span>
                        Escalas Progresivas Art. 94 ({activeSem === 'sem1' ? 'Enero - Junio' : 'Julio - Diciembre'})
                    </div>
                </div>
                <div className="annual-table-container">
                    <table className="annual-table">
                        <thead>
                            <tr>
                                <th>Desde</th>
                                <th>Hasta</th>
                                <th>Fijo</th>
                                <th>% Sobre Excedente</th>
                                <th>Excedente De</th>
                            </tr>
                        </thead>
                        <tbody>
                            {params.escalas[activeSem].map((tramo, i) => (
                                <tr key={i}>
                                    <td>
                                        <EditableCell value={tramo.desde} onChange={(v) => updateEscala(activeSem, i, 'desde', v)} />
                                    </td>
                                    <td>
                                        {tramo.hasta === Infinity ? (
                                            <span style={{ color: 'var(--text-muted)' }}>∞</span>
                                        ) : (
                                            <EditableCell value={tramo.hasta} onChange={(v) => updateEscala(activeSem, i, 'hasta', v)} />
                                        )}
                                    </td>
                                    <td>
                                        <EditableCell value={tramo.fijo} onChange={(v) => updateEscala(activeSem, i, 'fijo', v)} />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>
                                            {formatPercent(tramo.porcentaje)}
                                        </span>
                                    </td>
                                    <td>
                                        <EditableCell value={tramo.excedenteDe} onChange={(v) => updateEscala(activeSem, i, 'excedenteDe', v)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Porcentajes */}
            <div className="card" style={{ marginTop: 'var(--space-lg)', maxWidth: '400px' }}>
                <div className="card-header">
                    <div className="card-title">
                        <span className="icon">📌</span>
                        Porcentajes
                    </div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Jubilación</span>
                        <span style={{ fontWeight: 600 }}>{formatPercent(params.porcentajes.jubilacion)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Obra Social</span>
                        <span style={{ fontWeight: 600 }}>{formatPercent(params.porcentajes.obraSocial)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>INSSJP</span>
                        <span style={{ fontWeight: 600 }}>{formatPercent(params.porcentajes.inssjp)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Incremento Ded. Especial (Ley 27.743)</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-accent)' }}>{formatPercent(params.incrementoDeduccionEspecial)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>Tope Retención</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-yellow)' }}>{formatPercent(params.topeRetencion)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
