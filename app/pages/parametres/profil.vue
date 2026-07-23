<script setup lang="ts">
import { IconCamera, IconCheck } from "@tabler/icons-vue";

const { user, fetch: refreshSession } = useUserSession();

// Formulaire d'identité — prérempli depuis la session (source de vérité côté
// front pour nom/prénom/email/avatar) et resynchronisé après chaque édition.
const profileForm = reactive({
  firstName: "",
  lastName: "",
  email: "",
});

function syncProfileForm() {
  profileForm.firstName = user.value?.firstName ?? "";
  profileForm.lastName = user.value?.lastName ?? "";
  profileForm.email = user.value?.email ?? "";
}
watch(user, syncProfileForm, { immediate: true });

const profileError = ref("");
const profileSuccess = ref(false);
const savingProfile = ref(false);

async function saveProfile() {
  profileError.value = "";
  profileSuccess.value = false;
  savingProfile.value = true;
  try {
    await $fetch("/api/me", { method: "PATCH", body: { ...profileForm } });
    await refreshSession();
    profileSuccess.value = true;
  } catch (error) {
    profileError.value = errorMessage(error);
  } finally {
    savingProfile.value = false;
  }
}

// Avatar : upload immédiat au choix du fichier, puis resynchro de la session
// (le nom de fichier change à chaque upload, l'`<img>` se met donc à jour seul).
const fileInput = ref<HTMLInputElement>();
const avatarError = ref("");
const uploadingAvatar = ref(false);

const initials = computed(() =>
  `${user.value?.firstName?.[0] ?? ""}${user.value?.lastName?.[0] ?? ""}`.toUpperCase()
);

async function onAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  avatarError.value = "";
  uploadingAvatar.value = true;
  try {
    const body = new FormData();
    body.append("avatar", file);
    await $fetch("/api/me/avatar", { method: "POST", body });
    await refreshSession();
  } catch (error) {
    avatarError.value = errorMessage(error);
  } finally {
    uploadingAvatar.value = false;
    input.value = "";
  }
}

// Changement de mot de passe (vérification de l'ancien côté serveur).
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const passwordError = ref("");
const passwordSuccess = ref(false);
const savingPassword = ref(false);

async function changePassword() {
  passwordError.value = "";
  passwordSuccess.value = false;

  if (passwordForm.newPassword.length < 8) {
    passwordError.value = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  savingPassword.value = true;
  try {
    await $fetch("/api/me/password", {
      method: "POST",
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    });
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
    passwordSuccess.value = true;
  } catch (error) {
    passwordError.value = errorMessage(error);
  } finally {
    savingPassword.value = false;
  }
}

function errorMessage(error: unknown) {
  const statusMessage = (error as { data?: { statusMessage?: string } })?.data
    ?.statusMessage;
  return statusMessage ?? "Une erreur est survenue, réessayez.";
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4">
    <h1 class="mb-6 text-4xl font-semibold tracking-tight text-neutral-950">
      Profil
    </h1>

    <UiCard elevation="sm" class="blurry-card shadow-card mb-6 rounded-[28px] p-6">
      <div class="flex items-center gap-4">
        <UiChip
          v-if="!user?.avatarPath"
          round
          size="lg"
          class="shrink-0 text-xl font-semibold text-neutral-700"
        >
          {{ initials }}
        </UiChip>
        <img
          v-else
          :src="user.avatarPath"
          alt="Avatar"
          class="h-14 w-14 shrink-0 rounded-full object-cover"
        />
        <div class="flex flex-col gap-1">
          <UiButton
            size="sm"
            elevation="sm"
            :disabled="uploadingAvatar"
            @click="fileInput?.click()"
          >
            <IconCamera :size="16" />
            {{ uploadingAvatar ? "Envoi..." : "Changer l'avatar" }}
          </UiButton>
          <span class="text-xs text-neutral-400">PNG, JPG, WEBP ou GIF — 2 Mo max.</span>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          class="hidden"
          @change="onAvatarChange"
        />
      </div>
      <p v-if="avatarError" class="mt-2 text-sm text-rose-600">
        {{ avatarError }}
      </p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="saveProfile">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-neutral-500">Prénom</span>
            <UiInput v-model="profileForm.firstName" required />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-neutral-500">Nom</span>
            <UiInput v-model="profileForm.lastName" required />
          </label>
        </div>
        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-neutral-500">Email</span>
          <UiInput v-model="profileForm.email" type="email" required />
        </label>

        <p v-if="profileError" class="text-sm text-rose-600">
          {{ profileError }}
        </p>
        <p v-if="profileSuccess" class="flex items-center gap-1 text-sm text-emerald-600">
          <IconCheck :size="16" />
          Profil enregistré.
        </p>

        <div class="flex justify-end">
          <UiButton
            type="submit"
            size="sm"
            elevation="sm"
            class="filled"
            :disabled="savingProfile"
          >
            {{ savingProfile ? "Enregistrement..." : "Enregistrer" }}
          </UiButton>
        </div>
      </form>
    </UiCard>

    <UiCard elevation="sm" class="blurry-card shadow-card rounded-[28px] p-6">
      <h2 class="text-xl font-semibold text-neutral-900">Mot de passe</h2>
      <form class="mt-4 flex flex-col gap-4" @submit.prevent="changePassword">
        <label class="flex flex-col gap-1.5">
          <span class="text-sm text-neutral-500">Mot de passe actuel</span>
          <UiInput
            v-model="passwordForm.currentPassword"
            type="password"
            required
          />
        </label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-neutral-500">Nouveau mot de passe</span>
            <UiInput
              v-model="passwordForm.newPassword"
              type="password"
              required
            />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-neutral-500">Confirmation</span>
            <UiInput
              v-model="passwordForm.confirmPassword"
              type="password"
              required
            />
          </label>
        </div>

        <p v-if="passwordError" class="text-sm text-rose-600">
          {{ passwordError }}
        </p>
        <p
          v-if="passwordSuccess"
          class="flex items-center gap-1 text-sm text-emerald-600"
        >
          <IconCheck :size="16" />
          Mot de passe mis à jour.
        </p>

        <div class="flex justify-end">
          <UiButton
            type="submit"
            size="sm"
            elevation="sm"
            class="filled"
            :disabled="savingPassword"
          >
            {{ savingPassword ? "Mise à jour..." : "Changer le mot de passe" }}
          </UiButton>
        </div>
      </form>
    </UiCard>
  </div>
</template>
