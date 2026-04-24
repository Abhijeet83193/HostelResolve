import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Megaphone, Trash2, Calendar, Tag, Info, AlertCircle, Sparkles, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/api';
import './Announcements.css';

export default function Announcements() {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const categories = ['All', 'Update', 'Maintenance', 'New Feature', 'Removal', 'Notice'];

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const data = await announcementService.getAll();
            setAnnouncements(data);
        } catch (err) {
            console.error('Failed to load announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await announcementService.delete(id);
            setAnnouncements(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            alert('Failed to delete announcement');
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Maintenance': return <AlertCircle size={16} />;
            case 'New Feature': return <Sparkles size={16} />;
            case 'Notice': return <Info size={16} />;
            default: return <Tag size={16} />;
        }
    };

    const filteredAnnouncements = filter === 'All' 
        ? announcements 
        : announcements.filter(a => a.category === filter);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    return (
        <div className="announcements-page">
            <motion.div 
                className="page-header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <div>
                    <h1 className="page-title">Notice Board</h1>
                    <p className="page-subtitle">Stay updated with the latest hostel news and updates</p>
                </div>
                {user.role === 'warden' && (
                    <Link to="/announcements/new" className="btn btn-primary">
                        <Plus size={20} />
                        New Post
                    </Link>
                )}
            </motion.div>

            <motion.div 
                className="announcements-filters"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-chip ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </motion.div>

            {filteredAnnouncements.length === 0 ? (
                <div className="empty-state">
                    <Megaphone size={48} className="empty-icon" />
                    <h3>No announcements found</h3>
                    <p>Check back later for updates from the warden.</p>
                </div>
            ) : (
                <div className="announcements-grid">
                    <AnimatePresence>
                        {filteredAnnouncements.map((a, idx) => (
                            <motion.div
                                key={a._id}
                                className="announcement-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="announcement-card-header">
                                    <div className={`announcement-category cat-${a.category.toLowerCase().replace(' ', '-')}`}>
                                        {getCategoryIcon(a.category)}
                                        {a.category}
                                    </div>
                                    <div className="announcement-date">
                                        <Calendar size={14} />
                                        {new Date(a.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </div>
                                </div>
                                <h3 className="announcement-card-title">{a.title}</h3>
                                <p className="announcement-card-content">{a.content}</p>
                                
                                {a.images && a.images.length > 0 && (
                                    <div className="announcement-images">
                                        {a.images.map((img, i) => (
                                            <img key={i} src={img} alt="Post" onClick={() => window.open(img, '_blank')} />
                                        ))}
                                    </div>
                                )}

                                <div className="announcement-footer">
                                    <span className="announcement-author">Posted by {a.createdBy?.name || 'Warden'}</span>
                                    {user.role === 'warden' && (
                                        <button 
                                            className="btn-icon delete-btn" 
                                            onClick={() => handleDelete(a._id)}
                                            title="Delete Post"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
