import { DynamoDB } from "../services/dynamodb";

export interface GenericService {
    close?(): Promise<void>;
}

export interface BaseServicesInstances {
    [key: string]: GenericService | object;
}

export interface ServiceInstances extends BaseServicesInstances {
    dynamoDB: DynamoDB
}

// this declaration must be in scope of the typescript interpreter to work
declare module "fastify" {
    interface FastifyRequest {
        // you must reference the interface and not the type
        services: ServiceInstances;
    }
}