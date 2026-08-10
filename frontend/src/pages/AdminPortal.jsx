import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminPortal() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [buses, setBuses] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [cityStops, setCityStops] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('schedules');

    // Forms
    const [busForm, setBusForm] = useState({ busNumber: '', totalSeats: 40, busType: 'AC Seater', operatorName: '', busImage: '' });
    const [scheduleForm, setScheduleForm] = useState({ routeId: '', busId: '', driverId: '', departureTime: '', arrivalTime: '', priceForThisTrip: '', isAC: false, isSleeper: false, hasWifi: false, driverName: '', driverPhone: '' });
    const [routeForm, setRouteForm] = useState({ source: '', destination: '', distanceKm: '', basePrice: '' });
    const [stopForm, setStopForm] = useState({ city: '', stopName: '' });
    const [driverForm, setDriverForm] = useState({ fullName: '', phone: '', licenseNumber: '' });

    // Search / Filter states
    const [scheduleSearch, setScheduleSearch] = useState('');
    const [busSearch, setBusSearch] = useState('');
    const [routeSearch, setRouteSearch] = useState('');
    const [stopSearch, setStopSearch] = useState('');
    const [driverSearch, setDriverSearch] = useState('');

    // Passenger Report state
    const [reportBusNumber, setReportBusNumber] = useState('');
    const [reportDate, setReportDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');

    const INDIAN_BUS_PATTERN = /^([A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4})|([0-9]{2}[ -]?BH[ -]?[0-9]{4}[ -]?[A-Z]{1,2})$/i;
    const INDIAN_DL_PATTERN = /^[A-Z]{2}[0-9]{2}[ -]?[0-9]{4}[ -]?[0-9]{7}$/i;

    const showSuccess = (msg) => { setMessage(msg); setError(''); setTimeout(() => setMessage(''), 4000); };
    const showError = (msg) => { setError(msg); setMessage(''); };

    const handleAddDriver = async (e) => {
        e.preventDefault();
        if (!driverForm.licenseNumber || !INDIAN_DL_PATTERN.test(driverForm.licenseNumber.trim())) {
            showError("Invalid Indian Driver License Number. Format example: MH12 2020 0012345 or MH1220200012345.");
            return;
        }
        try {
            await api.post('/admin/drivers', {
                ...driverForm,
                licenseNumber: driverForm.licenseNumber.trim().toUpperCase()
            });
            showSuccess('✅ New driver registered successfully!');
            setDriverForm({ fullName: '', phone: '', licenseNumber: '' });
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || err.response?.data || 'Failed to add driver');
        }
    };

    const handleToggleBusStatus = async (busId) => {
        try {
            await api.put(`/admin/buses/${busId}/toggle-status`);
            showSuccess('Bus active status updated successfully.');
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || err.response?.data || 'Failed to update bus status.');
        }
    };

    const handleToggleDriverStatus = async (driverId) => {
        try {
            await api.put(`/admin/drivers/${driverId}/toggle-status`);
            showSuccess('Driver active status updated successfully.');
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || err.response?.data || 'Failed to update driver status.');
        }
    };

    const handleToggleRouteStatus = async (routeId) => {
        try {
            await api.put(`/admin/routes/${routeId}/toggle-status`);
            showSuccess('Route active status updated successfully.');
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || err.response?.data || 'Failed to update route status.');
        }
    };

    const handleToggleCityStopStatus = async (stopId) => {
        try {
            await api.put(`/admin/city-stops/${stopId}/toggle-status`);
            showSuccess('City stop active status updated successfully.');
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || err.response?.data || 'Failed to update city stop status.');
        }
    };


    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [busesRes, routesRes, schedulesRes, stopsRes, driversRes] = await Promise.allSettled([
                api.get('/admin/buses'),
                api.get('/admin/routes'),      // use admin endpoint with JWT
                api.get('/admin/schedules'),
                api.get('/admin/city-stops'),
                api.get('/admin/drivers')
            ]);

            if (busesRes.status === 'fulfilled') {
                setBuses(busesRes.value.data);
            } else {
                const status = busesRes.reason?.response?.status;
                console.warn('[Admin] buses failed:', status, busesRes.reason?.response?.data);
                if (status === 403) showError('ACCESS_DENIED');
                else if (status === 401) showError('SESSION_EXPIRED');
                else showError('SERVICE_DOWN');
            }

            if (routesRes.status === 'fulfilled') {
                setRoutes(routesRes.value.data);
            } else {
                console.warn('[Admin] routes failed:', routesRes.reason?.response?.status);
            }

            if (schedulesRes.status === 'fulfilled') {
                setSchedules(schedulesRes.value.data);
            } else {
                console.warn('[Admin] schedules failed:', schedulesRes.reason?.response?.status);
            }

            if (stopsRes.status === 'fulfilled') {
                setCityStops(stopsRes.value.data);
            } else {
                console.warn('[Admin] city-stops failed:', stopsRes.reason?.response?.status);
            }

            if (driversRes.status === 'fulfilled') {
                setDrivers(driversRes.value.data);
            } else {
                console.warn('[Admin] drivers failed:', driversRes.reason?.response?.status);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'ROLE_ADMIN') { setLoading(false); return; }
        fetchData();
    }, [user]);

    const handleImageFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showError("Selected image file size exceeds 5MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setBusForm(prev => ({ ...prev, busImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddBus = async (e) => {
        e.preventDefault();
        if (!busForm.busNumber || !INDIAN_BUS_PATTERN.test(busForm.busNumber.trim())) {
            showError("Invalid Indian Bus Registration Number format. Standard example: MH 12 AB 1234, MH-12-CD-5678, or 22 BH 1234 AA.");
            return;
        }
        try {
            const imgUrl = busForm.busImage && busForm.busImage.trim() !== '' 
                ? busForm.busImage 
                : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80';

            await api.post('/admin/buses', {
                ...busForm,
                busNumber: busForm.busNumber.trim().toUpperCase(),
                busImage: imgUrl,
                operatorLogo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&auto=format&fit=crop&q=80'
            });
            showSuccess(`✅ Bus "${busForm.operatorName || 'Registered Bus'} (${busForm.busNumber.trim().toUpperCase()})" registered successfully!`);
            setBusForm({ busNumber: '', totalSeats: 40, busType: 'AC Seater', operatorName: '', busImage: '' });
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to add bus.';
            showError(msg);
        }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/routes', {
                source: routeForm.source,
                destination: routeForm.destination,
                distanceKm: parseFloat(routeForm.distanceKm),
                basePrice: parseFloat(routeForm.basePrice),
                active: true
            });
            showSuccess(`✅ Route "${routeForm.source} → ${routeForm.destination}" added!`);
            setRouteForm({ source: '', destination: '', distanceKm: '', basePrice: '' });
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to add route.';
            showError(msg);
        }
    };

    const getAvailableBuses = () => {
        const formDep = scheduleForm.departureTime ? new Date(scheduleForm.departureTime) : null;
        const formArr = scheduleForm.arrivalTime ? new Date(scheduleForm.arrivalTime) : null;
        const now = new Date();

        const busyBusIds = new Set();
        const busyBusNumbers = new Set();

        schedules.forEach(s => {
            if (s.status === 'CANCELLED') return;

            const sDep = s.departureTime ? new Date(s.departureTime) : null;
            const sArr = s.arrivalTime ? new Date(s.arrivalTime) : null;

            // Bus is unavailable until the specific trip reaches destination arrival time
            const isUnfinishedTrip = s.status === 'SCHEDULED' || s.status === 'RUNNING' || (sArr && sArr > now && s.status !== 'COMPLETED');
            if (!isUnfinishedTrip) return;

            let isOverlap = true;
            if (formDep && formArr && sDep && sArr) {
                isOverlap = (sDep < formArr && sArr > formDep);
            }

            if (isOverlap) {
                const bId = s.bus?.id || s.busId;
                if (bId) busyBusIds.add(String(bId));
                const bNum = s.busNumber || s.bus?.busNumber;
                if (bNum) busyBusNumbers.add(bNum.trim().toUpperCase());
            }
        });

        return buses.filter(b => {
            if (b.active === false) return false;
            if (busyBusIds.has(String(b.id))) return false;
            if (b.busNumber && busyBusNumbers.has(b.busNumber.trim().toUpperCase())) return false;
            return true;
        });
    };

    const getAvailableDrivers = () => {
        const formDep = scheduleForm.departureTime ? new Date(scheduleForm.departureTime) : null;
        const formArr = scheduleForm.arrivalTime ? new Date(scheduleForm.arrivalTime) : null;
        const now = new Date();

        const busyDriverIds = new Set();
        const busyDriverNames = new Set();
        const busyDriverPhones = new Set();

        schedules.forEach(s => {
            if (s.status === 'CANCELLED') return;

            const sDep = s.departureTime ? new Date(s.departureTime) : null;
            const sArr = s.arrivalTime ? new Date(s.arrivalTime) : null;

            // Driver is unavailable until the specific trip reaches destination arrival time
            const isUnfinishedTrip = s.status === 'SCHEDULED' || s.status === 'RUNNING' || (sArr && sArr > now && s.status !== 'COMPLETED');
            if (!isUnfinishedTrip) return;

            let isOverlap = true;
            if (formDep && formArr && sDep && sArr) {
                isOverlap = (sDep < formArr && sArr > formDep);
            }

            if (isOverlap) {
                const dId = s.driver?.id || s.driverId;
                if (dId) busyDriverIds.add(String(dId));

                const dName = s.driverName || s.driver?.fullName;
                if (dName) busyDriverNames.add(dName.trim().toLowerCase());

                const dPhone = s.driverPhone || s.driver?.phone;
                if (dPhone) busyDriverPhones.add(dPhone.trim());
            }
        });

        return drivers.filter(d => {
            if (d.active === false) return false;
            if (busyDriverIds.has(String(d.id))) return false;
            if (d.fullName && busyDriverNames.has(d.fullName.trim().toLowerCase())) return false;
            if (d.phone && busyDriverPhones.has(d.phone.trim())) return false;
            return true;
        });
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        if (!scheduleForm.driverId) {
            showError('Please select a registered driver from the dropdown.');
            return;
        }
        try {
            const res = await api.post('/admin/schedules', {
                routeId: parseInt(scheduleForm.routeId),
                busId: parseInt(scheduleForm.busId),
                driverId: parseInt(scheduleForm.driverId),
                departureTime: scheduleForm.departureTime,
                arrivalTime: scheduleForm.arrivalTime,
                priceForThisTrip: parseFloat(scheduleForm.priceForThisTrip),
                isAC: scheduleForm.isAC,
                isSleeper: scheduleForm.isSleeper,
                hasWifi: scheduleForm.hasWifi,
                driverName: scheduleForm.driverName,
                driverPhone: scheduleForm.driverPhone
            });
            showSuccess(`✅ Schedule created with seats generated & driver "${scheduleForm.driverName || 'Registered Driver'}" assigned!`);
            setScheduleForm({ routeId: '', busId: '', driverId: '', departureTime: '', arrivalTime: '', priceForThisTrip: '', isAC: false, isSleeper: false, hasWifi: false, driverName: '', driverPhone: '' });
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to create schedule.';
            showError(msg);
        }
    };

    const handleDeleteRoute = async (id) => {
        try {
            await api.delete(`/admin/routes/${id}`);
            showSuccess('Route deactivated successfully.');
            fetchData();
        } catch (err) {
            showError('Failed to deactivate route.');
        }
    };

    const handleAddStop = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/city-stops', stopForm);
            showSuccess(`✅ Stop "${stopForm.stopName}" added to ${stopForm.city}!`);
            setStopForm({ city: '', stopName: '' });
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to add stop.';
            showError(msg);
        }
    };

    const handleDeleteStop = async (id) => {
        try {
            await api.delete(`/admin/city-stops/${id}`);
            showSuccess('City stop deleted successfully.');
            fetchData();
        } catch (err) {
            showError('Failed to delete stop.');
        }
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-3 text-muted">Loading administrative modules...</p>
        </div>
    );

    if (user?.role !== 'ROLE_ADMIN') return (
        <div className="container py-5 text-center">
            <div style={{ fontSize: '3rem' }}>🔒</div>
            <h4 className="text-danger mt-3 fw-bold">Access Denied</h4>
            <p className="text-muted small">Only accounts with <code>ROLE_ADMIN</code> can access this area.</p>
            <button onClick={() => navigate('/')} className="btn-sw-primary border-none mt-2">Back to Home</button>
        </div>
    );

    // ---- Error banner component ----
    const ErrorBanner = () => {
        if (!error) return null;
        const configs = {
            ACCESS_DENIED: { title: 'Permission Denied (403)', text: 'The server rejected your token. Make sure your account has ROLE_ADMIN and you logged in after the DB update. Log out and log back in.', action: () => { logout?.(); navigate('/login'); }, label: 'Re-Login' },
            SESSION_EXPIRED: { title: 'Session Expired (401)', text: 'Your JWT token has expired. Please log out and log back in.', action: () => { logout?.(); navigate('/login'); }, label: 'Re-Login' },
            SERVICE_DOWN: { title: 'Admin / Backend Service Unreachable (HTTP 503)', text: 'Could not connect to admin-service via API Gateway. Please ensure Eureka Server (8761), Admin Service (8083), and API Gateway (8080) are running.', action: fetchData, label: 'Retry' },
        };
        const cfg = configs[error];
        if (!cfg) return (
            <div className="alert alert-danger rounded-3 mb-4 d-flex justify-content-between align-items-center">
                <span><i className="bi bi-exclamation-circle me-2"></i>{error}</span>
                <button className="btn-close" onClick={() => setError('')}></button>
            </div>
        );
        return (
            <div className="alert alert-warning rounded-3 mb-4" role="alert">
                <div className="d-flex align-items-start gap-3">
                    <i className="bi bi-exclamation-triangle-fill fs-5 text-warning mt-1"></i>
                    <div className="flex-grow-1">
                        <strong>{cfg.title}</strong>
                        <p className="mb-2 small mt-1">{cfg.text}</p>
                        <div className="d-flex gap-2">
                            <button onClick={cfg.action} className="btn btn-sm btn-outline-dark">{cfg.label}</button>
                            <button onClick={fetchData} className="btn btn-sm btn-outline-secondary">Refresh Data</button>
                        </div>
                    </div>
                    <button className="btn-close" onClick={() => setError('')}></button>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="container d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold mb-1 text-white">Admin Control Center</h3>
                        <p className="text-white-50 small mb-0">Manage fleet, routes, and travel schedules</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button onClick={() => navigate('/admin/reports')} className="btn btn-sm btn-warning text-white rounded-pill px-3 fw-bold">
                            <i className="bi bi-bar-chart-fill me-1"></i>Reports
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-sm btn-light rounded-pill px-3">
                            <i className="bi bi-grid me-1"></i>Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div className="container py-4">
                {message && (
                    <div className="alert alert-success rounded-3 mb-4 d-flex justify-content-between align-items-center">
                        <span>{message}</span>
                        <button className="btn-close" onClick={() => setMessage('')}></button>
                    </div>
                )}
                <ErrorBanner />

                {/* Stats Row */}
                <div className="row g-3 mb-4 admin-stats-row">
                    <div className="col-12 col-sm-4 col-md-4">
                        <div className="sw-card p-3 d-flex align-items-center gap-3 border-start border-4 border-primary">
                            <div className="bg-primary bg-opacity-10 p-2 rounded text-primary"><i className="bi bi-bus-front fs-4"></i></div>
                            <div><p className="text-muted small mb-0">Total Buses</p><h4 className="fw-bold mb-0">{buses.length}</h4></div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-4 col-md-4">
                        <div className="sw-card p-3 d-flex align-items-center gap-3 border-start border-4 border-success">
                            <div className="bg-success bg-opacity-10 p-2 rounded text-success"><i className="bi bi-signpost-2 fs-4"></i></div>
                            <div><p className="text-muted small mb-0">Total Routes</p><h4 className="fw-bold mb-0">{routes.length}</h4></div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-4 col-md-4">
                        <div className="sw-card p-3 d-flex align-items-center gap-3 border-start border-4 border-warning">
                            <div className="bg-warning bg-opacity-10 p-2 rounded text-warning"><i className="bi bi-calendar-week fs-4"></i></div>
                            <div><p className="text-muted small mb-0">Active Schedules</p><h4 className="fw-bold mb-0">{schedules.length}</h4></div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs-scroll mb-4">
                    {[
                        { key: 'schedules', icon: 'bi-calendar-plus', label: 'Schedules' },
                        { key: 'drivers', icon: 'bi-person-badge-fill', label: 'Drivers' },
                        { key: 'buses', icon: 'bi-bus-front', label: 'Fleet (Buses)' },
                        { key: 'routes', icon: 'bi-signpost-split', label: 'Routes' },
                        { key: 'stops', icon: 'bi-geo-alt', label: 'City Stops' },
                        { key: 'passengerReport', icon: 'bi-file-earmark-person-fill', label: 'Passenger Report' },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`btn rounded-pill px-4 ${activeTab === tab.key ? 'btn-sw-primary' : 'btn-light text-muted'}`}
                            style={{ border: 'none' }}>
                            <i className={`bi ${tab.icon} me-2`}></i>{tab.label}
                        </button>
                    ))}
                    <button onClick={() => navigate('/admin/reports')} className="btn rounded-pill px-4 btn-light text-muted ms-auto" style={{ border: 'none' }}>
                        <i className="bi bi-bar-chart-fill me-2"></i>Reports & Analytics
                    </button>
                </div>

                {/* === SCHEDULES TAB === */}
                {activeTab === 'schedules' && (
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="sw-card p-4">
                                <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>
                                    <i className="bi bi-calendar-plus me-2"></i>Create New Trip
                                </h5>
                                {buses.length === 0 && (
                                    <div className="alert alert-warning small py-2">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        No buses registered yet. Go to the <strong>Fleet</strong> tab to add a bus first.
                                    </div>
                                )}
                                {routes.length === 0 && (
                                    <div className="alert alert-warning small py-2">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        No routes found. Go to the <strong>Routes</strong> tab to add routes first.
                                    </div>
                                )}
                                {drivers.length === 0 && (
                                    <div className="alert alert-warning small py-2">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        No drivers found. Go to the <strong>Drivers</strong> tab to register a driver first.
                                    </div>
                                )}
                                <form onSubmit={handleCreateSchedule}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Select Route</label>
                                        <select className="form-select sw-input" value={scheduleForm.routeId}
                                            onChange={e => setScheduleForm({ ...scheduleForm, routeId: e.target.value })} required>
                                            <option value="">-- Choose Route --</option>
                                            {routes.filter(r => r.active !== false).map(r => (
                                                <option key={r.id} value={r.id}>{r.source} → {r.destination} ({r.distanceKm} km)</option>
                                            ))}
                                        </select>
                                    </div>
                                     <div className="mb-3">
                                         <label className="form-label fw-semibold small text-muted">Select Bus (Only Available & Unassigned Buses)</label>
                                         <select className="form-select sw-input" value={scheduleForm.busId}
                                             onChange={e => setScheduleForm({ ...scheduleForm, busId: e.target.value })} required>
                                             <option value="">-- Choose Available Bus ({getAvailableBuses().length} available) --</option>
                                             {getAvailableBuses().map(b => (
                                                 <option key={b.id} value={b.id}>{b.busNumber} — {b.operatorName || 'EasyTravel'} ({b.busType}, {b.totalSeats} seats)</option>
                                             ))}
                                         </select>
                                     </div>
                                     <div className="mb-3">
                                         <label className="form-label fw-semibold small text-muted">Departure Time</label>
                                         <input type="datetime-local" className="sw-input" value={scheduleForm.departureTime}
                                             onChange={e => setScheduleForm({ ...scheduleForm, departureTime: e.target.value })} required />
                                     </div>
                                     <div className="mb-3">
                                         <label className="form-label fw-semibold small text-muted">Arrival Time</label>
                                         <input type="datetime-local" className="sw-input" value={scheduleForm.arrivalTime}
                                             onChange={e => setScheduleForm({ ...scheduleForm, arrivalTime: e.target.value })} required />
                                     </div>
                                     <div className="mb-3">
                                         <label className="form-label fw-semibold small text-muted">Trip Price (₹)</label>
                                         <input type="number" step="0.01" min="1" className="sw-input" placeholder="e.g. 350.00"
                                             value={scheduleForm.priceForThisTrip}
                                             onChange={e => setScheduleForm({ ...scheduleForm, priceForThisTrip: e.target.value })} required />
                                     </div>
                                      <div className="mb-3">
                                           <label className="form-label fw-semibold small text-muted">Select Registered Driver (Only Available & Unassigned Drivers)</label>
                                           <select className="form-select sw-input" value={scheduleForm.driverId}
                                               onChange={e => {
                                                   const selectedId = e.target.value;
                                                   const found = drivers.find(d => String(d.id) === selectedId);
                                                   if (found) {
                                                       setScheduleForm({
                                                           ...scheduleForm,
                                                           driverId: selectedId,
                                                           driverName: found.fullName,
                                                           driverPhone: found.phone
                                                       });
                                                   } else {
                                                       setScheduleForm({ ...scheduleForm, driverId: '', driverName: '', driverPhone: '' });
                                                   }
                                               }} required>
                                               <option value="">-- Choose Available Driver ({getAvailableDrivers().length} available) --</option>
                                               {getAvailableDrivers().map(d => (
                                                   <option key={d.id} value={d.id}>{d.fullName} ({d.phone}) — Lic: {d.licenseNumber}</option>
                                               ))}
                                           </select>
                                       </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">Amenities</label>
                                        <div className="d-flex gap-3 mt-1">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="isAC" 
                                                    checked={scheduleForm.isAC} onChange={e => setScheduleForm({ ...scheduleForm, isAC: e.target.checked })} />
                                                <label className="form-check-label small" htmlFor="isAC">AC</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="isSleeper" 
                                                    checked={scheduleForm.isSleeper} onChange={e => setScheduleForm({ ...scheduleForm, isSleeper: e.target.checked })} />
                                                <label className="form-check-label small" htmlFor="isSleeper">Sleeper</label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="hasWifi" 
                                                    checked={scheduleForm.hasWifi} onChange={e => setScheduleForm({ ...scheduleForm, hasWifi: e.target.checked })} />
                                                <label className="form-check-label small" htmlFor="hasWifi">WiFi</label>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-sw-orange w-100 border-none" disabled={buses.length === 0 || routes.length === 0}>
                                        <i className="bi bi-send-check me-2"></i>Publish & Generate Seats
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="sw-card p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0" style={{ color: '#0B3C5D' }}>
                                        <i className="bi bi-clock-history me-2"></i>All Schedules ({schedules.length})
                                    </h5>
                                    <button onClick={fetchData} className="btn btn-sm btn-outline-secondary rounded-pill">
                                        <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                                    </button>
                                </div>

                                {/* Filter Search Input for Schedules */}
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0">
                                            <i className="bi bi-search text-muted"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control sw-input border-start-0"
                                            placeholder="Filter schedules by route, bus plate, operator, driver name..."
                                            value={scheduleSearch}
                                            onChange={e => setScheduleSearch(e.target.value)}
                                        />
                                        {scheduleSearch && (
                                            <button className="btn btn-outline-secondary" onClick={() => setScheduleSearch('')}>Clear</button>
                                        )}
                                    </div>
                                </div>

                                {schedules.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-calendar-x fs-1 d-block mb-2 text-light"></i>
                                        No schedules created yet. Use the form to add one.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle text-muted small">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Route</th>
                                                    <th>Bus & Operator</th>
                                                    <th>Assigned Driver</th>
                                                    <th>Departure</th>
                                                    <th>Arrival</th>
                                                    <th>Price</th>
                                                    <th>Seats</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schedules.filter(s => {
                                                    if (!scheduleSearch.trim()) return true;
                                                    const q = scheduleSearch.toLowerCase();
                                                    const rStr = `${s.route?.source || ''} ${s.route?.destination || ''}`.toLowerCase();
                                                    const bStr = `${s.bus?.busNumber || ''} ${s.bus?.operatorName || ''}`.toLowerCase();
                                                    const dStr = `${s.driverName || ''} ${s.driverPhone || ''}`.toLowerCase();
                                                    return rStr.includes(q) || bStr.includes(q) || dStr.includes(q);
                                                }).map((s, i) => (
                                                    <tr key={s.id}>
                                                        <td className="text-muted">{i + 1}</td>
                                                        <td className="fw-bold text-dark">{s.route?.source} → {s.route?.destination}</td>
                                                        <td>{s.bus?.operatorName || 'EasyTravel'}<br /><span className="badge bg-light text-muted border">{s.bus?.busNumber}</span></td>
                                                        <td><strong className="text-dark"><i className="bi bi-person-badge me-1"></i>{s.driverName || 'Ramesh Kumar'}</strong><br /><small className="text-muted"><i className="bi bi-telephone me-1"></i>{s.driverPhone || '9876543210'}</small></td>
                                                        <td>{new Date(s.departureTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                        <td>{new Date(s.arrivalTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                        <td className="fw-bold text-success">₹{s.priceForThisTrip}</td>
                                                        <td><span className={s.availableSeats > 10 ? 'text-success fw-bold' : 'text-danger fw-bold'}>{s.availableSeats}</span>/{s.bus?.totalSeats}</td>
                                                        <td><span className={`badge rounded-pill ${s.status === 'SCHEDULED' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'}`}>{s.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* === DRIVERS TAB === */}
                {activeTab === 'drivers' && (
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="sw-card p-4">
                                <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>
                                    <i className="bi bi-person-plus-fill me-2"></i>Register New Driver
                                </h5>
                                <form onSubmit={handleAddDriver}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Full Name</label>
                                        <input type="text" className="sw-input" placeholder="e.g. Ramesh Kumar"
                                            value={driverForm.fullName} onChange={e => setDriverForm({ ...driverForm, fullName: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Contact Phone Number</label>
                                        <input type="tel" className="sw-input" placeholder="e.g. 9876543210"
                                            value={driverForm.phone} onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">Commercial License Number (Indian Standard)</label>
                                        <input type="text" className="sw-input" placeholder="e.g. MH12 2020 0012345"
                                            value={driverForm.licenseNumber} onChange={e => setDriverForm({ ...driverForm, licenseNumber: e.target.value.toUpperCase() })} required />
                                        <small className="text-muted d-block mt-1">Format: State (2 letters) + RTO (2 digits) + Year (4 digits) + License No (7 digits).</small>
                                    </div>
                                    <button type="submit" className="btn-sw-primary w-100 border-none">
                                        <i className="bi bi-person-check me-2"></i>Save Driver Record
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="sw-card p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0" style={{ color: '#0B3C5D' }}>
                                        <i className="bi bi-person-badge-fill me-2"></i>Registered Drivers ({drivers.length})
                                    </h5>
                                    <button onClick={fetchData} className="btn btn-sm btn-outline-secondary rounded-pill">
                                        <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                                    </button>
                                </div>
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                        <input
                                            type="text"
                                            className="form-control sw-input border-start-0"
                                            placeholder="Filter drivers by name, phone number, or license..."
                                            value={driverSearch}
                                            onChange={e => setDriverSearch(e.target.value)}
                                        />
                                        {driverSearch && <button className="btn btn-outline-secondary" onClick={() => setDriverSearch('')}>Clear</button>}
                                    </div>
                                </div>
                                {drivers.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-person-badge fs-1 d-block mb-2 text-light"></i>
                                        No registered drivers found. Add one using the form.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle text-muted small">
                                            <thead className="table-light">
                                                <tr><th>#</th><th>Driver Name</th><th>Contact Phone</th><th>License Number</th><th>Status (Click to toggle)</th></tr>
                                            </thead>
                                            <tbody>
                                                {drivers.filter(d => {
                                                    if (!driverSearch.trim()) return true;
                                                    const q = driverSearch.toLowerCase();
                                                    return (d.fullName || '').toLowerCase().includes(q) ||
                                                           (d.phone || '').toLowerCase().includes(q) ||
                                                           (d.licenseNumber || '').toLowerCase().includes(q);
                                                }).map((d, i) => (
                                                    <tr key={d.id}>
                                                        <td className="text-muted">{i + 1}</td>
                                                        <td className="fw-bold text-dark">{d.fullName}</td>
                                                        <td className="fw-semibold text-primary">{d.phone}</td>
                                                        <td><code>{d.licenseNumber}</code></td>
                                                        <td>
                                                            <button 
                                                                onClick={() => handleToggleDriverStatus(d.id)} 
                                                                className={`btn btn-xs rounded-pill px-3 py-1 fw-semibold small ${d.active !== false ? 'btn-success text-white' : 'btn-danger text-white'}`}
                                                                title="Click to Activate/Deactivate Driver"
                                                            >
                                                                <i className={`bi ${d.active !== false ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'} me-1`}></i>
                                                                {d.active !== false ? 'Active' : 'Deactivated'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* === BUSES TAB === */}
                {activeTab === 'buses' && (
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="sw-card p-4">
                                <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>
                                    <i className="bi bi-plus-circle-fill me-2"></i>Register New Bus
                                </h5>
                                <form onSubmit={handleAddBus}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Bus Operator Brand Name</label>
                                        <input
                                            type="text"
                                            className="sw-input"
                                            placeholder="e.g. EasyTravel Express, Neeta Travels, etc."
                                            value={busForm.operatorName}
                                            onChange={e => setBusForm({ ...busForm, operatorName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Bus Registration Number (Indian Pattern)</label>
                                        <input type="text" className="sw-input text-uppercase" placeholder="e.g. MH 12 AB 1234 or MH-12-CD-5678"
                                            value={busForm.busNumber} onChange={e => setBusForm({ ...busForm, busNumber: e.target.value.toUpperCase() })} required />
                                        <small className="text-muted d-block mt-1">Format: State (2 letters) + RTO (2 digits) + Series (1-3 letters) + Number (4 digits).</small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Seating Capacity</label>
                                        <input type="number" min="10" max="60" className="sw-input" placeholder="e.g. 40"
                                            value={busForm.totalSeats} onChange={e => setBusForm({ ...busForm, totalSeats: parseInt(e.target.value) })} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">Bus Type</label>
                                        <select className="form-select sw-input" value={busForm.busType}
                                            onChange={e => setBusForm({ ...busForm, busType: e.target.value })} required>
                                            <option>AC Seater</option>
                                            <option>AC Sleeper</option>
                                            <option>Non-AC Seater</option>
                                            <option>Non-AC Sleeper</option>
                                            <option>Volvo AC</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                         <label className="form-label fw-semibold small text-muted">Bus Image URL (GitHub / Unsplash / Web Link)</label>
                                         <div className="input-group mb-2">
                                             <span className="input-group-text bg-light text-muted"><i className="bi bi-link-45deg"></i></span>
                                             <input
                                                 type="url"
                                                 placeholder="https://raw.githubusercontent.com/.../bus.jpg or https://..."
                                                 className="form-control sw-input"
                                                 value={busForm.busImage}
                                                 onChange={e => setBusForm(prev => ({ ...prev, busImage: e.target.value }))}
                                             />
                                         </div>
                                         <div className="d-flex flex-wrap gap-1 mb-2">
                                             <span className="small text-muted me-1 align-self-center">Presets:</span>
                                             <button type="button" className="btn btn-xs btn-outline-primary py-0 px-2 rounded-pill small" onClick={() => setBusForm(prev => ({ ...prev, busImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80' }))}>Volvo AC</button>
                                             <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 rounded-pill small" onClick={() => setBusForm(prev => ({ ...prev, busImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80' }))}>Luxury Sleeper</button>
                                             <button type="button" className="btn btn-xs btn-outline-info py-0 px-2 rounded-pill small" onClick={() => setBusForm(prev => ({ ...prev, busImage: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop&q=80' }))}>Express EV</button>
                                         </div>
                                         {busForm.busImage ? (
                                             <div className="mt-2 text-center p-2 bg-light rounded border">
                                                 <img src={busForm.busImage} alt="Bus Preview" className="img-fluid rounded" style={{ maxHeight: 120, objectFit: 'cover' }} onError={(e) => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'; }} />
                                                 <button type="button" onClick={() => setBusForm(prev => ({ ...prev, busImage: '' }))} className="btn btn-sm btn-link text-danger d-block mx-auto mt-1 p-0 small">
                                                     <i className="bi bi-trash me-1"></i>Clear URL
                                                 </button>
                                             </div>
                                         ) : (
                                             <small className="text-muted d-block">Paste any GitHub raw image link, web URL, or choose a preset above.</small>
                                         )}
                                     </div>
                                    <button type="submit" className="btn-sw-primary w-100 border-none">
                                        <i className="bi bi-bus-front me-2"></i>Save Vehicle
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="sw-card p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0" style={{ color: '#0B3C5D' }}>
                                        <i className="bi bi-truck me-2"></i>Fleet Inventory ({buses.length} buses)
                                    </h5>
                                    <button onClick={fetchData} className="btn btn-sm btn-outline-secondary rounded-pill">
                                        <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                                    </button>
                                </div>
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                        <input
                                            type="text"
                                            className="form-control sw-input border-start-0"
                                            placeholder="Filter buses by number, operator, type..."
                                            value={busSearch}
                                            onChange={e => setBusSearch(e.target.value)}
                                        />
                                        {busSearch && <button className="btn btn-outline-secondary" onClick={() => setBusSearch('')}>Clear</button>}
                                    </div>
                                </div>
                                {buses.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-bus-front fs-1 d-block mb-2 text-light"></i>
                                        No buses registered yet. Add one using the form.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle text-muted small">
                                            <thead className="table-light">
                                                <tr><th>#</th><th>Bus Number</th><th>Operator Brand</th><th>Type</th><th>Capacity</th><th>Status (Click to toggle)</th></tr>
                                            </thead>
                                            <tbody>
                                                {buses.filter(b => {
                                                    if (!busSearch.trim()) return true;
                                                    const q = busSearch.toLowerCase();
                                                    return (b.busNumber || '').toLowerCase().includes(q) ||
                                                           (b.operatorName || '').toLowerCase().includes(q) ||
                                                           (b.busType || '').toLowerCase().includes(q);
                                                }).map((b, i) => (
                                                    <tr key={b.id}>
                                                        <td className="text-muted">{i + 1}</td>
                                                        <td className="fw-bold text-dark">{b.busNumber}</td>
                                                        <td className="fw-semibold text-primary">{b.operatorName || 'EasyTravel Express'}</td>
                                                        <td>{b.busType}</td>
                                                        <td>{b.totalSeats} seats</td>
                                                        <td>
                                                            <button 
                                                                onClick={() => handleToggleBusStatus(b.id)} 
                                                                className={`btn btn-xs rounded-pill px-3 py-1 fw-semibold small ${b.active !== false ? 'btn-success text-white' : 'btn-danger text-white'}`}
                                                                title="Click to Activate/Deactivate Bus"
                                                            >
                                                                <i className={`bi ${b.active !== false ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'} me-1`}></i>
                                                                {b.active !== false ? 'Active' : 'Deactivated'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* === ROUTES TAB === */}
                {activeTab === 'routes' && (
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="sw-card p-4">
                                <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>
                                    <i className="bi bi-signpost-2-fill me-2"></i>Add New Route
                                </h5>
                                <form onSubmit={handleAddRoute}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Origin City</label>
                                        <input type="text" className="sw-input" placeholder="e.g. Pune"
                                            value={routeForm.source} onChange={e => setRouteForm({ ...routeForm, source: e.target.value })} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">Destination City</label>
                                        <input type="text" className="sw-input" placeholder="e.g. Mumbai"
                                            value={routeForm.destination} onChange={e => setRouteForm({ ...routeForm, destination: e.target.value })} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">Distance (km)</label>
                                        <input type="number" min="1" step="0.1" className="sw-input" placeholder="e.g. 150"
                                            value={routeForm.distanceKm} onChange={e => setRouteForm({ ...routeForm, distanceKm: e.target.value })} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">Base Price (₹)</label>
                                        <input type="number" min="1" step="0.01" className="sw-input" placeholder="e.g. 350.00"
                                            value={routeForm.basePrice} onChange={e => setRouteForm({ ...routeForm, basePrice: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="btn-sw-primary w-100 border-none">
                                        <i className="bi bi-plus-circle me-2"></i>Add Route
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="sw-card p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0" style={{ color: '#0B3C5D' }}>
                                        <i className="bi bi-map me-2"></i>All Routes ({routes.length})
                                    </h5>
                                    <button onClick={fetchData} className="btn btn-sm btn-outline-secondary rounded-pill">
                                        <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                                    </button>
                                </div>
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                        <input
                                            type="text"
                                            className="form-control sw-input border-start-0"
                                            placeholder="Filter routes by source or destination city..."
                                            value={routeSearch}
                                            onChange={e => setRouteSearch(e.target.value)}
                                        />
                                        {routeSearch && <button className="btn btn-outline-secondary" onClick={() => setRouteSearch('')}>Clear</button>}
                                    </div>
                                </div>
                                {routes.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-map fs-1 d-block mb-2 text-light"></i>
                                        No routes found. Add your first route.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle text-muted small">
                                            <thead className="table-light">
                                                <tr><th>#</th><th>Source</th><th>Destination</th><th>Distance</th><th>Base Price</th><th>Status (Click to toggle)</th></tr>
                                            </thead>
                                            <tbody>
                                                {routes.filter(r => {
                                                    if (!routeSearch.trim()) return true;
                                                    const q = routeSearch.toLowerCase();
                                                    return (r.source || '').toLowerCase().includes(q) ||
                                                           (r.destination || '').toLowerCase().includes(q);
                                                }).map((r, i) => (
                                                    <tr key={r.id}>
                                                        <td className="text-muted">{i + 1}</td>
                                                        <td className="fw-bold text-dark">{r.source}</td>
                                                        <td className="fw-bold text-dark">{r.destination}</td>
                                                        <td>{r.distanceKm} km</td>
                                                        <td className="fw-bold text-success">₹{r.basePrice || '0'}</td>
                                                        <td colSpan={2}>
                                                            <button
                                                                onClick={() => handleToggleRouteStatus(r.id)}
                                                                className={`btn btn-xs rounded-pill px-3 py-1 fw-semibold small ${r.active !== false ? 'btn-success text-white' : 'btn-danger text-white'}`}
                                                                title="Click to Activate/Deactivate Route"
                                                            >
                                                                <i className={`bi ${r.active !== false ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'} me-1`}></i>
                                                                {r.active !== false ? 'Active' : 'Deactivated'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* === CITY STOPS TAB === */}
                {activeTab === 'stops' && (
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <div className="sw-card p-4">
                                <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>
                                    <i className="bi bi-geo-alt-fill me-2"></i>Add City Stop
                                </h5>
                                <form onSubmit={handleAddStop}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-muted">City Name</label>
                                        <input type="text" className="sw-input" placeholder="e.g. Pune"
                                            value={stopForm.city} onChange={e => setStopForm({ ...stopForm, city: e.target.value })} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-muted">Stop Name</label>
                                        <input type="text" className="sw-input" placeholder="e.g. Swargate"
                                            value={stopForm.stopName} onChange={e => setStopForm({ ...stopForm, stopName: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="btn-sw-primary w-100 border-none">
                                        <i className="bi bi-plus-circle me-2"></i>Add Stop
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="sw-card p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold mb-0" style={{ color: '#0B3C5D' }}>
                                        <i className="bi bi-geo-alt me-2"></i>All City Stops ({cityStops.length})
                                    </h5>
                                    <button onClick={fetchData} className="btn btn-sm btn-outline-secondary rounded-pill">
                                        <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                                    </button>
                                </div>
                                <div className="mb-3">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                        <input
                                            type="text"
                                            className="form-control sw-input border-start-0"
                                            placeholder="Filter city stops by city or boarding stop name..."
                                            value={stopSearch}
                                            onChange={e => setStopSearch(e.target.value)}
                                        />
                                        {stopSearch && <button className="btn btn-outline-secondary" onClick={() => setStopSearch('')}>Clear</button>}
                                    </div>
                                </div>
                                {cityStops.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-geo fs-1 d-block mb-2 text-light"></i>
                                        No city stops found. Add your first stop.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle text-muted small">
                                            <thead className="table-light">
                                                <tr><th>#</th><th>City</th><th>Stop Name</th><th>Status (Click to toggle)</th></tr>
                                            </thead>
                                            <tbody>
                                                {cityStops.filter(s => {
                                                    if (!stopSearch.trim()) return true;
                                                    const q = stopSearch.toLowerCase();
                                                    return (s.city || '').toLowerCase().includes(q) ||
                                                           (s.stopName || '').toLowerCase().includes(q);
                                                }).sort((a, b) => a.city.localeCompare(b.city)).map((s, i) => (
                                                    <tr key={s.id}>
                                                        <td className="text-muted">{i + 1}</td>
                                                        <td className="fw-bold text-dark">{s.city}</td>
                                                        <td className="text-dark">{s.stopName}</td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleToggleCityStopStatus(s.id)}
                                                                className={`btn btn-xs rounded-pill px-3 py-1 fw-semibold small ${s.active !== false ? 'btn-success text-white' : 'btn-danger text-white'}`}
                                                                title="Click to Activate/Deactivate Stop"
                                                            >
                                                                <i className={`bi ${s.active !== false ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'} me-1`}></i>
                                                                {s.active !== false ? 'Active' : 'Deactivated'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* === PASSENGER REPORT TAB === */}
                {activeTab === 'passengerReport' && (
                    <div>
                        <div className="sw-card p-4 mb-4">
                            <h5 className="fw-bold mb-1" style={{ color: '#0B3C5D' }}>
                                <i className="bi bi-file-earmark-person-fill me-2"></i>Bus-wise Passenger Report
                            </h5>
                            <p className="text-muted small mb-4">Generate a printable / downloadable PDF roster of all confirmed passengers for a specific bus. Ideal for drivers &amp; helpers.</p>

                            <div className="row g-3 align-items-end mb-2">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold small text-muted">Select Bus (by Number)</label>
                                    <select
                                        className="form-select sw-input"
                                        value={reportBusNumber}
                                        onChange={e => { setReportBusNumber(e.target.value); setReportData(null); setReportError(''); }}
                                    >
                                        <option value="">-- Choose Bus --</option>
                                        {buses.map(b => (
                                            <option key={b.id} value={b.busNumber}>{b.busNumber} — {b.operatorName || 'EasyTravel'} ({b.busType})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-semibold small text-muted">Select Date (Optional Filter)</label>
                                    <input
                                        type="date"
                                        className="form-select sw-input"
                                        value={reportDate}
                                        onChange={e => { setReportDate(e.target.value); setReportData(null); setReportError(''); }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <button
                                        className="btn-sw-primary w-100 border-none"
                                        disabled={!reportBusNumber || reportLoading}
                                        onClick={async () => {
                                            setReportLoading(true);
                                            setReportError('');
                                            setReportData(null);
                                            try {
                                                let url = `/admin/reports/bus-passenger-list?busNumber=${encodeURIComponent(reportBusNumber)}`;
                                                if (reportDate) {
                                                    url += `&date=${encodeURIComponent(reportDate)}`;
                                                }
                                                const res = await api.get(url);
                                                setReportData(res.data);
                                            } catch (err) {
                                                setReportError(err.response?.data?.message || 'Failed to load passenger data.');
                                            } finally {
                                                setReportLoading(false);
                                            }
                                        }}
                                    >
                                        {reportLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Loading...</> : <><i className="bi bi-search me-2"></i>Load Passengers</>}
                                    </button>
                                </div>
                                {reportDate && (
                                    <div className="col-md-2">
                                        <button
                                            className="btn btn-outline-secondary w-100 rounded-pill small"
                                            onClick={() => { setReportDate(''); setReportData(null); }}
                                        >
                                            Clear Date
                                        </button>
                                    </div>
                                )}
                                {reportData && reportData.totalPassengers > 0 && (
                                    <div className="col-md-4">
                                        <button
                                            className="btn btn-success w-100 rounded-pill fw-semibold"
                                            onClick={() => {
                                                const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                                                const pageW = doc.internal.pageSize.getWidth();

                                                // Header band
                                                doc.setFillColor(11, 60, 93);
                                                doc.rect(0, 0, pageW, 28, 'F');
                                                doc.setTextColor(255, 255, 255);
                                                doc.setFontSize(18);
                                                doc.setFont('helvetica', 'bold');
                                                doc.text('EasyTravel — Passenger Roster', pageW / 2, 12, { align: 'center' });
                                                doc.setFontSize(10);
                                                doc.setFont('helvetica', 'normal');
                                                doc.text(`Bus: ${reportData.busNumber}  |  Operator: ${reportData.operatorName || 'EasyTravel'}  |  Type: ${reportData.busType}`, pageW / 2, 20, { align: 'center' });
                                                doc.text(`Generated: ${new Date().toLocaleString('en-IN')}  |  Total Passengers: ${reportData.totalPassengers}`, pageW / 2, 26, { align: 'center' });

                                                let yPos = 34;
                                                doc.setTextColor(0, 0, 0);

                                                reportData.schedules.forEach((sched, idx) => {
                                                    // Schedule header block
                                                    doc.setFillColor(240, 248, 255);
                                                    doc.rect(10, yPos, pageW - 20, 22, 'F');
                                                    doc.setDrawColor(11, 60, 93);
                                                    doc.setLineWidth(0.5);
                                                    doc.rect(10, yPos, pageW - 20, 22);

                                                    doc.setFontSize(11);
                                                    doc.setFont('helvetica', 'bold');
                                                    doc.setTextColor(11, 60, 93);
                                                    doc.text(`Schedule ${idx + 1}: ${sched.route}`, 14, yPos + 7);

                                                    doc.setFontSize(8.5);
                                                    doc.setFont('helvetica', 'normal');
                                                    doc.setTextColor(60, 60, 60);
                                                    const dep = sched.departure ? new Date(sched.departure).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
                                                    const arr = sched.arrival   ? new Date(sched.arrival).toLocaleString('en-IN',   { dateStyle: 'medium', timeStyle: 'short' }) : '-';
                                                    doc.text(`Departure: ${dep}   Arrival: ${arr}   Driver: ${sched.driverName} (${sched.driverPhone})   Booked: ${sched.bookedCount}/${sched.totalSeats} seats`, 14, yPos + 14);

                                                    yPos += 26;

                                                    // Passenger table
                                                    autoTable(doc, {
                                                        startY: yPos,
                                                        margin: { left: 10, right: 10 },
                                                        head: [['#', 'Seat', 'Passenger Name', 'Age', 'Gender', 'Phone', 'Email', 'Booking Ref', 'Paid (₹)']],
                                                        body: sched.passengers.map((p, i) => [
                                                            i + 1,
                                                            p.seatNumber,
                                                            p.passengerName,
                                                            p.passengerAge,
                                                            p.passengerGender,
                                                            p.contactPhone,
                                                            p.contactEmail,
                                                            p.bookingRef,
                                                            `Rs. ${p.amountPaid}`
                                                        ]),
                                                        styles: { fontSize: 7.5, cellPadding: 2.5 },
                                                        headStyles: { fillColor: [50, 140, 193], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
                                                        alternateRowStyles: { fillColor: [245, 250, 255] },
                                                        columnStyles: {
                                                            0: { cellWidth: 7 },
                                                            1: { cellWidth: 12 },
                                                            2: { cellWidth: 32 },
                                                            3: { cellWidth: 9 },
                                                            4: { cellWidth: 14 },
                                                            5: { cellWidth: 24 },
                                                            6: { cellWidth: 38 },
                                                            7: { cellWidth: 28 },
                                                            8: { cellWidth: 16 }
                                                        },
                                                        didDrawPage: (data) => {
                                                            doc.setFontSize(7);
                                                            doc.setTextColor(150);
                                                            doc.text('EasyTravel Passenger Roster — Confidential', 10, doc.internal.pageSize.getHeight() - 5);
                                                            doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageW - 20, doc.internal.pageSize.getHeight() - 5);
                                                        }
                                                    });
                                                    yPos = doc.lastAutoTable.finalY + 10;
                                                    if (yPos > 260 && idx < reportData.schedules.length - 1) {
                                                        doc.addPage();
                                                        yPos = 15;
                                                    }
                                                });

                                                doc.save(`EasyTravel_Passenger_Roster_${reportData.busNumber}_${new Date().toISOString().slice(0,10)}.pdf`);
                                            }}
                                        >
                                            <i className="bi bi-file-earmark-pdf-fill me-2"></i>Download PDF Roster
                                        </button>
                                    </div>
                                )}
                            </div>

                            {reportError && (
                                <div className="alert alert-danger rounded-3 mt-3">{reportError}</div>
                            )}
                        </div>

                        {/* Preview Table */}
                        {reportData && (
                            <div>
                                {reportData.totalPassengers === 0 ? (
                                    <div className="sw-card p-5 text-center text-muted">
                                        <i className="bi bi-person-x fs-1 d-block mb-2"></i>
                                        No confirmed bookings found for bus <strong>{reportData.busNumber}</strong>.
                                    </div>
                                ) : (
                                    <div>
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <div className="sw-card px-4 py-3 d-flex align-items-center gap-2 border-start border-4 border-success flex-fill">
                                                <i className="bi bi-bus-front-fill text-success fs-4"></i>
                                                <div><p className="small text-muted mb-0">Bus</p><h6 className="fw-bold mb-0">{reportData.busNumber}</h6></div>
                                            </div>
                                            <div className="sw-card px-4 py-3 d-flex align-items-center gap-2 border-start border-4 border-primary flex-fill">
                                                <i className="bi bi-people-fill text-primary fs-4"></i>
                                                <div><p className="small text-muted mb-0">Total Passengers</p><h6 className="fw-bold mb-0">{reportData.totalPassengers}</h6></div>
                                            </div>
                                            <div className="sw-card px-4 py-3 d-flex align-items-center gap-2 border-start border-4 border-warning flex-fill">
                                                <i className="bi bi-calendar2-week text-warning fs-4"></i>
                                                <div><p className="small text-muted mb-0">Schedules</p><h6 className="fw-bold mb-0">{reportData.schedules.length}</h6></div>
                                            </div>
                                            <div className="sw-card px-4 py-3 d-flex align-items-center gap-2 border-start border-4 border-info flex-fill">
                                                <i className="bi bi-building text-info fs-4"></i>
                                                <div><p className="small text-muted mb-0">Operator</p><h6 className="fw-bold mb-0">{reportData.operatorName || 'EasyTravel'}</h6></div>
                                            </div>
                                        </div>

                                        {reportData.schedules.map((sched, si) => (
                                            <div key={sched.scheduleId} className="sw-card p-0 mb-4 overflow-hidden">
                                                <div className="px-4 py-3 d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(90deg, #0B3C5D 0%, #328CC1 100%)' }}>
                                                    <div>
                                                        <h6 className="fw-bold text-white mb-0"><i className="bi bi-geo-alt me-1"></i>{sched.route}</h6>
                                                        <small className="text-white-50">
                                                            Dep: {sched.departure ? new Date(sched.departure).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                                                            &nbsp;→&nbsp;
                                                            Arr: {sched.arrival ? new Date(sched.arrival).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                                                        </small>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="badge bg-light text-dark me-2"><i className="bi bi-person-badge me-1"></i>{sched.driverName}</span>
                                                        <span className="badge bg-light text-dark"><i className="bi bi-telephone me-1"></i>{sched.driverPhone}</span>
                                                        <div className="mt-1"><small className="text-white-50">{sched.bookedCount} / {sched.totalSeats} seats booked</small></div>
                                                    </div>
                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table align-middle small mb-0">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Seat</th>
                                                                <th>Passenger Name</th>
                                                                <th>Age</th>
                                                                <th>Gender</th>
                                                                <th><i className="bi bi-telephone me-1"></i>Phone</th>
                                                                <th><i className="bi bi-envelope me-1"></i>Email</th>
                                                                <th>Booking Ref</th>
                                                                <th>Paid</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sched.passengers.map((p, pi) => (
                                                                <tr key={p.bookingRef}>
                                                                    <td className="text-muted">{pi + 1}</td>
                                                                    <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">{p.seatNumber}</span></td>
                                                                    <td className="fw-semibold text-dark">{p.passengerName}</td>
                                                                    <td>{p.passengerAge}</td>
                                                                    <td><span className={`badge rounded-pill ${p.passengerGender === 'Male' ? 'bg-info-subtle text-info' : p.passengerGender === 'Female' ? 'bg-pink-subtle text-danger' : 'bg-secondary-subtle text-secondary'}`}>{p.passengerGender}</span></td>
                                                                    <td><a href={`tel:${p.contactPhone}`} className="text-decoration-none text-dark fw-semibold"><i className="bi bi-telephone-fill text-success me-1"></i>{p.contactPhone}</a></td>
                                                                    <td className="text-muted">{p.contactEmail}</td>
                                                                    <td><small className="font-monospace text-muted">{p.bookingRef}</small></td>
                                                                    <td className="fw-bold text-success">₹{p.amountPaid}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
