export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession();

  if (!loggedIn.value && to.path !== "/login" && to.path !== "/setup") {
    console.log("User not logged in, redirecting to login page.");
    return navigateTo("/login");
  }

  if (loggedIn.value && to.path === "/login") {
    console.log("User already logged in, redirecting to home page.");
    return navigateTo("/");
  }

  if (
    loggedIn.value &&
    user.value?.mustChangePassword &&
    to.path !== "/changer-mot-de-passe"
  ) {
    return navigateTo("/changer-mot-de-passe");
  }

  if (
    loggedIn.value &&
    !user.value?.mustChangePassword &&
    to.path === "/changer-mot-de-passe"
  ) {
    return navigateTo("/");
  }
});
