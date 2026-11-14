# Admin girişinin tamamlanması

Admin hesabı: `rentacarr.az@gmail.com`. İdarəetmə ünvanı: `https://rentacarr-az.vercel.app/?panel=admin`.

Təsdiqlənmiş hesabda Hesabım → Ayarlar → İdarəetmə paneli keçidi var. Adminin əlaqə profili tamamlanmasa da mövcud elanları yoxlamaq və təsdiqləmək mümkündür; yeni elan yaratmaq üçün əlaqə profili tamamlanmalıdır.

## Canlı saytda qalan bağlantı

Bu iş zamanı `/api/account?action=config` cavabında `enabled: true`, `recoveryEnabled: false` idi. Baza və hesab sistemi aktivdir, e-poçt göndərilməsi isə qoşulmayıb. Sadəcə admin e-poçtunu yazmaqla giriş verilmir.

Vercel → rentacarr-az → Settings → Environment Variables:

- `SMTP_USER`: `rentacarr.az@gmail.com`
- `SMTP_PASSWORD`: həmin Google hesabında yaradılan Gmail **App Password**. Adi Gmail şifrəsi istifadə olunmur.

Alternativ: təsdiqlənmiş göndərici ilə `RESEND_API_KEY` və `MAIL_FROM`.

Məxfi dəyərləri söhbətə və GitHub fayllarına yazmayın. Vercel-in Production mühitinə əlavə edib Redeploy edin. Bundan sonra yeni qeydiyyat və ya düzgün şifrə ilə admin girişi e-poçta 6 rəqəmli təsdiq kodu göndərir. Təsdiqdən sonra admin sessiyası yaradılır. Şifrə unudulubsa eyni poçt bağlantısı bərpa kodunu göndərir.

## Moderasiya

Yoxlanış → Elanı yoxla: foto, sahib, əlaqə nömrəsi, qiymət, depozit, yürüş, yaş/staj və sərbəst şərtlər görünür. Təsdiqlə elanı serverdə aktivləşdirir. Rədd et silmə təsdiqi açır; təsdiqlənənə qədər elan silinmir. Aktiv elanı dayandırmaq kataloqdan gizlədir, bazadan silmir.

SQL testləri admin olmayan istifadəçinin təsdiq verə bilmədiyini, təsdiqdən əvvəl elanın ictimai kataloqda görünmədiyini və təsdiq/dayandırma/rədd qərarlarının bazada saxlandığını yoxlayır. Canlı hesabda poçt təsdiqi bu bağlantı tamamlanana qədər mümkün deyil.
