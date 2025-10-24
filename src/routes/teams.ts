import { FastifyInstance } from "fastify";
import { teamHandlers } from "../handlers/teams.ts";

export async function teamRoutes(app: FastifyInstance) {

    app.get('/info/teams', teamHandlers.teamsList);

    //app.get('/info/teams/:teamId', teamHandlers.teamInfo);

    //app.post('info/teams', teamHandlers.addTeam);

};