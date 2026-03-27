import { useState } from 'react';
import { MONTHS_SHORT } from '../engine/defaultParams';
import { formatCurrency } from '../engine/calculationEngine';
import { exportToExcel } from '../engine/excelExporter';

const INCOME_FIELDS = [
    { key: 'sueldoBasico', label: 'Sueldo Básico', hint: 'Remuneración bruta mensual' },
    { key: 'adicionalesHabituales', label: 'Adicionales Habituales' },
    { key: 'antiguedad', label: 'Antigüedad' },
    { key: 'comisiones', label: 'Comisiones' },
    { key: 'plusVacacional', label: 'Plus Vacacional' },
    { key: 'otrosRemunerativos', label: 'Otros Conceptos Remunerativos' },
    { key: 'noRemunerativosHabituales', label: 'Conceptos No Rem. Habituales', hint: 'Viáticos, refrigerio, etc.' },
    { key: 'noRemunerativosNoHabituales', label: 'Conceptos No Rem. NO Habituales', hint: 'Gratificaciones, ajustes. Prorratear si ≥20%' },
    { key: 'sacAguinaldo', label: 'SAC / Aguinaldo Cobrado', hint: 'Importar el monto EXCEPTO si no se pagó' },
];

const PLURIEMPLEO_FIELDS = [
    { key: 'retribucionesHabitualesPluriempleo', label: 'Retribuciones Habituales' },
    { key: 'retribucionesNoHabitualesPluriempleo', label: 'Retribuciones No Habituales' },
    { key: 'sacPluriempleo', label: 'SAC Pluriempleo' },
];

const DESCUENTOS_FIELDS = [
    { key: 'aportesSindicales', label: 'Aportes Sindicales' },
    { key: 'otrosDescuentosObligatorios', label: 'Otros Descuentos Obligatorios por Ley' },
];

const DEDUCCIONES_FIELDS = [
    { key: 'alquilerPagado', label: 'Alquiler Pagado (monto total)', hint: 'Monto total mensual de alquiler' },
    { key: 'medicinaPrepaga', label: 'Medicina Prepaga', hint: 'Cuota mensual' },
    { key: 'gastosEducacion', label: 'Gastos de Educación' },
    { key: 'primasSeguroVida', label: 'Primas Seguro de Vida' },
    { key: 'servicioDomestico', label: 'Servicio Doméstico', hint: 'Haberes + aportes' },
    { key: 'interesesHipotecarios', label: 'Intereses Hipotecarios' },
    { key: 'donaciones', label: 'Donaciones' },
    { key: 'gastosMedicos', label: 'Gastos Médicos', hint: '40% por factura, tope 5% GNSI' },
    { key: 'primasSeguridadMixtos', label: 'Primas Seguros Mixtos' },
    { key: 'pagosFCIRetiro', label: 'Pagos FCI con Fines de Retiro' },
    { key: 'gastosSepelio', label: 'Gastos de Sepelio' },
    { key: 'amortizacionAutomotor', label: 'Amortización Automotor', hint: 'Corredores / Viajantes' },
    { key: 'aportesSGR', label: 'Aportes SGR' },
    { key: 'aportesSeguroRetiro', label: 'Aportes Seguro Retiro Privados' },
    { key: 'gastosEquipamientoTrabajo', label: 'Equipamiento Obligatorio Trabajo' },
    { key: 'adicionalesAntartida', label: 'Adicionales Personal Antártida' },
    { key: 'otrasDeducciones', label: 'Otras Deducciones Generales' },
];

const IMPUESTO_FIELDS = [
    { key: 'pagosACuenta', label: 'Pagos a Cuenta (Apartado G)', hint: 'F. 1357, anticipos voluntarios' },
    { key: 'retencionesReintegradas', label: 'Retenciones Reintegradas (Apartado H)', hint: 'Retenciones en exceso reintegradas' },
];

