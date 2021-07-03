import { SwaggerOptions } from "fastify-swagger";
import schema from "../schema.json";

export const swaggerConfiguration: SwaggerOptions = {
    routePrefix: "/doc",
    swagger: {
        info: {
            title: "Dentist appointment API",
            description: "API documentation for testing appointment backend",
            version: "0.1.0",
        },
        externalDocs: {
            url: "https://swagger.io",
            description: "Find more info here",
        },
        host: "localhost",
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [
            { name: "admin", description: "Admin related end-points" },
            { name: "user", description: "User related end-points" },
            { name: "auth", description: "Authentication related end-points" },
        ],
        definitions: {
            User: schema.definitions.User,
            Booking: schema.definitions.Booking,
        },
        securityDefinitions: {
            apiKey: {
                type: "apiKey",
                name: "apiKey",
                in: "header",
            },
        },
    },
    uiConfig: {
        docExpansion: "full",
        deepLinking: false,
    },
    staticCSP: true,
    exposeRoute: true,
};
