import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

const selectSlice = (state: RootState) => state.auth || initialState;

export const selectAuth = createSelector([selectSlice], state => state);

export const selectFormUsername = createSelector(
  [selectAuth],
  rootState => rootState.loginForm?.username,
);

export const selectFormPassword = createSelector(
  [selectAuth],
  rootState => rootState.loginForm?.password,
);

export const selectLoading = createSelector(
  [selectAuth],
  rootState => rootState.loading,
);

export const selectError = createSelector(
  [selectAuth],
  rootState => rootState.error,
);
