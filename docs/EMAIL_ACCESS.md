# E-poçt və şifrə ilə hesablar

## Vercel-də qeydiyyatı aktiv etmək

1. Vercel → layihə → Storage/Marketplace bölməsində Neon Postgres bazasını layihəyə bağlayın. `DATABASE_URL` yaranmalıdır.
2. Settings → Environment Variables bölməsinə ən az 32 təsadüfi simvoldan ibarət `AUTH_SECRET` əlavə edin. Dəyəri məxfi saxlayın. Lokal Node ilə yarada bilərsiniz: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. Redeploy edin. Normal ad/e-poçt/telefon/şifrə qeydiyyatı üçün bu iki parametr kifayətdir.

## Altı rəqəmli bərpa məktubu

Vercel funksiyanı işlədir, məktubun çatdırılması üçün poçt hesabı və ya xidmət lazımdır. İki seçimdən yalnız biri kifayətdir:

- **Gmail:** `SMTP_USER` — göndərən Gmail ünvanı; `SMTP_PASSWORD` — Google hesabında yaradılmış tətbiq şifrəsi (App Password). Adi Gmail şifrəsini istifadə etməyin. Tətbiq şifrəsi üçün Google hesabında iki mərhələli təsdiq tələb oluna bilər. Nodemailer Gmail transportu standart TLS yoxlaması ilə istifadə olunur.
- **Resend:** `RESEND_API_KEY` və həmin xidmətdə təsdiqlənmiş göndərən ünvanı olan `MAIL_FROM`.

Bu dəyərləri Vercel Environment Variables bölməsinə yazıb Redeploy edin. Məxfi açarları çata və GitHub-a yazmayın. Hazırkı icra mühitində real poçt bağlantısı yoxdur; məktubun real çatdırılması yoxlanılmayıb. Testlərdə məktub xidməti idarə olunan əvəzləyici ilə yoxlanıb.

## Axın

- Qeydiyyat: ad və soyad, e-poçt, əlaqə telefonu, şifrə. Şirkət seçilərsə ayrıca firma adı.
- Telefon yalnız əlaqə üçündür, SMS girişi yoxdur. Eyni normallaşdırılmış nömrə ikinci hesab üçün qəbul edilmir.
- Şifrələr təsadüfi salt ilə scrypt vasitəsilə hash olunur. Açıq şifrə bazada və məktubda saxlanmır.
- Bərpa məktubunda 6 rəqəmli kod göndərilir. Kod 10 dəqiqə etibarlıdır, bazada yalnız HMAC izi saxlanır, 5 yanlış cəhddən sonra bağlanır və bir dəfə istifadə olunur.
- Şifrə yenilənəndə əvvəlki sessiyalar ləğv olunur.
- Adi hesab sahibə əvvəlcədən aid edilmiş elanlara e-poçtu sadəcə yazmaqla giriş ala bilmir. E-poçt sahibliyi təsdiqlənəndən sonra uyğun əvvəlcədən icazələndirilmiş profil bağlanır.
- `rentacarr.az@gmail.com` admin rolu üçün e-poçt sahibliyi 6 rəqəmli kodla və ya gələcəkdə aktivləşdirilən Google ilə təsdiqlənməlidir. Admin ünvanını bilmək və formaya yazmaq admin girişini açmır.
- Google düyməsi `GOOGLE_LOGIN_ENABLED=false` olduğu müddətdə gizlidir.

## Yoxlama

`npm test` SQL sorğularını PGlite PostgreSQL mühərrikində icra edir; parol, qeydiyyat, təkrar nömrə, kodun vaxtı, cəhd limiti, kodun təkrar istifadəsi, sessiyaların ləğvi və şəxsi məlumatların ayrılması yoxlanır. Bu, real Neon şəbəkəsi və real Gmail/Resend çatdırılması yoxlaması deyil.
