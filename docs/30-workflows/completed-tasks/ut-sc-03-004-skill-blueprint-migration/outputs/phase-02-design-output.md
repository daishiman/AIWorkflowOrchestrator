# Phase 2: 設計書 -- SkillBlueprint 型移行

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| 機能名     | ut-sc-03-004-skill-blueprint-migration |
| タスクID   | UT-SC-03-004                           |
| 作成日     | 2026-03-24                             |
| 更新日     | 2026-03-24                             |
| ステータス | 完了                                   |

---

## 1. 設計方針: Superset 方式（extends SkillBlueprint）

### 1.1 方針概要

`RuntimeSkillCreatorPlanResult` を `SkillBlueprint` の Superset として設計する。`extends SkillBlueprint` により、w3a（SkillFileWriter）は `RuntimeSkillCreatorPlanResult` を `SkillBlueprint` 型として直接受け取れる（キャストなし）。

```
SkillBlueprint（基底型: スキル構造定義）
  +-- skillName
  +-- description
  +-- category
  +-- customizations
  +-- files
  +-- reasoning

RuntimeSkillCreatorPlanResult extends SkillBlueprint（拡張型: plan 固有情報）
  +-- [SkillBlueprint の全フィールドを継承]
  +-- planId          <- メタ情報
  +-- skillSpec       <- メタ情報
  +-- estimatedSteps  <- @deprecated（files.length で代替）
  +-- agents          <- 後方互換のため保持
  +-- scripts         <- 後方互換のため保持
  +-- triggers        <- plan 固有情報
  +-- anchors         <- plan 固有情報
```

### 1.2 方針選定理由

- 後方互換性: 既存の9フィールドを全て保持するため、Renderer 側の既存コードに影響なし
- 型安全性: `extends` による構造的部分型により、キャストなしで SkillBlueprint として使用可能（P19 回避）
- 段階的移行: 既存コードを一切壊さずに新フィールドを追加可能

---

## 2. 新規型定義

### Task 1: SkillBlueprint 関連型の追加設計

配置先: `packages/shared/src/types/skillCreator.ts`

```typescript
// --- SkillBlueprint 関連型（正本 index.md L268-316 準拠） ---

/** テンプレートカテゴリ（正本 index.md L268-273） */
export type SkillCategory =
  | "simple"
  | "standard"
  | "complex"
  | "automation"
  | "integration";

/** カテゴリごとのベース構造テンプレート */
export interface CategoryTemplate {
  dirs: string[];
  desc: string;
}

/** 生成予定ファイル（正本 index.md L313-316） */
export interface PlannedFile {
  path: string; // "agents/analyze-pr.md"
  purpose: string; // "PR分析のLLM Task仕様書"
}

/** plan() の出力型（正本 index.md L297-311 準拠） */
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

### Task 2: CATEGORY_TEMPLATES 定数の配置設計

配置先: `packages/shared/src/types/skillCreator.ts`（型定義に隣接）

```typescript
/** カテゴリテンプレート定数（正本 index.md L276-294） */
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

**配置判断**: 型定義ファイルに定数を配置する理由は、`SkillCategory` と `CATEGORY_TEMPLATES` が密結合であり、型と定数を分離すると型の値セットとテンプレートの対応関係が乖離するリスクがあるため。

---

## 3. RuntimeSkillCreatorPlanResult 拡張設計

### Task 3: extends SkillBlueprint

```typescript
/**
 * Runtime plan 結果
 * SkillBlueprint を extends し、plan 固有のメタ情報を追加する。
 * w3a（SkillFileWriter）は SkillBlueprint として受け取れる。
 */
export interface RuntimeSkillCreatorPlanResult extends SkillBlueprint {
  /** 計画一意識別子（plan-{timestamp} 形式） */
  planId: string;
  /** ユーザーが入力したスキル仕様テキスト（原文保持） */
  skillSpec: string;
  /**
   * 推定ステップ数
   * @deprecated files.length で代替可能。後方互換のため残す。
   */
  estimatedSteps: number;
  /** エージェント一覧（後方互換のため SkillBlueprint.files とは別途保持） */
  agents: Array<{ name: string; role: string }>;
  /** スクリプト一覧（後方互換のため SkillBlueprint.files とは別途保持） */
  scripts: Array<{ name: string; purpose: string }>;
  /** スキル起動トリガー（SkillBlueprint に不在、plan 固有情報） */
  triggers: string[];
  /** スキルが依存する知識ソース（SkillBlueprint に不在、plan 固有情報） */
  anchors: string[];
}
```

**設計判断**:

- `skillName` と `description` は SkillBlueprint から継承されるため、RuntimeSkillCreatorPlanResult での重複定義を削除する
- `estimatedSteps` に `@deprecated` JSDoc を追加（`files.length` で代替可能だが後方互換のため保持）
- `agents` / `scripts` は `files` と重複するが、後方互換のため別途保持する

