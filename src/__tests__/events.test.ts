import { FastifyInstance } from "fastify";
import { buildTestApp, cleanupTestApp } from "./test-helper.js";

describe("Event Routes", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await cleanupTestApp(app);
    });

    describe("POST /info/events", () => {
        it("should create a new event", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-10",
                    time: "19:30",
                    home_team_name: "Lakers",
                    home_team_city: "Los Angeles",
                    away_team_name: "Warriors",
                    away_team_city: "San Francisco",
                    sport_name: "Basketball",
                },
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty("event_id");
        });

        it("should create teams and sport if they don't exist", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-11",
                    time: "20:00",
                    home_team_name: "NewTeam1",
                    home_team_city: "City1",
                    away_team_name: "NewTeam2",
                    away_team_city: "City2",
                    sport_name: "NewSport",
                },
            });

            expect(response.statusCode).toBe(201);
            expect(JSON.parse(response.body)).toHaveProperty("event_id");
        });

        it("should return 409 when event already exists", async () => {
            await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-12",
                    time: "18:00",
                    home_team_name: "TeamA",
                    home_team_city: "CityA",
                    away_team_name: "TeamB",
                    away_team_city: "CityB",
                    sport_name: "Sport1",
                },
            });

            const response = await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-12",
                    time: "18:00",
                    home_team_name: "TeamA",
                    home_team_city: "CityA",
                    away_team_name: "TeamB",
                    away_team_city: "CityB",
                    sport_name: "Sport1",
                },
            });

            expect(response.statusCode).toBe(409);
        });
    });

    describe("GET /info/events", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-15",
                    time: "19:00",
                    home_team_name: "Celtics",
                    home_team_city: "Boston",
                    away_team_name: "Heat",
                    away_team_city: "Miami",
                    sport_name: "Basketball",
                },
            });
        });

        it("should return all events", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events",
            });

            expect(response.statusCode).toBe(200);
            const events = JSON.parse(response.body);
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThanOrEqual(1);
            expect(events[0]).toHaveProperty("event_id");
            expect(events[0]).toHaveProperty("event_date");
            expect(events[0]).toHaveProperty("event_time");
            expect(events[0]).toHaveProperty("home_team_name");
            expect(events[0]).toHaveProperty("away_team_name");
            expect(events[0]).toHaveProperty("sport_name");
            expect(events[0]).toHaveProperty("weekday_name");
            expect(events[0]).toHaveProperty("day_of_week");
        });
    });

    describe("GET /info/events/:id", () => {
        let eventId: number;

        beforeEach(async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-16",
                    time: "20:00",
                    home_team_name: "Knicks",
                    home_team_city: "New York",
                    away_team_name: "Bulls",
                    away_team_city: "Chicago",
                    sport_name: "Basketball",
                },
            });
            eventId = JSON.parse(response.body).event_id;
        });

        it("should return event by id", async () => {
            const response = await app.inject({
                method: "GET",
                url: `/info/events/${eventId}`,
            });

            expect(response.statusCode).toBe(200);
            const event = JSON.parse(response.body);
            expect(event).toHaveProperty("event_id", eventId);
            expect(event).toHaveProperty("home_team_name", "Knicks");
            expect(event).toHaveProperty("away_team_name", "Bulls");
        });

        it("should return 404 for non-existent event", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/99999",
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("GET /info/events/search/date/:date", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-12-25",
                    time: "12:00",
                    home_team_name: "Team1",
                    home_team_city: "City1",
                    away_team_name: "Team2",
                    away_team_city: "City2",
                    sport_name: "Sport1",
                },
            });
        });

        it("should return events for specific date", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/date/2025-12-25",
            });

            expect(response.statusCode).toBe(200);
            const events = JSON.parse(response.body);
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThanOrEqual(1);
            events.forEach((event: any) => {
                expect(event.event_date).toBe("2025-12-25");
            });
        });

        it("should return 404 when no events on date", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/date/2099-01-01",
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("GET /info/events/search/location/:location", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-20",
                    time: "19:00",
                    home_team_name: "Lakers",
                    home_team_city: "Los Angeles",
                    away_team_name: "Clippers",
                    away_team_city: "Los Angeles",
                    sport_name: "Basketball",
                },
            });
        });

        it("should return events in specific location", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/location/Los Angeles",
            });

            expect(response.statusCode).toBe(200);
            const events = JSON.parse(response.body);
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThanOrEqual(1);
            events.forEach((event: any) => {
                expect(event.location).toContain("Los Angeles");
            });
        });

        it("should return 404 when no events in location", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/location/NonExistentCity",
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("GET /info/events/search/team/:teamName", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-21",
                    time: "19:00",
                    home_team_name: "Patriots",
                    home_team_city: "Boston",
                    away_team_name: "Jets",
                    away_team_city: "New York",
                    sport_name: "Football",
                },
            });
        });

        it("should return events for specific team", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/team/Patriots",
            });

            expect(response.statusCode).toBe(200);
            const events = JSON.parse(response.body);
            expect(Array.isArray(events)).toBe(true);
            expect(events.length).toBeGreaterThanOrEqual(1);
        });

        it("should return 404 when team has no events", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/team/NonExistentTeam",
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("GET /info/events/search/specific", () => {
        beforeEach(async () => {
            await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-22",
                    time: "20:00",
                    home_team_name: "Bruins",
                    home_team_city: "Boston",
                    away_team_name: "Rangers",
                    away_team_city: "New York",
                    sport_name: "Hockey",
                },
            });
        });

        it("should return specific event by date and teams", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/specific?date=2025-11-22&home_team_name=Bruins&away_team_name=Rangers",
            });

            expect(response.statusCode).toBe(200);
            const event = JSON.parse(response.body);
            expect(event).toHaveProperty("event_date", "2025-11-22");
            expect(event).toHaveProperty("home_team_name", "Bruins");
            expect(event).toHaveProperty("away_team_name", "Rangers");
        });

        it("should return 400 when parameters are missing", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/specific?date=2025-11-22",
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 404 when event not found", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/info/events/search/specific?date=2099-01-01&home_team_name=TeamX&away_team_name=TeamY",
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("PUT /info/events/:id", () => {
        let eventId: number;

        beforeEach(async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-23",
                    time: "19:00",
                    home_team_name: "TeamX",
                    home_team_city: "CityX",
                    away_team_name: "TeamY",
                    away_team_city: "CityY",
                    sport_name: "SportX",
                },
            });
            eventId = JSON.parse(response.body).event_id;
        });

        it("should update event", async () => {
            const response = await app.inject({
                method: "PUT",
                url: `/info/events/${eventId}`,
                payload: {
                    date: "2025-11-24",
                    time: "20:00",
                },
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toHaveProperty("message", "Event updated successfully");

            // Verify the update
            const getResponse = await app.inject({
                method: "GET",
                url: `/info/events/${eventId}`,
            });
            const event = JSON.parse(getResponse.body);
            expect(event.event_date).toBe("2025-11-24");
            expect(event.event_time).toBe("20:00");
        });

        it("should return 404 for non-existent event", async () => {
            const response = await app.inject({
                method: "PUT",
                url: "/info/events/99999",
                payload: {
                    date: "2025-11-25",
                },
            });

            expect(response.statusCode).toBe(404);
        });
    });

    describe("DELETE /info/events/:id", () => {
        let eventId: number;

        beforeEach(async () => {
            const response = await app.inject({
                method: "POST",
                url: "/info/events",
                payload: {
                    date: "2025-11-26",
                    time: "19:00",
                    home_team_name: "DeleteTeam1",
                    home_team_city: "City1",
                    away_team_name: "DeleteTeam2",
                    away_team_city: "City2",
                    sport_name: "DeleteSport",
                },
            });
            eventId = JSON.parse(response.body).event_id;
        });

        it("should delete event", async () => {
            const response = await app.inject({
                method: "DELETE",
                url: `/info/events/${eventId}`,
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toHaveProperty("message", "Event deleted successfully");

            // Verify deletion
            const getResponse = await app.inject({
                method: "GET",
                url: `/info/events/${eventId}`,
            });
            expect(getResponse.statusCode).toBe(404);
        });

        it("should return 404 for non-existent event", async () => {
            const response = await app.inject({
                method: "DELETE",
                url: "/info/events/99999",
            });

            expect(response.statusCode).toBe(404);
        });
    });
});
