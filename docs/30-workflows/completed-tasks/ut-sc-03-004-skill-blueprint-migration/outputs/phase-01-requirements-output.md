# Phase 1: 要件定義書 -- SkillBlueprint 型移行

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| 機能名     | ut-sc-03-004-skill-blueprint-migration |
| タスクID   | UT-SC-03-004                           |
| 作成日     | 2026-03-24                             |
| 更新日     | 2026-03-24                             |
| ステータス | 完了                                   |

---

## 1. 現行 RuntimeSkillCreatorPlanResult 調査結果

### 1.1 型定義（packages/shared/src/types/skillCreator.ts L327-337）

```typescript
export interface RuntimeSkillCreatorPlanResult {
  planId: string;
  skillSpec: string;
  estimatedSteps: number;
  skillName: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
}
```

### 1.2 各フィールドの用途

| フィールド       | 型                                         | 用途                                                   |
| ---------------- | ------------------------------------------ | ------------------------------------------------------ |
| `planId`         | `string`                                   | 計画一意識別子（`plan-{timestamp}` 形式）              |
| `skillSpec`      | `string`                                   | ユーザーが入力したスキル仕様テキスト（原文保持）       |
| `estimatedSteps` | `number`                                   | 推定ステップ数（現行: agents.length + scripts.length） |
| `skillName`      | `string`                                   | スキル名（kebab-case）                                 |
| `description`    | `string`                                   | スキルの1行説明                                        |
| `agents`         | `Array<{ name: string; role: string }>`    | LLM Task 仕様書の一覧（名前と役割）                    |
| `scripts`        | `Array<{ name: string; purpose: string }>` | 自動化スクリプトの一覧（名前と目的）                   |
| `triggers`       | `string[]`                                 | スキル起動トリガー                                     |
| `anchors`        | `string[]`                                 | スキルが依存する知識ソース                             |

### 1.3 plan() 戻り値生成部分（RuntimeSkillCreatorFacade.ts L154-164）

通常経路（integrated_api）では LLM レスポンスをパースし、以下の形式で返却する:

```typescript
return {
  planId,
  skillSpec,
  estimatedSteps: parsed.agents.length + parsed.scripts.length,
  skillName: parsed.skillName,
  description: parsed.description,
  agents: parsed.agents,
  scripts: parsed.scripts,
  triggers: parsed.triggers,
  anchors: parsed.anchors,
};
```

### 1.4 スタブ経路（RuntimeSkillCreatorFacade.ts L120-131）

`llmAdapter` または `resourceLoader` が未注入の場合、Graceful degradation としてスタブ値を返す:

```typescript
return {
  planId,
  skillSpec,
  estimatedSteps: 3,
  skillName: "",
  description: "",
  agents: [],
  scripts: [],
  triggers: [],
  anchors: [],
};
```

### 1.5 parsePlanResponse() パースロジック（RuntimeSkillCreatorFacade.ts L400-471）

- `stripMarkdownCodeBlock()` で Markdown コードブロックを除去
- `JSON.parse()` でパース
- `isValidPlanResponse()` でバリデーション（P42 準拠 3段バリデーション適用済み）
- 現行バリデーション対象: `skillName`, `description`, `agents[]`, `scripts[]`, `triggers[]`, `anchors[]`

### 1.6 LLM レスポンススキーマ（planPromptConstants.ts L22-49）

現行スキーマは `skillName`, `description`, `agents[]`, `scripts[]`, `triggers[]`, `anchors[]` の6フィールドのみを定義している。SkillBlueprint 固有の `category`, `customizations`, `files`, `reasoning` は含まれていない。

---

## 2. 正本 SkillBlueprint 型要件（index.md L297-311）

### 2.1 SkillBlueprint 型定義

```typescript
interface SkillBlueprint {
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

### 2.2 SkillCategory 型（index.md L268-273）

```typescript
type SkillCategory =
  | "simple"
  | "standard"
  | "complex"
  | "automation"
  | "integration";
