/**
 * Calculation Engine for Ganancias 4ta Categoría
 * Implements the full 15-step ARCA Mapeo V3 calculation flow
 */

/**
 * Get the semester key based on month index (0-based)
 * Ene-Jun = sem1, Jul-Dic = sem2
 */
function getSemestre(monthIndex) {
    return monthIndex < 6 ? 'sem1' : 'sem2';
}

/**
 * Get the deducción especial value based on the configuration type
 */
function getDeduccionEspecial(params, semestre, tipo) {
    const ded = params.deduccionesPersonales[semestre];
    switch (tipo) {
        case 'Profesionales': return ded.deduccionEspecialProfesionales;
        default: return ded.deduccionEspecialGeneral;
    }
}

/**
 * Apply progressive tax scale (Art. 94) to a given taxable income
 */
function calcularImpuestoEscalas(gananciaNeta, escalas) {
    if (gananciaNeta <= 0) return 0;

    for (const tramo of escalas) {
        if (gananciaNeta <= tramo.hasta) {
            return tramo.fijo + (gananciaNeta - tramo.excedenteDe) * tramo.porcentaje;
        }
    }
    // If above all brackets, use last bracket
    const ultimo = escalas[escalas.length - 1];
    return ultimo.fijo + (gananciaNeta - ultimo.excedenteDe) * ultimo.porcentaje;
}

/**
 * Calculate all results for all 12 months
 * @param {Array} monthsData - Array of 12 month input objects
 * @param {Object} config - Personal configuration
 * @param {Object} params - Year parameters
 * @returns {Array} Array of 12 month result objects
 */
