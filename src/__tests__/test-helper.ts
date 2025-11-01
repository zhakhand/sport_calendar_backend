import Fastify, { FastifyInstance } from "fastify";
import dbConnector from "../database.js";
import { routes } from "../routes/index.js";
import fastifyCors from "@fastify/cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildTestApp(): Promise<FastifyInstance> {
    // Use a separate test database
    const testDbPath = path.join(__dirname, "../../data/test-database.db");
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, "../../data");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Clean up test database if it exists
    if (fs.existsSync(testDbPath)) {
        try {
            fs.unlinkSync(testDbPath);
        } catch (error) {
            // Ignore errors during cleanup
        }
    }

    const app = Fastify({ logger: false });

    await app.register(fastifyCors, { origin: true });
    await app.register(dbConnector, { path: testDbPath });
    await app.register(routes);

    return app;
}

export async function cleanupTestApp(app: FastifyInstance): Promise<void> {
    if (app) {
        await app.close();
    }
    
    // Clean up test database
    const testDbPath = path.join(__dirname, "../../data/test-database.db");
    if (fs.existsSync(testDbPath)) {
        try {
            fs.unlinkSync(testDbPath);
        } catch (error) {
            // Ignore errors during cleanup
        }
    }
}
