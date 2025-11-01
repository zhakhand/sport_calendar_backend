import { FastifyInstance } from "fastify";
import { buildTestApp, cleanupTestApp } from "./test-helper.js";

describe("Team Routes", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await cleanupTestApp(app);
    });

    describe("POST /info/teams", () => {
        it("should create a new team", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: {
                    team_name: "Unique_Team_" + Date.now(),
                    city: "Unique_City_" + Date.now(),
                },
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty("message", "Team added successfully");
            expect(body).toHaveProperty("teamId");
        });

        it("should return 400 when team name is missing", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: {
                    city: "CityOnly",
                },
            });

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.body)).toHaveProperty("error");
        });

        it("should return 400 when city is missing", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: {
                    team_name: "TeamOnly",
                },
            });

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.body)).toHaveProperty("error");
        });
    });

    describe("GET /info/teams", () => {
        beforeEach(async () => {
            // Add test teams
            await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Grizzlies", city: "Memphis" },
            });
            await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Wizards", city: "Washington" },
            });
        });

        it("should return all teams", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/teams",
            });

            expect(response.statusCode).toBe(200);
            const teams = JSON.parse(response.body);
            expect(Array.isArray(teams)).toBe(true);
            expect(teams.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("GET /info/teams/:teamId", () => {
        let teamId: number;

        beforeEach(async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Nets", city: "New York" },
            });
            teamId = JSON.parse(response.body).teamId;
        });

        it("should return team by id", async () => {
            const response = await app.inject({
                method: "GET",
                url: `/info/teams/${teamId}`,
            });

            expect(response.statusCode).toBe(200);
            const team = JSON.parse(response.body);
            expect(team).toHaveProperty("team_id", teamId);
            expect(team).toHaveProperty("team_name", "Nets");
            expect(team).toHaveProperty("team_city", "New York");
        });

        it("should return 404 for non-existent team", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/teams/99999",
            });

            expect(response.statusCode).toBe(404);
            expect(JSON.parse(response.body)).toHaveProperty("error");
        });
    });

    describe("GET /info/teams/search/name/:teamName", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Real Madrid", city: "Madrid" },
            });
            await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Real Betis", city: "Seville" },
            });
        });

        it("should return teams matching name", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/teams/search/name/Real",
            });

            expect(response.statusCode).toBe(200);
            const teams = JSON.parse(response.body);
            expect(Array.isArray(teams)).toBe(true);
            expect(teams.length).toBeGreaterThanOrEqual(2);
            teams.forEach((team: any) => {
                expect(team.team_name).toContain("Real");
            });
        });

        it("should return 404 when no teams match", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/teams/search/name/NonExistentTeam",
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("GET /info/teams/search/city/:cityName", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Lakers", city: "Los Angeles" },
            });
            await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Clippers", city: "Los Angeles" },
            });
        });

        it("should return teams from the same city", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/teams/search/city/Los Angeles",
            });

            expect(response.statusCode).toBe(200);
            const teams = JSON.parse(response.body);
            expect(Array.isArray(teams)).toBe(true);
            expect(teams.length).toBeGreaterThanOrEqual(2);
            teams.forEach((team: any) => {
                expect(team.team_city).toContain("Los Angeles");
            });
        });
    });
});
