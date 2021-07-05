import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { authSaga } from './saga';
import { AuthState, LoginErrorType, Profile } from './types';

export const initialState: AuthState = {
  loggedIn: false,
  loading: false,
  error: null,
  token: null,
  userName: null,
  loginForm: {},
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLogin(state) {
      state.loading = true;
      state.error = null;
    },
    changeFormUsername(state, action: PayloadAction<string>) {
      state.loginForm.username = action.payload;
    },
    changeFormPassword(state, action: PayloadAction<string>) {
      state.loginForm.password = action.payload;
    },
    loginSuccess(
      state,
      action: PayloadAction<{
        token: string;
        userName: string;
      }>,
    ) {
      state.loading = false;
      state.error = null;
      state.loggedIn = true;
      state.userName = action.payload.userName;
      state.token = action.payload.token;
    },
    loginError(state, action: PayloadAction<LoginErrorType>) {
      state.loading = false;
      state.error = action.payload;
      state.loggedIn = false;
      state.profile = {};
      state.userName = null;
      state.token = null;
    },
    logout(state) {
      state.loggedIn = false;
      state.profile = {};
      state.userName = null;
      state.token = null;
    },
  },
});

export const { actions: authActions } = slice;

export const useAuthSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: authSaga });
  return { actions: slice.actions };
};

/**
 * Example Usage:
 *
 * export function MyComponentNeedingThisSlice() {
 *  const { actions } = useAuthSlice();
 *
 *  const onButtonClick = (evt) => {
 *    dispatch(actions.someAction());
 *   };
 * }
 */
