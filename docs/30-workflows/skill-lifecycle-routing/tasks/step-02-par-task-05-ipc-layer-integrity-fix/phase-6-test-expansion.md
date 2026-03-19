# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 6                                                 |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001              |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix |
| 作成日   | 2026-03-17                                        |
| 前Phase  | [Phase 5: 実装](./phase-5-implementation.md)      |

## 目的

Phase 4 のテストでカバーされていないエッジケースを追加し、カバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）の達成に向けて補完テストを作成する。

## 参照資料

| 資料名              | パス                                                                    | 説明                 |
| ------------------- | ----------------------------------------------------------------------- | -------------------- |
| Phase 5 実装報告    | `outputs/phase-5/implementation-report.md`                              | 実装内容の詳細       |
| 既知の落とし穴      | `.claude/rules/06-known-pitfalls.md`                                    | P5/P9/P13/P41 の詳細 |
| コード品質ルール    | `.claude/rules/02-code-quality.md`                                      | カバレッジ基準       |
| SKILL_UPDATE テスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.update.test.ts`      | Phase 4 で作成済み   |
| Preload API テスト  | `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts` | Phase 4 で作成済み   |

## 実行タスク

### タスク 1: 現在のカバレッジ測定

```bash
# skillHandlers.ts のカバレッジ測定
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.update.test.ts \
  --coverage --reporter=verbose

# skill-api.ts のカバレッジ測定
cd apps/desktop && pnpm vitest run \
  src/preload/__tests__/skill-api.getDetail-update.test.ts \
  --coverage --reporter=verbose
```

カバレッジ結果を `outputs/phase-6/coverage-before.md` に記録する。

### タスク 2: SKILL_UPDATE ハンドラのエッジケーステスト追加

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.update.test.ts`

#### 2-1: updates オブジェクトのエッジケース

```typescript
describe("updates オブジェクトのエッジケース", () => {
  it("updates が空オブジェクト {} でも更新処理を呼ぶ", async () => {
    // 空オブジェクトは有効な更新として処理されることを確認
    mockSkillService.updateSkill.mockResolvedValue(undefined);
    await expect(handler(event, "my-skill", {})).resolves.toMatchObject({
      success: true,
    });
    expect(mockSkillService.updateSkill).toHaveBeenCalledWith("my-skill", {});
  });

  it("updates に null 値フィールドが含まれても処理する", async () => {
    // { description: null } は有効なオブジェクト（フィールドの null は許可）
    mockSkillService.updateSkill.mockResolvedValue(undefined);
    const updates = { description: null, tags: ["a"] };
    await expect(handler(event, "my-skill", updates)).resolves.toMatchObject({
      success: true,
    });
  });

  it("updates に undefined 値フィールドが含まれても処理する", async () => {
    mockSkillService.updateSkill.mockResolvedValue(undefined);
    const updates = { description: undefined };
    await expect(
      handler(event, "my-skill", updates as Record<string, unknown>),
    ).resolves.toMatchObject({ success: true });
  });

  it("updates にネストされたオブジェクトが含まれても処理する", async () => {
    mockSkillService.updateSkill.mockResolvedValue(undefined);
    const updates = { metadata: { author: "test", version: "1.0" } };
    await expect(handler(event, "my-skill", updates)).resolves.toMatchObject({
      success: true,
    });
  });
});
```

#### 2-2: サービスエラー時の動作テスト

```typescript
describe("サービスエラー時の動作", () => {
  it("updateSkill がエラーをスローした場合は success:false を返す", async () => {
    mockSkillService.updateSkill.mockRejectedValue(
      new Error("ファイルが見つかりません"),
    );
    const result = await handler(event, "my-skill", {});
    expect(result).toMatchObject({ success: false });
    expect(result.error).toBeDefined();
  });

  it("エラーメッセージがサニタイズされる（パス情報を含まない）", async () => {
    mockSkillService.updateSkill.mockRejectedValue(
      new Error("/Users/secret/skills/my-skill/SKILL.md が見つかりません"),
    );
    const result = await handler(event, "my-skill", {});
    // sanitizeErrorMessage によりパスが [path] に置換される
    expect(result.error).not.toContain("/Users/secret");
  });

  it("updateSkill が null を返した場合も success:true を返す", async () => {
    mockSkillService.updateSkill.mockResolvedValue(null);
    const result = await handler(event, "my-skill", {});
    expect(result.success).toBe(true);
  });
});
```

#### 2-3: skillName のトリムチェック（P42 境界値テスト）

```typescript
describe("skillName の境界値テスト（P42）", () => {
  it("先頭・末尾にスペースがある skillName は VALIDATION_ERROR（trim後が空でなければ通過）", async () => {
    // NOTE: " my-skill " は trim後 "my-skill" なので有効
    // ただし実装が trim して渡す場合と、trim せず渡す場合で挙動が異なる
    // 現在の設計では skillName.trim() === "" チェックのみなので " my-skill " は通過する
    mockSkillService.updateSkill.mockResolvedValue(undefined);
    await expect(handler(event, " my-skill ", {})).resolves.toMatchObject({
      success: true,
    });
  });

  it("タブ文字のみの skillName は VALIDATION_ERROR", async () => {
    await expect(handler(event, "\t\t", {})).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });

  it("改行文字のみの skillName は VALIDATION_ERROR", async () => {
    await expect(handler(event, "\n\n", {})).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });
});
```

