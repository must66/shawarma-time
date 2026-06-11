export const languages = ["ar", "nl", "de", "en"];

export const categoryOrder = [
  "shawarma",
  "sandwiches",
  "meals",
  "grilledChicken",
  "broastedChicken",
  "crispyChicken",
  "kapsalon",
  "falafel",
  "sides",
  "drinks",
  "sauces",
  "salads"
];

export const badgeOptions = ["", "new", "popular", "spicy", "offer"];

export const ui = {
  nl: {
    nav: {
      home: "Home",
      menu: "Menu",
      offers: "Offers",
      gallery: "Gallery",
      about: "Over ons",
      hours: "Openingstijden",
      contact: "Contact"
    },
    categories: {
      all: "Alles",
      shawarma: "Shawarma",
      sandwiches: "Sandwiches",
      meals: "Maaltijden",
      grilledChicken: "Gegrilde kip",
      broastedChicken: "Broasted chicken",
      crispyChicken: "Crispy chicken",
      kapsalon: "Kapsalon",
      falafel: "Falafel",
      sides: "Bijgerechten",
      drinks: "Dranken",
      sauces: "Sauzen",
      salads: "Salades"
    },
    badges: {
      new: "Nieuw",
      popular: "Populair",
      spicy: "Pittig",
      offer: "Actie"
    },
    days: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"],
    section: {
      menuEyebrow: "QR-ready menu",
      menuTitle: "Premium food showcase",
      offersEyebrow: "Dagelijks vers voordeel",
      offersTitle: "Offers, deals en banners",
      galleryEyebrow: "Instagram stijl",
      galleryTitle: "Gallery",
      aboutEyebrow: "Authentiek in Venlo",
      aboutTitle: "Arabic shawarma, grill fire en gastvrijheid",
      hoursEyebrow: "Plan je bezoek",
      hoursTitle: "Openingstijden",
      reviewsEyebrow: "Wat gasten zeggen",
      reviewsTitle: "Reviews",
      socialsEyebrow: "Volg de smaak",
      socialsTitle: "Social media",
      contactEyebrow: "Route en contact",
      contactTitle: "Contact",
      address: "Adres",
      phone: "Telefoon",
      whatsapp: "WhatsApp",
      viewMenu: "View Menu",
      viewOffers: "Bekijk offers",
      addToCart: "Toevoegen",
      orderNow: "Bestellen",
      cart: "Winkelwagen",
      cartEmpty: "Je winkelwagen is leeg.",
      quantity: "Aantal",
      subtotal: "Totaal",
      customerName: "Naam",
      customerPhone: "Telefoon",
      orderNotes: "Opmerking",
      paymentMethod: "Betaalmethode",
      cashOnDelivery: "Contant bij bezorging",
      payAtRestaurant: "Betalen in restaurant",
      molliePayment: "Online betalen met Mollie",
      stripePayment: "Online betalen met Mollie",
      submitOrder: "Bestelling versturen",
      orderSuccess: "Bedankt. Je bestelling is ontvangen.",
      stripeRedirect: "Je wordt doorgestuurd naar Stripe Checkout.",
      stripeUnavailable: "Online betaling is nog niet geconfigureerd. Kies contant of betalen in restaurant.",
      stripeMissingBackend: "Stripe Checkout werkt alleen via de Netlify productie-URL met serverless functions.",
      stripeMissingConfig: "Stripe is niet volledig geconfigureerd. Controleer STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY en STRIPE_WEBHOOK_SECRET.",
      mollieRedirect: "Je wordt doorgestuurd naar Mollie om veilig te betalen.",
      mollieUnavailable: "Mollie betaling is nog niet geconfigureerd. Kies contant of betalen in restaurant.",
      mollieMissingBackend: "Mollie betaling werkt alleen via de Netlify productie-URL met serverless functions.",
      mollieMissingConfig: "Mollie is niet volledig geconfigureerd. Controleer MOLLIE_API_KEY en FIREBASE_SERVICE_ACCOUNT.",
      paymentSuccess: "Betaling ontvangen. Je bestelling is doorgestuurd.",
      paymentCancel: "Online betaling is geannuleerd. Je kunt opnieuw proberen of een andere betaalmethode kiezen.",
      orderError: "Bestelling versturen is mislukt.",
      closeCart: "Winkelwagen sluiten",
      fullscreen: "Open afbeelding",
      close: "Sluiten"
    },
    footer: "Showcase website voor Shawarma Time. Geen online bestellen, geen reserveringen."
  },
  ar: {
    nav: {
      home: "الرئيسية",
      menu: "القائمة",
      offers: "العروض",
      gallery: "المعرض",
      about: "من نحن",
      hours: "ساعات العمل",
      contact: "اتصال"
    },
    categories: {
      all: "الكل",
      shawarma: "شاورما",
      sandwiches: "سندويشات",
      meals: "وجبات",
      grilledChicken: "دجاج مشوي",
      broastedChicken: "دجاج بروستد",
      crispyChicken: "دجاج كرسبي",
      kapsalon: "كبسالون",
      falafel: "فلافل",
      sides: "مقبلات",
      drinks: "مشروبات",
      sauces: "صلصات",
      salads: "سلطات"
    },
    badges: {
      new: "جديد",
      popular: "الأكثر طلباً",
      spicy: "حار",
      offer: "عرض"
    },
    days: ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
    section: {
      menuEyebrow: "قائمة جاهزة للـ QR",
      menuTitle: "عرض فاخر للأطباق",
      offersEyebrow: "عروض يومية طازجة",
      offersTitle: "العروض واللافتات",
      galleryEyebrow: "ستايل إنستغرام",
      galleryTitle: "معرض الصور",
      aboutEyebrow: "أصالة في فينلو",
      aboutTitle: "شاورما عربية، نار الشواية وكرم الضيافة",
      hoursEyebrow: "خطط لزيارتك",
      hoursTitle: "ساعات العمل",
      reviewsEyebrow: "آراء الزبائن",
      reviewsTitle: "التقييمات",
      socialsEyebrow: "تابع النكهة",
      socialsTitle: "وسائل التواصل",
      contactEyebrow: "الموقع والتواصل",
      contactTitle: "اتصال",
      address: "العنوان",
      phone: "الهاتف",
      whatsapp: "واتساب",
      viewMenu: "عرض القائمة",
      viewOffers: "مشاهدة العروض",
      addToCart: "إضافة",
      orderNow: "اطلب الآن",
      cart: "سلة الطلب",
      cartEmpty: "سلة الطلب فارغة.",
      quantity: "الكمية",
      subtotal: "المجموع",
      customerName: "الاسم",
      customerPhone: "الهاتف",
      orderNotes: "ملاحظة",
      paymentMethod: "طريقة الدفع",
      cashOnDelivery: "الدفع نقداً عند الاستلام",
      payAtRestaurant: "الدفع في المطعم",
      molliePayment: "الدفع أونلاين عبر Mollie",
      stripePayment: "الدفع أونلاين عبر Mollie",
      submitOrder: "إرسال الطلب",
      orderSuccess: "شكراً. تم استلام طلبك.",
      stripeRedirect: "سيتم تحويلك إلى Stripe Checkout.",
      stripeUnavailable: "الدفع أونلاين غير مفعّل بعد. اختر الدفع نقداً أو في المطعم.",
      stripeMissingBackend: "Stripe Checkout يعمل فقط عبر رابط Netlify الإنتاجي مع serverless functions.",
      stripeMissingConfig: "Stripe غير مكتمل الإعداد. تحقق من STRIPE_SECRET_KEY و STRIPE_PUBLISHABLE_KEY و STRIPE_WEBHOOK_SECRET.",
      mollieRedirect: "سيتم تحويلك إلى Mollie للدفع الآمن.",
      mollieUnavailable: "دفع Mollie غير مفعّل بعد. اختر الدفع نقداً أو في المطعم.",
      mollieMissingBackend: "دفع Mollie يعمل فقط عبر رابط Netlify الإنتاجي مع serverless functions.",
      mollieMissingConfig: "Mollie غير مكتمل الإعداد. تحقق من MOLLIE_API_KEY و FIREBASE_SERVICE_ACCOUNT.",
      paymentSuccess: "تم استلام الدفع. تم إرسال طلبك.",
      paymentCancel: "تم إلغاء الدفع أونلاين. يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.",
      orderError: "فشل إرسال الطلب.",
      closeCart: "إغلاق سلة الطلب",
      fullscreen: "فتح الصورة",
      close: "إغلاق"
    },
    footer: "موقع عرض لشاورما تايم. بدون طلب أونلاين وبدون حجوزات."
  },
  de: {
    nav: {
      home: "Start",
      menu: "Menü",
      offers: "Angebote",
      gallery: "Galerie",
      about: "Über uns",
      hours: "Öffnungszeiten",
      contact: "Kontakt"
    },
    categories: {
      all: "Alle",
      shawarma: "Shawarma",
      sandwiches: "Sandwiches",
      meals: "Gerichte",
      grilledChicken: "Gegrilltes Hähnchen",
      broastedChicken: "Broasted Chicken",
      crispyChicken: "Crispy Chicken",
      kapsalon: "Kapsalon",
      falafel: "Falafel",
      sides: "Beilagen",
      drinks: "Getränke",
      sauces: "Saucen",
      salads: "Salate"
    },
    badges: {
      new: "Neu",
      popular: "Beliebt",
      spicy: "Scharf",
      offer: "Angebot"
    },
    days: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    section: {
      menuEyebrow: "QR-freundliches Menü",
      menuTitle: "Premium Food Showcase",
      offersEyebrow: "Täglich frische Deals",
      offersTitle: "Angebote, Deals und Banner",
      galleryEyebrow: "Instagram Stil",
      galleryTitle: "Galerie",
      aboutEyebrow: "Authentisch in Venlo",
      aboutTitle: "Arabische Shawarma, Grillfeuer und Gastfreundschaft",
      hoursEyebrow: "Besuch planen",
      hoursTitle: "Öffnungszeiten",
      reviewsEyebrow: "Was Gäste sagen",
      reviewsTitle: "Bewertungen",
      socialsEyebrow: "Folgen Sie dem Geschmack",
      socialsTitle: "Social Media",
      contactEyebrow: "Route und Kontakt",
      contactTitle: "Kontakt",
      address: "Adresse",
      phone: "Telefon",
      whatsapp: "WhatsApp",
      viewMenu: "Menü ansehen",
      viewOffers: "Angebote ansehen",
      addToCart: "Hinzufugen",
      orderNow: "Bestellen",
      cart: "Warenkorb",
      cartEmpty: "Dein Warenkorb ist leer.",
      quantity: "Anzahl",
      subtotal: "Summe",
      customerName: "Name",
      customerPhone: "Telefon",
      orderNotes: "Notiz",
      paymentMethod: "Zahlungsmethode",
      cashOnDelivery: "Bar bei Lieferung",
      payAtRestaurant: "Im Restaurant bezahlen",
      molliePayment: "Online mit Mollie bezahlen",
      stripePayment: "Online mit Mollie bezahlen",
      submitOrder: "Bestellung senden",
      orderSuccess: "Danke. Deine Bestellung wurde empfangen.",
      stripeRedirect: "Du wirst zu Stripe Checkout weitergeleitet.",
      stripeUnavailable: "Online-Zahlung ist noch nicht konfiguriert. Wähle Barzahlung oder Zahlung im Restaurant.",
      stripeMissingBackend: "Stripe Checkout funktioniert nur über die Netlify-Produktions-URL mit Serverless Functions.",
      stripeMissingConfig: "Stripe ist nicht vollständig konfiguriert. Prüfe STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY und STRIPE_WEBHOOK_SECRET.",
      mollieRedirect: "Du wirst zu Mollie weitergeleitet, um sicher zu bezahlen.",
      mollieUnavailable: "Mollie-Zahlung ist noch nicht konfiguriert. Wähle Barzahlung oder Zahlung im Restaurant.",
      mollieMissingBackend: "Mollie-Zahlung funktioniert nur über die Netlify-Produktions-URL mit Serverless Functions.",
      mollieMissingConfig: "Mollie ist nicht vollständig konfiguriert. Prüfe MOLLIE_API_KEY und FIREBASE_SERVICE_ACCOUNT.",
      paymentSuccess: "Zahlung erhalten. Deine Bestellung wurde weitergeleitet.",
      paymentCancel: "Online-Zahlung wurde abgebrochen. Du kannst es erneut versuchen oder anders bezahlen.",
      orderError: "Bestellung konnte nicht gesendet werden.",
      closeCart: "Warenkorb schliessen",
      fullscreen: "Bild öffnen",
      close: "Schließen"
    },
    footer: "Showcase-Website für Shawarma Time. Keine Onlinebestellung, keine Reservierungen."
  }
};

