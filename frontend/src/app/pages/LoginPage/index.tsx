import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Title } from './components/Title';
import { Lead } from './components/Lead';
import { SubTitle } from './components/SubTitle';
import { P } from './components/P';
import { A } from 'app/components/A';
import { LoginForm } from 'app/components/LoginForm';

export function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Login page</title>
        <meta name="description" content="A Boilerplate application homepage" />
      </Helmet>
      <>
        <Title as="h2">Login</Title>
        <Lead>
          Please insert your <strong>credentials</strong>.
        </Lead>
        <List>
          <Feature>
            <Content>
              <SubTitle>Login</SubTitle>
              <LoginForm />
            </Content>
          </Feature>
        </List>
      </>
    </>
  );
}

const Feature = styled.li`
  display: flex;
  margin: 6.25rem 0 6.25rem 2.25rem;

  .feature-icon {
    width: 6.25rem;
    height: 6.25rem;
    margin-right: 2.25rem;
    flex-shrink: 0;
  }
`;
const Content = styled.div`
  flex: 1;
`;

const List = styled.ul`
  padding: 0;
`;
