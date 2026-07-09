<script setup lang="ts">
const { currentSpace } = useCurrentSpace();

useHead({
  htmlAttrs: {
    "data-theme": computed(() => currentSpace.value?.theme ?? "light"),
  },
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
