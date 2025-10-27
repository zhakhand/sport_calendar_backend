import { FastifyInstance } from "fastify";
import { checkRoutes } from './check.ts';
import { teamRoutes } from "./teams.ts";

export async function routes(app: FastifyInstance) {
    // /health /ready
    await app.register(checkRoutes);
    
    // /info/teams /info/teams/:teamId
    await app.register(teamRoutes);

    // /info/sports /info/sports/:sportsId
    // await app.register(sportRoutes);

    // /info/events /info/events/:eventId
    // await app.register(eventRoutes);
};