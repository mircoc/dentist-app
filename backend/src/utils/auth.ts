import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyAuth from "fastify-auth";
import { UserAuthEntity, UserEntity } from "../models/user";
import { DynamoDB } from "../services/dynamodb";
import { LoginBody, UserAuth } from "../typings/model/user";
import { InvalidCredentialError, InvalidTokenError } from "./error";

// using declaration merging, add your plugin props to the appropriate fastify interfaces
declare module "fastify" {
    interface FastifyRequest {
        /**
         * authenticated user
         */
        user?: UserAuth;

        /**
         * token string used for authentication
         */
        token?: string;
    }

    interface FastifyInstance {
        asyncVerifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyInstance>,
        asyncVerifyUsernameAndPassword: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyInstance>,
    }
}

export function decorateAppWithAuthentication(app: FastifyInstance, dynamoDbService: DynamoDB) {
    app.decorate("asyncVerifyJWT", async (request: FastifyRequest, reply: FastifyReply) => {
        // FIXME: check if errors are handled by my custom fastify error handler
        if (!request.headers.authorization) {
            throw new InvalidTokenError({ missingAuthHeader: true });
        }
        const token = request.headers.authorization.replace("Bearer ", "");
        const user = await dynamoDbService.getUserByToken(token);

        request.user = user;
        request.token = token; // used in logout route
    })
    .decorate("asyncVerifyUsernameAndPassword", async (request: FastifyRequest<{Body:LoginBody}>, reply: FastifyReply) => {
        // FIXME: check if errors are handled by my custom fastify error handler
        if (!request.body) {
            throw new InvalidCredentialError({ error: "Missing username and/or password!" });
        }
        const {username, password} = request.body;
        const user = await dynamoDbService.getUserByCredentials(username, password);
        request.user = user;
    })
    .register(fastifyAuth);
}
