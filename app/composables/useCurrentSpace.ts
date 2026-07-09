interface SpaceSummary {
  id: string;
  name: string;
  theme: string;
}

interface SpacesResponse {
  spaces: SpaceSummary[];
  currentSpaceId: string;
}

export function useCurrentSpace() {
  const { loggedIn } = useUserSession();
  // Le `$fetch` global ne transmet pas les cookies de la requête entrante lors
  // d'un appel serveur→serveur pendant le SSR (il part comme une requête HTTP
  // neuve, sans session) : `useRequestFetch()` les relaie, sinon l'appel à
  // `/api/spaces` échoue silencieusement en 401 et le thème reste sur le
  // fallback.
  const requestFetch = useRequestFetch();

  // `useAsyncData` (contrairement à `useFetch({ immediate: false })` déclenché
  // depuis un `watch`) est suivi par le rendu SSR de Nuxt : le HTML généré
  // côté serveur reflète donc le thème de l'espace dès le premier chargement,
  // sans attendre une requête client après hydratation.
  const { data, refresh } = useAsyncData<SpacesResponse | null>(
    "spaces",
    () =>
      loggedIn.value
        ? requestFetch<SpacesResponse>("/api/spaces")
        : Promise.resolve(null),
    { watch: [loggedIn] }
  );

  const spaces = computed(() => data.value?.spaces ?? []);
  const currentSpace = computed(
    () => spaces.value.find((s) => s.id === data.value?.currentSpaceId) ?? null
  );

  async function selectSpace(id: string) {
    await $fetch(`/api/spaces/${id}/select`, { method: "POST" });
    await refresh();
    await navigateTo("/");
  }

  async function createSpace(name: string) {
    await $fetch("/api/spaces", { method: "POST", body: { name } });
    await refresh();
    await navigateTo("/");
  }

  return { spaces, currentSpace, selectSpace, createSpace, refresh };
}
