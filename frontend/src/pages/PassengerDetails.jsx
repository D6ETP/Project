import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PassengerDetails() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const schedule = state?.schedule;
    const seats = state?.seats || [];

    // State for passengers: array of objects matching each selected seat
    const [passengers, setPassengers] = useState(
        seats.map(seat => ({
            seatId: seat.id,
            seatNumber: seat.seatNumber,
            name: '',
            age: '',
            gender: 'Male'
        }))
    );

    // State for common contact details
    const [contact, setContact] = useState({ email: '', phone: '' });
    
    // State for Boarding and Dropping Points
    const [points, setPoints] = useState({ boardingPoint: '', droppingPoint: '' });
    
    const [errors, setErrors] = useState({});

    if (!schedule || seats.length === 0) { navigate('/search'); return null; }

    const [boardingOptions, setBoardingOptions] = useState([]);
    const [droppingOptions, setDroppingOptions] = useState([]);

    useEffect(() => {
        if (schedule?.source) {
            api.get(`/routes/stops?city=${schedule.source}`)
                .then(res => setBoardingOptions(res.data))
                .catch(err => console.error("Failed to fetch boarding stops", err));
        }
        if (schedule?.destination) {
            api.get(`/routes/stops?city=${schedule.destination}`)
                .then(res => setDroppingOptions(res.data))
                .catch(err => console.error("Failed to fetch dropping stops", err));
        }
    }, [schedule]);

    const updatePassenger = (index, field, value) => {
        const newPassengers = [...passengers];
        newPassengers[index][field] = value;
        setPassengers(newPassengers);
    };

    const validate = () => {
        const e = {};
        
        // Validate each passenger
        passengers.forEach((p, idx) => {
            if (!p.name.trim()) e[`p_${idx}_name`] = 'Required';
            if (!p.age || p.age < 1 || p.age > 120) e[`p_${idx}_age`] = 'Invalid age';
        });

        // Validate contact
        if (!contact.email || !/\S+@\S+\.\S+/.test(contact.email)) e.email = 'Enter valid email';
        if (!contact.phone || !/^\d{10}$/.test(contact.phone)) e.phone = 'Enter 10-digit phone';
        
        // Validate points
        if (!points.boardingPoint) e.boardingPoint = 'Select a boarding point';
        if (!points.droppingPoint) e.droppingPoint = 'Select a dropping point';
        
        return e;
    };

    const proceed = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        
        // Pass everything to payment
        navigate('/payment', { state: { schedule, seats, passengers, contact, points } });
    };

    const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-sm btn-light rounded-circle" style={{ width: 36, height: 36 }}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <div>
                            <h4 className="fw-bold text-white mb-0">Passenger Details</h4>
                            <small className="text-white opacity-75">{schedule.source} → {schedule.destination} | {seats.length} Seat(s)</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                <div className="row gap-4 justify-content-center">
                    {/* Forms */}
                    <div className="col-md-7">
                        <form onSubmit={proceed}>
                            {/* Passenger Forms */}
                            {passengers.map((p, idx) => (
                                <div key={p.seatId} className="sw-card p-4 mb-4">
                                    <h6 className="fw-bold mb-4 d-flex justify-content-between align-items-center" style={{ color: '#0B3C5D' }}>
                                        <span><i className="bi bi-person-badge me-2"></i>Passenger {idx + 1}</span>
                                        <span className="badge bg-light text-dark border">Seat {p.seatNumber}</span>
                                    </h6>
                                    
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <label className="form-label fw-semibold small text-muted">Full Name</label>
                                            <input className={`sw-input ${errors[`p_${idx}_name`] ? 'border-danger' : ''}`} placeholder="As on ID proof"
                                                value={p.name} onChange={e => updatePassenger(idx, 'name', e.target.value)} />
                                            {errors[`p_${idx}_name`] && <div className="text-danger small mt-1">{errors[`p_${idx}_name`]}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold small text-muted">Age</label>
                                            <input type="number" className={`sw-input ${errors[`p_${idx}_age`] ? 'border-danger' : ''}`}
                                                placeholder="Age" min="1" max="120"
                                                value={p.age} onChange={e => updatePassenger(idx, 'age', e.target.value)} />
                                            {errors[`p_${idx}_age`] && <div className="text-danger small mt-1">{errors[`p_${idx}_age`]}</div>}
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold small text-muted">Gender</label>
                                            <div className="d-flex gap-4 mt-2">
                                                {['Male', 'Female', 'Other'].map(g => (
                                                    <label key={g} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                                        <input type="radio" name={`gender_${idx}`} value={g} checked={p.gender === g}
                                                            onChange={() => updatePassenger(idx, 'gender', g)} />
                                                        <span className="small fw-semibold">{g}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Boarding & Dropping Points Form */}
                            <div className="sw-card p-4 mb-4 border border-info shadow-sm">
                                <h6 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>
                                    <i className="bi bi-geo-alt-fill me-2"></i>Boarding & Dropping Points
                                </h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Boarding Point ({schedule.source})</label>
                                        <select className={`form-select sw-input ${errors.boardingPoint ? 'border-danger' : ''}`}
                                            value={points.boardingPoint} onChange={e => setPoints({ ...points, boardingPoint: e.target.value })}>
                                            <option value="">Select Boarding Point</option>
                                            {boardingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                        {errors.boardingPoint && <div className="text-danger small mt-1">{errors.boardingPoint}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Dropping Point ({schedule.destination})</label>
                                        <select className={`form-select sw-input ${errors.droppingPoint ? 'border-danger' : ''}`}
                                            value={points.droppingPoint} onChange={e => setPoints({ ...points, droppingPoint: e.target.value })}>
                                            <option value="">Select Dropping Point</option>
                                            {droppingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                        {errors.droppingPoint && <div className="text-danger small mt-1">{errors.droppingPoint}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details Form */}
                            <div className="sw-card p-4 mb-4 border border-warning shadow-sm">
                                <h6 className="fw-bold mb-4" style={{ color: '#E07B39' }}>
                                    <i className="bi bi-envelope-paper me-2"></i>Contact Details
                                </h6>
                                <p className="text-muted small mb-3">Your tickets will be sent to this email address.</p>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Email ID</label>
                                        <input type="email" className={`sw-input ${errors.email ? 'border-danger' : ''}`}
                                            placeholder="your@email.com"
                                            value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
                                        {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small text-muted">Phone Number</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>+91</span>
                                            <input type="tel" className={`form-control sw-input border-start-0 ${errors.phone ? 'border-danger' : ''}`}
                                                style={{ borderRadius: '0 10px 10px 0' }} placeholder="10-digit number" maxLength={10}
                                                value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value.replace(/\D/, '') })} />
                                        </div>
                                        {errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-sw-orange w-100 mt-2" style={{ border: 'none', padding: '14px' }}>
                                <i className="bi bi-credit-card me-2"></i>Proceed to Payment
                            </button>
                        </form>
                    </div>

                    {/* Summary sidebar */}
                    <div className="col-md-3">
                        <div className="sw-card p-4" style={{ position: 'sticky', top: 90 }}>
                            <h6 className="fw-bold mb-3" style={{ color: '#0B3C5D' }}>Journey Summary</h6>
                            <div className="d-flex flex-column gap-3">
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>ROUTE</div>
                                    <div className="fw-bold">{schedule.source} → {schedule.destination}</div>
                                </div>
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>BUS</div>
                                    <div className="fw-bold">{schedule.busNumber}</div>
                                </div>
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>DEPARTURE</div>
                                    <div className="fw-bold">{formatTime(schedule.departureTime)}</div>
                                </div>
                                <div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>SEATS ({seats.length})</div>
                                    <div className="fw-bold" style={{ color: '#27AE60' }}>
                                        {seats.map(s => s.seatNumber).join(', ')}
                                    </div>
                                </div>
                                <hr className="my-1" />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-muted small">Total</span>
                                    <span className="fw-bold fs-5" style={{ color: '#E07B39' }}>₹{schedule.price * seats.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
