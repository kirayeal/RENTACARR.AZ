import React, { useState } from "react";
import { Building2, Car, ShieldCheck, Camera, Check } from "lucide-react";
import { brands, categories, cities } from "./catalog";
const Field = ({ label, ...props }) => (
  <label>
    {label}
    <input {...props} />
  </label>
);
const Select = ({ label, options, ...props }) => (
  <label>
    {label}
    <select {...props}>
      {options.map((option) => {
        const [value, text] = Array.isArray(option) ? option : [option, option];
        return (
          <option key={value} value={value}>
            {text}
          </option>
        );
      })}
    </select>
  </label>
);
export default function ListingEditor({
  listing,
  owners,
  admin,
  onSubmit,
  saving = false,
}) {
  const [selectedOwner, setSelectedOwner] = useState(listing?.ownerId || "");
  const profile = owners.find((o) => o.id === selectedOwner);
  return (
    <form className="listing-form" onSubmit={onSubmit}>
      <fieldset disabled={saving}>
        <legend>
          <Building2 size={17} />
          Sahib məlumatları
        </legend>
        <p className="fieldset-caption">
          Elanı şirkətin və ya şəxsi sahibin profili ilə əlaqələndir.
        </p>
        {!admin && listing && (
          <input type="hidden" name="ownerId" value={listing.ownerId} />
        )}
        {admin && (
          <Select
            label="Mövcud sahib"
            name="ownerId"
            defaultValue={selectedOwner}
            options={[
              ["", "Yeni sahib profili yarat"],
              ...owners.map((o) => [
                o.id,
                o.name + (o.demo ? " · Nümunə profil" : ` · ${o.phone}`),
              ]),
            ]}
            onChange={(e) => {
              setSelectedOwner(e.target.value);
              const o = owners.find((x) => x.id === e.target.value);
              const f = e.target.form;
              if (o) {
                f.elements.owner.value = o.name;
                f.elements.phone.value = o.phone;
                f.elements.ownerKind.value = o.kind;
                f.elements.ownerEmail.value = o.expectedEmail || "";
              }
            }}
          />
        )}
        <div className="form-pair">
          <Select
            label="Sahibin tipi"
            name="ownerKind"
            defaultValue={listing?.company ? "company" : "person"}
            options={[
              ["company", "Rentakar şirkəti"],
              ["person", "Şəxsi sahib"],
            ]}
          />
          <Field
            label="Sahibin / şirkətin adı"
            name="owner"
            required
            maxLength="80"
            defaultValue={listing?.owner || ""}
          />
        </div>
        <Field
          label="Telefon — yalnız əlaqə üçün"
          name="phone"
          type="tel"
          required={!listing?.demo && !profile?.demo}
          defaultValue={listing?.phone || ""}
          placeholder="050 123 45 67"
        />
        <Field
          label="Sahibin Google e-poçtu (istəyə bağlı)"
          name="ownerEmail"
          type="email"
          maxLength="254"
          defaultValue={
            owners.find((o) => o.id === listing?.ownerId)?.expectedEmail || ""
          }
          placeholder="sahib@gmail.com"
        />
      </fieldset>
      <fieldset disabled={saving}>
        <legend>
          <Car size={17} />
          Avtomobil haqqında
        </legend>
        <p className="fieldset-caption">
          Axtarışda düzgün görünməsi üçün məlumatları dəqiq qeyd et.
        </p>
        <div className="form-pair">
          <Select
            label="Marka"
            name="brand"
            defaultValue={listing?.brand || "Toyota"}
            options={brands}
          />
          <Field
            label="Model"
            name="model"
            required
            maxLength="60"
            defaultValue={
              listing?.model ||
              listing?.name?.replace(listing.brand, "").trim() ||
              ""
            }
            placeholder="Corolla"
          />
        </div>
        <div className="form-pair">
          <Field
            label="Buraxılış ili"
            name="year"
            type="number"
            required
            min="1980"
            max={new Date().getFullYear() + 1}
            defaultValue={listing?.year || 2023}
          />
          <Select
            label="Şəhər"
            name="city"
            defaultValue={listing?.city || "Bakı"}
            options={cities}
          />
        </div>
        <div className="form-pair">
          <Select
            label="Kateqoriya"
            name="type"
            defaultValue={listing?.type || "Sedan"}
            options={categories}
          />
          <Field
            label="Oturacaq sayı"
            name="seats"
            type="number"
            min="1"
            max="50"
            required
            defaultValue={listing?.seats ?? 5}
          />
        </div>
        <div className="form-pair">
          <Select
            label="Yanacaq"
            name="fuel"
            defaultValue={listing?.fuel || "Benzin"}
            options={["Benzin", "Dizel", "Hibrid", "Elektrik"]}
          />
          <Select
            label="Sürətlər qutusu"
            name="transmission"
            defaultValue={listing?.transmission || "Avtomat"}
            options={["Avtomat", "Mexaniki"]}
          />
        </div>
      </fieldset>
      <fieldset disabled={saving}>
        <legend>
          <ShieldCheck size={17} />
          Qiymət və kirayə şərtləri
        </legend>
        <p className="fieldset-caption">
          Müştəri avtomobili seçməzdən əvvəl bu şərtləri görəcək.
        </p>
        <div className="form-pair">
          <Field
            label="Günlük qiymət (₼)"
            name="price"
            type="number"
            required
            min="1"
            max="10000"
            defaultValue={listing?.price}
          />
          <Field
            label="Depozit (₼)"
            name="deposit"
            type="number"
            min="0"
            max="100000"
            required
            defaultValue={listing?.deposit ?? 200}
          />
        </div>
        <div className="form-pair">
          <Field
            label="Yürüş limiti (km / gün)"
            name="mileage"
            type="number"
            min="1"
            max="10000"
            required
            defaultValue={listing?.mileage ?? 250}
          />
          <Field
            label="Minimum yaş"
            name="minAge"
            type="number"
            min="18"
            max="80"
            required
            defaultValue={listing?.minAge ?? 23}
          />
        </div>
        <div className="form-pair">
          <Field
            label="Sürücülük təcrübəsi (il)"
            name="experience"
            type="number"
            min="0"
            max="60"
            required
            defaultValue={listing?.experience ?? 2}
          />
          {admin && (
            <Select
              label="Elanın təqdimatı"
              name="promotion"
              defaultValue={
                listing?.promotion || (listing?.vip ? "vip" : "standard")
              }
              options={[
                ["standard", "Standart — pulsuz"],
                ["vip", "VIP — ön sıralarda"],
                ["premium", "Premium — xüsusi vurğu"],
              ]}
            />
          )}
        </div>
        <label>
          Kirayə şərtləri və təsvir
          <textarea
            name="description"
            rows="4"
            maxLength="2000"
            defaultValue={listing?.description || ""}
            placeholder="Təhvil yeri, sığorta və digər şərtlər…"
          />
        </label>
      </fieldset>
      <fieldset disabled={saving}>
        <legend>
          <Camera size={17} />
          Avtomobilin fotosu
        </legend>
        <p className="fieldset-caption">
          Elana aid real fotonun HTTPS ünvanını əlavə et. Foto yükləmə xidməti
          hələ qoşulmayıb.
        </p>
        <Field
          label="Şəkil ünvanı (istəyə bağlı)"
          name="image"
          type="url"
          placeholder="https://…"
          defaultValue={
            listing?.image?.startsWith("https://") ? listing.image : ""
          }
        />
        {listing?.image && (
          <div className="editor-photo">
            <img src={listing.image} alt={listing.name} />
            <span>Elanın hazırkı fotosu</span>
          </div>
        )}
      </fieldset>
      <button className="primary" disabled={saving}>
        <Check size={16} />
        {saving
          ? "Saxlanılır…"
          : listing
            ? "Dəyişiklikləri saxla"
            : admin
              ? "Elanı dərc et"
              : "Yoxlanışa göndər"}
      </button>
    </form>
  );
}
