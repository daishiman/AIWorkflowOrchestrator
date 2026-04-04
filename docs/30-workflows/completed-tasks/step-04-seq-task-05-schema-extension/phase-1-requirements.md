# Phase 1: 要件定義 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 1                                       |
| 機能名    | schema-extension                        |
| タスクID  | TASK-LLM-MOD-05                         |
| 作成日    | 2026-03-23                              |
| 依存Phase | なし（Task04完了後に着手）              |
| 必須度    | オプション（Task01-04で目的は達成可能） |

## 目的

`LLMModelSchema` の `description` フィールドと `PROVIDER_CONFIGS` 型定義の整合性を確認し、Renderer側でモデルの説明文を表示するための前提条件を明らかにする。

## 実行タスク

### Task 1-1: 現状調査

1. `packages/shared/src/types/llm/schemas/provider.ts` の `LLMModelSchema` を確認する
   - `description: z.string().optional()` が L34 に定義済みであることを確認する
2. `apps/desktop/src/main/handlers/llm.ts` の `PROVIDER_CONFIGS` インライン型を確認する
   - 現在の型定義に `description` フィールドが含まれているかを確認する
   - 各モデルオブジェクトに `description` 値が設定されているかを確認する
3. IPC経由でRendererに届くデータ構造を確認する
   - `handleGetProviders()` 関数の返却型が `LLMProvider[]` であること
   - `LLMProvider` が `LLMModelSchema` の配列を含むことを確認する

### Task 1-2: ギャップ分析

1. `PROVIDER_CONFIGS` インライン型と `LLMModel` 型（`LLMModelSchema`の推論型）の差異をリストアップする
   - `description` フィールドの有無
   - その他のフィールド差異
2. `description` フィールドを追加した場合の影響範囲を調査する
   - `PROVIDER_CONFIGS` の型定義変更が必要か
   - 各モデルエントリへの `description` 値追加が必要か
   - テスト変更が必要か

### Task 1-3: 要件定義

1. 本タスクのスコープを確定する
   - スキーマ変更: 不要（`description` は既に `LLMModelSchema` に存在）
   - 型定義変更: `PROVIDER_CONFIGS` インライン型への `description?: string` 追加
   - 値の追加: 任意（空でも型は通る）
   - Renderer表示: 本タスクのスコープ外（未タスク化候補）
2. 受入基準を定義する（下記「完了条件」参照）

## 参照資料

| 資料                                                                                                     | 用途                         |
| -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `packages/shared/src/types/llm/schemas/provider.ts`                                                      | LLMModelSchema定義の確認     |
| `apps/desktop/src/main/handlers/llm.ts`                                                                  | PROVIDER_CONFIGS型定義の確認 |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`                                       | 既存テストの確認             |
| `docs/30-workflows/llm-provider-model-modernization/tasks/step-04-seq-task-05-schema-extension/index.md` | タスク概要                   |

## 成果物

| 成果物             | パス                           | 備考                         |
| ------------------ | ------------------------------ | ---------------------------- |
| Phase 1 要件定義書 | 本ファイル                     | -                            |
| ギャップ分析メモ   | 本ファイル内（Task 1-2の結果） | Phase 2 設計の入力として利用 |

## 統合テスト連携

本Phaseでは統合テストは不要。ただし、以下の点をPhase 4テスト設計に引き継ぐこと:

- `description` フィールドが `PROVIDER_CONFIGS` → `handleGetProviders()` → IPC → Renderer に到達するパスの検証
- `description` が `undefined` の場合（省略可能フィールド）のデフォルト動作確認

## 完了条件

- [ ] `LLMModelSchema` に `description: z.string().optional()` が定義済みであることを確認した
- [ ] `PROVIDER_CONFIGS` インライン型に `description` フィールドが存在するかどうかを特定した（存在しない場合は追加対象とする）
- [ ] `handleGetProviders()` の返却パスで `description` が透過的に伝搬することを確認した
- [ ] 本タスクのスコープ（型整合確認 + 必要に応じた型定義追加）と対象外スコープ（Renderer表示実装）を文書化した

## 次のPhase

[Phase 2: 設計](./phase-2-design.md)
