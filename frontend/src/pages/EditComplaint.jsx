import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { complaintService, CATEGORIES, PRIORITIES, HOSTELS } from '../services/api';
import {
    ArrowLeft,
    Save,
    AlertTriangle,
    CheckCircle2,
    Upload,
    X,
} from 'lucide-react';
import './NewComplaint.css'; // Reuse styling

export default function EditComplaint() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        hostel: '',
        room: '',
    });

    const [existingImages, setExistingImages] = useState([]); // Images already on server
    const [newImages, setNewImages] = useState([]); // New files to upload
    const [newPreviews, setNewPreviews] = useState([]); // Previews for new files

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadComplaint();
    }, [id]);

    const loadComplaint = async () => {
        try {
            const data = await complaintService.getById(id);

            // Security check: Only creator can edit if pending
            if (data.createdBy?._id !== user._id && data.createdBy?.id !== user.id) {
                navigate('/dashboard');
                return;
            }
            if (data.status !== 'Pending') {
                navigate(`/complaints/${id}`);
                return;
            }

            setFormData({
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                hostel: data.hostel,
                room: data.room,
            });
            setExistingImages(data.images || []);
        } catch (err) {
            console.error('Failed to load complaint:', err);
            setError('Failed to load complaint data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || e.dataTransfer?.files || []);
        if (files.length + newImages.length + existingImages.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setError('');
        const validFiles = files.filter(file => {
            const isValid = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
            const isSmall = file.size <= 5 * 1024 * 1024;
            return isValid && isSmall;
        });

        if (validFiles.length !== files.length) {
            setError('Please upload only JPG/PNG files under 5MB');
        }

        setNewImages(prev => [...prev, ...validFiles]);
        const previews = validFiles.map(file => URL.createObjectURL(file));
        setNewPreviews(prev => [...prev, ...previews]);
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, description, category, hostel, room, priority } = formData;

        if (!title || !description || !category || !hostel || !room) {
            setError('Please fill in all required fields');
            return;
        }

        const data = new FormData();
        data.append('title', title);
        data.append('description', description);
        data.append('category', category);
        data.append('priority', priority);
        data.append('hostel', hostel);
        data.append('room', room);

        // Send existing images that we want to keep
        existingImages.forEach(img => {
            data.append('existingImages', img);
        });

        // Send new images to upload
        newImages.forEach(image => {
            data.append('images', image);
        });

        setError('');
        setSubmitting(true);
        try {
            await complaintService.update(id, data);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/complaints/${id}`);
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to update complaint');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen" style={{ minHeight: 'calc(100vh - 100px)' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="new-complaint-success">
                <motion.div
                    className="success-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    <div className="success-icon">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2>Changes Saved!</h2>
                    <p>Your complaint has been updated successfully.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="new-complaint">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="new-complaint-header">
                    <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <div>
                        <h1 className="page-title">Edit Complaint</h1>
                        <p className="page-subtitle">Update the details of your complaint</p>
                    </div>
                </div>

                {/* Form */}
                <div className="new-complaint-form-wrapper">
                    <form className="new-complaint-form" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                className="auth-error"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ marginBottom: '1rem' }}
                            >
                                <AlertTriangle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="title">Complaint Title *</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                rows={8}
                                required
                            />
                        </div>

                        <div className="new-complaint-grid">
                            <div className="form-group">
                                <label className="form-label" htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="priority">Priority</label>
                                <select
                                    id="priority"
                                    name="priority"
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    {PRIORITIES.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="nc-hostel">Hostel *</label>
                                <select
                                    id="nc-hostel"
                                    name="hostel"
                                    className="form-select"
                                    value={formData.hostel}
                                    onChange={handleChange}
                                    required
                                >
                                    {HOSTELS.map(h => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="nc-room">Room / Location *</label>
                                <input
                                    id="nc-room"
                                    name="room"
                                    type="text"
                                    className="form-input"
                                    value={formData.room}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Image Management */}
                        <div className="form-group">
                            <label className="form-label">Attachments</label>

                            {/* Existing & New Combined Previews */}
                            <div className="preview-grid" style={{ marginBottom: '1rem' }}>
                                <AnimatePresence>
                                    {/* Existing Images */}
                                    {existingImages.map((url, idx) => (
                                        <motion.div
                                            key={`existing-${idx}`}
                                            className="preview-item"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            <img src={url} alt="Existing" />
                                            <button
                                                type="button"
                                                className="remove-img"
                                                onClick={() => removeExistingImage(idx)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}

                                    {/* New File Previews */}
                                    {newPreviews.map((url, idx) => (
                                        <motion.div
                                            key={`new-${idx}`}
                                            className="preview-item"
                                            style={{ border: '2px dashed var(--color-accent)' }}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            <img src={url} alt="New" />
                                            <button
                                                type="button"
                                                className="remove-img"
                                                onClick={() => removeNewImage(idx)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                accept="image/*"
                                style={{ display: 'none' }}
                            />

                            {existingImages.length + newImages.length < 5 && (
                                <div
                                    className="upload-zone"
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        handleFileChange({ target: { files: e.dataTransfer.files } });
                                    }}
                                >
                                    <Upload size={24} />
                                    <p>Add more photos</p>
                                    <span>JPG, PNG up to 5MB (Max 5 total)</span>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="new-complaint-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
