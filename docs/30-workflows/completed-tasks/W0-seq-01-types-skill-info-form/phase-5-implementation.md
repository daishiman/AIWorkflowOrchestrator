# Phase 5: 実装

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 5                              |
| タスクID   | UT-SKILL-WIZARD-W0-seq-01      |
| 機能名     | スキルウィザード共有型定義追加 |
| 前提Phase  | Phase 4                        |
| 後続Phase  | Phase 6                        |
| 作成日     | 2026-04-07                     |
| ステータス | pending                        |

## 目的

Phase 2 で設計し Phase 3 でレビュー済みの型定義を、実際に `skillCreator.ts` へ追記する。既存の `ScheduleConfig` は触らず、wizard 専用の型だけを追加する。公開経路は `@repo/shared/types/skillCreator` とし、root `@repo/shared` は既存の `SkillCategory` と衝突するため拡張しない。

## 実行タスク

- [ ] `packages/shared/src/types/skillCreator.ts` へ新セクションを追記する（修正）
- [ ] `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` を作成する（新規作成）
- [ ] 追記後に TypeScript コンパイルエラーがないことを確認する
- [ ] 追記後にテストが通ることを確認する

## 参照資料

| 資料名           | パス                                        | 説明                           |
| ---------------- | ------------------------------------------- | ------------------------------ |
| 設計書           | `phase-2-design.md`                         | 追記する型定義の完全コード     |
| テスト仕様       | `phase-4-test-creation.md`                  | 作成するテストファイルのコード |
| 追記対象ファイル | `packages/shared/src/types/skillCreator.ts` | 修正対象                       |

## 実行手順

### Step 1: ファイル種別の確認

| ファイル                                                          | 操作種別     | 説明                                                           |
| ----------------------------------------------------------------- | ------------ | -------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                       | 修正（追記） | 既存ファイルの既存 `ScheduleConfig` の後ろに新セクションを追加 |
| `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` | 新規作成     | 型テストファイル                                               |

### Step 2: `skillCreator.ts` への追記

`packages/shared/src/types/skillCreator.ts` の `ScheduleConfig` セクションの直後に以下を追記する。

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
 * `skillName` は任意入力で、省略も空文字も許容する。
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

このセクションの追加後、`packages/shared/package.json` の `./types/skillCreator` export から参照できる状態にする。root barrel には載せず、`SkillCategory` の名前衝突を避ける。

### Step 3: テストファイルの新規作成

`phase-4-test-creation.md` に記載のコードを使用して以下のファイルを新規作成する。

対象: `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`

### Step 4: 動作確認

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# テスト実行
pnpm --filter @repo/shared test packages/shared/src/types/__tests__/skillCreator-wizard.test.ts

# リント
pnpm --filter @repo/shared lint
```

### Step 5: エラー発生時の対処

| エラー内容                              | 対処方法                                                                                           |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `Duplicate identifier 'ScheduleConfig'` | 追記した型が `ScheduleConfig` になっていないか確認。`SkillWizardScheduleConfig` を使用していること |
| `Cannot find name 'SkillCategory'`      | `SkillCategory` の定義が `SkillInfoFormData` より後に配置されている。宣言順を入れ替える            |
| `Module not found`                      | インポートパスを確認。`../skillCreator` が正しいか確認                                             |

## 成果物

- `packages/shared/src/types/skillCreator.ts`: 末尾付近に 7 型を追記（修正）
- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`: 型テスト（新規作成）

## 完了条件

- [ ] `skillCreator.ts` に 7 型が追記されている
- [ ] `SkillWizardScheduleConfig` として既存 `ScheduleConfig` との衝突がない
- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `skillCreator-wizard.test.ts` のテストが全件パスする
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する
