import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { SignIn } from "./login/SignIn";
import { SignUp } from "./login/SignUp";
import { RequireAuth } from "./router/ProtectedRoute";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material";
import { Main } from "./main/Main";
import { QueryClient, QueryClientProvider } from "react-query";

function App() {
  let location = useLocation();
  const theme = createTheme();
  const queryClient = new QueryClient();

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<div>homepage</div>} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/main"
              element={
                <RequireAuth>
                  <Main />
                </RequireAuth>
              }
            />
            <Route
              path={"/*"}
              element={<Navigate to="/" state={{ from: location }} />}
            />
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
