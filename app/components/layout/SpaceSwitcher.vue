<script setup lang="ts">
import { IconCheck, IconChevronDown, IconPlus } from "@tabler/icons-vue";

const { spaces, currentSpace, selectSpace, createSpace } = useCurrentSpace();

const modalRef = ref<{ showModal: () => void; close: () => void }>();
const newSpaceName = ref("");
const creating = ref(false);

function pickSpace(id: string, close: () => void) {
  selectSpace(id);
  close();
}

function openCreateDialog(close: () => void) {
  close();
  newSpaceName.value = "";
  modalRef.value?.showModal();
}

async function submitCreateSpace() {
  if (!newSpaceName.value.trim()) return;

  creating.value = true;
  try {
    await createSpace(newSpaceName.value.trim());
    modalRef.value?.close();
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <UiDropdown align="end">
    <!-- Déclencheur : la chip espace de la navbar (texte + anneau bleu). -->
    <template #trigger="{ open }">
      <UiChip
        size="sm"
        elevation="sm"
        class="!h-auto p-2 px-3 pr-2 gap-2 text-neutral-600"
      >
        {{ currentSpace?.name ?? "Espace" }}
        <IconChevronDown
          :size="16"
          class="shrink-0 text-neutral-400 transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
        />
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
            gradient-from="#0099E5"
            gradient-to="#4DC3FF"
            shadow-color="rgb(77,195,255, 0.2)"
          />
        </UiChip>
      </UiChip>
    </template>

    <template #default="{ close }">
      <ul class="flex flex-col gap-1" role="none">
        <li v-for="s in spaces" :key="s.id" role="none">
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-neutral-600 transition-colors hover:bg-white/70"
            @click="pickSpace(s.id, close)"
          >
            <IconCheck
              :size="16"
              class="shrink-0"
              :class="
                s.id === currentSpace?.id ? 'text-blue-500' : 'opacity-0'
              "
            />
            <span
              class="truncate"
              :class="
                s.id === currentSpace?.id
                  ? 'font-semibold text-neutral-900'
                  : ''
              "
            >
              {{ s.name }}
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
            Créer un espace
          </button>
        </li>
      </ul>
    </template>
  </UiDropdown>

  <UiModal ref="modalRef" title="Créer un espace">
    <form class="flex flex-col gap-4" @submit.prevent="submitCreateSpace">
      <label class="flex flex-col gap-1.5">
        <span class="text-sm text-neutral-500">Nom de l'espace</span>
        <UiInput v-model="newSpaceName" required placeholder="Ex. Espace Client" />
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
