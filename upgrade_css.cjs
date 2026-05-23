const fs = require('fs');
let css = fs.readFileSync('src/styles/style.css', 'utf8');

css = css.replace(/max-width: 1200px;/, 'max-width: 1500px;');
css = css.replace(/--shadow-sm: [^;]+;/, '--shadow-sm: 0 4px 20px rgba(0, 0, 0, 0.03);');
css = css.replace(/--shadow-md: [^;]+;/, '--shadow-md: 0 8px 30px rgba(0, 0, 0, 0.06);');
css = css.replace(/--shadow-lg: [^;]+;/, '--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.08);');
css = css.replace(/--border-color: #E2E8F0;/, '--border-color: #F1F5F9;');

css += `
/* Quote Carousel */
.quote-carousel {
  position: relative;
  background: linear-gradient(135deg, #f8fafc, #eff6ff);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  overflow: hidden;
  margin-bottom: 32px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}
.quote-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0;
  letter-spacing: -0.01em;
  font-style: italic;
}
.quote-author {
  margin-top: 16px;
  font-size: 14px;
  color: var(--accent-primary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.leaflet-container {
  border-radius: 12px;
  z-index: 10;
}
@media (max-width: 767px) {
  .chat-input-area {
    padding: 12px;
    flex-direction: column;
  }
  .chat-input-area input {
    width: 100%;
    margin-bottom: 8px !important;
  }
  .chat-input-area button {
    width: 100%;
  }
}
.card {
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
}
.stat-card {
  align-items: center;
  text-align: center;
  padding: 32px 24px;
}
`;
fs.writeFileSync('src/styles/style.css', css);
