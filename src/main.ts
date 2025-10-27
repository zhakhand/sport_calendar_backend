import Fastify from "fastify";
import dbConnector from "./database.ts";
import {config, validateConfig} from "./config.ts";
import {routes} from "./routes/index.ts";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

validateConfig();

const app = Fastify({logger: true});

// Enable CORS for frontend access
await app.register(fastifyCors, {
    origin: true
});

// Serve static files from public directory
await app.register(fastifyStatic, {
    root: path.join(__dirname, "..", "public"),
    prefix: "/"
});

await app.register(dbConnector, {path: config.database.path});

await app.register(routes);

const start = async () => {
    try {
        await app.listen({ port: config.server.port, host: config.server.host });
        console.log(`Server is running on ${config.server.host}:${config.server.port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();