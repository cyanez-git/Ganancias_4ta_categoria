import { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function AdminLogin({ onAuthSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            onAuthSuccess(credential.user);
        } catch (err) {
            setError(getErrorMessage(err.code));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
                <div className="card-header">
                    <h2 style={{ margin: 0 }}>🔐 Acceso Administrador</h2>
                </div>
                <form onSubmit={handleLogin} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', margin: 0 }}>
                        Esta sección está restringida. Ingresá con tu cuenta de administrador para continuar.
                    </p>

                    {error && (
                        <div style={{ background: '#2d1b1b', border: '1px solid #c0392b', borderRadius: '6px', padding: '10px 14px', color: '#e74c3c', fontSize: 'var(--font-sm)' }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ejemplo.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '8px' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verificando...' : '🔓 Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function getErrorMessage(code) {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Email o contraseña incorrectos.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Intentá de nuevo más tarde.';
        case 'auth/network-request-failed':
            return 'Error de conexión. Verificá tu internet.';
        default:
            return `Error al iniciar sesión (${code}).`;
    }
}
