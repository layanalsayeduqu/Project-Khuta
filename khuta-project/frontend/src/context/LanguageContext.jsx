import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const TRANSLATIONS = {
    en: {
        home: "Home",
        login: "Login",
        register: "Create Account",
        profile: "My Profile",
        map: "Navigation",
        logout: "Logout",

        liveScore: "Live Score",
        upcomingMatchesHome: "Upcoming Matches",
        liveNow: "LIVE",
        saudiLeague: "Saudi Pro League",

        alHilal: "Al Hilal",
        alNassr: "Al Nassr",
        alRaed: "Al-Raed",
        alRiyadh: "Al Riyadh",
        alWehda: "Al Wehda Club",
        alFayha: "Al-Fayha",
        alTaawon: "Al Taawon",

        welcome: "Welcome to Khuta Stadium",
        subtitle: "Book matches, choose your seat, and navigate inside the stadium easily.",
        getStarted: "Get Started",

        email: "Email",
        password: "Password",
        name: "Name",
        gender: "Gender",
        male: "Male",
        female: "Female",
        age: "Age",
        phone: "Phone",

        noAccount: "Don't have an account?",
        createAccount: "Create one",
        forgotQuestion: "Forgot your password?",
        resetPassword: "Reset password",
        loading: "Loading...",

        saveChanges: "Save Changes",

        tickets: "Tickets",
        myBookings: "My Bookings",
        favorites: "My Favorites",
        payment: "Payment",
        seatMap: "Seat Map",

        bookNow: "Book Now",
        confirmPayment: "Confirm Payment",
        selectSeat: "Select Seat",

        available: "Available",
        reserved: "Reserved",
        sold: "Sold",

        ticketPrice: "Ticket Price",
        matchDetails: "Match Details",
        stadiumGate: "Stadium Gate",
        seatNumber: "Seat Number",

        bookingSuccess: "Booking Successful",
        cancelBooking: "Cancel Booking",

        loginSubtitle: "Welcome back to Khuta Stadium",
        registerSubtitle: "Join Khuta Stadium today",

        fullName: "Full Name",
        confirmPassword: "Confirm Password",
        passwordsNotMatch: "Passwords do not match",
        haveAccount: "Already have an account?",
        select: "Select",

        profileSubtitle: "Manage your personal information",
        profileUpdated: "Profile updated successfully"
    },

    ar: {
        home: "الرئيسية",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        profile: "ملفي الشخصي",
        map: "الملاحة",
        logout: "تسجيل الخروج",

        liveScore: "النتائج المباشرة",
        upcomingMatchesHome: "المباريات القادمة",
        liveNow: "مباشر",
        saudiLeague: "دوري روشن السعودي",

        alHilal: "الهلال",
        alNassr: "النصر",
        alRaed: "الرائد",
        alRiyadh: "الرياض",
        alWehda: "الوحدة",
        alFayha: "الفيحاء",
        alTaawon: "التعاون",

        welcome: "مرحبًا بك في ملعب خُطى",
        subtitle: "احجز المباريات، اختر مقعدك، وتنقل داخل الملعب بسهولة.",
        getStarted: "ابدأ الآن",

        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        name: "الاسم",
        gender: "الجنس",
        male: "ذكر",
        female: "أنثى",
        age: "العمر",
        phone: "رقم الجوال",

        noAccount: "ليس لديك حساب؟",
        createAccount: "إنشاء حساب",
        forgotQuestion: "هل نسيت كلمة المرور؟",
        resetPassword: "تغيير كلمة المرور",
        loading: "جاري التحميل...",

        saveChanges: "حفظ التغير",

        tickets: "التذاكر",
        myBookings: "حجوزاتي",
        favorites: "النادي المفضل",
        payment: "الدفع",
        seatMap: "خريطة المقاعد",

        bookNow: "احجز الآن",
        confirmPayment: "تأكيد الدفع",
        selectSeat: "اختر المقعد",

        available: "متاح",
        reserved: "محجوز",
        sold: "مباع",

        ticketPrice: "سعر التذكرة",
        matchDetails: "تفاصيل المباراة",
        stadiumGate: "بوابة الملعب",
        seatNumber: "رقم المقعد",

        bookingSuccess: "تم الحجز بنجاح",
        cancelBooking: "إلغاء الحجز",

        loginSubtitle: "مرحبًا بعودتك إلى ملعب خُطى",
        registerSubtitle: "انضمي إلى ملعب خُطى اليوم",

        fullName: "الاسم الكامل",
        confirmPassword: "تأكيد كلمة المرور",
        passwordsNotMatch: "كلمتا المرور غير متطابقتين",
        haveAccount: "لديك حساب بالفعل؟",
        select: "اختيار",

        profileSubtitle: "إدارة معلوماتك الشخصية",
        profileUpdated: "تم تحديث الملف الشخصي بنجاح"
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const getInitialLang = () => {
        const savedLang = localStorage.getItem("lang");

        if (savedLang) {
            return savedLang;
        }

        return navigator.language.startsWith("ar")
            ? "ar"
            : "en";
    };

    const [lang, setLang] = useState(getInitialLang);

    useEffect(() => {
        localStorage.setItem("lang", lang);

        document.documentElement.lang = lang;

        document.documentElement.dir =
            lang === "ar"
                ? "rtl"
                : "ltr";
    }, [lang]);

    const toggleLanguage = () => {
        setLang((current) =>
            current === "en"
                ? "ar"
                : "en"
        );
    };

    const t = TRANSLATIONS[lang];

    return (
        <LanguageContext.Provider
            value={{
                lang,
                setLang,
                toggleLanguage,
                t
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}