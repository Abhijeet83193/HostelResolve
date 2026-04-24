import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { complaintService, STATUSES } from '../services/api';
import {
    ArrowLeft,
    Clock,
    MapPin,
    Tag,
    AlertTriangle,
    ChevronUp,
    Send,
    User,
    Calendar,
    MessageSquare,
    Star,
    RefreshCcw,
} from 'lucide-react';
import './ComplaintDetail.css';

export default function ComplaintDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [commenting, setCommenting] = useState(false);
    const [upvoted, setUpvoted] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [resolvedFiles, setResolvedFiles] = useState([]);
    const [tempResolvedImages, setTempResolvedImages] = useState([]);

    useEffect(() => {
        loadComplaint();
    }, [id]);

    const loadComplaint = async () => {
        try {
            const data = await complaintService.getById(id);
            setComplaint(data);
        } catch (err) {
            console.error('Failed to load complaint:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async () => {
        if (upvoted) return;
        try {
            const response = await complaintService.upvote(id);
            setComplaint(prev => ({
                ...prev,
                upvotes: response.upvotes
            }));
            setUpvoted(true);
        } catch (err) {
            console.error('Upvote failed:', err);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === 'Resolved' && resolvedFiles.length === 0) {
            // If they haven't uploaded images yet, we might want to confirm or just proceed?
            // The requirement says "option aa jaye", so let's allow it but maybe warn if empty?
            // Actually, let's just use the current state.
        }

        try {
            setUpdatingStatus(true);
            
            const formData = new FormData();
            formData.append('status', newStatus);
            
            if (newStatus === 'Resolved') {
                resolvedFiles.forEach(file => {
                    formData.append('resolvedImages', file);
                });
            }

            const updated = await complaintService.update(id, formData);
            setComplaint(prev => ({ 
                ...prev, 
                status: updated.status,
                resolvedImages: updated.resolvedImages 
            }));
            
            if (newStatus === 'Resolved') {
                setResolvedFiles([]);
                setTempResolvedImages([]);
            }
            
            alert(`Status updated to ${newStatus}`);
        } catch (err) {
            console.error('Status update failed:', err);
            alert(err.message || 'Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleResolvedFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + resolvedFiles.length > 5) {
            return alert('You can upload up to 5 images only');
        }

        setResolvedFiles(prev => [...prev, ...files]);
        
        // For preview
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setTempResolvedImages(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setResolvedFiles(prev => prev.filter((_, i) => i !== index));
        setTempResolvedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this complaint?')) return;
        try {
            setLoading(true);
            await complaintService.delete(id);
            navigate('/complaints');
        } catch (err) {
            console.error('Delete failed:', err);
            setLoading(false);
            alert(err.message || 'Failed to delete complaint');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setCommenting(true);
        try {
            const newComment = await complaintService.addComment(id, comment.trim());
            setComplaint(prev => ({
                ...prev,
                comments: [...prev.comments, newComment],
            }));
            setComment('');
        } catch (err) {
            console.error('Comment failed:', err);
        } finally {
            setCommenting(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (feedbackRating === 0) return alert('Please select a rating');
        setSubmittingFeedback(true);
        try {
            const updated = await complaintService.submitFeedback(id, {
                rating: feedbackRating,
                comment: feedbackComment,
            });
            setComplaint(updated);
        } catch (err) {
            console.error('Feedback submission failed:', err);
            alert(err.message || 'Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const handleReopen = async () => {
        if (!window.confirm('Are you sure you want to re-open this complaint?')) return;
        try {
            setLoading(true);
            const updated = await complaintService.reopen(id);
            setComplaint(updated);
            alert('Complaint re-opened successfully');
        } catch (err) {
            console.error('Re-open failed:', err);
            alert(err.message || 'Failed to re-open complaint');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'Pending': 'badge-pending',
            'In Progress': 'badge-in-progress',
            'Resolved': 'badge-resolved',
            'Rejected': 'badge-rejected',
        };
        return map[status] || 'badge-pending';
    };

    const getPriorityColor = (priority) => {
        const map = {
            'Low': '#10b981',
            'Medium': '#f59e0b',
            'High': '#f97316',
            'Urgent': '#ef4444',
        };
        return map[priority] || '#a1a1aa';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2);
    };

    if (loading) {
        return (
            <div className="loading-screen" style={{ minHeight: 'calc(100vh - 100px)' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="empty-state" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <div className="empty-state-icon">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="empty-state-title">Complaint Not Found</h3>
                <p className="empty-state-text">The complaint you're looking for doesn't exist.</p>
                <button className="btn btn-primary" onClick={() => navigate('/complaints')} style={{ marginTop: '1rem' }}>
                    Back to Complaints
                </button>
            </div>
        );
    }

    return (
        <div className="complaint-detail">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Back */}
                <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="detail-layout">
                    {/* Main Content */}
                    <div className="detail-main">
                        {/* Header */}
                        <div className="detail-header">
                            <div className="detail-header-top">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span className="detail-id">{complaint.id}</span>
                                    <span className={`badge ${getStatusBadge(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                </div>
                                <div className="detail-actions">
                                    {(user._id === complaint.createdBy?._id || user.id === complaint.createdBy?.id) && complaint.status === 'Pending' && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => navigate(`/complaints/${id}/edit`)}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {(user.role === 'warden' || (user._id === complaint.createdBy?._id && complaint.status === 'Pending')) && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={handleDelete}
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h1 className="detail-title">{complaint.title}</h1>
                            <div className="detail-meta">
                                <span className="detail-meta-item">
                                    <Calendar size={14} />
                                    {formatDate(complaint.createdAt)}
                                </span>
                                <span className="detail-meta-item">
                                    <User size={14} />
                                    {complaint.createdBy?.name}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="detail-section">
                            <h3 className="detail-section-title">Description</h3>
                            <p className="detail-description">{complaint.description}</p>
                        </div>

                        {/* Feedback Section (only if Resolved) */}
                        {complaint.status === 'Resolved' && (complaint.feedback?.rating || ((user._id === complaint.createdBy?._id || user.id === complaint.createdBy?.id) && user.role === 'student')) && (
                            <div className="detail-section detail-feedback-section">
                                <h3 className="detail-section-title">
                                    <Star size={18} />
                                    {complaint.feedback?.rating ? 'Resolution Feedback' : 'How was the resolution?'}
                                </h3>

                                {complaint.feedback?.rating ? (
                                    <div className="feedback-display">
                                        <div className="feedback-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={20}
                                                    fill={i < complaint.feedback.rating ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                        {complaint.feedback.comment && (
                                            <p className="feedback-comment">"{complaint.feedback.comment}"</p>
                                        )}
                                        <div className="reopen-prompt">
                                            <span className="reopen-text">Still not satisfied?</span>
                                            {(user._id === complaint.createdBy?._id || user.id === complaint.createdBy?.id) && (
                                                <button className="btn btn-ghost btn-sm" onClick={handleReopen}>
                                                    <RefreshCcw size={14} /> Re-open Complaint
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFeedbackSubmit}>
                                        <div className="rating-input">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    className={`star-btn ${feedbackRating >= num ? 'active' : ''}`}
                                                    onClick={() => setFeedbackRating(num)}
                                                >
                                                    <Star
                                                        size={24}
                                                        fill={feedbackRating >= num ? 'currentColor' : 'none'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="form-group">
                                            <textarea
                                                className="form-input"
                                                placeholder="Add a comment about the resolution (optional)..."
                                                value={feedbackComment}
                                                onChange={(e) => setFeedbackComment(e.target.value)}
                                                rows="2"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={feedbackRating === 0 || submittingFeedback}
                                            >
                                                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                                            </button>
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={handleReopen}>
                                                <RefreshCcw size={14} /> Re-open Instead
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Attachments (Before & After) */}
                        <div className="detail-images-container">
                            {complaint.images && complaint.images.length > 0 && (
                                <div className="detail-section">
                                    <h3 className="detail-section-title">Before Work ({complaint.images.length})</h3>
                                    <div className="detail-images-gallery">
                                        {complaint.images.map((img, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="detail-gallery-item"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => window.open(img, '_blank')}
                                            >
                                                <img src={img} alt={`Before ${idx + 1}`} loading="lazy" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {complaint.resolvedImages && complaint.resolvedImages.length > 0 && (
                                <div className="detail-section after-resolution">
                                    <h3 className="detail-section-title">After Work - Proof ({complaint.resolvedImages.length})</h3>
                                    <div className="detail-images-gallery-resolved">
                                        {complaint.resolvedImages.map((img, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="detail-gallery-item resolved-item"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => window.open(img, '_blank')}
                                            >
                                                <img src={img} alt={`After ${idx + 1}`} loading="lazy" />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Comments / Timeline */}
                        <div className="detail-section">
                            <h3 className="detail-section-title">
                                <MessageSquare size={18} />
                                Comments ({complaint.comments.length})
                            </h3>

                            {complaint.comments.length === 0 ? (
                                <p className="detail-no-comments">No comments yet. Be the first to respond.</p>
                            ) : (
                                <div className="detail-comments">
                                    {complaint.comments.map((c, idx) => (
                                        <motion.div
                                            key={c.id}
                                            className="detail-comment"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <div className="avatar avatar-sm">
                                                {getInitials(c.user?.name)}
                                            </div>
                                            <div className="detail-comment-content">
                                                <div className="detail-comment-header">
                                                    <span className="detail-comment-name">{c.user?.name}</span>
                                                    {c.user?.role === 'warden' && (
                                                        <span className="detail-comment-role">Warden</span>
                                                    )}
                                                    <span className="detail-comment-time">{formatDate(c.createdAt)}</span>
                                                </div>
                                                <p className="detail-comment-text">{c.text}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Add Comment */}
                            <form className="detail-comment-form" onSubmit={handleComment}>
                                <div className="avatar avatar-sm">
                                    {getInitials(user?.name)}
                                </div>
                                <div className="detail-comment-input-wrap">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Add a comment..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-sm"
                                        disabled={!comment.trim() || commenting}
                                    >
                                        {commenting ? (
                                            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                        ) : (
                                            <Send size={14} />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="detail-sidebar">
                        {/* Warden Controls: Status Management */}
                        {user.role === 'warden' && (
                            <div className="detail-sidebar-card">
                                <h4 className="detail-sidebar-title">Status Management</h4>
                                <div className="detail-info-grid">
                                    <div className="form-group">
                                        <label className="form-label">Update Status</label>
                                        <select
                                            className="form-select"
                                            value={complaint.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            disabled={updatingStatus}
                                        >
                                            {STATUSES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {complaint.status !== 'Resolved' && (
                                        <div className="resolved-proof-upload">
                                            <label className="form-label">Resolution Proof (Optional)</label>
                                            <p className="field-hint">Upload images to show completed work</p>
                                            <input
                                                type="file"
                                                id="resolved-images"
                                                multiple
                                                accept="image/*"
                                                className="hidden-input"
                                                onChange={handleResolvedFileChange}
                                            />
                                            <label htmlFor="resolved-images" className="upload-btn-outline">
                                                <Send size={14} /> Select Images
                                            </label>

                                            {tempResolvedImages.length > 0 && (
                                                <div className="temp-previews">
                                                    {tempResolvedImages.map((src, i) => (
                                                        <div key={i} className="temp-preview-item">
                                                            <img src={src} alt="Preview" />
                                                            <button 
                                                                className="remove-temp-img"
                                                                onClick={() => removeFile(i)}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button 
                                                className="btn btn-primary btn-block" 
                                                style={{ marginTop: '1rem' }}
                                                onClick={() => handleStatusChange('Resolved')}
                                                disabled={updatingStatus}
                                            >
                                                {updatingStatus ? 'Updating...' : 'Mark as Resolved'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Upvote */}
                        <div className="detail-sidebar-card">
                            <button
                                className={`detail-upvote-btn ${upvoted ? 'upvoted' : ''}`}
                                onClick={handleUpvote}
                            >
                                <ChevronUp size={22} />
                                <span className="detail-upvote-count">{complaint.upvotes}</span>
                                <span className="detail-upvote-label">Upvotes</span>
                            </button>
                        </div>

                        {/* Info */}
                        <div className="detail-sidebar-card">
                            <h4 className="detail-sidebar-title">Details</h4>
                            <div className="detail-info-grid">
                                <div className="detail-info-item">
                                    <span className="detail-info-label">
                                        <Tag size={14} /> Category
                                    </span>
                                    <span className="detail-info-value">{complaint.category}</span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">
                                        <AlertTriangle size={14} /> Priority
                                    </span>
                                    <span
                                        className="detail-info-value"
                                        style={{ color: getPriorityColor(complaint.priority) }}
                                    >
                                        {complaint.priority}
                                    </span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">
                                        <MapPin size={14} /> Location
                                    </span>
                                    <span className="detail-info-value">
                                        {complaint.hostel} — {complaint.room}
                                    </span>
                                </div>
                                <div className="detail-info-item">
                                    <span className="detail-info-label">
                                        <Clock size={14} /> Last Updated
                                    </span>
                                    <span className="detail-info-value">{formatDate(complaint.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Assigned To */}
                        {complaint.assignedTo && (
                            <div className="detail-sidebar-card">
                                <h4 className="detail-sidebar-title">Assigned To</h4>
                                <div className="detail-assignee">
                                    <div className="avatar avatar-sm">{getInitials(complaint.assignedTo.name)}</div>
                                    <span>{complaint.assignedTo.name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
