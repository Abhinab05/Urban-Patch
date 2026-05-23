const mlas = `
('Sabharam Basumatary', 'BPF', 'Gossaigaon', 'Kokrajhar'),
('Rabiram Narzary', 'BPF', 'Dotma (ST)', 'Kokrajhar'),
('Sewli Mohilary', 'BPF', 'Kokrajhar (ST)', 'Kokrajhar'),
('Rupam Chandra Roy', 'BPF', 'Baokhungri', 'Kokrajhar'),
('Md Ashraful Islam Sheikh', 'INC', 'Parbatjhora', 'Kokrajhar'),
('Ashwini Roy Sarkar', 'BJP', 'Golakganj', 'Dhubri'),
('Abdus Sobahan Ali Sarkar', 'INC', 'Gauripur', 'Dhubri'),
('Baby Begum', 'INC', 'Dhubri', 'Dhubri'),
('Wazed Ali Choudhury', 'INC', 'Birsing Jarua', 'Dhubri'),
('Jibesh Rai', 'AGP', 'Bilasipara', 'Dhubri'),
('Mohibur Rohman', 'INC', 'Mankachar', 'South Salmara-Mankachar'),
('Aftab Uddin Mollah', 'INC', 'Jaleshwar', 'Goalpara'),
('Pabitra Rabha', 'BJP', 'Goalpara West (ST)', 'Goalpara'),
('Abul Kalam Rasheed Alam', 'INC', 'Goalpara East', 'Goalpara'),
('Tankeswar Rabha', 'BJP', 'Dudhnai (ST)', 'Goalpara'),
('Bhupen Roy', 'BJP', 'Abhayapuri', 'Bongaigaon'),
('Md. Nurul Islam', 'INC', 'Srijangram', 'Bongaigaon'),
('Diptimayee Choudhury', 'AGP', 'Bongaigaon', 'Bongaigaon'),
('Paniram Brahma', 'BPF', 'Sidli–Chirang (ST)', 'Chirang'),
('Arup Kumar Dey', 'BJP', 'Bijni', 'Chirang'),
('Ranjeet Kumar Dass', 'BJP', 'Bhowanipur–Sorbhog', 'Bajali'),
('Sherman Ali Ahmed', 'AITC', 'Mandia', 'Barpeta'),
('Abdur Rahim Ahmed', 'INC', 'Chenga', 'Barpeta'),
('Dipak Kumar Das', 'AGP', 'Barpeta (SC)', 'Barpeta'),
('Jakir Hussain Sikdar', 'INC', 'Pakabetbari', 'Barpeta'),
('Dharmeswar Roy', 'AGP', 'Bajali', 'Bajali'),
('Rekibuddin Ahmed', 'INC', 'Chamaria', 'Kamrup'),
('Raju Mesh', 'BJP', 'Boko–Chaygaon (ST)', 'Kamrup'),
('Himangshu Shekhar Baishya', 'BJP', 'Palasbari', 'Kamrup'),
('Prakash Chandra Das', 'AGP', 'Hajo–Sualkuchi (SC)', 'Kamrup'),
('Bhabesh Kalita', 'BJP', 'Rangiya', 'Kamrup'),
('Diganta Kalita', 'BJP', 'Kamalpur', 'Kamrup'),
('Pradyut Bordoloi', 'BJP', 'Dispur', 'Kamrup Metropolitan'),
('Tapan Das', 'AGP', 'Dimoria (SC)', 'Kamrup Metropolitan'),
('Diplu Ranjan Sarmah', 'BJP', 'New Guwahati', 'Kamrup Metropolitan'),
('Vijay Kumar Gupta', 'BJP', 'Guwahati Central', 'Kamrup Metropolitan'),
('Himanta Biswa Sarma', 'BJP', 'Jalukbari', 'Kamrup Metropolitan'),
('Narayan Deka', 'BJP', 'Barkhetri', 'Nalbari'),
('Jayanta Malla Baruah', 'BJP', 'Nalbari', 'Nalbari'),
('Chandra Mohan Patowary', 'BJP', 'Tihu', 'Nalbari'),
('Thaneswar Basumatary', 'BPF', 'Manas', 'Baksa'),
('Maneswar Brahma', 'BPF', 'Baksa (ST)', 'Baksa'),
('Biswajit Daimary', 'BJP', 'Tamulpur (ST)', 'Tamulpur'),
('Victor Kumar Das', 'BJP', 'Goreshwar', 'Tamulpur'),
('Maheswar Baro', 'BPF', 'Bhergaon', 'Udalguri'),
('Rihon Daimary', 'BPF', 'Udalguri (ST)', 'Udalguri'),
('Charan Boro', 'BPF', 'Majbat', 'Udalguri'),
('Bikan Chandra Deka', 'BJP', 'Tangla', 'Udalguri'),
('Paramananda Rajbongshi', 'BJP', 'Sipajhar', 'Darrang'),
('Nilima Devi', 'BJP', 'Mangaldai', 'Darrang'),
('Mazibur Rahman', 'AIUDF', 'Dalgaon', 'Darrang'),
('Pijush Hazarika', 'BJP', 'Jagiroad (SC)', 'Morigaon'),
('Asif Mohammad Nazar', 'INC', 'Laharighat', 'Morigaon'),
('Rama Kantha Dewri', 'BJP', 'Morigaon', 'Morigaon'),
('Mehboob Mukhtar', 'RD', 'Dhing', 'Nagaon'),
('Nurul Huda', 'INC', 'Rupohihat', 'Nagaon'),
('Keshab Mahanta', 'AGP', 'Kaliabor', 'Nagaon'),
('Tanzil Hussain', 'INC', 'Samaguri', 'Nagaon'),
('Jitu Goswami', 'BJP', 'Barhampur', 'Nagaon'),
('Rupak Sarmah', 'BJP', 'Nagaon–Batadraba', 'Nagaon'),
('Sashi Kanta Das', 'BJP', 'Raha (SC)', 'Nagaon'),
('Mohammed Badruddin Ajmal', 'AIUDF', 'Binnakandi', 'Hojai'),
('Shiladitya Dev', 'BJP', 'Hojai', 'Hojai'),
('Sibu Misra', 'BJP', 'Lumding', 'Hojai'),
('Ashok Singhal', 'BJP', 'Dhekiajuli', 'Sonitpur'),
('Ritu Baran Sarmah', 'BJP', 'Barchalla', 'Sonitpur'),
('Prithiraj Rava', 'AGP', 'Tezpur', 'Sonitpur'),
('Krishna Kamal Tanti', 'BJP', 'Rangapara', 'Sonitpur'),
('Padma Hazarika', 'BJP', 'Nadaur', 'Sonitpur'),
('Pallab Lochan Das', 'BJP', 'Biswanath', 'Biswanath'),
('Munindra Das', 'BJP', 'Behali (SC)', 'Biswanath'),
('Utpal Borah', 'BJP', 'Gohpur', 'Biswanath'),
('Bhupen Kumar Borah', 'BJP', 'Bihpuria', 'Lakhimpur'),
('Rishiraj Hazarika', 'BJP', 'Rongonadi', 'Lakhimpur'),
('Joy Prakash Das', 'INC', 'Naoboicha (SC)', 'Lakhimpur'),
('Manab Deka', 'BJP', 'Lakhimpur', 'Lakhimpur'),
('Naba Kumar Doley', 'BJP', 'Dhakuakhana (ST)', 'Lakhimpur'),
('Ranoj Pegu', 'BJP', 'Dhemaji (ST)', 'Dhemaji'),
('Jiban Gogoi', 'BJP', 'Sissiborgaon', 'Dhemaji'),
('Bhubon Pegu', 'BJP', 'Jonai (ST)', 'Dhemaji'),
('Bolin Chetia', 'BJP', 'Sadiya', 'Tinsukia'),
('Rupesh Gowala', 'BJP', 'Doom Dooma', 'Tinsukia'),
('Bhaskar Sharma', 'BJP', 'Margherita', 'Tinsukia'),
('Suren Phukan', 'BJP', 'Digboi', 'Tinsukia'),
('Sanjoy Kishan', 'BJP', 'Makum', 'Tinsukia'),
('Pulok Gohain', 'BJP', 'Tinsukia', 'Tinsukia'),
('Binod Hazarika', 'BJP', 'Chabua-Lahowal', 'Dibrugarh'),
('Prasanta Phukan', 'BJP', 'Dibrugarh', 'Dibrugarh'),
('Chakradhar Gogoi', 'BJP', 'Khowang', 'Dibrugarh'),
('Rameswar Teli', 'BJP', 'Duliajan', 'Dibrugarh'),
('Bimal Borah', 'BJP', 'Tingkhong', 'Dibrugarh'),
('Taranga Gogoi', 'BJP', 'Naharkatia', 'Dibrugarh'),
('Bhuban Gam', 'BJP', 'Majuli (ST)', 'Majuli'),
('Hitendra Nath Goswami', 'BJP', 'Jorhat', 'Jorhat'),
('Rupjyoti Kurmi', 'BJP', 'Mariani', 'Jorhat'),
('Renupoma Rajkhowa', 'AGP', 'Teok', 'Jorhat'),
('Dhiraj Gowala', 'BJP', 'Titabor', 'Jorhat'),
('Ajanta Neog', 'BJP', 'Golaghat', 'Golaghat'),
('Mridul Kumar Dutta', 'BJP', 'Dergaon', 'Golaghat'),
('Mrinal Saikia', 'BJP', 'Khumtai', 'Golaghat'),
('Biswajit Phukan', 'BJP', 'Sarupathar', 'Golaghat'),
('Surjya Rongphar', 'BJP', 'Bokajan (ST)', 'Karbi Anglong'),
('Lunsing Teron', 'BJP', 'Howraghat (ST)', 'Karbi Anglong'),
('Niso Terangpi', 'BJP', 'Diphu (ST)', 'Karbi Anglong'),
('Tuliram Ronghang', 'BJP', 'Rongkhang (ST)', 'West Karbi Anglong'),
('Habbey Teron', 'BJP', 'Amri (ST)', 'West Karbi Anglong'),
('Rupali Langthasa', 'BJP', 'Haflong (ST)', 'Dima Hasao'),
('Kaushik Rai', 'BJP', 'Lakhipur', 'Cachar'),
('Rajdeep Goala', 'BJP', 'Udharbond', 'Cachar'),
('Kamalakhya Dey Purkayastha', 'BJP', 'Katigorah', 'Cachar'),
('Kishor Nath', 'BJP', 'Borkhola', 'Cachar'),
('Dr. Rajdeep Roy', 'BJP', 'Silchar', 'Cachar'),
('Amiya Kanti Das', 'BJP', 'Dholai (SC)', 'Cachar'),
('Milon Das', 'BJP', 'Hailakandi', 'Hailakandi'),
('Zubair Anam Mazumder', 'INC', 'Algapur-Katlicherra', 'Hailakandi'),
('Krishnendu Paul', 'BJP', 'Patharkandi', 'Sribhumi'),
('Bijoy Malakar', 'BJP', 'Ram Krishna Nagar (SC)', 'Sribhumi'),
('Susanta Borgohain', 'BJP', 'Demow', 'Sibsagar'),
('Nazirul Hussain', 'INC', 'Nazira', 'Sibsagar'),
('Akhil Gogoi', 'RJRD', 'Sibsagar', 'Sibsagar'),
('Atul Bora', 'AGP', 'Bokakhat', 'Golaghat');
`;

