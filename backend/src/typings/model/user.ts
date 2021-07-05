export interface User {
    userName: string;
    name: string;
    surname: string;
    telephone: string;
    /**
     * date format: YYYY-MM-DD
     * 
     * @TJS-pattern ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ 
     */
    bornDate: string;
    fiscalCode: string;
}

export interface UserAuth extends User {
    password: string;
    tokens: string[];
    role: "user"|"admin";
}

export type UserCreationBody = User;

export type UserUpdateBody = Partial<Omit<User, 'userName'>>;

export interface LoginBody {
    username: string;
    password: string;
}

// FIXME: should be like this:
// {
//   "access_token":"MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3",
//   "token_type":"bearer",
//   "expires_in":3600,
//   "refresh_token":"IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk",
//   "scope":"create"
// }
// @see: https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/
export interface LoginResponse {
    token: string;
}

export interface LogoutResponse {
    success: true;
}