const photo = (from, to, label, mood = "GRILL") =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 840"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${from}"/><stop offset=".45" stop-color="#160706"/><stop offset="1" stop-color="${to}"/></linearGradient><radialGradient id="glow" cx=".58" cy=".42" r=".46"><stop stop-color="#ffd889"/><stop offset=".35" stop-color="#e46618"/><stop offset="1" stop-color="#260b06"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="18"/></filter></defs><rect width="1200" height="840" fill="url(#bg)"/><circle cx="720" cy="320" r="280" fill="#ff7a1a" opacity=".18" filter="url(#blur)"/><circle cx="610" cy="382" r="255" fill="url(#glow)" opacity=".94"/><ellipse cx="610" cy="520" rx="365" ry="82" fill="#070303" opacity=".45"/><path d="M334 474c156 105 378 102 540-4" fill="none" stroke="#fff0cf" stroke-width="38" stroke-linecap="round" opacity=".9"/><path d="M405 296c85-84 281-84 372 2" fill="none" stroke="#ffe1ab" stroke-width="34" stroke-linecap="round" opacity=".9"/><path d="M420 395h330M450 475h286" stroke="#1d0804" stroke-width="42" stroke-linecap="round"/><path d="M452 350h250M500 545h180" stroke="#ff8a22" stroke-width="26" stroke-linecap="round"/><text x="72" y="118" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#ffbd59">${mood}</text><text x="72" y="760" font-family="Arial, sans-serif" font-size="78" font-weight="900" fill="#fff7e8">${label}</text></svg>`)}`;

