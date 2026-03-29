# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 8                             |
| 機能名 | llm-adapter-error-propagation |
| 作成日 | 2026-03-29                    |

## 目的

エラーメッセージ生成の共通化、ステータス管理パターンの抽出、エラーコード体系の整理を行う。

## 実行タスク

- エラーメッセージ生成ロジックを共通化する
- ステータス管理パターンの改善候補を特定する
- エラーコードと型定義の整理

## 参照資料

| 資料名                 | パス                                        | 説明             |
| ---------------------- | ------------------------------------------- | ---------------- |
| Phase 2 設計           | `phase-2-design.md`                         | 元設計           |
| Phase 5 実装           | `phase-5-implementation.md`                 | 実装対象         |
| Phase 6 テスト拡充     | `phase-6-test-expansion.md`                 | edge case        |
| error response catalog | `outputs/phase-2/error-response-catalog.md` | エラーコード体系 |
| Phase 7 coverage       | `phase-7-coverage-check.md`                 | coverage 結果    |

## 実行手順

### ステップ1: エラーメッセージ生成を共通化する

**actionable メッセージ判定の抽出**:

```typescript
// 候補: private method または utility function
function toActionableMessage(reason: string | null): string {
  if (!reason) return "LLMAdapter の初期化に失敗しました";
  if (/api.?key|ANTHROPIC_API_KEY/i.test(reason)) {
    return "APIキーを設定してください";
  }
  return reason;
}
```

- `plan()` 内のインライン判定を helper に抽出する
- 将来的に `execute()` / `improve()` でも同じ判定が必要になった場合の再利用性を確保する

### ステップ2: ステータス管理パターンの改善候補を特定する

**現行パターン**:

- `_llmAdapterStatus` と `_llmAdapterFailureReason` が独立した private フィールド
- `setLLMAdapter()` と `setLLMAdapterFailed()` がそれぞれステータスを更新

**改善候補**:

- Discriminated union パターンの検討:

```typescript
type AdapterState =
  | { status: "initializing" }
  | { status: "ready"; adapter: LLMAdapter }
  | { status: "failed"; reason: string };
```

- 上記は将来のリファクタリング候補として記録する（本タスクでは既存パターンに従う）

### ステップ3: エラーコード体系の整理

| エラーコード               | 意味       | 対応メッセージ                                        |
| -------------------------- | ---------- | ----------------------------------------------------- |
| `LLM_ADAPTER_FAILED`       | 初期化失敗 | actionable メッセージまたは具体的理由                 |
| `LLM_ADAPTER_INITIALIZING` | 初期化中   | 「LLMAdapter の初期化中です。しばらくお待ちください」 |

- エラーコードは `string literal` として shared types に定義する
- 将来的に他のエラーコードが追加される場合に備え、union type で管理する候補とする

```typescript
type SkillCreatorErrorCode = "LLM_ADAPTER_FAILED" | "LLM_ADAPTER_INITIALIZING";
```

## 統合テスト連携

- Phase 9 で refactoring 後のテスト pass を確認する
- エラーメッセージ helper のユニットテスト追加を Phase 6 edge case と整合させる

## 成果物

| 成果物           | パス                     | 説明                 |
| ---------------- | ------------------------ | -------------------- |
| refactoring plan | `phase-8-refactoring.md` | 共通化・整理方針本文 |

## 完了条件

- [ ] エラーメッセージ生成の共通化候補が定義されている
- [ ] ステータス管理パターンの改善候補が記録されている
- [ ] エラーコード体系が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**
