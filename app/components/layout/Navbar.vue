<script setup lang="ts">
const { clear } = useUserSession();

// Préfixé `_` en attendant d'être rebranché sur le futur menu utilisateur
// (règle lint no-unused-vars).
const _logout = async () => {
  await clear();
  await navigateTo("/login");
};

const navItems = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/sprints", label: "Sprints" },
  { to: "/equipes", label: "Equipes" },
  { to: "/temps-conges", label: "Temps & congés" },
  { to: "/anomalies", label: "Anomalies & SLA" },
];

const route = useRoute();

const isActive = (path: string, exact = false) => {
  if (exact) return route.path === path;
  return route.path === path || route.path.startsWith(path + "/");
};

const activeIndex = computed(() =>
  navItems.findIndex((item) => isActive(item.to, item.exact))
);

// Pilule coulissante : un seul élément décoratif positionné en absolu dans la
// nav, dont left/width sont mesurés sur le lien actif. La transition CSS fait
// glisser la pilule d'un lien à l'autre au changement de route.
const navRef = ref<HTMLElement>();
const linkEls = ref<(HTMLElement | null)[]>([]);

function setLinkRef(el: unknown, index: number) {
  // NuxtLink expose l'élément DOM via $el (ref de composant, pas d'élément).
  const maybe = el as { $el?: HTMLElement } | HTMLElement | null;
  linkEls.value[index] =
    maybe && "$el" in (maybe as object)
      ? ((maybe as { $el?: HTMLElement }).$el ?? null)
      : ((maybe as HTMLElement) ?? null);
}

const pillStyle = ref({ left: "0px", width: "0px", opacity: "0" });

function updatePill() {
  const nav = navRef.value;
  const el = linkEls.value[activeIndex.value];
  if (!nav || !el || activeIndex.value < 0) {
    pillStyle.value = { ...pillStyle.value, opacity: "0" };
    return;
  }
  const navRect = nav.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  pillStyle.value = {
    left: `${rect.left - navRect.left}px`,
    width: `${rect.width}px`,
    opacity: "1",
  };
}

watch(
  () => route.path,
  () => nextTick(updatePill)
);

onMounted(() => {
  updatePill();
  // Les largeurs de texte changent quand la webfont arrive : on re-mesure.
  document.fonts?.ready.then(updatePill);
  window.addEventListener("resize", updatePill);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updatePill);
});
</script>

<template>
  <header class="navbar w-full flex justify-between sticky top-0 z-30 p-4">
    <div class="flex items-center gap-2">
      <div
        class="glass-control glass-control--elevation-md w-14 h-14 flex items-center justify-center rounded-full text-white text-4xl font-medium"
        aria-label="Oneeo"
      >
        <span id="logo">O</span>
      </div>
      <span class="font-semibold text-2xl">ONEEO</span>
    </div>
    <nav
      ref="navRef"
      class="relative flex text-xl font-light w-fit items-center gap-6 px-6 py-3 glass-control glass-control--elevation-sm rounded-full"
    >
      <span aria-hidden="true" class="nav-pill glass-surface" :style="pillStyle" />
      <NuxtLink
        v-for="(item, i) in navItems"
        :key="item.to"
        :ref="(el) => setLinkRef(el, i)"
        :to="item.to"
        class="relative z-10 rounded-full py-2 px-3 transition-colors duration-300"
        :class="
          isActive(item.to, item.exact)
            ? 'text-neutral-900'
            : 'text-gray-500 hover:text-neutral-700'
        "
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
    <div class="space-selector"></div>
  </header>
</template>

<style scoped>
#logo {
  background: -webkit-linear-gradient(-32deg, #0099e5, #4dc3ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 3px 5px rgba(77, 195, 255, 0.2);
}

/* Pilule de sélection (ex #join-btn) : purement décorative, elle glisse vers
   le lien actif via la transition sur left/width. */
.nav-pill {
  position: absolute;
  top: 50%;
  height: calc(100% - 24px);
  translate: 0 -50%;
  border-radius: 9999px;
  background-color: rgba(77, 166, 255, 0.12) !important;
  transition:
    left 300ms cubic-bezier(0.4, 0, 0.2, 1),
    width 300ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 150ms;

  &.glass-surface::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.25px;
    background: linear-gradient(
      180deg,
      rgba(230, 242, 255, 1) 10%,
      rgba(5, 130, 255, 0.25) 41%,
      rgba(230, 242, 255, 1) 90%
    );
    /* Couche 1 clippée sur content-box (l'intérieur du padding), couche 2 pleine :
     l'exclusion ne laisse visible que l'anneau de padding qui porte le gradient. */
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }

  &.glass-surface {
    background: linear-gradient(
      135deg,
      rgba(77, 166, 255, 0) 50%,
      rgba(77, 166, 255, 0.2) 90%
    );
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
}
</style>
