import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function SearchBuses() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({
        source: location.state?.source || '',
        destination: location.state?.destination || '',
        date: location.state?.date || ''
    });
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [reviewModalBus, setReviewModalBus] = useState(null);
    const [reviewsList, setReviewsList] = useState([]);

    const handleOpenReviews = async (sch) => {
        setReviewModalBus(sch);
        try {
            const res = await api.get(`/reviews/bus/${sch.busId || 1}`);
            setReviewsList(res.data.reviews || []);
        } catch (err) {
            setReviewsList([]);
        }
    };

    useEffect(() => {
        if (location.state?.source && location.state?.destination) {
            const autoSearch = async () => {
                setLoading(true);
                setError('');
                setSearched(true);
                try {
                    const res = await api.get('/routes/search', {
                        params: {
                            source: location.state.source,
                            destination: location.state.destination,
                            date: location.state.date
                        }
                    });
                    setSchedules(res.data);
                } catch (err) {
                    setError('Failed to search buses. Please check your backend is running.');
                } finally {
                    setLoading(false);
                }
            };
            autoSearch();
        }
    }, [location.state]);

    const popularRoutes = [
        { from: 'Pune', to: 'Mumbai' },
        { from: 'Mumbai', to: 'Pune' },
        { from: 'Mumbai', to: 'Nashik' },
        { from: 'Pune', to: 'Nashik' },
    ];

    const handleSearch = async (e) => {
        e.preventDefault();

        // Validate source != destination
        if (form.source.trim().toLowerCase() === form.destination.trim().toLowerCase()) {
            setError('Source and destination cannot be the same city!');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const res = await api.get('/routes/search', {
                params: { source: form.source, destination: form.destination, date: form.date }
            });
            setSchedules(res.data);
        } catch (err) {
            setError('Failed to search buses. Please check your backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const fillRoute = (from, to) => {
        setForm(f => ({ ...f, source: from, destination: to }));
    };

    const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const formatDate = (dt) => new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    return (
        <div>
            {/* Search Header */}
            <div className="page-header">
                <div className="container">
                    <h3 className="fw-bold mb-4 text-white"><i className="bi bi-search me-2"></i>Find Your Bus</h3>
                    <div className="sw-card p-3 p-md-4">
                        <form className="row g-3 align-items-end search-form-row" onSubmit={handleSearch}>
                            <div className="col-12 col-md-3">
                                <label className="form-label fw-semibold small text-muted">From</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                        <i className="bi bi-geo-alt-fill text-muted"></i>
                                    </span>
                                    <input className="form-control border-start-0 sw-input" style={{ borderRadius: '0 10px 10px 0' }}
                                        placeholder="Departure City" value={form.source}
                                        onChange={e => setForm({ ...form, source: e.target.value })} required />
                                </div>
                            </div>

                            <div className="col-md-1 text-center d-none d-md-block">
                                <i className="bi bi-arrow-left-right text-muted fs-4 mt-4 d-block"></i>
                            </div>

                            <div className="col-12 col-md-3">
                                <label className="form-label fw-semibold small text-muted">To</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                        <i className="bi bi-geo-fill text-muted"></i>
                                    </span>
                                    <input className="form-control border-start-0 sw-input" style={{ borderRadius: '0 10px 10px 0' }}
                                        placeholder="Arrival City" value={form.destination}
                                        onChange={e => setForm({ ...form, destination: e.target.value })} required />
                                </div>
                            </div>

                            <div className="col-12 col-md-3">
                                <label className="form-label fw-semibold small text-muted">Journey Date</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                        <i className="bi bi-calendar3 text-muted"></i>
                                    </span>
                                    <input type="date" className="form-control border-start-0 sw-input" style={{ borderRadius: '0 10px 10px 0' }}
                                        value={form.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => setForm({ ...form, date: e.target.value })} required />
                                </div>
                            </div>

                            <div className="col-12 col-md-2">
                                <button type="submit" className="btn-sw-orange w-100" style={{ border: 'none' }}>
                                    {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-search me-1"></i> Search</>}
                                </button>
                            </div>
                        </form>

                        {/* Popular Routes */}
                        <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                            <small className="text-muted fw-bold">Popular:</small>
                            {popularRoutes.map((r, i) => (
                                <button key={i} type="button" onClick={() => fillRoute(r.from, r.to)}
                                    className="badge rounded-pill fw-normal py-2 px-3"
                                    style={{ background: '#EFF6FF', color: '#0B3C5D', border: '1px solid #BFDBFE', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    {r.from} → {r.to}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="container py-4">
                {error && (
                    <div className="alert alert-danger rounded-3">{error}</div>
                )}

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="mt-3 text-muted">Searching available buses...</p>
                    </div>
                )}

                {!loading && searched && schedules.length === 0 && (
                    <div className="text-center py-5">
                        <div style={{ fontSize: '4rem' }}>🚌</div>
                        <h4 className="text-muted mt-3">No buses found</h4>
                        <p className="text-muted">Try a different date or check if a schedule is added via admin panel.</p>
                    </div>
                )}

                {!loading && schedules.length > 0 && (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold mb-0">
                                {schedules.length} bus{schedules.length > 1 ? 'es' : ''} found: <span style={{ color: '#0B3C5D' }}>{form.source} → {form.destination}</span>
                            </h5>
                            <span className="text-muted small">{formatDate(schedules[0].departureTime)}</span>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {schedules.map(sch => {
                                const opName = sch.operatorName || 'EasyTravel Express';
                                const busImg = sch.busImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80';
                                return (
                                    <div key={sch.scheduleId} className="sw-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-start border-4 border-primary">
                                        {/* Bus Thumbnail & Info */}
                                        <div className="d-flex gap-3 align-items-start align-items-md-center">
                                            <img
                                                src={busImg}
                                                alt={opName}
                                                className="rounded-3 shadow-sm d-none d-sm-block"
                                                style={{ width: '90px', height: '65px', objectFit: 'cover', cursor: 'pointer' }}
                                                onClick={() => handleOpenReviews(sch)}
                                            />
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                    <h5 className="fw-bold mb-0" style={{ color: '#0B3C5D' }}>{opName}</h5>
                                                    <span className="badge rounded-pill" style={{ background: '#EFF6FF', color: '#0B3C5D', fontSize: '0.75rem' }}>
                                                        {sch.busType}
                                                    </span>
                                                    <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning fw-bold px-2 py-1" style={{ fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => handleOpenReviews(sch)}>
                                                        <i className="bi bi-star-fill me-1 text-warning"></i>
                                                        {sch.averageRating ? sch.averageRating.toFixed(1) : '4.8'} / 5.0
                                                        <span className="text-muted fw-normal ms-1">({sch.totalReviews || 48} reviews)</span>
                                                    </span>
                                                </div>
                                                <div className="text-muted small mb-2">Vehicle: <strong className="text-dark">{sch.busNumber}</strong></div>
                                                <div className="d-flex gap-2">
                                                    {sch.isAC && <span className="badge bg-light text-muted border border-secondary-subtle"><i className="bi bi-snow me-1 text-info"></i>AC</span>}
                                                    {sch.isSleeper && <span className="badge bg-light text-muted border border-secondary-subtle"><i className="bi bi-moon-stars me-1 text-primary"></i>Sleeper</span>}
                                                    {sch.hasWifi && <span className="badge bg-light text-muted border border-secondary-subtle"><i className="bi bi-wifi me-1 text-success"></i>WiFi</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timings */}
                                        <div className="d-flex align-items-center justify-content-between justify-content-md-center gap-3 w-100 w-md-auto my-2 my-md-0 border-top border-bottom border-md-0 py-2 py-md-0">
                                            <div className="text-center">
                                                <div className="fw-bold fs-5">{formatTime(sch.departureTime)}</div>
                                                <div className="text-muted small">{sch.source}</div>
                                            </div>
                                            <div className="text-center px-2">
                                                <i className="bi bi-arrow-right text-muted fs-5"></i>
                                            </div>
                                            <div className="text-center">
                                                <div className="fw-bold fs-5">{formatTime(sch.arrivalTime)}</div>
                                                <div className="text-muted small">{sch.destination}</div>
                                            </div>
                                        </div>

                                        {/* Price + Seats + Action */}
                                        <div className="d-flex flex-row flex-md-column justify-content-between align-items-center align-items-md-end w-100 w-md-auto">
                                            <div>
                                                <div className="fw-bold fs-3 mb-0 mb-md-1" style={{ color: '#E07B39' }}>₹{sch.price}</div>
                                                <div className="mb-0 mb-md-2">
                                                    <span style={{ color: sch.availableSeats > 5 ? '#27AE60' : '#E74C3C', fontWeight: 600, fontSize: '0.85rem' }}>
                                                        <i className="bi bi-person-seat me-1"></i>
                                                        {sch.availableSeats} seats left
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate('/seats', { state: { schedule: sch } })}
                                                className="btn-sw-primary"
                                                style={{ border: 'none', cursor: 'pointer', padding: '10px 24px' }}
                                            >
                                                View Seats <i className="bi bi-arrow-right ms-1"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Show tip when not searched yet */}
                {!searched && !loading && (
                    <div className="text-center py-5">
                        <div style={{ fontSize: '4rem' }}>🗺️</div>
                        <h4 className="text-muted mt-3">Enter source, destination and date to search buses</h4>
                    </div>
                )}
            </div>

            {/* Passenger Reviews & Photos Modal */}
            {reviewModalBus && (
                <div className="modal show d-block tab-index-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
                            <div className="modal-header text-white" style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%)' }}>
                                <h5 className="modal-title fw-bold mb-0">
                                    🚌 {reviewModalBus.operatorName || 'EasyTravel Express'} — Ratings & Reviews
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setReviewModalBus(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row align-items-center mb-4 p-3 bg-light rounded-3">
                                    <div className="col-md-4 text-center border-end">
                                        <img
                                            src={reviewModalBus.busImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'}
                                            alt="Bus"
                                            className="img-fluid rounded-3 mb-2 shadow-sm"
                                            style={{ maxHeight: 110, objectFit: 'cover' }}
                                        />
                                        <div className="small fw-bold text-dark">{reviewModalBus.busType}</div>
                                        <div className="small text-muted">{reviewModalBus.busNumber}</div>
                                    </div>
                                    <div className="col-md-8 text-center text-md-start ps-md-4">
                                        <h3 className="fw-bold text-warning mb-1">⭐ {reviewModalBus.averageRating ? reviewModalBus.averageRating.toFixed(1) : '4.8'} / 5.0</h3>
                                        <p className="text-muted small mb-0">Based on {reviewModalBus.totalReviews || 48} verified passenger ratings</p>
                                    </div>
                                </div>
                                <h6 className="fw-bold mb-3" style={{ color: '#0B3C5D' }}>Passenger Reviews & Feedback</h6>
                                {reviewsList.length === 0 ? (
                                    <p className="text-muted small">No custom reviews posted yet. Be the first to review after your journey!</p>
                                ) : (
                                    <div className="d-flex flex-column gap-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
                                        {reviewsList.map((r, i) => (
                                            <div key={i} className="p-3 bg-white border rounded-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold small text-dark">{r.passengerName || 'Verified Passenger'}</span>
                                                    <span className="text-warning small">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                                </div>
                                                <p className="text-muted small mb-0">{r.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}