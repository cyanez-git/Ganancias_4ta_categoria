import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_PARAMS_2025, createEmptyYearData, createDefaultConfig } from '../engine/defaultParams';
import { calculateAllMonths } from '../engine/calculationEngine';

const STORAGE_KEY = 'ganancias-4ta-cat-data';

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Restore Infinity values in escalas
            if (parsed.params) {
                ['sem1', 'sem2'].forEach(sem => {
                    if (parsed.params.escalas?.[sem]) {
                        const last = parsed.params.escalas[sem].length - 1;
                        if (last >= 0) parsed.params.escalas[sem][last].hasta = Infinity;
                    }
                });
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
            next[monthIndex] = { ...next[monthIndex], [field]: Number(value) || 0 };
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
