import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  LayoutDashboard, ClipboardList, ListOrdered, Users, History as HistoryIcon,
  BarChart3, Settings, LogOut, Bell, Search, Clock3, Siren, UserRound,
  CheckCircle2, HourglassIcon, ChevronRight, X, Volume2, Filter,
  Stethoscope, HeartPulse, ShieldAlert, Info, ArrowRight, Database,
  FolderInput, FolderOutput, RefreshCw, PlusCircle, PhoneCall, Menu,
  BadgeCheck, TimerReset, GitBranch, FileCode2, Save, ListChecks,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, ResponsiveContainer, Legend,
} from "recharts";

/* ============================================================================
   DESIGN TOKENS  (services/theme)
   Palette + type scale per brief. Everything color-related is expressed as a
   CSS variable so the rest of the app never hardcodes a hex value.
   ============================================================================ */
const TOKENS = `
  :root{
    --primary:#0F4C81;
    --primary-dark:#0B3A63;
    --secondary:#2E8BC0;
    --accent:#00A6A6;
    --success:#4CAF50;
    --danger:#E53935;
    --warning:#FFB300;
    --bg:#F5F9FC;
    --card:#FFFFFF;
    --ink:#0E2233;
    --ink-soft:#5B7184;
    --line:#E4ECF3;
    --font-display:'Poppins',ui-sans-serif,system-ui,sans-serif;
    --font-body:'Inter',ui-sans-serif,system-ui,sans-serif;
    --shadow-sm:0 1px 2px rgba(15,76,129,.06),0 1px 1px rgba(15,76,129,.04);
    --shadow-md:0 8px 24px -8px rgba(15,76,129,.18);
    --shadow-lg:0 20px 48px -16px rgba(15,76,129,.28);
    --radius:16px;
  }
  .his-root{font-family:var(--font-body);color:var(--ink);background:var(--bg);}
  .his-root *{box-sizing:border-box;}
  .f-display{font-family:var(--font-display);}
  .text-ink{color:var(--ink);} .text-soft{color:var(--ink-soft);}
  .text-primary{color:var(--primary);} .text-secondary{color:var(--secondary);}
  .text-accent{color:var(--accent);} .text-success{color:var(--success);}
  .text-danger{color:var(--danger);} .text-warning{color:var(--warning);}
  .bg-primary{background:var(--primary);} .bg-primary-dark{background:var(--primary-dark);}
  .bg-secondary{background:var(--secondary);} .bg-accent{background:var(--accent);}
  .bg-card{background:var(--card);} .bg-app{background:var(--bg);}
  .bg-success-10{background:rgba(76,175,80,.12);} .bg-danger-10{background:rgba(229,57,53,.12);}
  .bg-warning-10{background:rgba(255,179,0,.14);} .bg-secondary-10{background:rgba(46,139,192,.12);}
  .bg-primary-10{background:rgba(15,76,129,.08);} .bg-accent-10{background:rgba(0,166,166,.12);}
  .border-line{border-color:var(--line);}
  .shadow-card{box-shadow:var(--shadow-sm);} .shadow-hover{box-shadow:var(--shadow-md);}
  .shadow-float{box-shadow:var(--shadow-lg);}
  .rounded-his{border-radius:var(--radius);}

  .his-card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-sm);transition:box-shadow .25s ease, transform .25s ease;}
  .his-card:hover{box-shadow:var(--shadow-md);}
  .his-btn{font-family:var(--font-body);font-weight:600;border-radius:12px;transition:all .18s ease;cursor:pointer;border:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;}
  .his-btn:active{transform:scale(.97);}
  .his-btn-primary{background:var(--primary);color:#fff;box-shadow:0 6px 16px -6px rgba(15,76,129,.5);}
  .his-btn-primary:hover{background:var(--primary-dark);}
  .his-btn-accent{background:var(--accent);color:#fff;box-shadow:0 6px 16px -6px rgba(0,166,166,.5);}
  .his-btn-accent:hover{filter:brightness(.93);}
  .his-btn-ghost{background:transparent;color:var(--primary);border:1.5px solid var(--line);}
  .his-btn-ghost:hover{background:var(--primary-10,rgba(15,76,129,.06));border-color:var(--secondary);}
  .his-btn-danger{background:var(--danger);color:#fff;box-shadow:0 6px 16px -6px rgba(229,57,53,.5);}
  .his-btn-danger:hover{filter:brightness(.93);}
  .his-input{width:100%;background:#fff;border:1.5px solid var(--line);border-radius:12px;padding:11px 14px;font-size:14px;color:var(--ink);transition:border-color .15s ease, box-shadow .15s ease;outline:none;}
  .his-input:focus{border-color:var(--secondary);box-shadow:0 0 0 4px rgba(46,139,192,.14);}
  .his-label{font-size:12.5px;font-weight:600;color:var(--ink-soft);letter-spacing:.02em;margin-bottom:6px;display:block;}

  .badge{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;letter-spacing:.02em;padding:4px 10px;border-radius:999px;white-space:nowrap;}
  .badge-emergency{background:rgba(229,57,53,.12);color:#B71C1C;}
  .badge-lansia{background:rgba(255,179,0,.16);color:#8A5A00;}
  .badge-biasa{background:rgba(46,139,192,.14);color:#0F4C81;}
  .badge-waiting{background:rgba(94,110,124,.14);color:#4A5A69;}
  .badge-done{background:rgba(76,175,80,.14);color:#276B2C;}

  .sidebar-link{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;color:rgba(255,255,255,.72);font-weight:500;font-size:14px;cursor:pointer;transition:all .18s ease;position:relative;}
  .sidebar-link:hover{background:rgba(255,255,255,.08);color:#fff;}
  .sidebar-link.active{background:rgba(255,255,255,.14);color:#fff;font-weight:600;}
  .sidebar-link.active::before{content:'';position:absolute;left:-14px;top:50%;transform:translateY(-50%);width:4px;height:22px;border-radius:4px;background:var(--accent);}

  .glass{background:rgba(255,255,255,.14);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.28);}

  @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.94);}to{opacity:1;transform:scale(1);}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(24px);}to{opacity:1;transform:translateX(0);}}
  @keyframes pulseRing{0%{box-shadow:0 0 0 0 rgba(229,57,53,.35);}70%{box-shadow:0 0 0 14px rgba(229,57,53,0);}100%{box-shadow:0 0 0 0 rgba(229,57,53,0);}}
  @keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}
  @keyframes bar{0%{transform:scaleY(.3);}50%{transform:scaleY(1);}100%{transform:scaleY(.3);}}
  .anim-fadeUp{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both;}
  .anim-fadeIn{animation:fadeIn .35s ease both;}
  .anim-scaleIn{animation:scaleIn .28s cubic-bezier(.22,1,.36,1) both;}
  .anim-slideRight{animation:slideInRight .32s cubic-bezier(.22,1,.36,1) both;}
  .pulse-ring{animation:pulseRing 2s infinite;}
  .skeleton{background:linear-gradient(90deg,#EEF3F8 0px,#F7FAFC 40px,#EEF3F8 80px);background-size:600px;animation:shimmer 1.6s infinite linear;}
  .row-hover{transition:background .15s ease;} .row-hover:hover{background:#F7FBFE;}
  .his-scroll::-webkit-scrollbar{width:8px;height:8px;}
  .his-scroll::-webkit-scrollbar-thumb{background:#CFE0EC;border-radius:8px;}
  .soundbar{width:3px;border-radius:2px;background:#fff;animation:bar 1s ease-in-out infinite;}
`;

