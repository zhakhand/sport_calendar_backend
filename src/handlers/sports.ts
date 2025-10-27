import { FastifyRequest, FastifyReply } from "fastify";

declare interface Events {
    event_id: number,
    event_time: string,
    event_date: string,
    home_team_name: string,
    away_team_name: string,
    sport_name: string,
    day_of_week: string,
    weekday_name: string
}

declare interface Sports {
    sport_id: number,
    sport_name: string
}

export const sportHandlers = {
    sportsList: async(request: FastifyRequest, reply: FastifyReply) => {
        const db = await request.server.db;

        const sports = await new Promise<Sports[]>((resolve, reject) => {
            db.all('SELECT * FROM sports', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Sports[] || []);
                }
            });
        });
        if (!sports || !sports.length) {
            return reply.status(404).send({error: "No sports found!"});
        }
        return reply.status(200).send(sports);
    },

    eventsBySportId: async(request: FastifyRequest<{Params: {sportId: number}}>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { sportId } = request.params;

        if (!sportId || isNaN(sportId)) {
            return reply.status(400).send({error: "Valid Sport ID is required"});
        }

        const events = await new Promise<Events[]>((resolve, reject) => {
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
                WHERE e._sport_id = ?`,
                [sportId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows as Events[] || []);
                    }
                }
            );
        });

        if (!events || !events.length) {
            return reply.status(404).send({error: "No events found for this sport!"});
        }

        return reply.status(200).send(events);
    },

    eventsBySportName: async(request: FastifyRequest<{Params: {sportName: string}}>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { sportName } = request.params;

        if (!sportName) {
            return reply.status(400).send({error: "Sport name is required"});
        }

        const events = await new Promise<Events[]>((resolve, reject) => {
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
                WHERE s.sport_name LIKE ?`,
                [`%${sportName}%`],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows as Events[] || []);
                    }
                }
            );
        });

        if (!events || !events.length) {
            return reply.status(404).send({error: "No events found for this sport!"});
        }

        return reply.status(200).send(events);
    },

    addSport: async(request: FastifyRequest<{Body: {sport_name: string}}>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { sport_name } = request.body;

        if (!sport_name) {
            return reply.status(400).send({error: "Sport name is required"});
        }

        const result = await new Promise<{ lastID: number }>((resolve, reject) => {
            db.run('INSERT INTO sports (sport_name) VALUES (?)', [sport_name], function(err) {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed")) {
                        reject(new Error("Sport already exists"));
                        return;
                    }
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID });
                }
            });
        }).catch((err) => {
            if (err.message === "Sport already exists") {
                return reply.status(409).send({error: err.message});
            }
            return reply.status(500).send({error: err.message});
        });

        return reply.status(201).send({message: "Sport added successfully", sportId: result.lastID});
    },
};