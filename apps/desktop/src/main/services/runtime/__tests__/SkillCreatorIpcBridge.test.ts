// TASK-UI-02: SkillCreatorIpcBridge は index.ts からのインスタンス化が削除済み（死コード）。
// Session IPC テストケース（START_SESSION / ANSWER）を削除。
// CONFIGURE_API / SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED ケースは
// apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts へ移管済み。
import { describe, it } from "vitest";
describe("SkillCreatorIpcBridge (deprecated)", () => {
  it("TASK-UI-02: Session IPC 廃止により全ハンドラーテストを移管済み", () => {
    // creatorHandlers.test.ts の T-03/T-04 で CONFIGURE_API / OVERWRITE_APPROVED を検証。
    // Session IPC (START_SESSION/ANSWER) は廃止のためテストなし。
  });
});
