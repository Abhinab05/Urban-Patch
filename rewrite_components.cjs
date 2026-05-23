const fs = require('fs');
let code = fs.readFileSync('src/components/UrbanPatch.jsx', 'utf8');

// Fix Map coords and add Assam badge/reset button
code = code.replace(/position=\{\[r\.lat, r\.lng\]\}/, 'position={[parseFloat(r.lat), parseFloat(r.lng)]}');

const mapContainerStr = '<MapContainer center={[26.2006, 92.9376]} zoom={7} style={{ height: "100%", width: "100%", zIndex: 1 }} scrollWheelZoom={false}>';
const mapContainerWithBadge = `      <div className="map-badge">
        <span style={{ fontSize: 16 }}>📍</span> Live Reports: Currently tracking Assam only
      </div>
` + mapContainerStr;
code = code.replace(mapContainerStr, mapContainerWithBadge);

// Add MapResetControl component
const mapResetComp = `
function MapResetControl() {
  const map = useMap();
  return (
    <button className="map-reset-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); map.flyTo([26.2006, 92.9376], 7); }}>
      <span>↺</span> Reset View
    </button>
  );
}
`;
code = code.replace('function PieChart({ reports }) {', mapResetComp + '\nfunction PieChart({ reports }) {');

// Add the MapResetControl inside the MapContainer
code = code.replace('</MapContainer>', '  <MapResetControl />\n      </MapContainer>');

// Fix QuoteCarousel
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

fs.writeFileSync('src/components/UrbanPatch.jsx', code);
console.log('Fixed Map and Carousel successfully');
