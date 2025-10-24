import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export async function checkRoutes(app: FastifyInstance) {
    app.get('/health', async(request: FastifyRequest, reply: FastifyReply) => {
        return {status: "ok"};
    });

    app.get('/ready', async(request: FastifyRequest, reply: FastifyReply) => {
        try {
            const db = request.server.db;
            return new Promise((resolve, reject) => {
                db.get(`SELECT 1`, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve({ status: "ready" });
                    }
                });
            });
        } catch (err) {
            return Promise.reject(err);
        }
    });
};

