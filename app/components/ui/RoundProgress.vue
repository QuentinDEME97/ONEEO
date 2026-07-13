<script setup lang="ts">
// Anneau de progression SVG : trace un cercle dont l'arc rempli représente
// `value` (0-100). Le dégradé est personnalisable via les props `gradientFrom`
// / `gradientTo` (défaut calé sur .glass-tint-blue). Piste vide transparente,
// drop shadow porté par l'arc rempli uniquement — par défaut calée sur
// `gradientFrom`, mais surchargeable indépendamment via `shadowColor`.

const props = withDefaults(
  defineProps<{
    value: number;
    size?: number;
    strokeWidth?: number;
    trackColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
    shadowColor?: string;
  }>(),
  {
    size: 20,
    strokeWidth: 3,
    trackColor: "transparent",
    gradientFrom: "#0059b2",
    gradientTo: "#4da6ff",
    shadowColor: undefined,
  }
);

const gradientId = `round-progress-gradient-${useId()}`;

const effectiveShadowColor = computed(
  () => props.shadowColor ?? props.gradientFrom
);

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)));

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashOffset = computed(
  () => circumference.value * (1 - clampedValue.value / 100)
);
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center overflow-visible"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="clampedValue"
  >
    <svg
      class="overflow-visible"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" :stop-color="gradientFrom" />
          <stop offset="100%" :stop-color="gradientTo" />
        </linearGradient>
      </defs>
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="trackColor"
        :stroke-width="strokeWidth"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="`url(#${gradientId})`"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform-origin="center"
        transform="rotate(-90)"
        class="transition-[stroke-dashoffset] duration-500 ease-out"
        :style="{ filter: `drop-shadow(-1px 1px 2px ${effectiveShadowColor})` }"
      />
    </svg>
  </div>
</template>
