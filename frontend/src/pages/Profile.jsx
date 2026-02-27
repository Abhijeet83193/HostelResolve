import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService, HOSTELS } from '../services/api';
import {
    User,
    Mail,
    Phone,
    Building,
    MapPin,
    Save,
    Shield,
    Edit3,
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        hostel: user?.hostel || '',
        room: user?.room || '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await authService.updateProfile(formData);
            updateUser(updated);
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to update profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2);
    };

    return (
        <div className="profile-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="page-header">
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Manage your account information</p>
                </div>

                <div className="profile-layout">
                    {/* Profile Card */}
                    <div className="profile-card">
                        <div className="profile-card-bg" />
                        <div className="profile-card-content">
                            <div className="avatar avatar-xl">
                                {getInitials(user?.name)}
                            </div>
                            <h2 className="profile-name">{user?.name}</h2>
                            <p className="profile-email">{user?.email}</p>
                            <div className="profile-role-badge">
                                <Shield size={14} />
                                {user?.role === 'warden' ? 'Warden' : 'Student'}
                            </div>
                            <div className="profile-quick-info">
                                <div className="profile-quick-item">
                                    <Building size={16} />
                                    <span>{user?.hostel || 'Not set'}</span>
                                </div>
                                <div className="profile-quick-item">
                                    <MapPin size={16} />
                                    <span>Room {user?.room || 'Not set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="profile-form-section">
                        <div className="profile-form-header">
                            <h3>Personal Information</h3>
                            {!editing ? (
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                                    <Edit3 size={14} />
                                    Edit
                                </button>
                            ) : (
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                                    Cancel
                                </button>
                            )}
                        </div>

                        {saved && (
                            <motion.div
                                className="profile-saved"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                ✓ Profile updated successfully!
                            </motion.div>
                        )}

                        <form className="profile-form" onSubmit={handleSave}>
                            <div className="profile-form-grid">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="p-name">
                                        <User size={14} /> Full Name
                                    </label>
                                    {editing ? (
                                        <input
                                            id="p-name"
                                            name="name"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p className="profile-field-value">{user?.name}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="p-email">
                                        <Mail size={14} /> Email
                                    </label>
                                    {editing ? (
                                        <input
                                            id="p-email"
                                            name="email"
                                            type="email"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p className="profile-field-value">{user?.email}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="p-phone">
                                        <Phone size={14} /> Phone
                                    </label>
                                    {editing ? (
                                        <input
                                            id="p-phone"
                                            name="phone"
                                            type="tel"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p className="profile-field-value">{user?.phone || 'Not provided'}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="p-hostel">
                                        <Building size={14} /> Hostel
                                    </label>
                                    {editing ? (
                                        <select
                                            id="p-hostel"
                                            name="hostel"
                                            className="form-select"
                                            value={formData.hostel}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Hostel</option>
                                            {HOSTELS.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="profile-field-value">{user?.hostel || 'Not set'}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="p-room">
                                        <MapPin size={14} /> Room
                                    </label>
                                    {editing ? (
                                        <input
                                            id="p-room"
                                            name="room"
                                            className="form-input"
                                            value={formData.room}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p className="profile-field-value">{user?.room || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            {editing && (
                                <motion.div
                                    className="profile-form-actions"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? (
                                            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
