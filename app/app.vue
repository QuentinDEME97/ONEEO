<script setup lang="ts">
const { currentSpace } = useCurrentSpace();

useHead({
  htmlAttrs: {
    "data-theme": computed(() => currentSpace.value?.theme ?? "oneeo"),
  },
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
