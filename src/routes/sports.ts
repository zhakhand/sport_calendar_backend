import { FastifyInstance } from "fastify";
import { sportHandlers } from "../handlers/sports.ts";

export async function sportRoutes(app: FastifyInstance) {

    app.get('/info/sports', sportHandlers.sportsList);

    // Get events by sport ID
    app.get('/info/events/search/sportId/:sportId', sportHandlers.eventsBySportId);
    // Get events by sports name
    app.get('/info/events/search/sportName/:sportName', sportHandlers.eventsBySportName);

    app.post('/info/sports', sportHandlers.addSport);

};