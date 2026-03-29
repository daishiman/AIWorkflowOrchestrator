# Phase 5: 実装

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 5                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

Phase 2 設計に基づき、スタブレスポンスをエラーレスポンスに置換する実装を Facade・IPC handler・renderer の三層に適用する。

## 実行タスク

- `packages/shared/src/types/skillCreator.ts` に `status` / `degradedReason` / `userMessage` フィールドを追加する
- `RuntimeSkillCreatorFacade.ts` の plan() スタブを error レスポンスに置換する
- `RuntimeSkillCreatorFacade.ts` の execute() スタブを error レスポンスに置換する
- `RuntimeSkillCreatorFacade.ts` の improve() スタブを error レスポンスに置換する
- `RuntimeSkillCreatorFacade.ts` の正常系パスに `status: "ok"` を付与する
- `creatorHandlers.ts` に error status 検出・IpcResult 変換ロジックを追加する
- `SkillLifecyclePanel.tsx` にエラー表示の条件分岐を追加する
- `SkillCreateWizard.tsx` にエラー表示の条件分岐を追加する

## 参照資料

| 資料名         | パス                                                                  | 説明                              |
| -------------- | --------------------------------------------------------------------- | --------------------------------- |
| Phase 2 設計   | `phase-2-design.md`                                                   | 型 / Facade / IPC / renderer 設計 |
| Phase 4 テスト | `phase-4-test-creation.md`                                            | テストマトリクス TC-01〜TC-10     |
| Facade         | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 現行スタブ実装                    |
| IPC handler    | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | 既存 IpcResult パターン           |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                           | 現行型定義                        |
| UI             | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | plan/execute 結果表示             |
| UI             | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    | スキル作成ウィザード              |

## 実行手順

### ステップ1: 型拡張を実装する

`packages/shared/src/types/skillCreator.ts` に以下を追加:

```typescript
/** スタブレスポンスの degraded 原因 */
export type SkillCreatorDegradedReason =
  | "llm_adapter_unavailable"
  | "resource_loader_unavailable";

/** レスポンスステータス */
export type SkillCreatorResponseStatus = "ok" | "degraded" | "error";
```

`RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorExecuteResponse` / `RuntimeSkillCreatorImproveResponse` に以下のフィールドを追加:

```typescript
status: SkillCreatorResponseStatus;
degradedReason?: SkillCreatorDegradedReason | null;
userMessage?: string | null;
```

### ステップ2: Facade のスタブ → エラー変換を実装する

**plan() (L306-327)**:

- 既存のスタブ返却条件を維持しつつ、返却オブジェクトに `status: "error"`, `degradedReason`, `userMessage` を追加する。
- `estimatedSteps` を `0` に変更する（スタブの `3` は不正確）。
- `this.logger?.warn()` でスタブ置換のログを出力する。

**execute() / improve()**:

- 同様のスタブパスを特定し、同じパターンでエラーレスポンスを返す。

**正常系パス**:

- 既存の return 文に `status: "ok"` を追加する。
- `degradedReason` / `userMessage` は設定しない（undefined）。

### ステップ3: IPC handler のエラー検出を実装する

`creatorHandlers.ts` の plan / execute / improve ハンドラ内で:

```typescript
const result = await facade.plan(spec);

if (result.status === "error" || result.status === "degraded") {
  return {
    success: false,
    error: result.userMessage ?? "スキル作成に失敗しました",
    data: {
      degradedReason: result.degradedReason,
      status: result.status,
    },
  };
}
```

### ステップ4: renderer のエラー表示を実装する

`SkillLifecyclePanel.tsx` / `SkillCreateWizard.tsx`:

- IPC 応答の `success: false` 時に `data.degradedReason` を参照する。
- reason code に応じたユーザーフレンドリーメッセージを表示する。
- 既存の error state パターンに統合する。

### ステップ5: Phase 4 テストを GREEN にする

- 全テスト（TC-01〜TC-10）を実行し GREEN を確認する。
- 型エラーがないことを `pnpm typecheck` で確認する。

## 統合テスト連携

- Phase 4 のテストが全て GREEN であることを確認する。
- Phase 6 で edge case テストを追加する。
- Phase 7 で coverage を計測する。

## 成果物

| 成果物   | パス                                        | 説明                                        |
| -------- | ------------------------------------------- | ------------------------------------------- |
| 型拡張   | `packages/shared/src/types/skillCreator.ts` | `status` / `degradedReason` / `userMessage` |
| Facade   | `RuntimeSkillCreatorFacade.ts`              | スタブ → エラー変換                         |
| IPC      | `creatorHandlers.ts`                        | エラー検出・IpcResult 変換                  |
| renderer | `SkillLifecyclePanel.tsx`                   | エラー表示                                  |
| renderer | `SkillCreateWizard.tsx`                     | エラー表示                                  |

## 完了条件

- [ ] 型拡張が実装されている（`status` / `degradedReason` / `userMessage`）
- [ ] plan() のスタブが error レスポンスに置換されている
- [ ] execute() のスタブが error レスポンスに置換されている
- [ ] improve() のスタブが error レスポンスに置換されている
- [ ] 正常系パスに `status: "ok"` が付与されている
- [ ] IPC handler がエラーを検出し IpcResult に変換している
- [ ] renderer がエラー状態を表示している
- [ ] Phase 4 テストが全て GREEN である
- [ ] `pnpm typecheck` が通る
- [ ] **本Phase内の全タスクを100%実行完了**
