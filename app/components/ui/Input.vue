<script setup lang="ts">
const model = defineModel<string>();

type Scale = "sm" | "md" | "lg";

withDefaults(
  defineProps<{
    type?: string;
    placeholder?: string;
    size?: Scale;
    elevation?: Scale;
    disabled?: boolean;
  }>(),
  {
    type: "text",
    placeholder: undefined,
    size: "md",
    elevation: "sm",
    disabled: false,
  }
);

// Hauteurs alignées sur Button (36/44/56px).
const sizeClasses: Record<Scale, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-7 text-lg",
};

// Multiplicateurs d'intensité d'ombre — voir .glass-surface--elevation-* (main.css).
const elevationClasses: Record<Scale, string> = {
  sm: "glass-surface--elevation-sm",
  md: "glass-surface--elevation-md",
  lg: "glass-surface--elevation-lg",
};
</script>

<!-- La surface verre est portée par un wrapper : les pseudo-éléments de la
     recette (bordure gradient ::before, ombre traversante ::after) ne se
     rendent pas sur un <input> (élément remplacé). Slots `prefix`/`suffix`
     pour glisser une icône ou un bouton dans le champ. -->
<template>
  <div
    class="glass-surface inline-flex items-center gap-2 rounded-full focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white/70"
    :class="[
      sizeClasses[size],
      elevationClasses[elevation],
      disabled ? 'opacity-40 pointer-events-none' : '',
    ]"
  >
    <slot name="prefix" />
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full min-w-0 bg-transparent text-neutral-600 placeholder:text-neutral-400 outline-none"
    />
    <slot name="suffix" />
  </div>
</template>
