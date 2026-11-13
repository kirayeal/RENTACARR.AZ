import React, { useState } from "react";
import { brands, categories, cities } from "./catalog";
export default function ListingEditor({ listing, owners, admin, onSubmit }) {
  const [selectedOwner, setSelectedOwner] = useState(listing?.ownerId || "");
  return (
    <form className="listing-form" onSubmit={onSubmit}>
      {admin && (
        <label>
          Mövcud sahib
          <select
            name="ownerId"
            defaultValue={listing?.ownerId || ""}
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
          >
            <option value="">Yeni sahib profili yarat</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
                {o.demo ? " · Nümunə profil" : ` · ${o.phone}`}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="form-pair">
        <label>
          Sahibin tipi
          <select
            name="ownerKind"
            defaultValue={listing?.company ? "company" : "person"}
          >
            <option value="company">Rentakar şirkəti</option>
            <option value="person">Şəxsi sahib</option>
          </select>
        </label>
        <label>
          Sahibin / şirkətin adı
          <input
            name="owner"
            defaultValue={listing?.owner || ""}
            required
            maxLength="80"
          />
        </label>
      </div>
      <label>
        Sahibin Google e-poçtu (istəyə bağlı)
        <input
          name="ownerEmail"
          type="email"
          defaultValue={
            owners.find((o) => o.id === listing?.ownerId)?.expectedEmail || ""
          }
          maxLength="254"
        />
      </label>
      <div className="form-pair">
        <label>
          Marka
          <select name="brand" defaultValue={listing?.brand || "Toyota"}>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          Model
          <input
            name="model"
            required
            defaultValue={
              listing?.model ||
              listing?.name?.replace(listing.brand, "").trim() ||
              ""
            }
            maxLength="60"
            placeholder="Corolla"
          />
        </label>
      </div>
      <div className="form-pair">
        <label>
          Buraxılış ili
          <input
            name="year"
            type="number"
            required
            min="1980"
            max={new Date().getFullYear() + 1}
            defaultValue={listing?.year || 2023}
          />
        </label>
        <label>
          Günlük qiymət (₼)
          <input
            name="price"
            type="number"
            required
            min="1"
            max="10000"
            defaultValue={listing?.price}
          />
        </label>
      </div>
      <div className="form-pair">
        <label>
          Şəhər
          <select name="city" defaultValue={listing?.city || "Bakı"}>
            {cities.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Kateqoriya
          <select name="type" defaultValue={listing?.type || "Sedan"}>
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-pair">
        <label>
          Yanacaq
          <select name="fuel" defaultValue={listing?.fuel || "Benzin"}>
            {["Benzin", "Dizel", "Hibrid", "Elektrik"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Sürətlər qutusu
          <select
            name="transmission"
            defaultValue={listing?.transmission || "Avtomat"}
          >
            <option>Avtomat</option>
            <option>Mexaniki</option>
          </select>
        </label>
      </div>
      <div className="form-pair">
        <label>
          Depozit (₼)
          <input
            name="deposit"
            type="number"
            min="0"
            max="100000"
            required
            defaultValue={listing?.deposit ?? 200}
          />
        </label>
        <label>
          Yürüş limiti (km / gün)
          <input
            name="mileage"
            type="number"
            min="1"
            max="10000"
            required
            defaultValue={listing?.mileage ?? 250}
          />
        </label>
      </div>
      <div className="form-pair">
        <label>
          Minimum yaş
          <input
            name="minAge"
            type="number"
            min="18"
            max="80"
            required
            defaultValue={listing?.minAge ?? 23}
          />
        </label>
        <label>
          Sürücülük təcrübəsi (il)
          <input
            name="experience"
            type="number"
            min="0"
            max="60"
            required
            defaultValue={listing?.experience ?? 2}
          />
        </label>
      </div>
      <div className="form-pair">
        <label>
          Oturacaq sayı
          <input
            name="seats"
            type="number"
            min="1"
            max="50"
            required
            defaultValue={listing?.seats ?? 5}
          />
        </label>
        {admin && (
          <label>
            Elanın təqdimatı
            <select
              name="promotion"
              defaultValue={
                listing?.promotion || (listing?.vip ? "vip" : "standard")
              }
            >
              <option value="standard">Standart — pulsuz</option>
              <option value="vip">VIP — ön sıralarda</option>
              <option value="premium">Premium — xüsusi vurğu</option>
            </select>
          </label>
        )}
      </div>
      <label>
        Telefon — yalnız əlaqə üçün
        <input
          name="phone"
          type="tel"
          required={!listing?.demo && !owners.find(o=>o.id===selectedOwner)?.demo}
          defaultValue={listing?.phone || ""}
          placeholder="050 123 45 67"
        />
      </label>
      <label>
        Avtomobilin şəkil ünvanı (istəyə bağlı)
        <input
          name="image"
          type="url"
          placeholder="https://…"
          defaultValue={
            listing?.image?.startsWith("https://") ? listing.image : ""
          }
        />
      </label>
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
      <button className="primary">
        {listing
          ? "Dəyişiklikləri saxla"
          : admin
            ? "Elanı dərc et"
            : "Yoxlanışa göndər"}
      </button>
    </form>
  );
}
