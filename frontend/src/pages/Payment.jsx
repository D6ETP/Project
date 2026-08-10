import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Payment() {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Payment flow
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('external'); // 'external' or 'wallet'

    const schedule = state?.schedule;
    const seats = state?.seats;
    const passengers = state?.passengers;
    const contact = state?.contact;

    React.useEffect(() => {
        api.get(`/auth/wallet?userId=${JSON.parse(localStorage.getItem('userInfo'))?.userId}`).then(res => setWalletBalance(res.data.walletBalance)).catch(console.error);
    }, []);

    if (!schedule || !seats || !passengers || !contact) { navigate('/search'); return null; }

    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    const VALID_COUPONS = {
        'EASY50': { discountPercent: 50, maxDiscount: 200, label: '50% OFF (up to ₹200)' },
        'FIRST100': { flatDiscount: 100, label: 'Flat ₹100 OFF' },
        'MAHA20': { discountPercent: 20, maxDiscount: 150, label: '20% OFF (up to ₹150)' }
    };

    const originalAmount = schedule.price * seats.length;

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.flatDiscount) {
            return Math.min(appliedCoupon.flatDiscount, originalAmount);
        }
        if (appliedCoupon.discountPercent) {
            const calc = (originalAmount * appliedCoupon.discountPercent) / 100;
            return Math.min(calc, appliedCoupon.maxDiscount || calc);
        }
        return 0;
    };

    const discountAmount = calculateDiscount();
    const totalAmount = Math.max(0, originalAmount - discountAmount);

    const handleApplyCoupon = () => {
        setCouponError('');
        const code = couponInput.trim().toUpperCase();
        if (!code) return;
        if (VALID_COUPONS[code]) {
            setAppliedCoupon({ code, ...VALID_COUPONS[code] });
            setCouponInput('');
        } else {
            setCouponError('Invalid code! Try EASY50, FIRST100, or MAHA20');
        }
    };

    const [errorMsg, setErrorMsg] = useState('');

    const handlePay = async () => {
        setErrorMsg('');
        if (paymentMethod === 'wallet' && walletBalance < totalAmount) {
            setErrorMsg('Insufficient wallet balance! Please choose PhonePe / UPI or add money to your wallet.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                scheduleId: schedule.scheduleId,
                contactEmail: contact.email,
                contactPhone: contact.phone,
                paymentMethod: paymentMethod,
                boardingPoint: state.points?.boardingPoint,
                droppingPoint: state.points?.droppingPoint,
                passengers: passengers.map(p => ({
                    seatId: p.seatId,
                    passengerName: p.name,
                    passengerAge: p.age,
                    passengerGender: p.gender
                }))
            };

            const res = await api.post('/bookings/bulk', payload);
            const bookings = res.data;

            navigate('/ticket', { state: { bookings, schedule, contact } });
        } catch (err) {
            setLoading(false);
            console.error("Booking failed:", err.response?.data);
            const data = err.response?.data;
            const detailedMsg = data?.message || data?.error || (typeof data === 'object' ? JSON.stringify(data) : data) || 'Payment processing failed.';
            setErrorMsg(detailedMsg);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-sm btn-light rounded-circle" style={{ width: 36, height: 36 }}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div>
                            <h4 className="fw-bold text-white mb-0">Secure Payment</h4>
                            <small className="text-white opacity-75">
                                <i className="bi bi-shield-lock-fill me-1"></i>256-bit SSL Encrypted
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                <div className="row g-4 justify-content-center">
                    {/* Payment methods */}
                    <div className="col-12 col-lg-7">
                        <div className="sw-card p-4">
                            
                            <h5 className="fw-bold mb-3 pb-2 border-bottom">Select Payment Method</h5>

                            {errorMsg && (
                                <div className="alert alert-danger rounded-3 mb-4 p-3 shadow-sm border-0 border-start border-4 border-danger">
                                    <div className="d-flex align-items-start gap-3">
                                        <i className="bi bi-exclamation-triangle-fill fs-4 text-danger mt-1"></i>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold text-danger mb-1">Booking Issue</h6>
                                            <p className="mb-2 small text-dark">{errorMsg}</p>
                                            <div className="d-flex gap-2 flex-wrap mt-2">
                                                <button onClick={() => navigate('/seats', { state: { schedule } })} className="btn btn-sm btn-outline-danger rounded-pill">
                                                    <i className="bi bi-grid-3x3 me-1"></i>Re-select Seats
                                                </button>
                                                <button onClick={() => navigate('/search')} className="btn btn-sm btn-outline-primary rounded-pill">
                                                    <i className="bi bi-search me-1"></i>Search Other Buses
                                                </button>
                                                <button onClick={() => setErrorMsg('')} className="btn btn-sm btn-light border text-muted rounded-pill">
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
                                <label className={`border p-3 rounded-3 flex-grow-1 text-center ${paymentMethod === 'external' ? 'border-primary bg-light' : ''}`} style={{cursor: 'pointer'}}>
                                    <input type="radio" name="paymethod" className="d-none" checked={paymentMethod === 'external'} onChange={() => setPaymentMethod('external')} />
                                    <h6 className="fw-bold mb-1" style={{ color: '#5F259F' }}><i className="bi bi-qr-code-scan me-2"></i>PhonePe / UPI</h6>
                                </label>
                                <label className={`border p-3 rounded-3 flex-grow-1 text-center ${paymentMethod === 'wallet' ? 'border-primary bg-light' : ''}`} style={{cursor: 'pointer'}}>
                                    <input type="radio" name="paymethod" className="d-none" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                                    <h6 className="fw-bold mb-1 text-success"><i className="bi bi-wallet2 me-2"></i>EasyTravel Wallet</h6>
                                    <small className="text-muted d-block mt-1">Balance: ₹{walletBalance.toFixed(2)}</small>
                                </label>
                            </div>

                            {!loading ? (
                                <>
                                    {paymentMethod === 'external' && (
                                        <div className="text-center">
                                            <p className="text-muted small mb-3">Scan the QR Code using any UPI App</p>
                                            <div className="mb-4 d-flex justify-content-center">
                                                <div className="p-3 bg-white rounded-4 shadow-sm border" style={{ display: 'inline-block' }}>
                                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=9511750662@ybl&pn=EasyTravel&am=${totalAmount}&cu=INR`}
                                                        alt="PhonePe QR"
                                                        style={{ width: '200px', height: '200px', borderRadius: '8px' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'wallet' && (
                                        <div className="text-center mb-4">
                                            {walletBalance >= totalAmount ? (
                                                <div className="alert alert-success d-flex flex-column align-items-center">
                                                    <i className="bi bi-check-circle fs-1 mb-2"></i>
                                                    <strong>Sufficient Balance Available!</strong>
                                                    <span>₹{totalAmount} will be deducted from your wallet.</span>
                                                </div>
                                            ) : (
                                                <div className="alert alert-danger d-flex flex-column align-items-center">
                                                    <i className="bi bi-exclamation-triangle fs-1 mb-2"></i>
                                                    <strong>Insufficient Balance!</strong>
                                                    <span>Your balance is ₹{walletBalance.toFixed(2)}, but you need ₹{totalAmount}.</span>
                                                    <span className="small mt-1">Please select PhonePe/UPI to complete payment.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Coupon / Promo Code Input */}
                                    <div className="mb-4 text-start">
                                        <label className="form-label fw-bold small text-muted">Have a Promo Code?</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control text-uppercase"
                                                placeholder="Enter Code (e.g. EASY50)"
                                                value={couponInput}
                                                onChange={e => setCouponInput(e.target.value)}
                                            />
                                            <button type="button" className="btn btn-outline-primary fw-bold" onClick={handleApplyCoupon}>
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && <small className="text-danger d-block mt-1">{couponError}</small>}
                                        {appliedCoupon && (
                                            <div className="mt-2 p-2 bg-success-subtle text-success rounded-3 small d-flex justify-content-between align-items-center border border-success">
                                                <span><i className="bi bi-tag-fill me-1"></i>Coupon <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.label})</span>
                                                <button type="button" className="btn-close btn-sm" onClick={() => setAppliedCoupon(null)}></button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 rounded-3 mb-4 text-start" style={{ background: '#FFF7ED', border: '1px solid #FDE68A' }}>
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted small">Ticket Fare ({seats.length} seats)</span>
                                            <span className="fw-bold">₹{originalAmount}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="d-flex justify-content-between mt-1 text-success fw-bold">
                                                <span className="small"><i className="bi bi-tag-fill me-1"></i>Promo Discount ({appliedCoupon.code})</span>
                                                <span>- ₹{discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between mt-1">
                                            <span className="text-muted small">Convenience Fee</span>
                                            <span className="fw-bold text-success">FREE</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between">
                                            <span className="fw-bold">Total Amount to Pay</span>
                                            <span className="fw-bold fs-5" style={{ color: '#E07B39' }}>₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {paymentMethod === 'external' && (
                                        <div className="form-check d-flex justify-content-center align-items-center gap-2 mb-4">
                                            <input className="form-check-input mt-0" type="checkbox" id="scanCheck"
                                                checked={scanned} onChange={(e) => setScanned(e.target.checked)} style={{ width: 20, height: 20 }} />
                                            <label className="form-check-label fw-bold text-success" htmlFor="scanCheck" style={{ cursor: 'pointer' }}>
                                                I have scanned and completed the payment
                                            </label>
                                        </div>
                                    )}

                                    <button 
                                        onClick={handlePay} 
                                        disabled={paymentMethod === 'external' ? !scanned : walletBalance < totalAmount} 
                                        className="btn-sw-orange w-100" style={{ border: 'none', fontSize: '1.1rem', padding: '14px' }}>
                                        <i className="bi bi-check-circle-fill me-2"></i> 
                                        {paymentMethod === 'wallet' ? 'Pay & Confirm Booking' : 'Confirm Booking'}
                                    </button>
                                </>
                            ) : (
                                <div className="spinner-overlay text-center py-4">
                                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                                    <h5 className="mt-3 fw-bold" style={{ color: '#0B3C5D' }}>Processing Booking...</h5>
                                    <p className="text-muted small">Verifying payment and generating tickets. Do not press back or refresh.</p>
                                    <div className="progress mt-3" style={{ height: 6, width: '200px', margin: '0 auto' }}>
                                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary sidebar */}
                    <div className="col-12 col-lg-5 payment-summary-col">
                        <div className="sw-card p-4" style={{ position: 'sticky', top: 90 }}>
                            <h6 className="fw-bold mb-3" style={{ color: '#0B3C5D' }}>Order Summary</h6>
                            <div className="d-flex flex-column gap-3">
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>ROUTE</div>
                                    <div className="fw-bold">{schedule.source} → {schedule.destination}</div>
                                </div>
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>SEATS ({seats.length})</div>
                                    <div className="fw-bold" style={{ color: '#27AE60', fontSize: '1.1rem' }}>
                                        {seats.map(s => s.seatNumber).join(', ')}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>PASSENGERS</div>
                                    <ul className="list-unstyled mb-0 small">
                                        {passengers.map((p, idx) => (
                                            <li key={idx} className="fw-bold">
                                                - {p.name} <span className="text-muted fw-normal">({p.age}y, {p.gender})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>BUS</div>
                                    <div className="fw-bold">{schedule.busNumber} ({schedule.busType})</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
