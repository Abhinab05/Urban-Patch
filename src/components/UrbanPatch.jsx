// =========================================
// Urban Patch — Main Application Component
// Features: Anonymous Auth, Community Upvoting, Analytics Dashboard
// =========================================
import { useState, useEffect, useRef } from "react";
import "../styles/style.css";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SUPA_URL = "https://soacqabfazwdvegnsldv.supabase.co";
const KEY      = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvYWNxYWJmYXp3ZHZlZ25zbGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzQ5MDAsImV4cCI6MjA5NDQ1MDkwMH0.zqYZlpnOxrwxyLAUqJEoQXAP3Ykt66Ref2LEUjoroqw";
const H        = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const LOGO     = "/urban-patch-logo-2.svg";
const ADMIN_PIN = "2580"; // Change this to your preferred PIN

// ── Assam map base64 src (truncated for readability, kept same as original)
const ASSAM_MAP_SRC = null; // Will use inline SVG fallback

// ── Anonymous username generator ──────────────────────────────────────────
const ADJECTIVES = [
  "Brave","Swift","Bold","Keen","Calm","Wise","Bright","Sharp","Clear","Pure",
  "Green","Clean","Active","Civic","Urban","Alert","Quick","Eager","Solid","True",
];
const ANIMALS = [
  "Tiger","Eagle","Heron","Falcon","Panther","Sparrow","Hawk","Crane","Deer","Otter",
  "Wolf","Bear","Fox","Lion","Panda","Rhino","Bison","Lynx","Stag","Raven",
];

function generateAlias() {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const ani  = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `${adj}${ani}_${num}`;
}

function getOrCreateUser() {
  try {
    const stored = localStorage.getItem("up_user");
    if (stored) return JSON.parse(stored);
    const user = { id: crypto.randomUUID(), alias: generateAlias(), createdAt: new Date().toISOString() };
    localStorage.setItem("up_user", JSON.stringify(user));
    return user;
  } catch {
    return { id: "anon-" + Date.now(), alias: "AnonymousUser", createdAt: new Date().toISOString() };
  }
}

function getVotedReports() {
  try { return new Set(JSON.parse(localStorage.getItem("up_votes") || "[]")); }
  catch { return new Set(); }
}

function saveVote(reportId) {
  try {
    const votes = getVotedReports();
    votes.add(reportId);
    localStorage.setItem("up_votes", JSON.stringify([...votes]));
  } catch {}
}

