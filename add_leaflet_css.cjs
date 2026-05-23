const fs = require('fs');
let code = fs.readFileSync('src/main.jsx', 'utf8');
if (!code.includes('leaflet.css')) {
  code = 'import "leaflet/dist/leaflet.css";\n' + code;
  fs.writeFileSync('src/main.jsx', code);
  console.log('Added leaflet.css');
}
