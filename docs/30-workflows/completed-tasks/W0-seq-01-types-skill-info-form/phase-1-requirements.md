# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 1                              |
| タスクID   | UT-SKILL-WIZARD-W0-seq-01      |
| 機能名     | スキルウィザード共有型定義追加 |
| 前提Phase  | -                              |
| 後続Phase  | Phase 2                        |
| 作成日     | 2026-04-07                     |
| ステータス | pending                        |

## 目的

Step 0 / Step 1 / Step 3 で共有する型契約を確定し、後続 wave が迷わず使える最小契約を固定する。`SkillInfoFormData` だけでなく、`ConversationAnswers` と `SmartDefaultResult` までを一度で確定する。

## 実行タスク

- [ ] 既存 `skillCreator.ts` の型一覧を把握し、追加型との衝突を検出する
- [ ] `skill.ts` にある既存 `SkillCategory` と wizard 専用 `SkillCategory` の違いを記録する
- [ ] `SkillInfoFormData` の必須・nullable・任意を確定する
- [ ] `QuestionAnswer` と `ConversationAnswers` の依存関係を確定する
- [ ] `SkillWizardScheduleConfig` の責務を確定する
- [ ] `SmartDefaultResult` の semantic key を確定する
- [ ] `SkeletonQualityFeedback` の保存要件を確定する

## 参照資料

| 資料名         | パス                                                                               | 説明                              |
| -------------- | ---------------------------------------------------------------------------------- | --------------------------------- |
| 既存 shared 型 | `packages/shared/src/types/skillCreator.ts`                                        | 追記対象ファイル                  |
| 既存 skill 型  | `packages/shared/src/types/skill.ts`                                               | 既存 `SkillCategory` との違い確認 |
| Step 0 実装    | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02a-skill-info-step/`         | 後続利用の確認                    |
| Step 1 実装    | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02b-conversation-round-step/` | 後続利用の確認                    |
| Step 2 実装    | `docs/30-workflows/skill-wizard-redesign-lane/W2-seq-03a-skill-create-wizard/`     | 推論利用の確認                    |

## 実行手順

### Step 1: 既存型の衝突確認

`packages/shared/src/types/skillCreator.ts` を読み、既存の `ScheduleConfig` の用途を確認する。

- 既存: `skillName / scheduleType / value / isEnabled / timezone`
- 追加予定: `cronExpression / timezone`
- 結論: 同名使用不可 -> 追加型は `SkillWizardScheduleConfig` に固定する

### Step 2: 命名規則の確認

| 種別             | 規則       | 例                                    |
| ---------------- | ---------- | ------------------------------------- |
| インターフェース | PascalCase | `SkillInfoFormData`, `QuestionAnswer` |
| 型エイリアス     | PascalCase | `SkillCategory`                       |
| フィールド名     | camelCase  | `skillName`, `selectedOption`         |

### Step 3: 追加型の要件確定

#### `SkillCategory`

- `"automation"` - 自動化
- `"external-integration"` - 外部連携
- `"data-analysis"` - データ分析
- `"code-support"` - コードサポート
- `"other"` - その他

#### `SkillInfoFormData`

- `skillName?: string` - 任意。未入力時は省略可
- `purpose: string` - 必須
- `category: SkillCategory | null` - 未選択を `null` で許容する

#### `SkillWizardScheduleConfig`

- `cronExpression: string` - cron 文字列
- `timezone: string` - タイムゾーン

#### `QuestionAnswer`

- `selectedOption: string | null` - 4択の選択値
- `freeText: string` - 自由入力テキスト
- `scheduleConfig?: SkillWizardScheduleConfig` - Q3 定期実行時のみ使用

#### `ConversationAnswers`

- q1〜q6 の 6 フィールド
- 各フィールドの型は `QuestionAnswer`

#### `SmartDefaultResult`

- `who`, `input`, `timing`, `output`, `tool`, `format` の 6 フィールド
- すべて `string | null`
- `inferenceLog?: string[]` を持ち、診断用途に使う

#### `SkeletonQualityFeedback`

- `satisfied: boolean`
- `generationMethod: "complete" | "skip"`
- `timestamp: number` - Unix ミリ秒

### Step 4: 依存関係の確認

```
SkillCategory
    ↓
SkillInfoFormData
    ↓
SkillWizardScheduleConfig
    ↓
QuestionAnswer
    ↓
ConversationAnswers
    ↓
SmartDefaultResult
    ↓
SkeletonQualityFeedback
```

### Step 5: 配置場所の確定

`skillCreator.ts` の既存 `ScheduleConfig` セクション直後に、`Skill Wizard Shared Contracts (UT-SKILL-WIZARD-W0-seq-01)` セクションを追加する。

```typescript
// ============================================
// Skill Wizard Shared Contracts (UT-SKILL-WIZARD-W0-seq-01)
// ============================================
```

## 成果物

- このファイル（Phase 1 要件定義書）: 追加型の確定仕様を記録

## 完了条件

- [ ] `SkillInfoFormData` の必須/nullable/任意が確定している
- [ ] `QuestionAnswer` / `ConversationAnswers` の依存関係が確定している
- [ ] `SkillWizardScheduleConfig` の命名衝突回避が確定している
- [ ] `SmartDefaultResult` の semantic key が確定している
- [ ] `SkeletonQualityFeedback` の保存要件が確定している
- [ ] 矛盾がないことを確認している
- [ ] 漏れがないことを確認している
