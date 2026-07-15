<script setup lang="ts">
// Modal verre : <dialog> natif (comportement DaisyUI conservé — Échap, clic
// sur le fond) avec la boîte en glass-surface et un voile clair flouté.
// Le parent pilote l'ouverture via ref : modalRef.value?.showModal() / close().

withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: undefined,
  }
);

const dialogRef = ref<HTMLDialogElement>();

function showModal() {
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

defineExpose({ showModal, close });
</script>

<template>
  <Teleport to="body">
    <dialog ref="dialogRef" class="modal glass-modal">
      <div
        class="modal-box glass-surface glass-surface--elevation-md glass-modal-box rounded-[28px] p-6"
      >
        <h3 v-if="title" class="mb-4 text-xl font-semibold text-neutral-900">
          {{ title }}
        </h3>
        <slot :close="close" />
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </Teleport>
</template>

<style scoped>
/* Voile clair flouté plutôt que le noir DaisyUI : reste dans l'univers verre. */
.glass-modal {
  background: rgba(190, 205, 230, 0.25);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* La boîte : fond assez opaque pour la lisibilité (formulaires), l'anneau en
   gradient vient de glass-surface. On neutralise le fond/l'ombre DaisyUI de
   .modal-box au profit de la recette. */
.glass-modal-box {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.82) 0%,
    rgba(240, 246, 255, 0.94) 100%
  );
}
</style>
