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

    teamInfo: async(request: FastifyRequest<{Params: {teamId?: number}}>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { teamId } = request.params;

        if (!teamId || isNaN(teamId)) {
            return reply.status(400).send({error: "Valid Team ID is required"});
        }

        const team = await new Promise<Teams | null>((resolve, reject) => {
            db.get('SELECT * FROM teams WHERE team_id = ?', [teamId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Teams || null);
                }
            });
        });

        if (!team) {
            return reply.status(404).send({error: "Team not found!"});
        }

        return reply.status(200).send(team);
    },

    teamSearch: async(request: FastifyRequest<{Params: {teamName?: string}}>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { teamName } = request.params;

        if (!teamName) {
            return reply.status(400).send({error: "Team name is required"});
        }

        const teams = await new Promise<Teams[]>((resolve, reject) => {
            db.all('SELECT * FROM teams WHERE team_name LIKE ?', [`%${teamName}%`], (err, rows) => {
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

    teamsByCity: async(request: FastifyRequest<{Params: {cityName?: string}}>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { cityName } = request.params;

        if (!cityName) {
            return reply.status(400).send({error: "City name is required"});
        }

        const teams = await new Promise<Teams[]>((resolve, reject) => {
            db.all('SELECT * FROM teams WHERE team_city LIKE ?', [`%${cityName}%`], (err, rows) => {
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

    addTeam: async(request: FastifyRequest<{Body: {team_name: string, city: string}}>, reply: FastifyReply) => {
        const db = await request.server.db;
        const { team_name, city } = request.body;

        if (!team_name || !city) {
            return reply.status(400).send({error: "Team name and city are required"});
        }

        const result = await new Promise<{ lastID: number }>((resolve, reject) => {
            db.run('INSERT INTO teams (team_name, team_city) VALUES (?, ?)', [team_name, city], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        reject(new Error('Team already exists'));
                    }
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID });
                }
            });
        }).catch(err => {
            if (err.message === 'Team already exists') {
                return reply.status(409).send({error: "Team already exists"});
            }
            throw err;
        });

        return reply.status(201).send({message: "Team added successfully", teamId: result.lastID});
    }
};