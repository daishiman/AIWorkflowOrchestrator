# Phase 12: 実装ガイド

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 12                                             |
| 作成日   | 2026-04-07                                     |

---

## Part 1: 中学生向け説明

### なぜこのサービスが必要か

スキルを作るウィザードでは、ユーザーが何度も同じ設定を手入力しなければなりませんでした。
「Slack と書いたのに毎回ツールを選び直す」「毎日実行と書いたのにタイミングを別途選択する」という手間が積み重なり、ウィザード体験が悪化していました。
このサービスはその**必要**な入力を自動補完することで、ユーザーの負担を解消します。

### この機能でできること

スキルを作るウィザードには、「スキル名」「目的」「カテゴリ」を入力する画面があります。
このサービスは、ユーザーが入力した「目的」と「カテゴリ」を読み取り、AI のおすすめ設定を**自動で予測**する機能です。

たとえば「目的に Slack と書いてあれば、使うツールは自動で slack にする」
「毎日・毎週・定期という言葉があれば、実行タイミングは自動でスケジュール実行にする」という感じです。
ユーザーが毎回同じことを入力する手間を省くことが目的です。

### 今回作ったもの

| 成果物                                           | 概要                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `smartDefaultReasoningService.ts`                | 規則ベース推論サービス本体（`inferSmartDefaults` 関数）          |
| `__tests__/smartDefaultReasoningService.test.ts` | ユニットテスト 33 件                                             |
| `src/services/skillCreator/index.ts`             | バレルエクスポート                                               |
| `packages/shared/index.ts` の更新                | `inferSmartDefaults` を `@repo/shared` root export に追加        |
| `packages/shared/src/types/index.ts` の更新      | `SkillInfoFormData` / `SmartDefaultResult` を root export に追加 |
| `packages/shared/vitest.config.ts` の更新        | `@repo/shared` alias 追加                                        |

### 具体例

| ユーザーが入力した「目的」 | 自動でおすすめされる設定             |
| -------------------------- | ------------------------------------ |
| 毎日 Slack に通知を送る    | ツール: slack、タイミング: scheduled |
| リアルタイムで通知する     | タイミング: realtime                 |
| GitHubのPRをレビューする   | ツール: github                       |
| （何も特徴がない文章）     | 全項目 null（空欄）                  |

カテゴリを「コードサポート（code-support）」にすると、出力形式が自動で「code」になります。

### 専門用語の説明

| 用語               | 意味                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| 推論（inference）  | 入力テキストから答えを予測すること                                     |
| フォールバック     | 推論できなかった場合の「安全なデフォルト動作」                         |
| inferenceLog       | 「なぜこの値を選んだか」の理由を記録するリスト                         |
| SmartDefaultResult | 推論結果を格納する型（データの入れ物）                                 |
| 先勝ちルール       | 複数のキーワードが含まれる場合、最初に一致したものだけを採用するルール |

### どこに置かれているか？

サービス本体は `packages/shared/` という共有ライブラリの中にあります。
`@repo/shared` という名前でインポートして使います。

---

## Part 2: 技術者向け説明

### 変更概要

`packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` を新規作成し、
`inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult` 関数を実装した。
W0-seq-01 で定義済みの型を利用し、規則ベースのキーワードマッチング推論を実装している。
`SkillInfoFormData` / `SmartDefaultResult` は `@repo/shared` の root export と `@repo/shared/types` の両方で利用できる。

### TypeScript 型定義

```typescript
// W0-seq-01 で定義済み (packages/shared/src/types/skillCreator.ts)
// root export / subpath export へ同期済み。

export interface SkillInfoFormData {
  skillName?: string;
  purpose: string; // 推論の主入力（ツール・タイミング推論に使用）
  category: SkillCategory | null; // フォーマット推論に使用
}

export type SkillCategory =
  | "automation"
  | "external-integration"
  | "data-analysis"
  | "code-support"
  | "other";

export interface SmartDefaultResult {
  who: string | null;
  input: string | null;
  timing: string | null; // "scheduled" | "realtime" | null
  output: string | null;
  tool: string | null; // "slack" | "github" | "notion" | null
  format: string | null; // "code" | "structured" | null
  inferenceLog?: string[]; // 推論根拠ログ
}
```

### APIシグネチャ

```typescript
/**
 * ユーザー入力（SkillInfoFormData）からスマートデフォルト推論結果を生成する
 * @param input - スキル情報フォームデータ
 * @returns 推論結果（推論不能フィールドは null）
 */
export function inferSmartDefaults(
  input: SkillInfoFormData,
): SmartDefaultResult;
```

