import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function TripMonitor() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTrips = async () => {
        try {
            // Fetch all active trips
            const res = await api.get('/trips');
            setTrips(res.data);
        } catch (err) {
            setError('Failed to fetch active trips.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'ROLE_ADMIN') {
            setError('Access Denied. Trip Monitor is restricted to administrators.');
            setLoading(false);
            return;
        }

        fetchTrips();
        const interval = setInterval(fetchTrips, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const handleAdvance = async (tripId) => {
        try {
            // Advance trip status
            await api.patch(`/trips/${tripId}/advance`);
            fetchTrips();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to advance trip status.');
        }
    };

    const getStatusPercent = (status) => {
        switch (status) {
            case 'SCHEDULED': return 10;
            case 'RUNNING': return 50;
            case 'COMPLETED': return 100;
            default: return 0;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return '#27AE60';
            case 'RUNNING': return '#328CC1';
            case 'SCHEDULED': return '#0B3C5D';
            default: return '#6B7280';
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="container d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold mb-1 text-white">Live Trip Monitor</h3>
                        <p className="text-white-50 small mb-0">Active status updates</p>
                    </div>
                    <button onClick={() => navigate('/admin')} className="btn btn-sm btn-light rounded-pill px-3">
                        Back to Admin Portal
                    </button>
                </div>
            </div>

            <div className="container py-4">
                {error && <div className="alert alert-danger rounded-3">{error}</div>}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                        <p className="mt-3 text-muted">Loading trips...</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {trips.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <div style={{ fontSize: '3rem' }}>📭</div>
                                <h5 className="text-muted mt-3">No active trips found</h5>
                                <p className="text-muted small">Trips are instantiated when schedules are created.</p>
                            </div>
                        ) : (
                            trips.map(t => {
                                const percent = getStatusPercent(t.status);
                                const statusColor = getStatusColor(t.status);
                                return (
                                    <div key={t.id} className="col-md-6 col-lg-4">
                                        <div className="sw-card p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <span className="text-muted small">Trip #{t.id}</span>
                                                    <h5 className="fw-bold text-primary mt-1 mb-0">{t.source} → {t.destination}</h5>
                                                    <small className="text-muted">Bus: {t.busNumber} | Driver: {t.driverName}</small>
                                                </div>
                                                <span className="badge rounded-pill py-2 px-3 fw-bold" style={{ background: statusColor + '20', color: statusColor }}>
                                                    {t.status}
                                                </span>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="my-4">
                                                <div className="progress" style={{ height: 10, borderRadius: 5, overflow: 'hidden' }}>
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated"
                                                        style={{ width: `${percent}%`, backgroundColor: statusColor }}>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between text-muted mt-2" style={{ fontSize: '0.7rem' }}>
                                                    <span className={t.status === 'SCHEDULED' ? 'fw-bold text-dark' : ''}>Scheduled</span>
                                                    <span className={t.status === 'RUNNING' ? 'fw-bold text-dark' : ''}>Running</span>
                                                    <span className={t.status === 'COMPLETED' ? 'fw-bold text-dark' : ''}>Completed</span>
                                                </div>
                                            </div>

                                            {/* Advance status CTA */}
                                            {t.status !== 'COMPLETED' ? (
                                                <button onClick={() => handleAdvance(t.id)} className="btn-sw-orange w-100 py-2 border-none small" style={{ fontSize: '0.9rem' }}>
                                                    {t.status === 'SCHEDULED' ? 'Depart Bus (Set Running)' : 'Complete Trip (Trigger Return Route)'}
                                                </button>
                                            ) : (
                                                <div className="text-center py-2 text-success small fw-bold">
                                                    <i className="bi bi-check2-circle me-1"></i>Trip Completed & Return Generated
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
