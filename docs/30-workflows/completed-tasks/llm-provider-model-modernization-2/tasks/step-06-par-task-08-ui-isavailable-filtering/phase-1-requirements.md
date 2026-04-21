# Phase 1: 要件定義 -- UI isAvailable フィルタリング実装

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 1                        |
| 機能名     | ui-isavailable-filtering |
| タスクID   | TASK-LLM-MOD-08          |
| 作成日     | 2026-03-23               |
| 依存 Phase | なし（起点）             |

## 目的

チャット画面のモデル選択コンポーネント（`InlineModelSelector`）において、APIキーが設定されていないプロバイダーをドロップダウンから完全に非表示にするための要件を定義する。P62（DEFAULT_CONFIG への暗黙 fallback 禁止）の精神を継承し、ユーザーが意図しないプロバイダー/モデルでリクエストが送信される事態を防止する。

## 実行タスク

### Task 1-1: 現状調査

- `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` を読み込み、プロバイダー一覧の取得方法を確認する
- `LLMProvider` 型に `isAvailable` フィールドが存在することを確認する
- 設定画面の `ProviderSelector` コンポーネントが `isAvailable` をどのように利用しているか確認する（グレーアウト表示の実装）

### Task 1-2: 要件定義

**変更対象**: `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`

#### 要件 R-01: isAvailable フィルタリング

InlineModelSelector が表示するプロバイダー一覧を `isAvailable === true` のプロバイダーに限定する。Store から取得した全プロバイダー一覧（または props で渡された一覧）に対し、`.filter((p) => p.isAvailable)` を適用する。

#### 要件 R-02: 設定画面の表示維持

ProviderSelector（設定画面）は全プロバイダーを表示し、APIキー未設定プロバイダーはグレーアウト+「APIキー未設定」バッジで表示する既存動作を変更しない。

#### 要件 R-03: ゼロプロバイダー対応

フィルタリング後にプロバイダーが 0 件の場合、SelectorTrigger に「モデルを選択」と表示する。これは既存の `hasSelection` 判定ロジックにより自動的に実現される。

#### 要件 R-04: P62 準拠

APIキー未設定プロバイダーが InlineModelSelector から選択できないことにより、未設定プロバイダーへの暗黙 fallback を根本的に防止する。

### Task 1-3: 受入基準定義

| ID    | 受入基準                                                           |
| ----- | ------------------------------------------------------------------ |
| AC-01 | APIキー設定済みプロバイダーのみが InlineModelSelector に表示される |
| AC-02 | APIキー未設定プロバイダーのモデルが選択不可                        |
| AC-03 | 設定画面では全プロバイダーが表示される（未設定はグレーアウト）     |
| AC-04 | プロバイダーがゼロの場合「モデルを選択」が表示される               |
| AC-05 | TypeScript コンパイルエラー 0 件                                   |

### Task 1-4: スコープ外事項の明記

以下は本タスクのスコープ外とする：

- ProviderSelector（設定画面）の表示ロジック変更
- LLMSelectorPanel の表示ロジック変更
- `isAvailable` フィールドの値を決定するロジック（Main Process 側の `handleGetProviders`）
- Store（llmSlice）でのフィルタリングロジック追加

## 参照資料

| 資料名             | パス                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 現行実装           | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                               |
| 既知の落とし穴 P62 | `.claude/rules/06-known-pitfalls.md`（DEFAULT_CONFIG fallback 禁止）                                             |
| タスク概要         | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/index.md` |

## 成果物

| 成果物                   | パス                                                                                                                            | 形式     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 要件定義書（本ファイル） | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/phase-1-requirements.md` | Markdown |

## 完了条件

- [x] `InlineModelSelector.tsx` のプロバイダー取得方法を確認した
- [x] `LLMProvider` 型に `isAvailable` フィールドが存在することを確認した
- [x] 設定画面（ProviderSelector）の `isAvailable` 利用方法を確認した
- [x] 受入基準 AC-01〜AC-05 を定義した
- [x] スコープ外事項を明記した

## 統合テスト連携

Phase 1 では統合テストは実施しない。Phase 4 でテストファイルを作成する際に、本 Phase の受入基準を参照する。

## 次の Phase

Phase 2: 設計（`phase-2-design.md`）
