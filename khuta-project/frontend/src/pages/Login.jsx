import { useState } from "react";
import { Link } from "react-router-dom";

import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";

function Login() {
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    // تم إضافة هذه الحالة (State) لحفظ وعرض رسائل الخطأ بشكل صحيح
    const [errorMessage, setErrorMessage] = useState(""); 

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        setErrorMessage(""); // تصفير الخطأ مع كل محاولة جديدة

        try {
            const response = await API.post(
                "/auth/login",
                formData
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            window.location.href = "/profile";

        } catch (error) {
            // التقاط الخطأ من الباك اند وتخزينه بشكل صحيح
            setErrorMessage(
                error.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">

            <section className="auth-card">

                <div className="auth-icon">
                    {/* هنا تم إضافة الستايل المباشر لتصغير اللوقو */}
                    <img 
                        src="/logo.png" 
                        alt="Khuta Logo" 
                        style={{ width: '120px', height: 'auto' }} 
                    />
                </div>

                <h1>
                    {t.login}
                </h1>

                <p>
                    {t.loginSubtitle || "Welcome back to Khuta Stadium"}
                </p>

                {/* هنا يتم عرض الخطأ للمستخدم بطريقة برمجية صحيحة */}
                {errorMessage && (
                    <p className="field-error" style={{ color: '#ff4d4f', textAlign: 'center', marginBottom: '15px' }}>
                        {errorMessage}
                    </p>
                )}

                <form onSubmit={handleSubmit}>

                    <label className="auth-label">
                        {t.email}
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <label className="auth-label">
                        {t.password}
                    </label>

                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <Link
                        className="auth-forgot"
                        to="/reset-password"
                    >
                        {t.resetPassword}
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? t.loading : `${t.login} →`}
                    </button>

                </form>

                <div className="auth-links">

                    <p>
                        {t.noAccount}{" "}

                        <Link to="/register">
                            {t.createAccount}
                        </Link>
                    </p>

                </div>

            </section>

        </main>
    );
}

export default Login;