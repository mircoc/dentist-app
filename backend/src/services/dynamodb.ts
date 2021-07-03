import { Entity, Table } from "dynamodb-toolbox";
import AWS, { DynamoDB as ddb } from "aws-sdk";
import { Logger } from "pino";
import { BookingEntity } from "../models/booking";
import { partitionKey, sortKey } from "../models";
import { EntityAttributes } from "dynamodb-toolbox/dist/classes/Entity";
import { ListResult, UserEntity, UserSchema } from "../models/user";
import { User, UserCreationBody, UserUpdateBody } from "../typings/model/user";
import { AlreadyExistsError, NotFoundError, NotFoundErrorCause } from "../utils/error";

export interface DynamoDBOptions {
    endpoint: string;
    region: string;
    tableName: string;
}
export class DynamoDB {
    private table: Table;
    private documentClient: ddb.DocumentClient;

    constructor(private logger: Logger, private options: DynamoDBOptions) {
        // AWS.config.update({
        //     region: options.region,
        // });
        // instantiate DocumentClient
        this.documentClient = new ddb.DocumentClient({
            region: options.region,
            endpoint: options.endpoint,
        });
        this.table = this.getTable(options.tableName);
    }

    private getCommonAttributes(): EntityAttributes {
        return {
            version: { type: "number", default: () => ({ $add: 1 }) },
        };
    }

    private handleAlreadyExistsError(err: any, duplicateItem: string): never {
        if (err.code === "ConditionalCheckFailedException") {
            this.logger.info(`Item already exists: ${duplicateItem}`, { err, duplicateItem });
            throw new AlreadyExistsError({ err, duplicateItem });
        }
        throw err;
    }
    private handleNotFoundError(err: any, itemKey: string): never {
        if (err.code === "ConditionalCheckFailedException") {
            this.logger.info(`Item not found: ${itemKey}`, { err, itemKey });
            throw new NotFoundError(
                { cause: NotFoundErrorCause.OBJECT_NOT_FOUND },
                { err, itemKey },
            );
        }
        throw err;
    }

    async createUser(user: UserCreationBody): Promise<UserEntity> {
        try {
            const entity = this.getUserEntity();
            const res = await entity.put(
                {
                    ...user,
                    version: 1,
                },
                {
                    conditions: { attr: entity.partitionKey, exists: false },
                },
            );
            // FIXME: check what's inside res and return
            debugger;
            this.logger.info({ res }, `Item created: ${user.userName}; ${JSON.stringify(res)}`);
            const resGet = await entity.get(user);
            this.logger.info(
                { resGet },
                `Item loaded: ${user.userName}; ${JSON.stringify(resGet)}`,
            );
            return resGet.Item;
        } catch (err) {
            return this.handleAlreadyExistsError(err, user.userName);
        }
    }

    async updateUser(userName: string, user: UserUpdateBody): Promise<UserEntity> {
        try {
            const entity = this.getUserEntity();
            const res: any = await entity.update(
                {
                    userName,
                    ...user,
                },
                {
                    conditions: { attr: entity.partitionKey, exists: true },
                    returnValues: "ALL_NEW",
                },
            );
            // FIXME: check what's inside res and return
            debugger;
            this.logger.info({ res }, `Item updated: ${userName}; ${JSON.stringify(res)}`);
            return res ? res.Attributes : {};
        } catch (err) {
            return this.handleNotFoundError(err, userName);
        }
    }

    async deleteUser(userName: string): Promise<boolean> {
        try {
            const entity = this.getUserEntity();
            const res: any = await entity.delete(
                {
                    userName,
                },
                {
                    conditions: { attr: entity.partitionKey, exists: true },
                },
            );
            // FIXME: check what's inside res
            debugger;
            this.logger.info({ res }, `Item deleted: ${userName}`);
            return true;
        } catch (err) {
            return this.handleNotFoundError(err, userName);
        }
    }

    /**
     * FIXME: i use scan here... it can be improved using secondary index
     */
    async listUser(): Promise<ListResult<UserSchema>> {
        const entity = this.getUserEntity();
        const res: any = await entity.scan({
            filters: {
                attr: entity.partitionKey,
                beginsWith: "user#",
            },
            // pagination todo:
            // startKey: {
            //     partitionKey: "aaa",
            //     sortKey: "aaaa",
            // },
            // limit: 100,
        });
        // FIXME: check what's inside res
        debugger;
        this.logger.info(`Items: ${res.Count}`, { res });
        return {
            count: res.Count,
            data: res.Items
        };
    }

    async getUser(userName: string): Promise<UserEntity> {
        try {
            const entity = this.getUserEntity();
            const resGet = await entity.get({
                userName,
            });
            this.logger.info({ resGet }, `Item loaded: ${userName}; ${JSON.stringify(resGet)}`);
            return resGet.Item;
        } catch (err) {
            return this.handleNotFoundError(err, userName);
        }
    }

    getUserEntity(): UserEntity {
        this.logger.debug(`creating entity User from table ${this.table.name}`);
        const device = new Entity({
            // Specify entity name
            name: "User",

            // Define attributes
            attributes: {
                pk: { hidden: true, partitionKey: true },
                pkPrefix: ["pk", 0, { type: "string", hidden: true, save: false, default: "user" }],
                pkUsername: [
                    "pk",
                    1,
                    {
                        required: true,
                        hidden: true,
                        save: false,
                        default: (values: Record<string, unknown>) => values["userName"],
                    },
                ],

                sk: { hidden: true, sortKey: true },
                skPrefix: ["sk", 0, { type: "string", hidden: true, save: false, default: "user" }],
                userName: [
                    "sk",
                    1,
                    {
                        required: true,
                        hidden: false,
                        save: false,
                    },
                ],

                type: { type: "string", hidden: true, default: "user" },

                name: { type: "string" },
                surname: { type: "string" },
                telephone: { type: "string" },
                fiscalCode: { type: "string" },
                bornDate: { type: "string" },

                ...this.getCommonAttributes(),
            },

            // Assign it to our table
            table: this.table,
        });
        return device;
    }

    getBookingEntity(): BookingEntity {
        this.logger.debug(`creating entity Booking from table ${this.table.name}`);
        const device = new Entity({
            // Specify entity name
            name: "Booking",

            // Define attributes
            attributes: {
                pk: { hidden: true, partitionKey: true },
                pkPrefix: [
                    "pk",
                    0,
                    { type: "string", hidden: true, save: false, default: "booking" },
                ],
                year: ["pk", 1, { required: true, hidden: true, save: false }],
                month: ["pk", 2, { required: true, hidden: true, save: false }],
                day: ["pk", 3, { required: true, hidden: true, save: false }],

                sk: { hidden: true, sortKey: true },
                hour: ["sk", 0, { required: true, hidden: true, save: false }],
                username: ["sk", 1, { required: true, hidden: true, save: false }],

                type: { type: "string", hidden: true, default: "booking" },

                description: { type: "string" },

                ...this.getCommonAttributes(),
            },

            // Assign it to our table
            table: this.table,
        });
        return device;
    }

    private getTable(name: string): Table {
        this.logger.debug(`loading table ${name}`);
        // Instantiate a table
        const table = new Table({
            // Specify table name (used by DynamoDB)
            name,

            // Define partition and sort keys
            partitionKey,
            sortKey,

            // Add the DocumentClient
            DocumentClient: this.documentClient,
        });
        return table;
    }
}