export function calculateAllMonths(monthsData, config, params) {
    const results = [];

    for (let m = 0; m < 12; m++) {
        const data = monthsData[m];
        const sem = getSemestre(m);
        const dedPersonales = params.deduccionesPersonales[sem];
        const escalas = params.escalas[sem];
        const topeMoPre = params.topesMoPre[m];

        const totalIngresos =
            data.sueldoBasico +
            data.adicionalesHabituales +
            data.antiguedad +
            data.comisiones +
            data.plusVacacional +
            data.otrosRemunerativos +
            data.noRemunerativosHabituales +
            data.noRemunerativosNoHabituales;
            // sacAguinaldo se cuenta por separado ahora para ingresos netos,
            // pero lo sumamos al totalIngresos "de bolsillo" para reportes
        const ingresoBolsillo = totalIngresos + data.sacAguinaldo;

        // ── PASO 2: Pluriempleo ──────────────────────────────────
        const totalPluriempleoPuro =
            data.retribucionesHabitualesPluriempleo +
            data.retribucionesNoHabitualesPluriempleo;
            
        const pluriempleoBolsillo = totalPluriempleoPuro + data.sacPluriempleo;

        // ── PASO 3: Descuentos Obligatorios ──────────────────────
        // Base para descuentos con tope MoPRe
        const baseDescuentos = Math.min(
            data.sueldoBasico +
            data.adicionalesHabituales +
            data.antiguedad +
            data.comisiones +
            data.plusVacacional +
            data.otrosRemunerativos +
            data.sacAguinaldo +
            data.retribucionesHabitualesPluriempleo +
            data.sacPluriempleo,
            topeMoPre
        );

        const jubilacionAuto = baseDescuentos * params.porcentajes.jubilacion;
        const obraSocialAuto = baseDescuentos * params.porcentajes.obraSocial;
        const inssjpAuto = baseDescuentos * params.porcentajes.inssjp;

        // Si el usuario ingresó un valor manual, se usa ese; sino el autocalculado
        const jubilacion = (data.jubilacionManual != null && data.jubilacionManual !== '') ? Number(data.jubilacionManual) : jubilacionAuto;
        const obraSocial = (data.obraSocialManual != null && data.obraSocialManual !== '') ? Number(data.obraSocialManual) : obraSocialAuto;
        const inssjp = (data.inssjpManual != null && data.inssjpManual !== '') ? Number(data.inssjpManual) : inssjpAuto;

        const totalDescuentos = jubilacion + obraSocial + inssjp +
            data.aportesSindicales + data.otrosDescuentosObligatorios;

        // ── PASO 4: Ganancia Bruta ───────────────────────────────
        // Calculamos la ganancia bruta *pura* (sin contemplar el SAC cobrado en el mes)
        const gananciaBrutaPuraMes = totalIngresos + totalPluriempleoPuro - data.otrosDescuentosObligatorios;
        const sacRealMes = data.sacAguinaldo + data.sacPluriempleo;
        const gananciaBrutaMesConSACRecibo = gananciaBrutaPuraMes + sacRealMes; 

        // ── Ganancias Acumuladas (sum of current and all previous months) ──
        let gananciaBrutaPuraAcum = gananciaBrutaPuraMes;
        let sacRealAcum = sacRealMes;
        for (let p = 0; p < m; p++) {
            gananciaBrutaPuraAcum += results[p].gananciaBrutaPuraMes;
            sacRealAcum += results[p].sacRealMes;
        }

        // ── SAC Proporcional ─────────────────────────────────────
        const sacProporcionalAcum = gananciaBrutaPuraAcum / 12;
        // El de este mes específico
        const sacProporcionalMensual = gananciaBrutaPuraMes / 12;

        // ── PASO 5: Deducciones Generales ────────────────────────
        const alquiler40 = Math.min(data.alquilerPagado * 0.4, dedPersonales.gananciaNoImponible);
        const alquiler10 = data.alquilerPagado * 0.1;

        // Ganancia bruta con SAC para topes del 5%
        // Tomamos el bruto puro + el mayor monto entre el diferencial proporcional vs el real que viene dado
        const topeSACParaCalculos = Math.max(sacProporcionalAcum, sacRealAcum);
        const gananciaBrutaParaTopesAcum = gananciaBrutaPuraAcum + topeSACParaCalculos;
        
        // El tope del 5% debe ser MENSUALIZADO de la GNSI. Simplificando se suele tomar 
        // 5% de la ganancia bruta gravada como umbral.
        // Haremos un prorrateo mes a mes para mantener la lógica existente:
        const gananciaBrutaParaTopesMes = gananciaBrutaPuraMes + sacProporcionalMensual;

        const medicinaPreDeducible = Math.min(data.medicinaPrepaga, gananciaBrutaParaTopesMes * 0.05);
        const educacionDeducible = Math.min(data.gastosEducacion, gananciaBrutaParaTopesMes * 0.05);
        const seguroVidaDeducible = Math.min(data.primasSeguroVida, gananciaBrutaParaTopesMes * 0.05);
        const donacionesDeducible = Math.min(data.donaciones, gananciaBrutaParaTopesMes * 0.05);

        // Deducción especial para el SAC (17%). Aplica sobre la porción elegida de aguinaldo.
        const deduccionesSobreSAC = sacProporcionalMensual * 0.17;

        const totalDeduccionesGenerales =
            alquiler40 + alquiler10 +
            medicinaPreDeducible +
            educacionDeducible +
            seguroVidaDeducible +
            data.servicioDomestico +
            data.interesesHipotecarios +
            donacionesDeducible +
            data.otrasDeducciones +
            deduccionesSobreSAC +
            data.primasSeguridadMixtos +
            data.pagosFCIRetiro +
            data.gastosSepelio +
            data.amortizacionAutomotor +
            data.gastosMedicos +
            data.aportesSGR +
            data.aportesSeguroRetiro +
            data.gastosEquipamientoTrabajo +
            data.adicionalesAntartida;

        // ── Deducciones generales acumuladas ──────────────────────
        let deduccionesGeneralesAcum = totalDeduccionesGenerales;
        for (let p = 0; p < m; p++) {
            deduccionesGeneralesAcum += results[p].totalDeduccionesGenerales;
        }

        // ── PASO 6: Deducciones Personales ───────────────────────
        const mni = dedPersonales.gananciaNoImponible;
        const dedConyuge = config.tieneConyuge ? dedPersonales.conyuge : 0;
        const dedHijos = config.cantidadHijos * dedPersonales.hijo;
        const dedHijosIncap = config.hijosIncapacitados * dedPersonales.hijoIncapacitado;
        const dedEspecial = getDeduccionEspecial(params, sem, config.tipoDeduccionEspecial);

        const subtotalPersonalesMensual = mni + dedConyuge + dedHijos + dedHijosIncap + dedEspecial;
        const dedEspecialDoceavaParte = subtotalPersonalesMensual / 12;

        const totalDeduccionesPersonales = subtotalPersonalesMensual + dedEspecialDoceavaParte;

        // ── Deducciones totales acumuladas (personales × mes) ────
        // Personal deductions accumulate per month (multiply by month count)
        // But since params can change between semesters, we need to sum per month
        let deduccionesPersonalesAcum = 0;
        for (let p = 0; p <= m; p++) {
            const pSem = getSemestre(p);
            const pDed = params.deduccionesPersonales[pSem];
            const pMni = pDed.gananciaNoImponible;
            const pConyuge = config.tieneConyuge ? pDed.conyuge : 0;
            const pHijos = config.cantidadHijos * pDed.hijo;
            const pHijosIncap = config.hijosIncapacitados * pDed.hijoIncapacitado;
            const pEspecial = getDeduccionEspecial(params, pSem, config.tipoDeduccionEspecial);

            const pSubtotal = pMni + pConyuge + pHijos + pHijosIncap + pEspecial;
            const pDoceavaParte = pSubtotal / 12;
            deduccionesPersonalesAcum += pSubtotal + pDoceavaParte;
        }

        // ── PASO 7-8: Ganancia Neta Acumulada ────────────────────
        // Ganancia bruta acumulada incluye lo puro mas el máximo entre el proporcional presunto y el real ingresado.
        const gananciaBrutaConSACAcum = gananciaBrutaPuraAcum + topeSACParaCalculos + data.ajusteSACSemestral;

        // ── PASO 9: Deducciones totales ──────────────────────────
        const deduccionesTotalesAcum = deduccionesGeneralesAcum + deduccionesPersonalesAcum;

        // ── PASO 10: Ganancia Neta Sujeta a Impuesto ─────────────
        const gananciaNeta = Math.max(gananciaBrutaConSACAcum - deduccionesTotalesAcum, 0);

        // ── PASO 11: Impuesto Determinado ────────────────────────
        const impuestoDeterminado = calcularImpuestoEscalas(gananciaNeta, escalas);

        // ── PASO 12-14: Retenciones ──────────────────────────────
        let retencionesAnteriores = 0;
        for (let p = 0; p < m; p++) {
            retencionesAnteriores += results[p].retencionEfectiva;
            retencionesAnteriores += results[p].data.retencionesReintegradas;
        }

        // ── PASO 15: Retención del Mes ──────────────────────────
        const retencionDelMes = Math.max(
            impuestoDeterminado - data.pagosACuenta - retencionesAnteriores + data.retencionesReintegradas,
            0
        );

        // Tope 35%
        const sueldoNeto = ingresoBolsillo + pluriempleoBolsillo - totalDescuentos;
        const tope35 = sueldoNeto * params.topeRetencion;
        const retencionEfectivaCalculada = Math.min(retencionDelMes, tope35);
        // Si el usuario ingresó la retención real sufrida, se usa esa
        const retencionEfectiva = (data.retencionEfectivaManual != null && data.retencionEfectivaManual !== '')
            ? Number(data.retencionEfectivaManual)
            : retencionEfectivaCalculada;
        const diferenciaNoRetenida = retencionDelMes - retencionEfectivaCalculada;

        // Sueldo neto final
        const sueldoNetoFinal = ingresoBolsillo + pluriempleoBolsillo - totalDescuentos - retencionEfectiva;

        // ── Store result ─────────────────────────────────────────
        results.push({
            mes: m,
            data, // reference to input data

            // Ingresos
            totalIngresos: ingresoBolsillo, // back-compat
            ingresoBolsillo,
            totalIngresosPuros: totalIngresos,
            totalPluriempleo: pluriempleoBolsillo, // back-compat
            pluriempleoBolsillo,

            // Descuentos
            baseDescuentos,
            jubilacionAuto,
            obraSocialAuto,
            inssjpAuto,
            jubilacion,
            obraSocial,
            inssjp,
            totalDescuentos,

            // Ganancia bruta
            gananciaBrutaMes: gananciaBrutaMesConSACRecibo, // back-compat 
            gananciaBrutaPuraMes,
            gananciaBrutaPuraAcum,

            sacRealMes,
            sacRealAcum,
            sacProporcionalMensual,
            sacProporcional: sacProporcionalAcum, // back-compat name
            sacProporcionalAcum,
            topeSACParaCalculos,

            gananciaBrutaConSAC: gananciaBrutaParaTopesMes,
            gananciaBrutaConSACAcum,

            // Promedio remuneración bruta (para DEA)
            promedioRemuneracion: gananciaBrutaPuraAcum / (m + 1),

            // Deducciones generales
            alquiler40,
            alquiler10,
            medicinaPreDeducible,
            educacionDeducible,
            seguroVidaDeducible,
            donacionesDeducible,
            deduccionesSobreSAC,
            totalDeduccionesGenerales,
            deduccionesGeneralesAcum,

            // Deducciones personales
            mni,
            dedConyuge,
            dedHijos,
            dedHijosIncap,
            dedEspecial,
            dedEspecialDoceavaParte,
            totalDeduccionesPersonales,
            deduccionesPersonalesAcum,
            deduccionesTotalesAcum,

            // Ganancia neta
            gananciaNeta,

            // Impuesto
            impuestoDeterminado,
            retencionesAnteriores,
            retencionDelMes,
            tope35,
            retencionEfectiva,
            diferenciaNoRetenida,

            // Neto
            sueldoNeto,
            sueldoNetoFinal,
        });
    }

    return results;
}

/**
 * Format a number as Argentine currency
 */
export function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) return '$0,00';
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercent(value) {
    return (value * 100).toFixed(1) + '%';
}
