const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Find all id attributes
const ids = [...html.matchAll(/id=["']([^"']+)["']/g)].map(m => m[1]);
console.log('Total IDs found in index.html:', ids.length);

// Find all hrefs
const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
console.log('Distinct Hrefs in index.html:');
console.log([...new Set(hrefs)]);

// Check for old school terms
const oldWords = ['principal', 'palishah', 'gurpal', 'staff', 'faculty', 'admission', 'cbse', 'mandatory', 'affiliation', 'alumni', 'tc'];
for (const w of oldWords) {
  const matches = [...html.matchAll(new RegExp(w, 'gi'))];
  if (matches.length > 0) {
    console.log(`Found '${w}': ${matches.length} times in index.html`);
    matches.forEach(m => {
      const idx = m.index;
      const snippet = html.substring(Math.max(0, idx - 40), Math.min(html.length, idx + 60)).replace(/\n/g, ' ');
      console.log(`   Snippet: "...${snippet}..."`);
    });
  }
}

// Check JS files
const jsFiles = ['js/app.js', 'js/seed-data.js', 'js/db.js', 'js/auth.js', 'js/config.js'];
jsFiles.forEach(f => {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, 'utf8');
    for (const w of oldWords) {
      const matches = [...code.matchAll(new RegExp(w, 'gi'))];
      if (matches.length > 0) {
        console.log(`Found '${w}': ${matches.length} times in ${f}`);
        matches.slice(0, 3).forEach(m => {
          const idx = m.index;
          const snippet = code.substring(Math.max(0, idx - 40), Math.min(code.length, idx + 60)).replace(/\n/g, ' ');
          console.log(`   Snippet: "...${snippet}..."`);
        });
      }
    }
  }
});
