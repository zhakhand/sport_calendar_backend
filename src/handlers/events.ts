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

declare interface UpdateEvent {
    id: string;
    time: string;
    date: string;
    homeTeamId: number;
    awayTeamId: number;
    sportId: number;
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

    getEventById: async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
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

    getSpecificEvent: async (request: FastifyRequest<{ Querystring: {
        date: string;
        home_team_name: string;
        away_team_name: string;
    } }>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { date, home_team_name, away_team_name } = request.query;

        if (!date || !home_team_name || !away_team_name) {
            return reply.status(400).send({ error: "Date, home team name, and away team name are required" });
        }

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
                WHERE e.event_date = ? AND  ht.team_name = ? AND at.team_name = ?`,
                [date, home_team_name, away_team_name],
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
        try {
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
            });
            return reply.status(201).send({ event_id: result.lastID });
        } catch (error: any) {
            if (error.message === "Event already exists") {
                return reply.status(409).send({ error: error.message });
            }
            return reply.status(500).send({ error: error.message });
        }
    },

    updateEvent: async (request: FastifyRequest<{ Params: { id: number }; Body: {
        date?: string;
        time?: string;
        home_team_name?: string;
        home_team_city?: string;
        away_team_name?: string;
        away_team_city?: string;
        sport_name?: string;
    } }>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { id } = request.params;
        const {
            date,
            time,
            home_team_name,
            home_team_city,
            away_team_name,
            away_team_city,
            sport_name,
        } = request.body;

        // Check if event exists
        const existingEvent = await new Promise<UpdateEvent | null>((resolve, reject) => {
            db.get(
                `SELECT 
                    e.event_id,
                    e.event_date,
                    e.event_time,
                    e._home_team_id,
                    e._away_team_id,
                    e._sport_id
                FROM events e
                WHERE e.event_id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row as UpdateEvent || null);
                    }
                }
            );
        });

        if (!existingEvent) {
            return reply.status(404).send({ error: "Event not found" });
        }

        // Prepare updated fields
        const updatedDate = date || existingEvent.date;
        const updatedTime = time || existingEvent.time;

        // Update sport if provided
        let sportId = existingEvent.sportId;
        if (sport_name) {
            sportId = await getOrCreateSport(db, sport_name);
        }

        // Update home team if provided
        let homeTeamId = existingEvent.homeTeamId;
        if (home_team_name && home_team_city) {
            homeTeamId = await getOrCreateTeam(db, home_team_name, home_team_city);
        }

        // Update away team if provided
        let awayTeamId = existingEvent.awayTeamId;
        if (away_team_name && away_team_city) {
            awayTeamId = await getOrCreateTeam(db, away_team_name, away_team_city);
        }
        // Update event
        await new Promise<void>((resolve, reject) => {
            db.run(
                `UPDATE events SET event_date = ?, event_time = ?, _home_team_id = ?, _away_team_id = ?, _sport_id = ? WHERE event_id = ?`,
                [updatedDate, updatedTime, homeTeamId, awayTeamId, sportId, id],
                function (this: any, err) {
                    if (err) {
                        reject(err);
                    } else {
                        request.log.info({ changes: this.changes }, 'Rows affected');
                        resolve();
                    }
                }
            );
        });

        return reply.status(200).send({ message: "Event updated successfully" });
    },

    deleteEvent: async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { id } = request.params;

        // Check if event exists
        const existingEvent = await new Promise<boolean>((resolve, reject) => {
            db.get(
                `SELECT event_id FROM events WHERE event_id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(!!row);
                    }
                }
            );
        });

        if (!existingEvent) {
            return reply.status(404).send({ error: "Event not found" });
        }

        // Delete event
        await new Promise<void>((resolve, reject) => {
            db.run(
                `DELETE FROM events WHERE event_id = ?`,
                [id],
                function (this: any, err) {
                    if (err) {
                        reject(err);
                    } else {
                        request.log.info({ rowsAffected: this.changes }, 'Event deleted');
                        resolve();
                    }
                }
            );
        });

        return reply.status(200).send({ message: "Event deleted successfully" });
    }
};