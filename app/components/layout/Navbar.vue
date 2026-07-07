<script setup lang="ts">
import {
  Menu01Icon,
  Notification01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
</script>

<template>
  <header
    class="navbar bg-base-100 border-b border-base-300 h-16 min-h-0 px-4 sticky top-0 z-30"
  >
    <div class="flex-none lg:hidden">
      <label for="sidebar-drawer" class="btn btn-ghost btn-square">
        <HugeiconsIcon :icon="Menu01Icon" :size="20" />
      </label>
    </div>

    <div class="flex-1" />

    <div class="flex items-center gap-1">
      <button class="btn btn-ghost btn-circle">
        <HugeiconsIcon :icon="Notification01Icon" :size="20" />
      </button>

      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <HugeiconsIcon :icon="UserCircleIcon" :size="28" />
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box shadow-lg w-44 p-2 mt-2 border border-base-200"
        >
          <li><NuxtLink to="/parametres/profil">Profil</NuxtLink></li>
          <li><a>Déconnexion</a></li>
        </ul>
      </div>
    </div>
  </header>
</template>
