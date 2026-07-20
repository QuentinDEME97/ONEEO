<script setup lang="ts">
import { IconCheck, IconChevronDown, IconFolder, IconPlus } from "@tabler/icons-vue";

const { projects, currentProject, selectProject, createProject } =
  useCurrentProject();

// Thèmes DaisyUI proposés à la création. « (hérité) » = pas de surcharge, le
// projet reprend le thème de l'espace. Tous les thèmes DaisyUI sont activés
// (`themes: all` dans main.css), on en expose une sélection représentative.
const THEME_OPTIONS = [
  { value: "", label: "Hérité de l'espace" },
  { value: "oneeo", label: "Oneeo" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "corporate", label: "Corporate" },
  { value: "emerald", label: "Emerald" },
  { value: "synthwave", label: "Synthwave" },
  { value: "dracula", label: "Dracula" },
  { value: "winter", label: "Winter" },
];

const modalRef = ref<{ showModal: () => void; close: () => void }>();
const newProjectName = ref("");
const newProjectTheme = ref("");
const creating = ref(false);

function pickProject(id: string, close: () => void) {
  selectProject(id);
  close();
}

function openCreateDialog(close: () => void) {
  close();
  newProjectName.value = "";
  newProjectTheme.value = "";
  modalRef.value?.showModal();
}

async function submitCreateProject() {
  if (!newProjectName.value.trim()) return;

  creating.value = true;
  try {
    await createProject({
      name: newProjectName.value.trim(),
      theme: newProjectTheme.value || null,
    });
    modalRef.value?.close();
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <UiDropdown align="start">
    <template #trigger="{ open }">
      <span
        class="glass-surface glass-surface--elevation-sm flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-neutral-600"
      >
        <IconFolder :size="18" class="shrink-0 text-blue-500" />
        <span class="min-w-0 flex-1 truncate font-medium text-neutral-800">
          {{ currentProject?.name ?? "Aucun projet" }}
        </span>
        <IconChevronDown
          :size="16"
          class="shrink-0 text-neutral-400 transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
        />
      </span>
    </template>

    <template #default="{ close }">
      <ul class="flex flex-col gap-1" role="none">
        <li v-if="projects.length === 0" role="none">
          <span class="block px-3 py-2 text-sm text-neutral-400">
            Aucun projet dans cet espace
          </span>
        </li>
        <li v-for="p in projects" :key="p.id" role="none">
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-neutral-600 transition-colors hover:bg-white/70"
            @click="pickProject(p.id, close)"
          >
            <IconCheck
              :size="16"
              class="shrink-0"
              :class="
                p.id === currentProject?.id ? 'text-blue-500' : 'opacity-0'
              "
            />
            <span
              class="truncate"
              :class="
                p.id === currentProject?.id
                  ? 'font-semibold text-neutral-900'
                  : ''
              "
            >
              {{ p.name }}
            </span>
          </button>
        </li>
        <li class="my-1 border-t border-white/70" role="none" />
        <li role="none">
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-neutral-600 transition-colors hover:bg-white/70"
            @click="openCreateDialog(close)"
          >
            <IconPlus :size="16" class="shrink-0" />
            Créer un projet
          </button>
        </li>
      </ul>
    </template>
  </UiDropdown>

  <UiModal ref="modalRef" title="Créer un projet">
    <form class="flex flex-col gap-4" @submit.prevent="submitCreateProject">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-neutral-500">Nom du projet</span>
        <UiInput
          v-model="newProjectName"
          required
          placeholder="Ex. Refonte du portail"
        />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-neutral-500">Thème</span>
        <select
          v-model="newProjectTheme"
          class="glass-surface glass-surface--elevation-sm h-11 rounded-xl px-4 text-base text-neutral-800"
        >
          <option
            v-for="opt in THEME_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </label>
      <div class="mt-2 flex justify-end gap-3">
        <UiButton size="sm" elevation="sm" @click="modalRef?.close()">
          Annuler
        </UiButton>
        <UiButton
          type="submit"
          size="sm"
          elevation="sm"
          class="filled"
          :disabled="creating"
        >
          <IconPlus :size="16" />
          Créer
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>
