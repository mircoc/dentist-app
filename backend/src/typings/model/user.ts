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

export interface LoginResponse {
    token: string;
}

export interface LogoutResponse {
    success: true;
}
