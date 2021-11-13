import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { SignIn } from "./login/SignIn";
import { SignUp } from "./login/SignUp";
import { RequireAuth } from "./router/ProtectedRoute";

function App() {
  let location = useLocation();
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<div>homepage</div>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/main"
          element={
            <RequireAuth>
              <div>Protected</div>
            </RequireAuth>
          }
        />
        <Route
          path={"/*"}
          element={<Navigate to="/" state={{ from: location }} />}
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