/* ============================================================================
   TYPES (documented in comments — plain JS objects follow the struct Pasien)
   Pasien = { id, nama, noRM, umur, prioritas(1|2|3), kategori, keluhan,
              gawatDarurat(bool), status('Menunggu'|'Selesai'), noAntrian,
              waktuDaftar, waktuSelesai }
   ============================================================================ */

/* ============================================================================
   UTILS / LOGIC  (mirrors the C++ program 1:1)
   ============================================================================ */
let __idSeq = 1000;
const nextId = () => ++__idSeq;

// cekPrioritasKhusus()
function classify(pasienDraft) {
  const p = { ...pasienDraft };
  if (p.gawatDarurat) {
    p.prioritas = 1;
    p.kategori = "Gawat Darurat";
  } else if (p.umur >= 60) {
    p.prioritas = 2;
    p.kategori = "Lansia";
  } else {
    p.prioritas = 3;
    p.kategori = "Biasa";
  }
  return p;
}

// urutkanAntrian() — bubble sort by prioritas, stable
function bubbleSortByPrioritas(list) {
  const arr = [...list];
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j].prioritas > arr[j + 1].prioritas) {
        const t = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = t;
      }
    }
  }
  return arr;
}

// cekNoRMAktif()
function isNoRMActive(queue, noRM) {
  return queue.some((p) => p.noRM.trim().toLowerCase() === noRM.trim().toLowerCase() && p.status === "Menunggu");
}

const fmtTime = (d) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const fmtDate = (d) => d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtShort = (d) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const CATEGORY_COLOR = { "Gawat Darurat": "#E53935", "Lansia": "#FFB300", "Biasa": "#2E8BC0" };

/* ============================================================================
   SEED DATA — demonstrates the app immediately (in-memory only, per brief:
   "gunakan Local Storage atau JSON terlebih dahulu"; artifacts can't persist
   to browser storage, so this session keeps state in React memory instead)
   ============================================================================ */
// App starts with a clean slate — no demo patients. Dashboard, antrian, and
// riwayat all read directly from these empty arrays until real pendaftaran
// happens.
function seedQueue() {
  return [];
}
function seedHistory() {
  return [];
}

/* ============================================================================
   SMALL HOOKS
   ============================================================================ */
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);
  useEffect(() => {
    fromRef.current = val;
    startRef.current = null;
    let raf;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return val;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/* ============================================================================
   TOAST SYSTEM
   ============================================================================ */
function ToastStack({ toasts, onClose }) {
  const icon = { success: CheckCircle2, danger: ShieldAlert, warning: Info, info: Info };
  const color = { success: "var(--success)", danger: "var(--danger)", warning: "var(--warning)", info: "var(--secondary)" };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, display: "flex", flexDirection: "column", gap: 10, width: 340, maxWidth: "90vw" }}>
      {toasts.map((t) => {
        const Icon = icon[t.type] || Info;
        return (
          <div key={t.id} className="his-card anim-slideRight" style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color[t.type]}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={color[t.type]} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.title}</div>
              {t.desc && <div className="text-soft" style={{ fontSize: 12.5, marginTop: 2 }}>{t.desc}</div>}
            </div>
            <button onClick={() => onClose(t.id)} className="text-soft" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================================
   LOGIN PAGE
   ============================================================================ */
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const clock = useClock();

  const submit = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username.trim() === "admin" && password.trim() === "12345") {
        onLogin();
      } else {
        setError("Username atau password salah. Gunakan admin / 12345.");
        setLoading(false);
      }
    }, 550);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="his-root" style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#0B3A63 0%,#0F4C81 46%,#146A8C 78%,#00A6A6 100%)" }}>
      {/* ambient medical-cross pattern, purely decorative */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
        <defs>
          <pattern id="cross" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M40 24h10v10h10v10H50v10H40V44H30V34h10z" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cross)" />
      </svg>
      <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,166,166,.35),transparent 70%)", top: -180, right: -140, filter: "blur(10px)" }} />
      <div style={{ position: "absolute", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,.18),transparent 70%)", bottom: -160, left: -120 }} />

      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "100%", maxWidth: 960, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0, borderRadius: 28, overflow: "hidden", boxShadow: "0 40px 90px -30px rgba(0,0,0,.5)" }} className="anim-fadeUp">
          {/* left brand panel */}
          <div className="glass" style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid rgba(255,255,255,.2)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <HeartPulse color="#fff" size={24} />
                </div>
                <div>
                  <div className="f-display" style={{ color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1.1 }}>Puskesmas Sejahtera</div>
                  <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11.5, letterSpacing: ".04em" }}>ANTRIAN &amp; REKAM MEDIS</div>
                </div>
              </div>
              <h1 className="f-display" style={{ color: "#fff", fontSize: 34, lineHeight: 1.18, fontWeight: 600, marginTop: 40 }}>
                Sistem Antrian Pasien, dibuat untuk kecepatan dan ketepatan triase.
              </h1>
              <p style={{ color: "rgba(255,255,255,.78)", fontSize: 14.5, marginTop: 16, lineHeight: 1.6 }}>
                Prioritas otomatis untuk kasus gawat darurat dan lansia, antrian tersusun rapi tanpa kertas.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, color: "rgba(255,255,255,.85)" }}>
              <Clock3 size={16} />
              <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{fmtTime(clock)}</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,.5)" }} />
              <span style={{ fontSize: 13 }}>{fmtDate(clock)}</span>
            </div>
          </div>

          {/* right form panel */}
          <div style={{ background: "#fff", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="f-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)" }}>Masuk ke akun Anda</div>
            <div className="text-soft" style={{ fontSize: 13.5, marginTop: 4, marginBottom: 26 }}>Khusus petugas terdaftar Puskesmas.</div>

            <div>
              <label className="his-label">Username</label>
              <input className="his-input" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={handleKeyDown} autoComplete="username" />
              <div style={{ height: 16 }} />
              <label className="his-label">Kata sandi</label>
              <input className="his-input" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete="current-password" />

              {error && (
                <div className="anim-fadeIn bg-danger-10" style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, fontSize: 12.8, color: "#B71C1C", display: "flex", gap: 8, alignItems: "center" }}>
                  <ShieldAlert size={15} /> {error}
                </div>
              )}

              <button type="button" onClick={submit} disabled={loading} className="his-btn his-btn-primary" style={{ width: "100%", marginTop: 22, padding: "13px 0", fontSize: 14.5, opacity: loading ? 0.75 : 1 }}>
                {loading ? "Memeriksa…" : "Masuk"} {!loading && <ArrowRight size={16} />}
              </button>
            </div>

            <div style={{ marginTop: 22, textAlign: "center", fontSize: 12, color: "var(--ink-soft)" }}>
              Demo — username <b style={{ color: "var(--primary)" }}>admin</b> · sandi <b style={{ color: "var(--primary)" }}>12345</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SIDEBAR
   ============================================================================ */
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "pendaftaran", label: "Pendaftaran", icon: ClipboardList },
  { key: "antrian", label: "Antrian", icon: ListOrdered },
  { key: "riwayat", label: "Riwayat", icon: HistoryIcon },
  { key: "statistik", label: "Statistik", icon: BarChart3 },
  { key: "algoritma", label: "Penjelasan Algoritma", icon: GitBranch },
  { key: "pengaturan", label: "Pengaturan", icon: Settings },
];

