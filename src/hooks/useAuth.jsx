import { createContext, useContext, useEffect, useState } from 'react';
import { workspaceApi } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null });
  useEffect(() => { const token = localStorage.getItem('paceflow_token'); if (!token) { setState({ loading: false, user: null }); return; } workspaceApi.getCurrentUser().then((user) => setState({ loading: false, user })).catch(() => { workspaceApi.logout(); setState({ loading: false, user: null }); }); }, []);
  const authenticate = async (action, data) => { const result = await action(data); localStorage.setItem('paceflow_token', result.token); setState({ loading: false, user: result.user }); };
  return <AuthContext.Provider value={{ ...state, login: (data) => authenticate(workspaceApi.login, data), register: (data) => authenticate(workspaceApi.register, data), logout: () => { workspaceApi.logout(); setState({ loading: false, user: null }); } }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
