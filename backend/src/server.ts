import app from './app';
import { env } from './config/env';
import { connectDB } from './config/database';
import { Mission } from './models/Mission';
import { runSeed } from './seeds/seed';

async function bootstrap() {
  try {
    console.log(`[Server] Initializing ${env.GAME_TITLE}...`);
    await connectDB();

    // Auto-seed if database is empty
    const missionCount = await Mission.countDocuments();
    if (missionCount < 50) {
      console.log(`[Server] Found ${missionCount} missions. Running initial seed...`);
      await runSeed(false);
    } else {
      console.log(`[Server] Database verified with ${missionCount} missions.`);
    }

    const server = app.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`  🚀 ${env.GAME_TITLE} Backend Online`);
      console.log(`  🌐 Port: ${env.PORT}`);
      console.log(`  🔗 Health: http://localhost:${env.PORT}/api/health`);
      console.log(`  📚 Docs: http://localhost:${env.PORT}/api/docs`);
      console.log(`  💎 VELoop Mode: ${env.VELOOP_MODE}`);
      console.log(`=======================================================`);
    });

    const shutdown = async () => {
      console.log('[Server] Graceful shutdown initiated...');
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[Server Fatal Startup Error]', err);
    process.exit(1);
  }
}

bootstrap();
