import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: 'center' }}
            >
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    background: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: '#ef4444',
                }}>
                    <AlertTriangle size={36} />
                </div>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '4rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #c084fc, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem',
                }}>
                    404
                </h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page Not Found</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: 400 }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                    <Home size={18} />
                    Back to Dashboard
                </Link>
            </motion.div>
        </div>
    );
}
