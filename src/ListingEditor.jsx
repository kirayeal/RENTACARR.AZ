import { t } from "./i18n";
import React, { useState } from "react";
import { Building2, Car, ShieldCheck, Camera, Check } from "lucide-react";
import { brands, categories, cities } from "./catalog";
const Field = ({ label, ...props }) => (
  <label>
    {t(label)}
    <input {...props} />
  </label>
);
const Select = ({ label, options, ...props }) => (
  <label>
    {t(label)}
    <select {...props}>
      {t(
        options.map((option) => {
          const [value, text] = Array.isArray(option)
            ? option
            : [option, option];
          return (
            <option key={value} value={value}>
              {t(text)}
            </option>
          );
        }),
      )}
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
          {t("Sahib məlumatları")}
        </legend>
        <p className="fieldset-caption">
          {t("Elanı şirkətin və ya şəxsi sahibin profili ilə əlaqələndir.")}
        </p>
        {t(
          !admin && listing && (
            <input type="hidden" name="ownerId" value={listing.ownerId} />
          ),
        )}
        {t(
          admin && (
            <Select
              label={t("Mövcud sahib")}
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
          ),
        )}
        <div className="form-pair">
          <Select
            label={t("Sahibin tipi")}
            name="ownerKind"
            defaultValue={listing?.company ? "company" : "person"}
            options={[
              ["company", "Rentakar şirkəti"],
              ["person", "Şəxsi sahib"],
            ]}
          />
          <Field
            label={t("Sahibin / şirkətin adı")}
            name="owner"
            required
            maxLength="80"
            defaultValue={listing?.owner || ""}
          />
        </div>
        <Field
          label={t("Telefon — yalnız əlaqə üçün")}
          name="phone"
          type="tel"
          required={!listing?.demo && !profile?.demo}
          defaultValue={listing?.phone || ""}
          placeholder={t("050 123 45 67")}
        />
        <Field
          label={t("Sahibin Google e-poçtu (istəyə bağlı)")}
          name="ownerEmail"
          type="email"
          maxLength="254"
          defaultValue={
            owners.find((o) => o.id === listing?.ownerId)?.expectedEmail || ""
          }
          placeholder={t("sahib@gmail.com")}
        />
      </fieldset>
      <fieldset disabled={saving}>
        <legend>
          <Car size={17} />
          {t("Avtomobil haqqında")}
        </legend>
        <p className="fieldset-caption">
          {t("Axtarışda düzgün görünməsi üçün məlumatları dəqiq qeyd et.")}
        </p>
        <div className="form-pair">
          <Select
            label={t("Marka")}
            name="brand"
            defaultValue={listing?.brand || "Toyota"}
            options={brands}
          />
          <Field
            label={t("Model")}
            name="model"
            required
            maxLength="60"
            defaultValue={
              listing?.model ||
              listing?.name?.replace(listing.brand, "").trim() ||
              ""
            }
            placeholder={t("Corolla")}
          />
        </div>
        <div className="form-pair">
          <Field
            label={t("Buraxılış ili")}
            name="year"
            type="number"
            required
            min="1980"
            max={new Date().getFullYear() + 1}
            defaultValue={listing?.year || 2023}
          />
          <Select
            label={t("Şəhər")}
            name="city"
            defaultValue={listing?.city || "Bakı"}
            options={cities}
          />
        </div>
        <div className="form-pair">
          <Select
            label={t("Kateqoriya")}
            name="type"
            defaultValue={listing?.type || "Sedan"}
            options={categories}
          />
          <Field
            label={t("Oturacaq sayı")}
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
            label={t("Yanacaq")}
            name="fuel"
            defaultValue={listing?.fuel || "Benzin"}
            options={["Benzin", "Dizel", "Hibrid", "Elektrik"]}
          />
          <Select
            label={t("Sürətlər qutusu")}
            name="transmission"
            defaultValue={listing?.transmission || "Avtomat"}
            options={["Avtomat", "Mexaniki"]}
          />
        </div>
      </fieldset>
      <fieldset disabled={saving}>
        <legend>
          <ShieldCheck size={17} />
          {t("Qiymət və əlavə məlumat")}
        </legend>
        <p className="fieldset-caption">
          {t("Müştəri avtomobili seçməzdən əvvəl bu şərtləri görəcək.")}
        </p>
        <Field
          label={t("Günlük qiymət (₼)")}
          name="price"
          type="number"
          required
          min="1"
          max="10000"
          defaultValue={listing?.price}
        />
        {t(
          admin && (
            <Select
              label={t("Elanın təqdimatı")}
              name="promotion"
              defaultValue={
                listing?.promotion || (listing?.vip ? "vip" : "standard")
              }
              options={[
                ["standard", "Standart"],
                ["vip", "VIP"],
                ["premium", "Premium"],
              ]}
            />
          ),
        )}
        <label>
          {t("Avtomobil haqqında əlavə məlumat")}
          <textarea
            name="description"
            rows="4"
            maxLength="2000"
            defaultValue={listing?.description || ""}
            placeholder={t("Avtomobil haqqında qısa məlumat…")}
          />
        </label>
      </fieldset>
      <label>
        {t("Kirayə şərtləri")}
        <textarea
          name="terms"
          rows="3"
          maxLength="2000"
          defaultValue={listing?.terms || ""}
          placeholder={t(
            "Təhvil yeri, kirayə müddəti və ödəniş haqqında məlumat…",
          )}
        />
      </label>
      <fieldset disabled={saving}>
        <legend>
          <Camera size={17} />
          {t("Avtomobilin fotosu")}
        </legend>
        <p className="fieldset-caption">
          {t(
            "Elana aid real fotonun HTTPS ünvanını əlavə et. Foto yükləmə xidməti hələ qoşulmayıb.",
          )}
        </p>
        <Field
          label={t("Şəkil ünvanı (istəyə bağlı)")}
          name="image"
          type="url"
          placeholder={t("https://…")}
          defaultValue={
            listing?.image?.startsWith("https://") ? listing.image : ""
          }
        />
        {t(
          listing?.image && (
            <div className="editor-photo">
              <img src={listing.image} alt={listing.name} />
              <span>{t("Elanın hazırkı fotosu")}</span>
            </div>
          ),
        )}
      </fieldset>
      <button className="primary" disabled={saving}>
        <Check size={16} />
        {t(
          saving
            ? "Saxlanılır…"
            : listing
              ? "Dəyişiklikləri saxla"
              : admin
                ? "Elanı dərc et"
                : "Yoxlanışa göndər",
        )}
      </button>
    </form>
  );
}
