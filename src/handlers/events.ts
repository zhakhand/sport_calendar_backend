import { FastifyRequest, FastifyReply } from "fastify";

declare interface Event {
    id: string;
    time: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    sport: string;
    day_of_week: string;
    weekday: string;
}

export const eventHandlers = {
    getAllEvents: async (request: FastifyRequest, reply: FastifyReply) => {
        const db = await request.server.db;

        const events = await new Promise<Event[]>((resolve, reject) => {
            db.all('SELECT * FROM events', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Event[] || []);
                }
            });
        });

        return reply.status(200).send(events);
    },
};