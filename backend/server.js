require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const app = require('./app');
const dbInit = require('./config/db-init');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Auto-initialize DB schema and default seed rows
  await dbInit();

  const server = app.listen(PORT, () => {
    console.log(`Server running in production-ready mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections (safety net)
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...', err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
}

startServer();


// Handle uncaught exceptions (safety net)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err.name, err.message);
  process.exit(1);
});
