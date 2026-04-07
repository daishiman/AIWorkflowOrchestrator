# W0-seq-01 types skill info form 実装ガイド

## メタ情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | UT-SKILL-WIZARD-W0-seq-01      |
| 機能名   | スキルウィザード共有型定義追加 |
| 作成日   | 2026-04-07                     |
| 対象読者 | 初学者から開発者まで           |

## Part 1

### なぜ必要か

スキル作成の流れで使う情報を、あちこちの箱に分けて入れると、どの箱に何が入っているか分かりにくくなる。今回の共有型は、その箱のラベルを先に決めて、後続の画面や処理が迷わず同じ形で使えるようにするために必要だった。

### 何をするか

`SkillInfoFormData`、`ConversationAnswers`、`SmartDefaultResult` などの型を 1 か所にまとめた。これで、Step 0 の入力フォーム、Step 1 の 6 問会話、Step 3 のフィードバックが同じ言葉でつながる。

### 日常の例え

たとえば、引っ越しで使う段ボール箱に「食器」「本」「衣類」とラベルを貼る場面に似ている。ラベルがないと、開けるまで中身が分からない。今回の型定義は、そのラベルを最初に決めて、後から入れる人も受け取る人も迷わないようにする役割を持つ。

### この機能でできること

| 型                    | 役割                               | たとえ               |
| --------------------- | ---------------------------------- | -------------------- |
| `SkillInfoFormData`   | スキル名・目的・カテゴリをまとめる | 引っ越し箱の表ラベル |
| `ConversationAnswers` | 6 問分の回答をまとめる             | 6 枚の仕分けシート   |
| `SmartDefaultResult`  | 最初に入れるおすすめ値を持つ       | 事前に貼っておく付箋 |

## Part 2

### 共有型の役割

この wave で追加した型は、後続の Step 0 / Step 1 / Step 3 が同じ契約を参照できるようにするためのもの。型は `packages/shared/src/types/skillCreator.ts` に置き、公開経路は `@repo/shared/types/skillCreator` に閉じている。

### TypeScript の型定義

```ts
import type {
  ConversationAnswers,
  QuestionAnswer,
  SkillCategory,
  SkillInfoFormData,
  SkillWizardScheduleConfig,
  SkeletonQualityFeedback,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";
```

### 主要な使用例

```ts
const formData: SkillInfoFormData = {
  skillName: "slack-notifier",
  purpose: "Slack通知を整理する",
  category: "automation",
};

const schedule: SkillWizardScheduleConfig = {
  cronExpression: "0 9 * * 1-5",
  timezone: "Asia/Tokyo",
};

const answers: ConversationAnswers = {
  q1: { selectedOption: "自分のみ", freeText: "" },
  q2: { selectedOption: "テキスト", freeText: "" },
  q3: { selectedOption: "定期実行", freeText: "", scheduleConfig: schedule },
  q4: { selectedOption: "通知", freeText: "" },
  q5: { selectedOption: "Slack", freeText: "" },
  q6: { selectedOption: "Markdown", freeText: "" },
};

const defaults: SmartDefaultResult = {
  who: "自分のみ",
  input: "テキスト",
  timing: null,
  output: null,
  tool: null,
  format: "Markdown",
  inferenceLog: ["purpose に Slack を含むため who を推論"],
};
```

### `SkillWizardScheduleConfig` と既存 `ScheduleConfig` の違い

`ScheduleConfig` は既存のスキル実行スケジュール管理用の型で、`skillName`、`scheduleType`、`value`、`isEnabled` を持つ。一方で `SkillWizardScheduleConfig` は、ウィザードの Q3 で使う入力契約に絞っており、`cronExpression` と `timezone` だけを持つ。用途が違うので、名前も責務も分けている。

### `SmartDefaultResult` と q1〜q6 の対応

| フィールド | 対応先 | 意味                     |
| ---------- | ------ | ------------------------ |
| `who`      | q1     | 誰向けのスキルか         |
| `input`    | q2     | 何を入力として受け取るか |
| `timing`   | q3     | いつ動かすか             |
| `output`   | q4     | どこへ出すか             |
| `tool`     | q5     | 何と連携するか           |
| `format`   | q6     | どの形式で出すか         |

### `ConversationAnswers` と `QuestionAnswer` の関係

`QuestionAnswer` は 1 問分の共通形で、`selectedOption` と `freeText` を持つ。`ConversationAnswers` はその `QuestionAnswer` を q1〜q6 で並べた箱であり、Q3 だけは `scheduleConfig` を追加で持てる。

### 公開経路と衝突回避

追加型の公開経路は `@repo/shared/types/skillCreator` だけにしている。root の `@repo/shared` には載せない。理由は、`packages/shared/src/types/skill.ts` に既存の別概念の `SkillCategory` があり、root へ広げると名前衝突や import の混乱が起きるため。

### エッジケース

1. `SkillInfoFormData.skillName` は任意なので、未入力のままでも構築できる。
2. `SkillInfoFormData.category` は `null` で未選択を表す。
3. `QuestionAnswer.scheduleConfig` は Q3 以外では未設定のままでもよい。
4. UI 変更はないため、今回は screenshot ベースの検証は不要。

### 設定可能なパラメータと定数

| 項目               | 値                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------- |
| `SkillCategory`    | `automation` / `external-integration` / `data-analysis` / `code-support` / `other` |
| `generationMethod` | `complete` / `skip`                                                                |
| `timezone`         | 例: `Asia/Tokyo`                                                                   |
| `cronExpression`   | 例: `0 9 * * 1-5`                                                                  |

## まとめ

今回の変更は、スキル作成の入口・会話・推論・フィードバックを、同じ箱のラベルでそろえるための基盤整備である。型を先に固定したことで、後続 wave は同じ契約を見ながら実装できる。
