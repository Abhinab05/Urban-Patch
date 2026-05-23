const fs = require('fs');
let css = fs.readFileSync('src/styles/style.css', 'utf8');

// 1. Darken bg-main
css = css.replace(/--bg-main: #F4F7F9;/, '--bg-main: #E6EEF4;');

// 2. Add gradient to sidebar
css = css.replace(/\.sidebar \{[\s\S]*?\}/, match => {
  return match.replace(/background: var\(--bg-surface\);/, 'background: linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%);\n  border-right: 1px solid #BAE6FD;');
});

// 3. Re-add community-bg-pan animation
const commBgPan = `
/* Community Original Background */
.community-bg-pan {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0f2fe, #dcfce7, #f3e8ff);
  background-size: 400% 400%;
  animation: panBg 15s ease infinite;
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
}
@keyframes panBg {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;
if (!css.includes('.community-bg-pan {')) {
  css += commBgPan;
}

// 4. Update community tab wrappers
css = css.replace(/\.community-wrapper \.premium-bg-image \{ background-image: url\('\/bg_community\.png'\); opacity: 0\.25; \}/, '/* .community-wrapper .premium-bg-image { background-image: url(\'/bg_community.png\'); opacity: 0.25; } */');

// 5. Stylize Feed cards
css += `
/* Stylish Feed Cards */
.stylish-card {
  background: var(--bg-surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
}
.stylish-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.1);
  border-color: var(--accent-primary);
}
.stylish-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  opacity: 0;
  transition: opacity 0.3s ease;
}
.stylish-card:hover::before {
  opacity: 1;
}
`;

fs.writeFileSync('src/styles/style.css', css);
console.log('CSS upgraded successfully');
