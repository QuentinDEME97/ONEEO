import { describe, expect, it } from "vitest";

function sum(a: number, b: number): number {
  return a + b;
}

describe("smoke", () => {
  it("exécute une fonction pure sans runtime Nuxt", () => {
    expect(sum(2, 3)).toBe(5);
  });
});
