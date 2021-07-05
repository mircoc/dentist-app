import { call, put, select, takeLatest } from 'redux-saga/effects';
import { authActions as actions } from '.';
import { request } from 'utils/request';
import { selectFormPassword, selectFormUsername } from './selectors';
import { LoginErrorType, LoginResponse } from './types';

function* loginUser() {
  // Select username from store
  const username: string = yield select(selectFormUsername);
  if (username.length === 0) {
    yield put(actions.loginError(LoginErrorType.USERNAME_EMPTY));
    return;
  }
  // Select password from store
  const password: string = yield select(selectFormPassword);
  if (username.length === 0) {
    yield put(actions.loginError(LoginErrorType.PASSWORD_EMPTY));
    return;
  }

  const requestURL = `/api/v1/login`;

  try {
    // Call our request helper (see 'utils/request')
    const response: LoginResponse = yield call(request, requestURL, {
      body: JSON.stringify({
        username,
        password,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.token) {
      yield put(
        actions.loginSuccess({
          token: response.token,
          userName: username,
        }),
      );
    } else {
      yield put(actions.loginError(LoginErrorType.RESPONSE_ERROR));
    }
  } catch (err) {
    if (err.response?.status === 401) {
      yield put(actions.loginError(LoginErrorType.INVALID_CREDENTIAL));
    } else {
      yield put(actions.loginError(LoginErrorType.RESPONSE_ERROR));
    }
  }
}

/**
 * Root saga manages watcher lifecycle
 */
export function* authSaga() {
  // Watches for startLogin actions and calls loginUser when one comes in.
  // By using `takeLatest` only the result of the latest API call is applied.
  // It returns task descriptor (just like fork) so we can continue execution
  // It will be cancelled automatically on component unmount
  yield takeLatest(actions.startLogin.type, loginUser);
}
