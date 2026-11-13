# Google hesabları və admin girişinin planı

Nəzərdə tutulan ilkin admin e-poçtu: **rentacarr.az@gmail.com**.
Bu qeyd işlək hesab yaratmır və brauzerdə giriş hüququ vermir.

Google girişi hələ aktivləşdirilməyib. Aktivləşdirilənə qədər Google düyməsi göstərilmir. Telefon qeydiyyat üsulu deyil.

## Server inteqrasiyası üçün tələblər

- Google OAuth / OpenID Connect vasitəsilə giriş. ID token serverdə etibarlı provayder SDK-sı ilə yoxlanmalıdır: imza, issuer, audience, expiry, nonce, email_verified. Sessiya HttpOnly və Secure cookie ilə saxlanmalıdır.
- Admin yalnız yoxlanmış e-poçt uyğunluğu ilə ilkin olaraq təyin olunur; Google `sub` identifikatoru daimi istifadəçi açarıdır. Admin rolu və bütün yazma icazələri serverdə yoxlanmalıdır. Müştəri kodundakı e-poçt müqayisəsi giriş mexanizmi deyil.
- Admin mövcud hesabı olmayan şirkət və ya şəxsi sahib üçün ayrıca owner profili yaradır. Elanlar sabit ownerId ilə həmin profilə bağlanır. Elanı yaradan adminin kimliyi ayrıca audit qeydidir.
- Telefon yalnız əlaqə üçündür. Eyni nömrə avtomatik sahib eyniləşdirməsi və ya hesab birləşməsi yaratmır.
- Sahib Google ilə daxil olduqdan sonra admin həmin təsdiqlənmiş istifadəçi hesabını uyğun owner profilinə bağlayır. expectedEmail yalnız istiqamətləndirici məlumatdır, giriş hüququ vermir. Şirkət daxilində bir neçə əməkdaşın hesabı üçün gələcəkdə ayrıca üzvlük cədvəli istifadə olunmalıdır.
- Bağlama auditlə və tranzaksiya ilə aparılmalı, artıq başqa hesaba bağlı profil avtomatik yenidən təyin edilməməlidir. Elan identifikatorları, tarixçəsi, VIP və aktivlik statusları qorunmalıdır.
- Adminin sahib adından əlavə etdiyi elanlar üçün paket limitinin istisnası ayrıca qayda və auditlə idarə edilməlidir. Lokal prototip hələ limit tətbiq etmir.

## Hazırkı lokal prototip

Demo panel açıqdır. Bu, real admin autentifikasiyası deyil. Elanlar, sahib profilləri və gözləyən elanlar həmin brauzerin localStorage yaddaşında saxlanır. Məxfi məlumatlar daxil etməyin. Brauzer yaddaşını silmək məlumatları silir. Ehtiyat nüsxə düyməsi JSON faylı endirir.
