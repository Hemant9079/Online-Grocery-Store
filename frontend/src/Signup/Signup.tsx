import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const signupWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
                const res = await fetch(`${apiUrl}/api/auth/google-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: tokenResponse.access_token }),
                });
                const data = await res.json();
                if (res.ok) {
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    window.dispatchEvent(new Event('user-logged-in'));
                    navigate('/');
                } else {
                    alert(data.message || 'Google signup failed');
                }
            } catch (err) {
                console.error('Google signup error:', err);
                alert('Google signup failed. Please try again.');
            }
        },
        onError: () => alert('Google Signup was unsuccessful. Please try again.'),
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const response = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please check your connection.');
        }
    };

    return (
        <div className="auth-page">
            {/* ── LEFT: Illustration ── */}
            <div className="auth-left">
                <div className="auth-left-blob auth-left-blob--tl" />
                <div className="auth-left-blob auth-left-blob--br" />
                <div className="auth-left-content">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqVoxycmRNdBPuIGbTlc9yxj2exuMxbR-lg4adxypofUiRs2aW8pGs9GUkNvSr4GoCQyeLmHgtXVCyLFLmSWrLG2KCXqWxwHkIyfWJOY44JFNGMTOvW54H4uJ8WRbihH3sOw9hWmxt11DGA0FPpeMGPLe7mJcVwzm8v0Pf4YZtf332OEBPptqfVzl_gHWQQlyfcHlOtv1aw0vjN2OeTNlezzUMCRG3AdJDKrAtClgrxcbNG7v1kq8yOByNu5hU7FVd4cwbztAGFBqj" alt="Fresh groceries in a delivery basket" className="auth-left-img" />
                    <div className="auth-left-text">
                        <h2>Join & Save Big.</h2>
                        <p>Create your free account today and enjoy exclusive deals, doorstep delivery, and thousands of fresh products.</p>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Signup Form ── */}
            <div className="auth-right">
                <div className="auth-form-box">
                    {/* Brand */}
                    <div className="auth-brand">
                        <span className="auth-brand-name">Fast Delivery</span>
                    </div>

                    <div className="auth-heading">
                        <h1>Create Account</h1>
                        <p>Sign up and start your grocery shopping journey.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label htmlFor="username">Username</label>
                            <div className="auth-input-wrap">
                                <span className="material-symbols-outlined auth-field-icon"></span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="email">Email Address</label>
                            <div className="auth-input-wrap">
                                <span className="material-symbols-outlined auth-field-icon"></span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <div className="auth-input-wrap">
                                <span className="material-symbols-outlined auth-field-icon"></span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn">
                            Create Account
                            <span className="material-symbols-outlined"></span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span />
                        <p>Or continue with</p>
                        <span />
                    </div>

                    {/* Social */}
                    <div className="auth-social">
                        <button className="auth-social-btn" type="button" onClick={() => signupWithGoogle()}>
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button className="auth-social-btn" type="button">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.51 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                            </svg>
                            Apple
                        </button>
                    </div>

                    <p className="auth-footer-link">
                        Already have an account? <Link to="/login">Sign in now</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
