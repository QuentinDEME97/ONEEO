<script setup lang="ts">
import { IconCircle } from "@tabler/icons-vue";
const { clear } = useUserSession();

const logout = async () => {
  await clear();
  await navigateTo("/login");
};
</script>

<template>
  <header class="navbar w-full flex justify-between sticky top-0 z-30 p-4">
    <div class="flex items-center gap-2">
      <div
        class="glass-control glass-control--elevation-md w-14 h-14 flex items-center justify-center rounded-full text-white text-4xl font-medium"
        :icon="IconCircle"
        aria-label="Oneeo"
        size="lg"
        elevation="md"
      >
        <span id="logo">O</span>
      </div>
      <span class="font-semibold text-2xl">ONEEO</span>
    </div>
    <nav
      class="flex text-xl font-light w-fit items-center gap-6 px-6 py-3 glass-control glass-control--elevation-sm rounded-full"
    >
      <a id="join-btn" class="glass-control py-2 px-3 rounded-full" href="/"
        >Dashboard</a
      >
      <a class="text-gray-500" href="/about">Sprints</a>
      <a class="text-gray-500" href="/contact">Equipes</a>
      <a class="text-gray-500" href="/contact">Temps & congés</a>
      <a class="text-gray-500" href="/contact">Anomalies & SLA</a>
    </nav>
    <div class="space-selector"></div>
  </header>
</template>

<style scoped>
#logo {
  background: -webkit-linear-gradient(-32deg, #0099e5, #4dc3ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 3px 5px rgba(77, 195, 255, 0.2);
}

#join-btn {
  background-color: rgba(77, 166, 255, 0.12) !important;
  color: #121212;

  &.glass-surface::before,
  &.glass-control::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.25px;
    background: linear-gradient(
      180deg,
      rgba(230, 242, 255, 1) 10%,
      rgba(5, 130, 255, 0.25) 41%,
      rgba(230, 242, 255, 1) 90%
    );
    /* Couche 1 clippée sur content-box (l'intérieur du padding), couche 2 pleine :
     l'exclusion ne laisse visible que l'anneau de padding qui porte le gradient. */
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }

  &.glass-surface,
  &.glass-control {
    --glass-elevation: 1;

    position: relative;
    background: linear-gradient(
      135deg,
      rgba(77, 166, 255, 0) 50%,
      rgba(77, 166, 255, 0.2) 90%
    );
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    box-shadow:
      0 0 10px 0 rgba(0, 0, 0, 0),
      0 4px 12px 0 rgba(0, 0, 0, calc(0.01 * var(--glass-elevation))),
      0 32px 24px 0 rgba(0, 0, 0, calc(0.01 * var(--glass-elevation))),
      0 24px 24px 0 rgba(0, 0, 0, calc(0.03 * var(--glass-elevation))),
      0 9px 24px 0 rgba(0, 0, 0, calc(0.05 * var(--glass-elevation)));
    transition:
      transform 150ms,
      filter 150ms,
      box-shadow 150ms;
  }
}
</style>
