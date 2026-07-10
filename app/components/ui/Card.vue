<script setup lang="ts">
type Elevation = "sm" | "md" | "lg";

withDefaults(
  defineProps<{
    elevation?: Elevation;
  }>(),
  {
    elevation: "md",
  }
);

// Multiplicateurs d'intensité d'ombre — voir .glass-surface--elevation-* (main.css).
const elevationClasses: Record<Elevation, string> = {
  sm: "glass-surface--elevation-sm",
  md: "glass-surface--elevation-md",
  lg: "glass-surface--elevation-lg",
};
</script>

<template>
  <div class="glass-surface rounded-3xl" :class="elevationClasses[elevation]">
    <!-- Pas de padding par défaut : chaque usage le fixe via l'attribut class,
         pour éviter les conflits d'utilitaires p-* entre défaut et surcharge.
         (Commentaire volontairement DANS l'élément racine : à la racine du
         template il créerait un fragment et casserait l'héritage des attrs.) -->
    <slot />
  </div>
</template>
