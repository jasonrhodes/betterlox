import React, { useEffect } from 'react';
import api from '../utils/callApi';

interface User {
  id: number;
  letterboxd: string;
}

interface UserContext {
  user?: User;
  errorStatus?: number;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const UserContext = React.createContext<UserContext | null>(null);
const UserContextConsumer = UserContext.Consumer;

const UserContextProvider: React.FC<{}> = ({ children }) => {
  const [user, setUser] = React.useState<User | undefined>(undefined);
  const [errorStatus, setErrorStatus] = React.useState<number | undefined>(undefined);

  async function login() {
    const response = await api.login("u", "pw");
    setUser(response.data.user);
  }

  function logout() {
    setUser(undefined);
  }

  const value: UserContext = {
    login,
    logout,
    errorStatus
  };

  if (user) {
    value.user = user;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export {
  UserContext,
  UserContextConsumer,
  UserContextProvider
};