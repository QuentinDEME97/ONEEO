<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
import { computed } from "vue";
import VueApexCharts from "vue3-apexcharts";

const props = withDefaults(
  defineProps<{
    type?: NonNullable<ApexOptions["chart"]>["type"];
    series?: ApexOptions["series"];
    options?: ApexOptions;
    height?: string | number;
  }>(),
  {
    type: "line",
    height: 320,
    series: undefined,
    options: undefined,
  }
);

const demoSeries = [
  {
    name: "Vélocité",
    data: [12, 19, 14, 25, 22, 30, 28],
  },
];

const demoOptions: ApexOptions = {
  xaxis: { categories: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"] },
  title: { text: "Démo — BaseChart" },
  chart: {
    dropShadow: {
      enabled: true,
      color: "#000",
      top: 18,
      left: 7,
      blur: 10,
      opacity: 0.5,
    },
  },
  stroke: {
    curve: "smooth",
  },
};

const { themeOptions } = useChartTheme();

const series = computed(() => props.series ?? demoSeries);

const mergedOptions = computed<ApexOptions>(() => {
  const baseOptions = props.options ?? demoOptions;
  return {
    ...baseOptions,
    ...themeOptions.value,
    chart: {
      ...baseOptions.chart,
      ...themeOptions.value.chart,
      type: props.type,
    },
  };
});
</script>

<template>
  <VueApexCharts
    :type="type"
    :height="height"
    :series="series"
    :options="mergedOptions"
  />
</template>
