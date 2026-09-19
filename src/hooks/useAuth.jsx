import { createContext, useContext, useEffect, useState } from 'react';
import { workspaceApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    const token = localStorage.getItem('paceflow_token');
    if (!token) {
      setState({ loading: false, user: null });
      // Set default theme when no user is logged in
      document.documentElement.setAttribute('data-theme', 'dark');
      return;
    }
    workspaceApi.getCurrentUser()
      .then((user) => {
        setState({ loading: false, user });
        // Apply theme from user preferences
        document.documentElement.setAttribute('data-theme', user?.theme || 'dark');
      })
      .catch(() => {
        workspaceApi.logout();
        setState({ loading: false, user: null });
        // Set default theme when session is invalid
        document.documentElement.setAttribute('data-theme', 'dark');
      });
  }, []);

  const authenticate = async (action, data) => {
    const result = await action(data);
    localStorage.setItem('paceflow_token', result.token);
    setState({ loading: false, user: result.user });
    // Apply theme from user preferences, fallback to dark
    document.documentElement.setAttribute('data-theme', result?.user?.theme || 'dark');
  };

  const updateSettings = async (settings) => {
    const updatedUser = await workspaceApi.updateSettings(settings);
    setState({ loading: false, user: updatedUser });
    // Apply theme if it was updated
    if (settings.theme !== undefined) {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
    return updatedUser;
  };

  const updateAvatar = async (avatarUrl) => {
    const updatedUser = await workspaceApi.updateAvatar(avatarUrl);
    setState({ loading: false, user: updatedUser });
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: (data) => authenticate(workspaceApi.login, data),
        register: (data) => authenticate(workspaceApi.register, data),
        updateSettings,
        updateAvatar,
        logout: () => {
          workspaceApi.logout();
          setState({ loading: false, user: null });
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
