<script setup lang="ts">
import {
  IconAlertTriangle,
  IconBatteryCharging,
  IconBolt,
  IconClockExclamation,
  IconLock,
  IconSparkles,
  IconTargetArrow,
  IconTrendingUp,
} from "@tabler/icons-vue";

const { user } = useUserSession();

const stats = [
  {
    label: "Avancement réel",
    value: "62%",
    hint: "-12 pts vs objectif",
    variant: "blue",
    icon: IconTrendingUp,
  },
  {
    label: "Objectif à date",
    value: "74%",
    hint: "Rythme attendu",
    variant: "blue",
    icon: IconTargetArrow,
  },
  {
    label: "Capacité restante",
    value: "148 h",
    hint: "-17 h - Congés déduits",
    variant: "sand",
    icon: IconBatteryCharging,
  },
  {
    label: "Vélocité",
    value: "38 pts",
    hint: "moy 44 - 3 derniers sprints",
    variant: "mint",
    icon: IconBolt,
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
        <p class="text-lg text-neutral-800">
          Bonjour {{ user?.firstName }}, on en est où ?
        </p>
        <h1 class="text-4xl font-semibold tracking-tight text-neutral-950">
          Sprint 24, <span class="text-gradient">on est à mi-course.</span>
        </h1>
      </div>
      <div class="flex shrink-0 items-stretch gap-3 pb-1">
        <UiChip
          size="sm"
          elevation="sm"
          class="!h-auto p-2 pr-3 pl-2 gap-2 text-neutral-600"
        >
          <UiChip
            round
            size="sm"
            elevation="sm"
            class="w-8 h-8 shrink-0 text-white"
          >
            <UiRoundProgress
              :value="100"
              :size="22"
              :stroke-width="3.5"
              gradient-from="#00B268"
              gradient-to="#4DFFA6"
              shadow-color="rgba(0, 178, 104, 0.32)"
            />
          </UiChip>

          JIRA sync. il y a 6 min
        </UiChip>
        <UiButton size="sm" elevation="sm" class="!h-auto filled">
          <IconSparkles :size="16" />
          Compte rendu IA
        </UiButton>
      </div>
    </div>

    <!-- Rangée des cartes de stats (le rectangle gris du fond de page passe
         derrière — voir .page-background dans main.css). -->
    <section class="mt-4">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <UiStatCard
          v-for="(stat, i) in stats"
          :key="i"
          :label="stat.label"
          :value="stat.value"
          :hint="stat.hint"
          :variant="stat.variant"
          :icon="stat.icon"
        />
      </div>
    </section>

    <!-- Burndown + Alertes automatiques. -->
    <section
      class="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[3fr_2fr]"
    >
      <UiCard elevation="sm" class="blurry-card shadow-card rounded-[28px] p-6">
        <h2 class="text-xl font-medium text-neutral-900">Burndown du sprint</h2>
        <p class="text-sm text-neutral-500">Points restants - réel vs idéal</p>
        <!-- Futur graphique (ChartsBaseChart) -->
        <div class="h-72" />
      </UiCard>

      <div>
        <UiCard
          elevation="sm"
          class="blurry-card shadow-card glass-tint-neutral rounded-[28px] p-6"
        >
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-medium text-neutral-900">
              Alertes automatiques
            </h2>
            <UiChip
              variant="pink"
              size="md"
              class="px-3! py-1 glass-tint-pink force-bg"
            >
              5 actives
            </UiChip>
          </div>
          <ul class="mt-5 flex flex-col gap-2">
            <li
              v-for="(alert, i) in alerts"
              :key="i"
              class="blurry-card shadow-card flex items-center gap-3 rounded-3xl p-3"
              :class="`glass-tint-${alert.variant}`"
            >
              <UiChip
                round
                size="md"
                class="glass-surface shrink-0 text-white"
                :class="`glass-tint-${alert.variant}`"
              >
                <component :is="alert.icon" :size="24" />
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
