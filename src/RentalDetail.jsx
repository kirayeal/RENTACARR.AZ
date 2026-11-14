import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Heart, Share2, MapPin, Phone, Building2, Gauge, Fuel, Users, CalendarDays } from 'lucide-react';
import { t } from './i18n';
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export default function RentalDetail({ car, cars, liked, onLike, onBack, onSelect, onNotify }) {
  const today = dateKey(new Date());
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(dateKey(tomorrow));
  const days = Math.round((Date.parse(end)-Date.parse(start))/86400000);
  const valid = start >= today && Number.isFinite(days) && days > 0;
  const number = car.phone?.replace(/\D/g,'');
  const message = `${car.name} — ${t('Avtomobil kirayəsi')}${valid ? `: ${start} — ${end} (${days} ${t('gün')})` : ''}`;
  const related = cars.filter(c => c.ownerId && c.ownerId === car.ownerId && c.id !== car.id).slice(0,3);
  return <main className="rental-page">
    <div className="rental-breadcrumb"><button onClick={onBack}><ArrowLeft size={16}/>{t('Bütün elanlar')}</button><span>/</span><span>{car.name}</span></div>
    <div className="rental-heading"><div><div className="eyebrow">{t(car.demo ? 'NÜMUNƏ ELAN' : 'ELAN')}</div><h1>{car.name}</h1><p><MapPin size={15}/>{t(car.city)}<span>·</span>{car.year}</p></div><div className="rental-heading-actions"><button className="outline" aria-pressed={liked} onClick={onLike}><Heart size={17} fill={liked?'currentColor':'none'}/>{t('Seçilmişlər')}</button><button className="outline" onClick={async()=>{try{await navigator.clipboard.writeText(location.href);onNotify('Link kopyalandı.');}catch{onNotify('Linki brauzerin ünvan sətrindən köçürün.');}}}><Share2 size={17}/>{t('Paylaş')}</button></div></div>
    <div className="rental-page-grid"><div className="rental-main">
      <div className="rental-photo"><img src={car.image} alt={car.name}/>{car.promotion !== 'standard' && <span>{car.promotion === 'premium' ? 'Premium' : 'VIP'}</span>}</div>
      <div className="rental-features"><div><Gauge size={21}/><span>{t('Sürətlər qutusu')}<strong>{t(car.transmission || 'Avtomat')}</strong></span></div><div><Fuel size={21}/><span>{t('Yanacaq')}<strong>{t(car.fuel || 'Benzin')}</strong></span></div><div><Users size={21}/><span>{t('Oturacaq sayı')}<strong>{car.seats || 5} {t('yer')}</strong></span></div></div>
      <section className="rental-section"><h2>{t('Avtomobil haqqında')}</h2><p className="listing-description">{t(car.description || 'Şərtləri sahibi ilə dəqiqləşdirin.')}</p></section>
      <section className="rental-section"><h2>{t('Kirayə şərtləri')}</h2><dl className="rental-facts">{[["Depozit",car.deposit,'₼'],['Günlük yürüş limiti',car.mileage,t('km')],['Minimum yaş',car.minAge,t('yaş')],['Sürücülük stajı',car.experience,t('il')]].map(([label,value,unit])=><div key={label}><dt>{t(label)}</dt><dd>{value != null ? `${value} ${unit}` : t('Sahiblə dəqiqləşdirin')}</dd></div>)}</dl><p>{t(car.terms || 'Qiymət gündəlik kirayə üçündür. Təhvil yeri, müddət və ödəniş şərtləri sahibi ilə dəqiqləşdirilir.')}</p></section>
      {!!related.length && <section className="rental-section"><h2>{t('Sahibin digər avtomobilləri')}</h2><div className="rental-related">{related.map(c=><button key={c.id} onClick={()=>onSelect(c)}><img src={c.image} alt=""/><span>{c.name}<small>{c.price} ₼ {t('/ gün')}</small></span><ArrowUpRight size={17}/></button>)}</div></section>}
    </div><aside className="rental-enquiry">
      <div className="rental-price"><span>{t('Günlük qiymət')}</span><div>{car.price} <small>₼ {t('/ gün')}</small></div></div>
      <div className="rental-rate-options"><span>{t('Həftəlik')}<strong>{car.weeklyPrice ? `${car.weeklyPrice} ₼` : t('Razılaşma ilə')}</strong></span><span>{t('Aylıq')}<strong>{car.monthlyPrice ? `${car.monthlyPrice} ₼` : t('Razılaşma ilə')}</strong></span></div>
      <div className="rental-calculator"><h3><CalendarDays size={17}/>{t('Kirayə müddətini seçin')}</h3><div className="rental-dates"><label>{t('Başlama tarixi')}<input type="date" min={today} value={start} onChange={e=>{const next=e.target.value;setStart(next);if(end<=next){const d=new Date(next+'T12:00:00');d.setDate(d.getDate()+1);setEnd(dateKey(d));}}}/></label><label>{t('Bitmə tarixi')}<input type="date" min={start} value={end} onChange={e=>setEnd(e.target.value)}/></label></div>{valid ? <div className="rental-estimate"><span>{days} {t('gün')} × {car.price} ₼<small>{t('Təxmini kirayə məbləği')}</small></span><strong>{Number((days * car.price).toFixed(2))} ₼</strong></div> : <p role="status">{t('Bitmə tarixi başlama tarixindən sonra olmalıdır.')}</p>}<p className="estimate-note">{t('Hesab günlük qiymətə əsaslanır. Depozit və əlavə xidmətlər daxil deyil. Mövcudluğu və yekun qiyməti sahibi ilə dəqiqləşdirin.')}</p></div>
      <div className="rental-seller"><Building2 size={23}/><div><strong>{car.owner}</strong><span>{t(car.company ? 'Rentakar şirkəti' : 'Şəxsi sahib')}</span></div></div>
      {number ? <div className="rental-contact"><a className="primary" href={'tel:'+car.phone}><Phone size={17}/>{car.phone}</a><a className="outline" href={'https://wa.me/'+number+'?text='+encodeURIComponent(message)} target="_blank" rel="noreferrer">{t('WhatsApp ilə yaz')}</a></div> : <div className="sample-contact">{t('Bu nümunə elanda real əlaqə nömrəsi göstərilmir.')}</div>}
    </aside></div>
  </main>;
}
