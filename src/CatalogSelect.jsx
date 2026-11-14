import React, { useEffect, useId, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { t } from "./i18n";
import { catalogOptionMatches } from "./catalogSearch";
export default function CatalogSelect({
  label,
  name,
  options,
  value,
  defaultValue,
  onChange,
}) {
  const [internal, setInternal] = useState(defaultValue || options[0] || "");
  const current = value ?? internal;
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [active, setActive] = useState(-1);
  const id = useId(),
    root = useRef(null),
    trigger = useRef(null),
    search = useRef(null);
  const all = options.includes(current) ? options : [current, ...options];
  const filtered = all.filter((option) =>
    catalogOptionMatches(option, t(option), query),
  );
  const choose = (option) => {
    setInternal(option);
    onChange?.(option);
    setOpen(false);
    trigger.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => search.current?.focus(), 0);
    const outside = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  useEffect(() => {
    if (open && active >= 0)
      root.current
        ?.querySelector(`[data-option-index="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);
  const keys = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length) choose(filtered[Math.max(0, active)]);
    } else if (e.key === "Tab") setOpen(false);
  };
  return (
    <div className="catalog-select" ref={root}>
      <span className="catalog-select-label" id={id + "-label"}>
        {t(label)}
      </span>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-labelledby={id + "-label"}
        aria-expanded={open}
        aria-controls={id + "-list"}
        aria-haspopup="listbox"
        className="catalog-select-trigger"
        onClick={() => {
          setOpen(!open);
          setQuery("");
          setActive(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setQuery("");
            setActive(-1);
          }
        }}
      >
        <span>{t(current)}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="catalog-select-popup">
          <div className="catalog-select-search">
            <Search size={15} />
            <input
              ref={search}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={keys}
              role="combobox"
              aria-label={t("Siyahıda axtar") + ": " + t(label)}
              aria-expanded="true"
              aria-controls={id + "-list"}
              aria-activedescendant={
                active >= 0 && filtered[active]
                  ? `${id}-option-${active}`
                  : undefined
              }
              autoComplete="off"
              placeholder={t("Siyahıda axtar")}
            />
          </div>
          <div
            className="catalog-select-list"
            id={id + "-list"}
            role="listbox"
            aria-label={t(label)}
          >
            {filtered.length ? (
              filtered.map((option, i) => (
                <button
                  key={option}
                  id={`${id}-option-${i}`}
                  data-option-index={i}
                  className={active === i ? "is-active" : ""}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={current === option}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(option)}
                >
                  <span>{t(option)}</span>
                  {current === option && <Check size={15} />}
                </button>
              ))
            ) : (
              <p className="catalog-select-empty" role="status">
                {t("Uyğun seçim tapılmadı.")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
