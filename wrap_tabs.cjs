const fs = require('fs');
let code = fs.readFileSync('src/components/UrbanPatch.jsx', 'utf8');

// Wrap Feed
code = code.replace(/\{view === "feed" && \(\n\s*<div className="slide-in">/, '{view === "feed" && (\n          <div className="premium-bg-container feed-wrapper slide-in">\n            <div className="premium-bg-image"></div>\n            <div className="premium-content">');
code = code.replace(/\{sortedFeed\.map\(\(r, i\) => \([\s\S]*?<\/div>\n\s*\)\)}\n\s*<\/div>\n\s*\)}/, match => match + '\n            </div>');

// Wrap Mine
code = code.replace(/\{view === "mine" && \(\n\s*<div className="slide-in">/, '{view === "mine" && (\n          <div className="premium-bg-container feed-wrapper slide-in">\n            <div className="premium-bg-image"></div>\n            <div className="premium-content">');
code = code.replace(/\{myReports\.map\(r => <ReportCard key=\{r\.id\} r=\{r\} expanded onClick=\{.*?\} onUpvote=\{.*?\} voted=\{.*?\} \/>\)}\n\s*<\/div>\n\s*\)}/, match => match + '\n            </div>');

// Wrap Community
code = code.replace(/\{view === "community" && \(\n\s*<div className="slide-in" style=\{\{ maxWidth: 1000, margin: "0 auto" \}\}>/, '{view === "community" && (\n          <div className="premium-bg-container community-wrapper slide-in">\n            <div className="premium-bg-image"></div>\n            <div className="premium-content" style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column" }}>');

code = code.replace(/<div className="community-bg-pan"><\/div>/, '');

code = code.replace(/<button className="btn-primary" onClick=\{sendMsg\} disabled=\{!newMsg\.trim\(\)\}>\s*Send\s*<\/button>\s*<\/div>\s*<\/div>\s*\)\)}/, match => match + '\n            </div>');


fs.writeFileSync('src/components/UrbanPatch.jsx', code);
console.log('Tabs wrapped successfully!');
