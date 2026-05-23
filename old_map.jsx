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

  const districtCounts = {};
  reports.forEach(r => { districtCounts[r.district] = (districtCounts[r.district] || 0) + 1; });
  const maxCount = Math.max(1, ...Object.values(districtCounts));

  return (
    <div ref={containerRef} style={{ width: "100%", aspectRatio: "2/1", background: "linear-gradient(135deg,#e8f4fd,#f0f9f0)", borderRadius: 12, overflow: "hidden", cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default", userSelect: "none", position: "relative" }} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
      <svg viewBox="0 0 100 50" style={{ width: "100%", height: "100%", transform: `scale(${zoom}) translate(${pan.x/10}px,${pan.y/10}px)`, transformOrigin: "center center", transition: dragging ? "none" : "transform 0.1s" }} preserveAspectRatio="xMidYMid meet">
        <rect width={100} height={50} fill="#dbeafe" opacity={0.3} rx={2}/>
        <text x={50} y={25} textAnchor="middle" fontSize={6} fill="#94a3b8" fontWeight={700} opacity={0.5}>ASSAM</text>
        <image href={ASSAM_MAP_SRC} width="100" height="50" opacity="0.3" preserveAspectRatio="none"/>
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