// ── Supabase DB layer ────────────────────────────────────────────────────
const db = {
  async getMlas() {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/mla_list?select=*&order=district.asc,constituency.asc`, { headers: H });
      return res.ok ? res.json() : [];
    } catch { return []; }
  },
  async getMla(constituency) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/mla_list?constituency=eq.${encodeURIComponent(constituency)}&select=*&limit=1`, { headers: H });
      const d = res.ok ? await res.json() : [];
      return d[0] || null;
    } catch { return null; }
  },
  async getMp(seat) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/mp_list?lok_sabha_seat=eq.${encodeURIComponent(seat)}&select=*&limit=1`, { headers: H });
      const d = res.ok ? await res.json() : [];
      return d[0] || null;
    } catch { return null; }
  },
  async getReports() {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/public_reports?limit=200`, { headers: H });
      return res.ok ? res.json() : [];
    } catch { return []; }
  },
  async insertReport(data) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/reports`, {
        method: "POST",
        headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      return res.ok ? d[0] : null;
    } catch { return null; }
  },
  async updateReportStatus(id, status) {
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/reports?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch { return false; }
  },
  async upvoteReport(id) {
    try {
      // Use Supabase RPC-style increment via PATCH with raw SQL expression won't work with anon key
      // Instead fetch current count first, then increment
      const res = await fetch(`${SUPA_URL}/rest/v1/reports?id=eq.${id}&select=upvotes`, { headers: H });
      if (!res.ok) return false;
      const rows = await res.json();
      const current = rows[0]?.upvotes || 0;
      const pRes = await fetch(`${SUPA_URL}/rest/v1/reports?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...H, "Content-Type": "application/json" },
        body: JSON.stringify({ upvotes: current + 1 })
      });
      return pRes.ok;
    } catch { return false; }
  },
  async uploadPhoto(file) {
    try {
      const mimeToExt = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "jpg", "image/heif": "jpg" };
      const ext  = mimeToExt[file.type?.toLowerCase()] || (file.name?.includes(".") ? file.name.split(".").pop().toLowerCase() : "jpg");
      const mime = file.type || "image/jpeg";
      const path = `reports/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const res = await fetch(`${SUPA_URL}/storage/v1/object/garbage-photos/${path}`, {
        method: "POST",
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": mime, "cache-control": "3600", "x-upsert": "true" },
        body: file,
      });
      if (!res.ok) { console.error("Photo upload failed:", res.status, await res.text()); return null; }
      return `${SUPA_URL}/storage/v1/object/public/garbage-photos/${path}`;
    } catch (e) { console.error("Photo upload error:", e); return null; }
  },
};

// ── Constants ────────────────────────────────────────────────────────────
const WASTE = [
  { id: "mixed",        label: "Mixed Waste",         icon: "\u{1F5D1}\uFE0F", color: "#9CA3AF" },
  { id: "plastic",      label: "Plastic",             icon: "\u{1F9F4}",       color: "#3B82F6" },
  { id: "construction", label: "Construction Debris", icon: "\u{1F9F1}",       color: "#D97706" },
  { id: "organic",      label: "Organic / Food",      icon: "\u{1F342}",       color: "#10B981" },
  { id: "water",        label: "Water Body Dump",     icon: "\u{1F4A7}",       color: "#0EA5E9" },
  { id: "medical",      label: "Medical / Hazardous", icon: "\u26A0\uFE0F",    color: "#EF4444" },
];

const PARTY_CLR = {
  BJP: "#FF6B2B", INC: "#1A6CBD", AIUDF: "#059669",
  AGP: "#7C3AED", UPPL: "#D97706", BPF: "#DB2777", "RAIJOR DAL": "#DC2626",
};

// ── Small reusable components ────────────────────────────────────────────
function Badge({ party }) {
  const c = PARTY_CLR[party] || "#9CA3AF";
  return (
    <span style={{ background: c+"22", color: c, border: `1px solid ${c}44`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap" }}>{party}</span>
  );
}

function TimeAgo({ date }) {
  const ms = Date.now() - new Date(date).getTime();
  const h = Math.floor(ms / 3600000), d = Math.floor(h / 24);
  return <span>{d > 0 ? `${d}d` : h > 0 ? `${h}h` : "now"} ago</span>;
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 28, height: 28, border: "3px solid var(--border-color)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function WIcon({ type, size = 16 }) {
  const w = WASTE.find(t => t.id === type) || WASTE[0];
  return <span style={{ fontSize: size }}>{w.icon}</span>;
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "working on it": return "#f59e0b";
    case "resolved":      return "#10b981";
    case "ignored":       return "#ef4444";
    case "open":
    default:              return "#3b82f6";
  }
}

// ── Assam SVG Map ────────────────────────────────────────────────────────
function AssamMap({ reports }) {
  const LON_MIN = 89.55, LON_MAX = 96.25;
  const LAT_MIN = 23.95, LAT_MAX = 28.25;
  const tx = lon => ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const ty = lat => ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;

  const gps   = reports.filter(r => r.lat && r.lng);
  const nogps = reports.filter(r => !r.lat || !r.lng);
  const CITIES = [
    [91.74,26.18],[94.91,27.48],[93.97,26.75],[92.68,26.35],
    [91.00,26.32],[90.27,26.40],[89.97,26.02],[94.21,26.74],
    [95.37,27.49],[92.80,26.68],[91.44,26.45],[90.55,26.48],
    [93.60,26.55],[92.35,24.87],[92.85,24.85],[94.65,27.00],
  ];

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const lastPan = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const MIN_Z = 1, MAX_Z = 5;
  const clamp = z => Math.min(MAX_Z, Math.max(MIN_Z, z));

  const onWheel = e => { e.preventDefault(); setZoom(z => clamp(z + (e.deltaY < 0 ? 0.15 : -0.15))); };
  const onMD = e => { if (zoom <= 1) return; setDragging(true); dragStart.current = { x: e.clientX, y: e.clientY }; lastPan.current = { ...pan }; };
  const onMM = e => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: lastPan.current.x + dx, y: lastPan.current.y + dy });
  };
  const onMU = () => { setDragging(false); dragStart.current = null; };
  useEffect(() => { const el = containerRef.current; if (!el) return; el.addEventListener("wheel", onWheel, { passive: false }); return () => el.removeEventListener("wheel", onWheel); }, [zoom]);

  const districtCounts = {};
  reports.forEach(r => { districtCounts[r.district] = (districtCounts[r.district] || 0) + 1; });
  const maxCount = Math.max(1, ...Object.values(districtCounts));

  return (
    <div ref={containerRef} style={{ width: "100%", aspectRatio: "2/1", background: "linear-gradient(135deg,#e8f4fd,#f0f9f0)", borderRadius: 12, overflow: "hidden", cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default", userSelect: "none", position: "relative" }} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
      <svg viewBox="0 0 100 50" style={{ width: "100%", height: "100%", transform: `scale(${zoom}) translate(${pan.x/10}px,${pan.y/10}px)`, transformOrigin: "center center", transition: dragging ? "none" : "transform 0.1s" }} preserveAspectRatio="xMidYMid meet">
        <rect width={100} height={50} fill="#dbeafe" opacity={0.3} rx={2}/>
        <text x={50} y={25} textAnchor="middle" fontSize={6} fill="#94a3b8" fontWeight={700} opacity={0.5}>ASSAM</text>
        {gps.map((r, i) => {
          const cx = tx(r.lng), cy = ty(r.lat);
          const w = WASTE.find(t => t.id === r.waste_type), col = w?.color || "#EF4444";
          return (
            <g key={`g${i}`} className="pin-g" style={{ animationDelay: `${i * 0.12}s` }}>
              <circle cx={cx} cy={cy - 2.8} r="2.2" fill={col} stroke="#fff" strokeWidth="0.5" opacity={0.9}/>
              <line x1={cx} y1={cy - 0.6} x2={cx} y2={cy} stroke={col} strokeWidth="0.8" strokeLinecap="round"/>
            </g>
          );
        })}
        {nogps.map((r, i) => {
          const w = WASTE.find(t => t.id === r.waste_type), city = CITIES[i % CITIES.length], cx = tx(city[0]), cy = ty(city[1]), col = w?.color || "#EF4444";
          return (
            <g key={`n${i}`} className="pin-g" style={{ animationDelay: `${i * 0.35}s`, opacity: 0.65 }}>
              <circle cx={cx} cy={cy - 2.8} r="1.8" fill={col} stroke="#fff" strokeWidth="0.4"/>
              <line x1={cx} y1={cy - 1} x2={cx} y2={cy} stroke={col} strokeWidth="0.7" strokeLinecap="round"/>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
        <button onClick={() => setZoom(z => clamp(z + 0.5))} style={{ width: 26, height: 26, borderRadius: 6, background: "#fff", border: "1px solid var(--border-color)", cursor: "pointer", fontWeight: 800, fontSize: 14 }}>+</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ width: 26, height: 26, borderRadius: 6, background: "#fff", border: "1px solid var(--border-color)", cursor: "pointer", fontSize: 11 }}>↺</button>
      </div>
    </div>
  );
}

// ── Report Card ───────────────────────────────────────────────────────────
function ReportCard({ r, expanded, onClick, onUpvote, voted }) {
  const w = WASTE.find(t => t.id === r.waste_type) || WASTE[0];
  const isHighPriority = (r.upvotes || 0) >= 10;

  return (
    <div className="report-item" onClick={onClick}>
      {r.photo_url ? (
        <img src={r.photo_url} alt="report" className="report-thumb" />
      ) : (
        <div className="report-icon-thumb" style={{ background: w.color + "15", color: w.color, border: `1px solid ${w.color}30` }}>
          {w.icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{r.constituency}</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>• {r.district}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: getStatusColor(r.status) + "20", color: getStatusColor(r.status) }}>
            {(r.status || "OPEN").toUpperCase()}
          </span>
          {isHighPriority && <span className="priority-badge">🔥 HIGH PRIORITY</span>}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}><TimeAgo date={r.created_at} /></span>
        </div>
        {(r.area || r.landmark) && (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            📍 {[r.area, r.landmark].filter(Boolean).join(" • ")}
          </p>
        )}
        {r.reporter_alias && (
          <div className="reporter-line">
            <span>👤 Reported by</span>
            <span className="reporter-alias">{r.reporter_alias}</span>
          </div>
        )}
        <p style={{
          fontSize: 14, color: "var(--text-primary)", marginBottom: 10, marginTop: 6, lineHeight: 1.5,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 2,
          WebkitBoxOrient: "vertical", wordBreak: "break-word",
        }}>{r.description}</p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-main)", padding: "4px 8px", borderRadius: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>MLA:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{r.mla_name}</span>
              <Badge party={r.mla_party} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-main)", padding: "4px 8px", borderRadius: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>MP:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{r.mp_name}</span>
              <Badge party={r.mp_party} />
            </div>
          </div>
          <button
            className={`upvote-btn ${voted ? "voted" : ""}`}
            onClick={e => { e.stopPropagation(); onUpvote && onUpvote(r.id); }}
            title={voted ? "You've already flagged this" : "I see this issue too"}
          >
            <span className="eye">👀</span>
            {voted ? "Flagged" : "I see this too"} · {r.upvotes || 0}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shame Board ───────────────────────────────────────────────────────────
function ShameBoard({ reports }) {
  const [tab, setTab] = useState("mla");
  const medals = ["🥇", "🥈", "🥉"];
  const shame = count => {
    if (count >= 20) return { label: "⚠️ CRITICAL", bg: "#FEE2E2", color: "#DC2626" };
    if (count >= 10) return { label: "🔴 SERIOUS",  bg: "#FEE2E2", color: "#EF4444" };
    if (count >= 5)  return { label: "🟠 MODERATE", bg: "#FEF3C7", color: "#D97706" };
    return               { label: "🟡 LOW",       bg: "#ECFDF5", color: "#059669" };
  };

  const mlaMap = {};
  reports.forEach(r => {
    const k = `${r.mla_name}||${r.mla_party}||${r.constituency}||${r.district}`;
    if (!mlaMap[k]) mlaMap[k] = { name: r.mla_name, party: r.mla_party, constituency: r.constituency, district: r.district, count: 0, latest: r.created_at };
    mlaMap[k].count++;
    if (new Date(r.created_at) > new Date(mlaMap[k].latest)) mlaMap[k].latest = r.created_at;
  });
  const mpMap = {};
  reports.forEach(r => {
    const k = `${r.mp_name}||${r.mp_party}||${r.lok_sabha_seat}`;
    if (!mpMap[k]) mpMap[k] = { name: r.mp_name, party: r.mp_party, seat: r.lok_sabha_seat, count: 0, areas: new Set(), latest: r.created_at };
    mpMap[k].count++;
    mpMap[k].areas.add(r.constituency);
    if (new Date(r.created_at) > new Date(mpMap[k].latest)) mpMap[k].latest = r.created_at;
  });

  const ranking = tab === "mla"
    ? Object.values(mlaMap).filter(p => p.count >= 1).sort((a, b) => b.count - a.count).slice(0, 10)
    : Object.values(mpMap).filter(p => p.count >= 1).sort((a, b) => b.count - a.count).slice(0, 10)
        .map(p => ({ ...p, areas: p.areas.size }));

  const maxC = ranking[0]?.count || 1;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["mla", "🏛️ MLAs"], ["mp", "🇮🇳 MPs"]].map(([id, label]) => (
          <button key={id} className={`nav-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id)} style={{ flex: 1, justifyContent: "center" }}>{label}</button>
        ))}
      </div>
      {ranking.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <p style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 600 }}>Clean Record</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 8 }}>No reports yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ranking.map((p, i) => {
            const lv = shame(p.count);
            return (
              <div key={i} className="report-item" style={{ padding: "16px", alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: i < 3 ? "var(--accent-primary)" : "var(--bg-main)", color: i < 3 ? "#fff" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? 24 : 16, fontWeight: 800, flexShrink: 0 }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>{p.name}</span>
                    <Badge party={p.party} />
                    <span style={{ background: lv.bg, color: lv.color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, marginLeft: "auto" }}>{lv.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                    {tab === "mla" ? `${p.constituency} • ${p.district}` : `${p.seat} Lok Sabha • ${p.areas} areas`}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14 }}>
                      {Array.from({ length: Math.min(p.count, 5) }).map((_, j) => <span key={j}>🗑️</span>)}
                      {p.count > 5 && <span style={{ fontSize: 12, color: "var(--accent-primary)", fontWeight: 800, marginLeft: 4 }}>+{p.count - 5}</span>}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 700 }}>{p.count} report{p.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${(p.count / maxC) * 100}%` }} /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Admin PIN Modal ───────────────────────────────────────────────────────
function AdminPinModal({ onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) { onSuccess(); }
    else { setError(true); setPin(""); setTimeout(() => setError(false), 600); }
  };

  return (
    <div className="pin-overlay">
      <div className="pin-box">
        <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px 0" }}>Admin Access</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Enter the 4-digit admin PIN to view analytics</p>
        <input
          className={`pin-input ${error ? "error" : ""}`}
          type="password"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={pin.length < 4}>Enter →</button>
        </div>
      </div>
    </div>
  );
}

// ── Analytics Dashboard ───────────────────────────────────────────────────
function AnalyticsDashboard({ reports }) {
  const total = reports.length || 1;

  // Resolution breakdown
  const statusCounts = { open: 0, "working on it": 0, resolved: 0, ignored: 0 };
  reports.forEach(r => { const s = (r.status || "open").toLowerCase(); if (s in statusCounts) statusCounts[s]++; });
  const resItems = [
    { label: "Open",          count: statusCounts["open"],           color: "#3b82f6" },
    { label: "Working On It", count: statusCounts["working on it"],  color: "#f59e0b" },
    { label: "Resolved",      count: statusCounts["resolved"],        color: "#10b981" },
    { label: "Ignored",       count: statusCounts["ignored"],         color: "#ef4444" },
  ];
  const resolvedPct = Math.round((statusCounts["resolved"] / total) * 100);

  // District heatmap
  const distMap = {};
  reports.forEach(r => { distMap[r.district] = (distMap[r.district] || 0) + 1; });
  const distEntries = Object.entries(distMap).sort((a, b) => b[1] - a[1]);
  const maxDist = distEntries[0]?.[1] || 1;
  const heatColor = (count) => {
    const ratio = count / maxDist;
    if (ratio > 0.75) return { bg: "#fecaca", color: "#991b1b" };
    if (ratio > 0.5)  return { bg: "#fed7aa", color: "#92400e" };
    if (ratio > 0.25) return { bg: "#fef9c3", color: "#713f12" };
    return                   { bg: "#dcfce7", color: "#14532d" };
  };

  // Waste type breakdown
  const wasteMap = {};
  reports.forEach(r => { wasteMap[r.waste_type] = (wasteMap[r.waste_type] || 0) + 1; });
  const wasteEntries = WASTE.map(w => ({ ...w, count: wasteMap[w.id] || 0 })).sort((a, b) => b.count - a.count);
  const maxWaste = wasteEntries[0]?.count || 1;

  // Weekly trend (last 8 weeks)
  const weekBuckets = {};
  reports.forEach(r => {
    const d = new Date(r.created_at);
    const wk = Math.floor((Date.now() - d.getTime()) / (7 * 864e5));
    if (wk < 8) weekBuckets[7 - wk] = (weekBuckets[7 - wk] || 0) + 1;
  });
  const weekData = Array.from({ length: 8 }, (_, i) => weekBuckets[i] || 0);
  const maxWeek = Math.max(1, ...weekData);

  // Top reporters
  const reporterMap = {};
  reports.forEach(r => {
    if (r.reporter_alias) reporterMap[r.reporter_alias] = (reporterMap[r.reporter_alias] || 0) + 1;
  });
  const topReporters = Object.entries(reporterMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Most upvoted
  const topUpvoted = [...reports].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 5);

  return (
    <div className="slide-in">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Analytics Dashboard</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>Admin view · {total} total reports</p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { n: total, l: "Total Reports", s: "All time", icon: "📋" },
          { n: `${resolvedPct}%`, l: "Resolution Rate", s: "Resolved / Total", icon: "✅" },
          { n: statusCounts["open"], l: "Open Issues", s: "Needs attention", icon: "🔴" },
          { n: distEntries.length, l: "Districts Affected", s: "Across Assam", icon: "📍" },
        ].map(s => (
          <div key={s.l} className="card stat-card hoverable">
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value">{s.n}</div>
            <div className="stat-label">{s.l}</div>
            <div className="stat-sub">{s.s}</div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        {/* Resolution Breakdown */}
        <div className="card hoverable" style={{ gridColumn: "span 1" }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 20px 0" }}>📈 Resolution Breakdown</h3>
          <div className="bar-chart">
            {resItems.map(item => (
              <div key={item.label} className="bar-row">
                <div className="bar-label">{item.label}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(item.count / total) * 100}%`, background: item.color }}>
                    {item.count > 0 && `${Math.round((item.count / total) * 100)}%`}
                  </div>
                </div>
                <div className="bar-val">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="card hoverable">
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 16px 0" }}>📅 Weekly Trend</h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 16px 0" }}>Reports submitted per week (last 8 weeks)</p>
          <div className="sparkline">
            {weekData.map((v, i) => (
              <div
                key={i}
                className="spark-bar"
                style={{ height: `${(v / maxWeek) * 100}%` }}
                title={`Week ${i + 1}: ${v} reports`}
              />
            ))}
          </div>
          <div className="spark-label">
            {["8w", "7w", "6w", "5w", "4w", "3w", "2w", "1w"].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Waste Type Breakdown */}
        <div className="card hoverable">
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 20px 0" }}>🗂 Waste Types</h3>
          <div className="bar-chart">
            {wasteEntries.map(w => (
              <div key={w.id} className="bar-row">
                <div className="bar-label" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  <span>{w.icon}</span>
                  <span style={{ fontSize: 10 }}>{w.label.split(" ")[0]}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(w.count / maxWaste) * 100}%`, background: w.color }}>
                    {w.count > 0 && w.count}
                  </div>
                </div>
                <div className="bar-val">{w.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* District Heatmap */}
        <div className="card hoverable" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 16px 0" }}>🗺️ District Heatmap</h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 16px 0" }}>Color intensity shows number of active reports</p>
          {distEntries.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: 24 }}>No data yet</p>
          ) : (
            <div className="heatmap-grid">
              {distEntries.map(([dist, count]) => {
                const { bg, color } = heatColor(count);
                return (
                  <div key={dist} className="heatmap-cell" style={{ background: bg, color }}>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>📍</div>
                    <div style={{ marginBottom: 2 }}>{dist}</div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Community Reporters */}
        <div className="card hoverable">
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 16px 0" }}>🏆 Top Reporters</h3>
          {topReporters.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No reporter data yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topReporters.map(([alias, count], i) => (
                <div key={alias} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "var(--bg-main)", color: i === 0 ? "#fff" : "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {i === 0 ? "🏆" : `#${i+1}`}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "var(--accent-primary)" }}>{alias}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Upvoted Reports */}
        <div className="card hoverable">
          <h3 style={{ fontWeight: 800, fontSize: 16, margin: "0 0 16px 0" }}>👀 Most Flagged Issues</h3>
          {topUpvoted.length === 0 || topUpvoted[0]?.upvotes === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No upvotes yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topUpvoted.filter(r => (r.upvotes || 0) > 0).map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(99,102,241,0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {r.upvotes}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.constituency}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.district}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: getStatusColor(r.status) + "20", color: getStatusColor(r.status), fontWeight: 700 }}>{(r.status || "OPEN").toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────
function SuccessScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / 3000) * 100, 100);
      setProgress(pct);
      if (pct >= 100) { clearInterval(interval); setTimeout(onDone, 200); }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card pop-in" style={{ maxWidth: 480, margin: "60px auto", textAlign: "center", padding: "40px 24px" }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>✅</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: "var(--text-primary)" }}>Report Submitted!</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
        Your report is now live.<br />The responsible MLA &amp; MP have been officially tagged.
      </p>
      <div className="progress-track" style={{ height: 8, marginBottom: 16 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: 14 }}>Taking you back to the dashboard...</p>
    </div>
  );
}