export const defaultSiteData = {
  settings: {
    phone: "06 38081382",
    address: "Puteanusstraat, 5911 EV Venlo",
    instagram: "https://instagram.com/",
    tiktok: "https://www.tiktok.com/",
    facebook: "https://facebook.com/",
    whatsappMessage: "Hello, I would like to ask about today’s offers.",
    hours: ["12:00 - 22:00", "12:00 - 22:00", "12:00 - 22:00", "12:00 - 22:00", "12:00 - 23:00", "12:00 - 23:00", "13:00 - 22:00"]
  },
  design: {
    logoImage: "",
    tone: "dark",
    accentColor: "#ff7a1a",
    buttonColor: "#ff7a1a",
    goldColor: "#ffbf58",
    cardStyle: "glass",
    borderRadius: 8,
    glow: true,
    animations: true,
    font: "Inter",
    heroOverlay: 78,
    sectionBackground: photo("#090504", "#351008", "SECTION", "BACKGROUND"),
    menuBackground: "",
    offersBackground: "",
    galleryBackground: "",
    aboutBackground: "",
    contactBackground: ""
  },
  homepage: {
    eyebrow: {
      nl: "Premium shawarma in Venlo",
      ar: "شاورما فاخرة في فينلو",
      de: "Premium Shawarma in Venlo"
    },
    title: {
      nl: "Shawarma Time",
      ar: "شاورما تايم",
      de: "Shawarma Time"
    },
    slogan: {
      nl: "Authentic Arabic Shawarma & Grill Experience in Venlo",
      ar: "تجربة شاورما ومشاوي عربية أصيلة في فينلو",
      de: "Authentisches arabisches Shawarma- und Grillerlebnis in Venlo"
    },
    intro: {
      nl: "Donkere luxe, vuur van de grill en royale Arabische smaken in een snelle showcase voor elke gast.",
      ar: "تصميم فاخر داكن، نار الشواية ونكهات عربية غنية في تجربة عرض سريعة لكل ضيف.",
      de: "Dunkle Eleganz, Grillfeuer und großzügige arabische Aromen als schnelle Showcase für jeden Gast."
    },
    about: {
      nl: "Shawarma Time brengt de geur van kruidige shawarma, sappige grillkip en verse sauzen naar het hart van Venlo. Deze website is gebouwd als premium etalage: duidelijk, snel en dagelijks beheerbaar.",
      ar: "شاورما تايم يجمع رائحة الشاورما المتبلة، الدجاج المشوي الطري والصلصات الطازجة في قلب فينلو. هذا الموقع واجهة عرض فاخرة، واضحة وسريعة وسهلة الإدارة يومياً.",
      de: "Shawarma Time bringt den Duft von würziger Shawarma, saftigem Grillhähnchen und frischen Saucen nach Venlo. Diese Website ist als Premium-Schaufenster gebaut: klar, schnell und täglich pflegbar."
    },
    heroImage: photo("#090303", "#7c1c0d", "SHAWARMA TIME", "FIRE GRILL")
  },
  sectionText: {
    menuEyebrow: { nl: "QR-ready menu", ar: "قائمة جاهزة للـ QR", de: "QR-freundliches Menü" },
    menuTitle: { nl: "Premium food showcase", ar: "عرض فاخر للأطباق", de: "Premium Food Showcase" },
    offersEyebrow: { nl: "Dagelijks vers voordeel", ar: "عروض يومية طازجة", de: "Täglich frische Deals" },
    offersTitle: { nl: "Offers, deals en banners", ar: "العروض واللافتات", de: "Angebote, Deals und Banner" },
    galleryEyebrow: { nl: "Instagram stijl", ar: "ستايل إنستغرام", de: "Instagram Stil" },
    galleryTitle: { nl: "Gallery", ar: "معرض الصور", de: "Galerie" },
    aboutEyebrow: { nl: "Authentiek in Venlo", ar: "أصالة في فينلو", de: "Authentisch in Venlo" },
    aboutTitle: { nl: "Arabic shawarma, grill fire en gastvrijheid", ar: "شاورما عربية، نار الشواية وكرم الضيافة", de: "Arabische Shawarma, Grillfeuer und Gastfreundschaft" },
    hoursEyebrow: { nl: "Plan je bezoek", ar: "خطط لزيارتك", de: "Besuch planen" },
    hoursTitle: { nl: "Openingstijden", ar: "ساعات العمل", de: "Öffnungszeiten" },
    reviewsEyebrow: { nl: "Wat gasten zeggen", ar: "آراء الزبائن", de: "Was Gäste sagen" },
    reviewsTitle: { nl: "Reviews", ar: "التقييمات", de: "Bewertungen" },
    socialsEyebrow: { nl: "Volg de smaak", ar: "تابع النكهة", de: "Folgen Sie dem Geschmack" },
    socialsTitle: { nl: "Social media", ar: "وسائل التواصل", de: "Social Media" },
    contactEyebrow: { nl: "Route en contact", ar: "الموقع والتواصل", de: "Route und Kontakt" },
    contactTitle: { nl: "Contact", ar: "اتصال", de: "Kontakt" },
    footer: { nl: "Showcase website voor Shawarma Time. Geen online bestellen, geen reserveringen.", ar: "موقع عرض لشاورما تايم. بدون طلب أونلاين وبدون حجوزات.", de: "Showcase-Website für Shawarma Time. Keine Onlinebestellung, keine Reservierungen." }
  },
  media: [],
  banners: [
    {
      id: "b1",
      title: { nl: "Daily shawarma fire", ar: "شاورما كل يوم", de: "Tägliches Shawarma-Feuer" },
      text: { nl: "Verse grill, warme sauzen en goudbruine friet.", ar: "شواية طازجة، صلصات دافئة وبطاطا ذهبية.", de: "Frischer Grill, warme Saucen und goldene Pommes." },
      image: photo("#100504", "#8a210e", "DAILY", "OFFER")
    },
    {
      id: "b2",
      title: { nl: "Weekend family meals", ar: "وجبات عائلية في الويكند", de: "Wochenend-Familienmenüs" },
      text: { nl: "Royale porties voor samen genieten.", ar: "حصص كبيرة للاستمتاع معاً.", de: "Große Portionen zum gemeinsamen Genießen." },
      image: photo("#140604", "#a93212", "FAMILY", "WEEKEND")
    }
  ],
  menu: [
    menuItem("m1", "shawarma", "€7,50", "popular", "Shawarma classic", "شاورما كلاسيك", "Shawarma Classic", "Warm brood, gekruid vlees, knoflooksaus en salade.", "خبز دافئ، لحم متبل، صلصة ثوم وسلطة.", "Warmes Brot, gewürztes Fleisch, Knoblauchsauce und Salat.", "SHAWARMA"),
    menuItem("m2", "sandwiches", "€8,50", "new", "Chicken sandwich", "سندويش دجاج", "Chicken Sandwich", "Gegrilde kip met frisse topping en saus.", "دجاج مشوي مع إضافات طازجة وصلصة.", "Gegrilltes Hähnchen mit frischem Topping und Sauce.", "SANDWICH"),
    menuItem("m3", "meals", "€13,50", "popular", "Shawarma meal", "وجبة شاورما", "Shawarma Teller", "Met friet, salade, brood en sauzen.", "مع بطاطا وسلطة وخبز وصلصات.", "Mit Pommes, Salat, Brot und Saucen.", "MEAL"),
    menuItem("m4", "grilledChicken", "€12,00", "spicy", "Charcoal chicken", "دجاج على الفحم", "Holzkohle-Hähnchen", "Sappige kip met rokerige grillkruiden.", "دجاج طري بتوابل مشوية مدخنة.", "Saftiges Hähnchen mit rauchigen Grillgewürzen.", "GRILL"),
    menuItem("m5", "broastedChicken", "€10,50", "offer", "Broasted box", "بوكس بروستد", "Broasted Box", "Krokant van buiten, mals van binnen.", "مقرمش من الخارج وطري من الداخل.", "Knusprig außen, zart innen.", "BROASTED"),
    menuItem("m6", "crispyChicken", "€8,50", "popular", "Crispy wrap", "راب كرسبي", "Crispy Wrap", "Krokante kip, sla en romige saus.", "دجاج كرسبي، خس وصلصة كريمية.", "Knuspriges Hähnchen, Salat und cremige Sauce.", "CRISPY"),
    menuItem("m7", "kapsalon", "€9,50", "offer", "Kapsalon shawarma", "كبسالون شاورما", "Kapsalon Shawarma", "Friet, shawarma, kaas, salade en saus.", "بطاطا، شاورما، جبن، سلطة وصلصة.", "Pommes, Shawarma, Käse, Salat und Sauce.", "KAPSALON"),
    menuItem("m8", "falafel", "€6,50", "new", "Falafel sandwich", "سندويش فلافل", "Falafel-Sandwich", "Vegetarisch, kruidig en fris.", "نباتي، متبل وطازج.", "Vegetarisch, würzig und frisch.", "FALAFEL"),
    menuItem("m9", "sides", "€3,50", "", "Golden fries", "بطاطا ذهبية", "Goldene Pommes", "Krokant gebakken en licht gezouten.", "مقرمشة ومملحة بخفة.", "Knusprig gebacken und leicht gesalzen.", "FRIES"),
    menuItem("m10", "drinks", "€2,50", "", "Cold drinks", "مشروبات باردة", "Kalte Getränke", "Diverse gekoelde dranken.", "مشروبات باردة متنوعة.", "Verschiedene gekühlte Getränke.", "DRINKS"),
    menuItem("m11", "sauces", "€1,00", "spicy", "Sauces and toppings", "صلصات وإضافات", "Saucen und Toppings", "Knoflook, sambal, cocktail en extra toppings.", "ثوم، سامبال، كوكتيل وإضافات.", "Knoblauch, Sambal, Cocktail und Extras.", "SAUCES"),
    menuItem("m12", "salads", "€4,00", "", "Fresh salad", "سلطة طازجة", "Frischer Salat", "Knapperig, licht en dagelijks vers.", "مقرمشة وخفيفة وطازجة يومياً.", "Knackig, leicht und täglich frisch.", "SALAD")
  ],
  offers: [
    offer("o1", "daily", "€11,99", "Daily kapsalon deal", "عرض كبسالون اليوم", "Täglicher Kapsalon Deal", "Kapsalon met gekoeld drankje.", "كبسالون مع مشروب بارد.", "Kapsalon mit gekühltem Getränk.", "DAILY"),
    offer("o2", "weekend", "€24,99", "Weekend family grill", "مشاوي عائلية للويكند", "Wochenend Familiengrill", "Royale grillmix voor samen delen.", "مشاوي مشكلة للمشاركة.", "Großer Grillmix zum Teilen.", "WEEKEND"),
    offer("o3", "student", "€8,99", "Student crispy discount", "خصم الطلاب كرسبي", "Studenten Crispy Rabatt", "Crispy wrap met friet.", "راب كرسبي مع بطاطا.", "Crispy Wrap mit Pommes.", "STUDENT"),
    offer("o4", "family", "€29,99", "Family shawarma meal", "وجبة شاورما عائلية", "Familien-Shawarma", "Shawarma, sides, salade en sauzen.", "شاورما، مقبلات، سلطة وصلصات.", "Shawarma, Beilagen, Salat und Saucen.", "FAMILY")
  ],
  gallery: [
    gallery("g1", "Food close-up", "لقطة طعام", "Food Close-up", "food", "CLOSE UP"),
    gallery("g2", "Kitchen grill", "شواية المطبخ", "Küchengrill", "kitchen", "KITCHEN"),
    gallery("g3", "Restaurant mood", "أجواء المطعم", "Restaurant Stimmung", "restaurant", "MOOD"),
    gallery("g4", "Fresh wraps", "راب طازج", "Frische Wraps", "food", "WRAPS"),
    gallery("g5", "Broasted crunch", "قرمشة البروستد", "Broasted Crunch", "food", "CRUNCH")
  ],
  reviews: [
    { id: "r1", name: "Samir", rating: "5.0", text: { nl: "Sterke smaak, snel geholpen en goede porties.", ar: "نكهة قوية، خدمة سريعة وحصص ممتازة.", de: "Starker Geschmack, schnelle Bedienung und gute Portionen." } },
    { id: "r2", name: "Nora", rating: "4.9", text: { nl: "De kapsalon en sauzen voelen echt vers.", ar: "الكبسالون والصلصات طازجة فعلاً.", de: "Kapsalon und Saucen schmecken wirklich frisch." } },
    { id: "r3", name: "Yassin", rating: "5.0", text: { nl: "Perfecte plek voor shawarma in Venlo.", ar: "مكان ممتاز للشاورما في فينلو.", de: "Perfekter Ort für Shawarma in Venlo." } }
  ]
};

