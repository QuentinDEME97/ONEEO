<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

const props = withDefaults(
  defineProps<{
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    to?: RouteLocationRaw;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    size: "md",
    disabled: false,
    to: undefined,
    type: "button",
  }
);

// Hauteurs alignées sur les diamètres de RoundButton (36/44/56px).
const sizeClasses: Record<NonNullable<typeof props.size>, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-7 text-lg",
};

// NuxtLink n'a pas de `disabled` natif : on retombe sur <button> pour bloquer la navigation.
const rootTag = computed(() => (props.to && !props.disabled ? "NuxtLink" : "button"));
</script>

<template>
  <component
    :is="rootTag"
    :to="rootTag === 'NuxtLink' ? to : undefined"
    :type="rootTag === 'button' ? type : undefined"
    :disabled="rootTag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    class="glass-control inline-flex items-center justify-center gap-2 rounded-full font-medium text-white"
    :class="sizeClasses[size]"
  >
    <slot />
  </component>
</template>
