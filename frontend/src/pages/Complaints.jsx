import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { complaintService, CATEGORIES, PRIORITIES, STATUSES } from '../services/api';
import {
    Search,
    Filter,
    PlusCircle,
    ChevronUp,
    SlidersHorizontal,
    X,
    AlertTriangle,
} from 'lucide-react';
import './Complaints.css';

export default function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        category: 'all',
        priority: 'all',
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadComplaints();
    }, [filters]);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            const data = await complaintService.getAll(filters);
            setComplaints(data);
        } catch (err) {
            console.error('Failed to load complaints:', err);
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
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all' && v !== '').length;

    const clearFilters = () => {
        setFilters({ search: '', status: 'all', category: 'all', priority: 'all' });
    };

    return (
        <div className="complaints-page">
            {/* Header */}
            <div className="complaints-header">
                <div>
                    <h1 className="page-title">Complaints</h1>
                    <p className="page-subtitle">Track and manage all your hostel complaints</p>
                </div>
                <Link to="/complaints/new" className="btn btn-primary">
                    <PlusCircle size={18} />
                    New Complaint
                </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="complaints-toolbar">
                <div className="complaints-search">
                    <Search size={18} className="complaints-search-icon" />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search complaints by title, ID, or description..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>
                <button
                    className={`btn btn-secondary complaints-filter-toggle ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <SlidersHorizontal size={16} />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="filter-count">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        className="complaints-filters"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="complaints-filters-inner">
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="all">All Statuses</option>
                                    {STATUSES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={filters.category}
                                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    <option value="all">All Categories</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select
                                    className="form-select"
                                    value={filters.priority}
                                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                                >
                                    <option value="all">All Priorities</option>
                                    {PRIORITIES.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {activeFilterCount > 0 && (
                                <button className="btn btn-ghost clear-filters" onClick={clearFilters}>
                                    <X size={14} />
                                    Clear
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Count */}
            <div className="complaints-count">
                <span>{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found</span>
            </div>

            {/* Complaints List */}
            {loading ? (
                <div className="complaints-loading">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton complaint-skeleton" />
                    ))}
                </div>
            ) : complaints.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="empty-state-title">No complaints found</h3>
                    <p className="empty-state-text">
                        {activeFilterCount > 0
                            ? 'Try adjusting your filters to see more results.'
                            : "You haven't filed any complaints yet."}
                    </p>
                    {activeFilterCount > 0 && (
                        <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="complaints-grid">
                    {complaints.map((complaint, idx) => (
                        <motion.div
                            key={complaint.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                        >
                            <Link to={`/complaints/${complaint.id}`} className="complaint-card">
                                <div className="complaint-card-header">
                                    <div className="complaint-card-id">{complaint.id}</div>
                                    <span className={`badge ${getStatusBadge(complaint.status)}`}>
                                        {complaint.status}
                                    </span>
                                </div>

                                {complaint.images && complaint.images.length > 0 && (
                                    <div className="complaint-card-image">
                                        <img src={complaint.images[0]} alt={complaint.title} loading="lazy" />
                                        {complaint.images.length > 1 && (
                                            <div className="complaint-image-count">
                                                +{complaint.images.length - 1} more
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="complaint-card-content">
                                    <h3 className="complaint-card-title">{complaint.title}</h3>
                                    <p className="complaint-card-desc">{complaint.description}</p>

                                    <div className="complaint-card-tags">
                                        <span className="complaint-tag">{complaint.category}</span>
                                        <span
                                            className="complaint-tag complaint-tag-priority"
                                            style={{
                                                color: getPriorityColor(complaint.priority),
                                                borderColor: getPriorityColor(complaint.priority),
                                                background: `${getPriorityColor(complaint.priority)}15`,
                                            }}
                                        >
                                            {complaint.priority}
                                        </span>
                                    </div>
                                </div>

                                <div className="complaint-card-footer">
                                    <div className="complaint-card-meta">
                                        <span>{complaint.room}</span>
                                        <span>•</span>
                                        <span>{formatDate(complaint.createdAt)}</span>
                                    </div>
                                    <div className="complaint-card-upvotes">
                                        <ChevronUp size={14} />
                                        {complaint.upvotes}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
