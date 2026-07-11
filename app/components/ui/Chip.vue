<script setup lang="ts">
// Dérivé purement cosmétique de Button : même géométrie et même verre, mais
// rendu <span> sans sémantique d'action (pas de hover/active — glass-surface).

type Scale = "sm" | "md" | "lg";
type Variant = "frost" | "neutral" | "blue" | "sand" | "mint" | "pink";

withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Scale;
    elevation?: Scale;
    round?: boolean;
    disableFilter?: boolean;
  }>(),
  {
    variant: "frost",
    size: "md",
    elevation: "sm",
    round: false,
    disableFilter: false,
  }
);

// Hauteurs alignées sur Button (36/44/56px) ; en `round`, largeur = hauteur.
const sizeClasses: Record<Scale, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-7 text-lg",
};

const roundSizeClasses: Record<Scale, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

// `frost` = verre blanc de la recette (.filled) ; les autres = teintes.
const variantClasses: Record<Variant, string> = {
  frost: "filled",
  neutral: "glass-tint-neutral",
  blue: "glass-tint-blue",
  sand: "glass-tint-sand",
  mint: "glass-tint-mint",
  pink: "glass-tint-pink",
};

const elevationClasses: Record<Scale, string> = {
  sm: "glass-surface--elevation-sm",
  md: "glass-surface--elevation-md",
  lg: "glass-surface--elevation-lg",
};
</script>

<template>
  <span
    class="chip glass-surface inline-flex items-center justify-center gap-2 rounded-full"
    :class="[
      round ? roundSizeClasses[size] : sizeClasses[size],
      variantClasses[variant],
      elevationClasses[elevation],
      disableFilter ? 'backdrop-filter-none' : '',
    ]"
  >
    <slot />
  </span>
</template>
