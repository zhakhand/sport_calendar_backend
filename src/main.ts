import Fastify from "fastify";
import dbConnector from "./database.ts";
import {config, validateConfig} from "./config.ts";
import {routes} from "./routes/index.ts";

validateConfig();

const app = Fastify({logger: true});

await app.register(dbConnector, {path: config.database.path});

await app.register(routes);

// // /info/teams /info/teams/teams/:teamId
// await app.register(teamRoutes);

// // /info/sports /info/sports/:sportsId
// await app.register(sportRoutes);

// // /info/events /info/events/:eventId
// await app.register(eventRoutes);

const start = async () => {
    try {
        await app.listen({ port: parseInt(config.server.port) || 3000, host: config.server.host || "::" });
        console.log(`Server is running on ${config.server.port}:${config.server.host}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();