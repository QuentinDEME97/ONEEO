<script setup lang="ts">
import { IconCircle, IconLogout, IconUser } from "@tabler/icons-vue";
const { user, clear } = useUserSession();

const logout = async () => {
  await clear();
  await navigateTo("/login");
};

const userInitials = computed(() =>
  `${user.value?.firstName?.[0] ?? ""}${user.value?.lastName?.[0] ?? ""}`.toUpperCase()
);

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
  // offsetLeft/offsetWidth (géométrie de layout, relative à la nav) plutôt
  // que getBoundingClientRect : les rects intègrent les transforms en cours
  // (scale d'un ancêtre, transition…) et fausseraient la position mémorisée
  // si la mesure tombe pendant une animation.
  pillStyle.value = {
    left: `${el.offsetLeft}px`,
    width: `${el.offsetWidth}px`,
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
  <header
    class="navbar w-full grid grid-cols-[1fr_auto_1fr] items-center sticky top-0 z-30 p-4 pb-0"
  >
    <div class="flex items-center gap-2">
      <!-- glass-surface (et pas glass-control) : la navbar est statique, pas
           de brightness au survol ni de scale au clic. -->
      <div
        class="glass-surface glass-surface--elevation-md w-12 h-12 flex items-center justify-center rounded-full text-white text-4xl font-medium"
        aria-label="Oneeo"
      >
        <span id="logo">
          <!-- Défs SVG hors-écran : porte le gradient référencé par
               `stroke="url(#logo-gradient)"` sur l'icône ci-dessous.
               -webkit-background-clip: text ne s'applique qu'à du texte, pas
               à un <svg> — c'est l'équivalent SVG du même effet. -->
          <svg width="0" height="0" style="position: absolute">
            <defs>
              <linearGradient
                id="logo-gradient"
                x1="76%"
                y1="92%"
                x2="24%"
                y2="8%"
              >
                <stop offset="0%" stop-color="#0099e5" />
                <stop offset="100%" stop-color="#4dc3ff" />
              </linearGradient>
            </defs>
          </svg>
          <IconCircle size="28" :stroke="3" color="url(#logo-gradient)" />
        </span>
      </div>
      <span class="font-semibold text-2xl">ONEEO</span>
    </div>
    <nav
      ref="navRef"
      class="relative flex text-xl font-light w-fit items-center gap-6 px-4 py-2 glass-surface glass-surface--elevation-sm rounded-full justify-self-center"
    >
      <span
        aria-hidden="true"
        class="nav-pill glass-surface"
        :style="pillStyle"
      />
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
    <!-- Sélecteur d'espace (dropdown verre) — le contenu de l'ancienne chip
         statique vit maintenant dans LayoutSpaceSwitcher. -->
    <div class="swicthers gap-2 flex items-center justify-self-end">
      <LayoutSpaceSwitcher />
      <LayoutProjectSwitcher />

      <!-- Menu utilisateur : avatar (ou initiales) → profil / déconnexion. -->
      <UiDropdown align="end">
        <template #trigger>
          <UiChip
            v-if="!user?.avatarPath"
            round
            size="sm"
            elevation="sm"
            class="text-xs font-semibold text-neutral-700"
          >
            {{ userInitials }}
          </UiChip>
          <img
            v-else
            :src="user.avatarPath"
            alt="Avatar"
            class="h-9 w-9 rounded-full object-cover"
          />
        </template>

        <template #default="{ close }">
          <ul class="flex flex-col gap-1" role="none">
            <li role="none">
              <NuxtLink
                to="/parametres/profil"
                role="menuitem"
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-neutral-600 transition-colors hover:bg-white/70"
                @click="close"
              >
                <IconUser :size="16" class="shrink-0" />
                Mon profil
              </NuxtLink>
            </li>
            <li class="my-1 border-t border-white/70" role="none" />
            <li role="none">
              <button
                type="button"
                role="menuitem"
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-neutral-600 transition-colors hover:bg-white/70"
                @click="logout"
              >
                <IconLogout :size="16" class="shrink-0" />
                Déconnexion
              </button>
            </li>
          </ul>
        </template>
      </UiDropdown>
    </div>
  </header>
</template>

<style scoped>
#logo svg {
  filter: drop-shadow(0 3px 5px rgba(77, 195, 255, 0.2));
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
