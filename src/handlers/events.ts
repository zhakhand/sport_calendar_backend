import { FastifyRequest, FastifyReply } from "fastify";

declare interface Event {
    id: string;
    time: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    sport: string;
    day_of_week: string;
    weekday_name: string;
}

export const eventHandlers = {
    getAllEvents: async (request: FastifyRequest, reply: FastifyReply) => {
        const db = await request.server.db;

        const events = await new Promise<Event[]>((resolve, reject) => {
            db.all(
                `SELECT 
                    e.event_id,
                    e.event_date,
                    e.event_time,
                    ht.team_name as home_team_name,
                    at.team_name as away_team_name,
                    s.sport_name,
                    strftime('%w', e.event_date) as day_of_week,
                    CASE strftime('%w', e.event_date)
                        WHEN '0' THEN 'Sunday'
                        WHEN '1' THEN 'Monday'
                        WHEN '2' THEN 'Tuesday'
                        WHEN '3' THEN 'Wednesday'
                        WHEN '4' THEN 'Thursday'
                        WHEN '5' THEN 'Friday'
                        WHEN '6' THEN 'Saturday'
                    END as weekday_name
                FROM events e
                JOIN teams ht ON e._home_team_id = ht.team_id
                JOIN teams at ON e._away_team_id = at.team_id
                JOIN sports s ON e._sport_id = s.sport_id
                ORDER BY e.event_date, e.event_time`,
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows as Event[] || []);
                    }
                }
            );
        });

        return reply.status(200).send(events);
    },

    getEventById: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { id } = request.params;

        const event = await new Promise<Event | null>((resolve, reject) => {
            db.get(
                `SELECT 
                    e.event_id,
                    e.event_date,
                    e.event_time,
                    ht.team_name as home_team_name,
                    at.team_name as away_team_name,
                    s.sport_name,
                    strftime('%w', e.event_date) as day_of_week,
                    CASE strftime('%w', e.event_date)
                        WHEN '0' THEN 'Sunday'
                        WHEN '1' THEN 'Monday'
                        WHEN '2' THEN 'Tuesday'
                        WHEN '3' THEN 'Wednesday'
                        WHEN '4' THEN 'Thursday'
                        WHEN '5' THEN 'Friday'
                        WHEN '6' THEN 'Saturday'
                    END as weekday_name
                FROM events e
                JOIN teams ht ON e._home_team_id = ht.team_id
                JOIN teams at ON e._away_team_id = at.team_id
                JOIN sports s ON e._sport_id = s.sport_id
                WHERE e.event_id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row as Event || null);
                    }
                }
            );
        });

        if (!event) {
            return reply.status(404).send({ error: "Event not found" });
        }

        return reply.status(200).send(event);
    }
};