function InputField({ field, value, onChange }) {
    return (
        <div className="input-row">
            <div className="input-label">
                {field.label}
                {field.hint && <span className="hint">{field.hint}</span>}
            </div>
            <input
                type="number"
                className="form-input input-yellow"
                value={value || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
            />
        </div>
    );
}

/**
 * Campo de aporte previsional: muestra el valor autocalculado como placeholder
 * y permite sobreescribirlo. Botón de reset vuelve al auto.
 */
function ManualOverrideField({ label, autoValue, manualKey, manualValue, onReset, onChange, hint }) {
    const isOverridden = manualValue != null && manualValue !== '';
    return (
        <div className="input-row">
            <div className="input-label">
                <span>{label}</span>
                {hint && <span className="hint">{hint}</span>}
                {isOverridden && (
                    <span
                        title="Volver al valor autocalculado"
                        onClick={() => onReset(manualKey)}
                        style={{ cursor: 'pointer', marginLeft: 6, fontSize: '0.75rem', color: 'var(--accent)', userSelect: 'none' }}
                    >↩ auto</span>
                )}
            </div>
            <input
                type="number"
                className={`form-input ${isOverridden ? 'input-yellow' : ''}`}
                value={isOverridden ? manualValue : ''}
                placeholder={autoValue != null ? autoValue.toFixed(2) : '0,00'}
                onChange={(e) => onChange(manualKey, e.target.value === '' ? null : e.target.value)}
                step="0.01"
                min="0"
                title={isOverridden ? 'Valor manual ingresado' : 'Autocalculado — editá para sobreescribir'}
                style={{ color: isOverridden ? undefined : 'var(--text-muted)' }}
            />
        </div>
    );
}

function CalcField({ label, value, className = '', hint }) {
    return (
        <div className={`calc-row ${className}`}>
            <div className="calc-label">
                {label}
                {hint && <span className="hint">{hint}</span>}
            </div>
            <div className={`calc-value ${value < 0 ? 'negative' : ''}`}>
                {formatCurrency(value)}
            </div>
        </div>
    );
}

function Section({ title, icon, total, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="section">
            <div className="section-header" onClick={() => setOpen(!open)}>
                <h3>{icon} {title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {total !== undefined && (
                        <span className="section-total">{formatCurrency(total)}</span>
                    )}
                    <span className={`chevron ${open ? 'open' : ''}`}>▼</span>
                </div>
            </div>
            <div className={`section-body ${!open ? 'hidden' : ''}`}>
                {children}
            </div>
        </div>
    );
}

function AnnualView({ results }) {
    const rows = [
        { label: '1. INGRESOS', section: true },
        { label: 'Sueldo Básico', key: 'data.sueldoBasico' },
        { label: 'Total Ingresos', key: 'totalIngresos', bold: true },
        { label: '2. PLURIEMPLEO', section: true },
        { label: 'Total Pluriempleo', key: 'totalPluriempleo', bold: true },
        { label: '3. DESCUENTOS', section: true },
        { label: 'Base Sueldo (tope MoPRe)', key: 'baseDescuentosSueldo' },
        { label: 'Base SAC (tope 50% MoPRe)', key: 'baseDescuentosSAC' },
        { label: 'Total Base Descuentos', key: 'baseDescuentos', bold: true },
        { label: 'Jubilación 11%', key: 'jubilacion' },
        { label: 'Obra Social 3%', key: 'obraSocial' },
        { label: 'INSSJP 3%', key: 'inssjp' },
        { label: 'Total Descuentos', key: 'totalDescuentos', bold: true },
        { label: '4. GANANCIA BRUTA', section: true },
        { label: 'Ganancia Bruta Pura (Sin SAC)', key: 'gananciaBrutaPuraMes' },
        { label: 'SAC Real Cargado', key: 'sacRealMes' },
        { label: 'Ganancia Bruta del Mes', key: 'gananciaBrutaMes' },
        { label: 'G. Bruta Pura Acum.', key: 'gananciaBrutaPuraAcum', bold: true, isCumulative: true },
        { label: 'SAC Real Acumulado', key: 'sacRealAcum', isCumulative: true },
        { label: 'SAC Proporcional Prov.', key: 'sacProporcionalAcum', isCumulative: true },
        { label: 'Ganancia Bruta Acum.', key: 'gananciaBrutaAcum', bold: true, isCumulative: true },
        { label: '5. DEDUCCIONES GENERALES', section: true },
        { label: 'Alquiler 40%', key: 'alquiler40' },
        { label: 'Alquiler 10%', key: 'alquiler10' },
        { label: 'Medicina Prepaga', key: 'medicinaPreDeducible' },
        { label: 'Ded. SAC 17% (mensual)', key: 'deduccionesSobreSAC' },
        { label: 'Ded. SAC 17% Acumulada (definitiva)', key: 'deduccionesSobreSACAcum', isCumulative: true },
        { label: 'Total Ded. Generales', key: 'totalDeduccionesGenerales', bold: true },
        { label: '6. DEDUCCIONES PERSONALES', section: true },
        { label: 'Ganancia No Imponible', key: 'mni' },
        { label: 'Cónyuge', key: 'dedConyuge' },
        { label: 'Hijos', key: 'dedHijos' },
        { label: 'Deducción Especial', key: 'dedEspecial' },
        { label: 'Doceava Parte', key: 'dedEspecialDoceavaParte' },
        { label: 'Total Ded. Personales', key: 'totalDeduccionesPersonales', bold: true },
        { label: '7. RESULTADO', section: true },
        { label: 'Desc. Obligatorios Acum.', key: 'descuentosObligatoriosAcum', isCumulative: true },
        { label: 'Ded. Generales Acum. (ajustada)', key: 'deduccionesGeneralesAcum', isCumulative: true },
        { label: 'Ded. Personales Acum.', key: 'deduccionesPersonalesAcum', isCumulative: true },
        { label: 'Deducciones Totales Acumuladas', key: 'deduccionesTotalesAcum', bold: true, isCumulative: true },
        { label: 'Ganancia Neta Imponible', key: 'gananciaNeta', isCumulative: true },
        { label: 'Impuesto Determinado', key: 'impuestoDeterminado', isCumulative: true },
        { label: 'Ret. Meses Anteriores', key: 'retencionesAnteriores', isCumulative: true },
        { label: 'Retención del Mes', key: 'retencionDelMes' },
        { label: 'Tope 35%', key: 'tope35' },
        { label: 'RETENCIÓN EFECTIVA', key: 'retencionEfectiva', bold: true, highlight: true },
        { label: 'SUELDO NETO', key: 'sueldoNetoFinal', bold: true, highlight: true },
    ];

    const getValue = (result, key) => {
        if (key.startsWith('data.')) {
            return result.data[key.replace('data.', '')];
        }
        return result[key];
    };

    const renderRow = (row, i) => {
        if (row.section) {
            return (
                <tr key={i} className="section-row">
                    <td colSpan={14}>{row.label}</td>
                </tr>
            );
        }

        const values = results.map(r => getValue(r, row.key));
        
        // Sumar vs Mostrar último mes para Acumulados
        const total = row.isCumulative 
            ? values[values.length - 1] 
            : values.reduce((a, b) => a + b, 0);

        return (
            <tr key={i} className={`${row.bold ? 'total-row' : ''} ${row.highlight ? 'highlight-row' : ''}`}>
                <td>{row.label}</td>
                {values.map((v, mi) => (
                    <td key={mi}>{formatCurrency(v)}</td>
                ))}
                <td style={{ fontWeight: 'bold' }}>{formatCurrency(total)}</td>
            </tr>
        );
    };

    return (
        <div className="annual-table-container">
            <table className="annual-table">
                <thead>
                    <tr>
                        <th>Concepto</th>
                        {MONTHS_SHORT.map(m => <th key={m}>{m}</th>)}
                        <th>TOTAL / ACTUAL</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => renderRow(row, i))}
                </tbody>
            </table>
        </div>
    );
}

