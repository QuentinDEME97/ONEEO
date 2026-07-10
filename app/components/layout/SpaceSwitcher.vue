<script setup lang="ts">
import { IconChevronDown, IconPlus } from "@tabler/icons-vue";

const CREATE_OPTION_VALUE = "__create__";

const { spaces, currentSpace, selectSpace, createSpace } = useCurrentSpace();

const selectRef = ref<HTMLSelectElement>();
const dialogRef = ref<HTMLDialogElement>();
const newSpaceName = ref("");
const creating = ref(false);

const initials = computed(() => {
  const name = currentSpace.value?.name ?? "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
});

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
  <!-- Carte verre façon maquette ; le <select> natif invisible par-dessus
       conserve tel quel le comportement existant (choix + création). -->
  <div class="relative">
    <UiCard
      elevation="sm"
      class="flex items-center gap-3 rounded-2xl p-2 pr-3 bg-white/40"
    >
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-semibold text-white"
      >
        {{ initials }}
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate font-semibold text-neutral-800">
          {{ currentSpace?.name }}
        </span>
        <span class="block truncate text-xs text-neutral-400">
          Espace de travail
        </span>
      </span>
      <IconChevronDown :size="18" class="shrink-0 text-neutral-400" />
    </UiCard>
    <select
      ref="selectRef"
      class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      aria-label="Changer d'espace"
      :value="currentSpace?.id"
      @change="onSelectChange"
    >
      <option v-for="s in spaces" :key="s.id" :value="s.id">
        {{ s.name }}
      </option>
      <option disabled>──────────</option>
      <option :value="CREATE_OPTION_VALUE">+ Créer un espace</option>
    </select>
  </div>

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
