const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

// Создаем директорию если её нет
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Создаем простые одноцветные изображения
const createImage = async (filename, size, color = '#3B82F6') => {
  const filepath = path.join(assetsDir, filename);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: color,
    },
  })
    .png()
    .toFile(filepath);
  console.log(`Created ${filename} (${size}x${size})`);
};

(async () => {
  try {
    // Icon для приложения (1024x1024)
    await createImage('icon.png', 1024, '#3B82F6');
    
    // Splash screen (1242x2436)
    await sharp({
      create: {
        width: 1242,
        height: 2436,
        channels: 4,
        background: '#FFFFFF',
      },
    })
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('Created splash.png (1242x2436)');
    
    // Adaptive icon для Android (1024x1024)
    await createImage('adaptive-icon.png', 1024, '#3B82F6');
    
    // Favicon для веб (48x48)
    await createImage('favicon.png', 48, '#3B82F6');
    
    // Notification icon (96x96)
    await createImage('notification-icon.png', 96, '#3B82F6');
    
    console.log('\n✅ All assets created successfully!');
  } catch (error) {
    console.error('Error creating assets:', error);
    process.exit(1);
  }
})();

