/* --- STATE --- */
export interface AuthState {
  loggedIn: boolean;
  userName: string | null;
  token: string | null;
  profile?: Profile;
  loading: boolean;
  error?: LoginErrorType | null;
  loginForm: LoginForm;
}

export interface Profile {
  name?: string;
  surname?: string;
}

export interface LoginForm {
  username?: string;
  password?: string;
}

export enum LoginErrorType {
  RESPONSE_ERROR = 1,
  USERNAME_EMPTY = 2,
  PASSWORD_EMPTY = 3,
  INVALID_CREDENTIAL = 4,
}

export interface LoginResponse {
  token: string;
}
