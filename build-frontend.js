const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building Angular frontend...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });

  const publicDir = path.join(__dirname, 'public');
  const sourceDir = path.join(__dirname, 'frontend', 'dist', 'frontend', 'browser');

  console.log('Removing old public directory...');
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }

  console.log(`Copying from ${sourceDir} to ${publicDir}...`);
  fs.cpSync(sourceDir, publicDir, { recursive: true });

  console.log('Frontend build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
