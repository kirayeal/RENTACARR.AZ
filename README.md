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

10 nümunə elan public/photos qovluğundakı real avtomobil fotolarından istifadə edir. 6 fərqli foto, fərqli il və şəhərlər üzrə 10 nümayiş elanında istifadə olunur. Fotolar layihə ilə birlikdə saxlanır; mənbələr public/photos/SOURCES.txt faylındadır. Şriftlər sistemdən istifadə edir; xarici şəkil və şrift xidmətinə ehtiyac yoxdur. Real elan üçün HTTPS şəkil ünvanı daxil edilə bilər.

## Vercel

GitHub deposunu Vercel-ə import edin. Framework: Vite. Build command: `npm run build`. Output directory: `dist`. Hazırkı prototip üçün mühit dəyişəni tələb olunmur. Yayım bu repodan avtomatik edilməyib. İctimai istifadədən əvvəl real autentifikasiya və backend tamamlanmalıdır. Kommersiya istifadəsi üçün Vercel-in cari plan şərtlərini yoxlayın.

## Hesablar və yoxlama

Telefon yalnız əlaqə üçündür. Qeydiyyat gələcəkdə Google ilə olacaq; hazırda aktiv deyil və Google düyməsi göstərilmir. Nəzərdə tutulan admin: rentacarr.az@gmail.com. Bu ünvanın qeyd edilməsi real hesab yaratmır. İcazələr və elanların Google hesabına bağlanması üçün server inteqrasiyası lazımdır: [giriş planı](docs/ACCOUNT_ACCESS.md).

Məlumat modeli testləri: `node --test tests/*.test.js`.

## Kompüterdə baxmaq

Node.js 22 və ya 24 quraşdırıldıqdan sonra terminalda:

```sh
git clone https://github.com/kirayeal/RENTACARR.AZ.git
cd RENTACARR.AZ
npm ci
npm run dev -- --port 3000
```

Brauzerdə terminalın göstərdiyi yerli ünvanı açın. Bu yalnız server işləyən kompüterdə açılır; GitHub kod səhifəsi işlək saytın ünvanı deyil. Saytın aşağısındakı **Demo idarəetmə paneli** düyməsi ilə panelə keçin. Qeydiyyat tələb olunmur. Google girişi hələ aktiv deyil.

## 10 nümunə və təqdimat statusları

Toyota RAV4, Volkswagen Polo GTI, BMW 3 Series, BMW 6 Series, BMW M4 və Cadillac Escalade modellərinin müxtəlif şəhər və il üzrə 10 nümunəsi. Hamısı eyni **RENTACARR Demo Avtopark** profilinə bağlıdır. Nümunələr real əlaqə nömrəsi və ya real müştəri hesabı daşımır.

Bu model seçimi ekonom, sedan, SUV, biznes və premium istifadə ssenarilərini nümayiş etdirir. Ən çox kirayəyə verilən modellərin yoxlanmış bazar reytinqi deyil. Qiymətlər, illər, şərtlər və fotolar yalnız nümayiş üçündür; real kirayə təklifi deyil. Marka siyahısı geniş seçim və Digər variantını təqdim edir; bütün dünya markalarının tam reyestri olduğu iddia edilmir.

- Standart: adi kataloq sırası.
- VIP: standart elanlardan əvvəl.
- Premium: ayrıca nişan, VIP-dən əvvəl. Avtomobil kateqoriyası ilə təqdimat statusu ayrıdır.
- Admin statusları ödənişsiz dəyişə bilər; real ödəniş aparılmır.
- Elanı redaktə etmək, şərtlərini dəyişmək, dayandırmaq / aktivləşdirmək və təsdiqlə silmək mümkündür.
- Köhnə 6 nümunəlik yaddaş bir dəfə 10 elana genişləndirilir; istifadəçinin əlavə etdiyi məlumatlar qorunur. Sonrakı silmələr yenilənəndə geri qaytarılmır. “10 nümunə elanı tamamla” düyməsi çatışmayan nümunələri bərpa edir.

## Windows: Git quraşdırmadan açmaq

1. GitHub səhifəsində **Code → Download ZIP** seçin.
2. ZIP-i tam çıxarın. İçəridə package.json və START-WINDOWS.cmd olan qovluğu açın.
3. **START-WINDOWS.cmd** faylını iki dəfə klikləyin. Node.js LTS quraşdırılmış olmalıdır.
4. Terminalda göstərilən Local ünvanını brauzerdə açın. Server pəncərəsini açıq saxlayın.

Alternativ: həmin qovluğun ünvan sətrinə `cmd` yazıb Enter basın. Ardınca `npm ci` və `npm run dev -- --port 3000` əmrlərini işlədin. İstifadəçi qovluğunda və ya ZIP-in içindən npm əmrlərini işə salmayın.

## Responsive görünüş

Telefonlarda bir, planşetlərdə iki, geniş ekranlarda üç sütun. Şəkillər orijinal 440:300 nisbətində göstərilir. Mobil menyu, sürüşdürülən kateqoriyalar və rahat toxunma düymələri mövcuddur. Admin paneli və redaktə forması da kiçik ekranlarda işləyir.
