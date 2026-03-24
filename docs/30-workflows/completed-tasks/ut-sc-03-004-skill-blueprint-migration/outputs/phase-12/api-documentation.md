# API ドキュメント

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 12                                     |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |

---

## 概要

本ドキュメントは UT-SC-03-004 タスクで追加・変更された型定義および定数の仕様を記述します。対象ファイルは主に `packages/shared/src/types/skillCreator.ts`（型定義の正本）です。

---

## SkillCategory 型

```typescript
export type SkillCategory =
  | "simple"
  | "standard"
  | "complex"
  | "automation"
  | "integration";
```

### 各値の説明

| 値              | 説明                            | dirs（CATEGORY_TEMPLATES）                                 |
| --------------- | ------------------------------- | ---------------------------------------------------------- |
| `"simple"`      | SKILL.md のみのシンプルなスキル | `[]`                                                       |
| `"standard"`    | LLM Task 仕様書 + 参照資料      | `["agents", "references"]`                                 |
| `"complex"`     | スクリプト + バリデーション付き | `["agents", "scripts", "references", "schemas"]`           |
| `"automation"`  | 自動化スクリプト + テンプレート | `["agents", "scripts", "assets"]`                          |
| `"integration"` | 外部連携 + フル構成             | `["agents", "scripts", "references", "schemas", "assets"]` |

---

## PlannedFile 型

```typescript
export interface PlannedFile {
  path: string;
  purpose: string;
}
```

### フィールド仕様

| フィールド | 型       | 必須 | 説明                                                             |
| ---------- | -------- | ---- | ---------------------------------------------------------------- |
| `path`     | `string` | 必須 | スキルルートからの相対パス（例: `agents/task-1.md`, `SKILL.md`） |
| `purpose`  | `string` | 必須 | このファイルの役割・目的                                         |

### 使用例

```typescript
const plannedFile: PlannedFile = {
  path: "agents/task-1.md",
  purpose: "LLM タスク仕様書",
};
```

---

## SkillBlueprint 型

```typescript
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
```

### フィールド仕様

| フィールド       | 型              | 必須 | 説明                                          |
| ---------------- | --------------- | ---- | --------------------------------------------- |
| `skillName`      | `string`        | 必須 | スキル識別名。ディレクトリ名として使用        |
| `description`    | `string`        | 必須 | スキルの説明文                                |
| `category`       | `SkillCategory` | 必須 | スキル分類。`CATEGORY_TEMPLATES` のキーと対応 |
| `customizations` | `object`        | 必須 | カスタマイズ設定。空 `{}` を許容              |
| `files`          | `PlannedFile[]` | 必須 | 生成予定のファイル一覧。空配列を許容          |
| `reasoning`      | `string`        | 必須 | この設計を選択した理由。空文字列を許容        |

### customizations フィールド詳細

| サブフィールド          | 型              | 説明                                   |
| ----------------------- | --------------- | -------------------------------------- |
| `additionalDirectories` | `string[]`      | テンプレート外の追加ディレクトリ       |
| `additionalFiles`       | `PlannedFile[]` | テンプレート外の追加ファイル           |
| `excludedDefaults`      | `string[]`      | テンプレートから除外するデフォルト項目 |

---

## CategoryTemplate 型

```typescript
export interface CategoryTemplate {
  dirs: string[];
  desc: string;
}
```

### フィールド仕様

| フィールド | 型         | 説明                               |
| ---------- | ---------- | ---------------------------------- |
| `dirs`     | `string[]` | カテゴリに含まれるディレクトリ一覧 |
| `desc`     | `string`   | カテゴリの説明文                   |

---

## CATEGORY_TEMPLATES 定数

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

---

## RuntimeSkillCreatorPlanResult 型

```typescript
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

### extends 構造の説明

`RuntimeSkillCreatorPlanResult` は `SkillBlueprint` を `extends` するため、全フィールドを継承します。

**継承されるフィールド（SkillBlueprint より）**:

| フィールド       | 型              |
| ---------------- | --------------- |
| `skillName`      | `string`        |
| `description`    | `string`        |
| `category`       | `SkillCategory` |
| `customizations` | `object`        |
| `files`          | `PlannedFile[]` |
| `reasoning`      | `string`        |

**追加フィールド（RuntimeSkillCreatorPlanResult 固有）**:

| フィールド       | 型                                         | 説明                             |
| ---------------- | ------------------------------------------ | -------------------------------- |
| `planId`         | `string`                                   | プランID                         |
| `skillSpec`      | `string`                                   | LLM が返したスキル仕様テキスト   |
| `estimatedSteps` | `number`                                   | (@deprecated) 見積もりステップ数 |
| `agents`         | `Array<{ name: string; role: string }>`    | エージェント定義一覧             |
| `scripts`        | `Array<{ name: string; purpose: string }>` | スクリプト定義一覧               |
| `triggers`       | `string[]`                                 | トリガー一覧                     |
| `anchors`        | `string[]`                                 | アンカー一覧                     |

### 型互換性

`RuntimeSkillCreatorPlanResult` は `SkillBlueprint` のサブタイプであるため、`SkillBlueprint` を要求する関数にそのまま渡せます。

```typescript
// SkillFileWriter は SkillBlueprint を受け取る（下流タスク w3a で実装予定）
function write(blueprint: SkillBlueprint): Promise<void> { ... }

// RuntimeSkillCreatorPlanResult は渡せる（構造的部分型）
const result: RuntimeSkillCreatorPlanResult = await facade.plan(prompt, authMode, apiKey);
await writer.write(result); // 型エラーなし
```

---

## Graceful Degradation ヘルパー関数

### isValidCategory(value: unknown): value is SkillCategory

`SkillCategory` の5値のいずれかであるかを検証する。

### isValidPlannedFileEntry(entry: unknown): entry is PlannedFile

`entry` が `{ path: string; purpose: string }` 構造であるかを `in` 演算子で検証する（P49準拠）。

### isValidFilesArray(value: unknown): value is PlannedFile[]

`Array.isArray` + 全要素の `isValidPlannedFileEntry` で検証する。

### isValidCustomizations(value: unknown): value is LLMPlanResponse["customizations"]

customizations オブジェクトの構造を検証する。

### generateFilesFromAgentsAndScripts(agents, scripts): PlannedFile[]

旧形式レスポンス（`files` フィールドなし）から `agents` と `scripts` の情報を使って `PlannedFile[]` を自動生成する。