### タスク 3: P5（二重登録防止）のテスト追加

```typescript
describe("P5: 二重登録防止（ipcMain.handle 二重登録）", () => {
  it("registerSkillHandlers を2回呼んでも handle が例外をスローしない", () => {
    // unregisterSkillHandlers を間に挟むことで二重登録を防ぐ
    // 実際のパターン: unregister → register の順
    expect(() => {
      unregisterSkillHandlers();
      registerSkillHandlers(mockMainWindow, mockSkillService);
    }).not.toThrow();
  });

  it("unregisterSkillHandlers を呼ぶと SKILL_UPDATE の removeHandler が実行される", () => {
    unregisterSkillHandlers();
    expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_UPDATE,
    );
  });
});
```

### タスク 4: Preload API エッジケーステスト追加

**テストファイル**: `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts`

#### 4-1: getDetail のエッジケース

```typescript
describe("skillAPI.getDetail のエッジケース", () => {
  it("skillId が undefined の場合は VALIDATION_ERROR（invoke されない）", async () => {
    await expect(
      skillAPI.getDetail(undefined as unknown as string),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("skillId が数値 0 の場合は VALIDATION_ERROR", async () => {
    await expect(
      skillAPI.getDetail(0 as unknown as string),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("IPC がタイムアウトエラーを返した場合は reject する", async () => {
    mockInvoke.mockRejectedValue(new Error("IPC timeout"));
    await expect(skillAPI.getDetail("my-skill-id")).rejects.toThrow();
  });
});
```

#### 4-2: update のエッジケース

```typescript
describe("skillAPI.update のエッジケース", () => {
  it("updates が undefined の場合は VALIDATION_ERROR", async () => {
    await expect(
      skillAPI.update(
        "my-skill",
        undefined as unknown as Record<string, unknown>,
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("updates が空オブジェクト {} の場合は invoke する", async () => {
    mockInvoke.mockResolvedValue(undefined);
    await skillAPI.update("my-skill", {});
    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_UPDATE,
      "my-skill",
      {},
    );
  });

  it("skillName が undefined の場合は VALIDATION_ERROR", async () => {
    await expect(
      skillAPI.update(undefined as unknown as string, {}),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mockInvoke).not.toHaveBeenCalled();
  });
});
```

### タスク 5: テスト間状態リークの防止確認（P9対策）

```typescript
describe("テスト間状態リーク防止（P9）", () => {
  beforeEach(() => {
    // 全モックをリセット（状態リーク防止）
    vi.clearAllMocks();
    mockSkillService.updateSkill.mockResolvedValue(undefined);
  });

  it("前のテストの mockInvoke 呼び出し回数が引き継がれない", async () => {
    // テスト1: invoke を1回呼ぶ
    mockInvoke.mockResolvedValue(undefined);
    await skillAPI.update("my-skill", {});
    expect(mockInvoke).toHaveBeenCalledTimes(1);
  });

  it("clearAllMocks 後は mockInvoke が 0 回になる", () => {
    // beforeEach で clearAllMocks が実行されているため
    expect(mockInvoke).toHaveBeenCalledTimes(0);
  });
});
```

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                    | パス                                                                            | 説明                       |
| ------------------------- | ------------------------------------------------------------------------------- | -------------------------- |
| 拡充テスト（ハンドラ）    | `apps/desktop/src/main/ipc/__tests__/skillHandlers.update.test.ts`（追記）      | エッジケース・P5テスト追加 |
| 拡充テスト（Preload API） | `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts`（追記） | エッジケース追加           |
| カバレッジ測定結果        | `outputs/phase-6/coverage-before.md`                                            | 追加前のカバレッジ記録     |
| テスト拡充後カバレッジ    | `outputs/phase-6/coverage-after.md`                                             | 追加後のカバレッジ記録     |

## 完了条件

- [ ] updates エッジケーステスト（空オブジェクト、null フィールド含む）が追加されている
- [ ] サービスエラー時の動作テスト（success:false、エラーサニタイズ）が追加されている
- [ ] P5（二重登録防止）のテストが追加されている
- [ ] getDetail / update の境界値テストが追加されている（undefined, 数値 0 等）
- [ ] P9準拠: `beforeEach` で `vi.clearAllMocks()` が呼ばれていることを確認
- [ ] カバレッジが Line 80%+、Branch 60%+、Function 80%+ を達成している
- [ ] 全テストが PASS している
- [ ] `outputs/phase-6/coverage-before.md` と `coverage-after.md` が作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 6
```

## 次Phase

Phase 7: カバレッジ確認（[phase-7-coverage-check.md](./phase-7-coverage-check.md)）

> **Gate**: カバレッジ基準を達成しない場合は本Phaseに戻ってテストを追加する。
