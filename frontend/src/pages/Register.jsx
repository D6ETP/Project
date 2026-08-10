import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
    const [step, setStep] = useState(1); // 1=form, 2=otp
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    // Step 1: Validate form and call backend to send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (!/^\d{10}$/.test(form.phone)) { setError('Enter a valid 10-digit phone number.'); return; }

        setLoading(true);
        try {
            // Backend sends real OTP email via Gmail SMTP
            await api.post('/auth/send-otp', { email: form.email });
            setStep(2);
            startResendCooldown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setError('');
        setOtp('');
        setLoading(true);
        try {
            await api.post('/auth/send-otp', { email: form.email });
            startResendCooldown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP with backend, then register
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        if (otp.length < 6) { setError('Please enter all 6 digits.'); return; }
        setError('');
        setLoading(true);
        try {
            // Step 2a: Verify OTP
            await api.post('/auth/verify-otp', { email: form.email, otp });

            // Step 2b: Register the user
            await api.post('/auth/register', {
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                password: form.password,
                role: 'ROLE_PASSENGER'
            });
            navigate('/login', { state: { message: '✅ Account created! Please log in.' } });
        } catch (err) {
            const msg = err.response?.data?.message || 'Verification failed. Please try again.';
            setError(msg);
            if (msg.includes('Invalid') || msg.includes('expired')) {
                setOtp('');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%)' }}>
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <div className="sw-card p-4 p-md-5">
                            <div className="text-center mb-4">
                                <div className="mb-2" style={{ fontSize: '2.5rem' }}>🚌</div>
                                <h2 className="fw-800 mb-0" style={{ color: '#0B3C5D', fontWeight: 800 }}>EasyTravel</h2>
                                <p className="text-muted small mt-1">
                                    {step === 1 ? 'Create your account' : `Verify email: ${form.email}`}
                                </p>
                                {/* Step progress */}
                                <div className="d-flex justify-content-center gap-2 mt-2">
                                    {[1, 2].map(s => (
                                        <div key={s} className="rounded-pill" style={{ height: 4, width: 40, background: step >= s ? '#328CC1' : '#e9ecef', transition: 'background 0.3s' }}></div>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2 px-3 rounded-3 small">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                                </div>
                            )}

                            {/* ── STEP 1: Registration Form ── */}
                            {step === 1 && (
                                <form onSubmit={handleSendOtp}>
                                    {[
                                        { label: 'Full Name', name: 'fullName', type: 'text', icon: 'bi-person', placeholder: 'Your full name' },
                                        { label: 'Email Address', name: 'email', type: 'email', icon: 'bi-envelope', placeholder: 'you@example.com' },
                                        { label: 'Phone Number', name: 'phone', type: 'tel', icon: 'bi-telephone', placeholder: '10-digit mobile number', maxLength: 10 },
                                        { label: 'Password', name: 'password', type: 'password', icon: 'bi-lock', placeholder: 'Min. 8 characters' },
                                        { label: 'Confirm Password', name: 'confirmPassword', type: 'password', icon: 'bi-shield-lock', placeholder: 'Re-enter password' },
                                    ].map(field => (
                                        <div key={field.name} className="mb-3">
                                            <label className="form-label fw-semibold small text-muted">{field.label}</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                                    <i className={`bi ${field.icon} text-muted`}></i>
                                                </span>
                                                <input type={field.type} name={field.name}
                                                    className="form-control border-start-0 sw-input"
                                                    style={{ borderRadius: '0 10px 10px 0' }}
                                                    placeholder={field.placeholder}
                                                    maxLength={field.maxLength}
                                                    value={form[field.name]} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    ))}

                                    <button type="submit" className="btn-sw-orange w-100 d-block text-center border-none mt-3" disabled={loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Sending OTP...</>
                                        ) : (
                                            <><i className="bi bi-send me-2"></i>Send OTP to Email</>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* ── STEP 2: OTP Verification ── */}
                            {step === 2 && (
                                <form onSubmit={handleVerifyAndRegister}>
                                    <div className="alert alert-info rounded-3 small mb-4 py-2">
                                        <i className="bi bi-envelope-check-fill me-2"></i>
                                        A 6-digit OTP has been sent to <strong>{form.email}</strong>. Check your inbox (and spam folder).
                                    </div>

                                    {/* Simple OTP input */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">Enter 6-digit OTP</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                                <i className="bi bi-key text-muted"></i>
                                            </span>
                                            <input type="text" className="form-control border-start-0 sw-input"
                                                style={{ borderRadius: '0 10px 10px 0', letterSpacing: '4px' }}
                                                placeholder="123456" maxLength={6}
                                                value={otp} onChange={e => setOtp(e.target.value)} required autoFocus />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-sw-primary w-100 d-block text-center border-none mb-2" disabled={loading || otp.length < 6}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</>
                                        ) : (
                                            <><i className="bi bi-person-check-fill me-2"></i>Verify & Create Account</>
                                        )}
                                    </button>

                                    <div className="text-center mt-2">
                                        {resendCooldown > 0 ? (
                                            <p className="text-muted small">Resend OTP in <strong>{resendCooldown}s</strong></p>
                                        ) : (
                                            <button type="button" onClick={handleResend} disabled={loading}
                                                className="btn btn-link text-decoration-none small p-0">
                                                <i className="bi bi-arrow-repeat me-1"></i>Resend OTP
                                            </button>
                                        )}
                                    </div>

                                    <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                                        className="btn btn-link w-100 text-muted small text-decoration-none mt-1">
                                        ← Back to Edit Details
                                    </button>
                                </form>
                            )}

                            <div className="text-center mt-4">
                                <span className="text-muted small">Already have an account? </span>
                                <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#0B3C5D' }}>Sign In</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
