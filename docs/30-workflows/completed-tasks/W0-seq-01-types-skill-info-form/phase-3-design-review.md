# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 3                              |
| タスクID   | UT-SKILL-WIZARD-W0-seq-01      |
| 機能名     | スキルウィザード共有型定義追加 |
| 前提Phase  | Phase 2                        |
| 後続Phase  | Phase 4                        |
| 作成日     | 2026-04-07                     |
| ステータス | pending                        |

## 目的

Phase 2 の型契約をレビューし、後続 wave の利用と矛盾しないことを確認する。ここでは「追加しすぎ」も「足りなすぎ」も fail とする。

## 実行タスク

- [ ] `SkillInfoFormData` の必須/nullable/任意を確認する
- [ ] `QuestionAnswer` / `ConversationAnswers` の形状を確認する
- [ ] `SkillWizardScheduleConfig` と既存 `ScheduleConfig` の責務分離を確認する
- [ ] `SmartDefaultResult` の semantic key を確認する
- [ ] `SkillCategory` の 5 値を確認する
- [ ] 全型に `export` が付くことを確認する

## 参照資料

| 資料名      | パス                                                                    | 説明                 |
| ----------- | ----------------------------------------------------------------------- | -------------------- |
| 設計書      | `phase-2-design.md`                                                     | レビュー対象の型定義 |
| 既存型定義  | `packages/shared/src/types/skillCreator.ts`                             | 既存型との整合確認   |
| Step 0 実装 | `docs/30-workflows/completed-tasks/W1-par-02a-skill-info-step-2/`       | 後続利用の確認       |
| Step 1 実装 | `docs/30-workflows/completed-tasks/W1-par-02b-conversation-round-step/` | 後続利用の確認       |
| Step 2 実装 | `docs/30-workflows/W2-seq-03a-skill-create-wizard-2/`                   | 推論利用の確認       |

## 実行手順

### Step 1: 命名規則チェック

| 確認項目                    | 期待値     | 判定 |
| --------------------------- | ---------- | ---- |
| `SkillInfoFormData`         | PascalCase | PASS |
| `SkillCategory`             | PascalCase | PASS |
| `SkillWizardScheduleConfig` | PascalCase | PASS |
| `QuestionAnswer`            | PascalCase | PASS |
| `ConversationAnswers`       | PascalCase | PASS |
| `SmartDefaultResult`        | PascalCase | PASS |
| `SkeletonQualityFeedback`   | PascalCase | PASS |
| `skillName` など            | camelCase  | PASS |

**判定**: 旧案で出ていた `q1_user` のような命名は採用しない。semantic key と question key を分離することで、後続 wave の可読性を優先する。

### Step 2: 型衝突の最終確認

`skillCreator.ts` 内の既存 `ScheduleConfig` 定義:

```typescript
export interface ScheduleConfig {
  skillName: string;
  scheduleType: "cron" | "interval" | "once";
  value: string;
  isEnabled: boolean;
  timezone?: string;
}
```

追加する `SkillWizardScheduleConfig` は `cronExpression` / `timezone` の 2 項目だけを持つ wizard 専用設定であり、既存の `ScheduleConfig` とは用途が異なる。レビュー結果: **問題なし**。

### Step 3: 必須/オプションフィールドの妥当性確認

| 型                          | フィールド                                     | 判定             |
| --------------------------- | ---------------------------------------------- | ---------------- |
| `SkillInfoFormData`         | `skillName`                                    | PASS（optional） |
| `SkillInfoFormData`         | `purpose`                                      | PASS             |
| `SkillInfoFormData`         | `category`                                     | PASS             |
| `QuestionAnswer`            | `selectedOption`                               | PASS             |
| `QuestionAnswer`            | `freeText`                                     | PASS             |
| `QuestionAnswer`            | `scheduleConfig`                               | PASS             |
| `SkillWizardScheduleConfig` | `cronExpression`                               | PASS             |
| `SkillWizardScheduleConfig` | `timezone`                                     | PASS             |
| `SmartDefaultResult`        | `who/input/timing/output/tool/format`          | PASS             |
| `SkeletonQualityFeedback`   | `satisfied` / `generationMethod` / `timestamp` | PASS             |

### Step 4: `SkillCategory` の網羅性確認

| 値                       | 意味                     | 網羅性 |
| ------------------------ | ------------------------ | ------ |
| `"automation"`           | 自動化・繰り返し作業     | OK     |
| `"external-integration"` | 外部 API・サービス連携   | OK     |
| `"data-analysis"`        | データ分析・集計         | OK     |
| `"code-support"`         | コード生成・レビュー支援 | OK     |
| `"other"`                | 上記以外                 | OK     |

### Step 5: 後続コンポーネント利用シナリオ確認

1. `SkillInfoFormStep.tsx`（Step 0 フォームコンポーネント）
   - `SkillInfoFormData` を state として保持する
   - `SkillCategory` を select の option として使用する

2. `SmartDefaultInferrer.ts`（スマートデフォルト推論サービス）
   - `SkillInfoFormData` を入力として受け取り `SmartDefaultResult` を返す

3. `ConversationWizard.tsx`（会話フローコンポーネント）
   - `ConversationAnswers` を各 Q の回答集約に使用する
   - `q3.scheduleConfig` がある場合に `SkillWizardScheduleConfig` を表示する

4. `SkeletonGenerator.ts`（骨格生成サービス）
   - `ConversationAnswers` を入力として受け取る
   - `SkeletonQualityFeedback` を返す

**判定**: 全型が後続コンポーネントで自然に利用できる設計。

### Step 6: `export` 漏れ確認

全型に `export` キーワードが付与されていることを確認する（`shared` パッケージから外部公開されるため必須）。

## 成果物

- このファイル（Phase 3 設計レビュー記録）: レビュー結果と判定を記録

## 完了条件

- [ ] 命名規則チェックが完了し、問題点が解決されている
- [ ] 型衝突（`ScheduleConfig`）の最終確認が完了している
- [ ] 必須/オプションフィールドの妥当性が確認されている
- [ ] `SkillCategory` の網羅性が確認されている
- [ ] 後続コンポーネントの利用シナリオでの動作が設計上問題ないことを確認している
- [ ] 全型に `export` が付与されていることを確認している
- [ ] レビューで発見した問題点が Phase 5 実装前に解決されている
