import { FastifySchemaValidationError } from "fastify/types/schema";

export interface AppErrorOptions {
    code: string;
    logInfo: Record<string, unknown>;
    details: {
        cause: string;
        raw?: Record<string, unknown>;
    };
    statusCode: number;
    headers?: Record<string, string | number>;
};

export class AppError extends Error {
    readonly statusCode: AppErrorOptions["statusCode"];
    readonly code: AppErrorOptions["code"];
    readonly logInfo: AppErrorOptions["logInfo"];
    readonly details: AppErrorOptions["details"];
    readonly headers: AppErrorOptions["headers"];

    constructor(options: AppErrorOptions) {
        super();
        this.code = options.code;
        this.logInfo = options.logInfo;
        this.details = options.details;
        this.statusCode = options.statusCode;
        this.headers = options.headers;
    }
}

export class ConfigError extends AppError {
    constructor(details: AppErrorOptions["details"] & { cause: ConfigErrorCause }, logInfo: AppErrorOptions["logInfo"]) {
        const options = {
            code: "CONFIG_ERROR",
            statusCode: 500,
            details,
            logInfo,
        };
        super(options);
    }
}

export enum ConfigErrorCause {
    CONFIG_NOT_FOUND = "CONFIG_NOT_FOUND",
    CONFIG_NOT_NUMBER = "CONFIG_NOT_NUMBER",
}

export class NotFoundError extends AppError {
    constructor(details: AppErrorOptions["details"] & { cause: NotFoundErrorCause }, logInfo: AppErrorOptions["logInfo"]) {
        const options = {
            code: "NOT_FOUND_ERROR",
            statusCode: 404,
            details,
            logInfo,
        };
        super(options);
    }
}

export enum NotFoundErrorCause {
    ROUTE_NOT_FOUND = "ROUTE_NOT_FOUND",
    OBJECT_NOT_FOUND = "OBJECT_NOT_FOUND",
}

export class ValidationError extends AppError {
    constructor(errors: FastifySchemaValidationError[], dataVar: string) {
        const options = {
            code: "VALIDATION_ERROR",
            statusCode: 400,
            details: {
                cause: "BAD_FORMAT",
                raw: {
                    errors: errors.map((e) => `${e.dataPath}: ${e.message}`),
                    dataVar,
                },
            },
            logInfo: { errors },
        };
        super(options);
    }
}

export class AlreadyExistsError extends AppError {
    constructor(logInfo: AppErrorOptions["logInfo"]) {
        const options: AppErrorOptions = {
            code: "ALREADY_EXISTS_ERROR",
            statusCode: 409,
            details: {
                cause: "ALREADY_EXISTS",
            },
            logInfo,
        };
        super(options);
    }
}

export class InvalidCredentialError extends AppError {
    constructor(logInfo: AppErrorOptions["logInfo"]) {
        const options: AppErrorOptions = {
            code: "INVALID_CREDENTIAL_ERROR",
            statusCode: 400,
            details: {
                cause: "INVALID_CREDENTIAL"
            },
            logInfo,
        };
        super(options);
    }
}

export class InvalidTokenError extends AppError {
    constructor(logInfo: AppErrorOptions["logInfo"]) {
        const options = {
            code: "INVALID_TOKEN_ERROR",
            statusCode: 401,
            details: {
                cause: "INVALID_TOKEN"
            },
            logInfo,
        };
        super(options);
    }
}
