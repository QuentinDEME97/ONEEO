<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "glass" | "ghost";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    to?: RouteLocationRaw;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    size: "md",
    disabled: false,
    loading: false,
    block: false,
    to: undefined,
    type: "button",
  }
);

const variantClasses: Record<NonNullable<typeof props.variant>, string[]> = {
  primary: [
    "bg-linear-to-b from-glass-primary-from to-glass-primary-to",
    "text-glass-primary-content border border-glass-border/50",
    "shadow-glass-primary hover:brightness-105 active:brightness-95",
    "disabled:opacity-50 disabled:shadow-none",
  ],
  glass: [
    "bg-glass-fill backdrop-blur-glass border border-glass-border text-base-content",
    "shadow-glass-sm hover:bg-glass-fill-strong active:bg-glass-fill/80",
    "disabled:opacity-50",
  ],
  ghost: [
    "text-base-content hover:bg-glass-fill-subtle active:bg-glass-fill/60",
    "disabled:opacity-40",
  ],
};

const sizeClasses: Record<NonNullable<typeof props.size>, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-base gap-2",
  lg: "h-14 px-8 text-lg gap-2.5",
};

// NuxtLink n'a pas de `disabled` natif : on retombe sur <button> pour bloquer la navigation.
const isDisabled = computed(() => props.disabled || props.loading);
const rootTag = computed(() => (props.to && !isDisabled.value ? "NuxtLink" : "button"));

const classes = computed(() => [
  "inline-flex items-center justify-center rounded-full font-medium",
  "transition-[background-color,box-shadow,filter,transform] duration-150",
  "active:scale-[0.98] disabled:pointer-events-none",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glass-primary-to",
  ...variantClasses[props.variant],
  sizeClasses[props.size],
  props.block ? "w-full" : "",
]);
</script>

<template>
  <component
    :is="rootTag"
    :to="rootTag === 'NuxtLink' ? to : undefined"
    :type="rootTag === 'button' ? type : undefined"
    :disabled="rootTag === 'button' ? isDisabled : undefined"
    :aria-disabled="isDisabled || undefined"
    :aria-busy="loading || undefined"
    :class="classes"
  >
    <span v-if="loading" class="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
    <slot v-else name="iconLeft" />
    <slot />
    <slot v-if="!loading" name="iconRight" />
  </component>
</template>
