import { FastifyInstance } from "fastify";
import booking from "./booking";
import user from "./user";

export default async function(server: FastifyInstance): Promise<void> {
    server.register(booking, { prefix: "/booking" });
    server.register(user, { prefix: "/user" });
}