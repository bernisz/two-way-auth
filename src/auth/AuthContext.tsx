import React from "react";

interface AuthContextType {
  user: any;
  handleLogin: (userHash: string) => void;
}

export const AuthContext = React.createContext<AuthContextType>(null!);

export function useAuth() {
  return React.useContext(AuthContext);
}
