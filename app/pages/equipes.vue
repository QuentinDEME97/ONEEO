<script setup lang="ts">
import { IconCheck, IconCopy, IconUserPlus } from "@tabler/icons-vue";

interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
  roleName: string;
}

interface MembersResponse {
  members: Member[];
}

const { currentSpace } = useCurrentSpace();
const requestFetch = useRequestFetch();

// Même piège que `useCurrentSpace()` (tâche 1.6) : un `$fetch` exécuté côté
// SSR ne relaie pas les cookies de la requête entrante vers nos propres
// routes — `useRequestFetch()` est indispensable ici aussi.
const { data, refresh } = useAsyncData<MembersResponse>(
  "space-members",
  () =>
    currentSpace.value
      ? requestFetch<MembersResponse>(
          `/api/spaces/${currentSpace.value.id}/members`
        )
      : Promise.resolve({ members: [] }),
  { watch: [currentSpace], default: () => ({ members: [] }) }
);

const members = computed(() => data.value?.members ?? []);

const modalRef = ref<{ showModal: () => void; close: () => void }>();
const form = reactive({ firstName: "", lastName: "", email: "" });
const errorMessage = ref("");
const submitting = ref(false);
const createdResult = ref<{ email: string; temporaryPassword: string } | null>(
  null
);
const copied = ref(false);

function openCreateDialog() {
  form.firstName = "";
  form.lastName = "";
  form.email = "";
  errorMessage.value = "";
  createdResult.value = null;
  copied.value = false;
  modalRef.value?.showModal();
}

function closeDialog() {
  modalRef.value?.close();
  if (createdResult.value) refresh();
}

async function submit() {
  errorMessage.value = "";

  if (!currentSpace.value) return;

  submitting.value = true;
  try {
    const result = await $fetch<{
      user: { email: string };
      temporaryPassword: string;
    }>(`/api/spaces/${currentSpace.value.id}/members`, {
      method: "POST",
      body: { ...form },
    });
    createdResult.value = {
      email: result.user.email,
      temporaryPassword: result.temporaryPassword,
    };
  } catch (error) {
    const statusMessage = (error as { data?: { statusMessage?: string } })?.data
      ?.statusMessage;
    errorMessage.value = statusMessage ?? "Une erreur est survenue, réessayez.";
  } finally {
    submitting.value = false;
  }
}

async function copyPassword() {
  if (!createdResult.value) return;
  await navigator.clipboard.writeText(createdResult.value.temporaryPassword);
  copied.value = true;
}

function memberInitials(m: Member) {
  return `${m.firstName[0] ?? ""}${m.lastName[0] ?? ""}`.toUpperCase();
}
</script>

<template>
  <div class="px-16">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-4xl font-semibold tracking-tight text-neutral-950">
        Équipe
      </h1>
      <UiButton size="sm" elevation="sm" class="filled" @click="openCreateDialog">
        <IconUserPlus :size="16" />
        Ajouter un utilisateur
      </UiButton>
    </div>

    <UiCard
      elevation="sm"
      class="blurry-card shadow-card overflow-x-auto rounded-[28px] p-3"
    >
      <table class="w-full border-collapse text-left">
        <thead>
          <tr>
            <th
              v-for="head in ['Nom', 'Email', 'Rôle', 'Statut']"
              :key="head"
              class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400"
            >
              {{ head }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in members"
            :key="m.id"
            class="transition-colors hover:bg-white/30"
          >
            <td class="border-t border-white/50 px-4 py-3">
              <div class="flex items-center gap-3">
                <UiChip
                  round
                  size="sm"
                  class="shrink-0 text-xs font-semibold text-neutral-700"
                >
                  {{ memberInitials(m) }}
                </UiChip>
                <span class="font-medium text-neutral-900">
                  {{ m.firstName }} {{ m.lastName }}
                </span>
              </div>
            </td>
            <td class="border-t border-white/50 px-4 py-3 text-neutral-600">
              {{ m.email }}
            </td>
            <td class="border-t border-white/50 px-4 py-3">
              <UiChip
                size="sm"
                :variant="m.roleName === 'Owner' ? 'blue' : 'frost'"
                class="h-7! px-3! text-xs text-neutral-700"
              >
                {{ m.roleName }}
              </UiChip>
            </td>
            <td class="border-t border-white/50 px-4 py-3">
              <UiChip
                v-if="m.mustChangePassword"
                size="sm"
                variant="sand"
                class="h-7! px-3! text-xs text-amber-900/70"
              >
                Mot de passe à changer
              </UiChip>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-neutral-400">
              Aucun membre.
            </td>
          </tr>
        </tbody>
      </table>
    </UiCard>

    <UiModal
      ref="modalRef"
      :title="createdResult ? 'Utilisateur créé' : 'Ajouter un utilisateur'"
    >
      <template v-if="!createdResult">
        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-neutral-500">Prénom</span>
            <UiInput v-model="form.firstName" required />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-neutral-500">Nom</span>
            <UiInput v-model="form.lastName" required />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-sm text-neutral-500">Email</span>
            <UiInput v-model="form.email" type="email" required />
          </label>

          <p v-if="errorMessage" class="text-sm text-rose-600">
            {{ errorMessage }}
          </p>

          <div class="mt-2 flex justify-end gap-3">
            <UiButton size="sm" elevation="sm" @click="modalRef?.close()">
              Annuler
            </UiButton>
            <UiButton
              type="submit"
              size="sm"
              elevation="sm"
              class="filled"
              :disabled="submitting"
            >
              {{ submitting ? "Création..." : "Créer" }}
            </UiButton>
          </div>
        </form>
      </template>

      <template v-else>
        <p class="text-sm text-neutral-600">
          Communiquez ce mot de passe temporaire à
          <strong>{{ createdResult.email }}</strong> — il devra le changer à sa
          première connexion.
        </p>
        <div class="mt-4 flex items-center gap-2">
          <code
            class="glass-surface glass-surface--elevation-sm flex-1 rounded-xl px-3 py-2 text-sm text-neutral-700"
          >
            {{ createdResult.temporaryPassword }}
          </code>
          <UiRoundButton
            :icon="copied ? IconCheck : IconCopy"
            aria-label="Copier le mot de passe"
            size="sm"
            elevation="sm"
            @click="copyPassword"
          />
        </div>
        <div class="mt-6 flex justify-end">
          <UiButton size="sm" elevation="sm" class="filled" @click="closeDialog">
            Terminé
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
