<script setup lang="ts">
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const CREATE_OPTION_VALUE = "__create__";

const { spaces, currentSpace, selectSpace, createSpace } = useCurrentSpace();

const selectRef = ref<HTMLSelectElement>();
const dialogRef = ref<HTMLDialogElement>();
const newSpaceName = ref("");
const creating = ref(false);

function openCreateDialog() {
  newSpaceName.value = "";
  dialogRef.value?.showModal();
}

function onSelectChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;

  if (value === CREATE_OPTION_VALUE) {
    // Le natif `<select>` a déjà changé sa valeur affichée sur le choix
    // "Créer un espace" ; on la remet immédiatement sur l'espace actif
    // puisque cette option n'en est pas vraiment un.
    if (selectRef.value) selectRef.value.value = currentSpace.value?.id ?? "";
    openCreateDialog();
    return;
  }

  selectSpace(value);
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
  <select
    ref="selectRef"
    class="select appearance-none w-full"
    :value="currentSpace?.id"
    @change="onSelectChange"
  >
    <option v-for="s in spaces" :key="s.id" :value="s.id">{{ s.name }}</option>
    <option disabled>──────────</option>
    <option :value="CREATE_OPTION_VALUE">+ Créer un espace</option>
  </select>

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
              <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
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
