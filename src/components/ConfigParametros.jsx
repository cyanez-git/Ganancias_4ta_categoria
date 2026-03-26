import { useState, useEffect } from 'react';
import { DEFAULT_PARAMS_2025, MONTHS } from '../engine/defaultParams';
import { formatCurrency, formatPercent } from '../engine/calculationEngine';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

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
    const [availableYears, setAvailableYears] = useState(['2025']);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch available years from Firebase
        const fetchYears = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'tax_parameters'));
                const years = querySnapshot.docs.map(d => d.id).sort((a,b) => b-a);
                if (years.length > 0 && !years.includes('2025')) {
                     years.push('2025');
                     years.sort((a,b) => b-a);
                }
                if (years.length > 0) {
                    setAvailableYears(years);
                }
            } catch (e) {
                console.warn("Could not fetch years from Firebase (might not be configured yet). Defaulting to 2025.");
            }
        };
        fetchYears();
    }, []);

    const handleYearChange = async (e) => {
        const selectedYear = e.target.value;

        setIsLoading(true);
        try {
            const docRef = doc(db, 'tax_parameters', selectedYear);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const firebaseParams = docSnap.data();
                setParams({ ...firebaseParams, year: parseInt(selectedYear) });
                alert(`Parámetros del año ${selectedYear} cargados exitosamente desde Firebase.`);
            } else {
                if (selectedYear === '2025') {
                    resetToDefaults();
                    alert('No se encontraron parámetros en Firebase para 2025. Se restauraron los valores por defecto del sistema.');
                } else {
                    alert('No se encontraron parámetros para el año seleccionado en la base de datos.');
                    e.target.value = params.year;
                }
            }
        } catch (error) {
            console.error("Error fetching rules:", error);
            if (selectedYear === '2025') {
                resetToDefaults();
                alert('Error al conectar con la base de datos. Se restauraron los valores por defecto locales para 2025.');
            } else {
                alert('Error al conectar con la base de datos para traer el nuevo año.');
                e.target.value = params.year;
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <label style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Año Fiscal Activo:
                        </label>
                        <select 
                            className="form-input" 
                            style={{ padding: '6px 12px', fontWeight: 'bold' }}
                            value={params.year || '2025'}
                            onChange={handleYearChange}
                            disabled={isLoading}
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <button className="btn btn-ghost" onClick={() => {
                        if (confirm('¿Restaurar todos los valores descargando la última versión oficial de este año desde la base de datos?')) {
                             handleYearChange({ target: { value: (params.year || 2025).toString() } });
                        }
                    }} disabled={isLoading}>
                        🔄 Restaurar Valores Naturales
                    </button>
                </div>
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