export default function LiquidacionMensual({ monthsData, updateMonthField, results, activeMonth, setActiveMonth, config, params }) {
    const [viewMode, setViewMode] = useState('month'); // month | annual
    const m = activeMonth;
    const data = monthsData[m];
    const result = results[m];

    const handleChange = (key, value) => updateMonthField(m, key, value);

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>💰 Liquidación Anual 2025</h1>
                    <p className="subtitle">Ingresá los datos mensuales — las celdas amarillas son editables</p>
                </div>
                <div className="view-toggle">
                    <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>
                        📋 Por Mes
                    </button>
                    <button className={`view-btn ${viewMode === 'annual' ? 'active' : ''}`} onClick={() => setViewMode('annual')}>
                        📊 Vista Anual
                    </button>
                </div>
            </div>

            {/* Month tabs */}
            <div className="month-tabs">
                {MONTHS_SHORT.map((month, i) => (
                    <button
                        key={i}
                        className={`month-tab ${i === activeMonth ? 'active' : ''} ${monthsData[i].sueldoBasico > 0 ? 'has-data' : ''}`}
                        onClick={() => { setActiveMonth(i); setViewMode('month'); }}
                    >
                        {month}
                    </button>
                ))}
            </div>

            {viewMode === 'annual' ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => exportToExcel(results, config, params)}
                        >
                            📊 Exportar Excel
                        </button>
                    </div>
                    <AnnualView results={results} />
                </div>
            ) : (
                <div className="animate-in" key={m}>
                    {/* 1. Ingresos */}
                    <Section title="Ingresos del Mes" icon="💵" total={result.totalIngresos} defaultOpen={true}>
                        {INCOME_FIELDS.map(f => (
                            <InputField key={f.key} field={f} value={data[f.key]} onChange={handleChange} />
                        ))}
                        <CalcField label="Total Ingresos del Mes" value={result.totalIngresos} className="total-row" />
                    </Section>

                    {/* 2. Pluriempleo */}
                    <Section title="Pluriempleo (Otros empleos)" icon="🏢" total={result.totalPluriempleo} defaultOpen={false}>
                        {PLURIEMPLEO_FIELDS.map(f => (
                            <InputField key={f.key} field={f} value={data[f.key]} onChange={handleChange} />
                        ))}
                        <CalcField label="Total Pluriempleo" value={result.totalPluriempleo} className="total-row" />
                    </Section>

                    {/* 3. Descuentos Obligatorios */}
                    <Section title="Descuentos Obligatorios" icon="📉" total={result.totalDescuentos} defaultOpen={true}>
                        {result.sacRealMes > 0 ? (
                            <div style={{ paddingBottom: '8px', marginBottom: '8px' }}>
                                <CalcField label="Base Sueldo (tope MoPRe)" value={result.baseDescuentosSueldo} />
                                <CalcField label="Base SAC (tope 50% MoPRe)" value={result.baseDescuentosSAC} />
                                <CalcField label="Total Base Descuentos" value={result.baseDescuentos} className="highlight" />
                            </div>
                        ) : (
                            <CalcField label="Base para Descuentos (tope MoPRe)" value={result.baseDescuentos} />
                        )}
                        <ManualOverrideField
                            label="Jubilación 11%"
                            autoValue={result.jubilacionAuto}
                            manualKey="jubilacionManual"
                            manualValue={data.jubilacionManual}
                            onReset={(key) => handleChange(key, null)}
                            onChange={handleChange}
                            hint="Autocalculado — editá para usar el valor del recibo"
                        />
                        <ManualOverrideField
                            label="Obra Social 3%"
                            autoValue={result.obraSocialAuto}
                            manualKey="obraSocialManual"
                            manualValue={data.obraSocialManual}
                            onReset={(key) => handleChange(key, null)}
                            onChange={handleChange}
                        />
                        <ManualOverrideField
                            label="INSSJP - Ley 19.032 3%"
                            autoValue={result.inssjpAuto}
                            manualKey="inssjpManual"
                            manualValue={data.inssjpManual}
                            onReset={(key) => handleChange(key, null)}
                            onChange={handleChange}
                        />
                        {DESCUENTOS_FIELDS.map(f => (
                            <InputField key={f.key} field={f} value={data[f.key]} onChange={handleChange} />
                        ))}
                        <CalcField label="Total Descuentos" value={result.totalDescuentos} className="total-row" />
                    </Section>

                    {/* 4. Ganancia Bruta */}
                    <Section title="Ganancia Bruta y SAC" icon="📈" total={result.gananciaBrutaMes}>
                        <CalcField label="Ganancia Bruta Pura (Sin SAC)" value={result.gananciaBrutaPuraMes} />
                        <CalcField label="SAC Real Cargado (este mes)" value={result.sacRealMes} />
                        <CalcField label="Ganancia Bruta Recibo" value={result.gananciaBrutaMes} className="total-row" />
                        
                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '8px' }}>
                            <CalcField label="Ganancia Bruta Pura Acumulada" value={result.gananciaBrutaPuraAcum} />
                            <CalcField label="SAC Proporcional Acumulado (Monto de Reserva Legal)" value={result.sacProporcionalAcum} />
                            <CalcField label="SAC Real Pagado Acumulado" value={result.sacRealAcum} />
                            <CalcField 
                                label="Tope de SAC Aplicado para Carga Impositiva" 
                                value={result.topeSACParaCalculos} 
                                className="highlight" 
                                hint="Es el mayor entre el SAC 1/12 acumulado provisorio y los cobros reales (se liquidan diferencias a favor de AFIP o de empleado en Jun/Dic)" 
                            />
                            <InputField
                                field={{ key: 'ajusteSACSemestral', label: 'Ajuste Adicional SAC', hint: m === 5 ? 'Ajuste junio' : m === 11 ? 'Ajuste diciembre' : 'Solo en caso de correcciones manuales' }}
                                value={data.ajusteSACSemestral}
                                onChange={handleChange}
                            />
                        </div>

                        <CalcField label="Ganancia Bruta Imponible Acum. (Base Cálculo)" value={result.gananciaBrutaConSACAcum} className="total-row" />
                    </Section>

                    {/* 5. Deducciones Generales */}
                    <Section title="Deducciones Generales" icon="📝" total={result.totalDeduccionesGenerales} defaultOpen={false}>
                        {DEDUCCIONES_FIELDS.map(f => (
                            <InputField key={f.key} field={f} value={data[f.key]} onChange={handleChange} />
                        ))}
                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '8px' }}>
                            <CalcField
                                label="Alquiler deducible 40%"
                                value={result.alquiler40}
                                hint="del alquiler pagado, con tope en la GNI del período. El excedente no se transfiere."
                            />
                            <CalcField
                                label="Alquiler deducible 10% (Ley 27.737)"
                                value={result.alquiler10}
                                hint="adicional sin tope — incorporado por Ley 27.737 (2024)."
                            />
                            <CalcField label="Medicina Prepaga deducible (5% GNSI)" value={result.medicinaPreDeducible} />
                            <CalcField label="Educación deducible" value={result.educacionDeducible} />
                            <CalcField label="Seguro de Vida deducible (5% GNSI)" value={result.seguroVidaDeducible} />
                            <CalcField label="Donaciones deducibles (5% GNSI)" value={result.donacionesDeducible} />
                            <CalcField
                                label="Ded. SAC 17% (mensual provisorio)"
                                value={result.deduccionesSobreSAC}
                                hint="Cuota mensual estimada: 17% de la doceava parte del sueldo bruto del mes."
                            />
                            <CalcField
                                label="Ded. SAC 17% Acumulada (definitiva)"
                                value={result.deduccionesSobreSACAcum}
                                className="highlight"
                                hint="Valor real usado en el cálculo impositivo. En Jun/Dic se ajusta al 17% del SAC real cobrado."
                            />
                        </div>
                        <CalcField label="Total Deducciones Generales" value={result.totalDeduccionesGenerales} className="total-row" />
                        {result.sacRealMes > 0 && (
                            <CalcField 
                                label="Total Ded. Generales Acum. (ajustada)" 
                                value={result.deduccionesGeneralesAcum} 
                                className="highlight" 
                                hint="Acumulado real del año usando el SAC definitivo." 
                            />
                        )}
                    </Section>

                    {/* 6. Deducciones Personales */}
                    <Section title="Deducciones Personales" icon="👤" total={result.totalDeduccionesPersonales}>
                        <CalcField label="Ganancia No Imponible (MNI)" value={result.mni} />
                        <CalcField label="Cónyuge" value={result.dedConyuge} />
                        <CalcField label="Hijos" value={result.dedHijos} />
                        <CalcField label="Hijos Incapacitados" value={result.dedHijosIncap} />
                        <CalcField label="Deducción Especial" value={result.dedEspecial} />
                        <CalcField
                            label="Adicional Doceava Parte (Ley 27.743)"
                            value={result.dedEspecialDoceavaParte}
                            className="highlight"
                            hint="Equivale a 1/12 de la suma de MNI, Cargas de Familia y Deducción Especial."
                        />
                        <CalcField label="Total Deducciones Personales" value={result.totalDeduccionesPersonales} className="total-row" />
                    </Section>

                    {/* 7. Impuesto y Retención */}
                    <Section title="Impuesto y Retención" icon="🏛️" total={result.retencionEfectiva} defaultOpen={true}>
                        <CalcField label="Deducciones Totales Acumuladas" value={result.deduccionesTotalesAcum} />
                        <CalcField label="Ganancia Neta Imponible" value={result.gananciaNeta} className="highlight" />
                        <CalcField label="Impuesto Determinado (Art. 94)" value={result.impuestoDeterminado} />
                        <CalcField label="Retenciones Meses Anteriores" value={result.retencionesAnteriores} />
                        {IMPUESTO_FIELDS.map(f => (
                            <InputField key={f.key} field={f} value={data[f.key]} onChange={handleChange} />
                        ))}
                        <CalcField label="Retención del Mes (antes de tope)" value={result.retencionDelMes} />
                        <CalcField label="Tope 35% del Sueldo Neto" value={result.tope35} />
                        <CalcField
                            label={`RETENCIÓN EFECTIVA${data.retencionEfectivaManual != null && data.retencionEfectivaManual !== '' ? ' (manual)' : ' (calculada)'}`}
                            value={result.retencionEfectiva}
                            className="total-row"
                        />
                        {result.diferenciaNoRetenida > 0 && (
                            <CalcField label="⚠️ Diferencia no retenida (se posterga)" value={result.diferenciaNoRetenida} />
                        )}
                        <ManualOverrideField
                            label="Retención real sufrida (opcional)"
                            autoValue={null}
                            manualKey="retencionEfectivaManual"
                            manualValue={data.retencionEfectivaManual}
                            onReset={(key) => handleChange(key, null)}
                            onChange={handleChange}
                            hint="Si la retención real del recibo difiere de la calculada, ingresala aquí."
                        />
                    </Section>

                    {/* 8. Sueldo Neto */}
                    <Section title="Sueldo Neto" icon="💎" total={result.sueldoNetoFinal}>
                        <CalcField label="Sueldo Neto Final" value={result.sueldoNetoFinal} className="total-row" />
                    </Section>
                </div>
            )}

            <div className="disclaimer">
                ⚠️ <strong>DISCLAIMER:</strong> Esta herramienta es de uso informativo y educativo. Para cálculos oficiales, consultá con un contador matriculado.
            </div>
        </div>
    );
}
