const { execSync } = require('child_process');

if (process.env.IN_OPEN_NEXT === 'true') {
  console.log("--- Inside OpenNext: Running standard Next.js build ---");
  execSync('next build', { stdio: 'inherit' });
} else {
  console.log("--- Starting OpenNext Cloudflare Build wrapper ---");
  // Set environment variable to break recursive loops
  process.env.IN_OPEN_NEXT = 'true';
  
  // Choose correct package manager command
  const isBun = process.versions.bun !== undefined || process.env.BUN_VERSION !== undefined;
  const cmd = isBun ? 'bunx' : 'npx';
  
  execSync(`${cmd} opennextjs-cloudflare build`, { stdio: 'inherit', env: process.env });
  console.log("--- OpenNext Cloudflare Build completed successfully ---");
}
