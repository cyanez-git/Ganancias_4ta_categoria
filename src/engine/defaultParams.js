/**
 * Default parameters for Ganancias 4ta Categoría 2025
 * Based on ARCA official tables and RG 2025
 */

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

    // ── Escalas Progresivas Art. 94 (TABLAS ANUALES) ───────────
    escalas: {
        sem1: [
            { desde: 0, hasta: 1520371.68, fijo: 0, porcentaje: 0.05, excedenteDe: 0 },
            { desde: 1520371.68, hasta: 3040743.36, fijo: 76018.56, porcentaje: 0.09, excedenteDe: 1520371.68 },
            { desde: 3040743.36, hasta: 4561115.04, fijo: 212852.04, porcentaje: 0.12, excedenteDe: 3040743.36 },
            { desde: 4561115.04, hasta: 6841672.56, fijo: 395296.68, porcentaje: 0.15, excedenteDe: 4561115.04 },
            { desde: 6841672.56, hasta: 13683345.00, fijo: 737380.32, porcentaje: 0.19, excedenteDe: 6841672.56 },
            { desde: 13683345.00, hasta: 20525017.56, fijo: 2037298.08, porcentaje: 0.23, excedenteDe: 13683345.00 },
            { desde: 20525017.56, hasta: 30787526.40, fijo: 3610882.68, porcentaje: 0.27, excedenteDe: 20525017.56 },
            { desde: 30787526.40, hasta: 46181289.48, fijo: 6381760.08, porcentaje: 0.31, excedenteDe: 30787526.40 },
            { desde: 46181289.48, hasta: Infinity, fijo: 11153826.72, porcentaje: 0.35, excedenteDe: 46181289.48 },
        ],
        sem2: [
            { desde: 0, hasta: 1520371.68, fijo: 0, porcentaje: 0.05, excedenteDe: 0 },
            { desde: 1520371.68, hasta: 3040743.36, fijo: 76018.56, porcentaje: 0.09, excedenteDe: 1520371.68 },
            { desde: 3040743.36, hasta: 4561115.04, fijo: 212852.04, porcentaje: 0.12, excedenteDe: 3040743.36 },
            { desde: 4561115.04, hasta: 6841672.56, fijo: 395296.68, porcentaje: 0.15, excedenteDe: 4561115.04 },
            { desde: 6841672.56, hasta: 13683345.00, fijo: 737380.32, porcentaje: 0.19, excedenteDe: 6841672.56 },
            { desde: 13683345.00, hasta: 20525017.56, fijo: 2037298.08, porcentaje: 0.23, excedenteDe: 13683345.00 },
            { desde: 20525017.56, hasta: 30787526.40, fijo: 3610882.68, porcentaje: 0.27, excedenteDe: 20525017.56 },
            { desde: 30787526.40, hasta: 46181289.48, fijo: 6381760.08, porcentaje: 0.31, excedenteDe: 30787526.40 },
            { desde: 46181289.48, hasta: Infinity, fijo: 11153826.72, porcentaje: 0.35, excedenteDe: 46181289.48 },
        ],
    },

    // ── Topes MoPRe mensuales ──────────────────────────────────
    topesMoPre: [
        2910574, // Ene
        2910574, // Feb
        2910574, // Mar
        2910574, // Abr
        2910574, // May
        2910574, // Jun
        2910574, // Jul
        2910574, // Ago
        2910574, // Sep
        2910574, // Oct
        2910574, // Nov
        3731212, // Dic
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
