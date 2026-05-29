import { useEffect, useState } from "react";

import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

function Profile() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await API.get("/profile/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setProfile(response.data.user);

        } catch (error) {
            localStorage.removeItem("token");
            window.location.href = "/login";

        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        setProfile({
            ...profile,
            [event.target.name]: event.target.value
        });

        setMessage("");
        setError("");
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const token = localStorage.getItem("token");

            await API.put(
                "/profile/update",
                {
                    name: profile.name,
                    gender: profile.gender,
                    age: Number(profile.age),
                    phone: profile.phone,
                    favorite_club: profile.favorite_club || ""
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(
                t.profileUpdated ||
                "Profile updated successfully"
            );

        } catch (error) {
            setError(
                error.response?.data?.detail ||
                "Update failed"
            );

        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="auth-page">
                <section className="auth-card">
                    <div className="loading-state">
                        {t.loading}
                    </div>
                </section>
            </main>
        );
    }
        <button
        type="button"
        onClick={() => navigate("/")}
        style={{ marginTop: "12px" }}
    >
        🏠 {t.home}
    </button>

    return (
        <main className="auth-page">

            <section className="auth-card auth-card-large">

                <div className="auth-icon">
                    👤
                </div>

                <h1>
                    {t.profile}
                </h1>

                <p>
                    {t.profileSubtitle ||
                        "Manage your personal information"}
                </p>

                <form onSubmit={handleUpdate}>

                    <label className="auth-label">
                        {t.fullName || t.name}
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={profile.name || ""}
                        placeholder={t.name}
                        onChange={handleChange}
                    />

                    <label className="auth-label">
                        {t.email}
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={profile.email || ""}
                        placeholder={t.email}
                        disabled
                    />

                    <div className="auth-row">

                        <div>
                            <label className="auth-label">
                                {t.gender}
                            </label>

                            <select
                                name="gender"
                                value={profile.gender || ""}
                                onChange={handleChange}
                            >
                                <option value="Male">
                                    {t.male}
                                </option>

                                <option value="Female">
                                    {t.female}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="auth-label">
                                {t.age}
                            </label>

                            <input
                                type="number"
                                name="age"
                                value={profile.age || ""}
                                placeholder={t.age}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <label className="auth-label">
                        {t.phone}
                    </label>

                    <input
                        type="text"
                        name="phone"
                        value={profile.phone || ""}
                        placeholder={t.phone}
                        onChange={handleChange}
                    />

                    {message && (
                        <p className="success-text">
                            {message}
                        </p>
                    )}

                    {error && (
                        <p className="field-error">
                            {error}
                        </p>
                    )}

                    <div className="profile-actions-row">
                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? t.loading
                            : `${t.saveChanges} →`}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                    >
                         {t.home}
                    </button>
                </div>

                </form>

            </section>

        </main>
    );
}

export default Profile;