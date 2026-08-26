import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function UserDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionStatus, setActionStatus] = useState('');
    const [actionError, setActionError] = useState('');

    const [cancelTarget, setCancelTarget] = useState(null);

    const [reviewTarget, setReviewTarget] = useState(null);
    const [ratingScore, setRatingScore] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const [topupAmount, setTopupAmount] = useState(500);
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [topupLoading, setTopupLoading] = useState(false);

    const fetchData = async () => {
        try {
            const bookRes = await api.get('/bookings/my');
            setBookings(bookRes.data);
        } catch (err) {
            setError('Failed to load your bookings. Please try again.');
        }

        try {
            const walletRes = await api.get(`/auth/wallet?userId=${user.userId}`);
            const balance = walletRes.data.walletBalance != null ? walletRes.data.walletBalance : 0;
            setWalletBalance(balance);
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                userInfo.walletBalance = balance;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            } catch (e) {}
        } catch (err) {
            console.warn('Could not load wallet balance.');
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData();
    }, [user]);

    const handleTopupWallet = async (e) => {
        e.preventDefault();
        const amt = Number(topupAmount);
        if (isNaN(amt) || amt <= 0) {
            setActionError('Please enter a valid positive top-up amount.');
            return;
        }

        setTopupLoading(true);
        setActionStatus('');
        setActionError('');
        try {
            const res = await api.post('/auth/wallet/add', { amount: amt, userId: user.userId });
            const newBal = res.data.newBalance != null ? res.data.newBalance : (walletBalance + amt);
            setWalletBalance(newBal);
            setShowTopupModal(false);
            setActionStatus(`🎉 ₹${amt.toFixed(2)} added to your EasyTravel Wallet successfully! New Balance: ₹${newBal.toFixed(2)}`);
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                userInfo.walletBalance = newBal;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            } catch (e) {}
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to add money to wallet.');
        } finally {
            setTopupLoading(false);
        }
    };

    const promptCancel = (booking) => {
        setActionStatus('');
        setActionError('');
        const hoursUntilDeparture = (new Date(booking.departureTime) - new Date()) / (1000 * 60 * 60);
        if (hoursUntilDeparture < 0) {
            setActionError("Cannot cancel a past journey.");
            return;
        }
        
        let refundPercentage = 0.0;
        let tierLabel = '< 12h before departure (Non-refundable)';
        if (hoursUntilDeparture > 48) {
            refundPercentage = 1.0;
            tierLabel = '> 48h before departure (100% Refund)';
        } else if (hoursUntilDeparture > 24) {
            refundPercentage = 0.8;
            tierLabel = '24h - 48h before departure (80% Refund)';
        } else if (hoursUntilDeparture > 12) {
            refundPercentage = 0.5;
            tierLabel = '12h - 24h before departure (50% Refund)';
        }

        const refundAmount = Math.round(booking.amountPaid * refundPercentage * 100) / 100;
        setCancelTarget({ booking, refundPercentage, refundAmount, hoursUntilDeparture, tierLabel });
    };

    const confirmCancelBooking = async () => {
        if (!cancelTarget) return;
        const { booking, refundAmount } = cancelTarget;
        setCancelTarget(null);
        try {
            await api.delete(`/bookings/${booking.bookingId}`);
            setActionStatus(`✅ Booking #${booking.bookingReference || booking.bookingId} cancelled. ₹${refundAmount.toFixed(2)} refund credited to your wallet.`);
            fetchData();
        } catch (err) {
            setActionError(err.response?.data?.message || 'Failed to cancel booking.');
        }
    };

    const handlePostReview = async (e) => {
        e.preventDefault();
        if (!reviewTarget) return;
        setSubmittingReview(true);
        try {
            await api.post('/reviews', {
                userId: user.userId,
                passengerName: reviewTarget.passengerName || user.username,
                busId: reviewTarget.busId || 1,
                scheduleId: reviewTarget.scheduleId,
                rating: ratingScore,
                comment: reviewComment
            });
            setActionStatus('✅ Thank you! Your review and star rating have been submitted successfully.');
            setReviewTarget(null);
            setReviewComment('');
        } catch (err) {
            setActionError('Failed to submit review. Please try again.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatDate = (dt) => new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="container">
                    <h3 className="fw-bold mb-1 text-white">My Dashboard</h3>
                    <p className="text-white-50 small mb-0">Manage your bookings and account details</p>
                </div>
            </div>

            <div className="container py-4">
                <div className="row g-4">
                    {/* Sidebar / Quick Stats */}
                    <div className="col-12 col-lg-3 dashboard-sidebar">
                        <div className="sw-card p-4 text-center mb-3">
                            <div className="mx-auto mb-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                                <i className="bi bi-person fs-3 text-primary"></i>
                            </div>
                            <h5 className="fw-bold text-primary mb-1">{user?.username}</h5>
                            <p className="text-muted small mb-4">{user?.email}</p>
                            <span className="badge rounded-pill bg-light text-primary px-3 py-2 border mb-3 d-block mx-auto" style={{ width: 'fit-content' }}>
                                Passenger Account
                            </span>
                            <div className="bg-success text-white p-3 rounded-3 text-start mb-2 shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small opacity-75">EasyTravel Wallet</span>
                                    <i className="bi bi-wallet2 fs-5"></i>
                                </div>
                                <h4 className="mb-2 fw-bold">₹{walletBalance.toFixed(2)}</h4>
                                <button 
                                    onClick={() => setShowTopupModal(true)} 
                                    className="btn btn-sm btn-light text-success fw-bold w-100 rounded-pill shadow-none"
                                >
                                    <i className="bi bi-plus-circle-fill me-1"></i>Add Money
                                </button>
                            </div>
                        </div>

                        <div className="list-group sw-card border-0 overflow-hidden">
                            <button className="list-group-item list-group-item-action border-0 py-3 active fw-bold" style={{ background: '#0B3C5D' }}>
                                <i className="bi bi-ticket-detailed me-2"></i>My Bookings
                            </button>
                            <button onClick={() => navigate('/profile')} className="list-group-item list-group-item-action border-0 py-3 text-muted">
                                <i className="bi bi-gear me-2"></i>Profile Settings
                            </button>
                        </div>
                    </div>

                    {/* Bookings List */}
                    <div className="col-lg-8">
                        <div className="sw-card p-4">
                            <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>
                                <i className="bi bi-clock-history me-2"></i>Recent Booking History
                            </h5>

                            {actionStatus && (
                                <div className="alert alert-success alert-dismissible fade show rounded-3 mb-3 d-flex align-items-center justify-content-between" role="alert">
                                    <span>{actionStatus}</span>
                                    <button type="button" className="btn-close" onClick={() => setActionStatus('')}></button>
                                </div>
                            )}

                            {actionError && (
                                <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-3 d-flex align-items-center justify-content-between" role="alert">
                                    <span><i className="bi bi-exclamation-triangle-fill me-2"></i>{actionError}</span>
                                    <button type="button" className="btn-close" onClick={() => setActionError('')}></button>
                                </div>
                            )}

                            {loading && (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                    <p className="text-muted mt-2 small">Loading your journeys...</p>
                                </div>
                            )}

                            {!loading && error && (
                                <div className="alert alert-danger">{error}</div>
                            )}

                            {!loading && !error && bookings.length === 0 && (
                                <div className="text-center py-5">
                                    <div style={{ fontSize: '3rem' }}>🎟️</div>
                                    <h5 className="text-muted mt-3">No bookings found</h5>
                                    <p className="text-muted small">You haven't booked any trips yet.</p>
                                    <button onClick={() => navigate('/search')} className="btn-sw-primary border-none">
                                        Book a Ticket
                                    </button>
                                </div>
                            )}

                            {!loading && !error && bookings.length > 0 && (
                                <div className="d-flex flex-column gap-3">
                                    {bookings.map(b => {
                                        const isCancelled = b.status === 'CANCELLED';
                                        const isPast = new Date(b.departureTime) < new Date();
                                        const isCompleted = b.status === 'COMPLETED' || (!isCancelled && isPast);

                                        let statusBadgeClass = 'bg-success';
                                        let statusText = 'CONFIRMED';

                                        if (isCancelled) {
                                            statusBadgeClass = 'bg-danger';
                                            statusText = 'CANCELLED';
                                        } else if (isCompleted) {
                                            statusBadgeClass = 'bg-primary-subtle text-primary border border-primary-subtle';
                                            statusText = 'COMPLETED';
                                        } else {
                                            statusBadgeClass = 'bg-success-subtle text-success border border-success-subtle';
                                            statusText = 'CONFIRMED';
                                        }

                                        return (
                                            <div key={b.bookingId} className="card border p-3 rounded-3 mb-3" style={{ transition: 'all 0.2s' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <span className="text-muted small">Booking ID: #{b.bookingReference || b.bookingId}</span>
                                                        <h5 className="fw-bold mb-0 text-primary mt-1">{b.source} → {b.destination}</h5>
                                                        <small className="text-muted">
                                                            Date: {formatDate(b.departureTime)} | Dep: {formatTime(b.departureTime)}
                                                        </small>
                                                    </div>
                                                    <div>
                                                        <span className={`badge rounded-pill px-3 py-1 fw-semibold ${statusBadgeClass}`}>
                                                            {statusText}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="row g-2 align-items-center border-top pt-3 mt-2">
                                                    <div className="col-sm-5">
                                                        <span className="text-muted small">Seat No:</span> <strong className="text-success">{b.seatNumber}</strong>
                                                        <span className="mx-2 text-muted">|</span>
                                                        <span className="text-muted small">Paid:</span> <strong style={{ color: '#E07B39' }}>₹{b.amountPaid}</strong>
                                                    </div>
                                                    <div className="col-sm-7 text-sm-end d-flex gap-2 justify-content-sm-end mt-2 mt-sm-0 flex-wrap align-items-center">
                                                        {/* View/Download ticket */}
                                                        <button onClick={() => navigate('/ticket', {
                                                            state: {
                                                                bookings: [{
                                                                    bookingId: b.bookingId,
                                                                    bookingReference: b.bookingReference,
                                                                    amountPaid: b.amountPaid,
                                                                    status: isCompleted ? 'COMPLETED' : b.status,
                                                                    seatNumber: b.seatNumber,
                                                                    passengerName: b.passengerName || user?.username,
                                                                    passengerAge: b.passengerAge || '—',
                                                                    passengerGender: b.passengerGender || '—'
                                                                }],
                                                                schedule: {
                                                                    source: b.source,
                                                                    destination: b.destination,
                                                                    departureTime: b.departureTime,
                                                                    price: b.amountPaid
                                                                },
                                                                contact: { email: user?.email, phone: user?.phone || '' }
                                                            }
                                                        })} className="btn btn-sm btn-outline-primary px-3 rounded-pill">
                                                            <i className="bi bi-eye me-1"></i>View Ticket
                                                        </button>

                                                        {/* Rate & Review option — ONLY available if completed */}
                                                        {isCompleted && (
                                                            <button onClick={() => { setReviewTarget(b); setRatingScore(5); setReviewComment(''); }} className="btn btn-sm btn-warning text-dark fw-bold px-3 rounded-pill">
                                                                <i className="bi bi-star-fill me-1 text-dark"></i>Rate Journey
                                                            </button>
                                                        )}

                                                        {!isCompleted && !isCancelled && (
                                                            <span className="badge bg-light text-muted border px-2 py-1 small fw-normal ms-1" style={{ fontSize: '0.75rem' }}>
                                                                <i className="bi bi-clock me-1 text-primary"></i>Rating opens post journey
                                                            </span>
                                                        )}

                                                        {/* Cancel option — ONLY available if NOT completed and NOT cancelled */}
                                                        {!isCompleted && !isCancelled && (
                                                            <button onClick={() => promptCancel(b)} className="btn btn-sm btn-outline-danger px-3 rounded-pill">
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Cancellation Modal */}
            {cancelTarget && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                            <div className="modal-header bg-danger text-white py-3">
                                <h5 className="modal-title fw-bold fs-6 mb-0">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>Cancel Ticket & Process Refund
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setCancelTarget(null)}></button>
                            </div>
                            <div className="modal-body p-4 text-start">
                                <p className="fw-bold mb-2" style={{ color: '#0B3C5D' }}>
                                    Are you sure you want to cancel your ticket for {cancelTarget.booking.source} → {cancelTarget.booking.destination}?
                                </p>
                                
                                <div className="p-3 bg-light rounded-3 my-3 border">
                                    <h6 className="fw-bold small text-muted text-uppercase mb-2">Refund Estimate</h6>
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span>Paid Amount:</span>
                                        <span className="fw-bold">₹{cancelTarget.booking.amountPaid.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span>Refund Tier:</span>
                                        <span className="fw-bold text-primary">{cancelTarget.tierLabel || `${(cancelTarget.refundPercentage * 100).toFixed(0)}% Refund`}</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="d-flex justify-content-between fw-bold text-success">
                                        <span>Credit to EasyTravel Wallet:</span>
                                        <span className="fs-6">₹{cancelTarget.refundAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0 pb-4 px-4 d-flex gap-2">
                                <button type="button" className="btn btn-light rounded-pill flex-grow-1 border fw-semibold" onClick={() => setCancelTarget(null)}>
                                    Keep Ticket
                                </button>
                                <button type="button" className="btn btn-danger rounded-pill flex-grow-1 fw-bold" onClick={confirmCancelBooking}>
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Wallet Top-up Modal */}
            {showTopupModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                            <div className="modal-header text-white py-3" style={{ background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' }}>
                                <h5 className="modal-title fw-bold fs-6 mb-0">
                                    <i className="bi bi-wallet2 me-2"></i>Add Money to EasyTravel Wallet
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTopupModal(false)}></button>
                            </div>
                            <form onSubmit={handleTopupWallet}>
                                <div className="modal-body p-4 text-start">
                                    <div className="p-3 bg-light rounded-3 mb-3 border text-center">
                                        <small className="text-muted d-block">Current Wallet Balance</small>
                                        <h4 className="fw-bold text-success mb-0">₹{walletBalance.toFixed(2)}</h4>
                                    </div>

                                    <label className="form-label fw-bold small text-muted">Select or Enter Amount (₹)</label>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text fw-bold">₹</span>
                                        <input
                                            type="number"
                                            className="form-control sw-input"
                                            min="10"
                                            max="50000"
                                            step="10"
                                            value={topupAmount}
                                            onChange={(e) => setTopupAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            required
                                        />
                                    </div>

                                    <div className="d-flex gap-2 mb-3 flex-wrap justify-content-center">
                                        {[200, 500, 1000, 2000].map((quickAmt) => (
                                            <button
                                                key={quickAmt}
                                                type="button"
                                                onClick={() => setTopupAmount(quickAmt)}
                                                className={`btn btn-sm rounded-pill px-3 fw-bold ${Number(topupAmount) === quickAmt ? 'btn-success' : 'btn-outline-secondary'}`}
                                            >
                                                + ₹{quickAmt}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="alert alert-info py-2 px-3 small rounded-3 border-0">
                                        <i className="bi bi-info-circle me-1"></i> Funds added are immediately available for instant, 1-click ticket checkout with zero gateway fees!
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0 pb-4 px-4 d-flex gap-2">
                                    <button type="button" className="btn btn-light rounded-pill flex-grow-1 border fw-semibold" onClick={() => setShowTopupModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-success rounded-pill flex-grow-1 fw-bold" disabled={topupLoading}>
                                        {topupLoading ? 'Adding Funds...' : `Add ₹${Number(topupAmount || 0).toFixed(2)}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Rate & Review Modal */}
            {reviewTarget && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                            <div className="modal-header text-white py-3" style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%)' }}>
                                <h5 className="modal-title fw-bold fs-6 mb-0">
                                    ⭐ Rate & Review Your Journey
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setReviewTarget(null)}></button>
                            </div>
                            <form onSubmit={handlePostReview}>
                                <div className="modal-body p-4 text-start">
                                    <h6 className="fw-bold mb-1" style={{ color: '#0B3C5D' }}>{reviewTarget.source} &rarr; {reviewTarget.destination}</h6>
                                    <p className="text-muted small mb-3">Seat Number: <strong>{reviewTarget.seatNumber}</strong> | Ticket ID: #{reviewTarget.bookingReference || reviewTarget.bookingId}</p>

                                    <div className="mb-4 text-center p-3 bg-light rounded-3">
                                        <label className="form-label fw-bold small text-muted d-block mb-2">Select Your Rating</label>
                                        <div className="d-flex justify-content-center gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <span
                                                    key={star}
                                                    onClick={() => setRatingScore(star)}
                                                    style={{ cursor: 'pointer', fontSize: '2rem', color: star <= ratingScore ? '#FFC107' : '#E4E5E9' }}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <small className="fw-bold text-warning-emphasis mt-1 d-block">
                                            {ratingScore === 5 ? 'Excellent 🌟' : ratingScore === 4 ? 'Good 👍' : ratingScore === 3 ? 'Average 👌' : ratingScore === 2 ? 'Poor 👎' : 'Terrible 😞'}
                                        </small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Your Experience / Feedback</label>
                                        <textarea
                                            className="form-control sw-input"
                                            rows="3"
                                            placeholder="Share details about cleanliness, driver behavior, Punctuality..."
                                            value={reviewComment}
                                            onChange={e => setReviewComment(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0 pb-4 px-4 d-flex gap-2">
                                    <button type="button" className="btn btn-light rounded-pill flex-grow-1 border fw-semibold" onClick={() => setReviewTarget(null)}>
                                        Close
                                    </button>
                                    <button type="submit" className="btn btn-warning rounded-pill flex-grow-1 fw-bold text-dark" disabled={submittingReview}>
                                        {submittingReview ? 'Submitting...' : 'Submit Rating'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
