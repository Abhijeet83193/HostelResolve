import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
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
            const updated = await complaintService.upvote(id);
            setComplaint(updated);
            setUpvoted(true);
        } catch (err) {
            console.error('Upvote failed:', err);
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
                                <span className="detail-id">{complaint.id}</span>
                                <span className={`badge ${getStatusBadge(complaint.status)}`}>
                                    {complaint.status}
                                </span>
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
