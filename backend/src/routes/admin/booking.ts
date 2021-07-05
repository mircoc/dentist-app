import { FastifyInstance, RouteShorthandOptions } from "fastify";

const opts: RouteShorthandOptions = {
    schema: {
        description: "Create an appointment for a specific date and user",
        tags: ["admin"],
        response: {
            200: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                    },
                },
            },
        },
        security: [
            {
                jwtToken: ["admin"],
            },
        ],
    },
};

export default async function (server: FastifyInstance): Promise<void> {
    server.addHook("preHandler", server.asyncVerifyJWT);
    server.post<{
        // FIXME:
        // Params: GenericGetOneParams;
        // Body: UserUpdateBody;
    }>("/:year/:month/:day", opts, async (request, reply) => {
        return { pong: "it worked!" };
    });
}
