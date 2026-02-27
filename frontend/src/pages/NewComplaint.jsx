import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { complaintService, CATEGORIES, PRIORITIES, HOSTELS } from '../services/api';
import {
    ArrowLeft,
    Send,
    AlertTriangle,
    Upload,
    X,
    CheckCircle2,
    Image as ImageIcon,
} from 'lucide-react';
import './NewComplaint.css';

export default function NewComplaint() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'Medium',
        hostel: user?.hostel || '',
        room: user?.room || '',
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || e.dataTransfer?.files || []);
        if (files.length + images.length > 5) {
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

        setImages(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
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
        if (title.length < 5) {
            setError('Title must be at least 5 characters');
            return;
        }
        if (description.length < 20) {
            setError('Description must be at least 20 characters');
            return;
        }

        const data = new FormData();
        data.append('title', title);
        data.append('description', description);
        data.append('category', category);
        data.append('priority', priority);
        data.append('hostel', hostel);
        data.append('room', room);

        images.forEach(image => {
            data.append('images', image);
        });

        setError('');
        setLoading(true);
        try {
            const newComplaint = await complaintService.create(data);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/complaints/${newComplaint._id || newComplaint.id}`);
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

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
                    <h2>Complaint Submitted!</h2>
                    <p>Your complaint has been registered successfully. You'll be redirected shortly.</p>
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
                        <h1 className="page-title">File a Complaint</h1>
                        <p className="page-subtitle">Describe the issue you're facing in your hostel</p>
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
                                placeholder="Brief summary of the issue (e.g., Water leakage in bathroom)"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={100}
                            />
                            <span className="form-hint">{formData.title.length}/100 characters</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-textarea"
                                placeholder="Provide detailed description of the problem. Include location specifics, when it started, and its impact..."
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                            />
                            <span className="form-hint">Minimum 20 characters</span>
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
                                >
                                    <option value="">Select Category</option>
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
                                >
                                    <option value="">Select Hostel</option>
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
                                    placeholder="e.g., A-204 or Common Room - 3F"
                                    value={formData.room}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Attachments (Optional)</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div
                                className={`upload-zone ${images.length > 0 ? 'has-files' : ''}`}
                                onClick={() => fileInputRef.current.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    handleFileChange({ target: { files: e.dataTransfer.files } });
                                }}
                            >
                                <Upload size={24} />
                                <p>Drag & drop images or click to browse</p>
                                <span>JPG, PNG up to 5MB each (Max 5)</span>
                            </div>

                            {previews.length > 0 && (
                                <div className="preview-grid">
                                    <AnimatePresence>
                                        {previews.map((url, idx) => (
                                            <motion.div
                                                key={url}
                                                className="preview-item"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                            >
                                                <img src={url} alt={`Preview ${idx + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-img"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage(idx);
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
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
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Complaint
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Tips */}
                    <div className="new-complaint-tips">
                        <h4>Tips for a Good Complaint</h4>
                        <ul>
                            <li>
                                <strong>Be specific</strong> — Include the exact location and time when the issue was noticed.
                            </li>
                            <li>
                                <strong>Describe the impact</strong> — Explain how it affects you or other students.
                            </li>
                            <li>
                                <strong>Attach photos</strong> — Visual evidence helps resolve issues faster.
                            </li>
                            <li>
                                <strong>Choose correct priority</strong> — Use "Urgent" only for safety hazards or emergencies.
                            </li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
