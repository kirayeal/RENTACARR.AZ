import { t, useLanguage, setLanguage } from "./i18n";
import React, { useState, useEffect } from "react";
import { SessionBoundary, GoogleLogin, request } from "./session";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Search,
  MapPin,
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCcw,
  Heart,
  ShieldCheck,
  Fuel,
  Users,
  Gauge,
  X,
  Check,
  Plus,
  Car,
  Crown,
  Sparkles,
  LayoutDashboard,
  ClipboardList,
  Building2,
  CircleHelp,
  Download,
  Pencil,
  Pause,
  Play,
  Trash2,
  ArrowLeft,
  UserRound,
  Camera,
  Clock3,
  Phone,
  Mail,
} from "lucide-react";
import "./style.css";
import "./catalogue.css";
import "@fontsource-variable/inter";
import ListingEditor from "./ListingEditor";
import Registration from "./Registration";
import EmailAccess from "./EmailAccess";
import { initial, brands, categories, cities, promotionRank } from "./catalog";
function App({ user, onAuthenticated, onLogout, authError }) {
  const language = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = "RENTACARR.AZ — " + t("Avtomobil kirayəsi");
  }, [language]);
  const [adminView, setAdminView] = useState("overview");
  const [catalogueView, setCatalogueView] = useState("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const workspace = {
    cars: [],
    pending: [],
    owners: [],
  };
  const [publicCars, setPublicCars] = useState(initial),
    [serviceError, setServiceError] = useState(""),
    [saving, setSaving] = useState(false);
  const [owners, setOwners] = useState(workspace.owners),
    [ownerQuery, setOwnerQuery] = useState("");
  const [cars, setCars] = useState(workspace.cars),
    [city, setCity] = useState("Bütün şəhərlər"),
    [brand, setBrand] = useState("Bütün markalar"),
    [max, setMax] = useState(""),
    [filters, setFilters] = useState({
      city: "Bütün şəhərlər",
      brand: "Bütün markalar",
      max: "",
    }),
    [category, setCategory] = useState("Hamısı"),
    [liked, setLiked] = useState(() => {
      try {
        const stored = JSON.parse(
          localStorage.getItem(
            "rentacarr.favorites." + (user?.id || "guest"),
          ) || "[]",
        );
        return Array.isArray(stored) ? stored : [];
      } catch {
        return [];
      }
    }),
    [favorites, setFavorites] = useState(false),
    [selected, setSelected] = useState(null),
    [modal, setModal] = useState(
      user && !user.profile?.complete ? "register" : null,
    ),
    [adminMode, setAdmin] = useState(false),
    [pending, setPending] = useState(workspace.pending),
    [sort, setSort] = useState("Seçilmiş elanlar"),
    [toast, setToast] = useState(""),
    [modelQuery, setModelQuery] = useState(""),
    [adminSearch, setAdminSearch] = useState(""),
    [adminStatus, setAdminStatus] = useState("all"),
    [deleteId, setDeleteId] = useState(null);
  useEffect(() => {
    try {
      localStorage.setItem(
        "rentacarr.favorites." + (user?.id || "guest"),
        JSON.stringify(liked),
      );
    } catch {}
  }, [liked, user?.id]);
  const admin = Boolean(user?.isAdmin && user?.profile?.complete && adminMode);
  const editing = modal?.startsWith("edit:")
    ? [...cars, ...pending].find((c) => String(c.id) === modal.slice(5))
    : null;
  async function refreshWorkspace() {
    const [publicData, privateData] = await Promise.all([
      request("/api/listings"),
      user ? request("/api/workspace") : Promise.resolve(null),
    ]);
    setPublicCars(publicData.listings?.length ? publicData.listings : initial);
    if (privateData) {
      setCars(privateData.cars);
      setOwners(privateData.owners);
      setPending(privateData.pending);
    }
    setServiceError("");
  }
  useEffect(() => {
    refreshWorkspace().catch((e) => setServiceError(e.message));
  }, [user?.id]);
  async function mutateListing(id, patch) {
    try {
      await request("/api/listings", {
        method: "PATCH",
        body: {
          id,
          ...patch,
        },
      });
      await refreshWorkspace();
      note("Dəyişiklik saxlanıldı.");
    } catch (e) {
      note(e.message);
    }
  }
  async function removeListing(id) {
    try {
      await request("/api/listings", {
        method: "DELETE",
        body: {
          id,
        },
      });
      await refreshWorkspace();
      setDeleteId(null);
      note("Elan silindi.");
    } catch (e) {
      note(e.message);
    }
  }
  useEffect(() => {
    if (!selected && !modal && deleteId === null) return;
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(
      () => document.querySelector(".overlay button, .overlay input")?.focus(),
      0,
    );
    const keydown = (e) => {
      if (e.key === "Escape") {
        setSelected(null);
        setModal(null);
        setDeleteId(null);
      }
      if (e.key === "Tab") {
        const dialog = document.querySelector(".overlay");
        const elements = [
          ...(dialog?.querySelectorAll(
            "button,a[href],input,select,textarea",
          ) || []),
        ].filter((el) => !el.disabled);
        const first = elements[0],
          last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus?.();
    };
  }, [selected, modal, deleteId]);
  function note(t) {
    setToast(t);
    setTimeout(() => setToast(""), 4000);
  }
  const filtered = publicCars
    .filter(
      (c) =>
        !c.paused &&
        c.name
          .toLocaleLowerCase("az")
          .includes(modelQuery.toLocaleLowerCase("az")),
    )
    .filter(
      (c) =>
        (filters.city === "Bütün şəhərlər" || c.city === filters.city) &&
        (filters.brand === "Bütün markalar" || c.brand === filters.brand) &&
        (!filters.max || c.price <= Number(filters.max)) &&
        (category === "Hamısı" || c.type === category) &&
        (!favorites || liked.includes(c.id)),
    )
    .sort((a, b) =>
      sort === "Əvvəlcə ucuz"
        ? a.price - b.price
        : sort === "Əvvəlcə bahalı"
          ? b.price - a.price
          : promotionRank(b) - promotionRank(a),
    );
  async function submit(e) {
    e.preventDefault();
    if (!user) {
      setModal("account");
      note("Elan yerləşdirmək üçün daxil olun.");
      return;
    }
    const d = new FormData(e.target);
    setSaving(true);
    try {
      const details = Object.fromEntries(d.entries());
      if (editing) {
        if (details.ownerId)
          await request("/api/owners", {
            method: "PATCH",
            body: {
              ...details,
              id: details.ownerId,
            },
          });
        await request("/api/listings", {
          method: "PATCH",
          body: {
            id: editing.id,
            ownerId: details.ownerId,
            details,
            promotion: admin ? details.promotion : undefined,
          },
        });
      } else
        await request("/api/listings", {
          method: "POST",
          body: details,
        });
      await refreshWorkspace();
      setModal(null);
      note(
        editing
          ? "Elan yeniləndi."
          : admin
            ? "Elan dərc edildi."
            : "Elan yoxlanışa göndərildi.",
      );
    } catch (error) {
      note(error.message);
    } finally {
      setSaving(false);
    }
  }
  function exportWorkspace() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              version: 1,
              cars,
              pending,
              owners,
            },
            null,
            2,
          ),
        ],
        {
          type: "application/json",
        },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "rentacarr-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  const adminCars = cars
    .filter((c) =>
      (c.name + " " + c.owner)
        .toLocaleLowerCase("az")
        .includes(adminSearch.toLocaleLowerCase("az")),
    )
    .filter(
      (c) =>
        adminStatus === "all" ||
        (adminStatus === "paused"
          ? c.paused
          : adminStatus === "active"
            ? !c.paused
            : adminStatus === "premium"
              ? c.promotion === "premium"
              : c.promotion === "vip" || (c.vip && c.promotion !== "premium")),
    );
  return (
    <>
      <header>
        <a
          className="logo"
          href="#"
          onClick={() => {
            setAdmin(false);
            setFavorites(false);
          }}
        >
          {t("rentacarr")}
          <span className="logo-az">{t(".az")}</span>
        </a>
        <nav>
          <a href="#cars" onClick={() => setAdmin(false)}>
            {t("Avtomobillər")}
          </a>
          <button onClick={() => setModal("partners")}>
            {t("Partnyorlar")}
          </button>
          <button onClick={() => setModal("how")}>{t("Necə işləyir?")}</button>
        </nav>
        <div className="header-right">
          <div className="language-switch" role="group" aria-label={t("Dil seçimi")}>
            {[["az", "Azərbaycan dili"], ["en", "English"], ["ru", "Русский"]].map(([value, label]) => (
              <button key={value} type="button" lang={value} title={label} aria-label={label} aria-pressed={language === value} onClick={() => setLanguage(value)}>
                {value.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className="heart-top"
            aria-label={t("Seçilmiş elanlar")}
            onClick={() => {
              setFavorites(!favorites);
              setAdmin(false);
              document.getElementById("cars")?.scrollIntoView();
            }}
          >
            <Heart size={20} fill={favorites ? "currentColor" : "none"} />
          </button>
          <button
            className="login"
            aria-label={t(user ? "Hesabım" : "Qeydiyyat və giriş")}
            onClick={() => setModal("account")}
          >
            <UserRound size={17} />
            <span>{t(user ? "Hesabım" : "Qeydiyyat / Giriş")}</span>
          </button>
          <button
            className="primary add"
            onClick={() =>
              setModal(
                user
                  ? user.profile?.complete
                    ? "listing"
                    : "register"
                  : "account",
              )
            }
          >
            <Plus size={17} />
            {t("Elan yerləşdir")}
          </button>
        </div>
      </header>
      {t(
        !admin && (
          <nav className="mobile-nav" aria-label={t("Əsas menyu")}>
            <a href="#cars">{t("Avtomobillər")}</a>
            <button onClick={() => setModal("partners")}>
              {t("Partnyorlar")}
            </button>
            <button onClick={() => setModal("how")}>
              {t("Necə işləyir?")}
            </button>
            <button
              aria-label={t("Seçilmiş elanlar")}
              onClick={() => {
                setFavorites(!favorites);
                document.getElementById("cars")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <Heart size={16} fill={favorites ? "currentColor" : "none"} />
            </button>
          </nav>
        ),
      )}
      {t(
        (authError || serviceError) && (
          <div className="service-notice" role="status">
            {t(authError || serviceError)}
          </div>
        ),
      )}
      {t(
        admin ? (
          <main className="admin" data-view={adminView}>
            <div className="section-title">
              <div>
                <span className="eyebrow">{t("İDARƏETMƏ PANELİ")}</span>
                <h1>{t("Hər şey nəzarətində.")}</h1>
                <p>
                  {t(
                    "Elanları, sahibləri və yoxlanışları idarə et. Giriş yalnız təsdiqlənmiş admin hesabına açıqdır.",
                  )}
                </p>
              </div>
              <button className="outline" onClick={() => setAdmin(false)}>
                <ArrowLeft size={16} />
                {t("Sayta qayıt")}
              </button>
            </div>
            <nav className="admin-nav" aria-label={t("İdarəetmə bölmələri")}>
              {t(
                [
                  ["overview", "İcmal", LayoutDashboard],
                  ["listings", "Elanlar", Car],
                  ["owners", "Sahiblər", Users],
                  ["review", "Yoxlanış", ClipboardList],
                  ["help", "Bələdçi", CircleHelp],
                ].map(([key, label, Icon]) => (
                  <button
                    key={key}
                    aria-pressed={adminView === key}
                    className={adminView === key ? "active" : ""}
                    onClick={() => setAdminView(key)}
                  >
                    <Icon size={17} />
                    {t(label)}
                    {t(
                      key === "review" && pending.length > 0 && (
                        <span>{t(pending.length)}</span>
                      ),
                    )}
                  </button>
                )),
              )}
            </nav>
            <div className="stats">
              {t(
                [
                  ["Aktiv elanlar", cars.filter((c) => !c.paused).length],
                  ["Yoxlanış gözləyən", pending.length],
                  [
                    "Premium elanlar",
                    cars.filter((c) => c.promotion === "premium").length,
                  ],
                  [
                    "VIP elanlar",
                    cars.filter((c) => c.promotion === "vip").length,
                  ],
                ].map(([label, n]) => (
                  <article key={label}>
                    <div className="stat-icon">
                      {t(
                        label.includes("Premium") ? (
                          <Crown size={19} />
                        ) : label.includes("VIP") ? (
                          <Sparkles size={19} />
                        ) : label.includes("gözləyən") ? (
                          <Clock3 size={19} />
                        ) : (
                          <Car size={19} />
                        ),
                      )}
                    </div>
                    <span>{t(label)}</span>
                    <strong>{t(n)}</strong>
                  </article>
                )),
              )}
            </div>
            <div className="admin-actions">
              <button
                className="primary"
                onClick={() =>
                  setModal(
                    user
                      ? user.profile?.complete
                        ? "listing"
                        : "register"
                      : "account",
                  )
                }
              >
                <Plus size={17} />
                {t("Sahibin adından elan yerləşdir")}
              </button>
              <button className="outline" onClick={() => setAdmin(false)}>
                {t("Nümunə kataloquna bax")}
              </button>
              <button className="outline" onClick={exportWorkspace}>
                <Download size={16} />
                {t("Ehtiyat nüsxəni endir")}
              </button>
            </div>
            <section className="admin-overview">
              <div className="overview-heading">
                <span className="eyebrow">{t("İŞ MƏKANI")}</span>
                <h2>{t("Avtoparkına ümumi baxış")}</h2>
                <p>
                  {t(
                    "Elanları, sahibləri və yoxlanışları bir yerdən idarə et.",
                  )}
                </p>
              </div>
              <div className="overview-grid">
                <button onClick={() => setAdminView("listings")}>
                  <Car size={23} />
                  <h3>{t("Elanları idarə et")}</h3>
                  <p>{t("Qiymət, təqdimat və aktivlik statusu.")}</p>
                  <ArrowUpRight size={18} />
                </button>
                <button onClick={() => setAdminView("owners")}>
                  <Building2 size={23} />
                  <h3>{t("Sahib profilləri")}</h3>
                  <p>
                    {t(owners.length)}
                    {t("profil və onlara aid avtomobillər.")}
                  </p>
                  <ArrowUpRight size={18} />
                </button>
                <button onClick={() => setAdminView("review")}>
                  <ClipboardList size={23} />
                  <h3>{t("Yoxlanış gözləyənlər")}</h3>
                  <p>
                    {t(pending.length)}
                    {t("elan qərarını gözləyir.")}
                  </p>
                  <ArrowUpRight size={18} />
                </button>
              </div>
              <div className="workspace-notice">
                <ShieldCheck size={19} />
                <div>
                  <h3>{t("Qorunan admin iş məkanı")}</h3>
                  <p>
                    {t(
                      "Məlumatlar serverdə saxlanır. Sahib profilləri və şəxsi e-poçtlar yalnız icazəli hesablara göstərilir.",
                    )}
                  </p>
                </div>
              </div>
            </section>
            <section className="owner-management">
              <span className="eyebrow">
                {t("HESABDAN ƏVVƏL DƏ SAHİB PROFİLİ")}
              </span>
              <h2>{t("Avtomobil sahibləri")}</h2>
              <p>
                {t(
                  "Hər sahibin elanları öz profilinə bağlanır. Hesaba e-poçt və şifrə ilə daxil olunur.",
                )}
              </p>
              <input
                className="owner-search"
                aria-label={t("Sahib axtar")}
                placeholder={t("Ad, telefon və ya e-poçt ilə axtar…")}
                value={ownerQuery}
                onChange={(e) => setOwnerQuery(e.target.value)}
              />
              {t(
                owners.length === 0 ? (
                  <div className="empty">
                    {t(
                      "Hələ sahib profili yoxdur. Sahibin adından ilk elanı yerləşdirin.",
                    )}
                  </div>
                ) : (
                  owners
                    .filter((o) =>
                      (o.name + " " + o.phone + " " + (o.expectedEmail || ""))
                        .toLocaleLowerCase("az")
                        .includes(ownerQuery.toLocaleLowerCase("az")),
                    )
                    .map((o) => (
                      <article className="owner-row" key={o.id}>
                        <div>
                          <b>{t(o.name)}</b>
                          <p>
                            {t(
                              o.kind === "company"
                                ? "Rentakar şirkəti"
                                : "Şəxsi sahib",
                            )}
                            {t(" ")}
                            {t("·")}
                            {t(o.phone)}
                          </p>
                          <p>
                            {t(
                              o.expectedEmail ||
                                "Google hesabı üçün e-poçt əlavə edilməyib",
                            )}
                          </p>
                        </div>
                        <div>
                          <strong>
                            {t(
                              cars.filter(
                                (c) => c.ownerId === o.id && !c.paused,
                              ).length,
                            )}
                          </strong>
                          <small>{t("aktiv elan")}</small>
                          <p>
                            {t(
                              pending.filter((c) => c.ownerId === o.id).length,
                            )}
                            {t(" ")}
                            {t("yoxlanışda")}
                          </p>
                        </div>
                        <span className="claim-status">
                          {t(
                            o.accountId
                              ? "Hesaba bağlanıb"
                              : "Giriş gözlənilir",
                          )}
                        </span>
                        <button
                          className="outline"
                          onClick={() => {
                            setSelected(null);
                            setModal("owner:" + o.id);
                          }}
                        >
                          {t("Elanlarına bax")}
                        </button>
                      </article>
                    ))
                ),
              )}
            </section>
            <section className="admin-review">
              <h2>{t("Yoxlanış gözləyən elanlar")}</h2>
              {t(
                !pending.length ? (
                  <div className="empty">
                    {t(
                      "Yeni elan yoxdur. “Elan yerləşdir” vasitəsilə nümunə elan göndərə bilərsiniz.",
                    )}
                  </div>
                ) : (
                  pending.map((c) => (
                    <div className="admin-row" key={c.id}>
                      <div>
                        <b>{t(c.name)}</b>
                        <p>
                          {t(c.owner)}
                          {t("·")}
                          {t(c.city)}
                          {t("·")}
                          {t(c.price)}
                          {t("₼ / gün")}
                        </p>
                      </div>
                      <button
                        className="primary"
                        onClick={() =>
                          mutateListing(c.id, {
                            status: "active",
                          })
                        }
                      >
                        {t("Təsdiqlə")}
                      </button>
                      <button
                        className="outline"
                        onClick={() => removeListing(c.id)}
                      >
                        {t("Rədd et")}
                      </button>
                    </div>
                  ))
                ),
              )}
            </section>
            <section className="admin-listings">
              <h2>{t("Elanların idarə edilməsi")}</h2>
              <div className="admin-filters">
                <input
                  aria-label={t("Elan axtar")}
                  placeholder={t("Avtomobil və ya sahib axtar…")}
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
                <select
                  aria-label={t("Elan statusu")}
                  value={adminStatus}
                  onChange={(e) => setAdminStatus(e.target.value)}
                >
                  <option value="all">{t("Bütün elanlar")}</option>
                  <option value="active">{t("Aktiv")}</option>
                  <option value="paused">{t("Dayandırılmış")}</option>
                  <option value="vip">{t("VIP")}</option>
                  <option value="premium">{t("Premium")}</option>
                </select>
                <span>
                  {t(adminCars.length)}
                  {t("elan")}
                </span>
              </div>
              {t(
                adminCars.map((c) => (
                  <div className="admin-row" key={c.id}>
                    <img className="admin-thumb" src={c.image} alt={t("")} />
                    <div>
                      <b>{t(c.name)}</b>
                      <p>
                        {t(c.owner)}
                        {t("·")}
                        {t(c.city)}
                      </p>
                      <span
                        className={"status-pill " + (c.paused ? "paused" : "")}
                      >
                        {t(c.paused ? "Dayandırılıb" : "Aktiv")}
                      </span>
                      {t(
                        c.demo && (
                          <span className="sample-pill">{t("Nümunə")}</span>
                        ),
                      )}
                    </div>
                    <span>
                      {t(c.price)}
                      {t("₼ / gün")}
                    </span>
                    <select
                      aria-label={t(`${c.name} təqdimat`)}
                      value={c.promotion || (c.vip ? "vip" : "standard")}
                      onChange={(e) =>
                        mutateListing(c.id, {
                          promotion: e.target.value,
                        })
                      }
                    >
                      <option value="standard">{t("Standart")}</option>
                      <option value="vip">{t("VIP")}</option>
                      <option value="premium">{t("Premium")}</option>
                    </select>
                    <button
                      className="outline"
                      onClick={() => setModal("edit:" + c.id)}
                    >
                      <Pencil size={15} />
                      {t("Redaktə et")}
                    </button>
                    <button
                      className="outline"
                      onClick={() =>
                        mutateListing(c.id, {
                          status: c.paused ? "active" : "paused",
                        })
                      }
                    >
                      {t(c.paused ? <Play size={15} /> : <Pause size={15} />)}
                      {t(" ")}
                      {t(c.paused ? "Aktivləşdir" : "Dayandır")}
                    </button>
                    <button
                      className="outline danger"
                      onClick={() => setDeleteId(c.id)}
                    >
                      <Trash2 size={15} />
                      {t("Sil")}
                    </button>
                  </div>
                )),
              )}
              {t(
                !adminCars.length && (
                  <div className="empty">
                    {t("Bu seçimə uyğun elan yoxdur.")}
                  </div>
                ),
              )}
            </section>
            <section className="admin-guide">
              <h2>{t("Admin üçün qısa bələdçi")}</h2>
              <p>
                <b>{t("Elanlar:")}</b>
                {t(
                  "Sahib seçin, avtomobili və şərtləri doldurun. Adminin elanı dərhal görünür; ziyarətçinin elanı yoxlanışa düşür.",
                )}
              </p>
              <p>
                <b>{t("VIP və Premium:")}</b>
                {t(
                  "Ödəniş etmədən statusu paneldən dəyişə bilərsiniz. Premium əvvəl, VIP sonra, standart elanlar isə onların ardınca göstərilir.",
                )}
              </p>
              <p>
                <b>{t("Dayandırma:")}</b>
                {t(
                  "Avtomobil kirayədədirsə, elanı silmədən kataloqdan gizlədin.",
                )}
              </p>
              <p>
                <b>{t("Sahiblər:")}</b>
                {t(
                  "Eyni sahibin yeni avtomobili üçün mövcud profili seçin. Sahibin təsdiqlənmiş e-poçtu həmin profilə bağlanır.",
                )}
              </p>
              <p>
                <b>{t("Məlumatlar:")}</b>
                {t(
                  "Dəyişikliklər serverdə saxlanır. Şəxsi məlumatlar yalnız icazəli hesablara açıqdır. Ödəniş sistemi hələ aktiv deyil.",
                )}
              </p>
            </section>
          </main>
        ) : (
          <>
            <section className="hero">
              <div className="hero-content">
                <div className="hero-tag">{t("Avtomobil kirayəsi")}</div>
                <h1>{t("Azərbaycanda avtomobil kirayəsi")}</h1>
                <p>
                  {t("Rentakar şirkətləri və şəxsi sahiblərdən günlük, həftəlik və aylıq avtomobil kirayəsi.")}
                </p>
              </div>
              <div className="hero-periods" aria-label={t("Kirayə müddəti")}>
                <span>{t("Günlük")}</span><span>{t("Həftəlik")}</span><span>{t("Aylıq")}</span>
              </div>
            </section>
            <div className="marketplace-layout">
              <aside
                className={"search-wrap " + (filtersOpen ? "filters-open" : "")}
              >
                <div className="filter-panel-heading">
                  <span>
                    <SlidersHorizontal size={18} />
                    {t("Axtarış filtrləri")}
                  </span>
                  <button
                    aria-label={t("Filtrləri təmizlə")}
                    onClick={() => {
                      setCity("Bütün şəhərlər");
                      setBrand("Bütün markalar");
                      setMax("");
                      setModelQuery("");
                      setCategory("Hamısı");
                      setFilters({
                        city: "Bütün şəhərlər",
                        brand: "Bütün markalar",
                        max: "",
                      });
                    }}
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button className="filter-close" aria-label={t("Bağla")} onClick={() => setFiltersOpen(false)}><X size={17} /></button>
                </div>
                <form
                  className="search-box"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFilters({
                      city,
                      brand,
                      max,
                    });
                    setFiltersOpen(false);
                    document.getElementById("cars").scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  <label>
                    <span>
                      <MapPin size={15} />
                      {t("Şəhər")}
                    </span>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      {t(
                        ["Bütün şəhərlər", ...cities].map((x) => (
                          <option key={x} value={x}>
                            {t(x)}
                          </option>
                        )),
                      )}
                    </select>
                  </label>
                  <label>
                    <span>
                      <Car size={15} />
                      {t("Marka")}
                    </span>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    >
                      {t(
                        ["Bütün markalar", ...brands].map((x) => (
                          <option key={x} value={x}>
                            {t(x)}
                          </option>
                        )),
                      )}
                    </select>
                  </label>
                  <label>
                    <span>{t("Günlük büdcə")}</span>
                    <div className="budget">
                      <input
                        type="number"
                        min="1"
                        placeholder={t("Maksimum qiymət")}
                        value={max}
                        onChange={(e) => setMax(e.target.value)}
                      />
                      <b>{t("₼")}</b>
                    </div>
                  </label>
                  <label className="model-search">
                    {t("Model axtar")}
                    <input
                      value={modelQuery}
                      onChange={(e) => setModelQuery(e.target.value)}
                      placeholder={t("Məsələn: RAV4, Panamera, GLS…")}
                    />
                  </label>
                  <button className="primary search-submit">
                    <Search size={18} />
                    {t("Avtomobil tap")}
                  </button>
                </form>
                <div className="filter-panel-note">
                  <Phone size={17} />
                  <p>{t("Elanı seç, sahibi ilə birbaşa əlaqə saxla.")}</p>
                </div>
              </aside>
              <main id="cars">
                <div className="section-title">
                  <div>
                    <span className="eyebrow">{t("SEÇİM SƏNİNDİR")}</span>
                    <h2>
                      {t(
                        favorites
                          ? "Bəyəndiyin avtomobillər"
                          : "Avtomobil elanları",
                      )}
                    </h2>
                    <p>
                      {t("Planına və büdcənə uyğun avtomobilləri kəşf et.")}
                    </p>
                  </div>
                  <span className="listing-count">
                    {t(`${filtered.length} avtomobil mövcuddur`)}
                  </span>
                </div>
                <div className="mobile-catalogue-tools">
                  <button
                    className="outline"
                    aria-expanded={filtersOpen}
                    onClick={() => {
                      setFiltersOpen(!filtersOpen);
                      if (!filtersOpen)
                        setTimeout(
                          () =>
                            document
                              .querySelector(".search-wrap")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              }),
                          0,
                        );
                    }}
                  >
                    <SlidersHorizontal size={17} />
                    {t("Filtrlər")}
                  </button>
                  <span>{t(`${filtered.length} avtomobil mövcuddur`)}</span>
                </div>
                <div className="filter-bar">
                  <div className="tabs">
                    {t(
                      ["Hamısı", ...categories].map((x) => (
                        <button
                          key={x}
                          className={category === x ? "active" : ""}
                          onClick={() => setCategory(x)}
                        >
                          {t(x === "Hamısı" && <Car size={16} />)} {t(x)}
                        </button>
                      )),
                    )}
                  </div>

                </div>

                <div className="demo-note">
                  {t("Təqdimat kataloqu · Real fotolar, nümunə qiymətlər")}
                </div>
                <div className="catalogue-toolbar">
                  <div className="results-description">
                    {favorites ? <Heart size={16} /> : <Car size={16} />}
                    <span>{t(`${filtered.length} avtomobil mövcuddur`)}</span>
                  </div>
                  <select
                    aria-label={t("Elan sıralaması")}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {t(
                      [
                        "Seçilmiş elanlar",
                        "Əvvəlcə ucuz",
                        "Əvvəlcə bahalı",
                      ].map((x) => (
                        <option key={x} value={x}>
                          {t(x)}
                        </option>
                      )),
                    )}
                  </select>
                  <div className="view-switch" aria-label={t("Görünüş")}>
                    <button
                      aria-label={t("Kart görünüşü")}
                      aria-pressed={catalogueView === "grid"}
                      onClick={() => setCatalogueView("grid")}
                    >
                      <LayoutGrid size={17} />
                    </button>
                    <button
                      aria-label={t("Siyahı görünüşü")}
                      aria-pressed={catalogueView === "list"}
                      onClick={() => setCatalogueView("list")}
                    >
                      <List size={19} />
                    </button>
                  </div>
                </div>
                <div
                  className={
                    "grid " + (catalogueView === "list" ? "catalogue-list" : "")
                  }
                >
                  {t(
                    filtered.map((c, index) => (
                      <article
                        className="car-card"
                        key={c.id}
                        tabIndex={0}
                        aria-label={t(c.name + " elanı aç")}
                        onKeyDown={(e) => {
                          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            setSelected(c);
                          }
                        }}
                        onClick={() => setSelected(c)}
                      >
                        <div className="car-image">
                          <button
                            className="image-open"
                            aria-label={t(c.name + " elanı aç")}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(c);
                            }}
                          >
                            <img
                              src={c.image}
                              alt={c.name}
                              loading={index < 3 ? "eager" : "lazy"}
                              decoding="async"
                            />
                          </button>
                          <div className="badges">
                            {t(
                              c.promotion === "premium" ? (
                                <span className="premium">
                                  <Crown size={12} />
                                  {t("Premium")}
                                </span>
                              ) : (
                                c.vip && (
                                  <span className="vip">
                                    <Sparkles size={12} />
                                    {t("VIP")}
                                  </span>
                                )
                              ),
                            )}
                          </div>
                          <button
                            aria-label={t(liked.includes(c.id) ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et")}
                            aria-pressed={liked.includes(c.id)}
                            className={
                              "like " + (liked.includes(c.id) ? "liked" : "")
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setLiked(
                                liked.includes(c.id)
                                  ? liked.filter((x) => x !== c.id)
                                  : [...liked, c.id],
                              );
                            }}
                          >
                            <Heart
                              size={18}
                              fill={
                                liked.includes(c.id) ? "currentColor" : "none"
                              }
                            />
                          </button>
                        </div>
                        <div className="card-body">
                          <div className="card-location">
                            <MapPin size={12} />
                            {t(c.city)}
                            <span>{t(c.year)}</span>
                          </div>
                          <button
                            className="car-name"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(c);
                            }}
                          >
                            {t(c.name)}
                          </button>
                          <div className="specs">
                            <span>
                              <Gauge size={14} />{" "}
                              {t(c.transmission || "Avtomat")}
                            </span>
                            <span>
                              <Fuel size={14} /> {t(c.fuel || "Benzin")}
                            </span>
                            <span>
                              <Users size={14} /> {t(c.seats || 5)}
                              {t("yer")}
                            </span>
                          </div>
                          <div className="card-bottom">
                            <div>
                              <strong>
                                {t(c.price)} <span>{t("₼")}</span>
                              </strong>
                              <small>{t("/ gün")}</small>
                            </div>
                            {c.deposit != null && <div className="card-deposit"><span>{t("Depozit")}</span><span>{c.deposit} ₼</span></div>}
                          </div>
                          <div className="owner">
                            <span className="owner-icon">
                              {t(
                                c.company ? (
                                  <Building2 size={14} />
                                ) : (
                                  <Users size={13} />
                                ),
                              )}
                            </span>
                            {t(c.owner)}
                          </div>
                        </div>
                      </article>
                    )),
                  )}
                </div>
                {t(
                  !filtered.length && (
                    <div className="empty">
                      {t("Bu seçimə uyğun avtomobil yoxdur.")}
                      <button
                        onClick={() => {
                          setFilters({
                            city: "Bütün şəhərlər",
                            brand: "Bütün markalar",
                            max: "",
                          });
                          setCity("Bütün şəhərlər");
                          setBrand("Bütün markalar");
                          setMax("");
                          setCategory("Hamısı");
                          setModelQuery("");
                          setFavorites(false);
                        }}
                      >
                        {t("Filtrləri təmizlə")}
                      </button>
                    </div>
                  ),
                )}
                <div className="bottom-banner">
                  <div className="banner-icon">
                    <Car size={38} />
                  </div>
                  <div>
                    <span>{t("ŞİRKƏTLƏR VƏ ŞƏXSİ SAHİBLƏR ÜÇÜN")}</span>
                    <h2>{t("Avtomobillərinizi kataloqa əlavə edin.")}</h2>
                    <p>
                      {t(
                        "İlk elanını pulsuz yerləşdir, yeni müştərilər qazan.",
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setModal(
                        user
                          ? user.profile?.complete
                            ? "listing"
                            : "register"
                          : "account",
                      )
                    }
                  >
                    {t("Pulsuz elan yerləşdir")}
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </main>
            </div>
            <section className="how">
              <span className="eyebrow">{t("CƏMİ 3 ADDIM")}</span>
              <h2>{t("Avtomobili necə kirayə götürmək olar?")}</h2>
              <div>
                {t(
                  [
                    [
                      "01",
                      "Avtomobilini seç",
                      "Şəhər, marka və büdcənə görə axtar.",
                    ],
                    [
                      "02",
                      "Sahibi ilə danış",
                      "Şərtləri telefon və ya WhatsApp ilə dəqiqləşdir.",
                    ],
                    [
                      "03",
                      "Yolun dadını çıxar",
                      "Avtomobili təhvil al və səyahətə başla.",
                    ],
                  ].map(([n, title, p]) => (
                    <article key={n}>
                      <span>{t(n)}</span>
                      <h3>{t(title)}</h3>
                      <p>{t(p)}</p>
                    </article>
                  )),
                )}
              </div>
            </section>
          </>
        ),
      )}
      <footer>
        <a className="logo" href="#">
          {t("rentacarr")}
          <span className="logo-az">{t(".az")}</span>
        </a>
        <span>{t("Avtomobil kirayəsi")}</span>
        {t(
          user?.isAdmin && user?.profile?.complete && (
            <button
              onClick={() => {
                setAdmin(true);
                window.scrollTo(0, 0);
              }}
            >
              {t("İdarəetmə paneli")}
              <ArrowUpRight size={14} />
            </button>
          ),
        )}
        <small>
          {t("©")}
          {t(new Date().getFullYear())}
          {t("RENTACARR.AZ")}
        </small>
      </footer>
      {t(
        deleteId !== null && (
          <div className="overlay">
            <section
              className="modal"
              role="alertdialog"
              aria-modal="true"
              aria-label={t("Elanı sil")}
            >
              <h2>{t("Elan silinsin?")}</h2>
              <p>
                {t(cars.find((c) => c.id === deleteId)?.name)}
                {t(
                  "kataloqdan və serverdən silinəcək. Elanı sadəcə gizlətmək üçün dayandırma funksiyasından istifadə edə bilərsiniz.",
                )}
              </p>
              <div className="contact">
                <button className="outline" onClick={() => setDeleteId(null)}>
                  {t("Ləğv et")}
                </button>
                <button
                  className="primary danger"
                  onClick={() => removeListing(deleteId)}
                >
                  {t("Bəli, sil")}
                </button>
              </div>
            </section>
          </div>
        ),
      )}
      {t(
        (selected || modal) && (
          <div
            className="overlay"
            onClick={() => {
              setSelected(null);
              setModal(null);
            }}
          >
            <section
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-label={t(selected?.name || "Məlumat pəncərəsi")}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close"
                aria-label={t("Bağla")}
                onClick={() => {
                  setSelected(null);
                  setModal(null);
                }}
              >
                <X />
              </button>
              {t(
                selected ? (
                  <>
                    <img
                      className="detail-image"
                      src={selected.image}
                      decoding="async"
                      alt={selected.name}
                    />
                    <span className="eyebrow">
                      {t(selected.city)}
                      {t("·")}
                      {t(selected.year)}
                      {t(selected.demo ? "· NÜMUNƏ ELAN" : "ELAN")}
                    </span>
                    <h2>{t(selected.name)}</h2>
                    <p className="detail-price">
                      {t(selected.price)}{" "}
                      {t("₼")}
                      <small>{t("/ gün")}</small>
                    </p>
                    <div className="rental-periods">
                      <span>{t("Həftəlik")}<strong>{selected.weeklyPrice ? `${selected.weeklyPrice} ₼` : t("Razılaşma ilə")}</strong></span>
                      <span>{t("Aylıq")}<strong>{selected.monthlyPrice ? `${selected.monthlyPrice} ₼` : t("Razılaşma ilə")}</strong></span>
                    </div>
                    <div className="detail-specs">
                      <span>
                        <Gauge size={16} />
                        {t(selected.transmission || "Avtomat")}
                      </span>
                      <span>
                        <Fuel size={16} />
                        {t(selected.fuel || "Benzin")}
                      </span>
                      <span>
                        <Users size={16} />
                        {t(selected.seats || 5)}
                        {t("yer")}
                      </span>
                    </div>
                    <button
                      className="detail-save outline"
                      aria-pressed={liked.includes(selected.id)}
                      onClick={() => setLiked(liked.includes(selected.id) ? liked.filter(id => id !== selected.id) : [...liked, selected.id])}
                    >
                      <Heart size={17} fill={liked.includes(selected.id) ? "currentColor" : "none"} />
                      {t(liked.includes(selected.id) ? "Seçilmişlərdən çıxar" : "Seçilmişlərə əlavə et")}
                    </button>
                    <h3>{t("Ətraflı məlumat")}</h3>
                    <p className="detail-owner">
                      <Building2 size={17} />
                      {selected.owner} · {t(selected.city)}
                    </p>
                    <p className="listing-description">
                      {t(
                        selected.description ||
                          "Şərtləri sahibi ilə dəqiqləşdirin.",
                      )}
                    </p>
                    <section className="rental-terms">
                      <h3>{t("Kirayə şərtləri")}</h3>
                      <dl className="rental-facts">
                        <div><dt>{t("Depozit")}</dt><dd>{selected.deposit != null ? `${selected.deposit} ₼` : t("Sahiblə dəqiqləşdirin")}</dd></div>
                        <div><dt>{t("Günlük yürüş limiti")}</dt><dd>{selected.mileage != null ? `${selected.mileage} ${t("km")}` : t("Sahiblə dəqiqləşdirin")}</dd></div>
                        <div><dt>{t("Minimum yaş")}</dt><dd>{selected.minAge != null ? `${selected.minAge} ${t("yaş")}` : t("Sahiblə dəqiqləşdirin")}</dd></div>
                        <div><dt>{t("Sürücülük stajı")}</dt><dd>{selected.experience != null ? `${selected.experience} ${t("il")}` : t("Sahiblə dəqiqləşdirin")}</dd></div>
                      </dl>
                      <p>
                        {t(
                          selected.terms ||
                            "Qiymət gündəlik kirayə üçündür. Təhvil yeri, müddət və ödəniş şərtləri sahibi ilə dəqiqləşdirilir.",
                        )}
                      </p>
                    </section>
                    <h3>{t("Əlaqə")}</h3>
                    {t(
                      selected.phone ? (
                        <div className="contact">
                          <a className="primary contact-call" href={"tel:" + selected.phone}>
                            <Phone size={17} />
                            <span>{t("Zəng et")}<small>{selected.phone}</small></span>
                          </a>
                          <a
                            className="outline"
                            href={
                              "https://wa.me/" +
                              selected.phone.replace(/\D/g, "")
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t("WhatsApp")}
                          </a>
                        </div>
                      ) : (
                        <div className="empty">
                          <Phone size={19} />
                          {t(
                            "Bu nümunə elanda real əlaqə nömrəsi göstərilmir.",
                          )}
                        </div>
                      ),
                    )}
                    {publicCars.some(car => car.ownerId && car.ownerId === selected.ownerId && car.id !== selected.id) && (
                      <section className="related-listings">
                        <h3>{t("Sahibin digər avtomobilləri")}</h3>
                        <div>
                          {publicCars.filter(car => car.ownerId && car.ownerId === selected.ownerId && car.id !== selected.id).slice(0, 3).map(car => (
                            <button key={car.id} onClick={() => { setSelected(car); document.querySelector(".modal")?.scrollTo(0, 0); }}>
                              <img src={car.image} alt="" loading="lazy" />
                              <span>{car.name}<small>{car.price} ₼ {t("/ gün")}</small></span>
                              <ArrowUpRight size={16} />
                            </button>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                ) : modal === "listing" || editing ? (
                  <>
                    <span className="eyebrow">{t("İLK ELANIN PULSUZDUR")}</span>
                    <h2>
                      {t(
                        editing
                          ? "Elanı redaktə et"
                          : admin
                            ? "Sahibin adından elan yerləşdir"
                            : "Avtomobilini paylaş",
                      )}
                    </h2>
                    <p>
                      {t(
                        admin
                          ? "Elan seçdiyiniz sahibin profilinə əlavə ediləcək və dərhal kataloqda görünəcək. Telefon qeydiyyat üçün deyil, əlaqə üçündür."
                          : "Elan yoxlanışdan sonra görünəcək. Onu şəxsi hesabından izləyə və redaktə edə bilərsən.",
                      )}
                    </p>
                    <div className="form-hint">
                      {t(
                        "Hər sahibin elanları öz profilinə bağlanır. Hesaba e-poçt və şifrə ilə daxil olunur.",
                      )}
                    </div>
                    <ListingEditor
                      saving={saving}
                      listing={editing}
                      owners={owners}
                      admin={admin}
                      onSubmit={submit}
                    />
                  </>
                ) : modal?.startsWith("owner:") ? (
                  (() => {
                    const owner = owners.find((o) => o.id === modal.slice(6));
                    return owner ? (
                      <>
                        <span className="eyebrow">{t("SAHİB PROFİLİ")}</span>
                        <h2>{t(owner.name)}</h2>
                        <p>
                          {t(owner.phone)}
                          {t("·")}
                          {t(" ")}
                          {t(
                            owner.kind === "company"
                              ? "Rentakar şirkəti"
                              : "Şəxsi sahib",
                          )}
                        </p>
                        {t(
                          admin && (
                            <p>
                              {t(
                                owner.expectedEmail || "E-poçt qeyd edilməyib",
                              )}
                            </p>
                          ),
                        )}
                        <div className="form-hint">
                          {t(
                            "Hər sahibin elanları öz profilinə bağlanır. Hesaba e-poçt və şifrə ilə daxil olunur.",
                          )}
                        </div>
                        {t(
                          [...cars, ...pending]
                            .filter((c) => c.ownerId === owner.id)
                            .map((c) => (
                              <div className="owner-listing" key={c.id}>
                                <img src={c.image} alt={t("")} />
                                <div>
                                  <b>{t(c.name)}</b>
                                  <p>
                                    {t(c.price)}
                                    {t("₼ / gün ·")}
                                    {t(" ")}
                                    {t(
                                      pending.some((p) => p.id === c.id)
                                        ? "Yoxlanışda"
                                        : c.paused
                                          ? "Dayandırılıb"
                                          : "Aktiv",
                                    )}
                                  </p>
                                </div>
                              </div>
                            )),
                        )}
                      </>
                    ) : null;
                  })()
                ) : (modal === "register" || modal === "account") &&
                  user &&
                  !user.profile?.complete ? (
                  <Registration
                    user={user}
                    onComplete={async (account) => {
                      await onAuthenticated(account);
                      setModal("account");
                    }}
                  />
                ) : modal === "account" ? (
                  <>
                    <span className="eyebrow">
                      {t(user ? "ŞƏXSİ HESAB" : "XOŞ GƏLMİSİNİZ")}
                    </span>
                    <div className="modal-emblem">
                      <UserRound size={25} />
                    </div>
                    <h2>{t(user ? "Hesabım" : "Qeydiyyat və giriş")}</h2>
                    {t(
                      user ? (
                        <>
                          <dl className="account-details">
                            <div><dt><UserRound size={16} />{t("Ad və soyad")}</dt><dd>{user.name}</dd></div>
                            {user.profile?.kind === "company" && <div><dt><Building2 size={16} />{t("Firma adı")}</dt><dd>{user.profile.name}</dd></div>}
                            <div><dt><Mail size={16} />{t("E-poçt")}</dt><dd>{user.email}</dd></div>
                            <div><dt><Phone size={16} />{t("Telefon nömrəsi")}</dt><dd>{user.profile?.phone || user.phone || t("Qeyd edilməyib")}</dd></div>
                            <div><dt><Building2 size={16} />{t("Hesab növü")}</dt><dd>{t(user.profile?.kind === "company" ? "Rentakar şirkəti" : "Şəxsi sahib")}</dd></div>
                          </dl>
                          <div className="account-summary">
                            <button onClick={() => setModal("my-listings")}><Car size={18} /><span>{t("Elanlarım")}</span><strong>{[...cars, ...pending].filter(c => owners.some(o => o.id === c.ownerId && o.accountId === user.id)).length}</strong></button>
                            <button onClick={() => {setFavorites(true);setAdmin(false);setModal(null);setTimeout(() => document.getElementById("cars")?.scrollIntoView(), 0);}}><Heart size={18} /><span>{t("Seçilmişlər")}</span><strong>{liked.length}</strong></button>
                          </div>
                          <div className="account-role">
                            {t(user.isAdmin ? "Admin hesabı" : "Şəxsi hesab")}
                          </div>
                          <div className="account-actions">
                            <button
                              className="primary"
                              onClick={() => setModal("listing")}
                            >
                              <Plus size={16} />
                              {t("Elan yerləşdir")}
                            </button>
                            {t(
                              user.isAdmin && (
                                <button
                                  className="outline"
                                  onClick={() => {
                                    setModal(null);
                                    setAdmin(true);
                                    window.scrollTo(0, 0);
                                  }}
                                >
                                  <LayoutDashboard size={16} />
                                  {t("İdarəetmə paneli")}
                                </button>
                              ),
                            )}
                            <button
                              className="outline"
                              onClick={() =>
                                onLogout().catch((e) => note(e.message))
                              }
                            >
                              {t("Hesabdan çıx")}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>
                            {t(
                              "Ad, e-poçt və telefon məlumatlarını yaz, şifrə seç və hesabını yarat.",
                            )}
                          </p>
                          <EmailAccess onAuthenticated={onAuthenticated} />
                          <GoogleLogin onAuthenticated={onAuthenticated} />
                        </>
                      ),
                    )}
                  </>
                ) : modal === "my-listings" && user ? (
                  <>
                    <span className="eyebrow">{t("ŞƏXSİ HESAB")}</span>
                    <h2>{t("Elanlarım")}</h2>
                    <p>
                      {t("Yalnız sənin hesabına bağlı elanlar göstərilir.")}
                    </p>
                    {t(
                      [...cars, ...pending]
                        .filter((c) =>
                          owners.some(
                            (o) =>
                              o.id === c.ownerId && o.accountId === user.id,
                          ),
                        )
                        .map((c) => (
                          <article className="my-listing" key={c.id}>
                            <img src={c.image} alt={c.name} />
                            <div>
                              <h3>{t(c.name)}</h3>
                              <p>
                                {t(c.price)}
                                {t("₼ / gün ·")}
                                {t(" ")}
                                {t(
                                  c.status === "pending"
                                    ? "Yoxlanışda"
                                    : c.paused
                                      ? "Dayandırılıb"
                                      : "Aktiv",
                                )}
                              </p>
                              <button
                                className="outline"
                                onClick={() => setModal("edit:" + c.id)}
                              >
                                <Pencil size={14} />
                                {t("Redaktə et")}
                              </button>
                            </div>
                          </article>
                        )),
                    )}
                    {t(
                      ![...cars, ...pending].some((c) =>
                        owners.some(
                          (o) => o.id === c.ownerId && o.accountId === user.id,
                        ),
                      ) && (
                        <div className="empty">
                          <Car size={24} />
                          {t("Hələ hesabına bağlı elan yoxdur.")}
                        </div>
                      ),
                    )}
                    <button
                      className="primary"
                      onClick={() => setModal("listing")}
                    >
                      <Plus size={16} />
                      {t("Elan yerləşdir")}
                    </button>
                  </>
                ) : modal === "partners" ? (
                  <>
                    <span className="eyebrow">{t("BİRLİKDƏ BÖYÜYƏK")}</span>
                    <div className="modal-emblem">
                      <Building2 size={25} />
                    </div>
                    <h2>{t("Avtoparkını daha çox insan görsün.")}</h2>
                    <p>
                      {t(
                        "Rentakar şirkətləri və şəxsi sahiblər üçün ilk aktiv elan pulsuzdur. 3 və 10 avtomobillik paketlər, VIP yerləşdirmə və şirkət profilləri nəzərdə tutulur.",
                      )}
                    </p>
                    <button
                      className="primary"
                      onClick={() =>
                        setModal(
                          user
                            ? user.profile?.complete
                              ? "listing"
                              : "register"
                            : "account",
                        )
                      }
                    >
                      <Plus size={17} />
                      {t("İlk elanını yerləşdir")}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="eyebrow">{t("NECƏ İŞLƏYİR?")}</span>
                    <h2>{t("Seç. Əlaqə saxla. Yola çıx.")}</h2>
                    <p>
                      {t(
                        "Avtomobili filtrlərlə tap, elanın şərtlərini oxu və sahibi ilə birbaşa əlaqə saxla. Qiyməti, depoziti, sığortanı və təhvil şərtlərini ödənişdən əvvəl sahibi ilə dəqiqləşdir.",
                      )}
                    </p>
                    <p>
                      {t(
                        "Avtomobil yerləşdirmək üçün elan formasını doldur. Təsdiqlənən elanlar kataloqda görünür.",
                      )}
                    </p>
                  </>
                ),
              )}
            </section>
          </div>
        ),
      )}
      {t(
        toast && (
          <div className="toast" role="status" aria-live="polite">
            <Check size={18} />
            {t(toast)}
          </div>
        ),
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <SessionBoundary>
    {t((props) => (
      <App key={props.user?.id || "public"} {...props} />
    ))}
  </SessionBoundary>,
);
