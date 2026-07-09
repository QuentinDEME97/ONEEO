export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (session.rememberMe) {
    await setUserSession(event, session, { maxAge: SESSION_MAX_AGE });
  }
});
