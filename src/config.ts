// Environment configuration
export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || "3002"),
    host: process.env.HOST || "::",
    env: process.env.NODE_ENV || "development",
  },

  // Database configuration
  database: {
    path: process.env.DATABASE_PATH || "./data/database.db",
  }
};

// Validate configuration and log startup info
export const validateConfig = () => {
  console.log("🚀 Starting server with configuration:", {
    port: config.server.port,
    host: config.server.host,
    env: config.server.env,
    databasePath: config.database.path
  });

  // Validate port is a valid number
  if (isNaN(config.server.port) || config.server.port <= 0) {
    console.error("❌ Invalid PORT environment variable");
    process.exit(1);
  }
};