import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import {
    Clock,
    Loader,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    TrendingUp,
    PlusCircle,
    ArrowRight,
    ChevronUp,
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [statsData, complaints] = await Promise.all([
                complaintService.getStats(),
                complaintService.getAll(),
            ]);
            setStats(statsData);
            setRecentComplaints(complaints.slice(0, 5));
        } catch (err) {
            console.error('Failed to load dashboard:', err);
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
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className="loading-screen" style={{ minHeight: 'calc(100vh - 100px)' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    const statCards = [
        {
            icon: <AlertTriangle size={24} />,
            label: 'Total Complaints',
            value: stats?.total || 0,
            color: '#8b5cf6',
            bg: 'rgba(139, 92, 246, 0.12)',
        },
        {
            icon: <Clock size={24} />,
            label: 'Pending',
            value: stats?.pending || 0,
            color: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.12)',
        },
        {
            icon: <Loader size={24} />,
            label: 'In Progress',
            value: stats?.inProgress || 0,
            color: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.12)',
        },
        {
            icon: <CheckCircle2 size={24} />,
            label: 'Resolved',
            value: stats?.resolved || 0,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.12)',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <div className="dashboard">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Welcome Section */}
                <motion.div className="dashboard-welcome" variants={itemVariants}>
                    <div>
                        <h1 className="page-title">
                            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
                            <span className="text-gradient">{user?.name?.split(' ')[0] || 'User'}</span>
                        </h1>
                        <p className="page-subtitle">Here's an overview of your hostel complaints</p>
                    </div>
                    <Link to="/complaints/new" className="btn btn-primary">
                        <PlusCircle size={18} />
                        New Complaint
                    </Link>
                </motion.div>

                {/* Stats Grid */}
                <motion.div className="dashboard-stats" variants={itemVariants}>
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="stat-card"
                            style={{ '--card-accent': stat.color }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Recent Complaints */}
                <motion.div className="dashboard-section" variants={itemVariants}>
                    <div className="dashboard-section-header">
                        <div>
                            <h2 className="dashboard-section-title">Recent Complaints</h2>
                            <p className="dashboard-section-subtitle">Your latest filed complaints</p>
                        </div>
                        <Link to="/complaints" className="btn btn-ghost">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>

                    {recentComplaints.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="empty-state-title">No complaints yet</h3>
                            <p className="empty-state-text">
                                You haven't filed any complaints. Click the button above to create one.
                            </p>
                        </div>
                    ) : (
                        <div className="complaint-list">
                            {recentComplaints.map((complaint, idx) => (
                                <motion.div
                                    key={complaint.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link
                                        to={`/complaints/${complaint.id}`}
                                        className="complaint-list-item"
                                    >
                                        <div className="complaint-priority-dot" style={{ background: getPriorityColor(complaint.priority) }} />
                                        <div className="complaint-list-content">
                                            <div className="complaint-list-top">
                                                <span className="complaint-list-id">{complaint.id}</span>
                                                <span className={`badge ${getStatusBadge(complaint.status)}`}>{complaint.status}</span>
                                            </div>
                                            <h4 className="complaint-list-title">{complaint.title}</h4>
                                            <div className="complaint-list-meta">
                                                <span>{complaint.category}</span>
                                                <span>•</span>
                                                <span>{complaint.room}</span>
                                                <span>•</span>
                                                <span>{formatDate(complaint.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="complaint-list-upvotes">
                                            <ChevronUp size={14} />
                                            <span>{complaint.upvotes}</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Quick Stats Row */}
                <motion.div className="dashboard-quick-stats" variants={itemVariants}>
                    <div className="quick-stat-card">
                        <TrendingUp size={20} style={{ color: '#8b5cf6' }} />
                        <div>
                            <span className="quick-stat-value">
                                {stats ? Math.round((stats.resolved / Math.max(stats.total, 1)) * 100) : 0}%
                            </span>
                            <span className="quick-stat-label">Resolution Rate</span>
                        </div>
                    </div>
                    <div className="quick-stat-card">
                        <Clock size={20} style={{ color: '#f59e0b' }} />
                        <div>
                            <span className="quick-stat-value">~2.4 days</span>
                            <span className="quick-stat-label">Avg Response Time</span>
                        </div>
                    </div>
                    <div className="quick-stat-card">
                        <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                        <div>
                            <span className="quick-stat-value">{stats?.resolved || 0}</span>
                            <span className="quick-stat-label">Issues Fixed</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
