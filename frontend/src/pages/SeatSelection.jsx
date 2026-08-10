import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SeatSelection() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const schedule = state?.schedule;

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!schedule) { navigate('/search'); return; }

        // GET /seats/schedule/{scheduleId} — all seats (available + booked)
        api.get(`/seats/schedule/${schedule.scheduleId}`)
            .then(res => { setSeats(res.data); setLoading(false); })
            .catch(() => { setError('Failed to load seats.'); setLoading(false); });
    }, []);

    const [warningMsg, setWarningMsg] = useState('');

    const handleSeatClick = (seat) => {
        if (seat.status === 'BOOKED') return;
        setWarningMsg('');
        setSelectedSeats(prev => {
            if (prev.find(s => s.id === seat.id)) {
                return prev.filter(s => s.id !== seat.id);
            }
            if (prev.length >= 6) {
                setWarningMsg("You can select a maximum of 6 seats per transaction.");
                return prev;
            }
            return [...prev, seat];
        });
    };

    const proceed = () => {
        if (selectedSeats.length === 0) return;
        navigate('/passenger-details', { state: { schedule, seats: selectedSeats } });
    };

    const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Group seats into rows of 4 (like a bus: 2 seats | aisle | 2 seats)
    const rows = [];
    for (let i = 0; i < seats.length; i += 4) {
        rows.push(seats.slice(i, i + 4));
    }

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-sm btn-light rounded-circle" style={{ width: 36, height: 36 }}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div>
                            <h4 className="fw-bold text-white mb-0">{schedule?.source} → {schedule?.destination}</h4>
                            <small className="text-white opacity-75">
                                {schedule?.busNumber} &nbsp;|&nbsp; Dep: {formatTime(schedule?.departureTime)}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                {error && <div className="alert alert-danger">{error}</div>}
                {warningMsg && (
                    <div className="alert alert-warning alert-dismissible fade show rounded-3 mb-3 d-flex align-items-center justify-content-between" role="alert">
                        <span><i className="bi bi-exclamation-circle-fill me-2 text-warning"></i>{warningMsg}</span>
                        <button type="button" className="btn-close" onClick={() => setWarningMsg('')}></button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="mt-3 text-muted">Loading seat map...</p>
                    </div>
                ) : (
                    <div className="row justify-content-center gap-4">
                        {/* Seat Map */}
                        <div className="col-md-6">
                            <div className="sw-card p-4">
                                <h6 className="fw-bold mb-3" style={{ color: '#0B3C5D' }}>Select Your Seat</h6>

                                {/* Legend */}
                                <div className="d-flex gap-3 mb-4 flex-wrap">
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: 24, height: 24, background: '#EFF6FF', border: '2px solid #328CC1', borderRadius: 6 }}></div>
                                        <small className="text-muted">Available</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: 24, height: 24, background: '#27AE60', borderRadius: 6 }}></div>
                                        <small className="text-muted">Selected</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div style={{ width: 24, height: 24, background: '#F3F4F6', border: '2px solid #D1D5DB', borderRadius: 6 }}></div>
                                        <small className="text-muted">Booked</small>
                                    </div>
                                </div>

                                {/* Driver label */}
                                <div className="d-flex justify-content-end mb-2">
                                    <div className="badge" style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 8, padding: '6px 14px' }}>
                                        <i className="bi bi-person-workspace me-1"></i> Driver
                                    </div>
                                </div>

                                <div style={{ borderLeft: '4px solid #0B3C5D', paddingLeft: 12 }}>
                                    {rows.map((row, rowIndex) => (
                                        <div key={rowIndex} className="d-flex gap-2 mb-2 align-items-center">
                                            <div className="d-flex gap-2">
                                                {row.slice(0, 2).map(seat => (
                                                    <button key={seat.id} onClick={() => handleSeatClick(seat)}
                                                        className={`seat-btn ${seat.status === 'BOOKED' ? 'seat-booked' : selectedSeats.find(s => s.id === seat.id) ? 'seat-selected' : 'seat-available'}`}>
                                                        {seat.seatNumber}
                                                    </button>
                                                ))}
                                            </div>
                                            <div style={{ width: 'clamp(10px, 3vw, 24px)' }}></div> {/* Aisle */}
                                            <div className="d-flex gap-2">
                                                {row.slice(2, 4).map(seat => (
                                                    <button key={seat.id} onClick={() => handleSeatClick(seat)}
                                                        className={`seat-btn ${seat.status === 'BOOKED' ? 'seat-booked' : selectedSeats.find(s => s.id === seat.id) ? 'seat-selected' : 'seat-available'}`}>
                                                        {seat.seatNumber}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-muted small mt-3">
                                    <i className="bi bi-info-circle me-1"></i>
                                    {seats.filter(s => s.status !== 'BOOKED').length} of {seats.length} seats available
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="col-md-4">
                            <div className="sw-card p-4" style={{ position: 'sticky', top: '90px' }}>
                                <h6 className="fw-bold mb-3" style={{ color: '#0B3C5D' }}>Booking Summary</h6>

                                <div className="mb-3">
                                    <div className="text-muted small">Route</div>
                                    <div className="fw-bold">{schedule.source} → {schedule.destination}</div>
                                </div>
                                <div className="mb-3">
                                    <div className="text-muted small">Bus</div>
                                    <div className="fw-bold">{schedule.busNumber} ({schedule.busType})</div>
                                </div>
                                <div className="mb-3">
                                    <div className="text-muted small">Departure</div>
                                    <div className="fw-bold">{formatTime(schedule.departureTime)}</div>
                                </div>
                                <div className="mb-3">
                                    <div className="text-muted small">Selected Seats</div>
                                    <div className="fw-bold fs-5" style={{ color: selectedSeats.length > 0 ? '#27AE60' : '#9CA3AF' }}>
                                        {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : '— Not selected —'}
                                    </div>
                                </div>

                                <hr />

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="fw-bold">Total Fare</span>
                                    <span className="fw-bold fs-4" style={{ color: '#E07B39' }}>₹{schedule.price * selectedSeats.length}</span>
                                </div>

                                <button onClick={proceed} disabled={selectedSeats.length === 0}
                                    className="btn-sw-orange w-100" style={{ border: 'none', cursor: selectedSeats.length > 0 ? 'pointer' : 'not-allowed' }}>
                                    <i className="bi bi-arrow-right-circle me-2"></i>
                                    Continue to Passenger Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}