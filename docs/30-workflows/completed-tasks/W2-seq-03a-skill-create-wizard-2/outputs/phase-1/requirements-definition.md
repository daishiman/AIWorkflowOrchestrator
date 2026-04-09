# Phase 1: 要件定義書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 1                                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 作成日     | 2026-04-08                                                 |
| ステータス | completed                                                  |

---

## 機能要件

### FR-01: 3ステップ構成のウィザードフロー

`SkillCreateWizard.tsx` は以下の3ステップを制御する:

| ステップ | コンポーネント          | 役割                     |
| -------- | ----------------------- | ------------------------ |
| Step 0   | `SkillInfoStep`         | スキル情報入力           |
| Step 1   | `ConversationRoundStep` | 6問固定会話ラリー        |
| Step 2   | `CompleteStep`          | 完了・ネクストアクション |

### FR-02: Step 0 → Step 1 遷移時の SmartDefault 推論

- Step 0 完了時に `inferSmartDefaults(formData)` を呼び出す
- 結果の `SmartDefaultResult` を `ConversationRoundStep` の Props として渡す
- エラー時は `null` にフォールバックし、デフォルト値（全フィールド null）を使用する

### FR-03: NON_VISUAL 計装ポイント 5 つ

`trackEvent` スタブ関数を使用し、以下の計装ポイントを実装する:

| ポイント | タイミング                      | イベント名                    |
| -------- | ------------------------------- | ----------------------------- |
| 計装1    | ウィザード表示時（useEffect）   | `wizard:start`                |
| 計装2    | Step 0 完了・次へ遷移時         | `wizard:step0:complete`       |
| 計装3    | inferSmartDefaults 呼び出し結果 | `wizard:smartDefaults:result` |
| 計装4    | Step 1 完了・生成開始時         | `wizard:step1:complete`       |
| 計装5    | 完了画面到達時                  | `wizard:complete`             |

### FR-04: 旧設計の削除

以下の旧 state・ハンドラを削除する:

- `description` state
- `options` state
- 旧生成モード state（旧フォーマット）
- `handleDescribeNext()` の旧生成モード分岐
- `template` 関連の全条件分岐

### FR-05: 完了画面の3カードアクション

- 「今すぐ実行する」→ `onClose()` 呼び出し
- 「エディタで開く」→ `onClose()` 呼び出し
- 「別のスキルを作る」→ Step 0 にリセット

---

## 非機能要件

### NFR-01: 型安全性

- `SkillInfoFormData`、`SmartDefaultResult`、`ConversationAnswers` の型を `@repo/shared/types/skillCreator` からインポートする
- `any` 型を使用しない

### NFR-02: テストカバレッジ

| 指標              | 目標  |
| ----------------- | ----- |
| Line Coverage     | ≥ 90% |
| Branch Coverage   | ≥ 80% |
| Function Coverage | ≥ 90% |

### NFR-03: 静的解析

- TypeScript 型チェックエラーなし
- ESLint エラー・警告なし
