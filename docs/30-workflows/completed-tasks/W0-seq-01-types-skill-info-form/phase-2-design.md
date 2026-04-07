# Phase 2: 設計

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 2                              |
| タスクID   | UT-SKILL-WIZARD-W0-seq-01      |
| 機能名     | スキルウィザード共有型定義追加 |
| 前提Phase  | Phase 1                        |
| 後続Phase  | Phase 3                        |
| 作成日     | 2026-04-07                     |
| ステータス | pending                        |

## 目的

Phase 1 で確定した共有契約を、TypeScript の具体定義に落とし込む。既存 `ScheduleConfig` と衝突しないこと、後続 wave の props/state から自然に使えることを優先する。

## 実行タスク

- [ ] `SkillCategory` の union を最終確定する
- [ ] `SkillInfoFormData` の必須/nullable を最終確定する
- [ ] `SkillWizardScheduleConfig` の命名と責務を最終確定する
- [ ] `QuestionAnswer` と `ConversationAnswers` の依存を最終確定する
- [ ] `SmartDefaultResult` の semantic key を最終確定する
- [ ] `SkeletonQualityFeedback` の保存要件を最終確定する

## 参照資料

| 資料名      | パス                                                                               | 説明                     |
| ----------- | ---------------------------------------------------------------------------------- | ------------------------ |
| 要件定義    | `phase-1-requirements.md`                                                          | 確定した型フィールド要件 |
| 既存型定義  | `packages/shared/src/types/skillCreator.ts`                                        | 追記対象ファイル         |
| Step 0 実装 | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02a-skill-info-step/`         | 後続利用の確認           |
| Step 1 実装 | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02b-conversation-round-step/` | 後続利用の確認           |
| Step 2 実装 | `docs/30-workflows/skill-wizard-redesign-lane/W2-seq-03a-skill-create-wizard/`     | 推論利用の確認           |

## 実行手順

### Step 1: 型間依存関係の整理

```
SkillCategory（独立 type union）
    ↑ 参照
SkillInfoFormData
    └── category: SkillCategory | null

SkillWizardScheduleConfig（独立 interface）
    ↑ 参照
QuestionAnswer
    └── scheduleConfig?: SkillWizardScheduleConfig

ConversationAnswers
    └── q1〜q6: QuestionAnswer

SmartDefaultResult（独立 interface）
SkeletonQualityFeedback（独立 interface）
```

既存型との関係: 全て独立定義（継承・拡張なし）。`SkillWizardScheduleConfig` は既存 `ScheduleConfig` と似た責務を持つが、用途が異なるため別名にする。

### Step 2: 完成型定義の設計

以下が追加するセクションの完全な設計である。

```typescript
// ============================================
// Skill Wizard Shared Contracts (UT-SKILL-WIZARD-W0-seq-01)
// ============================================

/**
 * スキルウィザード専用カテゴリ。
 * 既存 `skill.ts` の `SkillCategory` とは別概念で、Step 0 の入力候補に対応する。
 */
export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";

/**
 * Step 0 のフォームデータ。
 * `skillName` は任意入力で、未設定時は省略できる。
 */
export interface SkillInfoFormData {
  /** スキル名（任意） */
  skillName?: string;
  /** スキルの目的・概要（必須） */
  purpose: string;
  /** スキルカテゴリ（未選択時は null） */
  category: SkillCategory | null;
}

/**
 * Step 1 の Q3 定期実行に使うスケジュール設定。
 * 既存 `ScheduleConfig` とは別概念のため、名称を分ける。
 */
export interface SkillWizardScheduleConfig {
  /** cron 文字列 */
  cronExpression: string;
  /** タイムゾーン */
  timezone: string;
}

/**
 * 1問分の回答データ。
 * Q3 では scheduleConfig を追加で保持する。
 */
export interface QuestionAnswer {
  /** 4択の選択値。未選択時は null。 */
  selectedOption: string | null;
  /** 自由入力テキスト。 */
  freeText: string;
  /** Q3 の定期実行設定。 */
  scheduleConfig?: SkillWizardScheduleConfig;
}

/**
 * 6問分の回答データ。
 * Step 1 の状態保持と Step 2 以降の引き渡しに使用する。
 */
export interface ConversationAnswers {
  /** Q1: 利用者 */
  q1: QuestionAnswer;
  /** Q2: 入力データ */
  q2: QuestionAnswer;
  /** Q3: 実行タイミング */
  q3: QuestionAnswer;
  /** Q4: 出力先 */
  q4: QuestionAnswer;
  /** Q5: 外部ツール連携 */
  q5: QuestionAnswer;
  /** Q6: 出力フォーマット */
  q6: QuestionAnswer;
}

/**
 * スマートデフォルト推論結果。
 * 6問の初期値を意味ベースのキーで持つ。
 */
export interface SmartDefaultResult {
  /** Q1 相当のデフォルト値。 */
  who: string | null;
  /** Q2 相当のデフォルト値。 */
  input: string | null;
  /** Q3 相当のデフォルト値。 */
  timing: string | null;
  /** Q4 相当のデフォルト値。 */
  output: string | null;
  /** Q5 相当のデフォルト値。 */
  tool: string | null;
  /** Q6 相当のデフォルト値。 */
  format: string | null;
  /** 推論理由の記録。診断用途のため optional。 */
  inferenceLog?: string[];
}

/**
 * 骨格品質フィードバック。
 * 生成後の満足度と生成方法を記録する。
 */
export interface SkeletonQualityFeedback {
  /** ユーザーが骨格に満足したか */
  satisfied: boolean;
  /** 骨格の生成方法。 */
  generationMethod: "complete" | "skip";
  /** フィードバック記録時刻（Unix ミリ秒） */
  timestamp: number;
}
```

### Step 3: JSDoc 設計方針

- インターフェース本体に 2〜3 行の説明を置き、用途と責務を先に書く
- 全フィールドに 1 行の `/** */` コメントを付ける
- `SkillWizardScheduleConfig` には既存 `ScheduleConfig` との違いを明記する
- `SmartDefaultResult` は semantic key を使い、質問番号を埋め込まない

### Step 4: 配置場所の設計

`skillCreator.ts` の既存 `ScheduleConfig` セクション直後に `Skill Wizard Shared Contracts (UT-SKILL-WIZARD-W0-seq-01)` を追加する。

```text
// ============================================
// Skill Wizard Shared Contracts (UT-SKILL-WIZARD-W0-seq-01)
// ============================================
```

## 成果物

- このファイル（Phase 2 設計書）: 完成型定義のコードと設計方針を記載

## 完了条件

- [ ] 全 7 型の TypeScript 定義が確定している
- [ ] `SkillWizardScheduleConfig` として既存 `ScheduleConfig` との衝突が回避されている
- [ ] 全フィールドに JSDoc コメントが設計されている
- [ ] 追加セクションの配置場所が決定している
- [ ] 型間の依存関係図が作成されている
