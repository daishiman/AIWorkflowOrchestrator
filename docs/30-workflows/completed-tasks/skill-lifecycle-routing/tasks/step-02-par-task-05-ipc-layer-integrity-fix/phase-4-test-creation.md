# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| Phase    | 4                                                   |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001                |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix   |
| 作成日   | 2026-03-17                                          |
| 前Phase  | [Phase 3: 設計レビュー](./phase-3-design-review.md) |

## 目的

Phase 2 で定義したIPC契約設計に基づき、テストファーストで以下2点の修正実装を検証するテストコードを作成する。

1. **SKILL_UPDATE ハンドラ**（Main Process）: `skillHandlers.ts` への新規ハンドラ追加 + `unregisterSkillHandlers()` への `removeHandler` 追加
2. **SKILL_GET_DETAIL / SKILL_UPDATE Preload API**（Preload）: `skill-api.ts` への `getDetail()` / `update()` メソッド追加

## 参照資料

| 資料名                | パス                                                                          | 説明                                        |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 2 設計書        | `outputs/phase-2/design.md`                                                   | IPC契約設計・バリデーション設計             |
| Phase 3 レビュー結果  | `outputs/phase-3/design-review-result.md`                                     | PASS/MINOR 指摘確認                         |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | Phase 4（テスト作成）項目                   |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                          | P5/P9/P41/P42/P44 の詳細                    |
| 既存テスト            | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                   | 回帰確認対象                                |
| 既存テスト            | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                        | 回帰確認対象                                |
| 既存ハンドラ実装      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                  | L242 の SKILL_GET_DETAIL ハンドラ実装を参照 |
| 既存Preload API       | `apps/desktop/src/preload/skill-api.ts`                                       | 既存メソッドのパターンを参照                |

## 重要: import 副作用チェック（P5対策）

`skillHandlers.ts` を `import` するとモジュールレベルコードが実行される可能性がある。
テストファイルでは以下のパターンで副作用を回避する。

```typescript
// vi.mock を最上部に配置し、ipcMain の副作用をモック化
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  BrowserWindow: vi.fn(),
  app: { getPath: vi.fn() },
}));
```

既存の `skillHandlers.test.ts` がどのようにモックを設定しているかを必ず確認してから、同一パターンに従うこと。

## 実行タスク

### タスク 1: 既存テストファイルの構造確認

Phase 5 の実装前に既存テストが参考にできるパターンを把握する。

```bash
# 既存テストのモック設定を確認
head -80 apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts
head -60 apps/desktop/src/preload/__tests__/skill-api.test.ts

# SKILL_GET_DETAIL の既存ハンドラ実装確認（引数形式を把握）
grep -n "SKILL_GET_DETAIL\|get-detail\|skillId\|args\." \
  apps/desktop/src/main/ipc/skillHandlers.ts | head -20

# unregisterSkillHandlers の現在の内容確認
grep -n "unregisterSkillHandlers\|removeHandler" \
  apps/desktop/src/main/ipc/skillHandlers.ts
```

