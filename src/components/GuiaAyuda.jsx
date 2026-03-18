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
                    <p>Esta aplicación replica las fórmulas de la planilla Excel oficial de cálculo de retenciones, conforme al <strong>Mapeo V3 de ARCA</strong> (15 pasos). Los parámetros fiscales (deducciones, escalas, topes) se actualizan dinámicamente desde la nube.</p>
                    <div className="guia-steps">
                        <div className="guia-step">
                            <div className="guia-step-number">1</div>
                            <div>
                                <strong>Verificá el año fiscal activo</strong>
                                <p>El <strong>banner rojo</strong> en la parte superior muestra el período con el que estás trabajando. Podés cambiarlo en <em>Parámetros Anuales</em>.</p>
                            </div>
                        </div>
                        <div className="guia-step">
                            <div className="guia-step-number">2</div>
                            <div>
                                <strong>Configurá tus datos personales</strong>
                                <p>Ingresá si tenés cónyuge a cargo, cantidad de hijos y tipo de deducción especial en <em>Configuración Personal</em>.</p>
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
                            <li><strong>Selector de año fiscal</strong>: los años disponibles se cargan desde la base de datos</li>
                            <li>Selector semestre (Ene-Jun / Jul-Dic)</li>
                            <li>Tablas editables: Deducciones personales, Escalas progresivas Art. 94, Topes MoPRe</li>
                            <li>Botón "Restaurar valores" para volver a los datos oficiales del año seleccionado</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Año fiscal activo y Firebase */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4em' }}>📅</span> Años Fiscales y Parámetros Dinámicos
                </h2>
                <div className="guia-content">
                    <p>Los parámetros fiscales (deducciones, escalas, topes) se almacenan en la nube y se actualizan año a año sin necesidad de modificar la aplicación.</p>
                    <div className="guia-info-box">
                        <div className="guia-info-row">
                            <span className="guia-info-label">Banner rojo</span>
                            <span>Indica el año fiscal que está activo en toda la app. Cambiarlo en Parámetros Anuales afecta todos los cálculos.</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Selector de año</span>
                            <span>En <em>Parámetros Anuales</em>, el dropdown lista los años disponibles en la base de datos. Al cambiar el año, los parámetros se descargan automáticamente.</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Fallback 2025</span>
                            <span>Si no hay conexión o no se encuentran parámetros en la base de datos, la app usa los parámetros 2025 precargados localmente.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel admin */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4em' }}>🔐</span> Panel de Administrador (Carga de Nuevos Años)
                </h2>
                <div className="guia-content">
                    <p>Cuando ARCA/AFIP publica las nuevas resoluciones anuales, el administrador puede cargar los parámetros del nuevo año directamente desde la aplicación, sin necesidad de modificar código.</p>
                    <div className="guia-steps">
                        <div className="guia-step">
                            <div className="guia-step-number">1</div>
                            <div>
                                <strong>Accedé con tu cuenta de administrador</strong>
                                <p>Navegá a <em>Admin (Cargar Año)</em> en el sidebar e ingresá con email y contraseña.</p>
                            </div>
                        </div>
                        <div className="guia-step">
                            <div className="guia-step-number">2</div>
                            <div>
                                <strong>Subí los 4 PDFs de AFIP</strong>
                                <p>Deducciones y Escalas Art. 94 para primer y segundo semestre.</p>
                            </div>
                        </div>
                        <div className="guia-step">
                            <div className="guia-step-number">3</div>
                            <div>
                                <strong>Confirmá los parámetros manuales</strong>
                                <p>Topes MoPRe mensuales y porcentajes previsionales (no están en los PDFs de AFIP).</p>
                            </div>
                        </div>
                        <div className="guia-step">
                            <div className="guia-step-number">4</div>
                            <div>
                                <strong>Guardar en la base de datos</strong>
                                <p>Los parámetros quedan disponibles para todos los usuarios en el selector de año.</p>
                            </div>
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '12px' }}>
                        <strong>PDFs requeridos:</strong> Deducciones Art. 30 (ene-jun y jul-dic) + Tablas Art. 94 (ene-jun y jul-dic). Se obtienen del sitio oficial de ARCA/AFIP.
                    </p>
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
                                <p>Acumulado/12 + Ajuste Semestral. Si se informa SAC real no se duplica la base.</p>
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
                                <p>Adicional Doceava Parte (Ley 27.743)</p>
                            </div>
                        </div>
                        <div className="guia-calc-item">
                            <div className="guia-calc-icon">📌</div>
                            <div>
                                <strong>Escalas Art. 94</strong>
                                <p>9 tramos progresivos × 2 semestres — se actualizan dinámicamente desde Firebase</p>
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
                            <span>Tus datos de liquidación se guardan automáticamente en el navegador (localStorage)</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Exportar</span>
                            <span>Descargá un archivo JSON con todos tus datos desde el sidebar (💾 Guardar borrador)</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Importar</span>
                            <span>Cargá un archivo JSON previamente guardado (📂 Cargar borrador)</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Reset</span>
                            <span>Borrá todos los datos de liquidación y empezá de cero (🗑️ Reset Todo)</span>
                        </div>
                        <div className="guia-info-row">
                            <span className="guia-info-label">Parámetros fiscales</span>
                            <span>Se almacenan en Firebase y se comparten entre todos los usuarios automáticamente</span>
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
