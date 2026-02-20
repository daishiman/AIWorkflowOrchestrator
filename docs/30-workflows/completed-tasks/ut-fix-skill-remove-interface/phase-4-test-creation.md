# Phase 4: テスト作成 — skill:remove IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目        | 値                                   |
| ----------- | ------------------------------------ |
| タスクID    | UT-FIX-SKILL-REMOVE-INTERFACE-001    |
| Phase       | 4（テスト作成 — TDD Red フェーズ）   |
| 前Phase依存 | Phase 2 設計書（`outputs/phase-2/`） |
| 担当        | Claude Code                          |
| 作成日      | 2026-02-20                           |

## 目的

skill:remove IPCハンドラの引数インターフェースを `{ skillId: string }` から `skillName: string` に変更するために、**変更後の期待動作を定義するテストを先に作成**する（TDD Red フェーズ）。この時点ではテストは FAIL する。

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

1. 既存テストケース SH-RM-01〜SH-RM-04 の引数形式を `{ skillId: "..." }` → `"..."` に修正
2. 新規テストケースとして `.trim()` バリデーション（P42準拠）を追加
3. テスト実行で RED（失敗）を確認

## 参照資料

> 依存Phase成果物参照: Phase 1, Phase 2, Phase 3

| 資料                                                        | 用途                                   |
| ----------------------------------------------------------- | -------------------------------------- |
| `06-known-pitfalls.md#P42`                                  | `.trim()` バリデーション3段パターン    |
| `06-known-pitfalls.md#P44`                                  | skill:import 同一パターンの参考        |
| `06-known-pitfalls.md#P40`                                  | テスト実行ディレクトリ依存（モノレポ） |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 修正対象テストファイル                 |

## 実行手順

### Step 1: テストケース設計

修正対象ファイル: `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`

skill:remove の `describe` ブロック（行746-819）内の全テストケースを以下の仕様に修正・追加する。

#### テストケース一覧

| ID       | 種別   | テスト内容                                         | 引数                | 期待結果                                                 |
| -------- | ------ | -------------------------------------------------- | ------------------- | -------------------------------------------------------- |
| SH-RM-01 | 正常系 | 文字列引数で `skillService.removeSkill` が呼ばれる | `"skill-to-remove"` | `removeSkill("skill-to-remove")` が1回呼ばれ、結果が返る |
| SH-RM-02 | 異常系 | 引数が文字列でない場合 VALIDATION_ERROR            | `123`（数値）       | `{ code: "VALIDATION_ERROR" }` がスローされる            |
| SH-RM-03 | 異常系 | 引数が空文字列の場合 VALIDATION_ERROR              | `""`                | `{ code: "VALIDATION_ERROR" }` がスローされる            |
| SH-RM-04 | 正常系 | 存在しないスキル削除が graceful に処理される       | `"nonexistent"`     | `{ success: true, removed: false }` が返る               |
| SH-RM-05 | 異常系 | 引数がスペースのみの場合 VALIDATION_ERROR（P42）   | `"   "`             | `{ code: "VALIDATION_ERROR" }` がスローされる            |
| SH-RM-06 | 異常系 | 引数が undefined の場合 VALIDATION_ERROR           | `undefined`         | `{ code: "VALIDATION_ERROR" }` がスローされる            |

### Step 2: テストコード修正

以下の変更を `skillHandlers.test.ts` の skill:remove describe ブロックに適用する。

#### SH-RM-01（既存修正）

**変更前（行760）:**

```typescript
const result = await handler({}, { skillId: "skill-to-remove" });
```

**変更後:**

```typescript
const result = await handler({}, "skill-to-remove");
```

#### SH-RM-02（既存修正）

**変更前（行777）:**

```typescript
await handler({}, { skillId: 123 });
```

**変更後:**

```typescript
await handler({}, 123);
```

バリデーションエラーの `message` アサーションを追加:

```typescript
expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
expect((error as { message: string }).message).toBe(
  "skillName must be a non-empty string",
);
```

#### SH-RM-03（既存修正）

**変更前（行793）:**

```typescript
await handler({}, { skillId: "" });
```

**変更後:**

```typescript
await handler({}, "");
```

バリデーションエラーの `message` アサーションを追加:

```typescript
expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
expect((error as { message: string }).message).toBe(
  "skillName must be a non-empty string",
);
```

#### SH-RM-04（既存修正）

**変更前（行813）:**

```typescript
const result = await handler({}, { skillId: "nonexistent" });
```

**変更後:**

```typescript
const result = await handler({}, "nonexistent");
```

#### SH-RM-05（新規追加 — P42準拠）

SH-RM-04 の直後に追加:

```typescript
it("SH-RM-05: should reject whitespace-only skillName (P42)", async () => {
  const handler = handlers.get(SKILL_CHANNELS.REMOVE);
  if (!handler) {
    throw new Error("skill:remove handler not registered");
  }

  // When: スペースのみの文字列を渡す
  try {
    await handler({}, "   ");
    throw new Error("Expected validation error");
  } catch (error) {
    // Then: バリデーションエラー
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    expect((error as { message: string }).message).toBe(
      "skillName must be a non-empty string",
    );
  }
});
```

#### SH-RM-06（新規追加）

SH-RM-05 の直後に追加:

```typescript
it("SH-RM-06: should reject undefined skillName", async () => {
  const handler = handlers.get(SKILL_CHANNELS.REMOVE);
  if (!handler) {
    throw new Error("skill:remove handler not registered");
  }

  // When: undefinedを渡す
  try {
    await handler({}, undefined);
    throw new Error("Expected validation error");
  } catch (error) {
    // Then: バリデーションエラー
    expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
    expect((error as { message: string }).message).toBe(
      "skillName must be a non-empty string",
    );
  }
});
```

### Step 3: Red 確認

テスト実行コマンド（P40準拠: `apps/desktop` ディレクトリから実行）:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

期待結果: skill:remove の全テストケース（SH-RM-01〜SH-RM-06）が **FAIL** する。
理由: ハンドラはまだ `{ skillId: string }` オブジェクトを期待しており、文字列引数に対応していないため。

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物                 | パス                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| 修正済みテストファイル | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`             |
| テスト実行結果ログ     | `outputs/phase-4/test-red-result.md`（FAIL 状態のテスト実行結果を記録） |
| テスト仕様書           | `outputs/phase-4/test-specification.md`（テストケース一覧と設計理由）   |

## 完了条件

- [ ] SH-RM-01〜SH-RM-04 の引数が `{ skillId: "..." }` → `"..."` に変更されている
- [ ] SH-RM-05（スペースのみ — P42）が新規追加されている
- [ ] SH-RM-06（undefined）が新規追加されている
- [ ] 全テストケースのバリデーションエラー `message` アサーションが `"skillName must be a non-empty string"` を検証している
- [ ] テスト実行で SH-RM-01〜SH-RM-06 が FAIL することを確認している（RED 状態）
- [ ] skill:remove 以外のテスト（skill:import, skill:get-detail 等）は変更なく PASS のまま

## 次Phase

Phase 5（実装）へ進む。テストを GREEN にするためにハンドラの引数インターフェースを修正する。
