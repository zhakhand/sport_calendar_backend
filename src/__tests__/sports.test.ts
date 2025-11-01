import { FastifyInstance } from "fastify";
import { buildTestApp, cleanupTestApp } from "./test-helper.js";

describe("Sport Routes", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await cleanupTestApp(app);
    });

    describe("POST /info/sports", () => {
        it("should create a new sport", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/sports",
                payload: {
                    sport_name: "Unique_Sport_" + Date.now(),
                },
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty("message", "Sport added successfully");
            expect(body).toHaveProperty("sportId");
        });

        it("should return 400 when sport name is missing", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/sports",
                payload: {},
            });

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.body)).toHaveProperty("error");
        });

        it("should return 409 when sport already exists", async () => {
            await app.inject({
                method: "POST",
                url: "/info/sports",
                payload: { sport_name: "Soccer" },
            });

            const response = await app.inject({
                method: "POST",
                url: "/info/sports",
                payload: { sport_name: "Soccer" },
            });

            expect(response.statusCode).toBe(409);
            expect(JSON.parse(response.body)).toHaveProperty("error");
        });
    });

    describe("GET /info/sports", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/info/sports",
                payload: { sport_name: "Tennis" },
            });
            await app.inject({
                method: "POST",
                url: "/info/sports",
                payload: { sport_name: "Softball" },
            });
        });

        it("should return all sports", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/sports",
            });

            expect(response.statusCode).toBe(200);
            const sports = JSON.parse(response.body);
            expect(Array.isArray(sports)).toBe(true);
            expect(sports.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("GET /info/events/search/sportId/:sportId", () => {
        let sportId: number;
        let sportName: string;

        beforeEach(async () => {
            // Create sport with unique name
            sportName = `Hockey_${Date.now()}`;
            const sportResponse = await app.inject({
                method: "POST",
                url: "/info/sports",
                payload: { sport_name: sportName },
            });
            sportId = JSON.parse(sportResponse.body).sportId;

            // Create teams
            const team1Response = await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Bruins", city: "Boston" },
            });
            const team2Response = await app.inject({
                method: "POST",
                url: "/info/teams",
                payload: { team_name: "Rangers", city: "New York" },
            });

            // Create event
            await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-15",
                    time: "19:00",
                    home_team_name: "Bruins",
                    home_team_city: "Boston",
                    away_team_name: "Rangers",
                    away_team_city: "New York",
                    sport_name: sportName,
                },
            });
        });

        it("should return events for a specific sport by id", async () => {
            const response = await app.inject({
                method: "GET",
                url: `/info/events/search/sportId/${sportId}`,
            });

            expect(response.statusCode).toBe(200);
            const events = JSON.parse(response.body);
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThanOrEqual(1);
            events.forEach((event: any) => {
                expect(event).toHaveProperty("sport_name", sportName);
            });
        });

        it("should return 404 when sport has no events", async () => {
            const newSportResponse = await app.inject({
                method: "POST",
                url: "/info/sports",
                payload: { sport_name: "Cricket" },
            });
            const newSportId = JSON.parse(newSportResponse.body).sportId;

            const response = await app.inject({
                method: "GET",
                url: `/info/events/search/sportId/${newSportId}`,
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("GET /info/events/search/sportName/:sportName", () => {
        beforeEach(async () => {
            // Create event with Football sport
            await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-12-01",
                    time: "15:00",
                    home_team_name: "Patriots",
                    home_team_city: "Boston",
                    away_team_name: "Jets",
                    away_team_city: "New York",
                    sport_name: "Football",
                },
            });
        });

        it("should return events for a specific sport by name", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/sportName/Football",
            });

            expect(response.statusCode).toBe(200);
            const events = JSON.parse(response.body);
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThanOrEqual(1);
            events.forEach((event: any) => {
                expect(event.sport_name).toContain("Football");
            });
        });

        it("should return 404 when no events found for sport", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/sportName/Volleyball",
            });

            expect(response.statusCode).toBe(404);
        });
    });
});
