# TASK-RT-04: api-key-management-ui

## 概要

SecureStorage への API キー設定 UI。ユーザーが Anthropic の API キーを設定する入口が存在しない。`AUTH_KEY_SET` / `EXISTS` / `VALIDATE` / `DELETE` の IPC チャネルは実装済みだが、Renderer 側に設定画面がないため、API キーの登録・管理ができない。本タスクは API キー入力・バリデーション・保存・削除を行うコンポーネントを新規作成し、SkillLifecyclePanel へ統合する。

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| タスクID   | TASK-RT-04             |
| タスク種別 | バグ修正 / UI 実装     |
| 優先度     | RT (Runtime)           |
| ステータス | spec_created           |
| 上流ゲート | なし                   |
| 依存タスク | なし                   |
| 後続タスク | TASK-P0-05, TASK-P0-06 |
| 作成日     | 2026-03-29             |
| 更新日     | 2026-03-29             |

## 受入基準

| ID   | 基準                                                                |
| ---- | ------------------------------------------------------------------- |
| AC-1 | API キー入力・保存コンポーネント (`ApiKeySettingsPanel`) が存在する |
| AC-2 | 入力値のバリデーション（空文字、フォーマットチェック）が機能する    |
| AC-3 | 保存状態（未設定/設定済み/検証中/エラー）がUI上に表示される         |
| AC-4 | 保存済みキーの削除機能が動作する                                    |
| AC-5 | SkillLifecyclePanel に ApiKeySettingsPanel が統合されている         |

## スコープ

**含む**:

- `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` 新規作成
- `apps/desktop/src/preload/skill-creator-api.ts` への AUTH_KEY 系チャネル公開拡張
- ApiKeySettingsPanel の状態管理（未設定/設定済み/検証中/エラー）
- 入力バリデーション（空文字、`sk-ant-` プレフィックス等のフォーマット）
- SkillLifecyclePanel への統合
- ユニットテスト

**含まない**:

- SecureStorage / main 側の IPC ハンドラ実装（既存で完備）
- 複数プロバイダ対応（Anthropic のみ対象）
- キーのローテーション機能
- OAuth フロー

## 依存関係

| 種別       | 参照先                           | 役割                                  |
| ---------- | -------------------------------- | ------------------------------------- |
| upstream   | `../requirements-draft.md`       | skill-creator 全体の要件              |
| upstream   | `../root-workflow-pack/index.md` | lane 共通不変条件と責務分離方針       |
| downstream | TASK-P0-05                       | execute 時に API キーが必要           |
| downstream | TASK-P0-06                       | 会話型 UI でも API キー設定導線が必要 |

## 現行コードアンカー

| ファイル                                                             | 現状の役割                                   | TASK-RT-04 での扱い           |
| -------------------------------------------------------------------- | -------------------------------------------- | ----------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                                 | AUTH_KEY_SET/EXISTS/VALIDATE/DELETE ハンドラ | 変更なし（既存チャネル活用）  |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | preload API 定義                             | AUTH_KEY 系メソッド公開を追加 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | スキル作成のメインパネル                     | ApiKeySettingsPanel を統合    |
| `packages/shared/src/types/skillCreator.ts`                          | 型定義                                       | API キー状態型を追加          |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| 真の論点             | IPC チャネルは存在するが Renderer 側に入口がなく、ユーザーが API キーを設定できない問題                 |
| 依存関係・責務境界   | main 側の SecureStorage/IPC は既存。preload に薄いラッパーを公開し、Renderer コンポーネントで完結させる |
| 価値とコストの不均衡 | 新規コンポーネント1つ + preload 拡張のみ。既存 IPC を活用するためコスト低                               |
| 改善優先順位         | 1. preload API 拡張 2. 状態型定義 3. コンポーネント実装 4. バリデーション 5. SkillLifecyclePanel 統合   |
| 4条件評価            | 価値性: 高（UX 必須機能）/ 実現性: 高（IPC 既存）/ 整合性: 既存パターン準拠 / 運用性: 独立テスト可能    |

## ディレクトリ構成

```text
step-08-par-task-rt-04-api-key-management-ui/
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
```

## 実装者向けクイックガイド

### 着手条件

- `apps/desktop/src/main/ipc/index.ts` の AUTH_KEY 系ハンドラを読了している
- `apps/desktop/src/preload/skill-creator-api.ts` の既存 API パターンを読了している
- `SkillLifecyclePanel.tsx` のコンポーネント構成を読了している

### 想定変更ポイント

- `apps/desktop/src/preload/skill-creator-api.ts` — AUTH_KEY_SET/EXISTS/VALIDATE/DELETE の invoke メソッド追加
- `packages/shared/src/types/skillCreator.ts` — `ApiKeyStatus` 型追加
- `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` — 新規コンポーネント
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — ApiKeySettingsPanel の import と配置
- テストファイル — ApiKeySettingsPanel のユニットテスト

### 非対象

- SecureStorage / main 側 IPC ハンドラの変更
- 複数プロバイダ対応
- キーローテーション
- OAuth フロー

### 完了イメージ

- SkillLifecyclePanel 内に API キー設定セクションが表示される
- ユーザーが API キーを入力し、バリデーション後に保存できる
- 保存状態（未設定/設定済み/検証中/エラー）が表示される
- 保存済みキーを削除できる
- 既存テストが全て pass する

### 並列実行メモ

- TASK-RT-04 は他の step-08 タスクと並列実行可能
- preload API の拡張は他タスクとのマージ競合に注意

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
