<script setup lang="ts">
import {
  Copy01Icon,
  Tick02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

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
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Équipe</h1>
      <button class="btn btn-primary" @click="openCreateDialog">
        <HugeiconsIcon :icon="UserAdd01Icon" :size="18" />
        Ajouter un utilisateur
      </button>
    </div>

    <div class="overflow-x-auto bg-base-100 rounded-box border border-base-300">
      <table class="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in members" :key="m.id">
            <td>{{ m.firstName }} {{ m.lastName }}</td>
            <td>{{ m.email }}</td>
            <td>
              <span
                class="badge"
                :class="
                  m.roleName === 'Owner' ? 'badge-primary' : 'badge-ghost'
                "
              >
                {{ m.roleName }}
              </span>
            </td>
            <td>
              <span
                v-if="m.mustChangePassword"
                class="badge badge-warning badge-outline"
              >
                Mot de passe à changer
              </span>
            </td>
          </tr>
          <tr v-if="members.length === 0">
            <td colspan="4" class="text-center text-base-content/60">
              Aucun membre.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
