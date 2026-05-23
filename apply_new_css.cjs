const fs = require('fs');
let css = fs.readFileSync('src/styles/style.css', 'utf8');

css += `
/* Premium Tab Backgrounds */
.premium-bg-container {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background-color: var(--bg-main);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  margin-top: 16px;
}

.premium-bg-image {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}

.premium-content {
  position: relative;
  z-index: 10;
  padding: 32px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  min-height: calc(100vh - 200px);
}

.community-wrapper .premium-bg-image { background-image: url('/bg_community.png'); opacity: 0.25; }
.feed-wrapper .premium-bg-image { background-image: url('/bg_feed.png'); opacity: 0.25; }

/* Quote Carousel Upgrade */
.quote-carousel {
  position: relative;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  overflow: hidden;
  margin-bottom: 32px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  background: #fff;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quote-carousel-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('/bg_quote.png');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 0;
}

.quote-carousel-content {
  position: relative;
  z-index: 10;
  width: 100%;
}

.quote-slide {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.quote-slide.active {
  opacity: 1;
  pointer-events: auto;
}

.quote-text {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0 0 24px 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(255,255,255,0.8);
}

.quote-author {
  font-size: 15px;
  color: var(--accent-primary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  background: rgba(255, 255, 255, 0.7);
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
}

@media (min-width: 1024px) {
  .quote-text { font-size: 34px; }
  .quote-carousel { min-height: 300px; }
}

/* Map specific tweaks */
.map-badge {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  white-space: nowrap;
}

.map-reset-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: #fff;
  border: 1px solid var(--border-color);
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-primary);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  z-index: 1000;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
`;

fs.writeFileSync('src/styles/style.css', css);
console.log('CSS updated successfully');
