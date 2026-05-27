import { useState } from "react";
import { Link } from "react-router-dom";

import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";

function Register() {

    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        gender: "",
        age: "",
        phone: ""
    });

    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});

    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });

        setErrors({
            ...errors,
            [event.target.name]: "",
            general: ""
        });
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        const newErrors = {};

        // الاسم
        if (!formData.name.trim()) {
            newErrors.name = "الاسم مطلوب";
        }

        // الإيميل
        if (!formData.email.trim()) {
            newErrors.email = "البريد الإلكتروني مطلوب";
        }

        // العمر
        const ageNumber = Number(formData.age);

        if (!formData.age) {

            newErrors.age = "العمر مطلوب";

        } else if (ageNumber <= 18 || ageNumber > 120) {

            newErrors.age = "العمر غير صحيح";
        }

        // رقم الجوال
        if (!formData.phone.trim()) {

            newErrors.phone = "رقم الجوال مطلوب";
        }

        // الجنس
        if (!formData.gender) {

            newErrors.gender = "اختر الجنس";
        }

        // كلمة المرور
        if (!formData.password) {

            newErrors.password = "كلمة المرور مطلوبة";

        } else if (formData.password.length < 8) {

            newErrors.password =
                "كلمة المرور يجب أن تكون 8 أحرف على الأقل";

        } else if (formData.password.length > 30) {

            newErrors.password =
                "كلمة المرور طويلة جدًا";
        }

        // إذا فيه أخطاء
        if (Object.keys(newErrors).length > 0) {

            setErrors(newErrors);

            return;
        }

        setLoading(true);

        setErrors({});

        try {

            await API.post(
                "/auth/register",
                formData
            );

            await API.post(
                "/auth/send-verification",
                {
                    email: formData.email
                }
            );

            window.location.href =
                `/verify-email?email=${formData.email}`;

        } catch (error) {

            const detail =
                error.response?.data?.detail;

            const backendErrors = {};

            if (Array.isArray(detail)) {

                detail.forEach((item) => {

                    const fieldName =
                        item.loc[item.loc.length - 1];

                    backendErrors[fieldName] =
                        item.msg;
                });

            } else {

                backendErrors.general =
                    typeof detail === "string"
                        ? detail
                        : "Registration failed";
            }

            setErrors(backendErrors);

        } finally {

            setLoading(false);
        }
    };

    return (

        <main className="auth-page">

            <section className="auth-card auth-card-large">

                <div className="auth-icon">
                   <img src="/logo.png" alt="Khuta Logo" />
                </div>

                <h1>
                    {t.createAccount}
                </h1>

                <p>
                    {t.registerSubtitle ||
                        "Join Khuta Stadium today"}
                </p>

                <form onSubmit={handleSubmit}>

                    <label className="auth-label">
                        {t.fullName || "Full Name"}
                    </label>

                    <input
                        type="text"
                        name="name"
                        placeholder={
                            t.fullName || "Full Name"
                        }
                        value={formData.name}
                        onChange={handleChange}
                    />

                    {errors.name && (
                        <p className="field-error">
                            {errors.name}
                        </p>
                    )}

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

                    {errors.email && (
                        <p className="field-error">
                            {errors.email}
                        </p>
                    )}

                    <div className="auth-row">

                        <div>

                            <label className="auth-label">
                                {t.gender}
                            </label>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">
                                    {t.select || "Select"}
                                </option>

                                <option value="Male">
                                    {t.male || "Male"}
                                </option>

                                <option value="Female">
                                    {t.female || "Female"}
                                </option>

                            </select>

                            {errors.gender && (
                                <p className="field-error">
                                    {errors.gender}
                                </p>
                            )}

                        </div>

                        <div>
    <label className="auth-label">
        {t.age}
    </label>

    <input
        type="number"
        name="age"
        min="13" 
        placeholder="25"
        value={formData.age}
        onChange={handleChange}
    />

    {errors.age && (
        <p className="field-error">
            {errors.age}
        </p>
    )}
</div>

                    </div>

                    <label className="auth-label">
                        {t.phone}
                    </label>

                    <input
                        type="text"
                        name="phone"
                        placeholder="05xxxxxxxx"
                        value={formData.phone}
                        onChange={handleChange}
                    />

                    {errors.phone && (
                        <p className="field-error">
                            {errors.phone}
                        </p>
                    )}

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

                    {errors.password && (
                        <p className="field-error">
                            {errors.password}
                        </p>
                    )}

                    {errors.general && (
                        <p className="field-error">
                            {errors.general}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {
                            loading
                                ? t.loading
                                : `${t.createAccount} →`
                        }
                    </button>

                </form>

                <div className="auth-links">

                    <p>

                        {t.haveAccount ||
                            "Already have an account?"}

                        {" "}

                        <Link to="/login">
                            {t.login}
                        </Link>

                    </p>

                </div>

            </section>

        </main>
    );
}

export default Register;
