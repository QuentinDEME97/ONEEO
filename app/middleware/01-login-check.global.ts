export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value && to.path !== "/auth/login") {
    console.log("User not logged in, redirecting to login page.");
    return navigateTo("/auth/login");
  }

  if (loggedIn.value && to.path === "/auth/login") {
    console.log("User already logged in, redirecting to home page.");
    return navigateTo("/");
  }
});
