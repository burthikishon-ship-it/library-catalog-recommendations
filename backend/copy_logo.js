const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\neela datha sai\\.gemini\\antigravity-ide\\brain\\0cd9f004-7cb0-431d-b24c-b005556e6579\\.user_uploaded\\media_1791194865060.png';
const publicDir = 'f:\\Desktop\\library catalog\\frontend\\public';

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.copyFileSync(src, path.join(publicDir, 'kiet-logo.png'));
fs.copyFileSync(src, path.join(publicDir, 'favicon.png'));

console.log('Successfully copied user KIET logo to frontend/public/kiet-logo.png');
