import React, {useState} from 'react';
import {ArrowUpRight, X} from 'lucide-react';
import {t} from './i18n';
export default function CompareCars({cars, onSelect, onRemove, onClear}) {
  const [different, setDifferent] = useState(false);
  const money = value => value == null ? t('Sahiblə dəqiqləşdirin') : `${value} ₼`;
  const rows = [
    ['Günlük qiymət', c => money(c.price)], ['Depozit', c => money(c.deposit)],
    ['Günlük yürüş limiti', c => c.mileage == null ? '—' : `${c.mileage} ${t('km')}`],
    ['Minimum yaş', c => c.minAge == null ? '—' : `${c.minAge} ${t('yaş')}`],
    ['Sürücülük stajı', c => c.experience == null ? '—' : `${c.experience} ${t('il')}`],
    ['Yanacaq', c => t(c.fuel || '—')], ['Sürətlər qutusu', c => t(c.transmission || '—')],
    ['Oturacaq sayı', c => c.seats || '—'], ['Şəhər', c => t(c.city)],
    ['Sahibin tipi', c => t(c.company ? 'Rentakar şirkəti' : 'Şəxsi sahib')],
  ];
  return <><span className="eyebrow">RENTACARR.AZ</span><h2>{t('Avtomobilləri müqayisə et')}</h2><p>{t('Qiyməti və kirayə tələblərini yan-yana qiymətləndirin.')}</p>
    <label className="compare-difference"><input type="checkbox" checked={different} onChange={e=>setDifferent(e.target.checked)}/>{t('Yalnız fərqləri göstər')}</label>
    {cars.length > 0 && <button className="criteria-reset" onClick={onClear}>{t('Seçimi təmizlə')}</button>}
    {cars.length < 2 ? <div className="empty">{t('Müqayisə üçün ən azı iki avtomobil seçin.')}</div> : <div className="comparison-scroll"><table className="comparison-table"><thead><tr><th scope="col">{t('Göstərici')}</th>{cars.map(c=><th scope="col" key={c.id}><div className="comparison-car"><button className="comparison-remove" aria-label={t('Müqayisədən çıxar') + ': ' + c.name} onClick={()=>onRemove(c.id)}><X size={15}/></button><img src={c.image} alt=""/><span>{c.name}</span><button className="outline" onClick={()=>onSelect(c)}>{t('Elana bax')}<ArrowUpRight size={15}/></button></div></th>)}</tr></thead><tbody>{rows.filter(([,value])=>!different || new Set(cars.map(c=>String(value(c)))).size>1).map(([label,value])=><tr key={label}><th scope="row">{t(label)}</th>{cars.map(c=><td key={c.id}>{value(c)}</td>)}</tr>)}</tbody></table></div>}
  </>;
}
