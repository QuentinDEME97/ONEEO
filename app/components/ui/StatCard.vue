<script setup lang="ts">
// Carte de stat de la maquette Dashboard : Card de base + teinte en gradient
// (haut-gauche → bas-droite), libellé, valeur, précision, et un Chip
// cosmétique rond en haut à droite (icône passée en prop).

import type { Icon } from "@tabler/icons-vue";

type Scale = "sm" | "md" | "lg";
type Variant = "neutral" | "blue" | "sand" | "mint" | "pink";

withDefaults(
  defineProps<{
    label: string;
    value: string;
    hint?: string;
    variant?: Variant;
    icon?: Icon;
    elevation?: Scale;
  }>(),
  {
    hint: undefined,
    variant: "blue",
    icon: undefined,
    elevation: "sm",
  }
);

const variantClasses: Record<Variant, string> = {
  neutral: "glass-tint-neutral",
  blue: "glass-tint-blue",
  sand: "glass-tint-sand",
  mint: "glass-tint-mint",
  pink: "glass-tint-pink",
};
</script>

<template>
  <UiCard
    :elevation="elevation"
    class="blurry-card p-5 shadow-card"
    :class="variantClasses[variant]"
  >
    <div class="flex items-start justify-between gap-3">
      <p class="text-neutral-800 font-extralight">{{ label }}</p>
      <UiChip
        v-if="icon"
        round
        size="md"
        class="-mr-1 -mt-1 text-white"
        :disable-filter="true"
        :variant="variant"
      >
        <component :is="icon" :size="24" />
      </UiChip>
    </div>
    <p class="mt-3 text-4xl font-medium tracking-tight">
      {{ value }}
    </p>
    <p v-if="hint" class="mt-2 text-sm text-neutral-700">{{ hint }}</p>
  </UiCard>
</template>
