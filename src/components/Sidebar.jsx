import { useRef } from 'react';

const NAV_ITEMS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'liquidacion', icon: '💰', label: 'Liquidación Mensual' },
    { id: 'config', icon: '👤', label: 'Configuración Personal' },
    { id: 'parametros', icon: '⚙️', label: 'Parámetros Anuales' },
];

export default function Sidebar({ activeView, setActiveView, isOpen, onClose, exportData, importData, resetAllData }) {
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
                    <button className="btn btn-ghost btn-sm" onClick={exportData}>
                        📥 Exportar JSON
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
                        📤 Importar JSON
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
