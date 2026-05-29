import https from 'https';
import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const url = 'https://persitkopassus.com/wp-content/uploads/2024/10/Logo-Yayasan-Kartika-Jaya.jpg';
const dest = path.join(publicDir, 'kartika-logo.jpg');

https.get(url, (res) => {
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded logo successfully!');
  });
}).on('error', (err) => {
  console.error('Error downloading logo:', err);
});
