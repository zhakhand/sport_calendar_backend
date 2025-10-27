import { create } from "domain";
import { FastifyRequest, FastifyReply } from "fastify";
import { get } from "http";

declare interface Event {
    id: string;
    time: string;
    date: string;
    location: string;
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
                    ht.team_city as location,
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
                    ht.team_city as location,
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
    },

    getEventsByLocation: async (request: FastifyRequest<{ Params: { location: string } }>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { location } = request.params;

        if (!location) {
            return reply.status(400).send({ error: "Location is required" });
        }

        const events = await new Promise<Event[]>((resolve, reject) => {
            db.all(
                `SELECT 
                    e.event_id,
                    e.event_date,
                    e.event_time,
                    ht.team_city as location,
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
                WHERE ht.team_city = ?`,
                [location],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows as Event[] || []);
                    }
                }
            );
        });

        if (!events || !events.length) {
            return reply.status(404).send({ error: "No events found for this location!" });
        }

        return reply.status(200).send(events);
    },

    getEventsByDate: async (request: FastifyRequest<{ Params: { date: string } }>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { date } = request.params;

        if (!date) {
            return reply.status(400).send({ error: "Date is required" });
        }

        const events = await new Promise<Event[]>((resolve, reject) => {
            db.all(
                `SELECT 
                    e.event_id,
                    e.event_date,
                    e.event_time,
                    ht.team_city as location,
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
                WHERE e.event_date = ?`,
                [date],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows as Event[] || []);
                    }
                }
            );
        });

        if (!events || !events.length) {
            return reply.status(404).send({ error: "No events found for this date!" });
        }

        return reply.status(200).send(events);
    },

    getEventsByTeamName: async (request: FastifyRequest<{ Params: { teamName: string } }>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { teamName } = request.params;

        if (!teamName) {
            return reply.status(400).send({ error: "Team name is required" });
        }

        const events = await new Promise<Event[]>((resolve, reject) => {
            db.all(
                `SELECT 
                    e.event_id,
                    e.event_date,
                    e.event_time,
                    ht.team_city as location,
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
                WHERE ht.team_name = ? OR at.team_name = ?`,
                [teamName, teamName],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows as Event[] || []);
                    }
                }
            );
        });

        if (!events || !events.length) {
            return reply.status(404).send({ error: "No events found for this team!" });
        }

        return reply.status(200).send(events);
    },

    createEvent: async (request: FastifyRequest<{ Body: { } }>, reply: FastifyReply) => {
        
    },
};