# 実装ガイド

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 12                                     |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |

---

## Part 1: 中学生レベル概念説明

### SkillBlueprint とは何か？「設計図」で考える

家を建てるとき、大工さんはまず「設計図」を描きます。設計図には次のことが書かれています。

- **家の名前**（「田中邸」） → `skillName`
- **家の種類**（一軒家？マンション？店舗？）→ `category`
- **部屋の一覧**（リビング、寝室、キッチンなど）→ `files`
- **なぜこの設計にしたか**（日当たりを考えてこの向きにした、など）→ `reasoning`
- **特別な注文**（「書斎を追加して」「ガレージは不要」）→ `customizations`

プログラムの世界でも同じです。「スキル」（AIが使える道具）を作るとき、まず **SkillBlueprint（設計図）** を描きます。

### 今回の変更でなにが変わったか？

**以前**: 設計図の情報がバラバラな場所に散らばっていた。後工程の担当者（SkillFileWriter）が必要な情報を探して回らなければならなかった。

**今回**: 設計図の情報を **1つの型（SkillBlueprint）にまとめて整理** した。

- すべての情報が1か所に揃っている
- 後工程（SkillFileWriter）が設計図を直接読めるようになった
- 「設計図を作る人（RuntimeSkillCreatorFacade）」と「設計図を使う人（SkillFileWriter）」が同じ言語で話せるようになった

### 型を「extends（拡張）」するとは？

設計図の基本版（SkillBlueprint）と、作業途中の詳細版（RuntimeSkillCreatorPlanResult）があります。

日常に例えると「基本の家の設計図」に「施工業者向けの追加メモ（工程ID、見積もり工数、作業員リストなど）」を足したようなものです。基本の設計図がそのまま使えるので、情報の重複がありません。

---

## Part 2: 開発者向け実装詳細

### 変更対象ファイル（8ファイル, +451行）

| ファイル                                    | 変更種別   | 内容                                                               |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts` | 型定義追加 | `SkillBlueprint`, `PlannedFile`, `SkillCategory` 等を追加 (+76行)  |
| `packages/shared/src/types/index.ts`        | barrel追加 | 新型の re-export を追加 (+9行)                                     |
| `RuntimeSkillCreatorFacade.ts`              | ロジック   | parsePlanResponse, 検証ヘルパー, Graceful degradation (+135行)     |
| `planPromptConstants.ts`                    | プロンプト | LLMに新フィールド返却を促すスキーマ指示 (+16行)                    |
| `creatorHandlers.ts`                        | IPC修正    | execute ハンドラの plan result に新フィールドデフォルト追加 (+4行) |
| `skillCreator.type.test.ts`                 | 新規テスト | 型互換テスト 9件                                                   |
| `RuntimeSkillCreatorFacade.plan.test.ts`    | テスト追加 | parsePlanResponse + Graceful degradation テスト 10件 (+206行)      |
| `RuntimeSkillCreatorFacade.test.ts`         | テスト修正 | stub パスのアサーション更新 (+8行)                                 |

### extends 方式の詳細

```typescript
// packages/shared/src/types/skillCreator.ts で定義

export type SkillCategory =
  | "simple"
  | "standard"
  | "complex"
  | "automation"
  | "integration";

export interface CategoryTemplate {
  dirs: string[];
  desc: string;
}

export interface PlannedFile {
  path: string;
  purpose: string;
}

export interface SkillBlueprint {
  skillName: string;
  description: string;
  category: SkillCategory;
  customizations: {
    additionalDirectories?: string[];
    additionalFiles?: PlannedFile[];
    excludedDefaults?: string[];
  };
  files: PlannedFile[];
  reasoning: string;
}

// RuntimeSkillCreatorPlanResult は SkillBlueprint を extends
export interface RuntimeSkillCreatorPlanResult extends SkillBlueprint {
  planId: string;
  skillSpec: string;
  /** @deprecated files.length で代替可能 */
  estimatedSteps: number;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
}
```

`extends` により:

- `RuntimeSkillCreatorPlanResult` は `SkillBlueprint` の全フィールドを自動的に持つ
- `SkillFileWriter` は `SkillBlueprint` 型を受け取れば `RuntimeSkillCreatorPlanResult` も受け取れる（リスコフの置換原則）
- 型の重複定義が排除される

### CATEGORY_TEMPLATES 定数

```typescript
export const CATEGORY_TEMPLATES: Record<SkillCategory, CategoryTemplate> = {
  simple: { dirs: [], desc: "SKILL.md のみ" },
  standard: {
    dirs: ["agents", "references"],
    desc: "LLM Task 仕様書 + 参照資料",
  },
  complex: {
    dirs: ["agents", "scripts", "references", "schemas"],
    desc: "スクリプト + バリデーション付き",
  },
  automation: {
    dirs: ["agents", "scripts", "assets"],
    desc: "自動化スクリプト + テンプレート",
  },
  integration: {
    dirs: ["agents", "scripts", "references", "schemas", "assets"],
    desc: "外部連携 + フル構成",
  },
};
```

### Graceful Degradation（旧形式LLMレスポンスへの対応）

LLMが新フィールド（category, files, reasoning, customizations）を返さない場合でもデフォルト値で処理を継続する。

```typescript
function parsePlanResponse(raw: LLMPlanResponse): LLMPlanResponse {
  return {
    ...raw,
    category: isValidCategory(raw.category) ? raw.category : "standard",
    customizations: isValidCustomizations(raw.customizations)
      ? raw.customizations
      : {},
    files: isValidFilesArray(raw.files)
      ? raw.files
      : generateFilesFromAgentsAndScripts(raw.agents, raw.scripts),
    reasoning: typeof raw.reasoning === "string" ? raw.reasoning : "",
  };
}
```

**重要**: `isValidPlanResponse()` がスキーマ検証を行い、フィールドが「存在するが不正な値」の場合はリジェクトする。`parsePlanResponse()` のデフォルト値適用は「フィールドが不在」の場合のみ。

### 型フロー全体像

```
LLM レスポンス (JSON)
       ↓ isValidPlanResponse() で構造検証
       ↓ parsePlanResponse() で Graceful degradation
       ↓
RuntimeSkillCreatorPlanResult (extends SkillBlueprint + plan固有メタ情報)
       ↓
SkillFileWriter.write(blueprint: SkillBlueprint)  ← 下流タスク w3a で実装予定
       ↓
実際のスキルファイル生成
```

`SkillFileWriter` は `SkillBlueprint` 型のみを要求するため、`RuntimeSkillCreatorPlanResult` をそのまま渡せます（構造的部分型）。
