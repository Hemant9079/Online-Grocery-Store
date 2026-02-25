import { useState, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const strength = (() => {
        if (newPassword.length === 0) return 0;
        let s = 0;
        if (newPassword.length >= 6) s++;
        if (newPassword.length >= 10) s++;
        if (/[A-Z]/.test(newPassword)) s++;
        if (/[0-9]/.test(newPassword)) s++;
        if (/[^A-Za-z0-9]/.test(newPassword)) s++;
        return s;
    })();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
    const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#16a34a', '#15803d'][strength];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setStatus('error'); setMessage('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setStatus('error'); setMessage('Password must be at least 6 characters.'); return; }
        setStatus('loading');
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            if (res.ok) { setStatus('success'); setMessage(data.message || 'Password reset successfully!'); setTimeout(() => navigate('/login'), 3000); }
            else { setStatus('error'); setMessage(data.message || 'Failed to reset password.'); }
        } catch { setStatus('error'); setMessage('Network error. Please try again.'); }
    };

    const EyeOn = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
        </svg>
    );
    const EyeOff = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

    if (!token) return (
        <div className="rp-page">
            <div className="rp-card">
                <div className="rp-icon rp-icon--red">âœ•</div>
                <h1 className="rp-title">Invalid Link</h1>
                <p className="rp-sub">This reset link is missing or invalid. Please request a new one.</p>
                <Link to="/login" className="rp-btn">Back to Login</Link>
            </div>
        </div>
    );

    if (status === 'success') return (
        <div className="rp-page">
            <div className="rp-card">
                <div className="rp-icon rp-icon--green"></div>
                <h1 className="rp-title">Password Updated!</h1>
                <p className="rp-sub">{message}</p>
                <p className="rp-redirecting">Redirecting to login in 3 seconds</p>
                <Link to="/login" className="rp-btn">Go to Login Now</Link>
            </div>
        </div>
    );

    return (
        <div className="rp-page">
            <div className="rp-brand">
                <span className="rp-brand-dot" />Fast Delivery
            </div>

            <div className="rp-card">
                <div className="rp-icon rp-icon--green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h1 className="rp-title">Set New Password</h1>
                <p className="rp-sub">Create a strong new password for your account.</p>

                <form onSubmit={handleSubmit} className="rp-form">
                    <div className="rp-field">
                        <label htmlFor="rp-new">New Password</label>
                        <div className="rp-input-wrap">
                            <input type={showNew ? 'text' : 'password'} id="rp-new" placeholder="Min. 6 characters"
                                value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} autoFocus />
                            <button type="button" className="rp-eye" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                                {showNew ? <EyeOff /> : <EyeOn />}
                            </button>
                        </div>
                        {newPassword.length > 0 && (
                            <div className="rp-strength">
                                <div className="rp-bars">
                                    {[1,2,3,4,5].map(i => <div key={i} className="rp-bar" style={{ background: i <= strength ? strengthColor : '#e2e8f0' }} />)}
                                </div>
                                <span style={{ color: strengthColor, fontSize: '0.78rem', fontWeight: 600 }}>{strengthLabel}</span>
                            </div>
                        )}
                    </div>

                    <div className="rp-field">
                        <label htmlFor="rp-confirm">Confirm Password</label>
                        <div className="rp-input-wrap">
                            <input type={showConfirm ? 'text' : 'password'} id="rp-confirm" placeholder="Re-enter password"
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                            <button type="button" className="rp-eye" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                                {showConfirm ? <EyeOff /> : <EyeOn />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && (
                            <p className="rp-match" style={{ color: newPassword === confirmPassword ? '#16a34a' : '#ef4444' }}>
                                {newPassword === confirmPassword ? 'âœ“ Passwords match' : 'âœ— Passwords do not match'}
                            </p>
                        )}
                    </div>

                    {status === 'error' && <div className="rp-alert">âš ï¸ {message}</div>}

                    <button type="submit" className="rp-btn rp-btn--full" disabled={status === 'loading'}>
                        {status === 'loading' ? <><span className="rp-spinner" /> Resettingâ€¦</> : 'Reset Password '}
                    </button>
                </form>

                <p className="rp-back"><Link to="/login"> Back to Login</Link></p>
            </div>
        </div>
    );
};

export default ResetPassword;
