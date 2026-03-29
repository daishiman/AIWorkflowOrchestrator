# TASK-RT-01: llm-adapter-error-propagation

## 概要

LLMAdapter の初期化は fire-and-forget パターンで実行されており、API キー未設定や `LLMAdapterFactory.getAdapter()` の失敗時にエラーが `console.warn` でログ出力されるだけで握りつぶされる。ユーザーは UI 上でエラーを確認できず、`plan()` が空の stub データを返すため「機能が壊れている」と誤認する。本タスクは、Facade にアダプターステータスを導入し、エラーを明示的にレスポンスへ伝播させることで、ユーザーに actionable なフィードバックを提供する。

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスクID   | TASK-RT-01                        |
| タスク種別 | バグ修正 / エラーハンドリング改善 |
| 優先度     | RT (Runtime)                      |
| ステータス | spec_created                      |
| 上流ゲート | なし                              |
| 依存タスク | なし                              |
| 後続タスク | TASK-RT-02                        |
| 作成日     | 2026-03-29                        |
| 更新日     | 2026-03-29                        |

## 受入基準

| ID   | 基準                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------ |
| AC-1 | Facade が `llmAdapterStatus` プロパティ (`"ready"` \| `"initializing"` \| `"failed"`) を公開する |
| AC-2 | Facade が初期化失敗理由を保持し、取得可能である                                                  |
| AC-3 | `plan()` が llmAdapter 未利用時に空 stub ではなく明示的エラーレスポンスを返す                    |
| AC-4 | エラーレスポンスに actionable メッセージ（例: 「APIキーを設定してください」）を含む              |
| AC-5 | IPC レスポンスにアダプターステータスを含み、UI が表示可能である                                  |
| AC-6 | 既存テストが pass する（fire-and-forget パターンは維持）                                         |

## スコープ

**含む**:

- `RuntimeSkillCreatorFacade` に `llmAdapterStatus` プロパティを追加
- `RuntimeSkillCreatorFacade` に初期化失敗理由の保持機構を追加
- `plan()` の llmAdapter 未設定時エラーレスポンス実装
- エラーレスポンス型の定義または拡張
- IPC レスポンスへのアダプターステータス付与
- `ipc/index.ts` の fire-and-forget 初期化でステータス更新を追加
- ユニットテスト

**含まない**:

- fire-and-forget パターン自体の変更（非同期初期化は IPC 登録をブロックできない）
- UI / renderer 側のエラー表示実装（TASK-RT-02 以降の責務）
- LLMAdapterFactory のリトライロジック追加
- preload API の新規チャネル追加（既存レスポンスにステータスを含める方針）
- API キー管理機能

## 依存関係

| 種別       | 参照先                           | 役割                            |
| ---------- | -------------------------------- | ------------------------------- |
| upstream   | `../requirements-draft.md`       | skill-creator 全体の要件        |
| upstream   | `../root-workflow-pack/index.md` | lane 共通不変条件と責務分離方針 |
| downstream | TASK-RT-02                       | UI 側のエラー表示実装           |

## 現行コードアンカー

| ファイル                                                              | 現状の役割                                                                   | TASK-RT-01 での扱い                                          |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/index.ts` (934-946行)                      | fire-and-forget で LLMAdapter を初期化。失敗時は `console.warn` で握りつぶし | ステータス更新コールバックを追加                             |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `plan()` が llmAdapter 未設定時に空 stub を返す                              | `llmAdapterStatus` プロパティ追加、`plan()` エラーレスポンス |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`             | `getAdapter()` が失敗を throw する                                           | 変更なし（呼び出し側で catch してステータス反映）            |
| `packages/shared/src/types/skillCreator.ts`                           | レスポンス型定義                                                             | エラーレスポンス型の拡張                                     |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | preload API 定義                                                             | 既存レスポンスにステータスが含まれるため変更最小限           |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 真の論点             | エラーが握りつぶされ UI に到達しない問題を、Facade 層のステータス管理で閉じること                                         |
| 依存関係・責務境界   | ipc/index.ts は初期化トリガーのまま維持し、ステータス管理は Facade に集約する。UI 表示は TASK-RT-02 に分離                |
| 価値とコストの不均衡 | プロパティ追加と条件分岐のみで実装可能。fire-and-forget パターンを壊さないため既存動作への影響が最小限                    |
| 改善優先順位         | 1. ステータス型定義 2. Facade プロパティ追加 3. plan() エラーレスポンス 4. ipc 初期化ステータス更新 5. IPC レスポンス拡張 |
| 4条件評価            | 価値性: 高（UX 直結）/ 実現性: 高（プロパティ追加 + 条件分岐）/ 整合性: 既存型を拡張 / 運用性: 独立テスト可能             |

## ディレクトリ構成

```text
step-08-par-task-rt-01-llm-adapter-error-propagation/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/adapter-status-design.md
    ├── phase-2/error-response-catalog.md
    ├── phase-3/design-review-gate.md
    ├── phase-4/test-matrix.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/manual-test-report.md
    ├── phase-11/discovered-issues.md
    ├── phase-12/
    │   ├── implementation-guide.md
    │   ├── system-spec-update-summary.md
    │   ├── documentation-changelog.md
    │   ├── unassigned-task-detection.md
    │   └── skill-feedback-report.md
    └── phase-13/
        ├── local-check-result.md
        └── change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- `apps/desktop/src/main/ipc/index.ts` の 934-946 行（fire-and-forget 初期化）を読了している
- `RuntimeSkillCreatorFacade.ts` の `plan()` メソッドで llmAdapter 未設定時の挙動を読了している
- `packages/shared/src/types/skillCreator.ts` のレスポンス型を読了している
- fire-and-forget パターンを維持し、ステータス管理のみ追加することに合意している

### 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — `LLMAdapterStatus` 型追加、レスポンス型にステータスフィールド追加
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — `llmAdapterStatus` プロパティ、失敗理由保持、`plan()` エラーレスポンス
- `apps/desktop/src/main/ipc/index.ts` (934-946行) — ステータス更新コールバック追加
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` — ステータス・エラーレスポンスのテスト追加

### 非対象

- fire-and-forget パターン自体の変更
- UI / renderer 側のエラー表示
- LLMAdapterFactory のリトライロジック
- preload API の新規チャネル追加
- API キー管理機能

### 完了イメージ

- `facade.llmAdapterStatus` が `"ready"` / `"initializing"` / `"failed"` を返す
- `facade.llmAdapterFailureReason` が失敗時のエラーメッセージを返す
- `plan()` を llmAdapter 未設定で呼ぶと、空 stub ではなく `{ success: false, error: "APIキーを設定してください" }` 相当のレスポンスが返る
- IPC レスポンスに `adapterStatus` フィールドが含まれる
- 既存テストが全て pass する

### 並列実行メモ

- TASK-RT-01 は TASK-RT-02 と並列実行可能（shared type のマージ競合に注意）
- TASK-RT-01 は TASK-RT-03 と並列実行可能
- shared type のレスポンス型拡張は他タスクとのマージ競合に注意

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
