const fs = require('fs');
const cp = require('child_process');

try {
  const out = cp.execSync('git show a951c38:src/components/UrbanPatch.jsx').toString();
  // We know it starts with "data:image/png;base64,
  // We can just match until the next newline or a specific pattern.
  const match = out.match(/(const ASSAM_MAP_SRC = ["`']data:image\/png;base64,[^"`']+["`'];)/);
  if (match) {
    let code = fs.readFileSync('src/components/UrbanPatch.jsx', 'utf-8');
    // The broken line in the current file is:
    // const ASSAM_MAP_SRC = ""data:image/png";
    code = code.replace(/const ASSAM_MAP_SRC = [^\n]+/, match[1]);
    fs.writeFileSync('src/components/UrbanPatch.jsx', code);
    console.log("Map successfully fixed.");
  } else {
    console.log("Map string not found in git.");
  }
} catch (e) {
  console.log(e);
}
