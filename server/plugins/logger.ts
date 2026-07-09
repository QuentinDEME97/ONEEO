const requestStartedAt = new WeakMap<object, number>();

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    requestStartedAt.set(event, Date.now());

    logger.debug(
      {
        method: event.method,
        path: event.path,
        query: getQuery(event),
        userAgent: getHeader(event, "user-agent"),
      },
      "request:start"
    );
  });

  nitroApp.hooks.hook("afterResponse", (event) => {
    const startedAt = requestStartedAt.get(event);
    requestStartedAt.delete(event);

    logger.info(
      {
        method: event.method,
        path: event.path,
        statusCode: event.node.res.statusCode,
        durationMs: startedAt ? Date.now() - startedAt : undefined,
      },
      "request"
    );
  });

  nitroApp.hooks.hook("error", (error, { event }) => {
    const statusCode = (error as { statusCode?: number }).statusCode;
    // Les erreurs 4xx (createError volontaire : identifiants invalides, formulaire
    // invalide, accès refusé…) sont déjà tracées au niveau du handler qui les lève.
    // On ne remonte ici que les vraies pannes serveur (5xx ou exception non gérée).
    if (statusCode && statusCode < 500) {
      return;
    }

    logger.error(
      { err: error, method: event?.method, path: event?.path },
      "unhandled error"
    );
  });
});
