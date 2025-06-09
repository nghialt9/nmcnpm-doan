import app from './src/app';
import { initTables } from './src/db';

const PORT = process.env.PORT || 8007;

initTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize tables:', err);
  process.exit(1);
});
