import React, { ReactNode } from "react";
import { fakeAuthProvider } from "./auth";
import { AuthContext } from "./AuthContext";

type Props = {
  children: ReactNode | JSX.Element;
};

export function AuthProvider({ children }: Props) {
  let [user, setUser] = React.useState<any>(null);

  let signin = (newUser: string, callback: VoidFunction) => {
    return fakeAuthProvider.signin(() => {
      setUser(newUser);
      callback();
    });
  };

  let signout = (callback: VoidFunction) => {
    return fakeAuthProvider.signout(() => {
      setUser(null);
      callback();
    });
  };

  let value = { user, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
