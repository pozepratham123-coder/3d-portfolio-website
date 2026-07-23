const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const projectDir = path.resolve(__dirname, '..');
let timeout = null;
let isPushing = false;

console.log('🚀 Auto-sync active! Watching for file changes in src/ and public/...');

function triggerPush() {
  if (isPushing) return;
  isPushing = true;
  console.log('⚡ File edit detected. Staging, committing, and pushing to GitHub...');

  exec('git add . && git commit -m "Auto-update website" && git push origin main', { cwd: projectDir }, (error, stdout, stderr) => {
    isPushing = false;
    if (error) {
      if (stderr && stderr.includes('nothing to commit')) {
        console.log('ℹ️ No changes to commit.');
      } else {
        console.error('⚠️ Auto-sync error:', stderr || error.message);
      }
      return;
    }
    console.log('✅ Live update pushed to GitHub! Vercel is building the update on poza.in...');
  });
}

function handleFileChange(eventType, filename) {
  if (!filename) return;
  if (filename.includes('.git') || filename.includes('node_modules') || filename.includes('dist')) return;

  clearTimeout(timeout);
  // 2.5 second debounce to aggregate fast multiple edits
  timeout = setTimeout(triggerPush, 2500);
}

// Watch key project directories recursively
try {
  fs.watch(path.join(projectDir, 'src'), { recursive: true }, handleFileChange);
  fs.watch(path.join(projectDir, 'public'), { recursive: true }, handleFileChange);
  fs.watch(path.join(projectDir, 'index.html'), handleFileChange);
} catch (e) {
  console.error('Watcher initialization error:', e);
}

// Run initial sync on launch
triggerPush();
