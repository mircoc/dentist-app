import { SwaggerOptions } from "fastify-swagger";
import { OpenAPIV3 } from 'openapi-types';
import schema from "../schema.json";

const conponentSchemas = {
    User: schema.definitions.User,
    Booking: schema.definitions.Booking,
    UserAuth: schema.definitions.UserAuth,
} as unknown as OpenAPIV3.ComponentsObject["schemas"];

export const swaggerConfiguration: SwaggerOptions = {
    routePrefix: "/doc",
    // swagger: {
    //     info: {
    //         title: "Dentist appointment API",
    //         description: "API documentation for testing appointment backend",
    //         version: "0.1.0",
    //     },
    //     externalDocs: {
    //         url: "https://swagger.io",
    //         description: "Find more info here",
    //     },
    //     host: "localhost",
    //     schemes: ["http"],
    //     consumes: ["application/json"],
    //     produces: ["application/json"],
    //     tags: [
    //         { name: "admin", description: "Admin related end-points" },
    //         { name: "user", description: "User related end-points" },
    //         { name: "auth", description: "Authentication related end-points" },
    //     ],
    //     definitions: {
    //         User: schema.definitions.User,
    //         Booking: schema.definitions.Booking,
    //     },
    //     securityDefinitions: {
    //         jwtToken: {
    //             type: "oauth2",
    //             flow: "application",
    //             tokenUrl: "/api​/v1​/login",
    //             scopes: [],
    //         },
    //     },
    // },
    openapi: {
        info: {
            title: "Dentist appointment API",
            description: "API documentation for testing appointment backend",
            version: "0.1.0",
        },
        externalDocs: {
            url: "https://swagger.io",
            description: "Find more info here",
        },
        servers: [
            {
                url: "http://localhost:4000",
            },
        ],
        components: {
            securitySchemes: {
                jwtToken: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "jwt token authentication"
                },
            },
            schemas: conponentSchemas,
        },
        security: [
            {
                jwtToken: [],
            },
        ],
        tags: [
            { name: "admin", description: "Admin related end-points" },
            { name: "user", description: "User related end-points" },
            { name: "auth", description: "Authentication related end-points" },
        ],
    },
    uiConfig: {
        docExpansion: "full",
        deepLinking: false,
    },
    staticCSP: true,
    exposeRoute: true,
};
