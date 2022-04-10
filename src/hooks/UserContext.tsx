import React, { useContext, useEffect } from 'react';
import { UserPublic } from '../common/types/db';
import api from '../lib/callApi';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';

interface User {
  id: number;
  letterboxd: string;
}

interface LoginOptions {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface UserContextValue {
  user?: UserPublic;
  errorStatus?: number;
  validating: boolean;
  login: (options: LoginOptions) => void;
  logout: () => void;
}

const UserContext = React.createContext<UserContextValue>({
  validating: true,
  login: () => null,
  logout: () => null
});
const UserContextConsumer = UserContext.Consumer;

const UserContextProvider: React.FC<{}> = ({ children }) => {
  const [user, setUser] = React.useState<UserPublic | undefined>(undefined);
  const [errorStatus, setErrorStatus] = React.useState<number | undefined>(undefined);
  const [validating, setValidating] = React.useState<boolean>(true);
  const router = useRouter();
  
  const [cookies, setCookie, removeCookie] = useCookies(['rememberMe']);

  useEffect(() => {
    setValidating(true);
    async function validateToken(token: string) {
      const { data } = await api.checkRememberMeToken(token);
      if (data.success) {
        await setUser(data.user);
      } else {
        removeCookie('rememberMe');
      }
      setValidating(false);
    }
    if (cookies.rememberMe) {
      validateToken(cookies.rememberMe);
    } else {
      setValidating(false);
    }
  }, []);

  async function login({ email, password, rememberMe }: LoginOptions) {
    const response = await api.login({ email, password, rememberMe });
    setUser(response.data.user);
    if (response.data.user.rememberMeToken) {
      try {
        const now = new Date();
        setCookie('rememberMe', response.data.user.rememberMeToken, {
          expires: new Date(now.getTime() + (1000 * 60 * 60 * 24 * 30)),
          path: '/'
        });
      } catch (error) {
        console.log('Error setting cookie', error);
      }
    }
    if (typeof router.query.redirect === "string") {
      router.push(router.query.redirect);
    } else {
      router.push("/account");
    }
  }

  function logout() {
    setUser(undefined);
    removeCookie('rememberMe');
  }

  const value: UserContextValue = {
    login,
    logout,
    errorStatus,
    validating
  };

  if (value === null) {
    return null;
  }

  return (
    <UserContext.Provider value={{ ...value, user }}>
      {children}
    </UserContext.Provider>
  )
}

const useCurrentUser = () => useContext(UserContext);

export {
  UserContext,
  UserContextConsumer,
  UserContextProvider,
  useCurrentUser
};