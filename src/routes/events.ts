import { FastifyInstance } from "fastify";
import { eventHandlers } from "../handlers/events.ts";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/info/events", eventHandlers.getAllEvents);
  app.get("/info/events/:id", eventHandlers.getEventById);
  app.post("/info/events", eventHandlers.createEvent);
  app.put("/info/events/:id", eventHandlers.updateEvent);
  app.delete("/info/events/:id", eventHandlers.deleteEvent);
}
