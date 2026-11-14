# RENTACARR.AZ

Azərbaycan, ingilis və rus dillərində avtomobil kirayəsi platforması. React/Vite frontend, Vercel Node API və Neon Postgres.

## Yeni görünüş

Açıq fon, mavi vurğu, üfüqi axtarış və avtomobil kateqoriyaları ilə kataloq. Telefonda filtrlər ayrıca açılır. Kataloq hər səhifədə 6 elan göstərir; filtrlər və sıralama dəyişəndə birinci səhifəyə qayıdır. Mobil kartlar yığcam üfüqi görünüşdədir. Kart və siyahı görünüşü, AZ/EN/RU dilləri və hesab üzrə saxlanan seçilmişlər mövcuddur.

Hər elan `?elan=ID` ünvanında ayrıca səhifə kimi açılır; paylaşma, səhifəni yeniləmə və brauzerin geri/irəli keçidi işləyir. Foto, gündəlik/həftəlik/aylıq qiymətlər, depozit, yürüş limiti, yaş və staj tələbləri, sahibin əlaqəsi bir yerdə göstərilir. Tarix seçimi günlük qiymətlə təxmini məbləği hesablayır və WhatsApp sorğusuna əlavə olunur; rezervasiya yaratmır və mövcudluğu təsdiqləmir. Hesablayıcı istəyə görə açılır; depozit və sahibin əlaqəsi əvvəl göstərilir. Nümunə elanlar ayrıca işarələnir, məxfilik məlumatı və dəstək üçün e-poçt keçidi mövcuddur.

Təqdimat elanları real kirayə təklifi deyil; nümunələrə uydurma telefon nömrəsi verilmir. Foto mənbələri public/photos/SOURCES.txt faylındadır.

## Qeydiyyat və giriş

**Ad + e-poçt + telefon + şifrə.** Şirkət üçün əlavə firma adı. Telefon giriş üsulu deyil. Təkrar nömrə və e-poçt bazada qəbul edilmir. Şifrələr scrypt ilə hash olunur.

Şifrə unudulduqda e-poçta 6 rəqəmli, 10 dəqiqəlik, bir dəfə istifadə olunan kod göndərilir. Səhv cəhd limiti var; şifrə yenilənəndə köhnə sessiyalar ləğv edilir. Adminin e-poçt sahibliyi ayrıca təsdiqlənir. Google girişi standart olaraq gizlidir.

**Canlı qeydiyyat üçün `DATABASE_URL` və `AUTH_SECRET` lazımdır. Bərpa məktubu üçün Gmail SMTP və ya Resend bağlantısı da lazımdır. Vercel özlüyündə poçt hesabı deyil.**

Addım-addım təlimat: [docs/EMAIL_ACCESS.md](docs/EMAIL_ACCESS.md). Real poçt göndərişi bu icra mühitində yoxlanılmayıb.

## Vercel

Framework: Vite. Build: `npm run build`. Output: `dist`. Server funksiyaları api/ qovluğundadır. `.env.example` dəyişən adlarını göstərir. Məxfi dəyərləri Vercel Settings → Environment Variables bölməsində saxlayın. Sonra Redeploy edin.

## Lokal işlətmə

Node.js 22 və ya 24. `.env.example` əsasında izlənməyən `.env.local` hazırlayın.

```sh
npm ci
npm run dev -- --port 3000
npm test
npm run build
```

Frontend və API eyni dev serverdə açılır. `npm run preview` yalnız statik frontend üçündür. Windows-da ZIP-i tam çıxarıb START-WINDOWS.cmd faylını aça bilərsiniz; Node.js LTS lazımdır.

## İcazələr və imkanlar

Şəxsi məlumatlar serverdə hesab üzrə ayrılır. Admin panelində İcmal, Elanlar, Sahiblər və Yoxlanış bölmələri; sahib adından elan, təsdiq, redaktə, VIP/Premium, dayandırma, silmə və ehtiyat nüsxə mövcuddur. Admin e-poçtu: rentacarr.az@gmail.com. Sadəcə bu ünvanı yazmaq admin rolu yaratmır.

Şəkil faylı yükləmə xidməti, real ödəniş və rezervasiya hələ qoşulmayıb. Şəxsi elan üçün HTTPS foto ünvanı əlavə edilə bilər. İstifadəçinin yazdığı sərbəst elan mətni avtomatik tərcümə edilmir.

Testlər real SQL davranışını yerli PGlite mühərrikində, poçt axınını isə idarə olunan çatdırılma əvəzləyicisi ilə yoxlayır. Real Neon və real poçt xidmətinin əlçatanlığını təsdiqləmir.
