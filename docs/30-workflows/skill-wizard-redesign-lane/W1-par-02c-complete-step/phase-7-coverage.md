# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| Phase名    | カバレッジ確認                            |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 6: テスト拡充                       |
| 次Phase    | Phase 8: リファクタリング                 |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

CompleteStep.tsx のテストカバレッジを計測し、未カバー箇所を特定して補完する。

## 実行タスク

### Task 1: カバレッジ計測

```bash
# CompleteStep 単体のカバレッジ計測
pnpm --filter @repo/desktop vitest run -- CompleteStep --coverage

# カバレッジレポートの確認
open apps/desktop/coverage/index.html
```

### Task 2: カバレッジ目標値の確認

| 指標       | 目標値  | 説明                                   |
| ---------- | ------- | -------------------------------------- |
| Statements | 90%以上 | 全ステートメントの網羅率               |
| Branches   | 85%以上 | 条件分岐（三項演算子・if含む）の網羅率 |
| Functions  | 100%    | 全関数の呼び出し確認                   |
| Lines      | 90%以上 | 全行の実行確認                         |

### Task 3: 未カバー箇所の特定と補完

カバレッジレポートから未カバー行を確認し、テストを追加する。

特に以下の分岐を確認する:

| 分岐条件                                      | カバー確認                                   |
| --------------------------------------------- | -------------------------------------------- |
| `hasExternalIntegration === true`             | Phase 6 で追加済み                           |
| `hasExternalIntegration === false`            | Phase 4 で追加済み                           |
| `feedbackSubmitted === true` での二重クリック | Phase 4 で追加済み                           |
| `onExecuteNow === undefined` での disabled    | Phase 4 で追加済み                           |
| `onRetry === undefined` での 👎クリック       | 要確認（onRetry?.() のオプショナルチェーン） |
| `generatedSkill === null`                     | Phase 6 で追加済み                           |
| `externalToolName === undefined`              | Phase 6 で追加済み                           |

### Task 4: カバレッジ不足箇所へのテスト追加

Task 3 で不足が判明した箇所のテストを `CompleteStep.test.tsx` に追記する。

```typescript
describe("カバレッジ補完", () => {
  it("onRetryが未指定でも👎クリックがエラーにならない", async () => {
    // onRetry=undefined で 👎クリック → エラーなし
  });

  it("onCreateAnotherが未指定でカードがdisabled", () => {
    // onCreateAnother=undefined → complete-step-action-create-another が disabled
  });

  it("onOpenInEditorが未指定でカードがdisabled", () => {
    // onOpenInEditor=undefined → complete-step-action-open-editor が disabled
  });
});
```

### Task 5: 最終カバレッジ計測

補完テスト追加後に再計測し、目標値を達成しているか確認する。

```bash
pnpm --filter @repo/desktop vitest run -- CompleteStep --coverage
```

## 参照資料

| 資料名         | パス                                                                                | 説明           |
| -------------- | ----------------------------------------------------------------------------------- | -------------- |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 計測対象       |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                | カバレッジ対象 |

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・未カバー箇所・補完内容 |

## 完了条件

- [ ] カバレッジが計測されている
- [ ] Statements 90%以上を達成している
- [ ] Branches 85%以上を達成している
- [ ] Functions 100%を達成している
- [ ] 未カバー箇所が特定・補完されている
- [ ] 補完後のテストが全てpassしている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
