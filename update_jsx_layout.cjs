const fs = require('fs');
let code = fs.readFileSync('src/components/UrbanPatch.jsx', 'utf8');

code = code.replace(
  '<div className="premium-content" style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column" }}>',
  '<div className="community-bg-pan"></div>\n            <div className="premium-content" style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column" }}>'
);

code = code.replace(
  '<div className="report-item" onClick={onClick}>',
  '<div className="report-item stylish-card" onClick={onClick}>'
);

fs.writeFileSync('src/components/UrbanPatch.jsx', code);
console.log('JSX layout updated');
