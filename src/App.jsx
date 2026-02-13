import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LiquidacionMensual from './components/LiquidacionMensual';
import ConfigPersonal from './components/ConfigPersonal';
import ConfigParametros from './components/ConfigParametros';
import GuiaAyuda from './components/GuiaAyuda';
import { generatePDFReport } from './engine/pdfReportGenerator';

export default function App() {
    const state = useAppState();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderView = () => {
        switch (state.activeView) {
            case 'dashboard':
                return <Dashboard {...state} />;
            case 'liquidacion':
                return <LiquidacionMensual {...state} />;
            case 'config':
                return <ConfigPersonal {...state} />;
            case 'parametros':
                return <ConfigParametros {...state} />;
            case 'guia':
                return <GuiaAyuda />;
            default:
                return <Dashboard {...state} />;
        }
    };

    return (
        <div className="app-layout">
            <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                ☰
            </button>

            <Sidebar
                activeView={state.activeView}
                setActiveView={state.setActiveView}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                exportData={state.exportData}
                importData={state.importData}
                resetAllData={state.resetAllData}
                generatePDF={() => generatePDFReport(state.results, state.config, state.params)}
            />

            <main className="main-content">
                <div className="animate-in" key={state.activeView}>
                    {renderView()}
                </div>
            </main>
        </div>
    );
}
