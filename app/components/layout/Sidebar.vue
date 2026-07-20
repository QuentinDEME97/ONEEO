<script setup lang="ts">
import {
  IconAlertTriangle,
  IconCalendarTime,
  IconLayoutGrid,
  IconPackage,
  IconReportAnalytics,
  IconSettings,
  IconStack2,
  IconUsers,
} from "@tabler/icons-vue";

const navItems = [
  { to: "/", label: "Tableau de bord", icon: IconLayoutGrid, exact: true },
  { to: "/sprints", label: "Sprints", icon: IconStack2 },
  { to: "/livrables", label: "Livrables", icon: IconPackage },
  { to: "/equipes", label: "Équipes", icon: IconUsers },
  { to: "/temps-conges", label: "Temps & Congés", icon: IconCalendarTime },
  { to: "/anomalies", label: "Anomalies & SLA", icon: IconAlertTriangle },
  { to: "/rapports", label: "Rapports & IA", icon: IconReportAnalytics },
];

const route = useRoute();
const { user } = useUserSession();

const userInitials = computed(() => {
  const first = user.value?.firstName?.[0] ?? "";
  const last = user.value?.lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
});

const isActive = (path: string, exact: boolean) => {
  if (exact) return route.path === path;
  return route.path === path || route.path.startsWith(path + "/");
};
</script>

<template>
  <div class="drawer-side z-40 overflow-visible">
    <label
      for="sidebar-drawer"
      aria-label="close sidebar"
      class="drawer-overlay"
    />
    <!-- Panneau flottant façon maquette : marge tout autour, coins très
         arrondis, surface verre. -->
    <aside class="min-h-full w-72 p-4 flex">
      <UiCard
        id="sidebar"
        elevation="sm"
        class="flex w-full flex-col rounded-[28px] p-4 bg-white/25"
      >
        <!-- En-tête : pastille logo + nom produit -->
        <div class="flex items-center gap-4 px-1 pb-6 pt-2">
          <span
            class="glass-surface glass-surface--elevation-sm flex h-13 w-13 shrink-0 items-center justify-center rounded-full"
          >
            <span
              class="block h-6 w-6 rounded-full border-[6px] border-blue-500 bg-white"
            />
          </span>
          <span>
            <span class="block text-xl font-bold text-neutral-800">ONEEO</span>
            <span class="block text-sm text-neutral-400">On en est où ?</span>
          </span>
        </div>

        <LayoutSpaceSwitcher />

        <div class="mt-3">
          <LayoutProjectSwitcher />
        </div>

        <p
          class="mb-2 mt-6 px-3 text-[11px] font-semibold tracking-[0.2em] text-neutral-400"
        >
          PILOTAGE
        </p>

        <nav class="flex-1">
          <ul class="flex flex-col gap-1">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="flex h-11 items-center gap-3 rounded-2xl px-3 transition-colors"
                :class="
                  isActive(item.to, item.exact ?? false)
                    ? 'glass-surface glass-surface--elevation-sm text-neutral-800 shadow-[0_6px_16px_-6px_rgba(30,60,120,0.18)]'
                    : 'text-neutral-500 hover:bg-white/40'
                "
              >
                <component
                  :is="item.icon"
                  :size="20"
                  class="shrink-0"
                  :class="
                    isActive(item.to, item.exact ?? false)
                      ? 'text-blue-500'
                      : ''
                  "
                />
                <span class="flex-1 truncate">{{ item.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Bas de panneau : Paramètres puis carte utilisateur -->
        <NuxtLink
          to="/parametres"
          class="flex h-11 items-center gap-3 rounded-2xl px-3 transition-colors"
          :class="
            isActive('/parametres', false)
              ? 'bg-white/70 font-semibold text-neutral-800 shadow-[0_6px_16px_-6px_rgba(30,60,120,0.18)]'
              : 'text-neutral-500 hover:bg-white/40'
          "
        >
          <IconSettings
            :size="20"
            class="shrink-0"
            :class="isActive('/parametres', false) ? 'text-blue-500' : ''"
          />
          <span class="flex-1 truncate">Paramètres</span>
        </NuxtLink>

        <UiCard
          elevation="sm"
          class="mt-3 flex items-center gap-3 rounded-2xl p-2.5 bg-white/50"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-200/80 text-sm font-semibold text-neutral-700"
          >
            {{ userInitials }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-semibold text-neutral-800">
              {{ user?.firstName }} {{ user?.lastName }}
            </span>
            <span class="block truncate text-xs text-neutral-400">
              {{ user?.email }}
            </span>
          </span>
        </UiCard>
      </UiCard>
    </aside>
  </div>
</template>
