import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/api';
import './Auth.css';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError('Please fill in both password fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Invalid or expired reset token');
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
                        <Lock size={28} />
                    </motion.div>
                    <h1 className="auth-title">Reset Password</h1>
                    <p className="auth-subtitle">Enter your new password below</p>
                </div>

                {success ? (
                    <div className="auth-form" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-success)' }}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '1rem' }}>Password Updated!</h2>
                        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>Your password has been reset successfully. You can now sign in with your new credentials.</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Redirecting to login in 3 seconds...</p>
                        <button
                            className="btn btn-primary btn-lg auth-submit"
                            onClick={() => navigate('/login')}
                        >
                            Sign In Now
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
                            <label className="form-label" htmlFor="password">New Password</label>
                            <div className="form-input-icon">
                                <Lock size={18} className="icon" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                            <div className="form-input-icon">
                                <Lock size={18} className="icon" />
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    Set New Password
                                </>
                            )}
                        </button>

                        <div className="auth-footer" style={{ marginTop: '2rem' }}>
                            <Link to="/login" className="auth-link">Back to Sign In</Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
