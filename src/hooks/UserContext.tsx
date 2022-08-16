import React, { useContext, useEffect } from 'react';
import { UserPublic } from '../common/types/db';
import api from '../lib/callApi';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import { UserSettings } from '../db/entities';
import { callApi } from './useApi';
import { UpdateUserSettingsResponse } from '../common/types/api';

const ADMIN_USER_IDS = [1];

function isAdmin(user?: UserPublic) {
  return Boolean(user && user.id && ADMIN_USER_IDS.includes(user.id));
}

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
  updateSettings: (settings: Partial<UserSettings>) => void;
}

export interface ValidUserContextValue extends UserContextValue {
  user: UserPublic;
}

const UserContext = React.createContext<UserContextValue>({
  validating: true,
  login: () => null,
  logout: () => null,
  updateSettings: () => null
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
        const publicUser: UserPublic = { ...data.user, isAdmin: isAdmin(data.user) }
        await setUser(publicUser);
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
  }, [cookies.rememberMe, removeCookie]);

  async function login({ email, password, rememberMe }: LoginOptions) {
    const response = await api.login({ email, password, rememberMe });
    const publicUser = { ...response.data.user, isAdmin: isAdmin(response.data.user) }
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

  async function updateSettings(settings: Partial<UserSettings>) {
    if (!user) {
      return;
    }
    const { data } = await callApi<UpdateUserSettingsResponse, { settings: Partial<UserSettings> }>(`/api/users/${user.id}/settings`, {
      method: 'PATCH',
      data: {
        settings
      }
    });

    // TODO: handle if success === false?

    const updated = { ...user, settings: { ...user.settings, ...data.settings }};
    setUser(updated);
  }

  function logout() {
    setUser(undefined);
    removeCookie('rememberMe');
  }

  const value: UserContextValue = {
    login,
    logout,
    updateSettings,
    errorStatus,
    validating,
    user
  };

  return (
    <UserContext.Provider value={value}>
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