<script setup lang="ts">
import {
  IconPlayerPauseFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from "@tabler/icons-vue";
import Button from "~/components/ui/Button.vue";
import RoundButton from "~/components/ui/RoundButton.vue";
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <Button
      class="w-3xs mt-4 mb-4 flex align-center justify-center"
      elevation="sm"
    >
      <span class="w-full text-left font-thin"> Rechercher... </span>
      <Button size="sm" elevation="sm">
        <span class="w-full text-left font-thin">Test </span>
      </Button>
    </Button>
    <!-- <ChartsBaseChart class="mt-4" /> -->
    <div class="container gap-14">
      <RoundButton
        class="mt-4 glass-btn"
        aria-label="Round Button"
        :icon="IconPlayerSkipBackFilled"
        size="xl"
      />
      <RoundButton
        class="mt-4 glass-btn"
        aria-label="Round Button"
        :icon="IconPlayerPauseFilled"
        size="xl"
      />
      <RoundButton
        class="mt-4 glass-btn"
        aria-label="Round Button"
        :icon="IconPlayerSkipForwardFilled"
        size="xl"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 850px;
  aspect-ratio: 850 / 567;
  background-image: url("/landscape.png");
  background-size: cover;
  background-position: center;
}

.glass-btn {
  margin-top: -2rem;
}
</style>
