import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profileForm, setProfileForm] = useState({
        fullName: user?.username || '',
        phone: user?.phone || ''
    });
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const showMsg = (msg, isError = false) => {
        if (isError) setError(msg);
        else setMessage(msg);
        setTimeout(() => { setMessage(''); setError(''); }, 4000);
    };

    const [isEditing, setIsEditing] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        if (!profileForm.fullName.trim()) { showMsg('Full name cannot be empty.', true); return; }
        if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone)) {
            showMsg('Enter a valid 10-digit phone number.', true); return;
        }
        setLoading(true);
        try {
            const res = await api.put('/auth/update-profile', {
                userId: user.userId,
                fullName: profileForm.fullName,
                phone: profileForm.phone
            });
            // Update the stored auth info so navbar reflects new name
            login(res.data);
            showMsg('✅ Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to update profile. Please try again.', true);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(''); setMessage('');
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { showMsg('New passwords do not match.', true); return; }
        if (passwordForm.newPassword.length < 8) { showMsg('Password must be at least 8 characters.', true); return; }
        if (passwordForm.newPassword === passwordForm.oldPassword) { showMsg('New password cannot be the same as old.', true); return; }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                email: user.email,
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });
            showMsg('✅ Password changed successfully!');
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to change password.', true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h3 className="fw-bold mb-1 text-white">Profile Settings</h3>
                    <p className="text-white-50 small mb-0">Update your personal info and password</p>
                </div>
            </div>

            <div className="container py-4">
                <div className="row gap-4">
                    {/* Sidebar */}
                    <div className="col-lg-3">
                        <div className="sw-card p-4 text-center mb-3">
                            <div className="mx-auto mb-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                                <i className="bi bi-person-gear fs-3 text-primary"></i>
                            </div>
                            <h5 className="fw-bold text-primary mb-1">{user?.username}</h5>
                            <p className="text-muted small mb-1">{user?.email}</p>
                            {user?.phone && <p className="text-muted small mb-3"><i className="bi bi-telephone me-1"></i>{user.phone}</p>}
                            <span className="badge rounded-pill bg-light border px-3 py-2" style={{ color: '#0B3C5D' }}>
                                {user?.role === 'ROLE_ADMIN' ? '🛡️ Administrator' : '🎫 Passenger'}
                            </span>
                            <div className="mt-3">
                                <button onClick={() => navigate('/dashboard')} className="btn btn-sm btn-outline-secondary w-100 rounded-pill">
                                    <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-8">
                        {message && <div className="alert alert-success rounded-3 mb-3">{message}</div>}
                        {error && <div className="alert alert-danger rounded-3 mb-3">{error}</div>}

                        <div className="row g-4">
                            {/* Editable Personal Info */}
                            <div className="col-12">
                                <div className="sw-card p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0" style={{ color: '#0B3C5D' }}>
                                            <i className="bi bi-person-lines-fill me-2"></i>Personal Details
                                        </h5>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                                <i className="bi bi-pencil-square me-1"></i>Edit Profile
                                            </button>
                                        )}
                                    </div>
                                    <form onSubmit={handleProfileUpdate}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small text-muted">Full Name</label>
                                                {isEditing ? (
                                                    <input className="sw-input" placeholder="Your full name"
                                                        value={profileForm.fullName}
                                                        onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} />
                                                ) : (
                                                    <div className="sw-input d-flex align-items-center gap-2 text-dark bg-light border-0">
                                                        <span>{profileForm.fullName || 'Not provided'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small text-muted">Email Address</label>
                                                <div className="sw-input d-flex align-items-center gap-2 text-muted bg-light border-0">
                                                    <i className="bi bi-envelope"></i>
                                                    <span>{user?.email}</span>
                                                </div>
                                                {isEditing && <small className="text-muted">Email cannot be changed</small>}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small text-muted">Phone Number</label>
                                                {isEditing ? (
                                                    <input className="sw-input" placeholder="10-digit mobile number" maxLength={10}
                                                        value={profileForm.phone}
                                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                                                ) : (
                                                    <div className="sw-input d-flex align-items-center gap-2 text-dark bg-light border-0">
                                                        <span>{profileForm.phone || 'Not provided'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold small text-muted">Account Role</label>
                                                <div className="sw-input d-flex align-items-center gap-2 text-muted bg-light border-0">
                                                    <i className="bi bi-shield"></i>
                                                    <span>{user?.role === 'ROLE_ADMIN' ? 'System Administrator' : 'Passenger'}</span>
                                                </div>
                                            </div>
                                            {isEditing && (
                                                <div className="col-12 text-end mt-4">
                                                    <button type="button" className="btn btn-light me-2" onClick={() => {
                                                        setIsEditing(false);
                                                        setProfileForm({ fullName: user?.username || '', phone: user?.phone || '' });
                                                    }}>Cancel</button>
                                                    <button type="submit" className="btn-sw-orange border-none" disabled={loading}>
                                                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-check-circle me-2"></i>Save Changes</>}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Change Password */}
                            <div className="col-12">
                                <div className="sw-card p-4">
                                    <h5 className="fw-bold mb-4" style={{ color: '#0B3C5D' }}>
                                        <i className="bi bi-shield-lock-fill me-2"></i>Change Password
                                    </h5>
                                    <form onSubmit={handlePasswordChange}>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold small text-muted">Current Password</label>
                                                <input type="password" className="sw-input" placeholder="Current password"
                                                    value={passwordForm.oldPassword} required
                                                    onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold small text-muted">New Password</label>
                                                <input type="password" className="sw-input" placeholder="Min. 8 characters"
                                                    value={passwordForm.newPassword} required
                                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold small text-muted">Confirm New Password</label>
                                                <input type="password" className="sw-input" placeholder="Re-enter password"
                                                    value={passwordForm.confirmPassword} required
                                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                                            </div>
                                            <div className="col-12 text-end">
                                                <button type="submit" className="btn-sw-orange border-none" disabled={loading}>
                                                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</> : <><i className="bi bi-lock-fill me-2"></i>Update Password</>}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
