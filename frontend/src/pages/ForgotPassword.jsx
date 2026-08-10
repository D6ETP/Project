import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Request OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/forgot-password-otp', { email });
            setMessage(res.data.message || 'OTP sent successfully');
            setStep(2);
        } catch (err) {
            const data = err.response?.data;
            const detailedMsg = data?.message || data?.error || 'Unknown error';
            setError(`Error: ${detailedMsg}`);
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP and Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/reset-password', { email, otp, newPassword });
            setMessage(res.data.message || 'Password reset successful!');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
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
                            <div className="text-center mb-4">
                                <h4 className="fw-bold mb-0" style={{ color: '#0B3C5D' }}>Password Recovery</h4>
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2 px-3 rounded-3 small" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                                </div>
                            )}
                            
                            {message && (
                                <div className="alert alert-success py-2 px-3 rounded-3 small" role="alert">
                                    <i className="bi bi-check-circle-fill me-2"></i>{message}
                                </div>
                            )}

                            {step === 1 && (
                                <form onSubmit={handleSendOtp}>
                                    <p className="text-muted small mb-4 text-center">
                                        Enter your registered email address to receive an OTP.
                                    </p>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control sw-input"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn-sw-orange w-100 d-block text-center mb-3"
                                        disabled={loading}
                                        style={{ border: 'none' }}
                                    >
                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Send OTP'}
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleResetPassword}>
                                    <p className="text-muted small mb-4 text-center">
                                        Enter the OTP sent to {email} and your new password.
                                    </p>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Enter OTP</label>
                                        <input
                                            type="text"
                                            className="form-control sw-input text-center fw-bold tracking-widest"
                                            placeholder="000000"
                                            maxLength="6"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control sw-input"
                                            placeholder="Min 8 characters"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            minLength="8"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn-sw-orange w-100 d-block text-center mb-3"
                                        disabled={loading}
                                        style={{ border: 'none' }}
                                    >
                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Reset Password'}
                                    </button>
                                </form>
                            )}

                            <div className="text-center mt-3">
                                <Link to="/login" className="text-decoration-none small text-muted">
                                    <i className="bi bi-arrow-left me-1"></i>Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
