import React, { useEffect } from 'react';
import styled from 'styled-components/macro';
import { useSelector, useDispatch } from 'react-redux';
import { FormLabel } from 'app/components/FormLabel';
import { Input } from './components/Input';
import { TextButton } from './components/TextButton';
import {
  selectFormUsername,
  selectFormPassword,
  selectLoading,
  selectError,
} from './slice/selectors';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { LoginErrorType } from './slice/types';
import { useAuthSlice } from './slice';

export function LoginForm() {
  const { actions } = useAuthSlice();

  const username = useSelector(selectFormUsername);
  const password = useSelector(selectFormPassword);
  const isLoading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const dispatch = useDispatch();

  const onChangeUsername = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(actions.changeFormUsername(evt.currentTarget.value));
  };

  const onChangePassword = (evt: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(actions.changeFormPassword(evt.currentTarget.value));
  };

  // const useEffectOnMount = (effect: React.EffectCallback) => {
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   useEffect(effect, []);
  // };

  // useEffectOnMount(() => {
  //   // When initial state username is not null, submit the form to load repos
  //   if (username && username.trim().length > 0) {
  //     dispatch(actions.loadRepos());
  //   }
  // });

  const onSubmitForm = (evt?: React.FormEvent<HTMLFormElement>) => {
    /* istanbul ignore next  */
    if (evt !== undefined && evt.preventDefault) {
      evt.preventDefault();
    }
    dispatch(actions.startLogin());
  };

  return (
    <Wrapper>
      <FormGroup onSubmit={onSubmitForm}>
        <FormLabel>Username</FormLabel>
        <InputWrapper>
          <Input
            type="text"
            placeholder="Type your username"
            value={username}
            onChange={onChangeUsername}
            name="username"
          />
          {isLoading && <LoadingIndicator small />}
        </InputWrapper>
        <FormLabel>Password</FormLabel>
        <InputWrapper>
          <Input
            type="password"
            placeholder="Type your password"
            value={password}
            onChange={onChangePassword}
            name="password"
          />
          {isLoading && <LoadingIndicator small />}
        </InputWrapper>
        <Input type="submit" />
      </FormGroup>
      {error ? <ErrorText>{loginErrorText(error)}</ErrorText> : null}
    </Wrapper>
  );
}

export const loginErrorText = (error: LoginErrorType) => {
  switch (error) {
    case LoginErrorType.RESPONSE_ERROR:
      return 'Server error 😞';
    case LoginErrorType.USERNAME_EMPTY:
      return 'Type your username';
    case LoginErrorType.PASSWORD_EMPTY:
      return 'Type your password';
    case LoginErrorType.INVALID_CREDENTIAL:
      return 'Invalid credentials 🥺';
    default:
      return 'An error has occurred!';
  }
};

const Wrapper = styled.div`
  ${TextButton} {
    margin: 16px 0;
    font-size: 0.875rem;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;

  ${Input} {
    width: ${100 / 3}%;
    margin-right: 0.5rem;
  }
`;

const ErrorText = styled.span`
  color: ${p => p.theme.text};
`;

const FormGroup = styled.form`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;

  ${FormLabel} {
    margin-bottom: 0.25rem;
    margin-left: 0.125rem;
  }
`;
