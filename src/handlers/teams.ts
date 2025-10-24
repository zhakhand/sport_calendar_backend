import { FastifyRequest, FastifyReply } from "fastify";

declare interface Teams {
    team_id: number,
    team_name: string,
    city: string
}

export const teamHandlers = {
    teamsList: async(request: FastifyRequest, reply: FastifyReply) => {
        const db = await request.server.db;

        const teams = await new Promise<Teams[]>((resolve, reject) => {
            db.all('SELECT * FROM teams', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Teams[] || []);
                }
            });
        });
        if (!teams || !teams.length) {
            return reply.status(404).send({error: "No teams found!"});
        }
        return reply.status(200).send(teams);
    },
}