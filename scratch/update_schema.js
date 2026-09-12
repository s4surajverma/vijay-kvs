const fs = require('fs');

// Read seed-data.js content
const seedCode = fs.readFileSync('js/seed-data.js', 'utf8');
const match = seedCode.match(/const DEFAULT_SEED_DATA = (\{[\s\S]*?\});\s*(?:if|$)/);
if (!match) {
  console.error('Could not parse DEFAULT_SEED_DATA');
  process.exit(1);
}

// Evaluate seed data safely
const seedData = eval('(' + match[1] + ')');
const jsonPretty = JSON.stringify(seedData, null, 2);

let schema = fs.readFileSync('supabase_schema.sql', 'utf8');

// Replace $seed$ ... $seed$
const regex = /\$seed\$[\s\S]*?\$seed\$/;
schema = schema.replace(regex, `$seed$\n${jsonPretty}\n    $seed$`);

// Also update sample inquiry
schema = schema.replace(
  /'Admissions Helpdesk'[\s\S]*?'resolved'/,
  `'Dr. Anita Sharma',
    'anita.sharma.edu@gmail.com',
    '+91 98765 43210',
    'Collaboration on Toy-Based Pedagogy Workshop',
    'Respected Vijay Sir, We would like to invite you as Key Resource Person for our upcoming regional FLN & Toy Pedagogy workshop.',
    'new'`
);

// Update success notice
schema = schema.replace(
  "SELECT 'Supabase schema successfully created and seeded with official school data!'",
  "SELECT 'Supabase schema successfully created and seeded with official vijaysirkvs.com portfolio data!'"
);

fs.writeFileSync('supabase_schema.sql', schema, 'utf8');
console.log('Successfully updated supabase_schema.sql with clean portfolio seed data!');
