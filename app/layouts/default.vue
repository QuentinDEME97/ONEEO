<template>
  <div class="drawer lg:drawer-open min-h-screen">
    <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <LayoutNavbar />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
    <LayoutSidebar />
  </div>
</template>
