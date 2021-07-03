import fastify, { FastifyError, FastifyInstance, FastifyServerOptions } from "fastify";
import { AppError, NotFoundError, NotFoundErrorCause, ValidationError } from "./error";
import { BaseServicesInstances } from "../typings/service";
import schema from "../schema.json";
import { FastifySchemaValidationError } from "fastify/types/schema";

export async function init<T extends BaseServicesInstances>(
    options: FastifyServerOptions,
    services: T,
): Promise<FastifyInstance> {
    const app = fastify({
        ...options,
        schemaErrorFormatter: (errors: FastifySchemaValidationError[], dataVar: string): Error => {
            return new ValidationError(errors, dataVar);
        },
        ajv: {
            customOptions: { jsonPointers: true, removeAdditional: true },
        },
    });

    app.setNotFoundHandler((request, reply) => {
        const method = request.raw.method || "unknown";
        const url = request.raw.url || "unknown";
        const notFoundError = new NotFoundError({ cause: NotFoundErrorCause.ROUTE_NOT_FOUND }, {});
        const error = {
            code: notFoundError.code,
            details: {
                cause: notFoundError.details.cause,
            },
        };
        app.log.warn(error, `route not found: ${method} ${url}`);
        reply.code(notFoundError.statusCode).send(error);
    });
    app.setErrorHandler((error: AppError | FastifyError | Error, request, reply) => {
        // uncomment this on test execution to show errors
        // console.error("errorHandler: ", error);

        if (error instanceof AppError) {
            app.log.warn(error, `error-handler for AppError: ${error.message}`);

            if (error.headers) {
                reply.headers(error.headers);
            }
            reply.code(error.statusCode || 500).send({
                code: error.code,
                details: error.details,
            });
        } else {
            app.log.error(error, `internal error: ${error.message}`);
            reply.code(500).send({
                code: "INTERNAL_ERROR",
                details: {
                    cause: "INTERNAL_ERROR",
                },
            });
        }
    });

    app.addHook("onClose", async () => {
        for (const serviceName of Object.keys(services)) {
            const service = services[serviceName];
            if (service && "close" in service && service.close) {
                await service.close();
            }
        }
    });
    // save services instances for using inside routes
    app.decorateRequest("services", { getter: () => services }, );

    // load generated json schema
    app.addSchema(schema);

    return app;
}

export interface FastifyStartOptions {
    host: string;
    port: number;
    server: FastifyInstance;
}
export async function start(options: FastifyStartOptions): Promise<void> {
    const { host, port, server } = options;
    try {
        await server.listen(port, host);
        server.log.info(`fastify server ready for requests on ${host}:${port}`);
    } catch (err) {
        server.log.error(err, `caught fastify start error: ${err.message}`);
        process.exit(1);
    }
}