### 使用例

```typescript
// @repo/shared からインポート（W2-seq-03a: SkillCreateWizard.tsx 等で使用）
import { inferSmartDefaults, type SkillInfoFormData } from "@repo/shared";

const formData: SkillInfoFormData = {
  skillName: "Slack通知スキル",
  purpose: "毎日Slackに進捗を通知する",
  category: "automation",
};

const result = inferSmartDefaults(formData);
// result.tool    === "slack"
// result.timing  === "scheduled"
// result.format  === null
// result.inferenceLog === [
//   "purpose に 'Slack' を検出 → tool = 'slack'",
//   "定期実行キーワードを検出 → timing = 'scheduled'",
// ]
```

### 推論ルール詳細

#### ツール推論（purpose キーワードマッチ）

| キーワード | 推論結果          | マッチ方式                     |
| ---------- | ----------------- | ------------------------------ |
| "Slack"    | `tool = "slack"`  | includes（大文字小文字を区別） |
| "GitHub"   | `tool = "github"` | includes                       |
| "Notion"   | `tool = "notion"` | includes                       |

複数キーワードが含まれる場合は**先勝ちルール**（TOOL_KEYWORDS 配列の先頭から評価）。

#### タイミング推論（purpose 正規表現マッチ）

| パターン                           | 推論結果               | 備考                                 |
| ---------------------------------- | ---------------------- | ------------------------------------ |
| `/毎日\|毎週\|定期\|スケジュール/` | `timing = "scheduled"` | scheduled パターンを先に判定する     |
| `/リアルタイム\|即座\|すぐに/`     | `timing = "realtime"`  | scheduled に非該当の場合のみ判定する |

scheduled パターンが先に評価される（先勝ちルール）。

#### フォーマット推論（category 一致）

| category 値       | 推論結果                |
| ----------------- | ----------------------- |
| `"code-support"`  | `format = "code"`       |
| `"data-analysis"` | `format = "structured"` |
| その他 / null     | `format = null`         |

### 設定項目と定数一覧

```typescript
// smartDefaultReasoningService.ts 内に定義
const TOOL_KEYWORDS: Array<{
  keyword: string;
  tool: NonNullable<SmartDefaultResult["tool"]>;
}> = [
  { keyword: "Slack", tool: "slack" },
  { keyword: "GitHub", tool: "github" },
  { keyword: "Notion", tool: "notion" },
];

const SCHEDULED_PATTERN = /毎日|毎週|定期|スケジュール/;
const REALTIME_PATTERN = /リアルタイム|即座|すぐに/;
```

新しいツールやタイミングパターンを追加する場合は、これらの定数を編集する。

### エラーハンドリング

フォールバック設計: 推論できなかったフィールドは `null` を返し、例外は送出しない。

### エッジケース

| シナリオ                              | 挙動                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `purpose` が `null`                   | `normalizePurpose()` で空文字に変換 → ツール/タイミング推論は全て null |
| `purpose` が `undefined`              | 同上                                                                   |
| `purpose` が空文字 `""`               | ツール/タイミング推論は null（category 推論は独立して継続）            |
| `purpose` が空白のみ `"   "`          | `trim()` 後に空文字として扱う → ツール/タイミング推論は null           |
| `category` が `null` / `undefined`    | `format = null`                                                        |
| 複数ツールキーワードが含まれる        | 先に一致したキーワードのみ採用                                         |
| 推論結果が0件                         | `inferenceLog = []`（エラーにならない）                                |
| `who` / `input` / `output` フィールド | 常に `null`（本タスクスコープ外）                                      |

### バレルエクスポート構成

```
packages/shared/
├── index.ts                              ← export { inferSmartDefaults }
└── src/services/skillCreator/
    ├── index.ts                          ← export { inferSmartDefaults }
    └── smartDefaultReasoningService.ts   ← 実装本体
```

### テスト構成

| テストファイル                                                             | 件数 | 概要                                             |
| -------------------------------------------------------------------------- | ---- | ------------------------------------------------ |
| `src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 33   | 推論サービス全テスト（PASS 確認済み 2026-04-07） |

```bash
# 単体テスト実行（`packages/shared` 直下で実行する）
cd packages/shared && pnpm exec vitest run src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts

# カバレッジ付き（全スイート）
cd packages/shared && pnpm exec vitest run --coverage
```

テスト件数: 33件、全件 PASS（2026-04-07 確認済み）