---

## 4. LLM レスポンススキーマ拡張設計

### Task 4: PLAN_RESPONSE_SCHEMA_INSTRUCTION の拡張

`planPromptConstants.ts` の JSON スキーマに新フィールドを追加する:

```json
{
  "skillName": "string - kebab-case name for the skill (e.g., 'github-issue-classifier')",
  "description": "string - one-line description of what the skill does",
  "category": "string - one of: simple, standard, complex, automation, integration",
  "customizations": {
    "additionalDirectories": [
      "string[] - extra dirs beyond category template (optional)"
    ],
    "additionalFiles": [
      {
        "path": "string - relative path",
        "purpose": "string - what this file does"
      }
    ],
    "excludedDefaults": ["string[] - template defaults to exclude (optional)"]
  },
  "files": [
    {
      "path": "string - relative path like agents/foo.md",
      "purpose": "string - what this file does"
    }
  ],
  "reasoning": "string - why this category and structure was chosen",
  "agents": [
    {
      "name": "string - agent file name without extension",
      "role": "string - what this agent does in the workflow"
    }
  ],
  "scripts": [
    {
      "name": "string - script file name",
      "purpose": "string - what this script automates"
    }
  ],
  "triggers": ["string - when/how the skill is activated"],
  "anchors": ["string - knowledge sources the skill depends on"]
}
```

**Rules に追加する制約**:

```
- category must be one of: simple, standard, complex, automation, integration
- files array must list ALL files to be generated (agents + scripts + SKILL.md + others)
- Each file entry must have non-empty path and purpose
- reasoning must explain why this category was chosen
- customizations is optional; omit if no customizations needed
```

---

## 5. parsePlanResponse() 拡張設計

### Task 5: パーサーの更新

#### 5.1 LLMPlanResponse 型の拡張

```typescript
interface LLMPlanResponse {
  // 既存フィールド
  skillName: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
  // 新規フィールド（Graceful degradation 対応のため optional）
  category?: SkillCategory;
  customizations?: {
    additionalDirectories?: string[];
    additionalFiles?: PlannedFile[];
    excludedDefaults?: string[];
  };
  files?: PlannedFile[];
  reasoning?: string;
}
```

#### 5.2 isValidPlanResponse() の拡張

既存バリデーション（skillName, description, agents, scripts, triggers, anchors）に加え、新フィールドのバリデーションを追加する。新フィールドは **条件付きバリデーション**（存在する場合のみ検証）とする:

```typescript
// category: 存在する場合、SkillCategory の値セットに含まれるか検証
if ("category" in value) {
  const validCategories: string[] = [
    "simple",
    "standard",
    "complex",
    "automation",
    "integration",
  ];
  if (
    typeof value.category !== "string" ||
    !validCategories.includes(value.category)
  ) {
    return false;
  }
}

// files: 存在する場合、PlannedFile[] 型チェック
if ("files" in value) {
  if (!Array.isArray(value.files)) return false;
  if (!value.files.every(isValidPlannedFileEntry)) return false;
}

// customizations: 存在する場合、オブジェクト型チェック
if ("customizations" in value) {
  if (value.customizations == null || typeof value.customizations !== "object")
    return false;
  // additionalFiles の各要素を PlannedFile として検証
  if (
    "additionalFiles" in value.customizations &&
    Array.isArray(value.customizations.additionalFiles)
  ) {
    if (!value.customizations.additionalFiles.every(isValidPlannedFileEntry))
      return false;
  }
}

// reasoning: 存在する場合、非空文字列チェック
if ("reasoning" in value) {
  if (typeof value.reasoning !== "string") return false;
}
```

#### 5.3 isValidPlannedFileEntry() ヘルパー追加

```typescript
function isValidPlannedFileEntry(entry: unknown): entry is PlannedFile {
  return (
    entry != null &&
    typeof entry === "object" &&
    "path" in entry &&
    typeof entry.path === "string" &&
    entry.path.trim() !== "" &&
    "purpose" in entry &&
    typeof entry.purpose === "string" &&
    entry.purpose.trim() !== ""
  );
}
```

P42 準拠: `path` と `purpose` の両方に `.trim() !== ""` の3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）を適用。

#### 5.4 Graceful degradation（デフォルト値）

LLM が新フィールドを返さない場合のデフォルト値:

| フィールド       | デフォルト値                              | 理由                           |
| ---------------- | ----------------------------------------- | ------------------------------ |
| `category`       | `"standard"`                              | 最も一般的なカテゴリ           |
| `customizations` | `{}`                                      | カスタマイズなし               |
| `files`          | agents + scripts から自動生成（下記参照） | 既存データから復元可能         |
| `reasoning`      | `""`                                      | 空文字列（情報不足のため省略） |

**files の自動生成ロジック**:

