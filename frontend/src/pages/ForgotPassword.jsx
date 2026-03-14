import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await authService.forgotPassword(email);
            setSuccess(true);
            // In dev mode, we might see the link here
            console.log('Reset Response:', res);
        } catch (err) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background elements */}
            <div className="auth-bg">
                <div className="auth-bg-orb auth-bg-orb-1" />
                <div className="auth-bg-orb auth-bg-orb-2" />
                <div className="auth-bg-orb auth-bg-orb-3" />
                <div className="auth-bg-grid" />
            </div>

            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Brand */}
                <div className="auth-brand">
                    <motion.div
                        className="auth-logo"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <Mail size={28} />
                    </motion.div>
                    <h1 className="auth-title">Forgot Password?</h1>
                    <p className="auth-subtitle">Enter your email to receive a password reset link</p>
                </div>

                {success ? (
                    <div className="auth-form" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-success)' }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '1rem' }}>Email Sent!</h2>
                        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>We've sent a password reset link to <strong style={{color: 'var(--color-text)'}}>{email}</strong>.</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                            (Note: In development, the link is also logged to the browser console)
                        </p>
                        <button
                            className="btn btn-primary btn-lg auth-submit"
                            onClick={() => navigate('/login')}
                        >
                            Back to Sign In
                        </button>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                className="auth-error"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <AlertTriangle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Address</label>
                            <div className="form-input-icon">
                                <Mail size={18} className="icon" />
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg auth-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                            ) : (
                                <>
                                    Send Reset Link
                                </>
                            )}
                        </button>

                        <div className="auth-footer" style={{ marginTop: '2rem' }}>
                            <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
