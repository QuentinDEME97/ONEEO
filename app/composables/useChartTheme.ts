import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { ApexOptions } from "apexcharts";

const THEME_CSS_VARS = [
  "--color-primary",
  "--color-secondary",
  "--color-accent",
  "--color-info",
  "--color-success",
  "--color-warning",
  "--color-error",
  "--color-base-content",
  "--color-base-300",
] as const;

type ThemeCssVar = (typeof THEME_CSS_VARS)[number];

function readCssVars(): Record<ThemeCssVar, string> {
  const styles = getComputedStyle(document.documentElement);
  const values = {} as Record<ThemeCssVar, string>;
  for (const name of THEME_CSS_VARS) {
    values[name] = styles.getPropertyValue(name).trim();
  }
  return values;
}

/**
 * Lit les variables CSS du thème DaisyUI actif et les expose sous forme
 * d'options ApexCharts prêtes à fusionner. Se recalcule automatiquement
 * quand `data-theme` change sur `<html>` (changement de thème par
 * espace/projet, cf. CLAUDE.md).
 */
export function useChartTheme() {
  const cssVars = ref<Record<ThemeCssVar, string>>({
    "--color-primary": "",
    "--color-secondary": "",
    "--color-accent": "",
    "--color-info": "",
    "--color-success": "",
    "--color-warning": "",
    "--color-error": "",
    "--color-base-content": "",
    "--color-base-300": "",
  });

  let observer: MutationObserver | undefined;

  onMounted(() => {
    cssVars.value = readCssVars();

    observer = new MutationObserver(() => {
      cssVars.value = readCssVars();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  const themeOptions = computed<ApexOptions>(() => ({
    colors: [
      cssVars.value["--color-primary"],
      cssVars.value["--color-secondary"],
      cssVars.value["--color-accent"],
      cssVars.value["--color-info"],
      cssVars.value["--color-success"],
      cssVars.value["--color-warning"],
      cssVars.value["--color-error"],
    ].filter(Boolean),
    chart: {
      foreColor: cssVars.value["--color-base-content"] || undefined,
    },
    grid: {
      borderColor: cssVars.value["--color-base-300"] || undefined,
    },
  }));

  return { themeOptions };
}