```typescript
// agents と scripts から PlannedFile[] を自動生成
const autoFiles: PlannedFile[] = [
  ...parsed.agents.map((a) => ({
    path: `agents/${a.name}.md`,
    purpose: a.role,
  })),
  ...parsed.scripts.map((s) => ({
    path: `scripts/${s.name}`,
    purpose: s.purpose,
  })),
];
```

---

## 6. plan() 戻り値構築の更新設計

### Task 6: 通常経路（L154-164）の更新

```typescript
// レスポンスパース
const parsed = parsePlanResponse(response.content);

// Graceful degradation: 新フィールドのデフォルト値
const category: SkillCategory = parsed.category ?? "standard";
const customizations = parsed.customizations ?? {};
const files: PlannedFile[] = parsed.files ?? [
  ...parsed.agents.map((a) => ({
    path: `agents/${a.name}.md`,
    purpose: a.role,
  })),
  ...parsed.scripts.map((s) => ({
    path: `scripts/${s.name}`,
    purpose: s.purpose,
  })),
];
const reasoning = parsed.reasoning ?? "";

return {
  // SkillBlueprint フィールド
  skillName: parsed.skillName,
  description: parsed.description,
  category,
  customizations,
  files,
  reasoning,
  // メタ情報
  planId,
  skillSpec,
  estimatedSteps: files.length,
  // plan 固有情報（後方互換）
  agents: parsed.agents,
  scripts: parsed.scripts,
  triggers: parsed.triggers,
  anchors: parsed.anchors,
};
```

**変更点**:

- `estimatedSteps` の計算を `agents.length + scripts.length` から `files.length` に変更
- SkillBlueprint フィールド（category, customizations, files, reasoning）を追加
- Graceful degradation でデフォルト値を適用

### Task 6 補足: スタブ経路（L120-131）の更新

```typescript
return {
  // SkillBlueprint フィールド
  skillName: "",
  description: "",
  category: "standard" as SkillCategory,
  customizations: {},
  files: [],
  reasoning: "",
  // メタ情報
  planId,
  skillSpec,
  estimatedSteps: 3,
  // plan 固有情報
  agents: [],
  scripts: [],
  triggers: [],
  anchors: [],
};
```

---

## 7. Preload 型同期設計

### Task 7: 自動伝播の確認

#### 7.1 伝播経路

```
packages/shared/src/types/skillCreator.ts
  +-- RuntimeSkillCreatorPlanResult (extends SkillBlueprint)
  +-- RuntimeSkillCreatorPlanResponse (union 型)
        | import
apps/desktop/src/preload/skill-creator-api.ts
  +-- IpcResult<RuntimeSkillCreatorPlanResponse>
        | 型推論
apps/desktop/src/preload/types.ts
  +-- 再エクスポート確認
```

#### 7.2 確認項目

- `skill-creator-api.ts` の `planSkill()` 戻り値型 `IpcResult<RuntimeSkillCreatorPlanResponse>` は shared 型を参照しているため、型変更は自動伝播する
- `preload/types.ts` に `RuntimeSkillCreatorPlanResponse` の独自定義（再宣言）がないことを確認する
- P32 準拠: shared 型の変更後に `pnpm typecheck` で preload 側の型整合性を検証する

#### 7.3 期待結果

- Preload 側のコード変更は不要
- `pnpm typecheck` が PASS すること

---

## 8. 設計品質チェック

| 原則 | 適用結果                                                                         |
| ---- | -------------------------------------------------------------------------------- |
| SRP  | SkillBlueprint はスキル構造定義のみ。メタ情報（planId, skillSpec）は拡張型に分離 |
| DIP  | SkillBlueprint はインターフェース型。具象クラスへの依存なし                      |
| OCP  | 既存フィールドを削除せず、新フィールドを追加のみ（拡張に開く）                   |
| LSP  | RuntimeSkillCreatorPlanResult は SkillBlueprint のサブタイプとして使用可能       |

---

## 9. 完了条件チェック

- [x] SkillBlueprint, SkillCategory, PlannedFile, CategoryTemplate の全型定義を設計した
- [x] CATEGORY_TEMPLATES 定数の値と配置先を確定した
- [x] RuntimeSkillCreatorPlanResult の拡張方式（extends SkillBlueprint）を設計した
- [x] estimatedSteps の @deprecated 扱いを決定した
- [x] triggers/anchors の SkillBlueprint 外保持方針を決定した
- [x] LLM レスポンススキーマ（PLAN_RESPONSE_SCHEMA_INSTRUCTION）の拡張を設計した
- [x] parsePlanResponse() の新フィールドバリデーションを設計した
- [x] Graceful degradation（新フィールド未返却時のデフォルト値）を設計した
- [x] plan() メソッドの戻り値構築（通常経路 + スタブ経路）を更新設計した
- [x] Preload 型の同期計画を策定した（P32 対策）
