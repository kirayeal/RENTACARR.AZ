> Əsas giriş indi telefon + SMS kodudur: [PHONE_ACCESS.md](PHONE_ACCESS.md). Google düyməsi standart olaraq gizlidir. Bu sənəddəki Google bağlantısını aktiv etmək üçün əlavə olaraq `GOOGLE_LOGIN_ENABLED=true` təyin olunmalıdır. İstifadəçinin hazırkı seçiminə görə bu parametr `false` qalır.

# Google girişi və məlumatların ayrılması

## Nə dəyişdi

Açıq demo admin girişi çıxarılıb. Telefon və ya e-poçt yazmaqla qeydiyyat yoxdur. Google ID tokeninin imzası, issuer, audience və vaxtı rəsmi Google kitabxanası ilə serverdə yoxlanır. `email_verified` və serverin yaratdığı nonce də tələb olunur. Sessiya HttpOnly cookie ilə saxlanır; admin rolu müştəridən qəbul edilmir.

Yalnız təsdiqlənmiş **rentacarr.az@gmail.com** hesabı admin olur. Adi istifadəçinin `/api/workspace` sorğusu yalnız onun sahib profillərini və elanlarını qaytarır. `/api/listings` yalnız aktiv elanları və açıq əlaqə məlumatlarını qaytarır; şəxsi e-poçtları qaytarmır. Yazma, VIP, təsdiqləmə və sahib dəyişmə icazələri serverdə yoxlanır.

## Vercel-də aktivləşdirmə

Vercel → layihə → Settings → Environment Variables bölməsinə aşağıdakıları daxil edin. Məxfi dəyərləri çata və GitHub-a yazmayın.

1. `GOOGLE_CLIENT_ID`: Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web application. Consent screen məlumatlarını tamamlayın. Authorized JavaScript origins siyahısına saytın dəqiq HTTPS ünvanını əlavə edin. Lokal yoxlama üçün ayrıca öz lokal origininizi əlavə edin. ID token/GIS istifadə olunur; OAuth client secret və redirect callback tələb olunmur. Test rejimində qalırsınızsa, Google hesablarını test users siyahısına əlavə edin.
2. `AUTH_SECRET`: ən az 32 simvolluq təsadüfi, məxfi imzalama açarı. `VITE_` prefiksi ilə saxlamayın. Dəyişdikdə mövcud sessiyalar etibarsız olur. Öz kompüterinizdə Node ilə yarada bilərsiniz: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. `DATABASE_URL`: Neon Postgres bağlantısı. Vercel Storage/Marketplace vasitəsilə Neon bazası yaradıb layihəyə bağlamaq olar. HTTPS SQL sürücüsü Neon üçün nəzərdə tutulub. URL-dəki parolu məxfi saxlayın.

Sonra Vercel-də **Redeploy** edin. Bu üç parametr olmadıqda Google düyməsi göstərilmir və admin panelinə giriş verilmir. İndiki icra mühitində bu parametrlər yoxdur; real Google girişi və real verilənlər bazası ilə yoxlama hələ edilməyib.

## Sahibin adından əvvəlcədən elan

Admin sahib profili yaradarkən sahibin Google hesabının e-poçtunu dəqiq qeyd edir. Sahib sonradan həmin e-poçtla Google vasitəsilə təsdiqlənmiş giriş etdikdə, yalnız admin tərəfindən əvvəlcədən səlahiyyət verilmiş, hələ hesaba bağlanmamış profillər onun sabit Google `sub` identifikatoruna bağlanır. Telefon eyniləşdirmə və giriş üçün istifadə olunmur. Artıq başqa hesaba bağlanmış profil giriş zamanı avtomatik dəyişdirilmir.

Adminin elanları birbaşa aktiv olur və adminə pulsuz elan limiti tətbiq edilmir. Adi hesab üçün bir elan limiti serverdə yoxlanır; elan əvvəlcə yoxlanışa düşür. Adi istifadəçi öz elanını dəyişdikdə yenidən yoxlanış tələb olunur. Ödənişli paket və ödəniş sistemi hələ yoxdur.

## Lokal işlətmə

`.env.example` nümunəsindəki dəyişənləri izlənməyən `.env.local` faylında saxlayın. `npm run dev -- --port 3000` frontend və API-ni birgə açır. `npm run preview` yalnız statik frontend üçündür; Google/API yoxlaması üçün istifadə etməyin.

Əvvəlki localStorage demo məlumatları serverə avtomatik köçürülmür və başqa hesablara göstərilmir. Köhnə lokal yaddaş silinmir. Real məlumat bazası boş olanda ümumi kataloqda 10 təqdimat elanı qalır; onlar şəxsi hesabların elanları deyil.

## Qeydiyyatı tamamlamaq

Google hesabı təsdiqləndikdən sonra istifadəçi firma/şəxsi sahib seçimini, adını və mobil nömrəsini daxil edir. Admin də bu mərhələni tamamlayır. Telefon Azərbaycan mobil formatına normallaşdırılır və bazada UNIQUE məhdudiyyəti ilə yalnız bir hesaba verilir. Başqa Google hesabı həmin nömrəni götürə bilmir. Bu, nömrənin SMS vasitəsilə sahiblik təsdiqi deyil; SMS xidməti hələ qoşulmayıb. Telefon əsasında başqa sahibin elanları avtomatik hesaba keçirilmir.

İstifadəçi qeydiyyatı tamamlamadan yeni elan göndərə bilmir. Admin rolu yenə yalnız Google tərəfindən təsdiqlənmiş rentacarr.az@gmail.com hesabına verilir. Adminin hesabında “İdarəetmə paneli” göstərilir; adi istifadəçiyə göstərilmir.
