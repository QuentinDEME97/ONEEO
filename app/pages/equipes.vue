<script setup lang="ts">
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { IconUserPlus } from "@tabler/icons-vue";

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

const dialogRef = ref<HTMLDialogElement>();
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
  dialogRef.value?.showModal();
}

function closeDialog() {
  dialogRef.value?.close();
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

    <Teleport to="body">
      <dialog ref="dialogRef" class="modal">
        <div class="modal-box">
          <template v-if="!createdResult">
            <h3 class="text-lg font-bold">Ajouter un utilisateur</h3>
            <form class="flex flex-col gap-3 mt-4" @submit.prevent="submit">
              <label class="form-control">
                <span class="label-text mb-1">Prénom</span>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  class="input input-bordered w-full"
                />
              </label>
              <label class="form-control">
                <span class="label-text mb-1">Nom</span>
                <input
                  v-model="form.lastName"
                  type="text"
                  required
                  class="input input-bordered w-full"
                />
              </label>
              <label class="form-control">
                <span class="label-text mb-1">Email</span>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="input input-bordered w-full"
                />
              </label>

              <p v-if="errorMessage" class="text-error text-sm">
                {{ errorMessage }}
              </p>

              <div class="modal-action">
                <button
                  type="button"
                  class="btn btn-ghost"
                  @click="dialogRef?.close()"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="submitting"
                >
                  {{ submitting ? "Création..." : "Créer" }}
                </button>
              </div>
            </form>
          </template>

          <template v-else>
            <h3 class="text-lg font-bold">Utilisateur créé</h3>
            <p class="text-sm text-base-content/70 mt-2">
              Communiquez ce mot de passe temporaire à
              <strong>{{ createdResult.email }}</strong> — il devra le changer à
              sa première connexion.
            </p>
            <div class="flex items-center gap-2 mt-4">
              <code class="bg-base-200 rounded px-3 py-2 flex-1 text-sm">
                {{ createdResult.temporaryPassword }}
              </code>
              <button
                type="button"
                class="btn btn-square btn-ghost"
                @click="copyPassword"
              >
                <HugeiconsIcon
                  :icon="copied ? Tick02Icon : Copy01Icon"
                  :size="18"
                />
              </button>
            </div>
            <div class="modal-action">
              <button
                type="button"
                class="btn btn-primary"
                @click="closeDialog"
              >
                Terminé
              </button>
            </div>
          </template>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </Teleport>
  </div>
</template>