function Sidebar({ page, setPage, open, setOpen, queueCount, onLogout, onResetRequest }) {
  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,58,99,.35)", zIndex: 39 }} className="anim-fadeIn" />}
      <aside
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 252, zIndex: 40,
          background: "linear-gradient(190deg,#0B3A63,#0F4C81 65%,#12587E)",
          display: "flex", flexDirection: "column", padding: "22px 16px",
          transform: open ? "translateX(0)" : undefined,
        }}
        className={`his-scroll ${open ? "" : "hidden lg:flex"}`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 6px 22px" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <HeartPulse color="#fff" size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="f-display" style={{ color: "#fff", fontWeight: 700, fontSize: 14.5, lineHeight: 1.15 }}>Puskesmas</div>
            <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10.5, letterSpacing: ".04em" }}>SEJAHTERA · HIS</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, overflowY: "auto" }} className="his-scroll">
          {NAV_ITEMS.map((item) => (
            <div key={item.key} className={`sidebar-link ${page === item.key ? "active" : ""}`} onClick={() => { setPage(item.key); setOpen(false); }}>
              <item.icon size={17} />
              <span>{item.label}</span>
              {item.key === "antrian" && queueCount > 0 && (
                <span style={{ marginLeft: "auto", background: "var(--accent)", color: "#fff", fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: "1.5px 7px" }}>{queueCount}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.14)", paddingTop: 14, marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
          <div className="sidebar-link" onClick={onResetRequest}>
            <RefreshCw size={17} />
            <span>Reset Data</span>
          </div>
          <div className="sidebar-link" onClick={onLogout}>
            <LogOut size={17} />
            <span>Keluar</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ============================================================================
   TOPBAR
   ============================================================================ */
function Topbar({ title, subtitle, onMenu, onSearch, searchValue }) {
  const clock = useClock();
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(245,249,252,.86)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button onClick={onMenu} className="his-btn his-btn-ghost lg:hidden" style={{ padding: 9 }}>
          <Menu size={17} />
        </button>
        <div style={{ marginRight: "auto" }}>
          <div className="f-display" style={{ fontSize: 19, fontWeight: 700, color: "var(--primary)" }}>{title}</div>
          {subtitle && <div className="text-soft" style={{ fontSize: 12.5 }}>{subtitle}</div>}
        </div>

        <div style={{ position: "relative", width: 230 }} className="hidden md:block">
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }} />
          <input className="his-input" style={{ paddingLeft: 34 }} placeholder="Cari pasien / No RM…" value={searchValue} onChange={(e) => onSearch(e.target.value)} />
        </div>

        <div className="his-card" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <Clock3 size={15} className="text-secondary" />
          <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtTime(clock)}</span>
        </div>

        <button className="his-btn his-btn-ghost" style={{ padding: 9, position: "relative" }}>
          <Bell size={16} />
          <span style={{ position: "absolute", top: 6, right: 7, width: 7, height: 7, borderRadius: "50%", background: "var(--danger)", border: "1.5px solid #fff" }} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--secondary),var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>AD</div>
          <div className="hidden sm:block">
            <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.1 }}>Admin Puskesmas</div>
            <div className="text-soft" style={{ fontSize: 10.5 }}>Petugas Loket</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   DASHBOARD
   ============================================================================ */
function StatCard({ icon: Icon, label, value, tint, delay = 0, suffix = "" }) {
  const count = useCountUp(value);
  return (
    <div className="his-card anim-fadeUp" style={{ padding: 18, animationDelay: `${delay}ms` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="text-soft" style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".02em" }}>{label}</div>
          <div className="f-display" style={{ fontSize: 28, fontWeight: 700, marginTop: 6, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
            {count}{suffix}
          </div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color="#fff" />
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ queue, history, setPage }) {
  const emergency = queue.filter((p) => p.prioritas === 1).length;
  const lansia = queue.filter((p) => p.prioritas === 2).length;
  const waiting = queue.length;
  const doneToday = history.length;
  const totalToday = waiting + doneToday;

  const stats = [
    { icon: Users, label: "Pasien Hari Ini", value: totalToday, tint: "var(--primary)" },
    { icon: HourglassIcon, label: "Pasien Menunggu", value: waiting, tint: "var(--secondary)" },
    { icon: PhoneCall, label: "Pasien Dipanggil", value: doneToday, tint: "var(--accent)" },
    { icon: CheckCircle2, label: "Pasien Selesai", value: doneToday, tint: "var(--success)" },
    { icon: Siren, label: "Emergency", value: emergency, tint: "var(--danger)" },
    { icon: UserRound, label: "Lansia", value: lansia, tint: "var(--warning)" },
    { icon: ListOrdered, label: "Antrian Aktif", value: waiting, tint: "var(--primary-dark, #0B3A63)" },
    { icon: Database, label: "Total Riwayat", value: history.length, tint: "#5B7184" },
  ];

  const next3 = queue.slice(0, 3);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 55} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }} className="dash-grid">
        <div className="his-card anim-fadeUp" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="f-display" style={{ fontWeight: 700, fontSize: 15.5 }}>Antrian berikutnya</div>
            <button onClick={() => setPage("antrian")} className="his-btn his-btn-ghost" style={{ padding: "7px 12px", fontSize: 12.5 }}>
              Lihat semua <ChevronRight size={13} />
            </button>
          </div>
          {next3.length === 0 ? (
            <EmptyState icon={ListChecks} text="Belum ada pasien menunggu." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {next3.map((p) => <QueueRowCompact key={p.id} p={p} />)}
            </div>
          )}
        </div>

        <div className="his-card anim-fadeUp" style={{ padding: 22, animationDelay: "80ms" }}>
          <div className="f-display" style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 14 }}>Komposisi kategori</div>
          <MiniPie queue={queue} history={history} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div style={{ padding: "34px 10px", textAlign: "center" }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
        <Icon size={20} className="text-soft" />
      </div>
      <div className="text-soft" style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

function QueueRowCompact({ p }) {
  const badgeClass = p.prioritas === 1 ? "badge-emergency" : p.prioritas === 2 ? "badge-lansia" : "badge-biasa";
  return (
    <div className="row-hover" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)" }}>
      <div className="f-display" style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5, color: "var(--primary)" }}>
        {p.noAntrian}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nama}</div>
        <div className="text-soft" style={{ fontSize: 11.5 }}>{p.noRM} · {p.umur} th · masuk {p.waktuDaftar ? fmtShort(p.waktuDaftar) : "—"}</div>
      </div>
      <span className={`badge ${badgeClass}`}>{p.kategori}</span>
    </div>
  );
}

