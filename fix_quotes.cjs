const fs = require('fs');
let code = fs.readFileSync('src/components/UrbanPatch.jsx', 'utf8');

// The string in code currently is probably "\${q.text}"
code = code.replace(/\"\\\${q\.text}\"/g, '"{q.text}"');
code = code.replace(/— \\\${q\.author}/g, '— {q.author}');

// Wait, let's just make it foolproof
code = code.replace(/<p className="quote-text">"\$\{(.*?)\}"<\/p>/g, '<p className="quote-text">"{$1}"</p>');
code = code.replace(/<p className="quote-author">— \$\{(.*?)\}<\/p>/g, '<p className="quote-author">— {$1}</p>');

fs.writeFileSync('src/components/UrbanPatch.jsx', code);
console.log('Fixed quotes');
