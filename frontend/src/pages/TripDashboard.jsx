import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function TripDashboard() {
    const [trips, setTrips] = useState([]);

    const fetchTrips = async () => {
        try {
            // Fetch trips
            const res = await api.get('/trips');
            setTrips(res.data);
        } catch (err) {
            console.error("Error fetching trips", err);
        }
    };

    useEffect(() => {
        fetchTrips();
        const interval = setInterval(fetchTrips, 5000);
        return () => clearInterval(interval);
    }, []);

    const [error, setError] = useState('');

    const advanceTrip = async (id) => {
        setError('');
        try {
            await api.patch(`/trips/${id}/advance`);
            fetchTrips(); // Refresh instantly
        } catch (err) {
            setError(err.response?.data?.message || "Error advancing trip");
        }
    };

    const getProgress = (status) => {
        if (status === 'SCHEDULED') return 0;
        if (status === 'RUNNING') return 50;
        if (status === 'COMPLETED') return 100;
        return 0;
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-primary"><i className="bi bi-geo-alt-fill text-danger me-2"></i>Live Trip Dashboard</h2>
            
            {error && (
                <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4 d-flex align-items-center justify-content-between" role="alert">
                    <span><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</span>
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}
            
            <div className="row">
                {trips.length === 0 && <div className="text-center mt-5"><p className="text-muted">No trips currently active.</p></div>}
                
                {trips.map(trip => (
                    <div key={trip.id} className="col-12 mb-4">
                        <div className="card shadow-sm p-4 border-0">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h4 className="mb-0 text-primary fw-bold">{trip.source} <i className="bi bi-arrow-right mx-2 text-muted"></i> {trip.destination}</h4>
                                    <small className="text-muted">Bus: {trip.busNumber} | Driver: {trip.driverName}</small>
                                </div>
                                <div>
                                    <span className={`badge fs-6 ${trip.status === 'COMPLETED' ? 'bg-success' : trip.status === 'RUNNING' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                        {trip.status}
                                    </span>
                                </div>
                            </div>

                            {/* The Progress Bar */}
                            <div className="progress rounded-pill bg-light" style={{ height: '20px' }}>
                                <div 
                                    className={`progress-bar progress-bar-striped progress-bar-animated ${trip.status === 'COMPLETED' ? 'bg-success' : ''}`} 
                                    role="progressbar" 
                                    style={{ width: `${getProgress(trip.status)}%` }}>
                                </div>
                            </div>
                            
                            <div className="d-flex justify-content-between mt-2 text-muted small fw-bold px-2">
                                <span>SCHEDULED</span>
                                <span>RUNNING</span>
                                <span>COMPLETED</span>
                            </div>

                            <div className="mt-4 text-end">
                                {trip.status !== 'COMPLETED' && (
                                    <button onClick={() => advanceTrip(trip.id)} className="btn btn-dark rounded-pill px-4">
                                        Advance Status <i className="bi bi-fast-forward-fill ms-1"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
