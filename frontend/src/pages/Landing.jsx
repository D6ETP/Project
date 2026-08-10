import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function Landing() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [heroSource, setHeroSource] = useState('Pune');
    const [heroDestination, setHeroDestination] = useState('Mumbai');
    const [heroDate, setHeroDate] = useState(new Date().toISOString().split('T')[0]);

    const [realFleet, setRealFleet] = useState([]);
    const [loadingFleet, setLoadingFleet] = useState(true);

    const defaultFleet = [
        { scheduleId: 1, busNumber: 'MH-12-AB-1234', operatorName: 'Neeta Travels', busType: 'Volvo B11R Multi-Axle AC Sleeper', busImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80', price: '₹550', averageRating: 4.9, totalReviews: 124, source: 'Pune', destination: 'Mumbai' },
        { scheduleId: 2, busNumber: 'MH-01-CD-5678', operatorName: 'VRL Travels', busType: 'Scania Metrolink AC Seater', busImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80', price: '₹400', averageRating: 4.8, totalReviews: 98, source: 'Mumbai', destination: 'Pune' },
        { scheduleId: 3, busNumber: 'MH-15-EF-9012', operatorName: 'Zingbus', busType: 'Zingbus Premium AC Sleeper', busImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80', price: '₹450', averageRating: 4.7, totalReviews: 85, source: 'Pune', destination: 'Nashik' },
        { scheduleId: 4, busNumber: 'MH-31-GH-3456', operatorName: 'IntrCity SmartBus', busType: 'IntrCity SmartBus EV Electric Sleeper', busImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80', price: '₹600', averageRating: 4.9, totalReviews: 156, source: 'Pune', destination: 'Mumbai' },
        { scheduleId: 5, busNumber: 'MH-20-IJ-7890', operatorName: 'Purple Travels', busType: 'Prasanna Purple AC Sleeper', busImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80', price: '₹700', averageRating: 4.6, totalReviews: 64, source: 'Mumbai', destination: 'Aurangabad' },
        { scheduleId: 6, busNumber: 'MH-09-KL-1122', operatorName: 'MSRTC Shivneri', busType: 'MSRTC Shivneri Executive Volvo AC', busImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80', price: '₹500', averageRating: 4.8, totalReviews: 210, source: 'Pune', destination: 'Aurangabad' }
    ];

    useEffect(() => {
        const loadDbFleet = async () => {
            setLoadingFleet(true);
            const isUpcomingScheduled = (s) => {
                const isScheduled = !s.status || s.status.toUpperCase() === 'SCHEDULED';
                if (!isScheduled) return false;
                if (!s.departureTime) return true;
                const depStr = String(s.departureTime).replace(' ', 'T');
                const depDate = new Date(depStr);
                return !isNaN(depDate.getTime()) ? depDate > new Date() : true;
            };

            try {
                const res = await api.get('/routes/active-schedules');
                if (res.data && res.data.length > 0) {
                    const validFleet = res.data.filter(isUpcomingScheduled);
                    if (validFleet.length > 0) {
                        setRealFleet(validFleet);
                        setLoadingFleet(false);
                        return;
                    }
                }
            } catch (e) {
                // Ignore active-schedules error
            }

            setLoadingFleet(false);
        };
        loadDbFleet();
    }, []);

    const handleHeroSearch = (e) => {
        e.preventDefault();
        if (!heroSource.trim() || !heroDestination.trim()) {
            return;
        }
        navigate('/search', {
            state: {
                source: heroSource.trim(),
                destination: heroDestination.trim(),
                date: heroDate || new Date().toISOString().split('T')[0]
            }
        });
    };

    const popularRoutes = [
        { from: 'Pune', to: 'Mumbai', duration: '3h 30m', price: '₹350' },
        { from: 'Mumbai', to: 'Pune', duration: '3h 30m', price: '₹350' },
        { from: 'Mumbai', to: 'Nashik', duration: '4h', price: '₹450' },
        { from: 'Pune', to: 'Nashik', duration: '3h', price: '₹400' },
    ];

    const features = [
        { icon: 'bi-shield-check-fill', title: 'Secure Booking', desc: '256-bit SSL encryption on all transactions', color: '#27AE60' },
        { icon: 'bi-ticket-perforated-fill', title: 'Instant E-Ticket', desc: 'Get PDF ticket instantly after booking', color: '#328CC1' },
        { icon: 'bi-headset', title: '24/7 Support', desc: 'Round-the-clock customer assistance', color: '#E07B39' },
        { icon: 'bi-arrow-counterclockwise', title: 'Easy Cancellation', desc: 'Hassle-free cancellations anytime', color: '#0B3C5D' },
    ];

    return (
        <div>
            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #0B3C5D 0%, #328CC1 100%)', minHeight: '80vh', display: 'flex', alignItems: 'center' }} className="hero-min-height">
                <div className="container py-4 py-md-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6 text-white mb-5 mb-lg-0">
                            <div className="badge mb-3 py-2 px-3 fw-normal" style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, fontSize: '0.85rem' }}>
                                🚌 India's Premium Bus Booking Platform
                            </div>
                            <h1 className="fs-hero mb-3">
                                Travel Smart.<br />
                                <span style={{ color: '#E07B39' }}>Book Faster.</span>
                            </h1>
                            <p style={{ fontSize: '1.1rem', opacity: 0.85 }} className="mb-4">
                                Find and book bus tickets to hundreds of routes across India. Safe, affordable, and instant.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <button onClick={() => navigate(user ? '/search' : '/login')}
                                    className="btn-sw-orange" style={{ border: 'none', fontSize: '1rem', cursor: 'pointer' }}>
                                    <i className="bi bi-search me-2"></i>
                                    {user ? 'Search Buses' : 'Get Started'}
                                </button>
                                {!user && (
                                    <Link to="/register" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                                        Create Account
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-6 mt-4 mt-lg-0">
                            <div className="sw-card p-4 hero-search-card">
                                <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>Quick Search</h5>
                                <form onSubmit={handleHeroSearch} className="d-flex flex-column gap-3">
                                    <div>
                                        <label className="form-label fw-semibold small text-muted">From</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                                <i className="bi bi-geo-alt-fill text-muted"></i>
                                            </span>
                                            <input
                                                id="hero-from"
                                                className="form-control border-start-0 sw-input"
                                                style={{ borderRadius: '0 10px 10px 0' }}
                                                placeholder="Departure City"
                                                value={heroSource}
                                                onChange={e => setHeroSource(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label fw-semibold small text-muted">To</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                                                <i className="bi bi-geo-fill text-muted"></i>
                                            </span>
                                            <input
                                                id="hero-to"
                                                className="form-control border-start-0 sw-input"
                                                style={{ borderRadius: '0 10px 10px 0' }}
                                                placeholder="Arrival City"
                                                value={heroDestination}
                                                onChange={e => setHeroDestination(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label fw-semibold small text-muted">Date</label>
                                        <input
                                            type="date"
                                            className="sw-input"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={heroDate}
                                            onChange={e => setHeroDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-sw-orange w-100 mt-1" style={{ border: 'none' }}>
                                        <i className="bi bi-search me-2"></i>Search Buses
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offers & Promo Coupons Section */}
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: '#0B3C5D' }}>
                            <i className="bi bi-tag-fill text-warning me-2"></i>Exclusive Offers & Promo Codes
                        </h2>
                        <p className="text-muted small mb-0">Use these promo codes at checkout to save big on your bus bookings!</p>
                    </div>
                </div>

                <div className="row g-3">
                    {[
                        { code: 'EASY50', title: '50% OFF', desc: 'Get 50% discount up to ₹200 on all routes', color: '#E07B39', bg: '#FFF7ED', icon: 'bi-percent' },
                        { code: 'FIRST100', title: 'FLAT ₹100 OFF', desc: 'Save flat ₹100 on your ticket booking', color: '#27AE60', bg: '#F0FDF4', icon: 'bi-gift-fill' },
                        { code: 'MAHA20', title: '20% OFF', desc: '20% discount up to ₹150 on Maharashtra buses', color: '#328CC1', bg: '#EFF6FF', icon: 'bi-bus-front-fill' }
                    ].map((offer, i) => (
                        <div key={i} className="col-md-4">
                            <div className="sw-card p-4 h-100 d-flex flex-column justify-content-between border-start border-4" style={{ borderColor: offer.color }}>
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ background: offer.bg, color: offer.color, fontSize: '0.85rem' }}>
                                            <i className={`bi ${offer.icon} me-1`}></i>{offer.title}
                                        </span>
                                        <span className="text-muted small">Valid Today</span>
                                    </div>
                                    <h5 className="fw-bold mb-1" style={{ color: '#0B3C5D' }}>Use Code: <span className="text-uppercase" style={{ color: offer.color }}>{offer.code}</span></h5>
                                    <p className="text-muted small mb-3">{offer.desc}</p>
                                </div>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(offer.code); alert(`Coupon code ${offer.code} copied to clipboard!`); }}
                                    className="btn btn-sm btn-outline-secondary rounded-pill w-100 fw-bold"
                                >
                                    <i className="bi bi-clipboard me-1"></i>Copy Code
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Fleet Showcase Section */}
            <div style={{ background: '#F8FAFC' }} className="py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <div className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold mb-2">
                            ✨ Discover Fleet Comfort
                        </div>
                        <h2 className="fw-bold mb-2" style={{ color: '#0B3C5D' }}>Explore Our Premium Bus Fleet</h2>
                        <p className="text-muted">Choose from top luxury Volvo, Scania, and Electric SmartBuses across India</p>

                        {loadingFleet ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }}></div>
                                <p className="text-muted small mt-2">Fetching live fleet from database...</p>
                            </div>
                        ) : realFleet.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-bus-front fs-1 d-block mb-2 text-light"></i>
                                No buses registered in database yet. Add buses via Admin Panel.
                            </div>
                        ) : (
                            <div className="row g-4">
                                {realFleet.slice(0, 4).map((item, idx) => {
                                    const operator = item.operatorName || item.bus?.operatorName || 'EasyTravel Express';
                                    const busType = item.busType || item.bus?.busType || 'AC Seater / Sleeper';
                                    const busNumber = item.busNumber || item.bus?.busNumber || `MH-12-AB-100${idx + 1}`;
                                    const img = item.busImage || item.bus?.busImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80';
                                    const rating = item.averageRating ? item.averageRating.toFixed(1) : '4.8';
                                    const reviews = item.totalReviews || 48;
                                    const price = item.price ? `₹${item.price}` : (item.priceForThisTrip ? `₹${item.priceForThisTrip}` : '₹350');

                                    return (
                                        <div key={idx} className="col-6 col-md-6 col-lg-3">
                                            <div className="sw-card h-100 d-flex flex-column overflow-hidden shadow-sm hover-shadow" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
                                                <div className="position-relative">
                                                    <img src={img} alt={operator} className="w-100" style={{ height: 160, objectFit: 'cover' }} />
                                                    <span className="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 text-white rounded-pill px-2 py-1 small">
                                                        {operator}
                                                    </span>
                                                    <span className="position-absolute bottom-0 end-0 m-2 badge bg-warning text-dark fw-bold rounded-pill px-2 py-1 shadow-sm" style={{ fontSize: '0.75rem' }}>
                                                        ⭐ {rating} ({reviews})
                                                    </span>
                                                </div>
                                                <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between text-center align-items-center">
                                                    <div className="w-100 text-center">
                                                        <h5 className="fw-bold mb-2 text-center" style={{ color: '#0B3C5D' }}>{operator}</h5>
                                                        <div className="mb-2 text-center">
                                                            <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1 text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>
                                                                <i className="bi bi-signpost-2 me-1"></i>{item.source || 'Pune'} → {item.destination || 'Mumbai'}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-1 mb-3 justify-content-center">
                                                            <span className="badge bg-light text-primary border" style={{ fontSize: '0.75rem' }}>{busType}</span>
                                                            {(item.isAC ?? true) && <span className="badge bg-light text-muted border" style={{ fontSize: '0.75rem' }}><i className="bi bi-snow me-1 text-info"></i>AC</span>}
                                                            {(item.isSleeper ?? true) && <span className="badge bg-light text-muted border" style={{ fontSize: '0.75rem' }}><i className="bi bi-moon-stars me-1 text-primary"></i>Sleeper</span>}
                                                            {(item.hasWifi ?? true) && <span className="badge bg-light text-muted border" style={{ fontSize: '0.75rem' }}><i className="bi bi-wifi me-1 text-success"></i>WiFi</span>}
                                                        </div>
                                                    </div>
                                                    <div className="border-top pt-3 mt-2 text-center w-100">
                                                        <div className="mb-2 text-center">
                                                            <small className="text-muted d-block small fw-semibold text-uppercase">Ticket Price</small>
                                                            <span className="fw-bold fs-4" style={{ color: '#E07B39' }}>{price}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const sch = {
                                                                    scheduleId: item.scheduleId || item.id || (idx + 1),
                                                                    source: item.source || 'Pune',
                                                                    destination: item.destination || 'Mumbai',
                                                                    departureTime: item.departureTime || new Date().toISOString(),
                                                                    arrivalTime: item.arrivalTime || new Date().toISOString(),
                                                                    price: item.price ? (typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, ''))) : 550,
                                                                    busNumber: item.busNumber || `MH-12-AB-100${idx + 1}`,
                                                                    busType: busType,
                                                                    operatorName: operator,
                                                                    isAC: item.isAC ?? true,
                                                                    isSleeper: item.isSleeper ?? true,
                                                                    hasWifi: item.hasWifi ?? true
                                                                };
                                                                navigate('/seats', { state: { schedule: sch } });
                                                            }}
                                                            className="btn-sw-orange w-100 border-none rounded-pill py-2 fw-bold shadow-sm"
                                                        >
                                                            Book Seat <i className="bi bi-arrow-right ms-1"></i>
                                                        </button>
                                                    </div>
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

            {/* Popular Routes */}
            <div className="container py-5">
                <h2 className="fw-bold text-center mb-2" style={{ color: '#0B3C5D' }}>Popular Routes</h2>
                <p className="text-muted text-center mb-5">Most booked routes by our passengers</p>
                <div className="row g-3">
                    {popularRoutes.map((r, i) => (
                        <div key={i} className="col-6 col-md-6 col-lg-3">
                            <div className="sw-card p-4 text-center" style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/search', { state: { source: r.from, destination: r.to, date: new Date().toISOString().split('T')[0] } })}>
                                <div className="fw-bold mb-1" style={{ color: '#0B3C5D' }}>{r.from}</div>
                                <i className="bi bi-arrow-down text-muted"></i>
                                <div className="fw-bold mt-1 mb-2" style={{ color: '#0B3C5D' }}>{r.to}</div>
                                <div className="d-flex justify-content-between text-muted small">
                                    <span><i className="bi bi-clock me-1"></i>{r.duration}</span>
                                    <span className="fw-bold" style={{ color: '#E07B39' }}>from {r.price}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Why Choose EasyTravel */}
            <div style={{ background: '#F0F4F8' }} className="py-5">
                <div className="container">
                    <h2 className="fw-bold text-center mb-2" style={{ color: '#0B3C5D' }}>Why Choose EasyTravel?</h2>
                    <p className="text-muted text-center mb-5">Built for modern Indian travellers</p>
                    <div className="row g-4">
                        {features.map((f, i) => (
                            <div key={i} className="col-6 col-md-6 col-lg-3">
                                <div className="sw-card p-4 text-center h-100">
                                    <div className="mb-3" style={{ width: 56, height: 56, background: f.color + '20', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                        <i className={`bi ${f.icon} fs-4`} style={{ color: f.color }}></i>
                                    </div>
                                    <h6 className="fw-bold mb-2" style={{ color: '#0B3C5D' }}>{f.title}</h6>
                                    <p className="text-muted small mb-0">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ background: '#0B3C5D' }} className="text-white py-4">
                <div className="container text-center">
                    <span className="fw-bold">🚌 EasyTravel</span>
                    <span className="text-white-50 small ms-3">© 2026 CDAC Project. All rights reserved.</span>
                </div>
            </div>
        </div>
    );
}
