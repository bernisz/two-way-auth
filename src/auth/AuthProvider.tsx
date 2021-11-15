import React, { ReactNode, useEffect } from "react";
import { useSessionStorage } from "react-use";
import { AuthContext } from "./AuthContext";

type Props = {
  children: ReactNode | JSX.Element;
};

export function AuthProvider({ children }: Props) {
  let [user, setUser] = React.useState<any>(null);
  const [sesionUser, setSesionUser] = useSessionStorage<string>(
    "user",
    undefined
  );

  useEffect(() => {
    setUser(sesionUser);
  }, [setUser, sesionUser]);

  const handleLogin = (userHash: string) => {
    setUser(userHash);
    setSesionUser(userHash);
  };

  let value = { user, handleLogin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