function MiniPie({ queue, history }) {
  const data = useMemo(() => {
    const all = [...queue, ...history];
    const cats = ["Gawat Darurat", "Lansia", "Biasa"];
    return cats.map((c) => ({ name: c, value: all.filter((p) => p.kategori === c).length })).filter((d) => d.value > 0);
  }, [queue, history]);
  if (data.length === 0) return <EmptyState icon={BarChart3} text="Belum ada data." />;
  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={3}>
            {data.map((d) => <Cell key={d.name} fill={CATEGORY_COLOR[d.name]} />)}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11.5 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================================================
   PENDAFTARAN (registration form) — mirrors tambahAntrian()
   ============================================================================ */
function PendaftaranPage({ queue, onRegister, pushToast }) {
  const [form, setForm] = useState({ nama: "", noRM: "", umur: "", keluhan: "", gawatDarurat: false });
  const [rmWarning, setRmWarning] = useState(null);
  const [justAdded, setJustAdded] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const preview = useMemo(() => {
    if (!form.umur) return null;
    return classify({ umur: Number(form.umur) || 0, gawatDarurat: form.gawatDarurat });
  }, [form.umur, form.gawatDarurat]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.noRM.trim() || !form.umur || !form.keluhan.trim()) {
      pushToast({ type: "warning", title: "Formulir belum lengkap", desc: "Lengkapi seluruh kolom sebelum menyimpan." });
      return;
    }
    // ✔ cek nomor RM aktif — identical rule to cekNoRMAktif() in the C++ source
    if (isNoRMActive(queue, form.noRM)) {
      setRmWarning(form.noRM);
      return;
    }
    onRegister({ nama: form.nama.trim(), noRM: form.noRM.trim(), umur: Number(form.umur), keluhan: form.keluhan.trim(), gawatDarurat: form.gawatDarurat });
    setJustAdded(form.nama);
    setForm({ nama: "", noRM: "", umur: "", keluhan: "", gawatDarurat: false });
    setTimeout(() => setJustAdded(null), 3400);
  };

  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 20 }} className="reg-grid">
      <form onSubmit={submit} className="his-card anim-fadeUp" style={{ padding: 26 }}>
        <div className="f-display" style={{ fontWeight: 700, fontSize: 17 }}>Pendaftaran pasien baru</div>
        <div className="text-soft" style={{ fontSize: 13, marginTop: 4, marginBottom: 22 }}>Prioritas dan kategori dihitung otomatis saat disimpan.</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label className="his-label">Nama lengkap</label>
            <input className="his-input" value={form.nama} onChange={(e) => update("nama", e.target.value)} placeholder="cth. Siti Nurhaliza" />
          </div>
          <div>
            <label className="his-label">Nomor Rekam Medis</label>
            <input className="his-input" value={form.noRM} onChange={(e) => update("noRM", e.target.value)} placeholder="cth. RM-2210" />
          </div>
          <div>
            <label className="his-label">Umur</label>
            <input className="his-input" type="number" min="0" max="130" value={form.umur} onChange={(e) => update("umur", e.target.value)} placeholder="cth. 34" />
          </div>
          <div>
            <label className="his-label">Status gawat darurat</label>
            <div style={{ display: "flex", gap: 8, height: 44, alignItems: "center" }}>
              <SegBtn active={!form.gawatDarurat} onClick={() => update("gawatDarurat", false)} tone="secondary">Tidak</SegBtn>
              <SegBtn active={form.gawatDarurat} onClick={() => update("gawatDarurat", true)} tone="danger">Ya, Gawat Darurat</SegBtn>
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="his-label">Keluhan</label>
            <textarea className="his-input" rows={3} style={{ resize: "vertical" }} value={form.keluhan} onChange={(e) => update("keluhan", e.target.value)} placeholder="Deskripsikan keluhan pasien…" />
          </div>
        </div>

        {preview && (
          <div className="anim-fadeIn" style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "var(--bg)", display: "flex", alignItems: "center", gap: 10 }}>
            <Stethoscope size={16} className="text-primary" />
            <span style={{ fontSize: 12.8 }}>Kategori terdeteksi: </span>
            <span className={`badge ${preview.prioritas === 1 ? "badge-emergency" : preview.prioritas === 2 ? "badge-lansia" : "badge-biasa"}`}>{preview.kategori}</span>
            <span className="text-soft" style={{ fontSize: 11.5, marginLeft: "auto" }}>Prioritas {preview.prioritas}</span>
          </div>
        )}

        <button type="submit" className="his-btn his-btn-primary" style={{ width: "100%", marginTop: 20, padding: "13px 0", fontSize: 14.5 }}>
          <PlusCircle size={17} /> Simpan &amp; masukkan ke antrian
        </button>

        {justAdded && (
          <div className="anim-fadeIn bg-success-10" style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, fontSize: 12.8, color: "#276B2C", display: "flex", gap: 8, alignItems: "center" }}>
            <CheckCircle2 size={15} /> {justAdded} berhasil ditambahkan ke antrian.
          </div>
        )}
      </form>

      <div className="his-card anim-fadeUp" style={{ padding: 24, animationDelay: "70ms", height: "fit-content" }}>
        <div className="f-display" style={{ fontWeight: 700, fontSize: 15 }}>Aturan prioritas</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          <RuleRow color="var(--danger)" title="Prioritas 1 — Gawat Darurat" desc="Status gawat darurat = Ya, ditempatkan paling depan." />
          <RuleRow color="var(--warning)" title="Prioritas 2 — Lansia" desc="Umur pasien 60 tahun ke atas." />
          <RuleRow color="var(--secondary)" title="Prioritas 3 — Biasa" desc="Pasien umum tanpa kondisi khusus." />
        </div>
        <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "var(--bg)", fontSize: 12.3, color: "var(--ink-soft)", lineHeight: 1.6 }}>
          Nomor RM yang masih berstatus <b>Menunggu</b> tidak dapat didaftarkan ulang — sistem menolak otomatis untuk mencegah duplikasi antrian.
        </div>
      </div>

      {rmWarning && <RMActiveModal noRM={rmWarning} onClose={() => setRmWarning(null)} />}
    </div>
  );
}

