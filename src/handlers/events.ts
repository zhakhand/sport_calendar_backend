import { FastifyRequest, FastifyReply } from "fastify";
import { getOrCreateSport, getOrCreateTeam } from "../utils/events.ts";

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

    createEvent: async (request: FastifyRequest<{ Body: {
        date: string;
        time: string;
        home_team_name: string;
        home_team_city: string;
        away_team_name: string;
        away_team_city: string;
        sport_name: string;
    } }>, reply: FastifyReply) => {
        const db = await request.server.db;
        const {
            date,
            time,
            home_team_name,
            home_team_city,
            away_team_name,
            away_team_city,
            sport_name,
        } = request.body;

        // Check if sport exists
        let sportId: number;
        sportId = await getOrCreateSport(db, sport_name);
        // Check if home team exists
        let homeTeamId: number;
        homeTeamId = await getOrCreateTeam(db, home_team_name, home_team_city);
        // Check if away team exists
        let awayTeamId: number;
        awayTeamId = await getOrCreateTeam(db, away_team_name, away_team_city);

        // Insert new event
        const result = await new Promise<{ lastID: number }>((resolve, reject) => {
            db.run(
                `INSERT INTO events (event_date, event_time, _home_team_id, _away_team_id, _sport_id) VALUES (?, ?, ?, ?, ?)`,
                [date, time, homeTeamId, awayTeamId, sportId],
                function (this: any, err) {
                    if (err) {
                        if (err.message.includes("UNIQUE constraint failed")) {
                            return reject(new Error("Event already exists"));
                        }
                        reject(err);
                    } else {
                        resolve({ lastID: this.lastID });
                    }
                }
            );
        }).catch((error) => {
            if (error.message === "Event already exists") {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        });

        return reply.status(201).send({ event_id: result.lastID });
    },
};