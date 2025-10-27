import { FastifyInstance } from "fastify";
import { eventHandlers } from "../handlers/events.ts";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/info/events", eventHandlers.getAllEvents);

  app.get("/info/events/:id", eventHandlers.getEventById);

  app.get(
    "/info/events/search/location/:location",
    eventHandlers.getEventsByLocation
  );

  app.get("/info/events/search/date/:date", eventHandlers.getEventsByDate);

  app.get(
    "/info/events/search/team/:teamName",
    eventHandlers.getEventsByTeamName
  );

  app.post("/info/events", eventHandlers.createEvent);

  app.put("/info/events/:id", eventHandlers.updateEvent);

  app.delete("/info/events/:id", eventHandlers.deleteEvent);
}
