<script setup lang="ts">
const { user } = useUserSession();
</script>

<template>
  <div class="relative px-16">
    <!-- Formes décoratives d'arrière-plan (cf. maquette) : rectangle gris à
         gauche derrière les cartes de stats, rectangle rayé bleu à droite
         derrière la colonne Alertes. Peintes avant le contenu, donc dessous. -->
    <div aria-hidden="true" class="deco deco-gray" />
    <div aria-hidden="true" class="deco deco-stripes" />

    <div class="relative">
      <p class="text-2xl text-neutral-800">
        Bonjour {{ user?.firstName }}, on en est où ?
      </p>
      <h1 class="text-5xl font-bold tracking-tight text-neutral-950">
        Sprint 24, <span class="text-gradient">on est à mi-course.</span>
      </h1>

      <!-- <ChartsBaseChart class="mt-4" /> -->
      <!-- <div class="container gap-14 mt-6">
        <RoundButton
          class="mt-4 glass-btn"
          aria-label="Round Button"
          :icon="IconPlayerSkipBackFilled"
          size="xl"
        />
        <RoundButton
          class="mt-4 glass-btn"
          aria-label="Round Button"
          :icon="IconPlayerPauseFilled"
          size="xl"
        />
        <RoundButton
          class="mt-4 glass-btn"
          aria-label="Round Button"
          :icon="IconPlayerSkipForwardFilled"
          size="xl"
        />
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 850px;
  aspect-ratio: 850 / 567;
  background-image: url("/landscape.png");
  background-size: cover;
  background-position: center;
}

.text-gradient {
  background: linear-gradient(90deg, #2d86df 0%, #0962bc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.glass-btn {
  margin-top: -2rem;
}

.deco {
  position: absolute;
  pointer-events: none;
}

/* Rectangle gris : démarre sous le titre, déborde derrière les deux
   premières cartes de stats (elles viendront se poser dessus). */
.deco-gray {
  left: 5%;
  top: 100%;
  width: 46%;
  height: 380px;
  border-radius: 28px;
  background: linear-gradient(
    -32deg,
    rgb(173, 173, 173, 0.08),
    rgba(128, 128, 128, 0.08)
  );
}

/* Rectangle rayé bleu : colonne de droite, derrière la carte verte et le
   panneau Alertes. Rayures fines en « / » (135deg). */
.deco-stripes {
  right: 5%;
  top: 150%;
  width: 26%;
  height: 640px;
  border-radius: 28px;
  background: repeating-linear-gradient(
    -135deg,
    rgba(78, 166, 255, 1) 0 2px,
    transparent 2px 8px
  );
}
</style>
