<script setup lang="ts">
// Dropdown verre générique : un déclencheur (slot `trigger`, reçoit `open`)
// et un panneau glass-surface ancré dessous (slot par défaut, reçoit `close`
// pour fermer après une action). Fermeture au clic extérieur et à Échap.

withDefaults(
  defineProps<{
    align?: "start" | "end";
  }>(),
  {
    align: "end",
  }
);

const open = ref(false);
const rootRef = ref<HTMLElement>();

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function onDocumentClick(event: MouseEvent) {
  if (
    open.value &&
    rootRef.value &&
    !rootRef.value.contains(event.target as Node)
  ) {
    close();
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="rootRef" class="relative inline-block">
    <button
      type="button"
      class="block cursor-pointer"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggle"
    >
      <slot name="trigger" :open="open" />
    </button>

    <Transition name="dropdown">
      <div
        v-show="open"
        role="menu"
        class="dropdown-panel glass-surface glass-surface--elevation-md absolute top-full z-50 mt-2 min-w-56 rounded-2xl p-2"
        :class="align === 'end' ? 'right-0' : 'left-0'"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Fond plus opaque que la recette de base : un menu doit rester lisible
   quel que soit le contenu qui passe dessous. */
.dropdown-panel {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.85) 100%
  );
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 150ms ease,
    translate 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  translate: 0 -4px;
}
</style>
