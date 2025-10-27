import { FastifyInstance } from "fastify";
import { teamHandlers } from "../handlers/teams.ts";

export async function teamRoutes(app: FastifyInstance) {

    app.get('/info/teams', teamHandlers.teamsList);

    app.get('/info/teams/:teamId', teamHandlers.teamInfo);

    app.get('/info/teams/search/name/:teamName', teamHandlers.teamSearch);

    app.get('/info/teams/search/city/:cityName', teamHandlers.teamsByCity);

    app.post('/info/teams', teamHandlers.addTeam);

};