const mapping = {
  "Kokrajhar": ["Gossaigaon", "Dotma (ST)", "Kokrajhar (ST)", "Baokhungri", "Parbatjhora", "Sidli–Chirang (ST)", "Bijni", "Manas", "Baksa (ST)"],
  "Dhubri": ["Golakganj", "Gauripur", "Dhubri", "Birsing Jarua", "Bilasipara", "Mankachar", "Jaleshwar", "Goalpara East", "Srijangram", "Mandia", "Chenga"],
  "Barpeta": ["Abhayapuri", "Bongaigaon", "Bhowanipur–Sorbhog", "Barpeta (SC)", "Pakabetbari", "Bajali", "Hajo–Sualkuchi (SC)", "Barkhetri", "Nalbari", "Tihu"],
  "Guwahati": ["Goalpara West (ST)", "Dudhnai (ST)", "Chamaria", "Boko–Chaygaon (ST)", "Palasbari", "Dispur", "Dimoria (SC)", "New Guwahati", "Guwahati Central", "Jalukbari"],
  "Darrang-Udalguri": ["Tamulpur (ST)", "Goreshwar", "Rangiya", "Kamalpur", "Bhergaon", "Udalguri (ST)", "Majbat", "Tangla", "Sipajhar", "Mangaldai", "Dalgaon"],
  "Kaziranga": ["Kaliabor", "Barhampur", "Binnakandi", "Hojai", "Lumding", "Golaghat", "Dergaon", "Bokakhat", "Khumtai", "Sarupathar"],
  "Nagaon": ["Jagiroad (SC)", "Laharighat", "Morigaon", "Dhing", "Rupohihat", "Samaguri", "Nagaon–Batadraba", "Raha (SC)"],
  "Diphu": ["Bokajan (ST)", "Howraghat (ST)", "Diphu (ST)", "Rongkhang (ST)", "Amri (ST)", "Haflong (ST)"],
  "Silchar": ["Lakhipur", "Udharbond", "Katigorah", "Borkhola", "Silchar", "Dholai (SC)"],
  "Karimganj": ["Hailakandi", "Algapur-Katlicherra", "Patharkandi", "Ram Krishna Nagar (SC)"],
  "Sonitpur": ["Dhekiajuli", "Barchalla", "Tezpur", "Rangapara", "Nadaur", "Biswanath", "Behali (SC)", "Gohpur"],
  "Lakhimpur": ["Bihpuria", "Rongonadi", "Naoboicha (SC)", "Lakhimpur", "Dhakuakhana (ST)", "Dhemaji (ST)", "Sissiborgaon", "Jonai (ST)", "Sadiya", "Doom Dooma"],
  "Dibrugarh": ["Chabua-Lahowal", "Dibrugarh", "Khowang", "Duliajan", "Tingkhong", "Naharkatia", "Margherita", "Digboi", "Makum", "Tinsukia"],
  "Jorhat": ["Jorhat", "Mariani", "Teok", "Titabor", "Majuli (ST)", "Demow", "Nazira", "Sibsagar"]
};

