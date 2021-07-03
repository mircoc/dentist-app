export const partitionKey = "pk";
export const sortKey = "sk";

export interface BaseSchema {
    created: string;
    modified: string;
    version: number;
}
