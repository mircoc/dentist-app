import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { LoginBody, LoginResponse } from "../typings/model/user";
import schema from "../schema.json";
import { InvalidCredentialError } from "../utils/error";

const loginOptions: RouteShorthandOptions = {
    schema: {
        description: "Login with username and password",
        tags: ["auth"],
        body: {
            ...schema.definitions.LoginBody,
        },
        response: {
            200: { ...schema.definitions.LoginResponse },
            401: { ...schema.definitions.ErrorResponse },
            500: { ...schema.definitions.ErrorResponse },
        },
    },
};

const logoutOptions: RouteShorthandOptions = {
    schema: {
        description: "Logout an authenticated user",
        tags: ["auth"],
        response: {
            200: { ...schema.definitions.LogoutResponse },
            500: { ...schema.definitions.ErrorResponse },
        },
    },
};

export default async function(server: FastifyInstance): Promise<void> {
    server.post<{
        Body: LoginBody;
    }>(
        "/login",
        {
            ...loginOptions,
            preHandler: server.auth([ server.asyncVerifyUsernameAndPassword ]),
        },
        async (request, reply): Promise<LoginResponse> => {
            const dynamoDB = request.services.dynamoDB;
            if (!request.user) {
                throw new InvalidCredentialError({ error: "user not found on request" });
            }
            const result = await dynamoDB.updateUserLogin(request.user);
            return result;
        }
    );

    server.post<{
        Body: LoginBody;
    }>(
        "/logout",
        {
            ...logoutOptions,
            preHandler: server.auth([ server.asyncVerifyJWT ]),
        },
        async (request, reply) => {
            const dynamoDB = request.services.dynamoDB;
            if (!request.user) {
                throw new InvalidCredentialError({ error: "user not found on request" });
            }
            if (!request.token) {
                throw new InvalidCredentialError({ error: "token not found on request" });
            }
            const success = await dynamoDB.updateUserLogout(request.user, request.token);
            return { success };
        }
    );

}