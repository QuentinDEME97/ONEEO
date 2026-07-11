<script setup lang="ts">
import {
  IconAlertTriangle,
  IconChartHistogram,
  IconClockExclamation,
  IconLock,
  IconSparkles,
} from "@tabler/icons-vue";

const { user } = useUserSession();

const stats = [
  {
    label: "Avancement réel",
    value: "62%",
    hint: "-12 pts vs objectif",
    variant: "blue",
  },
  {
    label: "Objectif à date",
    value: "74%",
    hint: "Rythme attendu",
    variant: "blue",
  },
  {
    label: "Capacité restante",
    value: "148 h",
    hint: "-17 h - Congés déduits",
    variant: "sand",
  },
  {
    label: "Capacité restante",
    value: "148 h",
    hint: "-17 h - Congés déduits",
    variant: "mint",
  },
] as const;

const alerts = [
  {
    variant: "sand",
    icon: IconAlertTriangle,
    title: "3 tâches sans estimation",
    desc: "Non chiffrées, invisible au burndown",
  },
  {
    variant: "pink",
    icon: IconLock,
    title: "EC-142 bloquée depuis 4 jours",
    desc: "“En attente API” - aucun mouvement",
  },
  {
    variant: "pink",
    icon: IconClockExclamation,
    title: "Délai de traitement dépassé",
    desc: "2 tickets au-delà du seuil de 3 jours",
  },
] as const;
</script>

<template>
  <div class="px-16">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-2xl text-neutral-800">
          Bonjour {{ user?.firstName }}, on en est où ?
        </p>
        <h1 class="text-5xl font-bold tracking-tight text-neutral-950">
          Sprint 24, <span class="text-gradient">on est à mi-course.</span>
        </h1>
      </div>
      <div class="flex shrink-0 items-center gap-3 pb-1">
        <UiChip size="sm" class="gap-2 text-neutral-600">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          JIRA sync. il y a 6 min
        </UiChip>
        <UiButton size="sm" elevation="sm" class="filled">
          <IconSparkles :size="16" />
          Compte rendu IA
        </UiButton>
      </div>
    </div>

    <!-- Rangée des cartes de stats (le rectangle gris du fond de page passe
         derrière — voir .page-background dans main.css). -->
    <section class="mt-10">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <UiStatCard
          v-for="(stat, i) in stats"
          :key="i"
          :label="stat.label"
          :value="stat.value"
          :hint="stat.hint"
          :variant="stat.variant"
          :icon="IconChartHistogram"
        />
      </div>
    </section>

    <!-- Burndown + Alertes automatiques. -->
    <section class="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[3fr_2fr]">
      <UiCard elevation="sm" class="glass-tint-neutral rounded-[28px] p-6">
        <h2 class="text-xl font-bold text-neutral-900">Burndown du sprint</h2>
        <p class="text-sm text-neutral-500">Points restants - réel vs idéal</p>
        <!-- Futur graphique (ChartsBaseChart) -->
        <div class="h-72" />
      </UiCard>

      <div>
        <UiCard elevation="sm" class="glass-tint-neutral rounded-[28px] p-6">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-bold text-neutral-900">
              Alertes automatiques
            </h2>
            <UiChip variant="pink" size="sm" class="text-rose-900/80">
              5 actives
            </UiChip>
          </div>
          <ul class="mt-5 flex flex-col gap-3">
            <li
              v-for="(alert, i) in alerts"
              :key="i"
              class="glass-surface glass-surface--elevation-sm flex items-center gap-3 rounded-2xl p-3"
              :class="`glass-tint-${alert.variant}`"
            >
              <UiChip round size="sm" class="shrink-0 text-white">
                <component :is="alert.icon" :size="18" />
              </UiChip>
              <div class="min-w-0">
                <p class="truncate font-semibold text-neutral-900">
                  {{ alert.title }}
                </p>
                <p class="truncate text-sm text-neutral-600">
                  {{ alert.desc }}
                </p>
              </div>
            </li>
          </ul>
        </UiCard>
      </div>
    </section>

    <!-- <ChartsBaseChart class="mt-4" /> -->
    <!-- <div class="container gap-14 mt-6">
      <RoundButton
        class="mt-4 glass-btn"
        aria-label="Round Button"
        :icon="IconPlayerSkipBackFilled"
        size="xl"
      />
      <RoundButton
        class="mt-4 glass-btn"
        aria-label="Round Button"
        :icon="IconPlayerPauseFilled"
        size="xl"
      />
      <RoundButton
        class="mt-4 glass-btn"
        aria-label="Round Button"
        :icon="IconPlayerSkipForwardFilled"
        size="xl"
      />
    </div> -->
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 850px;
  aspect-ratio: 850 / 567;
  background-image: url("/landscape.png");
  background-size: cover;
  background-position: center;
}

.text-gradient {
  background: linear-gradient(90deg, #2d86df 0%, #0962bc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass-btn {
  margin-top: -2rem;
}
</style>
