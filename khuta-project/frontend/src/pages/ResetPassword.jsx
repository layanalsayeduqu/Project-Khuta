import { useState } from "react";
import { Link } from "react-router-dom";

import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";

function ResetPassword() {
    const { t } = useLanguage();

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleRequestOtp = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await API.post("/auth/forgot-password", {
                email
            });

            setMessage(response.data.message || "OTP generated successfully");
            setStep(2);

        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            setError(
                typeof errorDetail === 'string' 
                    ? errorDetail 
                    : "Failed to send reset request, please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const response = await API.post("/auth/reset-password", {
                email,
                otp,
                new_password: newPassword,
                confirm_password: confirmPassword
            });

            setMessage(response.data.message || "Password reset successfully!");
            
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);

        } catch (error) {
            const errorDetail = error.response?.data?.detail;
            setError(
                typeof errorDetail === 'string' 
                    ? errorDetail 
                    : "Failed to reset password, check your OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">

                <div className="auth-icon"></div>

                <h1>
                    {t.resetPassword}
                </h1>

                <p>
                    {step === 1 
                        ? (t.resetPasswordSubtitle || "Enter your email and we will send you reset instructions")
                        : "Enter the OTP sent to your email and your new password"}
                </p>

                {error && (
                    <p className="field-error" style={{ marginBottom: '15px' }}>
                        {error}
                    </p>
                )}

                {message && (
                    <p className="success-text" style={{ marginBottom: '15px' }}>
                        {message}
                    </p>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp}>
                        <label className="auth-label">
                            {t.email}
                        </label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? t.loading : t.resetPassword}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <label className="auth-label">OTP Code</label>
                        <input
                            type="text"
                            placeholder="123456"
                            value={otp}
                            onChange={(event) => setOtp(event.target.value)}
                            required
                        />

                        <label className="auth-label">New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                        />

                        <label className="auth-label">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />

                        <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
                            {loading ? t.loading : "Update Password"}
                        </button>
                    </form>
                )}

                <div className="auth-links">
                    <p>
                        <Link to="/login">
                            {t.backToLogin || "Back to login"}
                        </Link>
                    </p>
                </div>

            </section>
        </main>
    );
}

export default ResetPassword;