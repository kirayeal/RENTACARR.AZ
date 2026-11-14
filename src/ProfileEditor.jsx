import React, {useState} from 'react';
import {t} from './i18n';
import {request} from './session';
export default function ProfileEditor({user,onSaved}) {
  const [saving,setSaving] = useState(false), [error,setError] = useState('');
  return <><span className="eyebrow">{t('ŞƏXSİ HESAB')}</span><h2>{t('Hesab məlumatlarını redaktə et')}</h2><form className="email-form" onSubmit={async e=>{e.preventDefault();setSaving(true);setError('');try{await request('/api/profile',{method:'POST',body:Object.fromEntries(new FormData(e.target))});await onSaved();}catch(error){setError(error.message);}finally{setSaving(false);}}}>
    <label>{t('E-poçt')}<input type="email" value={user.email} readOnly/></label>
    <label>{t('Ad / firma adı')}<input name="name" maxLength={100} required defaultValue={user.profile?.name || user.name}/></label>
    <label>{t('Telefon nömrəsi')}<input name="phone" type="tel" autoComplete="tel" required defaultValue={user.profile?.phone || user.phone || ''}/></label>
    <label>{t('Hesab növü')}<select name="kind" defaultValue={user.profile?.kind || 'person'}><option value="person">{t('Şəxsi sahib')}</option><option value="company">{t('Rentakar şirkəti')}</option></select></label>
    <p className="profile-edit-note">{t('Bu məlumatlar hesab profiliniz üçündür. Elanların əlaqə məlumatlarını elan redaktorunda dəyişin.')}</p>
    {error && <p className="auth-error" role="alert">{t(error)}</p>}
    <button className="primary" disabled={saving}>{t(saving ? 'Saxlanılır…' : 'Dəyişiklikləri saxla')}</button>
  </form></>;
}
