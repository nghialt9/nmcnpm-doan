import app from './src/app';
import { initializeDatabase } from './src/db/init';

const PORT = process.env.PORT || 8007;

const startServer = async () => {
   await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();