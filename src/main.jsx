import React, { useState, useEffect } from "react";
import { SessionBoundary, GoogleLogin, request } from "./session";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Search,
  MapPin,
  ChevronDown,
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
} from "lucide-react";
import "./style.css";
import "@fontsource-variable/inter";
import ListingEditor from "./ListingEditor";
import { initial, brands, categories, cities, promotionRank } from "./catalog";
function App({ user, onAuthenticated, onLogout, authError }) {
  const [adminView, setAdminView] = useState("overview");
  const workspace = { cars: [], pending: [], owners: [] };
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
    [liked, setLiked] = useState([]),
    [favorites, setFavorites] = useState(false),
    [selected, setSelected] = useState(null),
    [modal, setModal] = useState(null),
    [adminMode, setAdmin] = useState(false),
    [pending, setPending] = useState(workspace.pending),
    [sort, setSort] = useState("Seçilmiş elanlar"),
    [toast, setToast] = useState(""),
    [modelQuery, setModelQuery] = useState(""),
    [adminSearch, setAdminSearch] = useState(""),
    [adminStatus, setAdminStatus] = useState("all"),
    [deleteId, setDeleteId] = useState(null);
  const admin = Boolean(user?.isAdmin && adminMode);
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
        body: { id, ...patch },
      });
      await refreshWorkspace();
      note("Dəyişiklik saxlanıldı.");
    } catch (e) {
      note(e.message);
    }
  }
  async function removeListing(id) {
    try {
      await request("/api/listings", { method: "DELETE", body: { id } });
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
      note("Elan yerləşdirmək üçün Google ilə daxil olun.");
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
            body: { ...details, id: details.ownerId },
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
      } else await request("/api/listings", { method: "POST", body: details });
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
        [JSON.stringify({ version: 1, cars, pending, owners }, null, 2)],
        { type: "application/json" },
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
          <span className="logo-mark">
            <Car size={23} />
          </span>
          rentacarr<span className="logo-az">.az</span>
        </a>
        <nav>
          <a href="#cars" onClick={() => setAdmin(false)}>
            Avtomobillər
          </a>
          <button onClick={() => setModal("partners")}>Partnyorlar</button>
          <button onClick={() => setModal("how")}>Necə işləyir?</button>
          <button
            aria-label="Seçilmiş elanlar"
            onClick={() => {
              setFavorites(!favorites);
              document
                .getElementById("cars")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Heart size={16} fill={favorites ? "currentColor" : "none"} />
          </button>
        </nav>
        <div className="header-right">
          <button
            className="language"
            onClick={() => note("Hazırda Azərbaycan dili mövcuddur.")}
          >
            AZ <ChevronDown size={13} />
          </button>
          <button
            className="heart-top"
            aria-label="Seçilmiş elanlar"
            onClick={() => {
              setFavorites(!favorites);
              setAdmin(false);
              document.getElementById("cars")?.scrollIntoView();
            }}
          >
            <Heart size={20} fill={favorites ? "#155e46" : "none"} />
          </button>
          <button
            className="login"
            aria-label={user ? "Hesabım" : "Daxil ol"}
            onClick={() => setModal("account")}
          >
            <UserRound size={17} />
            <span>{user ? "Hesabım" : "Daxil ol"}</span>
          </button>
          <button
            className="primary add"
            onClick={() => setModal(user ? "listing" : "account")}
          >
            <Plus size={17} /> Elan yerləşdir
          </button>
        </div>
      </header>
      {!admin && (
        <nav className="mobile-nav" aria-label="Əsas menyu">
          <a href="#cars">Avtomobillər</a>
          <button onClick={() => setModal("partners")}>Partnyorlar</button>
          <button onClick={() => setModal("how")}>Necə işləyir?</button>
          <button
            aria-label="Seçilmiş elanlar"
            onClick={() => {
              setFavorites(!favorites);
              document
                .getElementById("cars")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Heart size={16} fill={favorites ? "currentColor" : "none"} />
          </button>
        </nav>
      )}
      {(authError || serviceError) && (
        <div className="service-notice" role="status">
          {authError || serviceError}
        </div>
      )}
      {admin ? (
        <main className="admin" data-view={adminView}>
          <div className="section-title">
            <div>
              <span className="eyebrow">İDARƏETMƏ PANELİ</span>
              <h1>Hər şey nəzarətində.</h1>
              <p>
                Elanları, sahibləri və yoxlanışları idarə et. Giriş yalnız
                təsdiqlənmiş admin hesabına açıqdır.
              </p>
            </div>
            <button className="outline" onClick={() => setAdmin(false)}>
              <ArrowLeft size={16} /> Sayta qayıt
            </button>
          </div>
          <nav className="admin-nav" aria-label="İdarəetmə bölmələri">
            {[
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
                {label}
                {key === "review" && pending.length > 0 && (
                  <span>{pending.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="stats">
            {[
              ["Aktiv elanlar", cars.filter((c) => !c.paused).length],
              ["Yoxlanış gözləyən", pending.length],
              [
                "Premium elanlar",
                cars.filter((c) => c.promotion === "premium").length,
              ],
              ["VIP elanlar", cars.filter((c) => c.promotion === "vip").length],
            ].map(([label, n]) => (
              <article key={label}>
                <div className="stat-icon">
                  {label.includes("Premium") ? (
                    <Crown size={19} />
                  ) : label.includes("VIP") ? (
                    <Sparkles size={19} />
                  ) : label.includes("gözləyən") ? (
                    <Clock3 size={19} />
                  ) : (
                    <Car size={19} />
                  )}
                </div>
                <span>{label}</span>
                <strong>{n}</strong>
              </article>
            ))}
          </div>
          <div className="admin-actions">
            <button
              className="primary"
              onClick={() => setModal(user ? "listing" : "account")}
            >
              <Plus size={17} /> Sahibin adından elan yerləşdir
            </button>
            <button className="outline" onClick={() => setAdmin(false)}>
              Nümunə kataloquna bax
            </button>
            <button className="outline" onClick={exportWorkspace}>
              <Download size={16} /> Ehtiyat nüsxəni endir
            </button>
          </div>
          <section className="admin-overview">
            <div className="overview-heading">
              <span className="eyebrow">İŞ MƏKANI</span>
              <h2>Avtoparkına ümumi baxış</h2>
              <p>Elanları, sahibləri və yoxlanışları bir yerdən idarə et.</p>
            </div>
            <div className="overview-grid">
              <button onClick={() => setAdminView("listings")}>
                <Car size={23} />
                <h3>Elanları idarə et</h3>
                <p>Qiymət, təqdimat və aktivlik statusu.</p>
                <ArrowUpRight size={18} />
              </button>
              <button onClick={() => setAdminView("owners")}>
                <Building2 size={23} />
                <h3>Sahib profilləri</h3>
                <p>{owners.length} profil və onlara aid avtomobillər.</p>
                <ArrowUpRight size={18} />
              </button>
              <button onClick={() => setAdminView("review")}>
                <ClipboardList size={23} />
                <h3>Yoxlanış gözləyənlər</h3>
                <p>{pending.length} elan qərarını gözləyir.</p>
                <ArrowUpRight size={18} />
              </button>
            </div>
            <div className="workspace-notice">
              <ShieldCheck size={19} />
              <div>
                <h3>Qorunan admin iş məkanı</h3>
                <p>
                  Məlumatlar serverdə saxlanır. Sahib profilləri və şəxsi
                  e-poçtlar yalnız icazəli hesablara göstərilir.
                </p>
              </div>
            </div>
          </section>
          <section className="owner-management">
            <span className="eyebrow">HESABDAN ƏVVƏL DƏ SAHİB PROFİLİ</span>
            <h2>Avtomobil sahibləri</h2>
            <p>
              Telefon yalnız əlaqə üçündür. Yeni elan üçün mövcud sahibi seçin
              və ya yeni profil yaradın. Sahib Google ilə təsdiqlənmiş giriş
              etdikdə adminin qeyd etdiyi uyğun e-poçt onun profilinə bağlanır.
              Telefon giriş üsulu deyil.
            </p>
            <input
              className="owner-search"
              aria-label="Sahib axtar"
              placeholder="Ad, telefon və ya e-poçt ilə axtar…"
              value={ownerQuery}
              onChange={(e) => setOwnerQuery(e.target.value)}
            />
            {owners.length === 0 ? (
              <div className="empty">
                Hələ sahib profili yoxdur. Sahibin adından ilk elanı
                yerləşdirin.
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
                      <b>{o.name}</b>
                      <p>
                        {o.kind === "company"
                          ? "Rentakar şirkəti"
                          : "Şəxsi sahib"}{" "}
                        · {o.phone}
                      </p>
                      <p>
                        {o.expectedEmail ||
                          "Google hesabı üçün e-poçt əlavə edilməyib"}
                      </p>
                    </div>
                    <div>
                      <strong>
                        {
                          cars.filter((c) => c.ownerId === o.id && !c.paused)
                            .length
                        }
                      </strong>
                      <small> aktiv elan</small>
                      <p>
                        {pending.filter((c) => c.ownerId === o.id).length}{" "}
                        yoxlanışda
                      </p>
                    </div>
                    <span className="claim-status">
                      {o.accountId ? "Hesaba bağlanıb" : "Giriş gözlənilir"}
                    </span>
                    <button
                      className="outline"
                      onClick={() => {
                        setSelected(null);
                        setModal("owner:" + o.id);
                      }}
                    >
                      Elanlarına bax
                    </button>
                  </article>
                ))
            )}
          </section>
          <section className="admin-review">
            <h2>Yoxlanış gözləyən elanlar</h2>
            {!pending.length ? (
              <div className="empty">
                Yeni elan yoxdur. “Elan yerləşdir” vasitəsilə nümunə elan
                göndərə bilərsiniz.
              </div>
            ) : (
              pending.map((c) => (
                <div className="admin-row" key={c.id}>
                  <div>
                    <b>{c.name}</b>
                    <p>
                      {c.owner} · {c.city} · {c.price} ₼ / gün
                    </p>
                  </div>
                  <button
                    className="primary"
                    onClick={() => mutateListing(c.id, { status: "active" })}
                  >
                    Təsdiqlə
                  </button>
                  <button
                    className="outline"
                    onClick={() => removeListing(c.id)}
                  >
                    Rədd et
                  </button>
                </div>
              ))
            )}
          </section>
          <section className="admin-listings">
            <h2>Elanların idarə edilməsi</h2>
            <div className="admin-filters">
              <input
                aria-label="Elan axtar"
                placeholder="Avtomobil və ya sahib axtar…"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
              <select
                aria-label="Elan statusu"
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value)}
              >
                <option value="all">Bütün elanlar</option>
                <option value="active">Aktiv</option>
                <option value="paused">Dayandırılmış</option>
                <option value="vip">VIP</option>
                <option value="premium">Premium</option>
              </select>
              <span>{adminCars.length} elan</span>
            </div>
            {adminCars.map((c) => (
              <div className="admin-row" key={c.id}>
                <img className="admin-thumb" src={c.image} alt="" />
                <div>
                  <b>{c.name}</b>
                  <p>
                    {c.owner} · {c.city}
                  </p>
                  <span className={"status-pill " + (c.paused ? "paused" : "")}>
                    {c.paused ? "Dayandırılıb" : "Aktiv"}
                  </span>
                  {c.demo && <span className="sample-pill">Nümunə</span>}
                </div>
                <span>{c.price} ₼ / gün</span>
                <select
                  aria-label={`${c.name} təqdimat`}
                  value={c.promotion || (c.vip ? "vip" : "standard")}
                  onChange={(e) =>
                    mutateListing(c.id, { promotion: e.target.value })
                  }
                >
                  <option value="standard">Standart</option>
                  <option value="vip">VIP</option>
                  <option value="premium">Premium</option>
                </select>
                <button
                  className="outline"
                  onClick={() => setModal("edit:" + c.id)}
                >
                  <Pencil size={15} /> Redaktə et
                </button>
                <button
                  className="outline"
                  onClick={() =>
                    mutateListing(c.id, {
                      status: c.paused ? "active" : "paused",
                    })
                  }
                >
                  {c.paused ? <Play size={15} /> : <Pause size={15} />}{" "}
                  {c.paused ? "Aktivləşdir" : "Dayandır"}
                </button>
                <button
                  className="outline danger"
                  onClick={() => setDeleteId(c.id)}
                >
                  <Trash2 size={15} /> Sil
                </button>
              </div>
            ))}
            {!adminCars.length && (
              <div className="empty">Bu seçimə uyğun elan yoxdur.</div>
            )}
          </section>
          <section className="admin-guide">
            <h2>Admin üçün qısa bələdçi</h2>
            <p>
              <b>Elanlar:</b> Sahib seçin, avtomobili və şərtləri doldurun.
              Adminin elanı dərhal görünür; ziyarətçinin elanı yoxlanışa düşür.
            </p>
            <p>
              <b>VIP və Premium:</b> Ödəniş etmədən statusu paneldən dəyişə
              bilərsiniz. Premium əvvəl, VIP sonra, standart elanlar isə onların
              ardınca göstərilir.
            </p>
            <p>
              <b>Dayandırma:</b> Avtomobil kirayədədirsə, elanı silmədən
              kataloqdan gizlədin.
            </p>
            <p>
              <b>Sahiblər:</b> Eyni sahibin yeni avtomobili üçün mövcud profili
              seçin. Sahibin təsdiqlənmiş Google hesabı profilə bağlanır.
            </p>
            <p>
              <b>Məlumatlar:</b> Dəyişikliklər serverdə saxlanır. Şəxsi
              məlumatlar yalnız icazəli hesablara açıqdır. Ödəniş sistemi hələ
              aktiv deyil.
            </p>
          </section>
        </main>
      ) : (
        <>
          <section className="hero">
            <div className="hero-content">
              <div className="hero-tag">
                <span /> AZƏRBAYCANIN AVTOMOBİL KİRAYƏSİ PLATFORMASI
              </div>
              <h1>
                Yol səninlə
                <br />
                başlayır<span>.</span>
              </h1>
              <p>
                Şəhər içi işlərdən unudulmaz səyahətlərə.
                <br />
                Sənə uyğun avtomobili bir yerdə tap.
              </p>
              <a className="hero-link" href="#cars">
                Avtomobillərə bax <ArrowUpRight size={18} />
              </a>
              <div className="hero-proof">
                <ShieldCheck size={19} />
                <span>
                  Şirkətlərdən və şəxsi sahiblərdən
                  <br />
                  <b>Birbaşa əlaqə. Rahat seçim.</b>
                </span>
              </div>
            </div>
            <div className="hero-visual">
              <img
                src="/photos/porsche-road.jpg"
                alt="Yolda hərəkət edən Porsche Panamera"
                fetchPriority="high"
              />
              <div className="hero-caption">
                <span>
                  <span className="live-dot" /> YENİ YOLLAR, YENİ TƏƏSSÜRATLAR
                </span>
                <b>Səfərin ritmini özün seç.</b>
                <ArrowUpRight size={22} />
              </div>
              <div className="photo-label">
                <Camera size={13} /> Real avtomobil fotosu
              </div>
            </div>
          </section>
          <div className="search-wrap">
            <form
              className="search-box"
              onSubmit={(e) => {
                e.preventDefault();
                setFilters({ city, brand, max });
                document
                  .getElementById("cars")
                  .scrollIntoView({ behavior: "smooth" });
              }}
            >
              <label>
                <span>
                  <MapPin size={15} /> Şəhər
                </span>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  {["Bütün şəhərlər", ...cities].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>
                  <Car size={15} /> Marka
                </span>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  {["Bütün markalar", ...brands].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Günlük büdcə</span>
                <div className="budget">
                  <input
                    type="number"
                    min="1"
                    placeholder="Maksimum qiymət"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                  />
                  <b>₼</b>
                </div>
              </label>
              <button className="primary search-submit">
                <Search size={18} /> Avtomobil tap
              </button>
            </form>
          </div>
          <section className="benefits">
            <div>
              <ShieldCheck />
              <span>
                Yoxlanılmış elanlar<small>Daha rahat seçim üçün</small>
              </span>
            </div>
            <div>
              <Car />
              <span>
                Hər zövqə uyğun seçim<small>Ekonomdan premiuma</small>
              </span>
            </div>
            <div>
              <Phone />
              <span>
                Sahiblə birbaşa əlaqə<small>Vasitəçisiz, əlavə xərcsiz</small>
              </span>
            </div>
            <div>
              <Plus />
              <span>
                İlk elanın pulsuzdur<small>Avtomobilindən gəlir qazan</small>
              </span>
            </div>
          </section>
          <main id="cars">
            <div className="section-title">
              <div>
                <span className="eyebrow">SEÇİM SƏNİNDİR</span>
                <h2>
                  {favorites
                    ? "Bəyəndiyin avtomobillər"
                    : "Növbəti yol yoldaşını tap"}
                </h2>
                <p>Planına və büdcənə uyğun avtomobilləri kəşf et.</p>
              </div>
              <span className="listing-count">
                {filtered.length} avtomobil mövcuddur
              </span>
            </div>
            <div className="filter-bar">
              <div className="tabs">
                {["Hamısı", ...categories].map((x) => (
                  <button
                    key={x}
                    className={category === x ? "active" : ""}
                    onClick={() => setCategory(x)}
                  >
                    {x === "Hamısı" && <Car size={16} />} {x}
                  </button>
                ))}
              </div>
              <select
                aria-label="Elan sıralaması"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {["Seçilmiş elanlar", "Əvvəlcə ucuz", "Əvvəlcə bahalı"].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </div>
            <label className="model-search">
              Model axtar
              <input
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
                placeholder="Məsələn: RAV4, Panamera, GLS…"
              />
            </label>
            <div className="demo-note">
              Təqdimat kataloqu · Real fotolar, nümunə qiymətlər
            </div>
            <div className="grid">
              {filtered.map((c) => (
                <article className="car-card" key={c.id}>
                  <div className="car-image">
                    <button
                      className="image-open"
                      aria-label={c.name + " elanı aç"}
                      onClick={() => setSelected(c)}
                    >
                      <img
                        src={c.image}
                        alt={c.name}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                    <div className="badges">
                      {c.promotion === "premium" ? (
                        <span className="premium">
                          <Crown size={12} /> Premium
                        </span>
                      ) : (
                        c.vip && (
                          <span className="vip">
                            <Sparkles size={12} /> VIP
                          </span>
                        )
                      )}
                      <span className="kind">
                        {c.company ? "Şirkət" : "Şəxsi sahib"}
                      </span>
                    </div>
                    <button
                      aria-label="Elanı bəyən"
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
                        fill={liked.includes(c.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="card-location">
                      <MapPin size={12} />
                      {c.city}
                      <span>{c.year}</span>
                    </div>
                    <button className="car-name" onClick={() => setSelected(c)}>
                      {c.name}
                    </button>
                    <div className="specs">
                      <span>
                        <Gauge size={14} /> {c.transmission || "Avtomat"}
                      </span>
                      <span>
                        <Fuel size={14} /> {c.fuel || "Benzin"}
                      </span>
                      <span>
                        <Users size={14} /> {c.seats || 5} yer
                      </span>
                    </div>
                    <div className="card-bottom">
                      <div>
                        <strong>
                          {c.price} <span>₼</span>
                        </strong>
                        <small> / gün</small>
                      </div>
                      <button
                        aria-label="Elana bax"
                        onClick={() => setSelected(c)}
                      >
                        <ArrowUpRight size={19} />
                      </button>
                    </div>
                    <div className="owner">
                      <span className="owner-icon">
                        {c.company ? <Car size={13} /> : <Users size={13} />}
                      </span>
                      {c.owner}
                      {c.company && <ShieldCheck size={13} color="#267357" />}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!filtered.length && (
              <div className="empty">
                Bu seçimə uyğun avtomobil yoxdur.
                <button
                  onClick={() => {
                    setFilters({
                      city: "Bütün şəhərlər",
                      brand: "Bütün markalar",
                      max: "",
                    });
                    setCategory("Hamısı");
                    setModelQuery("");
                    setFavorites(false);
                  }}
                >
                  Filtrləri təmizlə
                </button>
              </div>
            )}
            <div className="bottom-banner">
              <div className="banner-icon">
                <Car size={38} />
              </div>
              <div>
                <span>SƏNİN AVTOMOBİLİN, SƏNİN QAZANCIN</span>
                <h2>Avtomobilin boş dayanmasın.</h2>
                <p>İlk elanını pulsuz yerləşdir, yeni müştərilər qazan.</p>
              </div>
              <button onClick={() => setModal(user ? "listing" : "account")}>
                Pulsuz elan yerləşdir <ArrowUpRight size={18} />
              </button>
            </div>
          </main>
          <section className="how">
            <span className="eyebrow">CƏMİ 3 ADDIM</span>
            <h2>Yola çıxmaq bu qədər asandır.</h2>
            <div>
              {[
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
              ].map(([n, t, p]) => (
                <article key={n}>
                  <span>{n}</span>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
      <footer>
        <a className="logo" href="#">
          <span className="logo-mark">
            <Car size={22} />
          </span>
          rentacarr<span className="logo-az">.az</span>
        </a>
        <span>Yol səninlə başlayır.</span>
        {user?.isAdmin && (
          <button
            onClick={() => {
              setAdmin(true);
              window.scrollTo(0, 0);
            }}
          >
            İdarəetmə paneli <ArrowUpRight size={14} />
          </button>
        )}
        <small>© {new Date().getFullYear()} RENTACARR.AZ</small>
      </footer>
      {deleteId !== null && (
        <div className="overlay">
          <section
            className="modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Elanı sil"
          >
            <h2>Elan silinsin?</h2>
            <p>
              {cars.find((c) => c.id === deleteId)?.name} kataloqdan və
              serverdən silinəcək. Elanı sadəcə gizlətmək üçün dayandırma
              funksiyasından istifadə edə bilərsiniz.
            </p>
            <div className="contact">
              <button className="outline" onClick={() => setDeleteId(null)}>
                Ləğv et
              </button>
              <button
                className="primary danger"
                onClick={() => removeListing(deleteId)}
              >
                Bəli, sil
              </button>
            </div>
          </section>
        </div>
      )}
      {(selected || modal) && (
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
            aria-label={selected?.name || "Məlumat pəncərəsi"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Bağla"
              onClick={() => {
                setSelected(null);
                setModal(null);
              }}
            >
              <X />
            </button>
            {selected ? (
              <>
                <img
                  className="detail-image"
                  src={selected.image}
                  decoding="async"
                  alt={selected.name}
                />
                <span className="eyebrow">
                  {selected.city} · {selected.year} · NÜMUNƏ ELAN
                </span>
                <h2>{selected.name}</h2>
                <p className="detail-price">
                  {selected.price} ₼ <small>/ gün</small>
                </p>
                <div className="detail-specs">
                  <span>
                    <Gauge size={16} />
                    {selected.transmission || "Avtomat"}
                  </span>
                  <span>
                    <Fuel size={16} />
                    {selected.fuel || "Benzin"}
                  </span>
                  <span>
                    <Users size={16} />
                    {selected.seats || 5} yer
                  </span>
                </div>
                <h3 className="detail-subtitle">Kirayə şərtləri</h3>
                <div className="detail-terms">
                  <p>
                    Depozit <b>{selected.deposit ?? 300} ₼</b>
                  </p>
                  <p>
                    Yürüş limiti <b>{selected.mileage ?? 250} km / gün</b>
                  </p>
                  <p>
                    Minimum yaş <b>{selected.minAge ?? 23} yaş</b>
                  </p>
                  <p>
                    Sürücülük təcrübəsi <b>{selected.experience ?? 2} il</b>
                  </p>
                </div>
                <p className="listing-description">
                  {selected.description || "Şərtləri sahibi ilə dəqiqləşdirin."}
                </p>
                {selected.phone ? (
                  <div className="contact">
                    <a className="primary" href={"tel:" + selected.phone}>
                      Zəng et
                    </a>
                    <a
                      className="outline"
                      href={
                        "https://wa.me/" + selected.phone.replace(/\D/g, "")
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="empty">
                    <Phone size={19} /> Nümunə elanda əlaqə nömrəsi yoxdur.
                  </div>
                )}
              </>
            ) : modal === "listing" || editing ? (
              <>
                <span className="eyebrow">İLK ELANIN PULSUZDUR</span>
                <h2>
                  {editing
                    ? "Elanı redaktə et"
                    : admin
                      ? "Sahibin adından elan yerləşdir"
                      : "Avtomobilini paylaş"}
                </h2>
                <p>
                  {admin
                    ? "Elan seçdiyiniz sahibin profilinə əlavə ediləcək və dərhal kataloqda görünəcək. Telefon qeydiyyat üçün deyil, əlaqə üçündür."
                    : "Elan yoxlanışdan sonra görünəcək. Onu şəxsi hesabından izləyə və redaktə edə bilərsən."}
                </p>
                <div className="form-hint">
                  Telefon yalnız əlaqə üçündür. Adminin daxil etdiyi sahib
                  e-poçtu təsdiqlənmiş Google hesabına uyğun gələndə elanlar
                  həmin hesabda görünür.
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
                    <span className="eyebrow">SAHİB PROFİLİ</span>
                    <h2>{owner.name}</h2>
                    <p>
                      {owner.phone} ·{" "}
                      {owner.kind === "company"
                        ? "Rentakar şirkəti"
                        : "Şəxsi sahib"}
                    </p>
                    {admin && (
                      <p>{owner.expectedEmail || "E-poçt qeyd edilməyib"}</p>
                    )}
                    <div className="form-hint">
                      Bu profilə aid elanlar aşağıdadır. Hesab Google tərəfindən
                      təsdiqlənir. Telefon yalnız əlaqə üçündür.
                    </div>
                    {[...cars, ...pending]
                      .filter((c) => c.ownerId === owner.id)
                      .map((c) => (
                        <div className="owner-listing" key={c.id}>
                          <img src={c.image} alt="" />
                          <div>
                            <b>{c.name}</b>
                            <p>
                              {c.price} ₼ / gün ·{" "}
                              {pending.some((p) => p.id === c.id)
                                ? "Yoxlanışda"
                                : c.paused
                                  ? "Dayandırılıb"
                                  : "Aktiv"}
                            </p>
                          </div>
                        </div>
                      ))}
                  </>
                ) : null;
              })()
            ) : modal === "account" ? (
              <>
                <span className="eyebrow">
                  {user ? "ŞƏXSİ HESAB" : "XOŞ GƏLMİSİNİZ"}
                </span>
                <div className="modal-emblem">
                  <UserRound size={25} />
                </div>
                <h2>{user ? user.name : "Sənin avtomobil məkanın."}</h2>
                {user ? (
                  <>
                    <p>{user.email}</p>
                    <div className="account-role">
                      {user.isAdmin ? "Admin hesabı" : "Şəxsi hesab"}
                    </div>
                    <div className="account-actions">
                      <button
                        className="outline"
                        onClick={() => setModal("my-listings")}
                      >
                        <Car size={16} /> Elanlarım
                      </button>
                      <button
                        className="primary"
                        onClick={() => setModal("listing")}
                      >
                        <Plus size={16} /> Elan yerləşdir
                      </button>
                      {user.isAdmin && (
                        <button
                          className="outline"
                          onClick={() => {
                            setModal(null);
                            setAdmin(true);
                            window.scrollTo(0, 0);
                          }}
                        >
                          <LayoutDashboard size={16} /> İdarəetmə paneli
                        </button>
                      )}
                      <button
                        className="outline"
                        onClick={() => onLogout().catch((e) => note(e.message))}
                      >
                        Hesabdan çıx
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      Google hesabınla təhlükəsiz daxil ol. Şəxsi hesabında
                      yalnız sənə aid məlumatlar və elanlar görünür.
                    </p>
                    <GoogleLogin onAuthenticated={onAuthenticated} />
                  </>
                )}
              </>
            ) : modal === "my-listings" && user ? (
              <>
                <span className="eyebrow">ŞƏXSİ HESAB</span>
                <h2>Elanlarım</h2>
                <p>Yalnız sənin hesabına bağlı elanlar göstərilir.</p>
                {[...cars, ...pending]
                  .filter((c) =>
                    owners.some(
                      (o) => o.id === c.ownerId && o.accountId === user.id,
                    ),
                  )
                  .map((c) => (
                    <article className="my-listing" key={c.id}>
                      <img src={c.image} alt={c.name} />
                      <div>
                        <h3>{c.name}</h3>
                        <p>
                          {c.price} ₼ / gün ·{" "}
                          {c.status === "pending"
                            ? "Yoxlanışda"
                            : c.paused
                              ? "Dayandırılıb"
                              : "Aktiv"}
                        </p>
                        <button
                          className="outline"
                          onClick={() => setModal("edit:" + c.id)}
                        >
                          <Pencil size={14} /> Redaktə et
                        </button>
                      </div>
                    </article>
                  ))}
                {![...cars, ...pending].some((c) =>
                  owners.some(
                    (o) => o.id === c.ownerId && o.accountId === user.id,
                  ),
                ) && (
                  <div className="empty">
                    <Car size={24} /> Hələ hesabına bağlı elan yoxdur.
                  </div>
                )}
                <button className="primary" onClick={() => setModal("listing")}>
                  <Plus size={16} /> Elan yerləşdir
                </button>
              </>
            ) : modal === "partners" ? (
              <>
                <span className="eyebrow">BİRLİKDƏ BÖYÜYƏK</span>
                <div className="modal-emblem">
                  <Building2 size={25} />
                </div>
                <h2>Avtoparkını daha çox insan görsün.</h2>
                <p>
                  Rentakar şirkətləri və şəxsi sahiblər üçün ilk aktiv elan
                  pulsuzdur. 3 və 10 avtomobillik paketlər, VIP yerləşdirmə və
                  şirkət profilləri nəzərdə tutulur.
                </p>
                <button
                  className="primary"
                  onClick={() => setModal(user ? "listing" : "account")}
                >
                  <Plus size={17} /> İlk elanını yerləşdir
                </button>
              </>
            ) : (
              <>
                <span className="eyebrow">NECƏ İŞLƏYİR?</span>
                <h2>Seç. Əlaqə saxla. Yola çıx.</h2>
                <p>
                  Avtomobili filtrlərlə tap, elanın şərtlərini oxu və sahibi ilə
                  birbaşa əlaqə saxla. Qiyməti, depoziti, sığortanı və təhvil
                  şərtlərini ödənişdən əvvəl sahibi ilə dəqiqləşdir.
                </p>
                <p>
                  Avtomobil yerləşdirmək üçün elan formasını doldur. Təsdiqlənən
                  elanlar kataloqda görünür.
                </p>
              </>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Check size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <SessionBoundary>
    {(props) => <App key={props.user?.id || "public"} {...props} />}
  </SessionBoundary>,
);
