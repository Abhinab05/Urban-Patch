const fs = require('fs');
let sql = fs.readFileSync('output.sql', 'utf8');

// Replace the normal INSERT with an INSERT ... ON CONFLICT DO UPDATE
sql = sql.replace(';', `
ON CONFLICT (constituency) DO UPDATE 
SET lok_sabha_seat = EXCLUDED.lok_sabha_seat,
    name = EXCLUDED.name,
    party = EXCLUDED.party,
    district = EXCLUDED.district;
`);

fs.writeFileSync('output_upsert.sql', sql);
