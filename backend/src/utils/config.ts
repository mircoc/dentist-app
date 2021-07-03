import { AppError, AppErrorOptions, ConfigError, ConfigErrorCause } from "./error";

function get(key: string): string {
    const searchKey = key.toUpperCase();
    const val = process.env[searchKey];
    if (val !== undefined) {
        return val;
    }
    throw new ConfigError({ cause: ConfigErrorCause.CONFIG_NOT_FOUND }, { key });
}

export function getConfigString(key: string): string {
    return get(key);
}

export function getConfigNumber(key: string): number {
    const value = Number(get(key));
    if (Number.isNaN(value)) {
        throw new ConfigError({ cause: ConfigErrorCause.CONFIG_NOT_NUMBER }, { key });
    }
    return value;
}