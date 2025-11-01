import { FastifyInstance } from "fastify";
import { buildTestApp, cleanupTestApp } from "./test-helper.js";

describe("Health Check Routes", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await cleanupTestApp(app);
    });

    describe("GET /health", () => {
        it("should return status ok", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/health",
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual({ status: "ok" });
        });
    });

    describe("GET /ready", () => {
        it("should return status ready when database is connected", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/ready",
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual({ status: "ready" });
        });
    });
});
