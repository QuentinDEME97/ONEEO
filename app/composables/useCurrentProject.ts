interface ProjectSummary {
  id: string;
  name: string;
  theme: string | null;
  deliverableLabel: string;
}

interface ProjectsResponse {
  projects: ProjectSummary[];
  currentProjectId: string | null;
}

export function useCurrentProject() {
  const { loggedIn } = useUserSession();
  // Comme pour `useCurrentSpace`, `useRequestFetch()` relaie les cookies de la
  // requête entrante pendant le SSR (le `$fetch` global partirait sans session),
  // sinon `/api/projects` retomberait en 401 et le thème projet ne serait pas
  // appliqué au premier rendu.
  const requestFetch = useRequestFetch();
  // Le périmètre des projets dépend de l'espace actif : on relit la liste dès
  // que l'espace change.
  const { currentSpace } = useCurrentSpace();

  const { data, refresh } = useAsyncData<ProjectsResponse | null>(
    "projects",
    () =>
      loggedIn.value
        ? requestFetch<ProjectsResponse>("/api/projects")
        : Promise.resolve(null),
    { watch: [loggedIn, () => currentSpace.value?.id] }
  );

  const projects = computed(() => data.value?.projects ?? []);
  const currentProject = computed(
    () =>
      projects.value.find((p) => p.id === data.value?.currentProjectId) ?? null
  );

  async function selectProject(id: string) {
    await $fetch(`/api/projects/${id}/select`, { method: "POST" });
    await refresh();
    await navigateTo("/");
  }

  async function createProject(input: {
    name: string;
    theme?: string | null;
  }) {
    await $fetch("/api/projects", { method: "POST", body: input });
    await refresh();
    await navigateTo("/");
  }

  return { projects, currentProject, selectProject, createProject, refresh };
}
