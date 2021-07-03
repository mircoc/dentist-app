import { FastifyInstance } from "fastify";
import fastifySwagger from "fastify-swagger";
import P from "pino";
import routes from "./routes";
import { swaggerConfiguration } from "./routes/doc";
import { DynamoDB, DynamoDBOptions } from "./services/dynamodb";
import { ServiceInstances } from "./typings/service";
import { decorateAppWithAuthentication } from "./utils/auth";
import { init, start } from "./utils/fastify";
import { getLogger } from "./utils/logger";


export interface AppConfig {
    http: {
        port: number;
        host: string;
    };
    logger: P.Logger;
    dynamoDB: DynamoDBOptions;
}

export async function startApp(appConfig: AppConfig): Promise<[FastifyInstance, ServiceInstances]> {
    // init dynamodb service
    const dynamoDB = new DynamoDB(
        getLogger("dynamoDb"),
        appConfig.dynamoDB,
    );

    const services: ServiceInstances = {
        dynamoDB,
    };

    // init fastify
    const server = await init(
        {
            logger: appConfig.logger,
        },
        services,
    );

    // add documentation route for the following routes
    server.register(fastifySwagger, swaggerConfiguration);
    
    // add auth handlers
    decorateAppWithAuthentication(server, dynamoDB);

    // add routes
    server.register(routes, { prefix: "/api/v1" });

    
    // start server
    await start({
        server,

        ...appConfig.http,
    });

    await server.ready();
    server.swagger();

    return [server, services];
}
