# ディレクトリ構成設計書

## メタ情報

| 項目     | 内容          |
| -------- | ------------- |
| タスクID | TASK-2A       |
| フェーズ | Phase 2: 設計 |
| 作成日   | 2026-01-24    |
| 機能名   | SkillScanner  |

---

## 1. 実装ファイル配置

### 1.1 ディレクトリ構造

```
apps/desktop/src/main/services/skill/
├── SkillScanner.ts              # メインクラス実装
├── index.ts                      # バレルエクスポート
├── __tests__/
│   └── SkillScanner.test.ts     # ユニットテスト
└── __fixtures__/                 # テスト用フィクスチャ
    ├── aiworkflow-skills/        # ~/.aiworkflow/skills/ 相当
    │   ├── valid-skill/
    │   │   ├── SKILL.md
    │   │   ├── agents/
    │   │   │   └── task-1.md
    │   │   ├── references/
    │   │   │   └── guide.md
    │   │   ├── scripts/
    │   │   │   └── helper.sh
    │   │   └── EVALS.json
    │   ├── minimal-skill/
    │   │   └── SKILL.md
    │   └── empty-subdirs-skill/
    │       └── SKILL.md
    ├── claude-skills/            # ~/.claude/skills/ 相当
    │   └── readonly-skill/
    │       ├── SKILL.md
    │       └── references/
    │           └── doc.md
    └── invalid-skills/           # 異常系テスト用
        ├── no-skill-md/
        │   └── README.md
        ├── malformed-yaml/
        │   └── SKILL.md
        ├── no-name-field/
        │   └── SKILL.md
        └── empty-skill-md/
            └── SKILL.md
```

---

## 2. ファイル詳細

### 2.1 SkillScanner.ts

**役割**: SkillScanner クラスの実装

**依存関係**:

```typescript
import * as fs from "fs/promises";
import * as path from "path";
import * as yaml from "yaml";
import type {
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile,
} from "@repo/shared";
```

**エクスポート**:

```typescript
export interface ScannedSkillMetadata extends SkillMetadata {
  readonly: boolean;
}

export class SkillScanner {
  // ...
}
```

---

### 2.2 index.ts

**役割**: バレルエクスポート

**内容**:

```typescript
export { SkillScanner, type ScannedSkillMetadata } from "./SkillScanner";
```

---

### 2.3 SkillScanner.test.ts

**役割**: ユニットテスト

**テスト構成**:

```typescript
describe("SkillScanner", () => {
  describe("scanAll()", () => {
    it("両ディレクトリのスキルを取得できる");
    it("aiworkflow スキルは readonly: false");
    it("claude スキルは readonly: true");
    it("存在しないディレクトリは空配列を返す");
  });

  describe("parseSkill()", () => {
    it("YAML Frontmatter を正しくパースする");
    it("name がない場合は null を返す");
    it("サブディレクトリを正しくスキャンする");
  });

  describe("エッジケース", () => {
    it("SKILL.md が存在しないスキルはスキップ");
    it("不正な YAML はスキップ");
    it("空の SKILL.md はスキップ");
  });

  describe("セキュリティ", () => {
    it("パストラバーサルを試みるスキル名はスキップ");
  });
});
```

---

## 3. テストフィクスチャ詳細

### 3.1 valid-skill/SKILL.md

```yaml
---
name: valid-skill
description: |
  有効なスキルのテスト用フィクスチャ。
  すべてのサブディレクトリを持つ。
allowed-tools:
  - Read
  - Write
  - Bash
---
# Valid Skill

テスト用の有効なスキルです。
```

### 3.2 valid-skill/agents/task-1.md

```markdown
# Task 1: テストタスク

タスクの説明文です。

## 手順

1. 手順1
2. 手順2
```

### 3.3 valid-skill/references/guide.md

```markdown
# リファレンスガイド

参照資料の内容です。
```

### 3.4 valid-skill/scripts/helper.sh

```bash
#!/bin/bash
echo "Helper script"
```

### 3.5 valid-skill/EVALS.json

```json
{
  "evaluations": []
}
```

---

### 3.6 minimal-skill/SKILL.md

```yaml
---
name: minimal-skill
description: 最小構成のスキル
---
# Minimal Skill

サブディレクトリを持たない最小構成のスキルです。
```

---

### 3.7 readonly-skill/SKILL.md

```yaml
---
name: readonly-skill
description: |
  Claude CLI スキル（読み取り専用）のテスト用。
allowed-tools:
  - Read
---
# Readonly Skill

このスキルは ~/.claude/skills/ に配置され、readonly: true となる。
```

---

### 3.8 異常系フィクスチャ

#### no-skill-md/README.md

```markdown
# No SKILL.md

このディレクトリには SKILL.md がありません。
スキルとして認識されないはずです。
```

#### malformed-yaml/SKILL.md

```yaml
---
name: malformed-skill
description: [invalid yaml
---

# Malformed

不正な YAML です。
```

#### no-name-field/SKILL.md

```yaml
---
description: name フィールドがない
---
# No Name

name フィールドがないスキルです。
```

#### empty-skill-md/SKILL.md

（空ファイル）

---

## 4. パッケージ依存関係

### 4.1 dependencies

```json
{
  "dependencies": {
    "yaml": "^2.4.0"
  }
}
```

### 4.2 devDependencies

```json
{
  "devDependencies": {
    "@types/node": "^20.x",
    "vitest": "^1.x"
  }
}
```

---

## 5. ビルド・テストコマンド

### 5.1 テスト実行

```bash
# 単体テスト
pnpm --filter @repo/desktop vitest run src/main/services/skill/__tests__/SkillScanner.test.ts

# カバレッジ付きテスト
pnpm --filter @repo/desktop vitest run --coverage src/main/services/skill/__tests__/SkillScanner.test.ts
```

### 5.2 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### 5.3 Lint

```bash
pnpm --filter @repo/desktop lint
```

---

## 6. インポートパス

### 6.1 内部からの利用

```typescript
// apps/desktop/src/main/services/ 内から
import { SkillScanner } from "./skill";

// apps/desktop/src/main/ 内から
import { SkillScanner } from "./services/skill";
```

### 6.2 型定義の参照

```typescript
import type {
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile,
} from "@repo/shared";
```

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
