<script setup lang="ts">
useHead({
  htmlAttrs: { "data-theme": "light" },
});
</script>

<template>
  <div>
    <button class="btn btn-primary">Button</button>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>
