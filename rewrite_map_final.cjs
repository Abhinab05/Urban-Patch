const fs = require('fs');
let code = fs.readFileSync('src/components/UrbanPatch.jsx', 'utf8');

const newAssamMap = `
function AssamMap({ reports }) {
  const LON_MIN = 89.68, LON_MAX = 96.01;
  const LAT_MIN = 24.13, LAT_MAX = 27.96;
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

  return (
    <div className="card" style={{ padding: 24, background: "var(--bg-main)", borderRadius: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, color: "var(--text-primary)", margin: 0 }}>
          <span style={{ fontSize: 20 }}>🗺️</span> Live Report Map
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent-primary)", fontWeight: 600 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-primary)", animation: "pulse 2s infinite" }}></div>
          {reports.length} reports
        </div>
      </div>

      <div ref={containerRef} style={{ width: "100%", aspectRatio: "4/3", background: "linear-gradient(135deg,#e8f4fd,#f0f9f0)", borderRadius: 16, overflow: "hidden", cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default", userSelect: "none", position: "relative", border: "1px solid var(--border-color)" }} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
        
        {/* Zoom Controls Overlay */}
        <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 10 }}>
          <button onClick={() => setZoom(z => clamp(z + 0.5))} style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", border: "1px solid var(--border-color)", cursor: "pointer", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>+</button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", border: "1px solid var(--border-color)", cursor: "pointer", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>-</button>
        </div>

        {/* Floating Badge Overlay */}
        <div style={{ position: "absolute", top: 16, right: 16, background: "var(--accent-primary)", color: "#fff", padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 10 }}>
          {reports.length} reports
        </div>

        {/* Bottom Instruction Pill */}
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "6px 16px", borderRadius: 20, fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, boxShadow: "var(--shadow-sm)", pointerEvents: "none", zIndex: 10 }}>
          scroll or + to zoom • pinch on mobile
        </div>

        <svg viewBox="0 0 100 50" style={{ width: "100%", height: "100%", transform: \`scale(\${zoom}) translate(\${pan.x/10}px,\${pan.y/10}px)\`, transformOrigin: "center center", transition: dragging ? "none" : "transform 0.1s" }} preserveAspectRatio="xMidYMid meet">
          <image href={ASSAM_MAP_SRC} width="100" height="50" opacity="0.5" preserveAspectRatio="none" style={{ filter: "sepia(1) hue-rotate(180deg) saturate(0.5)" }} />
          {gps.map((r, i) => {
            const cx = tx(parseFloat(r.lng)), cy = ty(parseFloat(r.lat));
            const w = WASTE.find(t => t.id === r.waste_type), col = w?.color || "#9CA3AF";
            return (
              <g key={\`g\${i}\`} className="pin-g" style={{ animationDelay: \`\${i * 0.05}s\` }}>
                <circle cx={cx} cy={cy - 2.8} r="2.5" fill={col} stroke="#fff" strokeWidth="0.6" opacity={0.9} style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))" }}/>
                <line x1={cx} y1={cy - 0.6} x2={cx} y2={cy} stroke={col} strokeWidth="1" strokeLinecap="round"/>
              </g>
            );
          })}
          {nogps.map((r, i) => {
            const w = WASTE.find(t => t.id === r.waste_type), city = CITIES[i % CITIES.length], cx = tx(city[0]), cy = ty(city[1]), col = w?.color || "#9CA3AF";
            return (
              <g key={\`n\${i}\`} className="pin-g" style={{ animationDelay: \`\${i * 0.1}s\`, opacity: 0.75 }}>
                <circle cx={cx} cy={cy - 2.8} r="2" fill={col} stroke="#fff" strokeWidth="0.5" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }}/>
                <line x1={cx} y1={cy - 1} x2={cx} y2={cy} stroke={col} strokeWidth="0.8" strokeLinecap="round"/>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 24, padding: "0 8px" }}>
        {WASTE.map(w => (
          <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: w.color }}></div>
            {w.label}
          </div>
        ))}
      </div>
    </div>
  );
}
`;

const mapStart = code.indexOf('function AssamMap({ reports }) {');
const mapEnd = code.indexOf('function ReportCard');
if (mapStart > -1 && mapEnd > -1) {
  code = code.substring(0, mapStart) + newAssamMap + '\\n\\n' + code.substring(mapEnd);
}

fs.writeFileSync('src/components/UrbanPatch.jsx', code);
console.log('Restored custom Map successfully');
