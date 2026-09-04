import { createApp } from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';

const app = createApp();

async function bootstrap() {
  await connectDatabase();

  const server = app.listen(config.port, () => {
    console.log(`=================================================`);
    console.log(` SpendWise Backend Server Running`);
    console.log(` Port: ${config.port}`);
    console.log(` Environment: ${config.nodeEnv}`);
    console.log(` API Endpoint: http://localhost:${config.port}/api/v1`);
    console.log(`=================================================`);
  });

  const handleShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