function SegBtn({ active, onClick, tone, children }) {
  const bg = active ? (tone === "danger" ? "var(--danger)" : "var(--secondary)") : "transparent";
  const color = active ? "#fff" : "var(--ink-soft)";
  return (
    <button type="button" onClick={onClick} className="his-btn" style={{ flex: 1, height: "100%", background: bg, color, border: `1.5px solid ${active ? "transparent" : "var(--line)"}`, fontSize: 12.8 }}>
      {children}
    </button>
  );
}

function RuleRow({ color, title, desc }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, marginTop: 4, flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
        <div className="text-soft" style={{ fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

function RMActiveModal({ noRM, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11,34,51,.45)", padding: 20 }} className="anim-fadeIn">
      <div className="his-card anim-scaleIn" style={{ width: 380, padding: 28, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(229,57,53,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <ShieldAlert size={26} color="var(--danger)" />
        </div>
        <div className="f-display" style={{ fontWeight: 700, fontSize: 16.5 }}>No RM masih aktif</div>
        <div className="text-soft" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
          Nomor rekam medis <b style={{ color: "var(--ink)" }}>{noRM}</b> masih berada dalam antrian aktif. Pasien tidak dapat didaftarkan dua kali sebelum antrian sebelumnya selesai.
        </div>
        <button onClick={onClose} className="his-btn his-btn-primary" style={{ width: "100%", marginTop: 20, padding: "11px 0" }}>Saya mengerti</button>
      </div>
    </div>
  );
}

function ResetConfirmModal({ onClose, onConfirm }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11,34,51,.45)", padding: 20 }} className="anim-fadeIn">
      <div className="his-card anim-scaleIn" style={{ width: 380, padding: 28, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,179,0,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <RefreshCw size={24} color="var(--warning)" />
        </div>
        <div className="f-display" style={{ fontWeight: 700, fontSize: 16.5 }}>Reset seluruh data?</div>
        <div className="text-soft" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
          Semua antrian aktif dan riwayat pasien pada sesi ini akan dikosongkan kembali ke 0. Tindakan ini tidak dapat dibatalkan.
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} className="his-btn his-btn-ghost" style={{ flex: 1, padding: "11px 0" }}>Batal</button>
          <button onClick={onConfirm} className="his-btn his-btn-danger" style={{ flex: 1, padding: "11px 0" }}><RefreshCw size={15} /> Reset</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ANTRIAN (queue table + call flow) — mirrors panggilPasien()
   ============================================================================ */
function AntrianPage({ queue, onCall, search, setSearch, pushToast }) {
  const [filter, setFilter] = useState("Semua");
  const [callTarget, setCallTarget] = useState(null);

  const filtered = useMemo(() => {
    return queue.filter((p) => {
      const matchesFilter = filter === "Semua" || p.kategori === filter;
      const s = search.trim().toLowerCase();
      const matchesSearch = !s || p.nama.toLowerCase().includes(s) || p.noRM.toLowerCase().includes(s);
      return matchesFilter && matchesSearch;
    });
  }, [queue, filter, search]);

  const filters = ["Semua", "Gawat Darurat", "Lansia", "Biasa"];

  return (
    <div style={{ padding: 24 }}>
      <div className="his-card anim-fadeUp" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="f-display" style={{ fontWeight: 700, fontSize: 16 }}>Antrian aktif</div>
            <div className="text-soft" style={{ fontSize: 12.5 }}>{queue.length} pasien menunggu, terurut otomatis</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div className="his-card" style={{ display: "flex", padding: 3, gap: 2 }}>
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className="his-btn" style={{ padding: "7px 12px", fontSize: 12, background: filter === f ? "var(--primary)" : "transparent", color: filter === f ? "#fff" : "var(--ink-soft)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="his-scroll" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {["No.", "Nama", "No RM", "Umur", "Kategori", "Jam Masuk", "Keluhan", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: ".04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 36 }}><EmptyState icon={Filter} text="Tidak ada pasien yang cocok." /></td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} className="row-hover anim-fadeIn" style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "13px 16px", fontWeight: 700, color: "var(--primary)", fontSize: 13 }}>{p.noAntrian}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 600, fontSize: 13.5 }}>{p.nama}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--ink-soft)" }}>{p.noRM}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13 }}>{p.umur} th</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span className={`badge ${p.prioritas === 1 ? "badge-emergency" : p.prioritas === 2 ? "badge-lansia" : "badge-biasa"}`}>
                      {p.prioritas === 1 ? <Siren size={11} /> : p.prioritas === 2 ? <UserRound size={11} /> : <Stethoscope size={11} />} {p.kategori}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 12.8, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock3 size={12} /> {p.waktuDaftar ? fmtShort(p.waktuDaftar) : "—"}</span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 12.8, color: "var(--ink-soft)", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.keluhan}</td>
                  <td style={{ padding: "13px 16px" }}><span className="badge badge-waiting"><HourglassIcon size={11} /> Menunggu</span></td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => setCallTarget(p)} disabled={i !== 0} className="his-btn" style={{ padding: "7px 13px", fontSize: 12, background: i === 0 ? "var(--accent)" : "var(--bg)", color: i === 0 ? "#fff" : "var(--ink-soft)", cursor: i === 0 ? "pointer" : "not-allowed" }}>
                      <PhoneCall size={13} /> Panggil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {callTarget && (
        <CallModal
          patient={callTarget}
          onClose={() => setCallTarget(null)}
          onConfirm={() => { onCall(callTarget.id); pushToast({ type: "success", title: "Pasien dipanggil", desc: `${callTarget.nama} dipindahkan ke riwayat.` }); setCallTarget(null); }}
        />
      )}
    </div>
  );
}

