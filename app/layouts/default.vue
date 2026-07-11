<template>
  <div class="drawer lg:drawer-open min-h-screen">
    <!-- Fond commun à toutes les pages : gradients + formes décoratives,
         en couche fixe sous tout le contenu (voir main.css). -->
    <div aria-hidden="true" class="page-background" />
    <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <LayoutNavbar />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
    <!-- <LayoutSidebar /> -->
  </div>
</template>
