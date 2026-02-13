export default function ConfigPersonal({ config, updateConfig }) {
    return (
        <div>
            <div className="page-header">
                <h1>👤 Configuración Personal</h1>
                <p className="subtitle">Configurá tus datos personales para el cálculo de deducciones</p>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="card-header">
                    <div className="card-title">
                        <span className="icon">⚙️</span>
                        Datos del Empleado
                    </div>
                </div>

                {/* Cónyuge */}
                <div className="form-group">
                    <label className="form-label">¿Tiene cónyuge a cargo?</label>
                    <div
                        className="form-toggle"
                        onClick={() => updateConfig('tieneConyuge', !config.tieneConyuge)}
                    >
                        <div className={`toggle-switch ${config.tieneConyuge ? 'active' : ''}`}></div>
                        <span style={{ color: config.tieneConyuge ? 'var(--text-green)' : 'var(--text-muted)' }}>
                            {config.tieneConyuge ? 'SÍ' : 'NO'}
                        </span>
                    </div>
                </div>

                {/* Cantidad de hijos */}
                <div className="form-group">
                    <label className="form-label">Cantidad de hijos</label>
                    <input
                        type="number"
                        className="form-input"
                        value={config.cantidadHijos}
                        onChange={(e) => updateConfig('cantidadHijos', parseInt(e.target.value) || 0)}
                        min="0"
                        max="20"
                        style={{ maxWidth: '120px' }}
                    />
                </div>

                {/* Hijos incapacitados */}
                <div className="form-group">
                    <label className="form-label">Hijos incapacitados para el trabajo</label>
                    <input
                        type="number"
                        className="form-input"
                        value={config.hijosIncapacitados}
                        onChange={(e) => updateConfig('hijosIncapacitados', parseInt(e.target.value) || 0)}
                        min="0"
                        max="20"
                        style={{ maxWidth: '120px' }}
                    />
                </div>

                {/* Tipo deducción especial */}
                <div className="form-group">
                    <label className="form-label">Tipo de Deducción Especial</label>
                    <select
                        className="form-select"
                        value={config.tipoDeduccionEspecial}
                        onChange={(e) => updateConfig('tipoDeduccionEspecial', e.target.value)}
                    >
                        <option value="General">General</option>
                        <option value="Profesionales">Profesionales Nuevos</option>
                        <option value="Zona Desfavorable">Zona Desfavorable</option>
                    </select>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {config.tipoDeduccionEspecial === 'General' && '✅ Empleados bajo relación de dependencia, cargos públicos'}
                        {config.tipoDeduccionEspecial === 'Profesionales' && '✅ Profesionales nuevos: deducción especial incrementada'}
                        {config.tipoDeduccionEspecial === 'Zona Desfavorable' && '⚠️ Zona Desfavorable: NO vigente para 2° semestre 2025'}
                    </p>
                </div>
            </div>

            {/* Summary card */}
            <div className="card" style={{ maxWidth: '600px', marginTop: 'var(--space-lg)' }}>
                <div className="card-header">
                    <div className="card-title">
                        <span className="icon">📋</span>
                        Resumen de Configuración
                    </div>
                </div>
                <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Cónyuge a cargo</span>
                        <span className={`badge ${config.tieneConyuge ? 'badge-green' : 'badge-yellow'}`}>
                            {config.tieneConyuge ? '✅ SÍ' : '❌ NO'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Hijos</span>
                        <span style={{ fontWeight: 600 }}>{config.cantidadHijos}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Hijos incapacitados</span>
                        <span style={{ fontWeight: 600 }}>{config.hijosIncapacitados}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Tipo deducción especial</span>
                        <span className="badge badge-green">{config.tipoDeduccionEspecial}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
