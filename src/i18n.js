import { useSyncExternalStore } from "react";
let language = "az";
try {
  language = localStorage.getItem("rentacarr.language") || "az";
} catch {}
if (!["az", "en", "ru"].includes(language)) language = "az";
const listeners = new Set();
export function setLanguage(value) {
  if (!["az", "en", "ru"].includes(value)) return;
  language = value;
  document.documentElement.lang = value;
  try {
    localStorage.setItem("rentacarr.language", value);
  } catch {}
  for (const fn of listeners) fn();
}
export function useLanguage() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => language,
  );
}
const rows = [
  ["Avtomobil kirayəsi", "Car rental", "Аренда автомобилей"],
  [
    "Azərbaycanda kirayə avtomobil tap",
    "Find a rental car in Azerbaijan",
    "Найдите автомобиль в аренду в Азербайджане",
  ],
  [
    "Rentakar şirkətlərinin və şəxsi sahiblərin elanları. Qiyməti müqayisə et, sahibi ilə birbaşa danış.",
    "Compare cars from rental companies and private owners. Contact the owner directly.",
    "Сравнивайте предложения компаний и частных владельцев. Связывайтесь с владельцем напрямую.",
  ],
  ["Avtomobillər", "Cars", "Автомобили"],
  ["Partnyorlar", "Partners", "Партнёры"],
  ["Necə işləyir?", "How it works", "Как это работает"],
  ["Seçilmiş elanlar", "Featured listings", "Избранные объявления"],
  ["Seçilmişlər", "Favorites", "Избранное"],
  ["Elan yerləşdir", "List a car", "Разместить объявление"],
  ["Qeydiyyat / Giriş", "Sign up / Log in", "Регистрация / Вход"],
  ["Qeydiyyat və giriş", "Sign up and log in", "Регистрация и вход"],
  ["Qeydiyyat və giriş", "Sign up and log in", "Регистрация и вход"],
  ["Hesabım", "My account", "Мой аккаунт"],
  ["Şəhər", "City", "Город"],
  ["Marka", "Brand", "Марка"],
  ["Model", "Model", "Модель"],
  ["Bütün şəhərlər", "All cities", "Все города"],
  ["Bütün markalar", "All brands", "Все марки"],
  ["Günlük büdcə", "Daily budget", "Бюджет на день"],
  ["Maksimum qiymət", "Maximum price", "Максимальная цена"],
  ["Avtomobil tap", "Find a car", "Найти автомобиль"],
  ["Kirayə avtomobillər", "Rental cars", "Автомобили в аренду"],
  ["Hamısı", "All", "Все"],
  ["Ekonom", "Economy", "Эконом"],
  ["Sedan", "Sedan", "Седан"],
  ["SUV", "SUV", "Внедорожник"],
  ["Biznes", "Business", "Бизнес"],
  ["Premium", "Premium", "Премиум"],
  ["Miniven", "Minivan", "Минивэн"],
  ["Əvvəlcə ucuz", "Price: low to high", "Сначала дешевле"],
  ["Əvvəlcə bahalı", "Price: high to low", "Сначала дороже"],
  ["Model axtar", "Search model", "Поиск модели"],
  [
    "Məsələn: RAV4, Panamera, GLS…",
    "For example: RAV4, Panamera, GLS…",
    "Например: RAV4, Panamera, GLS…",
  ],
  ["Şirkət", "Company", "Компания"],
  ["Şəxsi sahib", "Private owner", "Частный владелец"],
  ["Avtomat", "Automatic", "Автомат"],
  ["Mexaniki", "Manual", "Механика"],
  ["Benzin", "Petrol", "Бензин"],
  ["Dizel", "Diesel", "Дизель"],
  ["Hibrid", "Hybrid", "Гибрид"],
  ["Elektrik", "Electric", "Электро"],
  ["/ gün", "/ day", "/ день"],
  ["yer", "seats", "мест"],
  ["Elana bax", "View listing", "Посмотреть объявление"],
  ["Ətraflı məlumat", "Details", "Подробная информация"],
  ["Kirayə şərtləri", "Rental terms", "Условия аренды"],
  ["Əlaqə", "Contact", "Контакты"],
  ["Zəng et", "Call", "Позвонить"],
  ["Telefon nömrəsi", "Phone number", "Номер телефона"],
  [
    "Bu nümunə elanda real əlaqə nömrəsi göstərilmir.",
    "This sample listing has no real contact number.",
    "В этом примере не указан реальный номер телефона.",
  ],
  ["Nümunə elan", "Sample listing", "Пример объявления"],
  ["NÜMUNƏ ELAN", "SAMPLE LISTING", "ПРИМЕР ОБЪЯВЛЕНИЯ"],
  ["ELAN", "LISTING", "ОБЪЯВЛЕНИЕ"],
  ["Bağla", "Close", "Закрыть"],
  ["Filtrləri təmizlə", "Clear filters", "Сбросить фильтры"],
  [
    "Bu seçimə uyğun avtomobil yoxdur.",
    "No cars match these filters.",
    "По этим фильтрам автомобили не найдены.",
  ],
  [
    "Təqdimat kataloqu · Real fotolar, nümunə qiymətlər",
    "Sample catalog · Real photos, example prices",
    "Демонстрационный каталог · Реальные фото, примерные цены",
  ],
  [
    "Sahiblə birbaşa əlaqə",
    "Contact owners directly",
    "Связь напрямую с владельцем",
  ],
  [
    "İlk elanın pulsuzdur",
    "Your first listing is free",
    "Первое объявление бесплатно",
  ],
  ["Yoxlanılmış elanlar", "Reviewed listings", "Проверенные объявления"],
  ["Daha rahat seçim üçün", "Choose with confidence", "Для удобного выбора"],
  ["Hər zövqə uyğun seçim", "A car for every need", "Выбор на любой вкус"],
  ["Ekonomdan premiuma", "From economy to premium", "От эконома до премиума"],
  [
    "Vasitəçisiz, əlavə xərcsiz",
    "Direct contact, no middlemen",
    "Без посредников",
  ],
  [
    "Avtomobilindən gəlir qazan",
    "Earn from your car",
    "Зарабатывайте на своём авто",
  ],
  ["İdarəetmə paneli", "Management dashboard", "Панель управления"],
  ["İDARƏETMƏ PANELİ", "MANAGEMENT DASHBOARD", "ПАНЕЛЬ УПРАВЛЕНИЯ"],
  ["İcmal", "Overview", "Обзор"],
  ["Elanlar", "Listings", "Объявления"],
  ["Sahiblər", "Owners", "Владельцы"],
  ["Yoxlanış", "Review", "Проверка"],
  ["Bələdçi", "Guide", "Инструкция"],
  ["Sayta qayıt", "Back to site", "Вернуться на сайт"],
  ["Hər şey nəzarətində.", "Your rental workspace.", "Всё под контролем."],
  ["Aktiv elanlar", "Active listings", "Активные объявления"],
  ["Yoxlanış gözləyən", "Pending review", "На проверке"],
  ["Premium elanlar", "Premium listings", "Премиум-объявления"],
  ["VIP elanlar", "VIP listings", "VIP-объявления"],
  [
    "Sahibin adından elan yerləşdir",
    "List on behalf of an owner",
    "Разместить от имени владельца",
  ],
  [
    "Nümunə kataloquna bax",
    "View sample catalog",
    "Открыть демонстрационный каталог",
  ],
  ["Ehtiyat nüsxəni endir", "Download backup", "Скачать резервную копию"],
  ["Avtomobil sahibləri", "Car owners", "Владельцы автомобилей"],
  ["Elanların idarə edilməsi", "Manage listings", "Управление объявлениями"],
  ["Elan axtar", "Search listings", "Поиск объявлений"],
  [
    "Avtomobil və ya sahib axtar…",
    "Search car or owner…",
    "Поиск авто или владельца…",
  ],
  ["Bütün elanlar", "All listings", "Все объявления"],
  ["Aktiv", "Active", "Активно"],
  ["Dayandırılmış", "Paused", "Приостановленные"],
  ["Dayandırılıb", "Paused", "Приостановлено"],
  ["Redaktə et", "Edit", "Редактировать"],
  ["Dayandır", "Pause", "Приостановить"],
  ["Aktivləşdir", "Activate", "Активировать"],
  ["Sil", "Delete", "Удалить"],
  ["Standart", "Standard", "Стандарт"],
  ["Təsdiqlə", "Approve", "Одобрить"],
  ["Rədd et", "Reject", "Отклонить"],
  ["Elanlarına bax", "View listings", "Посмотреть объявления"],
  ["Hesaba bağlanıb", "Account linked", "Аккаунт привязан"],
  ["Giriş gözlənilir", "Awaiting sign-up", "Ожидает регистрации"],
  ["İŞ MƏKANI", "WORKSPACE", "РАБОЧЕЕ ПРОСТРАНСТВО"],
  ["Avtoparkına ümumi baxış", "Your fleet at a glance", "Обзор автопарка"],
  ["Elanları idarə et", "Manage listings", "Управлять объявлениями"],
  ["Sahib profilləri", "Owner profiles", "Профили владельцев"],
  ["Yoxlanış gözləyənlər", "Pending listings", "Объявления на проверке"],
  [
    "Qorunan admin iş məkanı",
    "Protected admin workspace",
    "Защищённая панель администратора",
  ],
  [
    "Yoxlanış gözləyən elanlar",
    "Listings awaiting review",
    "Объявления, ожидающие проверки",
  ],
  ["QEYDİYYAT", "SIGN UP", "РЕГИСТРАЦИЯ"],
  ["Hesabını tamamlayaq.", "Complete your account.", "Завершите регистрацию."],
  [
    "Hər telefon nömrəsi yalnız bir hesaba bağlanır.",
    "Each phone number can belong to only one account.",
    "Каждый номер телефона привязывается только к одному аккаунту.",
  ],
  ["Rentakar şirkəti", "Rental company", "Прокатная компания"],
  ["Firma adı", "Company name", "Название компании"],
  ["Ad və soyad", "Full name", "Имя и фамилия"],
  ["Firmanızın adı", "Your company name", "Название вашей компании"],
  ["Adınız və soyadınız", "Your full name", "Ваше имя и фамилия"],
  ["Qeydiyyatı tamamla", "Complete registration", "Завершить регистрацию"],
  ["Saxlanılır…", "Saving…", "Сохранение…"],
  ["ŞƏXSİ HESAB", "MY ACCOUNT", "ЛИЧНЫЙ КАБИНЕТ"],
  ["XOŞ GƏLMİSİNİZ", "WELCOME", "ДОБРО ПОЖАЛОВАТЬ"],
  ["Şəxsi hesab", "Personal account", "Личный аккаунт"],
  ["Admin hesabı", "Admin account", "Аккаунт администратора"],
  ["Elanlarım", "My listings", "Мои объявления"],
  ["Hesabdan çıx", "Log out", "Выйти"],
  [
    "Hələ hesabına bağlı elan yoxdur.",
    "You have no listings yet.",
    "У вас пока нет объявлений.",
  ],
  [
    "Yalnız sənin hesabına bağlı elanlar göstərilir.",
    "Only listings linked to your account are shown.",
    "Показаны только объявления вашего аккаунта.",
  ],
  [
    "Giriş xidməti yoxlanır…",
    "Checking sign-in availability…",
    "Проверяем доступность входа…",
  ],
  ["Sayt açılır…", "Loading…", "Загрузка…"],
  ["Qeydiyyat", "Sign up", "Регистрация"],
  ["Daxil ol", "Log in", "Войти"],
  ["SMS kodu göndər", "Send SMS code", "Отправить код"],
  ["Təsdiq kodu", "Verification code", "Код подтверждения"],
  ["Kodu təsdiqlə", "Verify code", "Подтвердить код"],
  ["Nömrəni dəyiş", "Change number", "Изменить номер"],
  [
    "SMS xidməti hələ qoşulmayıb. Nömrə ilə giriş hazırda aktiv deyil.",
    "SMS is not connected yet. Phone sign-in is currently unavailable.",
    "SMS-сервис ещё не подключён. Вход по номеру пока недоступен.",
  ],
  [
    "Kod göndərildi. Telefonuna gələn 6 rəqəmli kodu yaz.",
    "Code sent. Enter the 6-digit code from your phone.",
    "Код отправлен. Введите 6-значный код из SMS.",
  ],
  ["BİRLİKDƏ BÖYÜYƏK", "GROW WITH US", "РАСТИТЕ С НАМИ"],
  [
    "Avtoparkını daha çox insan görsün.",
    "Give your fleet more visibility.",
    "Пусть ваш автопарк увидят больше людей.",
  ],
  [
    "İlk elanını yerləşdir",
    "Create your first listing",
    "Разместить первое объявление",
  ],
  ["NECƏ İŞLƏYİR?", "HOW IT WORKS", "КАК ЭТО РАБОТАЕТ"],
  [
    "Seç. Əlaqə saxla. Yola çıx.",
    "Choose. Contact. Drive.",
    "Выберите. Свяжитесь. Поезжайте.",
  ],
  ["CƏMİ 3 ADDIM", "JUST 3 STEPS", "ВСЕГО 3 ШАГА"],
  [
    "Yola çıxmaq bu qədər asandır.",
    "Renting a car is this simple.",
    "Арендовать авто так просто.",
  ],
  ["Avtomobilini seç", "Choose your car", "Выберите автомобиль"],
  ["Sahibi ilə danış", "Contact the owner", "Свяжитесь с владельцем"],
  ["Yolun dadını çıxar", "Enjoy your rental", "Пользуйтесь автомобилем"],
  [
    "Şəhər, marka və büdcənə görə axtar.",
    "Search by city, brand and budget.",
    "Ищите по городу, марке и бюджету.",
  ],
  [
    "Şərtləri telefon və ya WhatsApp ilə dəqiqləşdir.",
    "Confirm terms by phone or WhatsApp.",
    "Уточните условия по телефону или WhatsApp.",
  ],
  [
    "Avtomobili təhvil al və səyahətə başla.",
    "Pick up your car and start driving.",
    "Получите автомобиль и отправляйтесь в путь.",
  ],
  [
    "Avtomobilin boş dayanmasın.",
    "Put your car to work.",
    "Ваш автомобиль может приносить доход.",
  ],
  ["Pulsuz elan yerləşdir", "Post a free listing", "Разместить бесплатно"],
  [
    "İlk elanını pulsuz yerləşdir, yeni müştərilər qazan.",
    "Post your first listing free and reach new customers.",
    "Разместите первое объявление бесплатно и найдите клиентов.",
  ],
  [
    "İLK ELANIN PULSUZDUR",
    "YOUR FIRST LISTING IS FREE",
    "ПЕРВОЕ ОБЪЯВЛЕНИЕ БЕСПЛАТНО",
  ],
  ["Elanı redaktə et", "Edit listing", "Редактировать объявление"],
  ["Avtomobilini paylaş", "List your car", "Добавить автомобиль"],
  ["Dəyişiklikləri saxla", "Save changes", "Сохранить изменения"],
  ["Elanı dərc et", "Publish listing", "Опубликовать"],
  ["Yoxlanışa göndər", "Submit for review", "Отправить на проверку"],
  ["Sahib məlumatları", "Owner information", "Данные владельца"],
  ["Mövcud sahib", "Existing owner", "Существующий владелец"],
  [
    "Yeni sahib profili yarat",
    "Create owner profile",
    "Создать профиль владельца",
  ],
  ["Sahibin tipi", "Owner type", "Тип владельца"],
  [
    "Sahibin / şirkətin adı",
    "Owner / company name",
    "Имя владельца / компания",
  ],
  ["Telefon — yalnız əlaqə üçün", "Contact phone", "Контактный телефон"],
  [
    "Sahibin Google e-poçtu (istəyə bağlı)",
    "Owner email (optional)",
    "Email владельца (необязательно)",
  ],
  ["Avtomobil haqqında", "Vehicle information", "Об автомобиле"],
  ["Buraxılış ili", "Year", "Год выпуска"],
  ["Kateqoriya", "Category", "Категория"],
  ["Oturacaq sayı", "Seats", "Количество мест"],
  ["Yanacaq", "Fuel", "Топливо"],
  ["Sürətlər qutusu", "Transmission", "Коробка передач"],
  ["Qiymət və əlavə məlumat", "Price and information", "Цена и информация"],
  ["Günlük qiymət (₼)", "Daily price (₼)", "Цена за день (₼)"],
  ["Elanın təqdimatı", "Listing promotion", "Продвижение объявления"],
  [
    "Avtomobil haqqında əlavə məlumat",
    "Additional information",
    "Дополнительная информация",
  ],
  [
    "Avtomobil haqqında qısa məlumat…",
    "A short description of the car…",
    "Краткое описание автомобиля…",
  ],
  ["Avtomobilin fotosu", "Vehicle photo", "Фото автомобиля"],
  [
    "Şəkil ünvanı (istəyə bağlı)",
    "Image URL (optional)",
    "Ссылка на фото (необязательно)",
  ],
  ["Elanın hazırkı fotosu", "Current photo", "Текущее фото"],
  ["Elan silinsin?", "Delete listing?", "Удалить объявление?"],
  ["Ləğv et", "Cancel", "Отмена"],
  ["Bəli, sil", "Yes, delete", "Да, удалить"],
];
rows.push(
  ...[
    ["Əsas menyu", "Main navigation", "Главное меню"],
    ["İdarəetmə bölmələri", "Dashboard sections", "Разделы управления"],
    [
      "Elanları, sahibləri və yoxlanışları idarə et. Giriş yalnız təsdiqlənmiş admin hesabına açıqdır.",
      "Manage listings, owners and reviews. Access is limited to the verified administrator.",
      "Управляйте объявлениями, владельцами и проверками. Доступ только у подтверждённого администратора.",
    ],
    [
      "Elanları, sahibləri və yoxlanışları bir yerdən idarə et.",
      "Manage listings, owners and reviews in one place.",
      "Управляйте объявлениями, владельцами и проверками в одном месте.",
    ],
    [
      "Qiymət, təqdimat və aktivlik statusu.",
      "Price, promotion and availability.",
      "Цена, продвижение и доступность.",
    ],
    [
      "profil və onlara aid avtomobillər.",
      "profiles and their vehicles.",
      "профилей и их автомобили.",
    ],
    [
      "elan qərarını gözləyir.",
      "listings awaiting your decision.",
      "объявлений ожидают решения.",
    ],
    [
      "Məlumatlar serverdə saxlanır. Sahib profilləri və şəxsi e-poçtlar yalnız icazəli hesablara göstərilir.",
      "Data is stored on the server. Owner profiles and private emails are restricted to authorized accounts.",
      "Данные хранятся на сервере. Профили и личные email доступны только уполномоченным аккаунтам.",
    ],
    ["HESABDAN ƏVVƏL DƏ SAHİB PROFİLİ", "OWNER PROFILES", "ПРОФИЛИ ВЛАДЕЛЬЦЕВ"],
    ["Sahib axtar", "Search owners", "Поиск владельцев"],
    [
      "Ad, telefon və ya e-poçt ilə axtar…",
      "Search name, phone or email…",
      "Имя, телефон или email…",
    ],
    [
      "Hələ sahib profili yoxdur. Sahibin adından ilk elanı yerləşdirin.",
      "No owner profiles yet. Create the first listing on behalf of an owner.",
      "Профилей пока нет. Разместите первое объявление от имени владельца.",
    ],
    ["aktiv elan", "active listings", "активных объявлений"],
    ["yoxlanışda", "pending review", "на проверке"],
    [
      "Yeni elan yoxdur. “Elan yerləşdir” vasitəsilə nümunə elan göndərə bilərsiniz.",
      "No listings awaiting review.",
      "Нет объявлений на проверке.",
    ],
    ["₼ / gün", "₼ / day", "₼ / день"],
    ["Elan statusu", "Listing status", "Статус объявления"],
    ["elan", "listings", "объявлений"],
    ["Nümunə", "Sample", "Пример"],
    [
      "Bu seçimə uyğun elan yoxdur.",
      "No matching listings.",
      "Объявления не найдены.",
    ],
    [
      "Admin üçün qısa bələdçi",
      "Administrator guide",
      "Инструкция администратора",
    ],
    ["Elanlar:", "Listings:", "Объявления:"],
    [
      "Sahib seçin, avtomobili və şərtləri doldurun. Adminin elanı dərhal görünür; ziyarətçinin elanı yoxlanışa düşür.",
      "Select an owner and enter the vehicle details. Administrator listings appear immediately; user listings require review.",
      "Выберите владельца и заполните данные. Объявления администратора публикуются сразу, объявления пользователей проходят проверку.",
    ],
    ["VIP və Premium:", "VIP and Premium:", "VIP и Премиум:"],
    [
      "Ödəniş etmədən statusu paneldən dəyişə bilərsiniz. Premium əvvəl, VIP sonra, standart elanlar isə onların ardınca göstərilir.",
      "Change promotion in the dashboard. Premium listings appear first, followed by VIP and standard listings.",
      "Меняйте продвижение в панели. Сначала показываются Премиум, затем VIP и стандартные объявления.",
    ],
    ["Dayandırma:", "Pausing:", "Приостановка:"],
    [
      "Avtomobil kirayədədirsə, elanı silmədən kataloqdan gizlədin.",
      "Hide a rented vehicle without deleting the listing.",
      "Скройте занятый автомобиль, не удаляя объявление.",
    ],
    ["Sahiblər:", "Owners:", "Владельцы:"],
    [
      "Eyni sahibin yeni avtomobili üçün mövcud profili seçin. Sahibin təsdiqlənmiş Google hesabı profilə bağlanır.",
      "Select the existing owner profile for additional vehicles. Only verified accounts can access linked profiles.",
      "Для следующего автомобиля выбирайте существующий профиль владельца. Доступ получают только подтверждённые аккаунты.",
    ],
    ["Məlumatlar:", "Data:", "Данные:"],
    [
      "Dəyişikliklər serverdə saxlanır. Şəxsi məlumatlar yalnız icazəli hesablara açıqdır. Ödəniş sistemi hələ aktiv deyil.",
      "Changes are saved on the server. Private data is restricted to authorized accounts. Payments are not enabled yet.",
      "Изменения сохраняются на сервере. Личные данные доступны только уполномоченным аккаунтам. Оплата ещё не подключена.",
    ],
    ["SEÇİM SƏNİNDİR", "CHOOSE YOUR CAR", "ВЫБЕРИТЕ АВТОМОБИЛЬ"],
    [
      "Planına və büdcənə uyğun avtomobilləri kəşf et.",
      "Find a car that suits your needs and budget.",
      "Найдите автомобиль под ваши задачи и бюджет.",
    ],
    ["Elan sıralaması", "Sort listings", "Сортировка объявлений"],
    ["Elanı bəyən", "Save to favorites", "Добавить в избранное"],
    [
      "SƏNİN AVTOMOBİLİN, SƏNİN QAZANCIN",
      "YOUR CAR, YOUR INCOME",
      "ВАШ АВТОМОБИЛЬ, ВАШ ДОХОД",
    ],
    ["Elanı sil", "Delete listing", "Удалить объявление"],
    [
      "kataloqdan və serverdən silinəcək. Elanı sadəcə gizlətmək üçün dayandırma funksiyasından istifadə edə bilərsiniz.",
      "will be removed from the catalog and server. To hide it temporarily, use Pause instead.",
      "будет удалён из каталога и с сервера. Чтобы временно скрыть его, используйте приостановку.",
    ],
    ["· NÜMUNƏ ELAN", "· SAMPLE LISTING", "· ПРИМЕР ОБЪЯВЛЕНИЯ"],
    ["SAHİB PROFİLİ", "OWNER PROFILE", "ПРОФИЛЬ ВЛАДЕЛЬЦА"],
    ["₼ / gün ·", "₼ / day ·", "₼ / день ·"],
    [
      "Telefon nömrənə gələn kodla hesabını təsdiqlə.",
      "Verify your account with the code sent to your phone.",
      "Подтвердите аккаунт кодом из SMS.",
    ],
    [
      "Rentakar şirkətləri və şəxsi sahiblər üçün ilk aktiv elan pulsuzdur. 3 və 10 avtomobillik paketlər, VIP yerləşdirmə və şirkət profilləri nəzərdə tutulur.",
      "The first active listing is free for companies and private owners. Fleet packages and VIP promotion are planned.",
      "Первое активное объявление бесплатно для компаний и частных владельцев. Планируются пакеты для автопарков и VIP-продвижение.",
    ],
    [
      "Avtomobili filtrlərlə tap, elanın şərtlərini oxu və sahibi ilə birbaşa əlaqə saxla. Qiyməti, depoziti, sığortanı və təhvil şərtlərini ödənişdən əvvəl sahibi ilə dəqiqləşdir.",
      "Use filters to find a car, read its terms and contact the owner. Confirm price, insurance and handover arrangements before paying.",
      "Найдите авто через фильтры, прочитайте условия и свяжитесь с владельцем. До оплаты уточните цену, страховку и передачу автомобиля.",
    ],
    [
      "Avtomobil yerləşdirmək üçün elan formasını doldur. Təsdiqlənən elanlar kataloqda görünür.",
      "Complete the listing form to add a vehicle. Approved listings appear in the catalog.",
      "Заполните форму объявления. Одобренные объявления появятся в каталоге.",
    ],
    [
      "Elanı şirkətin və ya şəxsi sahibin profili ilə əlaqələndir.",
      "Link the listing to a company or private owner.",
      "Привяжите объявление к компании или частному владельцу.",
    ],
    [
      "Axtarışda düzgün görünməsi üçün məlumatları dəqiq qeyd et.",
      "Enter accurate information so the car appears in relevant searches.",
      "Укажите точные данные, чтобы автомобиль находили в поиске.",
    ],
    [
      "Müştəri avtomobili seçməzdən əvvəl bu şərtləri görəcək.",
      "Customers can review this information before choosing.",
      "Клиенты увидят эти данные перед выбором.",
    ],
    [
      "Elana aid real fotonun HTTPS ünvanını əlavə et. Foto yükləmə xidməti hələ qoşulmayıb.",
      "Add an HTTPS link to a real photo of the vehicle. Direct file uploads are not connected yet.",
      "Добавьте HTTPS-ссылку на настоящее фото автомобиля. Загрузка файлов ещё не подключена.",
    ],
    ["Hesab:", "Account:", "Аккаунт:"],
    [
      "Qiymət gündəlik kirayə üçündür. Təhvil yeri, müddət və ödəniş şərtləri sahibi ilə dəqiqləşdirilir.",
      "The price is per day. Confirm pickup, duration and payment terms with the owner.",
      "Цена указана за сутки. Место передачи, срок и оплату уточняйте у владельца.",
    ],
    [
      "Hər sahibin elanları öz profilinə bağlanır. Telefonla giriş SMS kodu ilə təsdiqlənir.",
      "Listings are linked to their owner's profile. Phone sign-in requires an SMS code.",
      "Объявления привязаны к профилю владельца. Вход по телефону подтверждается SMS-кодом.",
    ],
    ["avtomobil mövcuddur", "cars available", "автомобилей"],
    ["Bəyəndiyin avtomobillər", "Your favorite cars", "Избранные автомобили"],
    [
      "Elan yoxlanışdan sonra görünəcək. Onu şəxsi hesabından izləyə və redaktə edə bilərsən.",
      "Your listing will appear after review. Track and edit it in your account.",
      "Объявление появится после проверки. Управляйте им в личном кабинете.",
    ],
    [
      "Elan seçdiyiniz sahibin profilinə əlavə ediləcək və dərhal kataloqda görünəcək. Telefon qeydiyyat üçün deyil, əlaqə üçündür.",
      "The listing will be added to the selected owner and published immediately.",
      "Объявление будет добавлено выбранному владельцу и сразу опубликовано.",
    ],
    [
      "Yenilənmiş şərtləri sahibi ilə dəqiqləşdirin.",
      "Confirm current terms with the owner.",
      "Уточните актуальные условия у владельца.",
    ],
  ],
);
rows.push(
  [
    "Təhvil yeri, kirayə müddəti və ödəniş haqqında məlumat…",
    "Pickup, rental duration and payment information…",
    "Место передачи, срок аренды и условия оплаты…",
  ],
  [
    "Nümunə elan. Foto təqdimat üçündür; qiymət, buraxılış ili və şərtlər real kirayə təklifi deyil.",
    "Sample listing. The photo, price, year and terms are for demonstration only.",
    "Пример объявления. Фото, цена, год и условия приведены для демонстрации.",
  ],
);
rows.push(
  ["Bakı", "Baku", "Баку"],
  ["Gəncə", "Ganja", "Гянджа"],
  ["Sumqayıt", "Sumgayit", "Сумгаит"],
  ["Qəbələ", "Gabala", "Габала"],
  ["Şəki", "Shaki", "Шеки"],
  ["Lənkəran", "Lankaran", "Ленкорань"],
  ["Quba", "Guba", "Губа"],
  ["Naxçıvan", "Nakhchivan", "Нахчыван"],
  ["Digər", "Other", "Другое"],
  ["Göndərilir…", "Sending…", "Отправка…"],
  [
    "Bu nömrə artıq başqa hesabda qeydiyyatdan keçib.",
    "This phone number is already registered to another account.",
    "Этот номер уже зарегистрирован в другом аккаунте.",
  ],
  [
    "Telefon nömrəsini düzgün daxil edin.",
    "Enter a valid phone number.",
    "Введите правильный номер телефона.",
  ],
  [
    "Təsdiq kodu düzgün deyil.",
    "The verification code is incorrect.",
    "Неверный код подтверждения.",
  ],
  [
    "Təsdiq kodunu yoxlayın və yenidən cəhd edin.",
    "Check the verification code and try again.",
    "Проверьте код и попробуйте снова.",
  ],
  [
    "Çox sayda cəhd edildi. 15 dəqiqə sonra yenidən yoxlayın.",
    "Too many attempts. Try again in 15 minutes.",
    "Слишком много попыток. Повторите через 15 минут.",
  ],
  [
    "Elan yerləşdirmək üçün daxil olun.",
    "Log in to post a listing.",
    "Войдите, чтобы разместить объявление.",
  ],
);
const map = new Map(rows.map(([az, en, ru]) => [az, { en, ru }]));
export function t(value) {
  if (value === "yer")
    return language === "en" ? " seats" : language === "ru" ? " мест" : " yer";
  if (typeof value !== "string" || language === "az") return value;
  if(["aktiv elan","yoxlanışda","elan","profil və onlara aid avtomobillər.","elan qərarını gözləyir."].includes(value))return " "+(language==="az"?value:map.get(value)?.[language]||value);
  const exact = map.get(value.trim());
  if (exact) return exact[language];
  const numeric = value.match(
    /^(\d+) (avtomobil mövcuddur|yer|elan|aktiv elan|yoxlanışda)$/,
  );
  if (numeric) {
    const suffix = {
      en: {
        "avtomobil mövcuddur": "cars available",
        yer: "seats",
        elan: "listings",
        "aktiv elan": "active listings",
        yoxlanışda: "pending",
      },
      ru: {
        "avtomobil mövcuddur": "автомобилей",
        yer: "мест",
        elan: "объявлений",
        "aktiv elan": "активных объявлений",
        yoxlanışda: "на проверке",
      },
    };
    return numeric[1] + " " + suffix[language][numeric[2]];
  }
  return value;
}
