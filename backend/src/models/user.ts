import { Entity } from "dynamodb-toolbox";
import { BaseSchema } from ".";
import { User, UserAuth } from "../typings/model/user";
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

export type UserSchema = BaseSchema & User;
export type UserAuthSchema = BaseSchema & UserAuth;

export type UserEntity = Entity<UserSchema>;
export type UserAuthEntity = Entity<UserAuthSchema>;

export interface ListResult<T> {
    count: number;
    data: T[];
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 8);
}

export interface TokenConfig {
    expiresIn: string;
}

export const DefaultTokenConfig = {
    expiresIn: '72h'
};

export interface TokenContent extends JwtPayload {
    userName: string;
};

export async function generateToken(userName: string, jwtSecret: string, config: TokenConfig = DefaultTokenConfig): Promise<string> {
    return jwt.sign({ userName }, jwtSecret, { ...DefaultTokenConfig, ...config, });
}

export function verifyToken(token: string, jwtSecret: string): TokenContent {
    return jwt.verify(token, jwtSecret) as TokenContent;
}


export async function verifyPassword(savedPassword: string, checkPassword: string): Promise<boolean> {
    return await bcrypt.compare(savedPassword, checkPassword);
}
