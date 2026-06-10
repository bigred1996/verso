// Generates Verso app icons from inline SVG using sharp.
// Run: node scripts/make-icons.js
const sharp = require('sharp');
const path = require('path');
const out = (f) => path.join(__dirname, '..', 'assets', 'images', f);

const BG = '#0C0906', CREAM = '#EAD8B0', GREEN = '#3D6B48';

// App icon: dark field, hairline frame, serif italic V, green accent bar
const iconSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="${BG}"/>
  <rect x="64" y="64" width="896" height="896" fill="none" stroke="${CREAM}" stroke-opacity="0.18" stroke-width="6"/>
  <text x="512" y="700" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="560" font-style="italic" font-weight="bold" fill="${CREAM}">V</text>
  <rect x="392" y="810" width="240" height="14" fill="${GREEN}"/>
</svg>`;

// Splash logo: transparent bg, "Verso" wordmark (splash backgroundColor supplies the dark field)
const splashSvg = `
<svg width="1024" height="400" xmlns="http://www.w3.org/2000/svg">
  <text x="512" y="240" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="220" font-style="italic" font-weight="bold" fill="${CREAM}">Verso</text>
  <rect x="412" y="310" width="200" height="10" fill="${GREEN}"/>
</svg>`;

// Android adaptive foreground: V centred in the 66% safe zone, transparent bg
const fgSvg = `
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <text x="512" y="640" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
        font-size="400" font-style="italic" font-weight="bold" fill="${CREAM}">V</text>
</svg>`;

// Android monochrome: white V, transparent bg
const monoSvg = fgSvg.replace(CREAM, '#FFFFFF');

// Android adaptive background: solid Trinity dark
const bgSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="${BG}"/></svg>`;

(async () => {
  await sharp(Buffer.from(iconSvg)).png().toFile(out('icon.png'));
  await sharp(Buffer.from(splashSvg)).png().toFile(out('splash-icon.png'));
  await sharp(Buffer.from(fgSvg)).png().toFile(out('android-icon-foreground.png'));
  await sharp(Buffer.from(monoSvg)).png().toFile(out('android-icon-monochrome.png'));
  await sharp(Buffer.from(bgSvg)).png().toFile(out('android-icon-background.png'));
  await sharp(Buffer.from(iconSvg)).resize(48, 48).png().toFile(out('favicon.png'));
  console.log('icons written');
})().catch(e => { console.error(e); process.exit(1); });
