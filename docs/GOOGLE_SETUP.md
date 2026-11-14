# Google girişi — əlavə, hazırda qeyri-aktiv seçim

Əsas qeydiyyat e-poçt və şifrə ilədir: [EMAIL_ACCESS.md](EMAIL_ACCESS.md). Telefon əlaqə üçündür, SMS girişi çıxarılıb.

Google düyməsi standart olaraq gizlidir (`GOOGLE_LOGIN_ENABLED=false`). Gələcəkdə aktivləşdirmək üçün Google Cloud Console-da Web OAuth Client ID yaradıb `GOOGLE_CLIENT_ID` təyin edin və saytın dəqiq originini Authorized JavaScript origins siyahısına əlavə edin. `GOOGLE_LOGIN_ENABLED=true` olduqda düymə görünür. `AUTH_SECRET` və `DATABASE_URL` də tələb olunur.

ID token rəsmi Google kitabxanası ilə serverdə yoxlanır, nonce və təsdiqlənmiş e-poçt tələb olunur. Eyni təsdiqlənmiş e-poçtla mövcud hesab yeni təkrar hesab yaratmadan istifadə olunur. Google ilə giriş real Google bağlantısı olmadan canlı yoxlanılmayıb.

Admin e-poçtu rentacarr.az@gmail.com-dur. Adminə e-poçt/şifrə ilə giriş də mümkündür; e-poçt sahibliyi kodla təsdiqlənməlidir. Sadəcə ünvanı formaya yazmaq admin rolu vermir.
