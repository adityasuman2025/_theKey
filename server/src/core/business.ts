/**
 * Pure business logic for save/unsave state transitions.
 * No database, no I/O — fully unit-testable.
 */

export type SaveRecord = {
  active: boolean;
};

export type TransitionResult = {
  action: "INSERT" | "REACTIVATE" | "SOFT_DELETE" | "NO_OP";
  countDelta: number; // +1, -1, or 0
  hasSaved: boolean; // resulting state for the user
};

/**
 * Computes the state transition for a save/unsave intent.
 *
 * - Save when no record       → INSERT,     +1
 * - Save when active=false    → REACTIVATE, +1
 * - Save when active=true     → NO_OP,       0  (idempotent)
 * - Unsave when active=true   → SOFT_DELETE, -1
 * - Unsave when active=false  → NO_OP,       0
 * - Unsave when no record     → NO_OP,       0
 */
export function computeSaveTransition(
  existingRecord: SaveRecord | null,
  intent: "save" | "unsave"
): TransitionResult {
  if (intent === "save") {
    if (existingRecord === null) {
      return { action: "INSERT", countDelta: 1, hasSaved: true };
    }
    if (!existingRecord.active) {
      return { action: "REACTIVATE", countDelta: 1, hasSaved: true };
    }
    // Already active — idempotent no-op
    return { action: "NO_OP", countDelta: 0, hasSaved: true };
  }

  // intent === "unsave"
  if (existingRecord === null || !existingRecord.active) {
    return { action: "NO_OP", countDelta: 0, hasSaved: false };
  }

  return { action: "SOFT_DELETE", countDelta: -1, hasSaved: false };
}
