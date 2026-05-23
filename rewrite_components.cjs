const fs = require('fs');
let code = fs.readFileSync('src/components/UrbanPatch.jsx', 'utf8');

// 1. Add Popup to react-leaflet imports
code = code.replace(/import \{ MapContainer, TileLayer, Marker, useMap, useMapEvents \} from "react-leaflet";/, 'import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from "react-leaflet";');

// 2. Fix active class for Mine
code = code.replace(/className=\{`nav-item \$\{view === n\.id \? "active" : ""\} \$\{n\.id === "mine" \? "my-reports-active" : ""\}`\}/g, 'className={`nav-item ${view === n.id ? "active " + (n.id === "mine" ? "my-reports-active" : "") : ""}`}');

// 3. Rewrite AssamMap safely using substring
const mapStartIdx = code.indexOf('function AssamMap({ reports }) {');
const mapEndIdx = code.indexOf('function ShameBoard({ reports }) {');

const newAssamMap = `function AssamMap({ reports }) {
  const gps = reports.filter(r => r.lat && r.lng);
  
  return (
    <div style={{ width: "100%", height: "450px", borderRadius: 16, overflow: "hidden", position: "relative", boxShadow: "var(--shadow-sm)", zIndex: 1 }}>
      <MapContainer center={[26.2006, 92.9376]} zoom={7} style={{ height: "100%", width: "100%", zIndex: 1 }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        {gps.map((r, i) => {
          const w = WASTE.find(t => t.id === r.waste_type);
          const col = w ? w.color : "#EF4444";
          const iconHtml = \`<div style="background-color: \${col}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"></div>\`;
          const customIcon = L.divIcon({ html: iconHtml, className: "custom-leaflet-icon", iconSize: [16, 16], iconAnchor: [8, 8] });
          return (
            <Marker key={r.id || i} position={[r.lat, r.lng]} icon={customIcon}>
              <Popup>
                <div style={{ padding: "4px", minWidth: 150 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 14 }}>{w?.label || "Waste"}</h4>
                  <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#666" }}>{r.district}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

// ── Shame Board ────────────────────────────────────────────────────────────
`;

code = code.substring(0, mapStartIdx) + newAssamMap + code.substring(mapEndIdx);

// 4. Rewrite PieChart safely
const pieStartIdx = code.indexOf('function PieChart({ reports }) {');
const pieEndIdx = code.indexOf('export default function UrbanPatch() {');

const newPieChart = `function PieChart({ reports }) {
  const counts = {};
  reports.forEach(r => { counts[r.waste_type] = (counts[r.waste_type] || 0) + 1; });
  const total = reports.length || 1;
  
  let cum = 0;
  const segments = WASTE.slice(0,6).map(w => {
    const p = ((counts[w.id] || 0) / total);
    const startAngle = cum * 360;
    cum += p;
    const endAngle = cum * 360;
    return { ...w, startAngle, endAngle, pct: p * 100, count: counts[w.id] || 0 };
  }).filter(s => s.count > 0);

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="card hoverable animate-in" style={{ marginBottom: 24, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 32 }}>
      <div style={{ flex: 1, minWidth: 250 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.01em" }}>📊 Waste Type Breakdown</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>Distribution of reported issues across categories.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {segments.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, fontWeight: 600 }}>
              <span style={{ width: 14, height: 14, borderRadius: "4px", background: s.color, display: "inline-block", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
              <span style={{ flex: 1 }}>{s.label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 800 }}>{s.count} <span style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: 12 }}>({Math.round(s.pct)}%)</span></span>
            </div>
          ))}
          {segments.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No data available.</p>}
        </div>
      </div>
      
      {segments.length > 0 && (
        <div style={{ width: 220, height: 220, position: "relative" }}>
          <svg viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%", overflow: "visible" }}>
            {segments.map(s => {
              const start = getCoordinatesForPercent(s.startAngle / 360);
              const end = getCoordinatesForPercent(s.endAngle / 360);
              const largeArcFlag = s.pct > 50 ? 1 : 0;
              const pathData = [
                \`M \${start[0]} \${start[1]}\`,
                \`A 1 1 0 \${largeArcFlag} 1 \${end[0]} \${end[1]}\`,
                \`L 0 0\`,
              ].join(' ');
              if (s.pct === 100) return <circle key={s.id} cx="0" cy="0" r="1" fill={s.color} />;
              return (
                <path key={s.id} d={pathData} fill={s.color} className="pie-slice" style={{ transition: "all 0.3s ease", cursor: "pointer", stroke: "#fff", strokeWidth: 0.02 }} />
              );
            })}
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 120, height: 120, background: "var(--bg-surface)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>{total}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase" }}>Total</span>
          </div>
        </div>
      )}
    </div>
  );
}

const QUOTES = [
  { text: "Cleanliness is not just a choice, it is a civic duty.", author: "Community Initiative" },
  { text: "Every report builds a permanent public record. Silence is no longer an option.", author: "Urban Patch" },
  { text: "Small actions today lead to a sustainable city tomorrow.", author: "Environmental Vision" },
  { text: "Your city. Your voice. We hold them accountable, together.", author: "Urban Patch Motto" }
];

function QuoteCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(int);
  }, []);
  
  return (
    <div className="quote-carousel animate-in">
      {QUOTES.map((q, i) => (
        <div key={i} style={{ position: i === idx ? "relative" : "absolute", opacity: i === idx ? 1 : 0, transition: "opacity 1s ease", top: i === idx ? 0 : 0, left: 0, width: "100%", height: "100%" }}>
          <p className="quote-text">"\${q.text}"</p>
          <p className="quote-author">— \${q.author}</p>
        </div>
      ))}
    </div>
  );
}

`;

code = code.substring(0, pieStartIdx) + newPieChart + code.substring(pieEndIdx);

// Insert QuoteCarousel into dashboard view
code = code.replace(/<PieChart reports=\{reports\} \/>/, '<QuoteCarousel />\n            <PieChart reports={reports} />');

fs.writeFileSync('src/components/UrbanPatch.jsx', code);
console.log('JSX safely updated!');
