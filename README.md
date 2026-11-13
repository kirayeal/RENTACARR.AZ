# RENTACARR.AZ

Azərbaycan dilində avtomobil kirayəsi platforması. React + Vite, Vercel Node API, Google Identity Services və Neon Postgres.

## İnterfeys

Vahid yüngül Inter şrifti, Lucide ikonları, 10 fərqli avtomobil fotosu, telefon / planşet / kompüter üçün uyğun görünüş. Şrift və təqdimat fotoları layihə ilə birlikdə saxlanır; xarici foto servisinə ehtiyac yoxdur. Foto mənbələri: public/photos/SOURCES.txt. Nümunə elanlar real kirayə təklifi deyil.

İctimai kataloq: şəhər, marka, model, qiymət və kateqoriya üzrə axtarış, qiymət sıralaması, bəyənilənlər və avtomobilin fərdi şərtləri.

Admin paneli: İcmal, Elanlar, Sahiblər, Yoxlanış və Bələdçi. Sahibin adından elan yaratma, redaktə, VIP/Premium, dayandırma / aktivləşdirmə, silmə təsdiqi, yoxlanış və JSON ehtiyat nüsxəsi.

## Hesablar və məxfilik

Qeydiyyat yalnız Google ilədir. Telefon və ya e-poçt yazmaq giriş yaratmır. Yalnız serverdə təsdiqlənmiş **rentacarr.az@gmail.com** hesabı admin olur. Adi istifadəçi yalnız öz sahib profillərini və elanlarını görür. Şəxsi e-poçtlar açıq kataloqa verilmir. İcazələr serverdə yoxlanır; açıq demo admin girişi çıxarılıb.

Admin sahibin Google e-poçtunu əvvəlcədən qeyd edə bilər. Sahib həmin Google hesabı ilə təsdiqlənmiş giriş etdikdə admin tərəfindən yaradılmış, hələ hesaba bağlanmamış profil ona bağlanır. Telefonla avtomatik hesab birləşdirməsi yoxdur.

**Google və baza parametrləri olmadan qeydiyyat aktiv deyil və admin panelinə giriş yoxdur.** Dəqiq aktivləşdirmə təlimatı: [docs/GOOGLE_SETUP.md](docs/GOOGLE_SETUP.md).

## Vercel

Framework: Vite. Build: `npm run build`. Output: `dist`. Node API-lər `api/` qovluğundadır. Vercel Environment Variables:

- `GOOGLE_CLIENT_ID`: Google Cloud Web OAuth Client ID.
- `AUTH_SECRET`: ən az 32 simvolluq təsadüfi məxfi sessiya açarı.
- `DATABASE_URL`: Neon Postgres URL, məxfi saxlanmalıdır.

Google Console-da saytın dəqiq originini icazəli JavaScript originləri siyahısına əlavə edin. Sonra Vercel-də Redeploy edin. Məxfi dəyərləri çata və GitHub-a yazmayın. Hazırkı icra mühitində bu parametrlər yoxdur, ona görə real Google girişi və Neon bağlantısı canlı yoxlanılmayıb.

## Kompüterdə işlətmə

Node.js 22 və ya 24. `.env.example` əsasında izlənməyən `.env.local` faylı hazırlayın.

```sh
npm ci
npm run dev -- --port 3000
```

Bu əmr API və frontend-i eyni serverdə açır. `npm run preview` yalnız frontend üçündür və giriş yoxlaması üçün uyğun deyil.

Windows-da Git olmadan: GitHub → Code → Download ZIP; arxivi tam çıxarın, `START-WINDOWS.cmd` faylını açın. Node.js LTS lazımdır. Terminaldakı Local ünvanını brauzerdə açın.

## Yoxlamalar

```sh
npm test
npm run build
```

İcazə testləri Google təsdiqindən sonra sessiya və sahib bağlanmasını idarə olunan test identifikatorları ilə yoxlayır. SQL sorğuları testdə PGlite Postgres mühərrikində icra olunur; Neon və Google ilə real şəbəkə bağlantısını əvəz etmir. Real Google tokeni olmadan istehsal verifikasiyası uğurlu olmur.

## Hazırkı məhdudiyyətlər

Real ödəniş, ödənişli paket satınalması, fayl yükləmə / şəkil saxlama xidməti, rezervasiya və çat hələ yoxdur. Adi hesab üçün 1 elan limiti serverdə tətbiq olunur; admin sahib adından limitsiz elan əlavə edə bilər. Adi istifadəçinin yeni və redaktə edilmiş elanı yoxlanışa düşür.

Əvvəlki localStorage demo məlumatları serverə köçürülmür və hesablar arasında göstərilmir; köhnə yaddaş yerində saxlanır. Baza boşdursa ümumi kataloqda 10 təqdimat elanı görünür. Onlar real sahib hesablarına aid edilmir.

Qeydiyyat axını: Google təsdiqi → firma və ya şəxsi sahib seçimi → ad və mobil nömrə → hesab. Hər normallaşdırılmış mobil nömrə yalnız bir hesaba bağlanır. SMS təsdiqi qoşulmayıb. Yaş, depozit və təcrübə sahələri istifadəçi görünüşündən çıxarılıb. Mətn ölçüləri oxunaqlılıq üçün böyüdülüb.

## Son giriş və kataloq yeniləməsi

Əsas giriş indi telefon + real SMS kodudur. Google girişi ayrıca `GOOGLE_LOGIN_ENABLED=false` ilə gizlədilir. Telefon xidmətinin parametrləri və dəqiq axın: [PHONE_ACCESS.md](docs/PHONE_ACCESS.md). Əvvəlki yalnız-Google təsviri bu yeni seçimlə genişləndirilib. Telefonla giriş admin səlahiyyəti vermir.

AZ / EN / RU interfeys dili seçimi, kompakt üst hissə, bütün kartdan açılan elan detalları, əlaqə bölməsi və ayrıca kirayə şərtləri əlavə olunub. İstifadəçinin yazdığı sərbəst elan mətni avtomatik tərcümə edilmir.
