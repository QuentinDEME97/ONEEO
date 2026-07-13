<script setup lang="ts">
import { IconCheck, IconChevronDown, IconPlus } from "@tabler/icons-vue";

const { spaces, currentSpace, selectSpace, createSpace } = useCurrentSpace();

const dialogRef = ref<HTMLDialogElement>();
const newSpaceName = ref("");
const creating = ref(false);

function pickSpace(id: string, close: () => void) {
  selectSpace(id);
  close();
}

function openCreateDialog(close: () => void) {
  close();
  newSpaceName.value = "";
  dialogRef.value?.showModal();
}

async function submitCreateSpace() {
  if (!newSpaceName.value.trim()) return;

  creating.value = true;
  try {
    await createSpace(newSpaceName.value.trim());
    dialogRef.value?.close();
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

  <Teleport to="body">
    <dialog ref="dialogRef" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Créer un espace</h3>
        <form
          class="flex flex-col gap-3 mt-4"
          @submit.prevent="submitCreateSpace"
        >
          <label class="form-control">
            <span class="label-text mb-1">Nom de l'espace</span>
            <input
              v-model="newSpaceName"
              type="text"
              required
              class="input input-bordered w-full"
            />
          </label>
          <div class="modal-action">
            <button
              type="button"
              class="btn btn-ghost"
              @click="dialogRef?.close()"
            >
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="creating">
              <IconPlus :size="16" />
              Créer
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </Teleport>
</template>
