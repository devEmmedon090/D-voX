require('dotenv').config(); // Loads .env automatically

const { execSync } = require('child_process');

try {
  console.log('Running Prisma migrate...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('Migration complete!');
} catch (error) {
  console.error('Migration failed:', error.message);
}
