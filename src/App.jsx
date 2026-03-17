import { useState, useEffect } from 'react';
import { auth } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useAppState } from './hooks/useAppState';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LiquidacionMensual from './components/LiquidacionMensual';
import ConfigPersonal from './components/ConfigPersonal';
import ConfigParametros from './components/ConfigParametros';
import GuiaAyuda from './components/GuiaAyuda';
import ActiveYearBanner from './components/ActiveYearBanner';
import AdminLogin from './components/AdminLogin';
import AdminUploadParams from './components/AdminUploadParams';
import { generatePDFReport } from './engine/pdfReportGenerator';

export default function App() {
    const state = useAppState();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAdminUser(user);
            setAuthChecked(true);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setAdminUser(null);
        state.setActiveView('dashboard');
    };

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
            case 'admin':
                // If Firebase auth check hasn't completed yet, show nothing
                if (!authChecked) return null;
                // If not authenticated, show login form
                if (!adminUser) {
                    return <AdminLogin onAuthSuccess={(user) => setAdminUser(user)} />;
                }
                // Authenticated: show the upload panel with logout button
                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', alignSelf: 'center', marginRight: '12px' }}>
                                ✅ Sesión activa: {adminUser.email}
                            </span>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                                🚪 Cerrar sesión
                            </button>
                        </div>
                        <AdminUploadParams />
                    </div>
                );
            case 'guia':
                return <GuiaAyuda />;
            default:
                return <Dashboard {...state} />;
        }
    };

    return (
        <>
            <ActiveYearBanner year={state.params?.year} />
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
                    adminUser={adminUser}
                    onLogout={handleLogout}
                />

                <main className="main-content">
                    <div className="animate-in" key={state.activeView}>
                        {renderView()}
                    </div>
                </main>
            </div>
        </>
    );
}