### タスク 2: SKILL_UPDATE ハンドラテスト作成

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.update.test.ts`（新規）

> 既存の `skillHandlers.test.ts` が大規模なため、SKILL_UPDATE 専用テストファイルを新規作成する。
> 既存テストのモック設定パターンに必ず合わせること。

#### 2-1: 正常系テスト

```typescript
describe("skill:update ハンドラ", () => {
  describe("正常系", () => {
    it("有効な skillName と updates で updateSkill を呼び出す", async () => {
      // Arrange: mockSkillService.updateSkill が成功を返す
      // Act: ハンドラを呼び出す
      // Assert: updateSkill が正しい引数で呼ばれたことを確認
    });

    it("updates が空オブジェクトでも成功する", async () => {
      // Arrange: mockSkillService.updateSkill が成功を返す
      // Act: update({}) で呼び出す
      // Assert: 成功レスポンスを返す
    });

    it("updates に複数フィールドが含まれる場合も成功する", async () => {
      // Arrange: { description: "new desc", tags: ["a", "b"] }
      // Assert: updateSkill が同じオブジェクトで呼ばれる
    });
  });
```

#### 2-2: P42 異常系テスト（skillName バリデーション）

```typescript
describe("バリデーション異常系（P42準拠 3段）", () => {
  describe("skillName バリデーション", () => {
    it("skillName が string でない場合は VALIDATION_ERROR", async () => {
      await expect(
        handler(event, 123 as unknown as string, {}),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("skillName が空文字列の場合は VALIDATION_ERROR", async () => {
      await expect(handler(event, "", {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("skillName がスペースのみの場合は VALIDATION_ERROR（P42核心）", async () => {
      await expect(handler(event, "   ", {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("skillName が null の場合は VALIDATION_ERROR", async () => {
      await expect(
        handler(event, null as unknown as string, {}),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });
  });

  describe("updates バリデーション", () => {
    it("updates が null の場合は VALIDATION_ERROR", async () => {
      await expect(handler(event, "my-skill", null)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("updates が配列の場合は VALIDATION_ERROR", async () => {
      await expect(
        handler(event, "my-skill", [] as unknown as Record<string, unknown>),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });

    it("updates が string の場合は VALIDATION_ERROR", async () => {
      await expect(
        handler(
          event,
          "my-skill",
          "invalid" as unknown as Record<string, unknown>,
        ),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    });
  });
});
```

#### 2-3: セキュリティテスト（sender検証）

```typescript
  describe("セキュリティ（sender検証）", () => {
    it("不正な sender からの呼び出しは拒否される", async () => {
      // validateIpcSender が invalid を返すモック
      // ハンドラが SENDER_INVALID エラーをスローすることを確認
    });

    it("正規の mainWindow からの呼び出しは通る", async () => {
      // validateIpcSender が valid を返すモック
      // ハンドラが正常処理することを確認
    });

    it("validateIpcSender が SKILL_UPDATE チャンネルで呼ばれる", async () => {
      // getAllowedWindows コールバックが呼ばれることを P41 対策で確認
      // mockValidateIpcSender.mock.calls[0][2].getAllowedWindows() を検証
    });
  });
});
```

### タスク 3: unregisterSkillHandlers テスト作成

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.update.test.ts`（同一ファイルに追記）

```typescript
describe("unregisterSkillHandlers", () => {
  it("SKILL_UPDATE の removeHandler が呼ばれる", () => {
    // unregisterSkillHandlers() を呼び出す
    // ipcMain.removeHandler が IPC_CHANNELS.SKILL_UPDATE で呼ばれたことを確認
    expect(mockRemoveHandler).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_UPDATE);
  });

  it("既存チャンネルの removeHandler も引き続き呼ばれる（回帰）", () => {
    // SKILL_LIST, SKILL_GET_DETAIL 等が引き続き removeHandler されることを確認
    expect(mockRemoveHandler).toHaveBeenCalledWith(IPC_CHANNELS.SKILL_LIST);
    expect(mockRemoveHandler).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_GET_DETAIL,
    );
  });
});
```

### タスク 4: Preload API テスト作成（getDetail / update）

**テストファイル**: `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts`（新規）

> 既存の `skill-api.test.ts` が大規模なため、新規テストファイルを作成する。
> 既存テストの vi.hoisted + vi.mock パターンに必ず合わせること。

#### 4-1: getDetail 正常系テスト

```typescript
describe("skillAPI.getDetail", () => {
  describe("正常系", () => {
    it("有効な skillId で SKILL_GET_DETAIL チャンネルを invoke する", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: mockSkillDetail });
      await skillAPI.getDetail("my-skill-id");
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_GET_DETAIL,
        "my-skill-id",
      );
    });

    it("成功レスポンスから data を返す", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: mockSkillDetail });
      const result = await skillAPI.getDetail("my-skill-id");
      expect(result).toEqual(mockSkillDetail);
    });

    it("スキルが存在しない場合は null を返す", async () => {
      mockInvoke.mockResolvedValue({ success: false, error: "Not found" });
      await expect(skillAPI.getDetail("nonexistent")).rejects.toThrow();
    });
  });

  describe("バリデーション異常系（P42準拠 3段）", () => {
    it("skillId が string でない場合は reject する", async () => {
      await expect(
        skillAPI.getDetail(123 as unknown as string),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      // invoke が呼ばれないことを確認（Preload層での早期拒否）
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("skillId が空文字列の場合は reject する", async () => {
      await expect(skillAPI.getDetail("")).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("skillId がスペースのみの場合は reject する（P42核心）", async () => {
      await expect(skillAPI.getDetail("   ")).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });
});
```

#### 4-2: update 正常系テスト

```typescript
describe("skillAPI.update", () => {
  describe("正常系", () => {
    it("有効な skillName と updates で SKILL_UPDATE チャンネルを invoke する", async () => {
      mockInvoke.mockResolvedValue(undefined);
      await skillAPI.update("my-skill", { description: "new desc" });
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_UPDATE,
        "my-skill",
        { description: "new desc" },
      );
    });

    it("updates が空オブジェクトでも invoke する", async () => {
      mockInvoke.mockResolvedValue(undefined);
      await skillAPI.update("my-skill", {});
      expect(mockInvoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_UPDATE,
        "my-skill",
        {},
      );
    });
  });

  describe("バリデーション異常系（P42準拠 3段）", () => {
    it("skillName が string でない場合は reject する", async () => {
      await expect(
        skillAPI.update(123 as unknown as string, {}),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("skillName が空文字列の場合は reject する", async () => {
      await expect(skillAPI.update("", {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("skillName がスペースのみの場合は reject する（P42核心）", async () => {
      await expect(skillAPI.update("   ", {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("updates が null の場合は reject する", async () => {
      await expect(
        skillAPI.update("my-skill", null as unknown as Record<string, unknown>),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("updates が配列の場合は reject する", async () => {
      await expect(
        skillAPI.update("my-skill", [] as unknown as Record<string, unknown>),
      ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });
});
```

### タスク 5: IPC チャンネルホワイトリスト確認テスト

**テストファイル**: 既存の `channels.skill-import.test.ts` または新規作成

```typescript
describe("SKILL_UPDATE / SKILL_GET_DETAIL チャンネル登録確認", () => {
  it("SKILL_UPDATE が ALLOWED_INVOKE_CHANNELS に含まれる", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_UPDATE);
  });

  it("SKILL_GET_DETAIL が ALLOWED_INVOKE_CHANNELS に含まれる", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_GET_DETAIL);
  });
});
```

> 上記は既に `channels.ts` に定義されているため Green になる可能性が高い。確認のみ。

### タスク 6: 既存テスト回帰確認

Phase 5 実装前に既存テストが全件 PASS することを確認する（Red Phase では新規テストのみ失敗する）。

```bash
# 既存のスキルハンドラテストを実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# 既存のPreload APIテストを実行
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.test.ts
```

**期待結果**: 既存テストは全件 PASS。新規テスト（SKILL_UPDATE / getDetail / update）は Red（失敗）。

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                      | パス                                                                    | 説明                                  |
| --------------------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| SKILL_UPDATE ハンドラテスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.update.test.ts`      | 正常系・P42異常系・セキュリティテスト |
| Preload API テスト          | `apps/desktop/src/preload/__tests__/skill-api.getDetail-update.test.ts` | getDetail・update の正常系・P42異常系 |
| テスト実行結果記録          | `outputs/phase-4/test-run-result.md`                                    | Red/Green 状態の記録                  |

## 完了条件

- [ ] `skillHandlers.update.test.ts` が作成されている（正常系・P42異常系3パターン・sender検証）
- [ ] `skill-api.getDetail-update.test.ts` が作成されている（getDetail・update の正常系・P42異常系3パターン）
- [ ] unregisterSkillHandlers の SKILL_UPDATE removeHandler テストが含まれている
- [ ] Preload バリデーション異常系テストで `mockInvoke が呼ばれない` ことを確認している（Preload層での早期拒否確認）
- [ ] ALLOWED_INVOKE_CHANNELS の確認テストが存在する（または既存テストで確認済み）
- [ ] 既存テストが全件 PASS することを確認した（回帰）
- [ ] `outputs/phase-4/test-run-result.md` にテスト実行結果を記録した
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
  --phase 4
```

## 次Phase

Phase 5: 実装（[phase-5-implementation.md](./phase-5-implementation.md)）

> **Gate**: 新規テストが Red であること、既存テストが全件 PASS であることを確認してから Phase 5 へ進む。
