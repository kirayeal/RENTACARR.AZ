# Telefonla giriş və qeydiyyat

## Aktivləşdirmə

Vercel Settings → Environment Variables:

- `AUTH_SECRET`: ən az 32 simvolluq məxfi sessiya açarı.
- `DATABASE_URL`: Neon Postgres bağlantısı.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`: Twilio Verify xidmətinin server üçün məxfi bağlantıları.

Twilio Verify SMS xidməti yaradılmalı və Azərbaycan nömrələrinə göndəriş üçün hesabın region icazələri / balansı uyğun olmalıdır. Sonra Vercel-də Redeploy edin. Bu parametrlər olmadan SMS düyməsi qeyri-aktivdir; sayt saxta və ya sabit kod qəbul etmir. İndiki mühitdə canlı SMS xidməti qoşulmayıb və real SMS göndərilməyib.

Axın: telefon nömrəsi → real SMS kodu → firma/şəxsi sahib seçimi → hesab. Təsdiqlənmiş nömrə qeydiyyat formasında dəyişdirilə bilmir. Hər normallaşdırılmış nömrə üçün bazada UNIQUE qaydası var. Mövcud nömrə ilə təsdiqlənmiş SMS girişi həmin hesaba aparır; yeni təkrar hesab yaratmır.

SMS əməliyyatları üçün həm nömrə, həm də IP üzrə 15 dəqiqədə 5 göndəriş limiti bazada saxlanır. Kod Twilio Verify tərəfindən yoxlanır. Sessiya HttpOnly cookie-dir. SMS girişindən admin rolu verilmir, hətta nömrə admin profilinə aid olsa belə.

## Google hələ qeyri-aktivdir

`GOOGLE_LOGIN_ENABLED=false` saxlayın. Google düyməsi görünməyəcək. Gələcəkdə Google Console bağlantısını tamamlayıb `GOOGLE_LOGIN_ENABLED=true` və `GOOGLE_CLIENT_ID` təyin edə bilərsiniz. Admin girişi yalnız Google-un təsdiqlədiyi `rentacarr.az@gmail.com` hesabına açılır.

## Dil və məzmun

Dil seçimi AZ / EN / RU-dur və bu brauzerdə saxlanır. Elan sahibinin daxil etdiyi sərbəst mətn avtomatik tərcümə edilmir; interfeys sözləri tərcümə edilir. İstifadəçinin yazdığı real nömrə elanda göstərilir. Təqdimat elanlarına uydurma nömrə əlavə edilmir.
