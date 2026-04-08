/**
 * Default parameters for Ganancias 4ta Categoría 2025
 * Based on ARCA official tables and RG 2025
 */

/**
 * Generate 12 monthly accumulated scale tables from an annual base table.
 * Each monthly table = annual values × (m+1)/12.
 * Used as fallback when real ARCA monthly values are not yet loaded.
 */
export function generateMonthlyScalesFromAnnual(annual) {
    return Array.from({ length: 12 }, (_, m) => {
        const factor = (m + 1) / 12;
        return annual.map(t => ({
            desde: +(t.desde * factor).toFixed(2),
            hasta: t.hasta === Infinity ? Infinity : +(t.hasta * factor).toFixed(2),
            fijo: +(t.fijo * factor).toFixed(2),
            porcentaje: t.porcentaje,
            excedenteDe: +(t.excedenteDe * factor).toFixed(2),
        }));
    });
}

/**
 * Convert escalas Array[12] to Firestore-compatible format.
 * Firestore does NOT support nested arrays, so we convert to an object
 * with string keys: { "0": [tramos], "1": [tramos], ..., "11": [tramos] }
 * Also converts Infinity to null for JSON serialization.
 */
export function escalasToFirestore(escalasArray) {
    const obj = {};
    for (let m = 0; m < escalasArray.length; m++) {
        obj[m.toString()] = escalasArray[m].map(t => ({
            ...t,
            hasta: t.hasta === Infinity ? null : t.hasta,
        }));
    }
    return obj;
}

/**
 * Convert Firestore escalas object back to Array[12].
 * Handles both old format { sem1, sem2 } and new format { "0": [...], "1": [...] }.
 * Restores Infinity from null values.
 * Returns null for months not present in Firebase (caller handles the fallback).
 */
export function escalasFromFirestore(escalasData) {
    // New format: object with numeric string keys { "0": [...], ..., "11": [...] }
    if (escalasData && !Array.isArray(escalasData) && !escalasData.sem1) {
        return Array.from({ length: 12 }, (_, m) => {
            const tramos = escalasData[m.toString()];
            if (!tramos) return null; // Missing month — caller decides fallback
            return tramos.map(t => ({
                ...t,
                hasta: t.hasta === null ? Infinity : t.hasta,
            }));
        });
    }
    // Old format { sem1, sem2 }
    if (escalasData?.sem1) {
        const sem1 = escalasData.sem1;
        const sem2 = escalasData.sem2 || sem1;
        [sem1, sem2].forEach(arr => {
            if (arr?.length) {
                const last = arr[arr.length - 1];
                if (last.hasta === null) last.hasta = Infinity;
            }
        });
        return Array.from({ length: 12 }, (_, m) => {
            const base = m < 6 ? sem1 : sem2;
            const factor = (m + 1) / 12;
            return base.map(t => ({
                desde: +(t.desde * factor).toFixed(2),
                hasta: t.hasta === Infinity ? Infinity : +(t.hasta * factor).toFixed(2),
                fijo: +(t.fijo * factor).toFixed(2),
                porcentaje: t.porcentaje,
                excedenteDe: +(t.excedenteDe * factor).toFixed(2),
            }));
        });
    }
    // Already an array
    if (Array.isArray(escalasData)) {
        return escalasData.map(t => t ? t.map(tramo => ({ ...tramo, hasta: tramo.hasta === null ? Infinity : tramo.hasta })) : null);
    }
    return null;
}

