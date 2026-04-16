import { validatePrompt } from "@/lib/validation";

describe("validatePrompt", () => {
  it("rejects undefined prompt", () => {
    expect(validatePrompt(undefined)).toMatch(/provide a prompt/i);
  });

  it("rejects null prompt", () => {
    expect(validatePrompt(null)).toMatch(/provide a prompt/i);
  });

  it("rejects empty string", () => {
    expect(validatePrompt("")).toMatch(/provide a prompt/i);
  });

  it("rejects whitespace-only string", () => {
    expect(validatePrompt("   ")).toMatch(/provide a prompt/i);
  });

  it("rejects non-string prompt", () => {
    expect(validatePrompt(123)).toMatch(/provide a prompt/i);
  });

  it("rejects prompt under 10 characters", () => {
    expect(validatePrompt("short")).toMatch(/more descriptive/i);
  });

  it("rejects prompt of exactly 9 characters", () => {
    expect(validatePrompt("123456789")).toMatch(/more descriptive/i);
  });

  it("rejects short prompt with surrounding whitespace", () => {
    expect(validatePrompt("  hi  ")).toMatch(/more descriptive/i);
  });

  it("accepts prompt of exactly 10 characters", () => {
    expect(validatePrompt("1234567890")).toBeNull();
  });

  it("accepts a realistic prompt", () => {
    expect(
      validatePrompt("Create a PDF explaining a deferred sales trust for Susie")
    ).toBeNull();
  });
});
