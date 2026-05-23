const fs = require('fs');
let code = fs.readFileSync('src/components/UrbanPatch.jsx', 'utf8');

// 1. Rewrite AssamMap
const oldMapStart = code.indexOf('function AssamMap({ reports }) {');
const oldMapEnd = code.indexOf('// ── Report Card ───────────────────────────────────────────────────────────');
const newAssamMap = `function AssamMap({ reports }) {
  const gps = reports.filter(r => r.lat && r.lng);
  
  return (
    <div style={{ width: "100%", height: "450px", borderRadius: 16, overflow: "hidden", position: "relative", boxShadow: "var(--shadow-sm)", zIndex: 1 }}>
      <div className="map-badge">
        <span style={{ fontSize: 16 }}>📍</span> Live Reports: Currently tracking Assam only
      </div>
      
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
            <Marker key={r.id || i} position={[parseFloat(r.lat), parseFloat(r.lng)]} icon={customIcon}>
              <Popup>
                <div style={{ padding: "4px", minWidth: 150 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 14 }}>{w?.label || "Waste"}</h4>
                  <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#666" }}>{r.district}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <MapResetControl />
      </MapContainer>
    </div>
  );
}

function MapResetControl() {
  const map = useMap();
  return (
    <button className="map-reset-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); map.flyTo([26.2006, 92.9376], 7); }}>
      <span>↺</span> Reset View
    </button>
  );
}

`;

code = code.substring(0, oldMapStart) + newAssamMap + code.substring(oldMapEnd);

// 2. Rewrite QuoteCarousel
const carouselStart = code.indexOf('const QUOTES = [');
const carouselEnd = code.indexOf('export default function UrbanPatch() {');

const newCarousel = `const QUOTES = [
  { text: "Cleanliness is not just a choice, it is a civic duty.", author: "Community Initiative" },
  { text: "Every report builds a permanent public record. Silence is no longer an option.", author: "Urban Patch" },
  { text: "Small actions today lead to a sustainable city tomorrow.", author: "Environmental Vision" },
  { text: "Your city. Your voice. We hold them accountable, together.", author: "Urban Patch Motto" },
  { text: "Progress is impossible without change, and those who cannot change their minds cannot change anything.", author: "George Bernard Shaw" },
  { text: "The earth is what we all have in common. Let's protect it.", author: "Wendell Berry" }
];

function QuoteCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(int);
  }, []);
  
  return (
    <div className="quote-carousel animate-in">
      <div className="quote-carousel-bg"></div>
      <div className="quote-carousel-content">
        {QUOTES.map((q, i) => (
          <div key={i} className={\`quote-slide \${i === idx ? 'active' : ''}\`}>
            <p className="quote-text">"\${q.text}"</p>
            <p className="quote-author">— \${q.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

`;

code = code.substring(0, carouselStart) + newCarousel + code.substring(carouselEnd);

// 3. Apply Premium Backgrounds to Feed Tab
code = code.replace(/\{view === "feed" && \(/, '{view === "feed" && (\n            <div className="premium-bg-container feed-wrapper">\n              <div className="premium-bg-image"></div>\n              <div className="premium-content animate-in">');
code = code.replace(/<div className="dash-grid" style=\{\{ gridTemplateColumns: "repeat\(auto-fill, minmax\(340px, 1fr\)\)" \}\}>\s*\{sortedFeed\.map[\s\S]*?<\/div>/, match => match + '\n              </div>\n            </div>');

// 4. Apply Premium Backgrounds to Mine Tab
code = code.replace(/\{view === "mine" && \(/, '{view === "mine" && (\n            <div className="premium-bg-container feed-wrapper">\n              <div className="premium-bg-image"></div>\n              <div className="premium-content animate-in">');
code = code.replace(/<div className="dash-grid" style=\{\{ gridTemplateColumns: "repeat\(auto-fill, minmax\(340px, 1fr\)\)" \}\}>\s*\{myReports\.map[\s\S]*?<\/div>/, match => match + '\n              </div>\n            </div>');

// 5. Apply Premium Backgrounds to Community Tab
code = code.replace(/\{view === "community" && \(/, '{view === "community" && (\n            <div className="premium-bg-container community-wrapper">\n              <div className="premium-bg-image"></div>\n              <div className="premium-content animate-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 250px)" }}>');
code = code.replace(/<div className="chat-window animate-in" style=\{\{ position: "relative", zIndex: 10 \}\}>/, '<div className="chat-window" style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column" }}>');
code = code.replace(/<div className="community-bg-pan"><\/div>/, '');
// Wrap the end of community view
const commEndRegex = /<button className="btn-primary" onClick=\{sendMsg\} disabled=\{!newMsg\.trim\(\)\}>\s*Send\s*<\/button>\s*<\/div>\s*<\/div>/;
code = code.replace(commEndRegex, match => match + '\n              </div>\n            </div>');

fs.writeFileSync('src/components/UrbanPatch.jsx', code);
console.log('Rewritten UrbanPatch JSX logic!');
