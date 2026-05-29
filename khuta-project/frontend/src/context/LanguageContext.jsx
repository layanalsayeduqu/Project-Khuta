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
        map: "Guide Me",
        logout: "Logout",
         projectTitle: "Khuta",
        projectSubtitle: "Your smart companion inside the stadium. Book, locate your gate & seat, and live the match experience intelligently.",
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
        selectClub: "Select Your Club",
        saveFavoriteClub: "Save Favorite Club",
        upcomingMatches: "Upcoming Matches",
        startsFrom: "Starting from",
        viewDetails: "View Details",
        bookTicket: "Book Ticket",
        noMatches: "No upcoming matches for your favorite club.",
        upcomingMatchesCount: "upcoming matches",
        alhilal: "Al Hilal",
        alnassr: "Al Nassr",
        alittihad: "Al Ittihad",
        alahli: "Al Ahli",
        alshabab: "Al Shabab",
        alettifaq: "Al Ettifaq",
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
        profileUpdated: "Profile updated successfully",

        mainTitle: "Stadium Navigation",
        mainSubtitle: "Choose your start point, select your destination, and find the best route.",
        findRoute: "Find Best Route",
        backendRouting: "Smart indoor routing",
        startPoint: "From",
        destination: "To",
        notSelected: "Not selected",
        clearSelection: "Clear",
        routeMsg: "Select a start point and destination.",
        calculatingRoute: "Calculating route...",
        routeError: "Error",
        failedBackend: "Failed to connect to backend",
        twoPointsSelected: "Two points selected. Click Find Best Route to calculate the route.",
        startSelected: "Start point selected. Select the destination point.",
        selectTwoPointsFirst: "Select any two points on the map first.",

        nearbyFacilities: "Nearby Facilities",
        nearest: "Nearest",
        selectStartFirst: "Select a start point first to find the nearest facilities.",
        loadingNearest: "Loading nearest facilities...",
        noNearbyResults: "No nearby results.",
        clickFacilityHint: "Click a facility icon on the map to show the nearest places of the same type.",
        couldNotLoadNearby: "Could not load nearby facilities.",
        approxDistance: "Approx. distance",
        distance: "Distance",

        legend: "Legend",
        entryGate: "Entry Gate",
        emergencyExit: "Emergency Exit",
        restrooms: "Restrooms",
        foodBeverage: "Food & Beverage",
        firstAid: "First Aid",
        prayerRoom: "Prayer Room",
        facilityLabels: {
            restroom: "Restrooms",
            food: "Food & Beverage",
            medical: "First Aid",
            exit: "Emergency Exit",
            prayer: "Prayer Room",
            gate: "Entry Gate",
            facility: "Facility"
        },

        gateClickArea: "Gate selected",
        gate3d: "3D gate",
        locationSelected: "Location selected",

        row: "Row",
        seat: "Seat",
        section: "Section",
        status: "Status",
        statusAvailable: "Available",
        statusReserved: "Reserved",
        statusSold: "Sold",

        youReachedDestination: "You have reached your destination",
        goToSection: "Go to section",
        seatGuidanceNote: "Go to the selected section and look for your row and seat number.",
        home: "Home"
       
    },

    ar: {
        home: "الرئيسية",
        login: "تسجيل الدخول",
        register: "إنشاء حساب",
        profile: "ملفي الشخصي",
         map: "وجّهني",
        logout: "تسجيل الخروج",
        projectTitle: "خُطى",
        projectSubtitle: "رَفِيقُك الذكي دَاخِل المَلعَب. احجِز، حَدِّد بَوَّابَتِك ومَقعَدِك، وعِش أَجوَاء المُبَارَاة بِذَكَاء.",
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
        selectClub: "اختر ناديك المفضل",
        saveFavoriteClub: "حفظ النادي المفضل",
        upcomingMatches: "المباريات القادمة",
        startsFrom: "تبدأ من",
        viewDetails: "عرض التفاصيل",
        bookTicket: "احجز التذكرة",
        noMatches: "لا توجد مباريات قادمة لناديك المفضل حالياً.",
        upcomingMatchesCount: "مباريات قادمة",
        alhilal: "الهلال",
        alnassr: "النصر",
        alittihad: "الاتحاد",
        alahli: "الأهلي",
        alshabab: "الشباب",
        alettifaq: "الاتفاق",

        payment: "الدفع",
        seatMap: "خريطةالمقاعد",

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
        profileUpdated: "تم تحديث الملف الشخصي بنجاح",

        mainTitle: "الملاحة داخل الاستاد",
        mainSubtitle: "اختاري نقطة البداية والوجهة للوصول إلى أفضل مسار.",
        findRoute: "إيجاد أفضل مسار",
        backendRouting: "توجيه ذكي داخل الاستاد",
        startPoint: "من",
        destination: "إلى",
        notSelected: "غير محدد",
        clearSelection: "مسح الاختيار",
        routeMsg: "اختاري نقطة بداية ووجهة.",
        calculatingRoute: "جاري حساب المسار...",
        routeError: "خطأ",
        failedBackend: "فشل الاتصال بالخادم",
        twoPointsSelected: "تم اختيار نقطتين. اضغطي إيجاد أفضل مسار لحساب المسار.",
        startSelected: "تم اختيار نقطة البداية. اختاري نقطة النهاية.",
        selectTwoPointsFirst: "اختاري أي نقطتين على الخريطة أولًا.",

        nearbyFacilities: "المرافق القريبة",
        nearest: "أقرب",
        selectStartFirst: "اختاري نقطة بداية أولًا لحساب أقرب المرافق.",
        loadingNearest: "جاري تحميل أقرب المرافق...",
        noNearbyResults: "لا توجد نتائج قريبة.",
        clickFacilityHint: "اضغطي على أيقونة مرفق داخل الخريطة لعرض الأقرب من نفس النوع.",
        couldNotLoadNearby: "تعذر جلب المرافق القريبة.",
        approxDistance: "المسافة التقريبية",
        distance: "المسافة",

        legend: "مفتاح الرموز",
        entryGate: "بوابة دخول",
        emergencyExit: "مخرج طوارئ",
        restrooms: "دورات مياه",
        foodBeverage: "مطاعم ومشروبات",
        firstAid: "خدمات طبية",
        prayerRoom: "مصلى",
        facilityLabels: {
            restroom: "دورات مياه",
            food: "مطاعم ومشروبات",
            medical: "خدمات طبية",
            exit: "مخرج طوارئ",
            prayer: "مصلى",
            gate: "بوابة دخول",
            facility: "مرفق"
        },

        gateClickArea: "تم اختيار البوابة",
        gate3d: "بوابة ثلاثية الأبعاد",
        locationSelected: "تم اختيار الموقع",

        row: "الصف",
        seat: "المقعد",
        section: "السكشن",
        status: "الحالة",
        statusAvailable: "متاح",
        statusReserved: "محجوز",
        statusSold: "مباع",

        youReachedDestination: "وصلتِ إلى وجهتك",
        goToSection: "توجهي إلى السكشن",
        seatGuidanceNote: "توجهي إلى السكشن المحدد وابحثي عن الصف ورقم المقعد.",
         home: "الصفحة الرئيسية"
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
