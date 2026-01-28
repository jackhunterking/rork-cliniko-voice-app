/**
 * Icon Generation Script for Cliniko Voice App
 * 
 * Generates all required app icons and splash screen images with a microphone design.
 * 
 * Run with: node scripts/generate-icons.js
 * 
 * Requirements: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp, fall back to creating SVG files if not available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Will create SVG files instead.');
  console.log('To generate PNG files, run: npm install sharp && node scripts/generate-icons.js');
}

// App colors
const PRIMARY_COLOR = '#007FA3';
const WHITE = '#FFFFFF';

// Microphone SVG path (centered design - BIGGER)
function createMicrophoneSVG(size, bgColor = PRIMARY_COLOR, iconColor = WHITE, iconScale = 0.7) {
  // Calculate total microphone height to center it properly
  const micWidth = size * 0.28;
  const micHeight = size * 0.38;
  const standHeight = size * 0.12;
  const baseHeight = size * 0.045;
  const gapAfterMic = size * 0.015;
  
  // Total height of the microphone assembly
  const totalHeight = micHeight + gapAfterMic + standHeight + baseHeight;
  
  // Center vertically
  const startY = (size - totalHeight) / 2;
  
  // Microphone body (centered horizontally)
  const micX = (size - micWidth) / 2;
  const micY = startY;
  const micRx = micWidth / 2;
  
  // Stand
  const standWidth = micWidth * 0.18;
  const standX = (size - standWidth) / 2;
  const standY = micY + micHeight + gapAfterMic;
  
  // Base
  const baseWidth = micWidth * 0.7;
  const baseX = (size - baseWidth) / 2;
  const baseY = standY + standHeight;
  const baseRx = baseHeight / 2;
  
  // Arc for the microphone holder
  const arcRadius = micWidth * 0.65;
  const arcCenterX = size / 2;
  const arcCenterY = micY + micHeight * 0.65;
  const arcStrokeWidth = micWidth * 0.1;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.22}"/>
  
  <!-- Microphone body -->
  <rect 
    x="${micX}" 
    y="${micY}" 
    width="${micWidth}" 
    height="${micHeight}" 
    rx="${micRx}" 
    fill="${iconColor}"
  />
  
  <!-- Microphone grille lines -->
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.22}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.22}" stroke="${bgColor}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.35}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.35}" stroke="${bgColor}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.48}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.48}" stroke="${bgColor}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  
  <!-- Microphone holder arc -->
  <path 
    d="M ${arcCenterX - arcRadius} ${arcCenterY} 
       A ${arcRadius} ${arcRadius} 0 0 0 ${arcCenterX + arcRadius} ${arcCenterY}" 
    fill="none" 
    stroke="${iconColor}" 
    stroke-width="${arcStrokeWidth}"
    stroke-linecap="round"
  />
  
  <!-- Stand -->
  <rect 
    x="${standX}" 
    y="${standY}" 
    width="${standWidth}" 
    height="${standHeight}" 
    fill="${iconColor}"
  />
  
  <!-- Base -->
  <rect 
    x="${baseX}" 
    y="${baseY}" 
    width="${baseWidth}" 
    height="${baseHeight}" 
    rx="${baseRx}"
    fill="${iconColor}"
  />
</svg>`;
}

// Splash screen SVG (centered icon on colored background - BIGGER)
function createSplashSVG(width, height, bgColor = PRIMARY_COLOR, iconColor = WHITE) {
  // Use a larger base size for splash screen
  const baseSize = Math.min(width, height) * 0.35;
  
  // Calculate total microphone height to center it properly
  const micWidth = baseSize * 0.4;
  const micHeight = baseSize * 0.55;
  const standHeight = baseSize * 0.17;
  const baseHeight = baseSize * 0.065;
  const gapAfterMic = baseSize * 0.02;
  
  // Total height of the microphone assembly
  const totalHeight = micHeight + gapAfterMic + standHeight + baseHeight;
  
  // Center vertically (slightly above center)
  const startY = (height - totalHeight) / 2 - height * 0.03;
  
  // Microphone body (centered horizontally)
  const micX = (width - micWidth) / 2;
  const micY = startY;
  const micRx = micWidth / 2;
  
  // Stand
  const standWidth = micWidth * 0.18;
  const standX = (width - standWidth) / 2;
  const standY = micY + micHeight + gapAfterMic;
  
  // Base
  const baseWidth = micWidth * 0.7;
  const baseX = (width - baseWidth) / 2;
  const baseY = standY + standHeight;
  const baseRx = baseHeight / 2;
  
  // Arc for the microphone holder
  const arcRadius = micWidth * 0.65;
  const arcCenterX = width / 2;
  const arcCenterY = micY + micHeight * 0.65;
  const arcStrokeWidth = micWidth * 0.1;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  
  <!-- Microphone body -->
  <rect 
    x="${micX}" 
    y="${micY}" 
    width="${micWidth}" 
    height="${micHeight}" 
    rx="${micRx}" 
    fill="${iconColor}"
  />
  
  <!-- Microphone grille lines -->
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.22}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.22}" stroke="${bgColor}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.35}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.35}" stroke="${bgColor}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.48}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.48}" stroke="${bgColor}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  
  <!-- Microphone holder arc -->
  <path 
    d="M ${arcCenterX - arcRadius} ${arcCenterY} 
       A ${arcRadius} ${arcRadius} 0 0 0 ${arcCenterX + arcRadius} ${arcCenterY}" 
    fill="none" 
    stroke="${iconColor}" 
    stroke-width="${arcStrokeWidth}"
    stroke-linecap="round"
  />
  
  <!-- Stand -->
  <rect 
    x="${standX}" 
    y="${standY}" 
    width="${standWidth}" 
    height="${standHeight}" 
    fill="${iconColor}"
  />
  
  <!-- Base -->
  <rect 
    x="${baseX}" 
    y="${baseY}" 
    width="${baseWidth}" 
    height="${baseHeight}" 
    rx="${baseRx}"
    fill="${iconColor}"
  />
</svg>`;
}

// Android adaptive icon foreground (just the microphone, no background - BIGGER & CENTERED)
function createAdaptiveIconForegroundSVG(size) {
  // Android adaptive icons have a safe zone - keep content within inner 66%
  // But we can use more space since our icon is simple
  
  // Calculate total microphone height to center it properly
  const micWidth = size * 0.22;
  const micHeight = size * 0.30;
  const standHeight = size * 0.10;
  const baseHeight = size * 0.035;
  const gapAfterMic = size * 0.012;
  
  // Total height of the microphone assembly
  const totalHeight = micHeight + gapAfterMic + standHeight + baseHeight;
  
  // Center vertically
  const startY = (size - totalHeight) / 2;
  
  // Microphone body (centered horizontally)
  const micX = (size - micWidth) / 2;
  const micY = startY;
  const micRx = micWidth / 2;
  
  // Stand
  const standWidth = micWidth * 0.18;
  const standX = (size - standWidth) / 2;
  const standY = micY + micHeight + gapAfterMic;
  
  // Base
  const baseWidth = micWidth * 0.7;
  const baseX = (size - baseWidth) / 2;
  const baseY = standY + standHeight;
  const baseRx = baseHeight / 2;
  
  // Arc for the microphone holder
  const arcRadius = micWidth * 0.65;
  const arcCenterX = size / 2;
  const arcCenterY = micY + micHeight * 0.65;
  const arcStrokeWidth = micWidth * 0.1;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Transparent background for adaptive icon -->
  <rect width="${size}" height="${size}" fill="transparent"/>
  
  <!-- Microphone body -->
  <rect 
    x="${micX}" 
    y="${micY}" 
    width="${micWidth}" 
    height="${micHeight}" 
    rx="${micRx}" 
    fill="${WHITE}"
  />
  
  <!-- Microphone grille lines -->
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.22}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.22}" stroke="${PRIMARY_COLOR}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.35}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.35}" stroke="${PRIMARY_COLOR}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  <line x1="${micX + micWidth * 0.28}" y1="${micY + micHeight * 0.48}" x2="${micX + micWidth * 0.72}" y2="${micY + micHeight * 0.48}" stroke="${PRIMARY_COLOR}" stroke-width="${micWidth * 0.055}" stroke-linecap="round"/>
  
  <!-- Microphone holder arc -->
  <path 
    d="M ${arcCenterX - arcRadius} ${arcCenterY} 
       A ${arcRadius} ${arcRadius} 0 0 0 ${arcCenterX + arcRadius} ${arcCenterY}" 
    fill="none" 
    stroke="${WHITE}" 
    stroke-width="${arcStrokeWidth}"
    stroke-linecap="round"
  />
  
  <!-- Stand -->
  <rect 
    x="${standX}" 
    y="${standY}" 
    width="${standWidth}" 
    height="${standHeight}" 
    fill="${WHITE}"
  />
  
  <!-- Base -->
  <rect 
    x="${baseX}" 
    y="${baseY}" 
    width="${baseWidth}" 
    height="${baseHeight}" 
    rx="${baseRx}"
    fill="${WHITE}"
  />
</svg>`;
}

// Output paths
const outputPaths = {
  icon: path.join(__dirname, '../assets/images/icon.png'),
  adaptiveIcon: path.join(__dirname, '../assets/images/adaptive-icon.png'),
  splashIcon: path.join(__dirname, '../assets/images/splash-icon.png'),
  favicon: path.join(__dirname, '../assets/images/favicon.png'),
  iosIcon: path.join(__dirname, '../ios/ClinikoVoiceApp/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png'),
  iosSplash1x: path.join(__dirname, '../ios/ClinikoVoiceApp/Images.xcassets/SplashScreenLegacy.imageset/image.png'),
  iosSplash2x: path.join(__dirname, '../ios/ClinikoVoiceApp/Images.xcassets/SplashScreenLegacy.imageset/image@2x.png'),
  iosSplash3x: path.join(__dirname, '../ios/ClinikoVoiceApp/Images.xcassets/SplashScreenLegacy.imageset/image@3x.png'),
};

// SVG output paths (fallback)
const svgPaths = {
  icon: path.join(__dirname, '../assets/images/icon.svg'),
  adaptiveIcon: path.join(__dirname, '../assets/images/adaptive-icon.svg'),
  splashIcon: path.join(__dirname, '../assets/images/splash-icon.svg'),
  favicon: path.join(__dirname, '../assets/images/favicon.svg'),
};

async function generateWithSharp() {
  console.log('Generating icons with Sharp...\n');

  // Main app icon (1024x1024)
  const iconSvg = createMicrophoneSVG(1024);
  await sharp(Buffer.from(iconSvg))
    .png()
    .toFile(outputPaths.icon);
  console.log('✓ Generated: icon.png (1024x1024)');

  // Copy to iOS
  await sharp(Buffer.from(iconSvg))
    .png()
    .toFile(outputPaths.iosIcon);
  console.log('✓ Generated: iOS App Icon (1024x1024)');

  // Adaptive icon for Android (1024x1024 with transparent bg)
  const adaptiveIconSvg = createAdaptiveIconForegroundSVG(1024);
  await sharp(Buffer.from(adaptiveIconSvg))
    .png()
    .toFile(outputPaths.adaptiveIcon);
  console.log('✓ Generated: adaptive-icon.png (1024x1024)');

  // Splash icon (centered icon for splash screen)
  const splashIconSvg = createSplashSVG(1284, 2778);
  await sharp(Buffer.from(splashIconSvg))
    .png()
    .toFile(outputPaths.splashIcon);
  console.log('✓ Generated: splash-icon.png');

  // Favicon (48x48)
  const faviconSvg = createMicrophoneSVG(48);
  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(outputPaths.favicon);
  console.log('✓ Generated: favicon.png (48x48)');

  // iOS Splash screens
  // 1x: 414x736
  const splash1xSvg = createSplashSVG(414, 736);
  await sharp(Buffer.from(splash1xSvg))
    .png()
    .toFile(outputPaths.iosSplash1x);
  console.log('✓ Generated: iOS Splash 1x (414x736)');

  // 2x: 828x1472
  const splash2xSvg = createSplashSVG(828, 1472);
  await sharp(Buffer.from(splash2xSvg))
    .png()
    .toFile(outputPaths.iosSplash2x);
  console.log('✓ Generated: iOS Splash 2x (828x1472)');

  // 3x: 1242x2208
  const splash3xSvg = createSplashSVG(1242, 2208);
  await sharp(Buffer.from(splash3xSvg))
    .png()
    .toFile(outputPaths.iosSplash3x);
  console.log('✓ Generated: iOS Splash 3x (1242x2208)');

  console.log('\n✅ All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Rebuild your app: npx expo prebuild --clean');
  console.log('2. Run on device: npx expo run:ios');
}

function generateSvgFiles() {
  console.log('Generating SVG files (Sharp not available)...\n');

  // Ensure directories exist
  const assetsDir = path.join(__dirname, '../assets/images');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Main app icon
  fs.writeFileSync(svgPaths.icon, createMicrophoneSVG(1024));
  console.log('✓ Generated: icon.svg (1024x1024)');

  // Adaptive icon
  fs.writeFileSync(svgPaths.adaptiveIcon, createAdaptiveIconForegroundSVG(1024));
  console.log('✓ Generated: adaptive-icon.svg (1024x1024)');

  // Splash icon
  fs.writeFileSync(svgPaths.splashIcon, createSplashSVG(1284, 2778));
  console.log('✓ Generated: splash-icon.svg');

  // Favicon
  fs.writeFileSync(svgPaths.favicon, createMicrophoneSVG(48));
  console.log('✓ Generated: favicon.svg (48x48)');

  console.log('\n⚠️  SVG files generated. To create PNG files:');
  console.log('1. Install sharp: npm install sharp');
  console.log('2. Run again: node scripts/generate-icons.js');
  console.log('\nOr convert the SVG files to PNG manually using an image editor.');
}

async function main() {
  console.log('🎤 Cliniko Voice App - Icon Generator\n');
  console.log(`Primary Color: ${PRIMARY_COLOR}`);
  console.log(`Icon Color: ${WHITE}\n`);

  if (sharp) {
    try {
      await generateWithSharp();
    } catch (error) {
      console.error('Error generating icons:', error);
      process.exit(1);
    }
  } else {
    generateSvgFiles();
  }
}

main();
