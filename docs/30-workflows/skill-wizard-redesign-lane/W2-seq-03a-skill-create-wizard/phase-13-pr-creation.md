# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 13                                         |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 12                                   |
| 後続Phase  | -                                          |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

提出準備を完了し、ユーザー承認後のみ PR 作成へ進む。

## PR 提出差分サマリー

### 変更ファイル

| ファイル                                                                            | 変更種別  | 概要                                                       |
| ----------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                  | 変更      | description/options/generationMode 削除・新機能追加        |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                | 変更      | mode prop 削除・LLM 専用化                                 |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx` | 新規/変更 | mode prop 削除の TDD 更新                                  |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 新規/変更 | action cards / external integration / recovery の TDD 更新 |
| `apps/desktop/src/renderer/utils/inferSmartDefaults.ts`（オプション）               | 新規      | 推論関数の分離（リファクタ後）                             |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`   | 新規/変更 | TDD テスト追加                                             |

### 変更概要

1. `description` / `options` / `generationMode` state および全 `template` 条件分岐を削除
2. `formData` / `answers` / `smartDefaults` / `generationMethod` / `skillPath` / `hasExternalIntegration` / `externalToolName` state を追加
3. `handleRetry()` で Step 0 への復帰と生成結果 state の初期化を実装
4. `inferSmartDefaults(formData)` 関数を実装（`slack`/`github`/`notion` を大小文字不問で推論）
5. STEPS 配列を `["スキル情報入力", "詳細設定", "生成", "完了"]` へ更新
6. `handleStep0Next()` / `handleGenerate(method)` / `handleQualityFeedback(satisfied)` を実装（`handleGenerate` は `generationLockRef` / `isGenerating` 再入防止を含む）
7. Step 0: `<SkillInfoStep>` / Step 1: `<ConversationRoundStep>` / Step 2: `<GenerateStep>` / Step 3: `<CompleteStep>` レンダリングへ変更（`skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` を接続）

### レビュー観点

| 観点             | 確認内容                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 機能要件         | description/options/generationMode 削除・skillPath / handleRetry 追加・STEPS 変更・CompleteStep action cards 接続      |
| 型安全性         | W0-seq-01 型定義との整合・any 型の不使用                                                                               |
| テストカバレッジ | inferSmartDefaults 全推論ルール・handleGenerate 両方式・handleRetry・GenerateStep mode 削除・CompleteStep action cards |
| 依存タスク       | W1-par-02a/W1-par-02b/W1-par-02c との props 契約整合                                                                   |
| 後続タスク       | W3-seq-04 が参照する handleQualityFeedback が正しく実装されているか                                                    |

## 承認条件

**ユーザーの明示承認がある場合のみ PR 作成へ進む。**

承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## PR タイトル案

```
feat(skill-wizard): SkillCreateWizard LLM専用化 + スマートデフォルト推論（W2-seq-03a）
```

## PR 本文テンプレート

```markdown
## 概要

SkillCreateWizard をテンプレート生成廃止・LLM 専用化し、スマートデフォルト推論機能を追加。

## 変更内容

- `generationMode` state と全 template 条件分岐を削除
- `inferSmartDefaults` 関数を実装（`slack`/`github`/`notion` を大小文字不問で推論）
- STEPS 配列を `["スキル情報入力", "詳細設定", "生成", "完了"]` へ更新
- `skillPath` state を追加し、`hasExternalIntegration` / `externalToolName` を完了画面表示に受け渡し、`handleRetry` で Step 0 へ戻れるようにする
- `handleGenerate(method)` は `generationLockRef` / `isGenerating` ガードで二重呼び出しを防止し、生成開始時に `clearGenerationState()` でストアを初期化する
- `GenerateStep` から `generationMode` prop を削除する
- `CompleteStep` に `skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` を接続する
- 新ハンドラ: `handleStep0Next` / `handleGenerate(method)` / `handleQualityFeedback` / `handleRetry`

## 依存タスク

- W0-seq-01（型定義）: 完了済み
- W1-par-02a（SkillInfoStep）: 完了済み
- W1-par-02b（ConversationRoundStep）: 完了済み
- W1-par-02c（CompleteStep）: 完了済み

## 後続タスク

- W2-seq-03b（wizard/index.ts エクスポート更新）: 並列実行
- W3-seq-04（使用率計装）: W2-seq-03a 完了後着手

## テスト

- `pnpm --filter @repo/desktop test` で全テスト Green
- カバレッジ: SkillCreateWizard 80%以上 / inferSmartDefaults 90%以上 / GenerateStep の mode 削除確認 / CompleteStep action cards
- `GenerateStep` から `generationMode` prop が消えていることを確認
```

## 参照資料

| 資料名                   | パス                                                     | 用途            |
| ------------------------ | -------------------------------------------------------- | --------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |

## 実行手順

1. Phase 12 成果物を確認する。
2. 差分要約とレビュー観点を整理する。
3. 承認条件チェックでユーザー明示承認の有無を確認する。
4. 承認がない場合は `outputs/phase-13/pr-preparation.md` のみ作成して終了する。
5. 承認がある場合は `gh pr create` で PR を作成する。

## 成果物

| 成果物           | パス                                     | 説明                                |
| ---------------- | ---------------------------------------- | ----------------------------------- |
| PR 準備メモ      | `outputs/phase-13/pr-preparation.md`     | 提出準備情報                        |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | 後続タスク（W3-seq-04）への引き継ぎ |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認                    |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] PR 準備メモが作成されていること
- [ ] 引き継ぎサマリーに W3-seq-04 への引き継ぎ情報が記載されていること
- [ ] 承認チェックが記録されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 差分要約の整理
3. 承認条件チェック
4. PR 作成（承認時のみ）
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## PR 作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む。
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## 次のPhase

Phase -: -（W3-seq-04 へ引き継ぎ）
