import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { GenericGetOneParams, GenericListQuerystring } from "../../typings/model/common";
import { UserCreationBody, UserUpdateBody } from "../../typings/model/user";
import schema from "../../schema.json";

const createOptions: RouteShorthandOptions = {
    schema: {
        description: "Create an user",
        tags: ["admin"],
        body: {
            // bug in fastify-swagger prevent the next line to works...
            //$ref: "app#/definitions/UserCreationBody"
            // this is working even if it's not nice ...
            ...schema.definitions.UserCreationBody,
        },
        response: {
            200: { ...schema.definitions.User },
        },
        security: [
            {
                jwtToken: ["admin"],
            },
        ],
    },
};

const listOptions: RouteShorthandOptions = {
    schema: {
        description: "List all users",
        tags: ["admin"],
        querystring: { ...schema.definitions.GenericListQuerystring },
        response: {
            200: {
                properties: {
                    
                    count: {
                        type: "string"
                    },
                    data: {
                        type: "array",
                        items: {
                            ...schema.definitions.User
                        },
                    }
                },
                required: [
                    "count",
                    "data"
                ],
                type: "object"
            },
        },
        security: [
            {
                jwtToken: ["admin"],
            },
        ],
    },
};

const getOneOptions: RouteShorthandOptions = {
    schema: {
        description: "Get one user by id",
        tags: ["admin"],
        params: { ...schema.definitions.GenericGetOneParams },
        response: {
            200: { ...schema.definitions.User },
        },
        security: [
            {
                jwtToken: ["admin"],
            },
        ],
    },
};

const editOneOptions: RouteShorthandOptions = {
    schema: {
        description: "Edit one user by id",
        tags: ["admin"],
        params: { ...schema.definitions.GenericGetOneParams },
        body: {
            ...schema.definitions.UserUpdateBody,
        },
        response: {
            200: { ...schema.definitions.User },
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
    
    server.get<{
        Querystring: GenericListQuerystring;
    }>("/", listOptions, async (request, reply) => {
        return request.services.dynamoDB.listUser();
    });

    server.get<{
        Params: GenericGetOneParams;
    }>("/:id", getOneOptions, async (request, reply) => {
        return request.services.dynamoDB.getUser(request.params["id"]);
    });

    server.put<{
        Params: GenericGetOneParams;
        Body: UserUpdateBody;
    }>("/:id", editOneOptions, async (request, reply) => {
        return request.services.dynamoDB.updateUser(request.params.id, request.body,);
    });

    server.delete<{
        Params: GenericGetOneParams;
    }>("/:id", getOneOptions, async (request, reply) => {
        return request.services.dynamoDB.deleteUser(request.params.id);
    });

    server.post<{Body: UserCreationBody}>("/", createOptions, async (request, reply) => {
        return request.services.dynamoDB.createUser(request.body);
    });
}