export const DEFAULT_PARAMS_2025 = {
    year: 2025,
    label: 'Año Fiscal 2025',

    // ── Deducciones Personales ──────────────────────────────────
    deduccionesPersonales: {
        // Enero a Junio
        sem1: {
            gananciaNoImponible: 326355.70,
            conyuge: 302130.08,
            hijo: 159273.44,
            hijoIncapacitado: 318546.87,
            deduccionEspecialGeneral: 1142244.94,
            deduccionEspecialProfesionales: 1713367.40,
        },
        // Julio a Diciembre
        sem2: {
            gananciaNoImponible: 326355.70,
            conyuge: 302130.08,
            hijo: 159273.44,
            hijoIncapacitado: 318546.87,
            deduccionEspecialGeneral: 1142244.94,
            deduccionEspecialProfesionales: 1713367.40,
        },
    },

    // ── Escalas Progresivas Art. 94 (TABLAS MENSUALES ACUMULADAS) ──
    // Cada entrada escalas[m] contiene los 9 tramos acumulados para el mes m.
    // Los valores se obtienen directamente de los PDFs de ARCA.
    // El default se genera proporcionalizando la tabla anual base.
    escalas: generateMonthlyScalesFromAnnual([
        { desde: 0, hasta: 1520371.68, fijo: 0, porcentaje: 0.05, excedenteDe: 0 },
        { desde: 1520371.68, hasta: 3040743.36, fijo: 76018.56, porcentaje: 0.09, excedenteDe: 1520371.68 },
        { desde: 3040743.36, hasta: 4561115.04, fijo: 212852.04, porcentaje: 0.12, excedenteDe: 3040743.36 },
        { desde: 4561115.04, hasta: 6841672.56, fijo: 395296.68, porcentaje: 0.15, excedenteDe: 4561115.04 },
        { desde: 6841672.56, hasta: 13683345.00, fijo: 737380.32, porcentaje: 0.19, excedenteDe: 6841672.56 },
        { desde: 13683345.00, hasta: 20525017.56, fijo: 2037298.08, porcentaje: 0.23, excedenteDe: 13683345.00 },
        { desde: 20525017.56, hasta: 30787526.40, fijo: 3610882.68, porcentaje: 0.27, excedenteDe: 20525017.56 },
        { desde: 30787526.40, hasta: 46181289.48, fijo: 6381760.08, porcentaje: 0.31, excedenteDe: 30787526.40 },
        { desde: 46181289.48, hasta: Infinity, fijo: 11153826.72, porcentaje: 0.35, excedenteDe: 46181289.48 },
    ]),


    // ── Topes MoPRe mensuales ──────────────────────────────────
    topesMoPre: [
        2910574.49, // Ene
        2989160,    // Feb
        3055220.44, // Mar
        3128545.73, // Abr
        3245240.49, // May
        3335458.18, // Jun
        3385490.05, // Jul
        3440334.99, // Ago
        3505701.35, // Sep
        3571608.54, // Oct
        3645898,    // Nov
        3731212.01, // Dic
    ],

    // ── Porcentajes descuentos obligatorios ────────────────────
    porcentajes: {
        jubilacion: 0.11,
        obraSocial: 0.03,
        inssjp: 0.03,
    },

    // ── Tope retención ────────────────────────────────────────
    topeRetencion: 0.35,
};

export const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTHS_SHORT = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function createEmptyMonthData() {
    return {
        // Ingresos del mes (input)
        sueldoBasico: 0,
        adicionalesHabituales: 0,
        antiguedad: 0,
        comisiones: 0,
        plusVacacional: 0,
        otrosRemunerativos: 0,
        noRemunerativosHabituales: 0,
        noRemunerativosNoHabituales: 0,
        sacAguinaldo: 0,

        // Pluriempleo (input)
        retribucionesHabitualesPluriempleo: 0,
        retribucionesNoHabitualesPluriempleo: 0,
        sacPluriempleo: 0,

        // Descuentos manuales (input)
        aportesSindicales: 0,
        otrosDescuentosObligatorios: 0,

        // Aportes previsionales manuales (null = usar el autocalculado)
        jubilacionManual: null,
        obraSocialManual: null,
        inssjpManual: null,

        // Deducciones generales (input)
        alquilerPagado: 0,
        medicinaPrepaga: 0,
        gastosEducacion: 0,
        primasSeguroVida: 0,
        servicioDomestico: 0,
        interesesHipotecarios: 0,
        donaciones: 0,
        otrasDeducciones: 0,
        primasSeguridadMixtos: 0,
        pagosFCIRetiro: 0,
        gastosSepelio: 0,
        amortizacionAutomotor: 0,
        gastosMedicos: 0,
        aportesSGR: 0,
        aportesSeguroRetiro: 0,
        gastosEquipamientoTrabajo: 0,
        adicionalesAntartida: 0,

        // Impuesto (input)
        pagosACuenta: 0,
        retencionesReintegradas: 0,

        // Retención efectiva real sufrida (null = usar la calculada)
        retencionEfectivaManual: null,

        // Ajuste SAC semestral (input, solo Jun y Dic)
        ajusteSACSemestral: 0,
    };
}

export function createEmptyYearData() {
    return Array.from({ length: 12 }, () => createEmptyMonthData());
}

export function createDefaultConfig() {
    return {
        tieneConyuge: false,
        cantidadHijos: 0,
        hijosIncapacitados: 0,
        tipoDeduccionEspecial: 'General', // General, Profesionales, Corredores-Viajantes, Personal Antártida
    };
}
