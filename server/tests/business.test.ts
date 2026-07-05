import { describe, it, expect } from "vitest";
import { computeSaveTransition } from "../src/core/business.js";

describe("computeSaveTransition", () => {
  // ── Save intent ──
  describe("save intent", () => {
    it("should INSERT when no existing record", () => {
      const result = computeSaveTransition(null, "save");
      expect(result).toEqual({ action: "INSERT", countDelta: 1, hasSaved: true });
    });

    it("should REACTIVATE when existing record is inactive", () => {
      const result = computeSaveTransition({ active: false }, "save");
      expect(result).toEqual({ action: "REACTIVATE", countDelta: 1, hasSaved: true });
    });

    it("should NO_OP when already actively saved (idempotent)", () => {
      const result = computeSaveTransition({ active: true }, "save");
      expect(result).toEqual({ action: "NO_OP", countDelta: 0, hasSaved: true });
    });
  });

  // ── Unsave intent ──
  describe("unsave intent", () => {
    it("should SOFT_DELETE when existing record is active", () => {
      const result = computeSaveTransition({ active: true }, "unsave");
      expect(result).toEqual({
        action: "SOFT_DELETE",
        countDelta: -1,
        hasSaved: false,
      });
    });

    it("should NO_OP when existing record is already inactive", () => {
      const result = computeSaveTransition({ active: false }, "unsave");
      expect(result).toEqual({ action: "NO_OP", countDelta: 0, hasSaved: false });
    });

    it("should NO_OP when no existing record", () => {
      const result = computeSaveTransition(null, "unsave");
      expect(result).toEqual({ action: "NO_OP", countDelta: 0, hasSaved: false });
    });
  });

  // ── Edge cases ──
  describe("round-trip transitions", () => {
    it("save → unsave → save should produce INSERT, SOFT_DELETE, REACTIVATE", () => {
      const first = computeSaveTransition(null, "save");
      expect(first.action).toBe("INSERT");

      const second = computeSaveTransition({ active: true }, "unsave");
      expect(second.action).toBe("SOFT_DELETE");

      const third = computeSaveTransition({ active: false }, "save");
      expect(third.action).toBe("REACTIVATE");
    });

    it("cumulative count delta across save → unsave → save should be +1", () => {
      const d1 = computeSaveTransition(null, "save").countDelta;
      const d2 = computeSaveTransition({ active: true }, "unsave").countDelta;
      const d3 = computeSaveTransition({ active: false }, "save").countDelta;
      expect(d1 + d2 + d3).toBe(1);
    });
  });
});
