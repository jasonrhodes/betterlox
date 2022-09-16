import React, { useContext, useEffect } from 'react';
import { UserPublicSafe, UserResponse, UserPublic } from '../common/types/db';
import api from '../lib/callApi';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import { UserSettings } from '../db/entities';
import { callApi } from './useApi';
import { UpdateUserSettingsResponse, UserApiResponse } from '../common/types/api';
import { getErrorAsString } from '../lib/getErrorAsString';
import { isAdmin } from '../lib/isAdmin';
import { DEFAULT_USER_SETTINGS } from '../common/constants';

const DEFAULT_SETTINGS = {
  statsMinWatched: 2,
  statsMinCastOrder: 15
};

interface LoginOptions {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface UserContextValue {
  user?: UserResponse | UserPublicSafe;
  errorStatus?: number;
  validating: boolean;
  login: (options: LoginOptions) => void;
  logout: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  switchUser: (id: number) => void;
}

export interface ValidUserContextValue extends UserContextValue {
  user: UserResponse;
}

const UserContext = React.createContext<UserContextValue>({
  validating: true,
  login: () => null,
  logout: () => null,
  updateSettings: () => null,
  switchUser: () => null
});
const UserContextConsumer = UserContext.Consumer;

const UserContextProvider: React.FC<{}> = ({ children }) => {
  const [user, setUser] = React.useState<UserResponse | UserPublicSafe | undefined>(undefined);
  const [errorStatus, setErrorStatus] = React.useState<number | undefined>(undefined);
  const [validating, setValidating] = React.useState<boolean>(true);
  const router = useRouter();

  async function switchUser(id: number) {
    if (!user?.isAdmin) {
      return;
    }
    const response = await callApi<UserApiResponse>(`/api/users/${id}`);
    if (response.data.success && response.data.user) {
      const { user } = response.data;
      if (!user.settings) {
        user.settings = { ...DEFAULT_USER_SETTINGS, userId: user.id };
      }
      setUser(user);
    }
  }
  
  const [cookies, setCookie, removeCookie] = useCookies(['rememberMe']);

  useEffect(() => {
    setValidating(true);
    async function validateToken(token: string) {
      const { data } = await api.checkRememberMeToken(token);
      if (data.success) {
        const publicUser: UserPublic = {
          settings: { ...DEFAULT_USER_SETTINGS, userId: data.user.id },
          ...data.user,
          isAdmin: isAdmin(data.user)
        };
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
    const publicUser = {
      settings: { ...DEFAULT_USER_SETTINGS, userId: response.data.user.id },
      ...response.data.user, 
      isAdmin: isAdmin(response.data.user)
    }
    setUser(publicUser);
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

    try {
      const { data } = await callApi<UpdateUserSettingsResponse, { settings: Partial<UserSettings> }>(`/api/users/${user.id}/settings`, {
        method: 'PATCH',
        data: {
          settings
        }
      });

      if (!data.success) {
        throw new Error(`Update settings failed: ${data.message}`);
      }
      
      if (
        typeof data.settings?.userId === "undefined" || 
        typeof data.settings?.statsMinCastOrder === "undefined" ||
        typeof data.settings?.statsMinWatched === "undefined"
      ) {
        return;
      }
      const updated = { ...user, settings: { ...user.settings, ...data.settings, userId: user.id }};
      setUser(updated);
    } catch (error: unknown) {
      // TODO: some kind of toast or pop up or banner notification system?
      console.log((new Date()).toUTCString(), getErrorAsString(error));
    }
  }

  function logout() {
    setUser(undefined);
    removeCookie('rememberMe');
  }

  const value: UserContextValue = {
    login,
    logout,
    updateSettings,
    switchUser,
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