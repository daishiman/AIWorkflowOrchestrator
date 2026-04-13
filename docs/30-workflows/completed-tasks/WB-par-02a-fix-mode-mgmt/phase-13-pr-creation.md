# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 13                                                            |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                     |
| 機能名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 前提Phase  | Phase 12                                                      |
| 後続Phase  | -                                                             |
| 作成日     | 2026-04-12                                                    |
| ステータス | blocked                                                       |

## 目的

提出準備は完了済みとし、ユーザー承認後のみ PR 作成へ進む。

## 重要: PR 作成はユーザーの明示的承認後のみ実施

**この Phase は承認待ちのため blocked。**
承認なしに `git push` / `gh pr create` を実行してはならない。

## PR 提出差分サマリー

### 変更ファイル

| ファイル                                                                          | 変更種別 | 概要                                                        |
| --------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | 変更     | generationMode/hasActivatedLlmMode削除・handleStep0Next修正 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`             | 変更     | ラジオボタンUI削除・generationMode関連props除去             |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | 変更     | ラジオボタン削除・Step 1スキップ禁止・正規フローのTDD更新   |

### 変更概要

1. `generationMode`（`"template" | "llm"`）state と `hasActivatedLlmMode` state を削除
2. 全 `template` 条件分岐を除去
3. `SkillInfoStep.tsx` からラジオボタンUI（「テンプレートから作成」「LLMで生成」）を削除
4. `SkillInfoStep` の props から `generationMode` / `onGenerationModeChange` を除去
5. `handleLlmGenerate` 内の `goToStep(2)` 直接呼び出しを除去
6. `handleStep0Next` が常に `goToStep(1)` を呼ぶよう修正（Step 0→Step 1 正規遷移）
7. Step 0→Step 1→Step 2→Step 3 の正規フローを確立

### レビュー観点

| 観点             | 確認内容                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 機能要件         | ラジオボタン削除・generationMode/hasActivatedLlmMode廃止・Step 1スキップ修正                      |
| 型安全性         | generationMode関連型定義の残骸なし・any型の不使用                                                 |
| テストカバレッジ | ラジオボタン削除確認・state廃止確認・Step 0→1遷移確認・Step 1スキップ禁止確認・正規フロー通過確認 |
| 依存タスク       | TASK-SW-FIX-DATAFLOW-001完了が前提となっていること                                                |
| 後続タスク       | Wave C（TASK-SW-FIX-STATE-DETAIL-001 / TASK-SW-FIX-UI-001）の着手条件が満たされているか           |

## 承認条件

**ユーザーの明示承認がある場合のみ PR 作成へ進む。**

承認がない場合は `outputs/phase-13/pr-preparation.md` / `approval-checklist.md` / `handoff-summary.md` の準備資料で終了する。

## PR タイトル案

```
fix(skill-wizard): generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正（TASK-SW-FIX-MODE-MGMT-001）
```

## PR 本文テンプレート

```markdown
## 概要

スキルウィザードの `generationMode` ラジオボタンを廃止してLLM専用化し、Step 1スキップ問題を修正する。

## 変更内容

- `generationMode`（`"template" | "llm"`）state と `hasActivatedLlmMode` state を削除
- 全 `template` 条件分岐を除去（LLM専用に統一）
- `SkillInfoStep.tsx` からラジオボタンUI（「テンプレートから作成」「LLMで生成」）を削除
- `SkillInfoStep` の props から `generationMode` / `onGenerationModeChange` を除去
- `handleLlmGenerate` 内の `goToStep(2)` 直接呼び出しを除去（Step 1スキップの原因）
- `handleStep0Next` が常に `goToStep(1)` を呼ぶよう修正
- Step 0→Step 1→Step 2→Step 3 の正規フローを確立

## 修正した問題

- 問題1: Step 0 にラジオボタンが表示される（仕様ではLLM専用）
- 問題9: `generationMode` と `hasActivatedLlmMode` の2系統フラグ混在
- 問題10: LLMモードでStep 1（Q1〜Q6）がスキップされる

## 依存タスク

- TASK-SW-FIX-DATAFLOW-001（Wave A）: 完了済み

## 後続タスク

- TASK-SW-FIX-STATE-DETAIL-001（Wave C）: Wave B完了後着手
- TASK-SW-FIX-UI-001（Wave C）: Wave B完了後着手

## テスト

- `pnpm --filter @repo/desktop test` で全テスト Green
- カバレッジ: SkillCreateWizard 80%以上
- ラジオボタン削除確認・state廃止確認・Step 1スキップ禁止確認・正規フロー通過確認
```

## 参照資料

| 資料名                   | パス                                                     | 用途            |
| ------------------------ | -------------------------------------------------------- | --------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物 |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物 |
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

| 成果物           | パス                                     | 説明                          |
| ---------------- | ---------------------------------------- | ----------------------------- |
| PR 準備メモ      | `outputs/phase-13/pr-preparation.md`     | 提出準備情報                  |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | Wave C タスクへの引き継ぎ情報 |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認              |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] PR 準備メモが作成されていること
- [ ] 引き継ぎサマリーに Wave C タスクへの引き継ぎ情報が記載されていること
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

なし（ワークフロー完了）