// ── MAIN APP COMPONENT ────────────────────────────────────────────────────
export default function UrbanPatch() {
  // ── User identity
  const [currentUser]  = useState(() => getOrCreateUser());
  const [votedReports, setVotedReports] = useState(() => getVotedReports());

  // ── Navigation & views
  const [view, setView]           = useState("dashboard");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPinModal, setShowPinModal]   = useState(false);

  // ── Data
  const [selReport, setSelReport] = useState(null);
  const [reports, setReports]     = useState([]);
  const [loadingRep, setLoadingRep] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [mlas, setMlas]           = useState([]);
  const [loadingMlas, setLoadingMlas] = useState(true);

  // ── Feed sort
  const [feedSort, setFeedSort] = useState("recent"); // "recent" | "upvotes"

  // ── Form state
  const [form, setForm] = useState({ district: "", constituency: "", area: "", landmark: "", waste_type: "mixed", description: "", photoPreview: null, photoFile: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [preview, setPreview]       = useState(null);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [position, setPosition]     = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  const fileRef = useRef(null);

  // ── Reverse geocode helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const res  = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await res.json();
      const rawDistrict = (data.principalSubdivision || data.city || "").toLowerCase();
      let matchedDistrict = "";
      if (rawDistrict && districts.length > 0) {
        matchedDistrict = districts.find(d =>
          rawDistrict.includes(d.toLowerCase()) ||
          d.toLowerCase().includes(rawDistrict.replace(" district", "").trim())
        ) || "";
      }
      let matchedConstituency = "";
      const locStrings = [data.locality, data.city, data.principalSubdivision, data.subLocality]
        .filter(Boolean).map(s => s.toLowerCase().replace(" district", "").trim());
      if (mlas && mlas.length > 0) {
        for (const locStr of locStrings) {
          if (!locStr) continue;
          const foundMla = mlas.find(m => {
            const cName = m.constituency.toLowerCase();
            return locStr.includes(cName) || cName.includes(locStr);
          });
          if (foundMla) { matchedConstituency = foundMla.constituency; if (!matchedDistrict) matchedDistrict = foundMla.district; break; }
        }
      }
      setForm(prev => ({ ...prev, district: matchedDistrict || prev.district, constituency: matchedConstituency || prev.constituency, area: data.locality || data.subLocality || prev.area }));
    } catch (e) { console.error(e); }
  };

  const handleGetLocation = e => {
    e.preventDefault();
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      pos => { const { latitude, longitude } = pos.coords; setPosition([latitude, longitude]); reverseGeocode(latitude, longitude); setLoadingLoc(false); },
      err => { console.error(err); alert(`Location failed: ${err.message}`); setLoadingLoc(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  function DraggableMarker() {
    const map = useMap();
    const markerRef = useRef(null);
    useEffect(() => { if (position) map.flyTo(position, 15); }, [position, map]);
    useMapEvents({ click(e) { const newPos = [e.latlng.lat, e.latlng.lng]; setPosition(newPos); reverseGeocode(newPos[0], newPos[1]); } });
    const eventHandlers = { dragend() { const m = markerRef.current; if (m) { const newPos = [m.getLatLng().lat, m.getLatLng().lng]; setPosition(newPos); reverseGeocode(newPos[0], newPos[1]); } } };
    return position === null ? null : <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} />;
  }

  // ── Data fetching
  useEffect(() => {
    db.getReports().then(d => { setReports(d || []); setLoadingRep(false); });
    db.getMlas().then(d => { setMlas(d || []); setDistricts([...new Set((d || []).map(m => m.district))].sort()); setLoadingMlas(false); });
  }, []);

  useEffect(() => {
    if (!form.constituency) { setPreview(null); return; }
    setLoadingPrev(true);
    db.getMla(form.constituency).then(mla => {
      if (!mla) { setPreview(null); setLoadingPrev(false); return; }
      db.getMp(mla.lok_sabha_seat).then(mp => {
        setPreview({ mla: { name: mla.name, party: mla.party, lok_sabha_seat: mla.lok_sabha_seat }, mp: { name: mp?.name, party: mp?.party } });
        setLoadingPrev(false);
      });
    });
  }, [form.constituency]);

  const onPhoto = e => { const f = e.target.files?.[0]; if (!f) return; setForm(prev => ({ ...prev, photoFile: f, photoPreview: URL.createObjectURL(f) })); };

  const onSubmit = async () => {
    if (!form.district || !form.constituency || !form.area || !form.photoFile) return alert("Please fill required fields and add a photo.");
    setSubmitting(true);
    setSubmitStep("uploading");
    const url = await db.uploadPhoto(form.photoFile);
    if (!url) { alert("Error uploading photo. Please try again."); setSubmitting(false); return; }
    setSubmitStep("saving");
    const r = await db.insertReport({
      district: form.district, constituency: form.constituency, area: form.area, landmark: form.landmark,
      waste_type: form.waste_type, description: form.description,
      lok_sabha_seat: mlas.find(m => m.constituency === form.constituency)?.lok_sabha_seat,
      lat: position?.[0] || null, lng: position?.[1] || null,
      photo_url: url,
      reporter_alias: currentUser.alias,
      reporter_id: currentUser.id,
    });
    if (r) {
      setSubmitted(true);
      db.getReports().then(d => setReports(d || []));
      setForm({ district: "", constituency: "", area: "", landmark: "", waste_type: "mixed", description: "", photoPreview: null, photoFile: null });
      setPosition(null);
    } else { alert("Error submitting report"); }
    setSubmitting(false);
  };

  const handleUpvote = async (reportId) => {
    if (votedReports.has(reportId)) return;
    const ok = await db.upvoteReport(reportId);
    if (ok) {
      saveVote(reportId);
      setVotedReports(prev => new Set([...prev, reportId]));
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r));
      if (selReport?.id === reportId) setSelReport(prev => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
    }
  };

  const goToReport = () => { setView("report"); setSubmitted(false); window.scrollTo(0, 0); };

  // ── Computed values
  const uCons  = new Set(reports.map(r => r.constituency)).size;
  const total  = reports.length;
  const week   = reports.filter(r => Date.now() - new Date(r.created_at).getTime() < 7 * 864e5).length;
  const myReports = reports.filter(r => r.reporter_id === currentUser.id);
  const consForDist = mlas.filter(m => m.district === form.district).sort((a, b) => a.constituency.localeCompare(b.constituency));

  const countByC = {};
  reports.forEach(r => { countByC[r.constituency] = countByC[r.constituency] || { count: 0, district: r.district, party: r.mla_party }; countByC[r.constituency].count++; });
  const topC = Object.entries(countByC).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  const sortedFeed = feedSort === "upvotes"
    ? [...reports].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    : reports;

  const NAV = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "report",    icon: "📸", label: "Report" },
    { id: "feed",      icon: "📋", label: "Reports" },
    { id: "mine",      icon: "👤", label: "Mine" },
  ];

  return (
    <div className="app-container fade-in">
      {/* Admin PIN Modal */}
      {showPinModal && (
        <AdminPinModal
          onSuccess={() => { setShowPinModal(false); setShowAnalytics(true); setView("analytics"); }}
          onCancel={() => setShowPinModal(false)}
        />
      )}

      {/* Top Navbar */}
      <nav className="top-nav">
        <div className="logo">
          <div className="logo-icon">UP</div>
          <span>Urban Patch</span>
        </div>
        <div className="nav-links">
          {NAV.map(n => (
            <button
              key={n.id}
              id={`nav-${n.id}`}
              className={`nav-item ${view === n.id ? "active" : ""} ${n.id === "mine" ? "my-reports-active" : ""}`}
              onClick={() => { setView(n.id); setSubmitted(false); }}
            >
              {n.icon} <span className="hide-mobile">{n.label}</span>
            </button>
          ))}
          <button
            className={`nav-item ${view === "analytics" ? "active" : ""}`}
            onClick={() => {
              if (showAnalytics) { setView("analytics"); }
              else { setShowPinModal(true); }
            }}
            title="Admin Analytics"
          >
            🔐 <span className="hide-mobile">Analytics</span>
          </button>
        </div>
        {/* User alias chip */}
        <div className="user-chip" title={`Your anonymous identity: ${currentUser.alias}`}>
          <div className="avatar">{currentUser.alias[0]}</div>
          <span className="alias-text">{currentUser.alias}</span>
        </div>
      </nav>

      {view !== "report" && view !== "analytics" && (
        <button className="fab" onClick={goToReport} aria-label="Report garbage">📸</button>
      )}

      <main className="main-content">

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && (
          <div className="slide-in">
            <div className="hero-section">
              <h1 className="hero-title">Be the change. <span style={{ color: "var(--accent-primary)" }}>Report it.</span></h1>
              <p className="hero-subtitle">
                Spot a garbage dump? Report it in seconds. Every submission automatically tags the responsible MLA &amp; MP, building a permanent, public record of neglect — and of action.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={goToReport}>📸 Report Garbage</button>
                <button className="btn-secondary" onClick={() => setView("feed")}>Browse Reports →</button>
              </div>
            </div>

            <div className="stats-grid">
              {[
                { n: total, l: "Total Reports", s: "All time" },
                { n: uCons, l: "Areas Affected", s: "Across state" },
                { n: week,  l: "New This Week", s: "Recent" },
              ].map(s => (
                <div key={s.l} className="card stat-card hoverable">
                  <div className="stat-value">{loadingRep ? "—" : s.n}</div>
                  <div className="stat-label">{s.l}</div>
                  <div className="stat-sub">{s.s}</div>
                </div>
              ))}
            </div>

            <div className="dash-grid">
              <div className="card hoverable map-container" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🗺️ Live Report Map</h2>
                  <span className="badge" style={{ background: "rgba(37,99,235,0.1)", color: "var(--accent-primary)" }}>{total} Reports</span>
                </div>
                <AssamMap reports={reports} />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                  {WASTE.slice(0, 4).map(w => (
                    <span key={w.id} style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: w.color, display: "inline-block" }} />{w.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card hoverable">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>🔥 Hotspots</h2>
                  <span className="badge" style={{ background: "var(--bg-main)", color: "var(--text-secondary)" }}>MOST REPORTED</span>
                </div>
                {!loadingRep && topC.length === 0 ? <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>No reports yet.</p> : null}
                {!loadingRep ? topC.map(([name, data], i) => (
                  <div key={name} style={{ marginBottom: i < topC.length - 1 ? 20 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-secondary)" }}>#{i + 1}</span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--accent-primary)" }}>{data.count}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${(data.count / topC[0][1].count) * 100}%` }} /></div>
                  </div>
                )) : null}
              </div>
            </div>

            <div style={{ marginTop: 40, marginBottom: 20 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>Board of Accountability</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 24 }}>Live ranking of politicians based on active garbage reports.</p>
              <ShameBoard reports={reports} />
            </div>

            <div style={{ marginTop: 40 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Recent Reports</h2>
                <button className="btn-secondary" style={{ padding: "8px 16px" }} onClick={() => setView("feed")}>View All →</button>
              </div>
              <div className="dash-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                {!loadingRep && reports.slice(0, 3).map(r => (
                  <ReportCard key={r.id} r={r} onClick={() => setSelReport(r)} onUpvote={handleUpvote} voted={votedReports.has(r.id)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORT FORM ── */}
        {view === "report" && !submitted && (
          <div className="slide-in" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Report Garbage</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                Filing as <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{currentUser.alias}</span> · Permanent public record.
              </p>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>1. Photo Evidence <span style={{ color: "var(--danger)" }}>*</span></div>
              <div style={{ cursor: "pointer", textAlign: "center", border: form.photoPreview ? "1px solid var(--accent-primary)" : "2px dashed var(--border-color)", borderRadius: 12, background: form.photoPreview ? "transparent" : "var(--bg-main)", display: "flex", alignItems: "center", justifyContent: "center", padding: form.photoPreview ? 0 : 40, overflow: "hidden", transition: "all 0.2s" }} onClick={() => fileRef.current.click()}>
                {form.photoPreview ? (
                  <div style={{ position: "relative", width: "100%" }}>
                    <img src={form.photoPreview} alt="preview" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />
                    <div className="badge" style={{ position: "absolute", bottom: 12, right: 12, background: "var(--bg-surface)", color: "var(--accent-primary)", boxShadow: "var(--shadow-md)" }}>Change Photo</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                    <div style={{ fontWeight: 700, color: "var(--accent-primary)", fontSize: 16, marginBottom: 4 }}>Tap to upload a photo</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Required for verification</div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhoto} />
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>2. Location Details <span style={{ color: "var(--danger)" }}>*</span></div>
              <div style={{ marginBottom: 16 }}>
                <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 14, background: "var(--bg-main)", color: "var(--accent-primary)", border: "1px solid var(--accent-primary)", boxShadow: "none" }} onClick={handleGetLocation} disabled={loadingLoc}>
                  {loadingLoc ? "📍 Locating..." : "📍 Use Current Location"}
                </button>
              </div>
              {position && (
                <div style={{ height: 300, width: "100%", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-color)", marginBottom: 20 }}>
                  <MapContainer center={position} zoom={15} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 10 }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                    <DraggableMarker />
                  </MapContainer>
                </div>
              )}
              <div className="form-group">
                <label className="inp-label">DISTRICT</label>
                {loadingMlas ? <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading...</div> :
                  <select className="inp-field" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value, constituency: "", area: "", landmark: "" }))}>
                    <option value="">Select district</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                }
              </div>
              {form.district && (
                <div className="form-group">
                  <label className="inp-label">CONSTITUENCY</label>
                  <select className="inp-field" value={form.constituency} onChange={e => setForm(f => ({ ...f, constituency: e.target.value, area: "", landmark: "" }))}>
                    <option value="">Select constituency</option>
                    {consForDist.map(c => <option key={c.id} value={c.constituency}>{c.constituency}</option>)}
                  </select>
                </div>
              )}
              {form.constituency && (
                <>
                  <div className="form-2col" style={{ marginBottom: 24 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="inp-label">AREA / LOCALITY <span style={{ color: "var(--danger)" }}>*</span></label>
                      <input className="inp-field" placeholder="e.g. MG Road" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="inp-label">LANDMARK (optional)</label>
                      <input className="inp-field" placeholder="e.g. Near SBI ATM" value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "rgba(37,99,235,0.05)", borderRadius: 12, border: "1px solid rgba(37,99,235,0.2)" }}>
                    <div style={{ fontSize: 11, color: "var(--accent-primary)", fontWeight: 700, letterSpacing: ".05em", marginBottom: 12 }}>AUTOMATICALLY TAGGING</div>
                    {loadingPrev ? <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Looking up...</div> : preview ? (
                      <div className="acc-grid">
                        {[
                          { role: "MLA", name: preview.mla?.name, sub: form.constituency, party: preview.mla?.party },
                          { role: "MP",  name: preview.mp?.name || "—", sub: `${preview.mla?.lok_sabha_seat} Lok Sabha`, party: preview.mp?.party },
                        ].map(p => (
                          <div key={p.role} style={{ padding: 12, background: "var(--bg-surface)", borderRadius: 8, boxShadow: "var(--shadow-sm)" }}>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 4 }}>{p.role}</div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{p.sub}</div>
                            {p.party && <Badge party={p.party} />}
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Data not found.</div>}
                  </div>
                </>
              )}
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>3. Additional Info</div>
              <div className="form-group">
                <label className="inp-label">WASTE TYPE</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {WASTE.map(w => (
                    <div key={w.id} className={`type-chip ${form.waste_type === w.id ? "selected" : ""}`} onClick={() => setForm(f => ({ ...f, waste_type: w.id }))}>
                      <span style={{ fontSize: 16 }}>{w.icon}</span> {w.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="inp-label">DESCRIPTION (optional)</label>
                <textarea className="inp-field" placeholder="Describe the severity..." style={{ minHeight: 100 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div style={{ padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🎭</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Submitting as <span style={{ color: "var(--accent-primary)" }}>{currentUser.alias}</span></div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Your real identity is never stored or shared.</div>
              </div>
            </div>

            <button id="submit-report-btn" className="btn-primary" style={{ width: "100%", padding: "18px", fontSize: 18 }} onClick={onSubmit} disabled={submitting}>
              {submitting && submitStep === "saving" ? "💾 Saving..." : submitting && submitStep === "uploading" ? "📤 Uploading..." : submitting ? "Wait..." : "Submit Report"}
            </button>
          </div>
        )}

        {view === "report" && submitted && <SuccessScreen onDone={() => { setSubmitted(false); setView("dashboard"); }} />}

        {/* ── FEED ── */}
        {view === "feed" && (
          <div className="slide-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px 0" }}>Browse Reports</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: 0 }}>Showing {total} public records.</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className={`nav-item ${feedSort === "recent" ? "active" : ""}`} onClick={() => setFeedSort("recent")} style={{ padding: "8px 14px", fontSize: 13 }}>🕐 Recent</button>
                <button className={`nav-item ${feedSort === "upvotes" ? "active" : ""}`} onClick={() => setFeedSort("upvotes")} style={{ padding: "8px 14px", fontSize: 13 }}>👀 Most Flagged</button>
                <button className="btn-primary" onClick={goToReport} style={{ padding: "8px 16px", fontSize: 14 }}>+ Report</button>
              </div>
            </div>

            <p className="disclaimer-shine" style={{ marginBottom: 24 }}>
              ⚠️ Mappings are sourced from public data and updated per latest election results.
            </p>

            {loadingRep ? <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div> : reports.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18 }}>No reports found.</p>
                <button className="btn-primary" style={{ marginTop: 24 }} onClick={goToReport}>Be the first to report</button>
              </div>
            ) : (
              <div className="dash-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
                {sortedFeed.map(r => <ReportCard key={r.id} r={r} expanded onClick={() => setSelReport(r)} onUpvote={handleUpvote} voted={votedReports.has(r.id)} />)}
              </div>
            )}
          </div>
        )}

        {/* ── MY REPORTS ── */}
        {view === "mine" && (
          <div className="slide-in">
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div className="user-chip" style={{ cursor: "default" }}>
                  <div className="avatar">{currentUser.alias[0]}</div>
                  <span>{currentUser.alias}</span>
                </div>
                <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent-secondary)" }}>Your Identity</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px 0" }}>My Reports</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: 0 }}>
                {myReports.length === 0 ? "You haven't submitted any reports yet." : `${myReports.length} report${myReports.length !== 1 ? "s" : ""} submitted by you.`}
              </p>
            </div>

            {myReports.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
                <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 18 }}>No reports yet</p>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "8px 0 24px" }}>Be a civic hero — report your first garbage dump!</p>
                <button className="btn-primary" onClick={goToReport}>📸 Submit First Report</button>
              </div>
            ) : (
              <div className="dash-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
                {myReports.map(r => <ReportCard key={r.id} r={r} expanded onClick={() => setSelReport(r)} onUpvote={handleUpvote} voted={votedReports.has(r.id)} />)}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {view === "analytics" && showAnalytics && (
          <AnalyticsDashboard reports={reports} />
        )}

        {/* ── REPORT DETAIL MODAL ── */}
        {selReport && (
          <div className="modal-overlay" onClick={() => setSelReport(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span className="badge" style={{ background: "var(--bg-main)", color: "var(--text-secondary)" }}>PUBLIC RECORD</span>
                <button onClick={() => setSelReport(null)} style={{ background: "var(--bg-main)", border: "none", color: "var(--text-primary)", cursor: "pointer", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>✕</button>
              </div>
              {selReport.photo_url && <img src={selReport.photo_url} alt="garbage" style={{ width: "100%", borderRadius: 12, marginBottom: 20, maxHeight: 320, objectFit: "cover", border: "1px solid var(--border-color)" }} />}

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <WIcon type={selReport.waste_type} size={24} />
                  <h2 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>{selReport.constituency}</h2>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
                  📍 {[selReport.district, selReport.area, selReport.landmark].filter(Boolean).join(" • ")}
                </div>
                {selReport.reporter_alias && (
                  <div className="reporter-line" style={{ marginTop: 6 }}>
                    <span>👤 Reported by</span>
                    <span className="reporter-alias">{selReport.reporter_alias}</span>
                  </div>
                )}
              </div>

              {(() => { const w = WASTE.find(t => t.id === selReport.waste_type); return w ? <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: w.color + "15", color: w.color, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>{w.icon} {w.label}</div> : null; })()}

              {selReport.description && <p style={{ color: "var(--text-primary)", fontSize: 15, lineHeight: 1.6, marginBottom: 24, padding: 16, background: "var(--bg-main)", borderRadius: 12 }}>{selReport.description}</p>}

              <div style={{ padding: 20, background: "rgba(37,99,235,0.05)", borderRadius: 12, border: "1px solid rgba(37,99,235,0.2)" }}>
                <div style={{ fontSize: 11, color: "var(--accent-primary)", fontWeight: 800, letterSpacing: ".05em", marginBottom: 16 }}>TAGGED OFFICIALS</div>
                <div className="acc-grid">
                  {[
                    { role: "MLA", name: selReport.mla_name, sub: selReport.constituency, party: selReport.mla_party },
                    { role: "MP",  name: selReport.mp_name,  sub: selReport.lok_sabha_seat ? `${selReport.lok_sabha_seat} Lok Sabha` : "", party: selReport.mp_party },
                  ].map(p => (
                    <div key={p.role} style={{ background: "var(--bg-surface)", padding: 16, borderRadius: 8, boxShadow: "var(--shadow-sm)" }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 4 }}>{p.role}</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>{p.sub}</div>
                      {p.party && <Badge party={p.party} />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
                {/* Upvote in modal */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <button
                    className={`upvote-btn ${votedReports.has(selReport.id) ? "voted" : ""}`}
                    onClick={() => handleUpvote(selReport.id)}
                    style={{ fontSize: 14 }}
                  >
                    <span className="eye">👀</span>
                    {votedReports.has(selReport.id) ? "You flagged this" : "I see this too"} · {selReport.upvotes || 0}
                  </button>
                  {(selReport.upvotes || 0) >= 10 && <span className="priority-badge">🔥 HIGH PRIORITY</span>}
                </div>

                {/* Status control */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Status:</span>
                    <select
                      value={selReport.status || "open"}
                      onChange={async e => {
                        const newStatus = e.target.value;
                        const ok = await db.updateReportStatus(selReport.id, newStatus);
                        if (ok) { setSelReport({ ...selReport, status: newStatus }); setReports(prev => prev.map(r => r.id === selReport.id ? { ...r, status: newStatus } : r)); }
                        else alert("Failed to update status");
                      }}
                      style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border-color)", fontSize: 13, fontWeight: 700, color: getStatusColor(selReport.status), background: "var(--bg-surface)", cursor: "pointer" }}
                    >
                      <option value="open">OPEN</option>
                      <option value="working on it">WORKING ON IT</option>
                      <option value="resolved">RESOLVED</option>
                      <option value="ignored">IGNORED</option>
                    </select>
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Reported <TimeAgo date={selReport.created_at} /></span>
                </div>

                {/* Share */}
                <button
                  onClick={() => {
                    const text = `🗑️ Garbage dump reported in ${selReport.constituency}, ${selReport.district}. MLA ${selReport.mla_name} & MP ${selReport.mp_name} have been tagged. Check it out on Urban Patch.`;
                    if (navigator.share) { navigator.share({ title: "Urban Patch Report", text, url: window.location.href }).catch(e => console.error(e)); }
                    else { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, "_blank"); }
                  }}
                  className="btn-primary"
                  style={{ width: "100%", padding: "10px", fontSize: 14, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  Share this Report
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
