<script setup lang="ts">
import type { IconArray } from "@hugeicons/vue";
import { HugeiconsIcon } from "@hugeicons/vue";
import type { RouteLocationRaw } from "vue-router";

const props = withDefaults(
  defineProps<{
    icon: IconArray;
    ariaLabel: string;
    size?: "sm" | "md" | "lg";
    variant?: "glass" | "ghost" | "primary-solid";
    disabled?: boolean;
    to?: RouteLocationRaw;
  }>(),
  {
    size: "md",
    variant: "glass",
    disabled: false,
    to: undefined,
  }
);

const variantClasses: Record<NonNullable<typeof props.variant>, string[]> = {
  glass: [
    "bg-glass-fill-strong backdrop-blur-glass border border-glass-border text-white",
    "shadow-glass-sm hover:brightness-110 active:scale-95",
    "disabled:opacity-40",
  ],
  ghost: [
    "text-base-content hover:bg-glass-fill-subtle active:bg-glass-fill/50 active:scale-95",
    "disabled:opacity-40",
  ],
  "primary-solid": [
    "bg-linear-to-b from-glass-primary-from to-glass-primary-to text-glass-primary-content",
    "shadow-glass-primary hover:brightness-105 active:scale-95 active:brightness-95",
    "disabled:opacity-50 disabled:shadow-none",
  ],
};

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

const classes = computed(() => [
  "inline-flex items-center justify-center rounded-full aspect-square shrink-0",
  "transition-[background-color,box-shadow,filter,transform] duration-150",
  "disabled:pointer-events-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glass-primary-to",
  ...variantClasses[props.variant],
  sizeClasses[props.size],
]);
</script>

<template>
  <component
    :is="rootTag"
    :to="rootTag === 'NuxtLink' ? to : undefined"
    :type="rootTag === 'button' ? 'button' : undefined"
    :disabled="rootTag === 'button' ? disabled : undefined"
    :aria-disabled="disabled || undefined"
    :aria-label="ariaLabel"
    :class="classes"
  >
    <HugeiconsIcon :icon="icon" :size="iconSize[size]" />
  </component>
</template>
