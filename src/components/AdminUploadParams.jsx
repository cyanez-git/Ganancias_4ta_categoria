import { useState } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { extractTextFromPDF } from '../engine/pdfParser';
import { parseDeducciones, parseEscalas } from '../engine/pdfExtractionLogic';
import { MONTHS_SHORT } from '../engine/defaultParams';

export default function AdminUploadParams() {
    const [step, setStep] = useState(1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [files, setFiles] = useState({});
    const [isParsing, setIsParsing] = useState(false);
    
    // Manual parameters to confirm
    const [manualParams, setManualParams] = useState({
        topesMoPre: Array(12).fill(2910574),
        porcentajes: {
            jubilacion: 0.11,
            obraSocial: 0.03,
            inssjp: 0.03
        },
        incrementoDeduccionEspecial: 0.22,
        topeRetencion: 0.35
    });

    const [parsedData, setParsedData] = useState(null);

    const handleFileChange = (e, type) => {
        setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
    };

    const handleProcessFiles = async () => {
        setIsParsing(true);
        try {
            const requiredFiles = ['ded_sem1', 'ded_sem2', 'esc_sem1', 'esc_sem2'];
            for (const f of requiredFiles) {
                if (!files[f]) throw new Error(`Falta cargar el archivo: ${f}`);
            }

            // Parse text from all 4 required PDFs
            const textDedS1 = await extractTextFromPDF(files.ded_sem1);
            const textDedS2 = await extractTextFromPDF(files.ded_sem2);
            const textEscS1 = await extractTextFromPDF(files.esc_sem1);
            const textEscS2 = await extractTextFromPDF(files.esc_sem2);

            // Execute Regex extractors
            const dedS1 = parseDeducciones(textDedS1);
            const dedS2 = parseDeducciones(textDedS2);
            const escS1 = parseEscalas(textEscS1, 'ENERO');
            const escS2 = parseEscalas(textEscS2, 'JULIO');

            const dynamicParsedData = {
                deduccionesPersonales: {
                    sem1: dedS1,
                    sem2: dedS2
                },
                escalas: {
                    sem1: escS1,
                    sem2: escS2
                }
            };
            
            setParsedData(dynamicParsedData);
            setStep(2); // Move to manual confirmation step
        } catch (error) {
            console.error(error);
            alert("Error procesando los PDFs. Por favor revisá que los archivos sean correctos: " + error.message);
        } finally {
            setIsParsing(false);
        }
    };

    const handleSaveToFirebase = async () => {
        setIsParsing(true);
        try {
            const finalDoc = {
                year: parseInt(year),
                ...parsedData, // Auto-extracted
                ...manualParams // Manually confirmed
            };
            
            await setDoc(doc(db, 'tax_parameters', year.toString()), finalDoc);
            alert(`✅ Parámetros del año ${year} guardados en Firebase con éxito!`);
            setStep(1);
            setFiles({});
        } catch (error) {
            console.error("Error saving to Firebase:", error);
            alert("Error al guardar en Firebase. Verificá los permisos.");
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-header">
                <h2>Carga de Parámetros AFIP (Administrador)</h2>
            </div>

            {step === 1 && (
                <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="form-label">Año a Cargar / Actualizar:</label>
                        <input 
                            type="number" 
                            className="form-input" 
                            value={year} 
                            onChange={(e) => setYear(e.target.value)} 
                        />
                    </div>
                    
                    <p style={{ marginBottom: '15px' }}>Subí los 5 PDFs oficiales de ARCA/AFIP para procesarlos:</p>
                    
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div>
                            <label className="form-label" style={{ fontSize: 'var(--font-sm)' }}>1. Deducciones Sem. 1</label>
                            <input type="file" accept=".pdf" className="form-input" onChange={(e) => handleFileChange(e, 'ded_sem1')} />
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: 'var(--font-sm)' }}>2. Deducciones Sem. 2</label>
                            <input type="file" accept=".pdf" className="form-input" onChange={(e) => handleFileChange(e, 'ded_sem2')} />
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: 'var(--font-sm)' }}>3. Escalas Sem. 1 (Art 94)</label>
                            <input type="file" accept=".pdf" className="form-input" onChange={(e) => handleFileChange(e, 'esc_sem1')} />
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: 'var(--font-sm)' }}>4. Escalas Sem. 2 (Art 94)</label>
                            <input type="file" accept=".pdf" className="form-input" onChange={(e) => handleFileChange(e, 'esc_sem2')} />
                        </div>
                    </div>

                    <button 
                        className="btn btn-primary" 
                        style={{ marginTop: '30px', width: '100%' }}
                        onClick={handleProcessFiles}
                        disabled={isParsing}
                    >
                        {isParsing ? 'Procesando PDFs...' : '➡️ Procesar Documentos'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div style={{ padding: '20px' }}>
                    <div className="alert-warning" style={{ background: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                        <strong>⚠️ VALIDACIÓN MANUAL REQUERIDA</strong><br/>
                        Los parámetros centrales se extrajeron de los PDFs. Sin embargo, debés confirmar los siguientes topes y porcentajes (que no están en los archivos de AFIP).
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <h4>Topes MoPRe</h4>
                            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: '10px' }}>Tope de base imponible previsional aplicable por mes. (Al modificar Ene, se autocompletan los siguientes).</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {MONTHS_SHORT.map((mes, idx) => (
                                    <div key={mes} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ width: '35px', fontSize: 'var(--font-sm)', fontWeight: 'bold' }}>{mes}</label>
                                        <input 
                                            type="number" 
                                            className="form-input" 
                                            value={manualParams.topesMoPre[idx]} 
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                const newTopes = [...manualParams.topesMoPre];
                                                newTopes[idx] = val;
                                                
                                                // Auto-fill down if Jan is modified
                                                if (idx === 0) {
                                                    for (let i = 1; i < 12; i++) {
                                                        newTopes[i] = val;
                                                    }
                                                }
                                                setManualParams({ ...manualParams, topesMoPre: newTopes });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4>Descuentos de Ley</h4>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                <div>
                                    <label className="form-label" style={{ fontSize: 'var(--font-sm)' }}>Jubilación (%)</label>
                                    <input type="number" step="0.01" className="form-input" value={manualParams.porcentajes.jubilacion} onChange={(e) => setManualParams(p => ({...p, porcentajes: {...p.porcentajes, jubilacion: Number(e.target.value)}}))} />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontSize: 'var(--font-sm)' }}>Obra Social (%)</label>
                                    <input type="number" step="0.01" className="form-input" value={manualParams.porcentajes.obraSocial} onChange={(e) => setManualParams(p => ({...p, porcentajes: {...p.porcentajes, obraSocial: Number(e.target.value)}}))} />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontSize: 'var(--font-sm)' }}>Ley 19.032 - INSSJP (%)</label>
                                    <input type="number" step="0.01" className="form-input" value={manualParams.porcentajes.inssjp} onChange={(e) => setManualParams(p => ({...p, porcentajes: {...p.porcentajes, inssjp: Number(e.target.value)}}))} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                        <button className="btn btn-ghost" onClick={() => setStep(1)}>
                            ⬅️ Volver
                        </button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveToFirebase} disabled={isParsing}>
                            {isParsing ? 'Guardando en Firebase...' : '💾 Confirmar y Activar Año'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