```

### 2.3 PlannedFile 型（index.md L313-316）

```typescript
interface PlannedFile {
  path: string; // "agents/analyze-pr.md"
  purpose: string; // "PR分析のLLM Task仕様書"
}
```

### 2.4 CATEGORY_TEMPLATES 定数（index.md L276-294）

```typescript
const CATEGORY_TEMPLATES: Record<SkillCategory, CategoryTemplate> = {
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

### 2.5 SkillFileWriter.create() の入力型契約（index.md L343-347）

```typescript
class SkillFileWriter {
  async create(
    skillName: string,
    blueprint: SkillBlueprint,
    contents: Map<string, string>,
  ): Promise<SkillWriteResult>;
}
```

---

## 3. 型ギャップ分析

### 3.1 フィールドマッピング

| RuntimeSkillCreatorPlanResult | SkillBlueprint        | 対応状況              | 備考                                    |
| ----------------------------- | --------------------- | --------------------- | --------------------------------------- |
| `skillName`                   | `skillName`           | 直接対応              | 型・意味ともに一致                      |
| `description`                 | `description`         | 直接対応              | 型・意味ともに一致                      |
| `agents[]`                    | `files[]`（agents/）  | 変換可能              | agents から PlannedFile への変換が必要  |
| `scripts[]`                   | `files[]`（scripts/） | 変換可能              | scripts から PlannedFile への変換が必要 |
| `triggers[]`                  | --                    | SkillBlueprint に不在 | plan 固有情報として保持                 |
| `anchors[]`                   | --                    | SkillBlueprint に不在 | plan 固有情報として保持                 |
| `planId`                      | --                    | SkillBlueprint に不在 | メタ情報として保持                      |
| `skillSpec`                   | --                    | SkillBlueprint に不在 | メタ情報として保持                      |
| `estimatedSteps`              | --                    | 代替可能              | `files.length` で代替可能               |
| --                            | `category`            | **新規追加必須**      | SkillCategory（5値）                    |
| --                            | `customizations`      | **新規追加必須**      | additionalDirs/Files/excludedDefaults   |
| --                            | `files`               | **新規追加必須**      | PlannedFile[]（全ファイルの統合リスト） |
| --                            | `reasoning`           | **新規追加必須**      | カテゴリ・構造選択の理由                |

### 3.2 ギャップサマリ

- **直接対応**: `skillName`, `description`（2フィールド）
- **新規追加必須**: `category`, `customizations`, `files`, `reasoning`（4フィールド）
- **SkillBlueprint に不在**: `triggers`, `anchors`, `planId`, `skillSpec`（plan 固有情報として保持）
- **代替可能**: `estimatedSteps` は `files.length` で代替可能（@deprecated 扱い）

---

## 4. 影響範囲

### 4.1 変更が必要なファイル

| ファイル                                                              | 変更内容                                                                                                                            | 優先度 |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `packages/shared/src/types/skillCreator.ts`                           | SkillBlueprint, SkillCategory, PlannedFile, CategoryTemplate 型追加、RuntimeSkillCreatorPlanResult を extends SkillBlueprint に変更 | 必須   |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan() 戻り値構築更新、parsePlanResponse() 拡張、LLMPlanResponse 型拡張、isValidPlanResponse() 拡張                                 | 必須   |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | PLAN_RESPONSE_SCHEMA_INSTRUCTION に新フィールド（category, customizations, files, reasoning）を追加                                 | 必須   |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | shared 型変更により IpcResult<RuntimeSkillCreatorPlanResponse> 経由で自動伝播                                                       | 確認   |
| `apps/desktop/src/preload/types.ts`                                   | P32 準拠: RuntimeSkillCreatorPlanResponse の再エクスポート同期確認                                                                  | 確認   |
| 既存テストファイル                                                    | アサーション更新（新フィールドのデフォルト値追加）                                                                                  | 必須   |

### 4.2 Pitfall 対応

| Pitfall | 内容                       | 対応方針                                         |
| ------- | -------------------------- | ------------------------------------------------ |
| P23     | API 二重定義の型管理       | shared 型を正本とし、preload は自動伝播で対応    |
| P32     | 型定義の二箇所同時更新     | shared 型変更後に preload/types.ts の同期を確認  |
| P42     | .trim() 3段バリデーション  | 新フィールドの isValidPlanResponse() に適用      |
| P44/P45 | IPC インターフェース不整合 | IPC チャンネル・引数形式は変更なし（型変更のみ） |

---

## 5. 後方互換性要件

### 5.1 RuntimeSkillCreatorPlanResponse union 型

```typescript
type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult // 通常経路
  | { type: "terminal_handoff"; guidance: TerminalHandoffGuidance }; // handoff 経路
```

- union 型自体は変更なし
- `RuntimeSkillCreatorPlanResult` のフィールド拡張（新フィールド追加）のみ
- terminal_handoff 経路は影響なし

### 5.2 既存フィールドアクセス

- Renderer 側が `result.data.skillName`, `result.data.description` 等の既存フィールドを参照している箇所は、extends SkillBlueprint 方式により全て保持される
- `estimatedSteps` は @deprecated 扱いとするが、フィールド自体は残す

### 5.3 Preload 側

- `planSkill()` の戻り値型 `IpcResult<RuntimeSkillCreatorPlanResponse>` は変更なし
- shared 型の変更が自動伝播するため、preload/types.ts の再エクスポートに変更は不要

---

## 6. triggers / anchors の扱い

### 6.1 決定事項

- **SkillBlueprint には含めない**: triggers / anchors は plan 固有の情報であり、SkillBlueprint の責務（スキル構造の定義）には含まれない
- **RuntimeSkillCreatorPlanResult で別途保持**: `extends SkillBlueprint` により SkillBlueprint フィールドを継承しつつ、triggers / anchors は拡張型で保持する

### 6.2 根拠

- 正本 index.md の SkillBlueprint 定義（L297-311）に triggers / anchors は含まれていない
- SkillFileWriter.create() は SkillBlueprint を入力として受け取る設計であり、triggers / anchors は不要
- triggers / anchors は実行時のコンテキスト情報であり、ファイル構造の定義とは関心が異なる

---

## 7. w3a 型契約

### 7.1 SkillFileWriter.create() の入力型

正本 index.md L343-347 の設計:

```typescript
async create(
  skillName: string,
  blueprint: SkillBlueprint,
  contents: Map<string, string>,
): Promise<SkillWriteResult>;
```

### 7.2 型の流れ（plan -> execute -> persist パイプライン）

```
plan() -> RuntimeSkillCreatorPlanResult (extends SkillBlueprint)
  |
execute() -> SkillBlueprint として参照（キャストなし）
  |
SkillFileWriter.create(skillName, blueprint, contents)
  |
SkillWriteResult
```

- `RuntimeSkillCreatorPlanResult` は `extends SkillBlueprint` であるため、`SkillBlueprint` 型の引数にキャストなしで渡せる
- 型安全性が保証され、P19（型キャストバイパス）を回避できる

---

## 8. 完了条件チェック

- [x] RuntimeSkillCreatorPlanResult の全フィールドとその用途を文書化した
- [x] SkillBlueprint 型の全フィールドと正本定義を文書化した
- [x] 両型のフィールドマッピング（直接対応/変換必要/新規追加）を確定した
- [x] 影響範囲（変更が必要な全ファイル）を特定した
- [x] 後方互換性要件（RuntimeSkillCreatorPlanResponse / Renderer 参照箇所）を確認した
- [x] w3a SkillFileWriter との型契約を確定した
- [x] triggers / anchors フィールドの扱い（SkillBlueprint に含めず、plan 固有情報として保持）を決定した
