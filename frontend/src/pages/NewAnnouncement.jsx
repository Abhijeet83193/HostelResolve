import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Image as ImageIcon, X, Sparkles, Megaphone } from 'lucide-react';
import { announcementService } from '../services/api';
import './NewAnnouncement.css';

export default function NewAnnouncement() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Notice'
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const categories = ['Notice', 'Update', 'Maintenance', 'New Feature', 'Removal', 'Other'];

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 3) {
            return alert('Maximum 3 images allowed');
        }

        setImages(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
        setPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return alert('Please fill in all fields');

        setLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('category', formData.category);
            images.forEach(img => data.append('images', img));

            await announcementService.create(data);
            navigate('/announcements');
        } catch (err) {
            alert(err.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-post-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="post-form-card"
            >
                <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', marginLeft: '-0.5rem' }}>
                    <ArrowLeft size={18} /> Back to Board
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div className="avatar" style={{ background: 'var(--color-accent)', color: 'white', width: 48, height: 48 }}>
                        <Megaphone size={24} />
                    </div>
                    <h1 className="post-form-title">Create New Post</h1>
                </div>
                <p className="post-form-subtitle">Broadcast your message to all hostel residents</p>

                <form onSubmit={handleSubmit} className="post-form">
                    <div className="post-form-group">
                        <label className="post-form-label">Post Title</label>
                        <input
                            type="text"
                            className="post-form-input"
                            placeholder="e.g., Water Tank Cleaning Schedule"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="post-form-row">
                        <div className="post-form-group">
                            <label className="post-form-label">Category</label>
                            <select
                                className="post-form-input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="post-form-group">
                        <label className="post-form-label">Message Details</label>
                        <textarea
                            className="post-form-input"
                            placeholder="Write your announcement here..."
                            rows="6"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>

                    <div className="post-form-group">
                        <label className="post-form-label">Media Attachments</label>
                        <input
                            type="file"
                            id="post-images"
                            multiple
                            accept="image/*"
                            className="hidden-input"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="post-images" className="post-image-upload-zone">
                            <ImageIcon size={32} />
                            <span className="post-image-upload-text">
                                {images.length > 0 ? `${images.length} Images Selected` : 'Click or drag images to upload'}
                            </span>
                            <span className="post-image-upload-hint">Upload up to 3 images (JPG, PNG)</span>
                        </label>

                        {previews.length > 0 && (
                            <div className="post-image-previews">
                                {previews.map((src, idx) => (
                                    <motion.div 
                                        key={idx} 
                                        className="post-preview-item"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                    >
                                        <img src={src} alt="Preview" />
                                        <button type="button" className="post-remove-img" onClick={() => removeImage(idx)}>
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary post-submit-btn" disabled={loading}>
                        {loading ? 'Publishing...' : (
                            <>
                                <Send size={20} />
                                Publish to Notice Board
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
