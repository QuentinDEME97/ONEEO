<script setup lang="ts">
const { currentSpace } = useCurrentSpace();
const { currentProject } = useCurrentProject();

// Le thème du projet actif surcharge celui de l'espace (tâche 1.9). Un projet
// sans thème (`null`) retombe sur le thème de l'espace, puis sur `oneeo`.
useHead({
  htmlAttrs: {
    "data-theme": computed(
      () =>
        currentProject.value?.theme ?? currentSpace.value?.theme ?? "oneeo"
    ),
  },
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
