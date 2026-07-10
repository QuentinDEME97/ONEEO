<script setup lang="ts">
import type { IconArray } from "@hugeicons/vue";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { RouteLocationRaw } from "vue-router";

const props = withDefaults(
  defineProps<{
    icon: IconArray;
    ariaLabel: string;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    to?: RouteLocationRaw;
  }>(),
  {
    size: "md",
    disabled: false,
    to: undefined,
  }
);

const sizeClasses: Record<NonNullable<typeof props.size>, string> = {
  sm: "w-9 h-9",
  md: "w-11 h-11",
  lg: "w-14 h-14",
};

const iconSize: Record<NonNullable<typeof props.size>, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

// NuxtLink n'a pas de `disabled` natif : on retombe sur <button> pour bloquer la navigation.
const rootTag = computed(() => (props.to && !props.disabled ? "NuxtLink" : "button"));
</script>

<template>
  <component
    :is="rootTag"
    :to="rootTag === 'NuxtLink' ? to : undefined"
    :type="rootTag === 'button' ? 'button' : undefined"
    :disabled="rootTag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    :aria-label="ariaLabel"
    class="round-glass-btn relative inline-flex items-center justify-center rounded-full aspect-square shrink-0 text-white"
    :class="sizeClasses[size]"
  >
    <HugeiconsIcon :icon="icon" :size="iconSize[size]" />
  </component>
</template>

<style scoped>
/* Recette Figma : fond FFFFFF 5% + gradient haut-gauche → bas-droite par-dessus
   (transparent jusqu'à 50%, blanc opaque à 90%), blur d'arrière-plan uniforme 12. */
.round-glass-btn {
  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0) 10%,
      rgba(255, 255, 255, 0) 50%,
      rgba(255, 255, 255, 1) 90%
    ),
    rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    transform 150ms,
    filter 150ms;
}

/* Bordure en dégradé (weight Figma 0.75) : blanc opaque aux coins haut-gauche et
   bas-droite, invisible entre les deux. Un vrai `border` ne peut pas porter de
   gradient sur un cercle, d'où le pseudo-élément masqué (mask-composite) qui ne
   laisse visible que l'anneau de 0.75px. */
.round-glass-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 0.75px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 1) 15%,
    rgba(255, 255, 255, 0) 35%,
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0) 65%,
    rgba(255, 255, 255, 1) 85%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

/* États d'interaction — non spécifiés dans la maquette, volontairement discrets. */
.round-glass-btn:hover {
  filter: brightness(1.15);
}

.round-glass-btn:active {
  transform: scale(0.96);
}

.round-glass-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.7);
  outline-offset: 2px;
}

.round-glass-btn:disabled,
.round-glass-btn[aria-disabled="true"] {
  opacity: 0.4;
  pointer-events: none;
}
</style>