function menuItem(id, category, price, badge, nl, ar, de, dNl, dAr, dDe, label) {
  return {
    id,
    category,
    price,
    badge,
    name: { nl, ar, de },
    desc: { nl: dNl, ar: dAr, de: dDe },
    image: photo("#120504", "#9a2b10", label, category.toUpperCase())
  };
}

function offer(id, type, price, nl, ar, de, dNl, dAr, dDe, label) {
  return {
    id,
    type,
    price,
    name: { nl, ar, de },
    desc: { nl: dNl, ar: dAr, de: dDe },
    image: photo("#100403", "#b33112", label, "DEAL")
  };
}

function gallery(id, nl, ar, de, type, label) {
  return {
    id,
    type,
    title: { nl, ar, de },
    image: photo("#0d0403", "#8f2410", label, type.toUpperCase())
  };
}

export const storageKey = "shawarma-time-site-data-v2";
export const adminKey = "shawarma-time-admin-v2";

export function localized(value, lang) {
  if (typeof value === "string") return value;
  return value?.[lang] || value?.nl || "";
}

export function loadSiteData() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    return stored ? mergeData(defaultSiteData, stored) : structuredClone(defaultSiteData);
  } catch {
    return structuredClone(defaultSiteData);
  }
}

export function saveSiteData(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function mergeData(base, stored) {
  const merged = { ...structuredClone(base), ...stored };
  merged.settings = { ...base.settings, ...stored.settings };
  merged.design = { ...base.design, ...stored.design };
  merged.homepage = { ...base.homepage, ...stored.homepage };
  merged.sectionText = { ...base.sectionText, ...stored.sectionText };
  return merged;
}