const lsMap = {};
for (const ls of Object.keys(mapping)) {
  for (const ac of mapping[ls]) {
    lsMap[ac.replace(/[\–\-]/g, '-').trim()] = ls;
  }
}

const existing = [
  'Jalukbari', 'Dispur', 'Guwahati Central', 'New Guwahati', 'Dimoria (SC)', 
  'Jorhat', 'Mariani', 'Teok', 'Titabor',
  'Samaguri', 'Barhampur', 'Nagaon-Batadraba', 'Raha (SC)', 'Jagiroad', 'Morigaon',
  'Dibrugarh', 'Duliajan', 'Tingkhong', 'Chabua-Lahowal', 'Tinsukia', 'Margherita', 'Doom Dooma',
  'Dhubri', 'Gossaigaon', 'Kokrajhar (ST)', 'Barpeta', 'Mandia',
  'Bihpuria', 'Lakhimpur', 'Dhemaji', 'Nadaur', 'Dhekiajuli', 'Jagiroad (SC)'
].map(s => s.replace(/[\–\-]/g, '-').trim());

const lines = mlas.trim().split("\n");
let toInsert = [];

for (let line of lines) {
  if (!line.includes("('")) continue;
  const match = line.match(/\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/);
  if (match) {
    const name = match[1];
    const party = match[2];
    const constituency = match[3];
    const district = match[4];
    const norm = constituency.replace(/[\–\-]/g, '-').trim();
    
    // Only output if it's NOT in the list the user already provided above
    if (existing.includes(norm)) continue;
    
    const ls = lsMap[norm] || "Unknown";
    toInsert.push(`('${name}', '${party}', '${constituency}', '${district}', '${ls}')`);
  }
}

const fs = require('fs');
fs.writeFileSync('output.sql', "INSERT INTO mla_list (name, party, constituency, district, lok_sabha_seat) VALUES\n" + toInsert.join(",\n") + ";\n");
