import { Entity } from "dynamodb-toolbox";
import { BaseSchema } from ".";
import { User } from "../typings/model/user";

export type UserSchema = BaseSchema & User;

export type UserEntity = Entity<UserSchema>;

export interface ListResult<T> {
    count: number;
    data: T[];
}