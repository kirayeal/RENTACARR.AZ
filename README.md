# RENTACARR.AZ

Azərbaycan dilində React + Vite avtomobil kirayəsi prototipi.

## İşə salma

Node.js 22 və ya 24:

```sh
npm ci --cache /tmp/rentacarr-npm-cache
npm run dev -- --port 3000
npm run build
```

## Mövcud imkanlar

Adminin sahib adından elan yerləşdirməsi, mövcud sahib seçimi, sahib üzrə elanlar, e-poçt qeydi; şəhər, marka, qiymət və kateqoriya filtrləri; qiymət sıralaması; bəyənilənlər; elan detalları; nümunə elan göndərilməsi; demo panelində təsdiqləmə, rədd, VIP və silmə; mobil görünüş.

## Məhdudiyyətlər

Bu ilkin frontend prototipidir. Elanlar nümunədir. Elanlar, sahib profilləri və gözləyən elanlar həmin brauzerin localStorage yaddaşında saxlanır və yenilənəndə qalır. Başqa cihazlara ötürülmür. Admin panelində JSON ehtiyat nüsxəsi endirilə bilər. Hesab yaratma, təhlükəsiz giriş, şəkil yükləmə, verilənlər bazası, hesab üzrə elan limiti və ödəniş sistemi hələ hazırlanmayıb. Açıq demo panel real idarəetmə üçün istifadə edilməməlidir. Yeni elan üçün göstərilən şəkil də nümunədir. Real istifadə üçün backend, serverdə icazə yoxlanması və şəkil saxlanması əlavə olunmalıdır.

Şəkillər images.unsplash.com, şriftlər fonts.googleapis.com və fonts.gstatic.com ünvanlarından yüklənir; həmin ünvanlara çıxış lazımdır.

## Vercel

GitHub deposunu Vercel-ə import edin. Framework: Vite. Build command: `npm run build`. Output directory: `dist`. Hazırkı prototip üçün mühit dəyişəni tələb olunmur. Yayım bu repodan avtomatik edilməyib. İctimai istifadədən əvvəl real autentifikasiya və backend tamamlanmalıdır. Kommersiya istifadəsi üçün Vercel-in cari plan şərtlərini yoxlayın.

## Hesablar və yoxlama

Telefon yalnız əlaqə üçündür. Qeydiyyat gələcəkdə Google ilə olacaq; hazırda aktiv deyil və Google düyməsi göstərilmir. Nəzərdə tutulan admin: rentacarr.az@gmail.com. Bu ünvanın qeyd edilməsi real hesab yaratmır. İcazələr və elanların Google hesabına bağlanması üçün server inteqrasiyası lazımdır: [giriş planı](docs/ACCOUNT_ACCESS.md).

Məlumat modeli testləri: `node --test tests/ownership.test.js`.
