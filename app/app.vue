<script setup lang="ts">
useHead({
  htmlAttrs: { "data-theme": "light" },
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
