import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PARAMS_2025, createEmptyYearData, createDefaultConfig, generateMonthlyScalesFromAnnual } from '../engine/defaultParams';
import { calculateAllMonths } from '../engine/calculationEngine';

const STORAGE_KEY = 'ganancias-4ta-cat-data';

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.params) {
                // Migrate old semester-based escalas to monthly Array[12]
                if (parsed.params.escalas && !Array.isArray(parsed.params.escalas)) {
                    console.info('[migration] Converting escalas from {sem1,sem2} to Array[12]');
                    const sem1 = parsed.params.escalas.sem1;
                    const sem2 = parsed.params.escalas.sem2 || sem1;
                    // Restore Infinity on old format before converting
                    [sem1, sem2].forEach(arr => {
                        if (arr?.length) arr[arr.length - 1].hasta = Infinity;
                    });
                    parsed.params.escalas = Array.from({ length: 12 }, (_, m) => {
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
                // Restore Infinity on monthly escalas (Array[12])
                if (Array.isArray(parsed.params.escalas)) {
                    for (const monthEscala of parsed.params.escalas) {
                        if (monthEscala?.length) {
                            const last = monthEscala[monthEscala.length - 1];
                            if (last.hasta === 'Infinity' || last.hasta === null) {
                                last.hasta = Infinity;
                            }
                        }
                    }
                }
            }
            return parsed;
        }
    } catch (e) {
        console.warn('Error loading from localStorage:', e);
    }
    return null;
}

function saveToStorage(data) {
    try {
        // Clone and handle Infinity for JSON
        const clone = JSON.parse(JSON.stringify(data, (key, value) => {
            if (value === Infinity) return 'Infinity';
            return value;
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data, (key, value) => {
            if (value === Infinity) return 'Infinity';
            return value;
        }));
    } catch (e) {
        console.warn('Error saving to localStorage:', e);
    }
}

export function useAppState() {
    const [config, setConfig] = useState(() => {
        const saved = loadFromStorage();
        return saved?.config || createDefaultConfig();
    });

    const [params, setParams] = useState(() => {
        const saved = loadFromStorage();
        return saved?.params || { ...DEFAULT_PARAMS_2025 };
    });

    const [monthsData, setMonthsData] = useState(() => {
        const saved = loadFromStorage();
        return saved?.monthsData || createEmptyYearData();
    });

    const [activeMonth, setActiveMonth] = useState(0);
    const [activeView, setActiveView] = useState('liquidacion'); // liquidacion, dashboard, config, parametros

    // Calculate results whenever inputs change
    const results = calculateAllMonths(monthsData, config, params);

    // Auto-save
    useEffect(() => {
        saveToStorage({ config, params, monthsData });
    }, [config, params, monthsData]);

    const updateMonthField = useCallback((monthIndex, field, value) => {
        setMonthsData(prev => {
            const next = [...prev];
            // null significa "volver al autocalculado" para campos con override manual
            next[monthIndex] = { ...next[monthIndex], [field]: value === null ? null : (Number(value) || 0) };
            return next;
        });
    }, []);

    const updateConfig = useCallback((field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    }, []);

    const resetToDefaults = useCallback(() => {
        setParams({ ...DEFAULT_PARAMS_2025 });
    }, []);

    const resetAllData = useCallback(() => {
        setConfig(createDefaultConfig());
        setParams({ ...DEFAULT_PARAMS_2025 });
        setMonthsData(createEmptyYearData());
    }, []);

    const exportData = useCallback(() => {
        const data = JSON.stringify({ config, params, monthsData }, (key, value) => {
            if (value === Infinity) return 'Infinity';
            return value;
        }, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ganancias-4ta-cat-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [config, params, monthsData]);

    const importData = useCallback((jsonStr) => {
        try {
            const data = JSON.parse(jsonStr, (key, value) => {
                if (value === 'Infinity') return Infinity;
                return value;
            });
            if (data.config) setConfig(data.config);
            if (data.params) setParams(data.params);
            if (data.monthsData) setMonthsData(data.monthsData);
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }, []);

    return {
        config, setConfig, updateConfig,
        params, setParams, resetToDefaults,
        monthsData, setMonthsData, updateMonthField,
        results,
        activeMonth, setActiveMonth,
        activeView, setActiveView,
        resetAllData, exportData, importData,
    };
}
