import { FastifyInstance } from "fastify";
import admin from "./admin";
import auth from "./auth";
import user from "./user";

export default async function(server: FastifyInstance): Promise<void> {
    server.register(admin, { prefix: "/admin" });
    server.register(user, { prefix: "/user" });
    server.register(auth, { prefix: "/" });
}