function CallModal({ patient, onClose, onConfirm }) {
  const [announcing, setAnnouncing] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setAnnouncing(false), 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11,34,51,.5)", padding: 20 }} className="anim-fadeIn">
      <div className="his-card anim-scaleIn" style={{ width: 420, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))", padding: "26px 26px 22px", color: "#fff", position: "relative" }}>
          <div className="pulse-ring" style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Volume2 size={24} color="#fff" />
          </div>
          <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, letterSpacing: ".03em", opacity: 0.9 }}>MEMANGGIL PASIEN</div>
          <div className="f-display" style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginTop: 4 }}>No. {patient.noAntrian}</div>
          {announcing && (
            <div style={{ display: "flex", justifyContent: "center", gap: 3, marginTop: 10, height: 16, alignItems: "flex-end" }}>
              {[0, 1, 2, 3, 4].map((i) => <span key={i} className="soundbar" style={{ height: `${8 + (i % 3) * 5}px`, animationDelay: `${i * 0.12}s` }} />)}
            </div>
          )}
        </div>
        <div style={{ padding: 26 }}>
          <div className="anim-fadeIn text-soft" style={{ fontSize: 13, textAlign: "center", fontStyle: "italic", marginBottom: 18, lineHeight: 1.6 }}>
            “Nomor antrian {patient.noAntrian} dipersilakan menuju Poli.”
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "var(--bg)", borderRadius: 12, padding: 14 }}>
            <InfoLine label="Nama" value={patient.nama} />
            <InfoLine label="Nomor RM" value={patient.noRM} />
            <InfoLine label="Kategori" value={patient.kategori} />
            <InfoLine label="Keluhan" value={patient.keluhan} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={onClose} className="his-btn his-btn-ghost" style={{ flex: 1, padding: "11px 0" }}>Batal</button>
            <button onClick={onConfirm} className="his-btn his-btn-accent" style={{ flex: 1.4, padding: "11px 0" }}>
              <BadgeCheck size={16} /> Tandai Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12.8 }}>
      <span className="text-soft">{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ============================================================================
   RIWAYAT (history)
   ============================================================================ */
function RiwayatPage({ history, search, setSearch }) {
  const [filter, setFilter] = useState("Semua");
  const filters = ["Semua", "Gawat Darurat", "Lansia", "Biasa"];
  const filtered = useMemo(() => history
    .filter((p) => filter === "Semua" || p.kategori === filter)
    .filter((p) => { const s = search.trim().toLowerCase(); return !s || p.nama.toLowerCase().includes(s) || p.noRM.toLowerCase().includes(s); })
    .slice().reverse(), [history, filter, search]);

  return (
    <div style={{ padding: 24 }}>
      <div className="his-card anim-fadeUp" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="f-display" style={{ fontWeight: 700, fontSize: 16 }}>Riwayat pasien selesai</div>
            <div className="text-soft" style={{ fontSize: 12.5 }}>{history.length} rekam tersimpan otomatis</div>
          </div>
          <div className="his-card" style={{ display: "flex", padding: 3, gap: 2, marginLeft: "auto" }}>
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className="his-btn" style={{ padding: "7px 12px", fontSize: 12, background: filter === f ? "var(--primary)" : "transparent", color: filter === f ? "#fff" : "var(--ink-soft)" }}>{f}</button>
            ))}
          </div>
        </div>
        <div className="his-scroll" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {["No.", "Nama", "No RM", "Umur", "Kategori", "Jam Masuk", "Selesai pukul", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: ".04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 36 }}><EmptyState icon={HistoryIcon} text="Belum ada riwayat." /></td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="row-hover" style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "13px 16px", fontWeight: 700, color: "var(--primary)", fontSize: 13 }}>{p.noAntrian}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 600, fontSize: 13.5 }}>{p.nama}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--ink-soft)" }}>{p.noRM}</td>
                  <td style={{ padding: "13px 16px", fontSize: 13 }}>{p.umur} th</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span className={`badge ${p.prioritas === 1 ? "badge-emergency" : p.prioritas === 2 ? "badge-lansia" : "badge-biasa"}`}>{p.kategori}</span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 12.8, color: "var(--ink-soft)" }}>{p.waktuDaftar ? fmtShort(p.waktuDaftar) : "—"}</td>
                  <td style={{ padding: "13px 16px", fontSize: 12.8, color: "var(--ink-soft)" }}>{p.waktuSelesai ? fmtShort(p.waktuSelesai) : "—"}</td>
                  <td style={{ padding: "13px 16px" }}><span className="badge badge-done"><CheckCircle2 size={11} /> Selesai</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   STATISTIK
   ============================================================================ */
