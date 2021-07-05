import { AppErrorOptions } from "../../utils/error";

export interface GenericListQuerystring {
    lastId?: string;
    size?: number;
}

export interface GenericGetOneParams {
    id: string;
}

export interface ErrorResponse {
    code: AppErrorOptions["code"];
    details: {
        cause: string;
        raw?: object;
    };
    error: true;
}
