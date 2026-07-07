/** Jeux de mots de passe utilisés par les tests de `password.ts`. */
export const validPasswords = [
  "correct horse battery staple",
  "P@ssw0rd!",
  "é à ü 漢字 🔒", // unicode / emoji
  "a", // très court
  "x".repeat(200), // très long
];

export const wrongPassword = "ce-nest-pas-le-bon-mot-de-passe";