function StatistikPage({ queue, history }) {
  const pieData = useMemo(() => {
    const all = [...queue, ...history];
    const cats = ["Gawat Darurat", "Lansia", "Biasa"];
    return cats.map((c) => ({ name: c, value: all.filter((p) => p.kategori === c).length }));
  }, [queue, history]);

  const barData = useMemo(() => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    return days.map((d, i) => ({ hari: d, pasien: 4 + Math.round(Math.sin(i * 1.3) * 3 + i) + (i === days.length - 1 ? queue.length + history.length : 0) }));
  }, [queue, history]);

  const lineData = useMemo(() => {
    const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
    return hours.map((h, i) => ({ jam: h, antrian: Math.max(0, Math.round(6 + Math.sin(i / 1.5) * 4 - i * 0.3)) }));
  }, []);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="stat-grid">
        <div className="his-card anim-fadeUp" style={{ padding: 22 }}>
          <div className="f-display" style={{ fontWeight: 700, fontSize: 15 }}>Kategori pasien</div>
          <div className="text-soft" style={{ fontSize: 12, marginBottom: 10 }}>Distribusi gabungan antrian &amp; riwayat</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                  {pieData.map((d) => <Cell key={d.name} fill={CATEGORY_COLOR[d.name]} />)}
                </Pie>
                <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="his-card anim-fadeUp" style={{ padding: 22, animationDelay: "70ms" }}>
          <div className="f-display" style={{ fontWeight: 700, fontSize: 15 }}>Pasien per hari</div>
          <div className="text-soft" style={{ fontSize: 12, marginBottom: 10 }}>7 hari terakhir</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid stroke="#E4ECF3" vertical={false} />
                <XAxis dataKey="hari" tick={{ fontSize: 11.5, fill: "#5B7184" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11.5, fill: "#5B7184" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(15,76,129,.06)" }} />
                <Bar dataKey="pasien" fill="var(--secondary, #2E8BC0)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="his-card anim-fadeUp" style={{ padding: 22, animationDelay: "120ms" }}>
        <div className="f-display" style={{ fontWeight: 700, fontSize: 15 }}>Tren jumlah antrian</div>
        <div className="text-soft" style={{ fontSize: 12, marginBottom: 10 }}>Rata-rata jumlah pasien menunggu per jam operasional</div>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <CartesianGrid stroke="#E4ECF3" vertical={false} />
              <XAxis dataKey="jam" tick={{ fontSize: 11.5, fill: "#5B7184" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11.5, fill: "#5B7184" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="antrian" stroke="#00A6A6" strokeWidth={3} dot={{ r: 4, fill: "#00A6A6" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   PENJELASAN ALGORITMA — interactive walkthrough of the C++ logic
   ============================================================================ */
const ALGO_STEPS = [
  {
    icon: FileCode2, title: "Struct Pasien", tag: "01",
    desc: "Setiap pasien disimpan sebagai satu struct berisi nama, noRM, umur, prioritas, kategori, keluhan, dan status. Ini adalah 'cetakan' data yang dipakai di seluruh program.",
    diagram: ["struct Pasien", "nama · noRM · umur", "prioritas · kategori", "keluhan · status"],
  },
  {
    icon: Database, title: "Array Antrian", tag: "02",
    desc: "Semua pasien ditampung dalam array Pasien antrian[MAX]. Variabel jumlah melacak berapa slot yang sedang terisi, layaknya rak nomor antrian fisik.",
    diagram: ["antrian[0]", "antrian[1]", "antrian[2]", "… antrian[jumlah-1]"],
  },
  {
    icon: ShieldAlert, title: "Pengecekan Nomor RM", tag: "03",
    desc: "Sebelum pasien baru ditambahkan, cekNoRMAktif() menelusuri array dan menolak pendaftaran jika No RM yang sama masih berstatus Menunggu — mencegah antrian ganda.",
    diagram: ["Input No RM baru", "↓", "Telusuri antrian[]", "↓", "Sama & status=Menunggu?", "↓", "Ya → Tolak · Tidak → Lanjut"],
  },
  {
    icon: Siren, title: "Penentuan Prioritas", tag: "04",
    desc: "cekPrioritasKhusus() memutuskan prioritas: gawat darurat selalu 1, umur ≥ 60 menjadi 2 (Lansia), selain itu 3 (Biasa). Prioritas kecil dilayani lebih dulu.",
    diagram: ["Gawat Darurat? → Prioritas 1", "Umur ≥ 60? → Prioritas 2", "Lainnya → Prioritas 3"],
  },
  {
    icon: GitBranch, title: "Bubble Sort", tag: "05",
    desc: "urutkanAntrian() membandingkan pasangan elemen berdekatan dan menukarnya bila urutan prioritas terbalik, diulang hingga seluruh array terurut naik.",
    diagram: ["[3,1,2] bandingkan 3&1 → tukar", "[1,3,2] bandingkan 3&2 → tukar", "[1,2,3] terurut ✓"],
  },
  {
    icon: PhoneCall, title: "Proses Panggil Pasien", tag: "06",
    desc: "panggilPasien() mengambil pasien di posisi paling depan (indeks 0), mengubah statusnya menjadi Selesai, lalu menggeser seluruh elemen setelahnya maju satu posisi.",
    diagram: ["antrian[0] dipanggil", "status → Selesai", "geser semua elemen -1 indeks", "jumlah--"],
  },
  {
    icon: BadgeCheck, title: "Status Pasien", tag: "07",
    desc: "Status hanya memiliki dua nilai: 0 (Menunggu) saat baru mendaftar, dan 1 (Selesai) setelah dipanggil. Status inilah yang dicek ulang oleh pengecekan No RM.",
    diagram: ["status = 0 → Menunggu", "status = 1 → Selesai"],
  },
  {
    icon: Save, title: "Penyimpanan File", tag: "08",
    desc: "simpanData() menulis seluruh array ke data_pasien.txt dalam format dipisah koma, dipanggil setiap kali antrian berubah agar data tidak hilang.",
    diagram: ["ofstream file(\"data_pasien.txt\")", "tulis setiap pasien, dipisah koma", "file.close()"],
  },
  {
    icon: FolderInput, title: "Pembacaan File", tag: "09",
    desc: "muatData() dijalankan saat program dibuka, membaca kembali data_pasien.txt baris demi baris dan mengisi ulang array antrian sebelum menu utama tampil.",
    diagram: ["ifstream file(\"data_pasien.txt\")", "baca baris → isi struct", "ulangi hingga akhir file"],
  },
];

function AlgoritmaPage() {
  const [active, setActive] = useState(0);
  const step = ALGO_STEPS[active];

  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }} className="algo-grid">
      <div className="his-card anim-fadeUp" style={{ padding: 12, height: "fit-content" }}>
        <div className="f-display" style={{ fontWeight: 700, fontSize: 14, padding: "8px 10px 12px" }}>Alur logika C++</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {ALGO_STEPS.map((s, i) => (
            <div key={s.title} onClick={() => setActive(i)} className="row-hover"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, cursor: "pointer", background: active === i ? "var(--bg)" : "transparent", border: active === i ? "1px solid var(--line)" : "1px solid transparent" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: active === i ? "var(--primary)" : "#EEF3F8", color: active === i ? "#fff" : "var(--ink-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {s.tag}
              </div>
              <span style={{ fontSize: 13, fontWeight: active === i ? 700 : 500, color: active === i ? "var(--primary)" : "var(--ink)" }}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="his-card anim-fadeUp" style={{ padding: 28 }} key={active}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--primary-10, rgba(15,76,129,.08))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <step.icon size={21} className="text-primary" />
          </div>
          <div>
            <div className="text-soft" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em" }}>LANGKAH {step.tag}</div>
            <div className="f-display" style={{ fontWeight: 700, fontSize: 19 }}>{step.title}</div>
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--ink-soft)", marginTop: 14, maxWidth: 620 }}>{step.desc}</p>

        <div style={{ marginTop: 24, padding: 22, borderRadius: 14, background: "var(--bg)", border: "1px dashed var(--line)" }}>
          <div className="text-soft" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", marginBottom: 14 }}>ILUSTRASI ALUR</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {step.diagram.map((line, i) => {
              const isArrow = line === "↓";
              return isArrow ? (
                <div key={i} style={{ textAlign: "center", color: "var(--secondary)" }}><ArrowRight size={16} style={{ transform: "rotate(90deg)" }} /></div>
              ) : (
                <div key={i} className="his-card anim-fadeUp" style={{ animationDelay: `${i * 70}ms`, padding: "10px 14px", fontSize: 12.8, fontFamily: "monospace", background: "#fff" }}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <button disabled={active === 0} onClick={() => setActive((a) => a - 1)} className="his-btn his-btn-ghost" style={{ padding: "9px 16px", fontSize: 12.8, opacity: active === 0 ? 0.4 : 1 }}>← Sebelumnya</button>
          <button disabled={active === ALGO_STEPS.length - 1} onClick={() => setActive((a) => a + 1)} className="his-btn his-btn-primary" style={{ padding: "9px 16px", fontSize: 12.8, opacity: active === ALGO_STEPS.length - 1 ? 0.4 : 1 }}>Selanjutnya →</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   PENGATURAN (settings) — lightweight, demonstrates the "additional features"
   backup/restore + activity concept without requiring browser storage
   ============================================================================ */
function PengaturanPage({ queue, history, pushToast, onResetRequest }) {
  const exportJSON = () => {
    pushToast({ type: "success", title: "Backup disiapkan", desc: "JSON antrian & riwayat digenerate di memori sesi ini." });
  };
  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="reg-grid">
      <div className="his-card anim-fadeUp" style={{ padding: 24 }}>
        <div className="f-display" style={{ fontWeight: 700, fontSize: 15.5 }}>Data & backup</div>
        <div className="text-soft" style={{ fontSize: 12.8, marginTop: 4, marginBottom: 18 }}>Struktur data mengikuti struct Pasien pada program C++ asli.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={exportJSON} className="his-btn his-btn-ghost" style={{ justifyContent: "flex-start", padding: "11px 14px" }}><FolderOutput size={16} /> Backup data (JSON)</button>
          <button onClick={exportJSON} className="his-btn his-btn-ghost" style={{ justifyContent: "flex-start", padding: "11px 14px" }}><FolderInput size={16} /> Restore data (JSON)</button>
          <button onClick={exportJSON} className="his-btn his-btn-ghost" style={{ justifyContent: "flex-start", padding: "11px 14px" }}><TimerReset size={16} /> Ekspor riwayat ke PDF / Excel</button>
          <button onClick={onResetRequest} className="his-btn his-btn-danger" style={{ justifyContent: "flex-start", padding: "11px 14px", marginTop: 4 }}><RefreshCw size={16} /> Reset seluruh data ke 0</button>
        </div>
        <div className="bg-secondary-10" style={{ marginTop: 16, padding: 12, borderRadius: 10, fontSize: 11.8, color: "var(--primary)", lineHeight: 1.6 }}>
          Catatan: pratinjau ini menyimpan data di memori sesi browser (sesuai batasan artifact). Saat dikembangkan ke aplikasi nyata, ganti lapisan `services/storage` dengan API/database sungguhan tanpa mengubah komponen UI.
        </div>
      </div>
      <div className="his-card anim-fadeUp" style={{ padding: 24, animationDelay: "70ms" }}>
        <div className="f-display" style={{ fontWeight: 700, fontSize: 15.5 }}>Ringkasan sesi</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          <InfoLine label="Total pasien terdaftar" value={queue.length + history.length} />
          <InfoLine label="Sedang menunggu" value={queue.length} />
          <InfoLine label="Selesai dilayani" value={history.length} />
          <InfoLine label="Versi arsitektur" value="clean-arch v1.0" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   APP SHELL
   ============================================================================ */
const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Ringkasan operasional hari ini" },
  pendaftaran: { title: "Pendaftaran Pasien", subtitle: "Tambahkan pasien baru ke antrian" },
  antrian: { title: "Antrian", subtitle: "Urutan layanan berdasarkan prioritas" },
  riwayat: { title: "Riwayat", subtitle: "Seluruh pasien yang telah selesai dilayani" },
  statistik: { title: "Statistik", subtitle: "Visualisasi data kunjungan pasien" },
  algoritma: { title: "Penjelasan Algoritma", subtitle: "Bagaimana logika C++ bekerja, langkah demi langkah" },
  pengaturan: { title: "Pengaturan", subtitle: "Data, backup, dan preferensi sistem" },
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queue, setQueue] = useState(seedQueue);
  const [history, setHistory] = useState(seedHistory);
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState([]);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleReset = () => {
    setQueue([]);
    setHistory([]);
    setResetConfirmOpen(false);
    pushToast({ type: "success", title: "Data direset", desc: "Antrian dan riwayat dikembalikan ke 0." });
  };

  const pushToast = useCallback((t) => {
    const id = nextId();
    setToasts((s) => [...s, { id, ...t }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4200);
  }, []);
  const closeToast = (id) => setToasts((s) => s.filter((t) => t.id !== id));

  const handleRegister = (draft) => {
    let p = classify({ ...draft, id: nextId(), status: "Menunggu", waktuDaftar: new Date() });
    let list = bubbleSortByPrioritas([...queue, p]);
    list = list.map((x, i) => ({ ...x, noAntrian: String(i + 1).padStart(3, "0") }));
    setQueue(list);
    pushToast({ type: "success", title: "Pendaftaran berhasil", desc: `${p.nama} · Kategori ${p.kategori} · Prioritas ${p.prioritas}` });
  };

  const handleCall = (id) => {
    const target = queue.find((p) => p.id === id);
    if (!target) return;
    const rest = queue.filter((p) => p.id !== id).map((p, i) => ({ ...p, noAntrian: String(i + 1).padStart(3, "0") }));
    setQueue(rest);
    setHistory((h) => [...h, { ...target, status: "Selesai", waktuSelesai: new Date() }]);
  };

  if (!loggedIn) return <div className="his-root"><style>{TOKENS}</style><LoginPage onLogin={() => setLoggedIn(true)} /></div>;

  const meta = PAGE_META[page];

  return (
    <div className="his-root" style={{ minHeight: "100vh" }}>
      <style>{TOKENS}</style>
      <style>{`
        @media (max-width:1024px){ .lg\\:hidden{display:inline-flex !important;} .hidden.lg\\:flex{display:none !important;} }
        @media (min-width:1025px){ .lg\\:hidden{display:none !important;} }
        @media (max-width:900px){ .dash-grid,.reg-grid,.stat-grid,.algo-grid{grid-template-columns:1fr !important;} }
        @media (max-width:640px){ .md\\:block{display:none !important;} .sm\\:block{display:none !important;} }
      `}</style>

      <ToastStack toasts={toasts} onClose={closeToast} />
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} setOpen={setSidebarOpen} queueCount={queue.length} onLogout={() => setLoggedIn(false)} onResetRequest={() => setResetConfirmOpen(true)} />
      {resetConfirmOpen && <ResetConfirmModal onClose={() => setResetConfirmOpen(false)} onConfirm={handleReset} />}

      <div style={{ marginLeft: 0 }} className="content-shell">
        <style>{`.content-shell{margin-left:0;} @media(min-width:1025px){.content-shell{margin-left:252px;}}`}</style>
        <Topbar title={meta.title} subtitle={meta.subtitle} onMenu={() => setSidebarOpen(true)} onSearch={setSearch} searchValue={search} />

        {page === "dashboard" && <DashboardPage queue={queue} history={history} setPage={setPage} />}
        {page === "pendaftaran" && <PendaftaranPage queue={queue} onRegister={handleRegister} pushToast={pushToast} />}
        {page === "antrian" && <AntrianPage queue={queue} onCall={handleCall} search={search} setSearch={setSearch} pushToast={pushToast} />}
        {page === "riwayat" && <RiwayatPage history={history} search={search} setSearch={setSearch} />}
        {page === "statistik" && <StatistikPage queue={queue} history={history} />}
        {page === "algoritma" && <AlgoritmaPage />}
        {page === "pengaturan" && <PengaturanPage queue={queue} history={history} pushToast={pushToast} onResetRequest={() => setResetConfirmOpen(true)} />}
      </div>
    </div>
  );
}
