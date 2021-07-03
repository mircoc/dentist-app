import { FastifyInstance } from "fastify";
import fastifySwagger from "fastify-swagger";
import P from "pino";
import routes from "./routes";
import { swaggerConfiguration } from "./routes/doc";
import { DynamoDB, DynamoDBOptions } from "./services/dynamodb";
import { ServiceInstances } from "./typings/service";
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

export async function startApp(appConfig: AppConfig): Promise<FastifyInstance> {
    // FIXME: init dynamodb service
    const dynamoDB = new DynamoDB(
        getLogger("dynamoDb"),
        {
            region: appConfig.dynamoDB.region,
            endpoint: appConfig.dynamoDB.endpoint,
            tableName: appConfig.dynamoDB.tableName,
        },
    )
    debugger;
    // FIXME: define services
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

    // add routes
    server.register(routes, { prefix: "/api/v1" });

    // start server
    await start({
        server,

        ...appConfig.http,
    });

    await server.ready();
    server.swagger();

    return server;
}
