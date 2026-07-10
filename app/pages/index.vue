<script setup lang="ts">
import {
  IconPlayerPauseFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from "@tabler/icons-vue";
import RoundButton from "~/components/ui/RoundButton.vue";

const { user } = useUserSession();
</script>

<template>
  <div class="relative">
    <!-- Formes décoratives d'arrière-plan (cf. maquette) : rectangle gris à
         gauche derrière les cartes de stats, rectangle rayé bleu à droite
         derrière la colonne Alertes. Peintes avant le contenu, donc dessous. -->
    <div aria-hidden="true" class="deco deco-gray" />
    <div aria-hidden="true" class="deco deco-stripes" />

    <div class="relative">
      <p class="text-lg text-neutral-800">
        Bonjour {{ user?.firstName }}, on en est où ?
      </p>
      <h1 class="text-4xl font-extrabold tracking-tight text-neutral-950">
        Sprint 24, <span class="text-blue-600">on est à mi-course.</span>
      </h1>

      <!-- <ChartsBaseChart class="mt-4" /> -->
      <div class="container gap-14 mt-6">
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
      </div>
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
  left: 8px;
  top: 92px;
  width: 46%;
  height: 380px;
  border-radius: 28px;
  background: rgba(228, 230, 236, 0.55);
}

/* Rectangle rayé bleu : colonne de droite, derrière la carte verte et le
   panneau Alertes. Rayures fines en « / » (135deg). */
.deco-stripes {
  right: 4px;
  top: 116px;
  width: 26%;
  height: 640px;
  background: repeating-linear-gradient(
    135deg,
    rgba(94, 138, 235, 0.7) 0 3px,
    transparent 3px 13px
  );
}
</style>
