import { FastifyInstance } from "fastify";
import { startApp } from "./app";
import { getConfigNumber, getConfigString } from "./utils/config";
import { installFatalHandlers } from "./utils/fatal";
import { getLogger } from "./utils/logger";

const logger = getLogger("index");

installFatalHandlers(logger);


(async (): Promise<FastifyInstance> => startApp({
    http: {
        port: getConfigNumber("HTTP_PORT"),
        host: getConfigString("HTTP_HOST"),
    },
    logger,
    dynamoDB: {
        region: getConfigString("DYNAMODB_REGION"),
        endpoint: getConfigString("DYNAMODB_ENDPOINT"),
        tableName: `${getConfigString("DYNAMODB_PREFIX_TABLE")}dentist`
    },
}))().catch((error) => {
    logger.fatal(error, `caught error: ${error}`);
});
