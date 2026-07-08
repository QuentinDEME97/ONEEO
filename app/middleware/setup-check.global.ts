export default defineNuxtRouteMiddleware(async (to) => {
  const { needsSetup } = await $fetch("/api/setup");

  if (needsSetup && to.path !== "/setup") {
    return navigateTo("/setup");
  }

  if (!needsSetup && to.path === "/setup") {
    return navigateTo("/");
  }
});
