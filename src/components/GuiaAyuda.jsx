export default function GuiaAyuda() {
    return (
        <div className="view-container">
            <div className="view-header">
                <h1>📖 Guía de Uso</h1>
                <p className="view-subtitle">Todo lo que necesitás saber para usar la Calculadora de Ganancias 4ta Categoría</p>
            </div>

            {/* Inicio rápido */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4em' }}>🚀</span> Inicio Rápido
                </h2>
                <div className="guia-content">
                    <p>Esta aplicación replica las fórmulas de la planilla Excel oficial de cálculo de retenciones, conforme al <strong>Mapeo V3 de ARCA</strong> (15 pasos).</p>
                    <div className="guia-steps">
                        <div className="guia-step">
                            <div className="guia-step-number">1</div>
                            <div>
                                <strong>Configurá tus datos personales</strong>
                                <p>Ingresá si tenés cónyuge a cargo, cantidad de hijos y tipo de deducción especial en <em>Configuración Personal</em>.</p>
                            </div>
                        </div>
                        <div className="guia-step">
                            <div className="guia-step-number">2</div>
                            <div>
                                <strong>Verificá los parámetros del año</strong>
                                <p>Los parámetros 2025 vienen precargados. Si necesitás ajustarlos, andá a <em>Parámetros Anuales</em>.</p>
                            </div>
                        </div>
                        <div className="guia-step">
                            <div className="guia-step-number">3</div>
                            <div>
                                <strong>Cargá la liquidación mes a mes</strong>
                                <p>En <em>Liquidación Mensual</em>, ingresá sueldo, adicionales y deducciones de cada mes.</p>
                            </div>
                        </div>
                        <div className="guia-step">
                            <div className="guia-step-number">4</div>
                            <div>
                                <strong>Consultá el resumen</strong>
                                <p>El <em>Dashboard</em> muestra KPIs, gráficos y la tabla resumen con todos los cálculos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Módulos */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4em' }}>📋</span> Módulos de la Aplicación
                </h2>

                <div className="guia-modulos">
                    <div className="guia-modulo">
                        <div className="guia-modulo-header">
                            <span className="guia-modulo-icon">💰</span>
                            <h3>Liquidación Mensual</h3>
                        </div>
                        <ul>
                            <li>Tabs para navegar entre los 12 meses (Ene-Dic)</li>
                            <li>Secciones colapsables para cada grupo de datos</li>
                            <li><span className="guia-tag input">Celdas amarillas</span> = entrada manual (igual que Excel)</li>
                            <li><span className="guia-tag calc">Celdas grises</span> = calculado automáticamente</li>
                            <li>Vista anual: tabla de 12 columnas con todos los conceptos</li>
                        </ul>
                    </div>

                    <div className="guia-modulo">
                        <div className="guia-modulo-header">
                            <span className="guia-modulo-icon">📊</span>
                            <h3>Dashboard</h3>
                        </div>
                        <ul>
                            <li><strong>4 KPIs</strong>: Total retenido, Neto promedio, Alícuota efectiva, Bruto anual</li>
                            <li><strong>3 gráficos</strong>: Retención mensual (barras), Bruto vs Neto (línea), Composición (stacked)</li>
                            <li>Tabla resumen conforme Mapeo V3 ARCA</li>
                        </ul>
                    </div>

                    <div className="guia-modulo">
                        <div className="guia-modulo-header">
                            <span className="guia-modulo-icon">👤</span>
                            <h3>Configuración Personal</h3>
                        </div>
                        <ul>
                            <li>Toggle cónyuge a cargo</li>
                            <li>Cantidad de hijos / hijos incapacitados</li>
                            <li>Tipo de deducción especial (General / Profesionales / Zona Desfavorable)</li>
                        </ul>
                    </div>

                    <div className="guia-modulo">
                        <div className="guia-modulo-header">
                            <span className="guia-modulo-icon">⚙️</span>
                            <h3>Parámetros Anuales</h3>
                        </div>
                        <ul>
                            <li>Selector semestre (Ene-Jun / Jul-Dic)</li>
                            <li>Tablas editables: Deducciones personales, Escalas progresivas Art. 94, Topes MoPRe</li>
                            <li>Botón "Restaurar 2025" para volver a valores por defecto</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Cálculos */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4em' }}>🧮</span> Cálculos Implementados
                </h2>
                <div className="guia-content">
                    <p>Replica exacta de las fórmulas del Excel, siguiendo los <strong>15 pasos del Mapeo V3 de ARCA</strong>:</p>
                    <div className="guia-calcs-grid">
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>Descuentos obligatorios</strong>
                                <p>Jubilación 11%, Obra Social 3%, INSSJP 3% con <strong>tope MoPRe</strong> mensual</p>
                            </div>
                        </div>
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>SAC Proporcional</strong>
                                <p>Acumulado/12 + Ajuste Semestral</p>
                            </div>
                        </div>
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>Alquiler vivienda</strong>
                                <p>40% + 10% (Ley 27.737) con tope MNI</p>
                            </div>
                        </div>
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>Deducciones generales</strong>
                                <p>Prepaga, Donaciones, Seguro de Vida con tope 5% GNSI</p>
                            </div>
                        </div>
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>Deducción Especial</strong>
                                <p>Incremento 22% (Ley 27.743)</p>
                            </div>
                        </div>
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>Escalas Art. 94</strong>
                                <p>9 tramos progresivos × 2 semestres</p>
                            </div>
                        </div>
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>Tope retención</strong>
                                <p>35% sobre sueldo neto</p>
                            </div>
                        </div>
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>Pluriempleo</strong>
                                <p>Soporte para múltiples empleadores</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Datos y persistencia */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4em' }}>💾</span> Datos y Persistencia
                </h2>
                <div className="guia-content">
                    <div className="guia-info-box">
                        <div className="guia-info-row">
                            <span className="guia-info-label">Auto-guardado</span>
                            <span>Tus datos se guardan automáticamente en el navegador (localStorage)</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Exportar</span>
                            <span>Descargá un archivo JSON con todos tus datos desde el sidebar (📥 Exportar JSON)</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Importar</span>
                            <span>Cargá un archivo JSON previamente exportado (📤 Importar JSON)</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Reset</span>
                            <span>Borrá todos los datos y empezá de cero (🗑️ Reset Todo)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid var(--warning)' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4em' }}>⚠️</span> Aviso Importante
                </h2>
                <div className="guia-content">
                    <p style={{ color: 'var(--warning)', fontWeight: 500 }}>
                        Los cálculos se replican exactamente de las fórmulas del Excel oficial.
                        Cualquier discrepancia con la normativa vigente debe verificarse con un contador público.
                        Esta herramienta es de uso orientativo y no reemplaza el asesoramiento profesional.
                    </p>
                </div>
            </div>
        </div>
    );
}
