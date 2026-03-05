import { useRef } from 'react';

const NAV_ITEMS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'liquidacion', icon: '💰', label: 'Liquidación Mensual' },
    { id: 'config', icon: '👤', label: 'Configuración Personal' },
    { id: 'parametros', icon: '⚙️', label: 'Parámetros Anuales' },
    { id: 'guia', icon: '📖', label: 'Guía de Ayuda' },
];

export default function Sidebar({ activeView, setActiveView, isOpen, onClose, exportData, importData, resetAllData, generatePDF }) {
    const fileInputRef = useRef(null);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const success = importData(ev.target.result);
            if (success) alert('✅ Datos importados correctamente');
            else alert('❌ Error al importar datos');
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">$</div>
                    <div className="logo-text">
                        Ganancias 4ta Cat.
                        <span>Calculadora 2025</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                        onClick={() => { setActiveView(item.id); onClose(); }}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Indicador auto-guardado */}
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        paddingBottom: '4px',
                        borderBottom: '1px solid var(--border-subtle)',
                        marginBottom: '2px',
                    }}>
                        <span style={{ color: '#10b981', fontSize: '0.65rem' }}>●</span>
                        Auto-guardado activo en este navegador
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={generatePDF}>
                        📄 Informe PDF
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={exportData} title="Descarga un archivo JSON con todos tus datos para compartir o hacer backup">
                        💾 Guardar borrador
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()} title="Cargá un borrador previamente guardado">
                        📂 Cargar borrador
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                            if (confirm('¿Borrar todos los datos y empezar de cero?')) resetAllData();
                        }}
                    >
                        🗑️ Reset Todo
                    </button>
                </div>
            </div>
        </aside>
    );
}
