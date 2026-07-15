<script setup lang="ts">
import type { Icon } from "@tabler/icons-vue";
import type { RouteLocationRaw } from "vue-router";

const props = withDefaults(
  defineProps<{
    icon: Icon;
    ariaLabel: string;
    size?: "sm" | "md" | "lg" | "xl";
    elevation?: "sm" | "md" | "lg";
    disabled?: boolean;
    to?: RouteLocationRaw;
  }>(),
  {
    size: "md",
    elevation: "md",
    disabled: false,
    to: undefined,
  }
);

const sizeClasses: Record<NonNullable<typeof props.size>, string> = {
  sm: "w-9 h-9",
  md: "w-11 h-11",
  lg: "w-14 h-14",
  xl: "w-16 h-16",
};

const iconSize: Record<NonNullable<typeof props.size>, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Multiplicateurs d'intensité d'ombre — voir .glass-control--elevation-* (main.css).
const elevationClasses: Record<NonNullable<typeof props.elevation>, string> = {
  sm: "glass-control--elevation-sm",
  md: "glass-control--elevation-md",
  lg: "glass-control--elevation-lg",
};

// NuxtLink n'a pas de `disabled` natif : on retombe sur <button> pour bloquer la navigation.
const rootTag = computed(() =>
  props.to && !props.disabled ? "NuxtLink" : "button"
);
</script>

<template>
  <component
    :is="rootTag"
    :to="rootTag === 'NuxtLink' ? to : undefined"
    :type="rootTag === 'button' ? 'button' : undefined"
    :disabled="rootTag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    :aria-label="ariaLabel"
    class="glass-control filled inline-flex items-center justify-center rounded-full aspect-square shrink-0 text-white"
    :class="[sizeClasses[size], elevationClasses[elevation]]"
  >
    <component :is="icon" :size="iconSize[size]" />
  </component>
</template>
