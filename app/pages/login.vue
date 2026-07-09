<script setup lang="ts">
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

definePageMeta({ layout: false });

const { fetch: refreshSession } = useUserSession();

const showPassword = ref(false);

const form = reactive({
  email: "",
  password: "",
});

const errorMessage = ref("");
const submitting = ref(false);

async function submit() {
  errorMessage.value = "";

  submitting.value = true;
  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: form.email,
        password: form.password,
      },
    });
    await refreshSession();
    await navigateTo("/");
  } catch (error) {
    const statusMessage = (error as { data?: { statusMessage?: string } })?.data
      ?.statusMessage;
    errorMessage.value = statusMessage ?? "Une erreur est survenue, réessayez.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="text-2xl font-bold">Se connecter</h1>
        <p class="text-sm text-base-content/70">
          Connectez-vous à votre compte pour utiliser ONEEO.
        </p>

        <form class="flex flex-col gap-3 mt-4" @submit.prevent="submit">
          <label class="form-control">
            <span class="label-text mb-1">Email</span>
            <input
              v-model="form.email"
              type="email"
              required
              class="input input-bordered w-full"
            />
          </label>

          <label class="form-control">
            <span class="label-text mb-1">Mot de passe</span>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="input input-bordered w-full pr-10"
              />
              <button
                type="button"
                class="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                @click="showPassword = !showPassword"
              >
                <HugeiconsIcon
                  :icon="showPassword ? EyeOffIcon : EyeIcon"
                  size="18"
                />
              </button>
            </div>
          </label>

          <p v-if="errorMessage" class="text-error text-sm">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            class="btn btn-primary mt-2"
            :disabled="submitting"
          >
            {{ submitting ? "Connexion..." : "Se connecter" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
