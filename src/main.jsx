import React, { useState, useEffect } from "react";
import { prepareListing, loadWorkspace } from "./ownership";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  MapPin,
  ChevronDown,
  Heart,
  SlidersHorizontal,
  ShieldCheck,
  Fuel,
  Users,
  Gauge,
  X,
  Check,
  Plus,
  Car,
  Menu,
  Phone,
} from "lucide-react";
import "./style.css";
import "./responsive.css";
import ListingEditor from "./ListingEditor";
import {
  initial,
  demoOwners,
  brands,
  categories,
  cities,
  promotionRank,
  upgradeDemoWorkspace,
  upgradeDemoPhotos,
} from "./catalog";
function App() {
  const [workspace] = useState(() =>
    upgradeDemoPhotos(
      upgradeDemoWorkspace(loadWorkspace(initial, localStorage, demoOwners)),
    ),
  );
  const [owners, setOwners] = useState(workspace.owners),
    [ownerQuery, setOwnerQuery] = useState(""),
    [storageError, setStorageError] = useState(false);
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
    [admin, setAdmin] = useState(false),
    [pending, setPending] = useState(workspace.pending),
    [sort, setSort] = useState("Seçilmiş elanlar"),
    [toast, setToast] = useState(""),
    [modelQuery, setModelQuery] = useState(""),
    [adminSearch, setAdminSearch] = useState(""),
    [adminStatus, setAdminStatus] = useState("all"),
    [deleteId, setDeleteId] = useState(null);
  const editing = modal?.startsWith("edit:")
    ? cars.find((c) => String(c.id) === modal.slice(5))
    : null;
  useEffect(() => {
    try {
      localStorage.setItem(
        "rentacarr.workspace.v1",
        JSON.stringify({
          version: 1,
          catalogVersion: 2,
          cars,
          pending,
          owners,
        }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [cars, pending, owners]);
  function note(t) {
    setToast(t);
    setTimeout(() => setToast(""), 4000);
  }
  const filtered = cars
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
  function submit(e) {
    e.preventDefault();
    const d = new FormData(e.target);
    try {
      const ownerId = d.get("ownerId");
      const existingOwner = owners.find((o) => o.id === ownerId);
      const details = {
        brand: d.get("brand"),
        model: d.get("model").trim(),
        name: `${d.get("brand")} ${d.get("model").trim()}`,
        price: Number(d.get("price")),
        city: d.get("city"),
        year: Number(d.get("year")),
        owner: d.get("owner"),
        ownerKind: d.get("ownerKind"),
        ownerId,
        ownerEmail: d.get("ownerEmail"),
        phone: d.get("phone"),
        type: d.get("type"),
        image: d.get("image") || editing?.image || "/photos/car-6.jpg",
        fuel: d.get("fuel"),
        transmission: d.get("transmission"),
        seats: Number(d.get("seats")),
        deposit: Number(d.get("deposit")),
        mileage: Number(d.get("mileage")),
        minAge: Number(d.get("minAge")),
        experience: Number(d.get("experience")),
        description: d.get("description").trim(),
        promotion: admin ? d.get("promotion") : "standard",
      };
      if (d.get("image") && !/^https:\/\//i.test(d.get("image")))
        throw new Error("Şəkil ünvanı HTTPS ilə başlamalıdır.");
      details.vip = details.promotion !== "standard";
      let owner, listing;
      if (existingOwner?.demo) {
        owner = existingOwner;
        listing = {
          ...details,
          id: editing?.id || crypto.randomUUID(),
          ownerId: owner.id,
          owner: owner.name,
          phone: "",
          company: true,
          demo: true,
        };
      } else {
        ({ owner, listing } = prepareListing(details, owners));
      }
      listing.createdBy =
        editing?.createdBy || (admin ? "admin-demo" : "visitor-demo");
      if (!owners.some((x) => x.id === owner.id)) setOwners([...owners, owner]);
      if (editing) {
        setCars(
          cars.map((c) =>
            c.id === editing.id ? { ...c, ...listing, id: c.id } : c,
          ),
        );
        note("Elan yeniləndi.");
      } else if (admin) {
        setCars([...cars, listing]);
        note("Elan sahibin profilinə əlavə olundu.");
      } else {
        setPending([...pending, listing]);
        note("Elan yoxlanışa göndərildi.");
      }
      setModal(null);
    } catch (error) {
      note(error.message);
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

  function addSamples() {
    const missing = initial.filter(
      (sample) => !cars.some((c) => c.id === sample.id),
    );
    setCars([...cars, ...missing]);
    if (!owners.some((o) => o.id === "demo-fleet"))
      setOwners([...owners, ...demoOwners]);
    note(
      missing.length
        ? `${missing.length} çatışmayan nümunə elan əlavə edildi.`
        : "10 nümunə elanın hamısı artıq mövcuddur.",
    );
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
          <button className="login" onClick={() => setModal("account")}>
            Daxil ol
          </button>
          <button className="primary add" onClick={() => setModal("listing")}>
            <Plus size={17} /> Elan yerləşdir
          </button>
        </div>
      </header>
      {!admin && (
        <nav className="mobile-nav" aria-label="Əsas menyu">
          <a href="#cars">Avtomobillər</a>
          <button onClick={() => setModal("partners")}>Partnyorlar</button>
          <button onClick={() => setModal("how")}>Necə işləyir?</button>
        </nav>
      )}
      {admin ? (
        <main className="admin">
          <div className="section-title">
            <div>
              <span className="eyebrow">DEMO İDARƏETMƏ PANELİ</span>
              <h1>Hər şey nəzarətində.</h1>
              <p>
                Lokal idarəetmə prototipi. Məlumatlar bu brauzerdə saxlanır;
                Google girişi hələ qoşulmayıb. Nəzərdə tutulan admin:
                rentacarr.az@gmail.com.
              </p>
            </div>
            <button className="outline" onClick={() => setAdmin(false)}>
              Sayta qayıt
            </button>
          </div>
          <div className="stats">
            {[
              ["Aktiv elanlar", cars.filter((c) => !c.paused).length],
              ["Yoxlanış gözləyən", pending.length],
              [
                "Premium elanlar",
                cars.filter((c) => c.promotion === "premium").length,
              ],
              ["VIP elanlar", cars.filter((c) => c.vip).length],
            ].map(([label, n]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{n}</strong>
              </article>
            ))}
          </div>
          <div className="admin-actions">
            <button className="primary" onClick={() => setModal("listing")}>
              <Plus size={17} /> Sahibin adından elan yerləşdir
            </button>
            <button className="outline" onClick={addSamples}>
              10 nümunə elanı tamamla
            </button>
            <button className="outline" onClick={exportWorkspace}>
              Ehtiyat nüsxəni endir
            </button>
          </div>
          {storageError && (
            <p role="alert" className="storage-warning">
              Brauzer məlumatları saxlaya bilmir. İtirməmək üçün ehtiyat nüsxəni
              endirin.
            </p>
          )}
          <section className="owner-management">
            <span className="eyebrow">HESABDAN ƏVVƏL DƏ SAHİB PROFİLİ</span>
            <h2>Avtomobil sahibləri</h2>
            <p>
              Telefon yalnız əlaqə üçündür. Yeni elan üçün mövcud sahibi seçin
              və ya yeni profil yaradın. Google girişi qoşulduqdan sonra sahibin
              təsdiqlənmiş hesabına elanları admin bağlayacaq. E-poçt qeyd etmək
              giriş icazəsi vermir.
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
                    <span className="claim-status">Hesab açılmayıb</span>
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
          <h2>Yoxlanış gözləyən elanlar</h2>
          {!pending.length ? (
            <div className="empty">
              Yeni elan yoxdur. “Elan yerləşdir” vasitəsilə nümunə elan göndərə
              bilərsiniz.
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
                  onClick={() => {
                    setCars([...cars, c]);
                    setPending(pending.filter((x) => x.id !== c.id));
                    note("Elan təsdiqləndi");
                  }}
                >
                  Təsdiqlə
                </button>
                <button
                  className="outline"
                  onClick={() =>
                    setPending(pending.filter((x) => x.id !== c.id))
                  }
                >
                  Rədd et
                </button>
              </div>
            ))
          )}
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
                onChange={(e) => {
                  const promotion = e.target.value;
                  setCars(
                    cars.map((x) =>
                      x.id === c.id
                        ? { ...x, promotion, vip: promotion !== "standard" }
                        : x,
                    ),
                  );
                }}
              >
                <option value="standard">Standart</option>
                <option value="vip">VIP</option>
                <option value="premium">Premium</option>
              </select>
              <button
                className="outline"
                onClick={() => setModal("edit:" + c.id)}
              >
                Redaktə et
              </button>
              <button
                className="outline"
                onClick={() =>
                  setCars(
                    cars.map((x) =>
                      x.id === c.id ? { ...x, paused: !x.paused } : x,
                    ),
                  )
                }
              >
                {c.paused ? "Aktivləşdir" : "Dayandır"}
              </button>
              <button
                className="outline danger"
                onClick={() => setDeleteId(c.id)}
              >
                Sil
              </button>
            </div>
          ))}
          {!adminCars.length && (
            <div className="empty">Bu seçimə uyğun elan yoxdur.</div>
          )}
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
              seçin. Google hesabına bağlama hələ aktiv deyil.
            </p>
            <p>
              <b>Məlumatlar:</b> Dəyişikliklər bu brauzerdə qalır. Ehtiyat
              nüsxəni mütəmadi endirin. Demo paneldə ödəniş və real giriş
              yoxdur.
            </p>
          </section>
        </main>
      ) : (
        <>
          <section className="hero">
            <div className="hero-shade" />
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
            <div className="hero-caption">
              <span>Hər yolun öz hekayəsi var.</span>
              <b>
                Öz hekayəni başlat. <ArrowUpRight size={18} />
              </b>
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
                placeholder="Məsələn: Corolla, Sportage, E 200…"
              />
            </label>
            <div className="demo-note">
              Nümunə elanlar · Real fotolar · Qiymətlər və şərtlər nümunədir.
            </div>
            <div className="grid">
              {filtered.map((c) => (
                <article className="car-card" key={c.id}>
                  <div className="car-image" onClick={() => setSelected(c)}>
                    <img src={c.image} alt={c.name} />
                    <div className="badges">
                      {c.promotion === "premium" ? (
                        <span className="premium">♛ PREMIUM</span>
                      ) : (
                        c.vip && <span className="vip">✦ VIP</span>
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
              <button onClick={() => setModal("listing")}>
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
        <button
          onClick={() => {
            setAdmin(true);
            window.scrollTo(0, 0);
          }}
        >
          Demo idarəetmə paneli <ArrowUpRight size={14} />
        </button>
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
              {cars.find((c) => c.id === deleteId)?.name} kataloqdan və bu
              brauzerin yaddaşından silinəcək. Elanı sadəcə gizlətmək üçün
              dayandırma funksiyasından istifadə edə bilərsiniz.
            </p>
            <div className="contact">
              <button className="outline" onClick={() => setDeleteId(null)}>
                Ləğv et
              </button>
              <button
                className="primary danger"
                onClick={() => {
                  setCars(cars.filter((c) => c.id !== deleteId));
                  setDeleteId(null);
                  note("Elan silindi.");
                }}
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
          <section className="modal" onClick={(e) => e.stopPropagation()}>
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
                    Nümunə elanda əlaqə nömrəsi yoxdur.
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
                    : "Elan yoxlanışdan sonra görünəcək. Məlumatlar yalnız bu cihazın brauzerində saxlanır."}
                </p>
                <div className="form-hint">
                  Sahib gələcəkdə Google ilə daxil olacaq. Admin elanları onun
                  təsdiqlənmiş Google hesabına bağlayacaq. Hazırda Google girişi
                  aktiv deyil.
                </div>
                <ListingEditor
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
                    <p>{owner.expectedEmail || "E-poçt qeyd edilməyib"}</p>
                    <div className="form-hint">
                      Bu profilə aid elanlar aşağıdadır. Google girişi aktiv
                      olduqda admin profili sahibin təsdiqlənmiş Google hesabına
                      bağlayacaq. Telefonla qeydiyyat yoxdur.
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
                <span className="eyebrow">XOŞ GƏLMİSİNİZ</span>
                <h2>Sənin avtomobil məkanın.</h2>
                <p>
                  Qeydiyyat və giriş yalnız Google hesabı ilə olacaq. Bu imkan
                  hələ aktiv deyil; qoşulduqda Google ilə giriş düyməsi burada
                  görünəcək. Telefon yalnız elan sahibi ilə əlaqə üçündür.
                </p>
                <button className="primary" onClick={() => setModal("listing")}>
                  Nümunə elan yerləşdir
                </button>
                <button
                  className="outline modal-secondary"
                  onClick={() => {
                    setModal(null);
                    setAdmin(true);
                    window.scrollTo(0, 0);
                  }}
                >
                  Demo paneli aç
                </button>
              </>
            ) : modal === "partners" ? (
              <>
                <span className="eyebrow">BİRLİKDƏ BÖYÜYƏK</span>
                <h2>Avtoparkını daha çox insan görsün.</h2>
                <p>
                  Rentakar şirkətləri və şəxsi sahiblər üçün ilk aktiv elan
                  pulsuzdur. 3 və 10 avtomobillik paketlər, VIP yerləşdirmə və
                  şirkət profilləri nəzərdə tutulur.
                </p>
                <button className="primary" onClick={() => setModal("listing")}>
                  İlk elanını yerləşdir
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
        <div className="toast">
          <Check size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
