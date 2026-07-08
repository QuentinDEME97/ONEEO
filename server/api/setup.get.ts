export default defineEventHandler(() => {
  const db = useDb();
  return { needsSetup: !hasAnyUser(db) };
});
