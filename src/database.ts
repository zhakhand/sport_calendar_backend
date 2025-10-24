import sqlite3, { Database } from "sqlite3";
import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

interface DatabaseOptions {
  path?: string;
}

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}

async function dbConnector(fastify: FastifyInstance, options: DatabaseOptions) {
  const dbPath = options.path || "./data/database.db";

  const db = await new Promise<sqlite3.Database>((resolve, reject) => {
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        fastify.log.error("Could not connect to database: %s", err.message);
        reject(err);
      } else {
        fastify.log.info(`Connected to database at ${dbPath}`);
        resolve(database);
      }
    });
  });

  const initDb = () => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(
          `
          CREATE TABLE IF NOT EXISTS sports (
            sport_id INTEGER PRIMARY KEY AUTOINCREMENT,
            sport_name TEXT UNIQUE NOT NULL
            )
            `,
          (err) => {
            if (err) {
              fastify.log.error("Error creating sports table: %s", err.message);
              reject(err);
            } else {
              fastify.log.info("Sports table initialized");
              resolve(undefined);
            }
          }
        );
        db.run(
          `
          CREATE TABLE IF NOT EXISTS teams (
            team_id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_name TEXT NOT NULL,
            team_city TEXT NOT NULL,
            UNIQUE (team_name, team_city)
            )
            `,
          (err) => {
            if (err) {
              fastify.log.error("Error creating teams table: %s", err.message);
              reject(err);
            } else {
              fastify.log.info("Teams table initialized");
              resolve(undefined);
            }
          }
        );
        db.run(
          `
          CREATE TABLE IF NOT EXISTS events (
            event_id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_time TEXT NOT NULL,
            event_date TEXT NOT NULL,
            _home_team_id INTEGER NOT NULL,
            _away_team_id INTEGER NOT NULL,
            _sport_id INTEGER NOT NULL,
            FOREIGN KEY (_home_team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
            FOREIGN KEY (_away_team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
            FOREIGN KEY (_sport_id) REFERENCES sports(sport_id) ON DELETE CASCADE,
            UNIQUE(_home_team_id, _away_team_id, event_date, event_time),
            CHECK (_home_team_id != _away_team_id)
            )
            `,
          (err) => {
            if (err) {
              fastify.log.error("Error creating teams table: %s", err.message);
              reject(err);
            } else {
              fastify.log.info("Events table initialized");
              resolve(undefined);
            }
          }
        );
      });
    });
  };

  try {
    await initDb();
  } catch (error) {
    fastify.log.error("Failed to initialize database: %s", String(error));
    throw error;
  }

  fastify.decorate("db", db);

  fastify.addHook("onClose", async (instance) => {
    return new Promise<void>((resolve, reject) => {
      instance.db.close((err: Error | null) => {
        if (err) {
          instance.log.error("Error closing database: %s", err.message);
          reject(err);
        } else {
          instance.log.info("Database connection closed");
          resolve();
        }
      });
    });
  });
}

export default fp(dbConnector, { name: "dbConnector" });
