import { FastifyLoggerInstance } from "fastify";

export function installFatalHandlers(logger: FastifyLoggerInstance): void {
    function logAndExit(
        logMessage: string,
        exitCode: number,
        error?: Error,
    ): void {
        logger.fatal(error, logMessage);
        process.exit(exitCode);
    }
    process.on("uncaughtException", (error: Error | undefined, origin = "uncaughtException") => {
        logAndExit(`${origin} ${error?.message || "unknown error"}`, 1, error);
    });
    process.on("unhandledRejection", (reason, promise) => {
        // don't exit on unhandled rejection
        // console.dir(promise);
        logger.error({
            reason,
            promise,
        }, `unhandledRejection reason: ${reason}`);
    });
    process.on("SIGINT", (signal: NodeJS.Signals) => {
        logAndExit(`received SIGINT`, 0);
    });
    process.on("SIGTERM", (signal: NodeJS.Signals) => {
        logAndExit(`received SIGTERM`, 0);
    });
}
