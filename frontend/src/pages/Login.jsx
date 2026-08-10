import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionMsg, setSessionMsg] = useState('');
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Show redirect message if session expired or unauthorized
    React.useEffect(() => {
        const msg = sessionStorage.getItem('authError');
        if (msg) {
            setSessionMsg(msg);
            sessionStorage.removeItem('authError');
        }
    }, []);

    React.useEffect(() => {
        if (user) {
            if (user.role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Backend: POST /auth/login → { token, tokenType, userId, email, role, fullName }
            const res = await api.post('/auth/login', { email, password });
            login(res.data);        // save full authResponse object
            if (res.data.role === 'ROLE_ADMIN') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });      // redirect passengers to landing page
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <div className="sw-card p-4 p-md-5">
                            {/* Logo */}
                            <div className="text-center mb-4">
                                <div className="mb-2" style={{ fontSize: '2.5rem' }}>🚌</div>
                                <h2 className="fw-800 mb-0" style={{ color: '#0B3C5D', fontWeight: 800 }}>EasyTravel</h2>
                                <p className="text-muted small mt-1">India's Premium Bus Booking</p>
                            </div>

                            <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>Sign in to your account</h5>

                            {sessionMsg && (
                                <div className="alert alert-warning rounded-3 d-flex align-items-center gap-2 small py-2 mb-3">
                                    <i className="bi bi-exclamation-triangle-fill text-warning"></i>
                                    {sessionMsg}
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger py-2 px-3 rounded-3 small" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small text-muted">Email Address</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                            <i className="bi bi-envelope text-muted"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control border-start-0 sw-input"
                                            style={{ borderRadius: '0 10px 10px 0' }}
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold small text-muted">Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                            <i className="bi bi-lock text-muted"></i>
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control border-start-0 border-end-0 sw-input"
                                            placeholder="Min. 8 characters"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-light border border-start-0"
                                            style={{ borderRadius: '0 10px 10px 0', borderColor: '#CED4DA' }}
                                            onClick={() => setShowPassword(!showPassword)}
                                            title={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-muted`}></i>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-sw-orange w-100 d-block text-center"
                                    disabled={loading}
                                    style={{ border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
                                >
                                    {loading ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Signing In...</>
                                    ) : (
                                        <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <span className="text-muted small">Forgot your password? </span>
                                <Link to="/forgot-password" className="fw-bold text-decoration-none" style={{ color: '#0B3C5D' }}>Reset it here</Link>
                            </div>

                            <div className="text-center mt-2">
                                <span className="text-muted small">Don't have an account? </span>
                                <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#0B3C5D' }}>Register for free</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}