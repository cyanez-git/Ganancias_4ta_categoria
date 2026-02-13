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
            deduccionEspecialZonaDesfavorable: 1827832.90,
        },
        // Julio a Diciembre
        sem2: {
            gananciaNoImponible: 326355.70,
            conyuge: 302130.08,
            hijo: 159273.44,
            hijoIncapacitado: 318546.87,
            deduccionEspecialGeneral: 1142244.94,
            deduccionEspecialProfesionales: 1713367.40,
            deduccionEspecialZonaDesfavorable: 0, // NO VIGENTE 2025
        },
    },

    // ── Escalas Progresivas Art. 94 ────────────────────────────
    escalas: {
        // Enero a Junio 2025
        sem1: [
            { desde: 0, hasta: 126697.64, fijo: 0, porcentaje: 0.05, excedenteDe: 0 },
            { desde: 126697.64, hasta: 253395.28, fijo: 6334.88, porcentaje: 0.09, excedenteDe: 126697.64 },
            { desde: 253395.28, hasta: 380092.92, fijo: 17737.67, porcentaje: 0.12, excedenteDe: 253395.28 },
            { desde: 380092.92, hasta: 570139.38, fijo: 32941.39, porcentaje: 0.15, excedenteDe: 380092.92 },
            { desde: 570139.38, hasta: 1140278.75, fijo: 61448.36, porcentaje: 0.19, excedenteDe: 570139.38 },
            { desde: 1140278.75, hasta: 1710418.13, fijo: 169774.84, porcentaje: 0.23, excedenteDe: 1140278.75 },
            { desde: 1710418.13, hasta: 2565627.20, fijo: 300906.89, porcentaje: 0.27, excedenteDe: 1710418.13 },
            { desde: 2565627.20, hasta: 3848440.79, fijo: 531813.34, porcentaje: 0.31, excedenteDe: 2565627.20 },
            { desde: 3848440.79, hasta: Infinity, fijo: 929485.56, porcentaje: 0.35, excedenteDe: 3848440.79 },
        ],
        // Julio a Diciembre 2025
        sem2: [
            { desde: 0, hasta: 886883.47, fijo: 0, porcentaje: 0.05, excedenteDe: 0 },
            { desde: 886883.47, hasta: 1773766.95, fijo: 44344.17, porcentaje: 0.09, excedenteDe: 886883.47 },
            { desde: 1773766.95, hasta: 2660650.42, fijo: 124163.69, porcentaje: 0.12, excedenteDe: 1773766.95 },
            { desde: 2660650.42, hasta: 3990975.64, fijo: 230589.70, porcentaje: 0.15, excedenteDe: 2660650.42 },
            { desde: 3990975.64, hasta: 7981951.27, fijo: 430138.49, porcentaje: 0.19, excedenteDe: 3990975.64 },
            { desde: 7981951.27, hasta: 11972926.91, fijo: 1188423.86, porcentaje: 0.23, excedenteDe: 7981951.27 },
            { desde: 11972926.91, hasta: 17959390.37, fijo: 2106348.25, porcentaje: 0.27, excedenteDe: 11972926.91 },
            { desde: 17959390.37, hasta: 26939085.55, fijo: 3722693.39, porcentaje: 0.31, excedenteDe: 17959390.37 },
            { desde: 26939085.55, hasta: Infinity, fijo: 6506398.89, porcentaje: 0.35, excedenteDe: 26939085.55 },
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

    // ── Incremento Deducción Especial (Ley 27.743) ────────────
    incrementoDeduccionEspecial: 0.22,

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
