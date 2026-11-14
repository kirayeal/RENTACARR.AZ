import React from "react";
import { Bookmark, ArrowUpRight, Trash2 } from "lucide-react";
import { t } from "./i18n";
export default function SavedSearches({ items, onApply, onDelete }) {
  return (
    <>
      <span className="eyebrow">RENTACARR.AZ</span>
      <h2>{t("Saxlanmış axtarışlar")}</h2>
      <p>
        {t(
          "Seçdiyiniz filtrlərə bir toxunuşla qayıdın. Axtarışlar bu brauzerdə saxlanır.",
        )}
      </p>
      <div className="saved-search-list">
        {items.length ? (
          items.map((item) => (
            <article key={item.id}>
              <Bookmark size={21} />
              <div>
                <h3>{item.title || t("Bütün elanlar")}</h3>
                <p>
                  {[
                    item.search.city === "Bütün şəhərlər"
                      ? null
                      : t(item.search.city),
                    item.search.brand === "Bütün markalar"
                      ? null
                      : item.search.brand,
                    item.search.max
                      ? `${item.search.max} ₼ ${t("Maksimum qiymət")}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || t("Bütün elanlar")}
                </p>
              </div>
              <button className="outline" onClick={() => onApply(item.search)}>
                {t("Axtarışı aç")}
                <ArrowUpRight size={16} />
              </button>
              <button
                className="saved-search-delete"
                aria-label={t("Axtarışı sil") + ": " + item.title}
                onClick={() => onDelete(item.id)}
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))
        ) : (
          <div className="empty">
            <Bookmark size={25} />
            {t("Hələ saxlanmış axtarış yoxdur.")}
          </div>
        )}
      </div>
    </>
  );
}
