<script setup lang="ts">
import {
  AlertCircleIcon,
  Analytics01Icon,
  CalendarClockIcon,
  DashboardSquare01Icon,
  Layers01Icon,
  Package01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const navItems = [
  { to: "/", label: "Dashboard", icon: DashboardSquare01Icon, exact: true },
  { to: "/sprints", label: "Sprints", icon: Layers01Icon },
  { to: "/livrables", label: "Livrables", icon: Package01Icon },
  { to: "/equipes", label: "Équipes", icon: UserGroupIcon },
  { to: "/temps-conges", label: "Temps & Congés", icon: CalendarClockIcon },
  { to: "/anomalies", label: "Anomalies & SLA", icon: AlertCircleIcon },
  { to: "/rapports", label: "Rapports & IA", icon: Analytics01Icon },
  { to: "/parametres", label: "Paramètres", icon: Settings01Icon },
];

const route = useRoute();

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
    <aside class="bg-base-200 min-h-full w-64 flex flex-col">
      <div
        class="h-16 flex items-center px-5 border-b border-base-300 shrink-0"
      >
        <span class="text-xl font-bold text-primary">ONEEO</span>
      </div>
      <div class="px-3 pt-3">
        <LayoutSpaceSwitcher />
      </div>
      <ul class="menu p-3 flex-1 gap-0.5 w-full">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="{ active: isActive(item.to, item.exact ?? false) }"
          >
            <HugeiconsIcon :icon="item.icon" :size="18" />
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </aside>
  </div>
</template>
