export const fakeAuthProvider = {
  isAuthenticated: false,
  signin() {
    fakeAuthProvider.isAuthenticated = true;
  },
  signout() {
    fakeAuthProvider.isAuthenticated = false;
  },
};
