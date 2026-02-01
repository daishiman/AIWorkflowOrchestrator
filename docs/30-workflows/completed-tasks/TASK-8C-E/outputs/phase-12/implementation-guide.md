# 実装ガイド: E2Eテストフィクスチャ (TASK-8C-E)

## Part 1: 初学者・中学生レベル

### これは何のためのもの？

テスト用フィクスチャは、料理のレシピを試す前に用意する「材料のサンプルセット」のようなものです。

本物の材料（本番で使うスキル）の代わりに、テスト用の材料（フィクスチャ）を使って料理（テスト）がうまくいくか確認します。

### なぜ必要なの？

アプリケーションには「スキル」という機能があります。スキルとは、AIに特定の作業をさせるための指示書のことです。

アプリがスキルを正しく読み込んで表示できるか確認するために、テスト専用の「お試しスキル」が必要です。本物のスキルは内容が変わる可能性があるため、テストには常に同じ内容の「決まった材料」を使いたいのです。

### 何を作ったの？

3種類のお試しスキルを用意しました：

1. **完全なスキル（test-skill）**: 指示書（SKILL.md）と、エージェント（お助け役）と参考資料がセットになった、フルセットのスキル
2. **シンプルなスキル（another-skill）**: 指示書だけの、最小限のスキル
3. **壊れたスキル（invalid-skill）**: わざと指示書を置かないことで、アプリが「これはスキルじゃないよ」と正しく判断できるか確認するためのもの

### どうやって使うの？

テスト（自動チェック）を実行すると、アプリがこれらのお試しスキルを読み込んで、正しく動くかどうか自動的にチェックしてくれます。

---

## Part 2: 開発者・技術者レベル

### フィクスチャ構造

```
apps/desktop/src/__tests__/__fixtures__/skills/
├── test-skill/
│   ├── SKILL.md              # 完全なスキル（Frontmatter + body + サブリソース）
│   ├── agents/
│   │   └── test-agent.md     # サブエージェント定義
│   └── references/
│       └── test-ref.md       # 参照資料
├── another-skill/
│   └── SKILL.md              # 最小構成スキル（Frontmatter + body のみ）
└── invalid-skill/
    └── README.md             # SKILL.md なし（SkillScanner がスキップ）
```

### 型定義: ScannedSkillMetadata

```typescript
interface ScannedSkillMetadata {
  name: string;
  description: string;
  allowedTools?: string[];
  path: string;
  updatedAt: Date;
  readonly: boolean;
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
  otherFiles: SkillOtherFile[];
}

interface SkillSubResource {
  filename: string;
  relativePath: string;
  description?: string;
  size: number;
}
```

### 使用例

```typescript
import * as path from "path";
import { SkillScanner } from "../../main/services/skill/SkillScanner";

const FIXTURES_DIR = path.join(__dirname, "..", "__fixtures__", "skills");

const scanner = new SkillScanner({
  aiworkflowSkillsDir: FIXTURES_DIR,
  claudeSkillsDir: "/non-existent-path",
});

const skills = await scanner.scanAll();
const testSkill = skills.find((s) => s.name === "test-skill");
```

### 各フィクスチャの SkillScanner パース期待値

#### test-skill

| フィールド   | 値                                                                |
| ------------ | ----------------------------------------------------------------- |
| name         | `"test-skill"`                                                    |
| description  | `"E2Eテスト用のスキル"`                                           |
| allowedTools | `["Read", "Write", "Edit", "Bash"]`                               |
| agents       | `[{filename: "test-agent.md", description: "Test Agent", ...}]`   |
| references   | `[{filename: "test-ref.md", description: "Test Reference", ...}]` |

#### another-skill

| フィールド   | 値                     |
| ------------ | ---------------------- |
| name         | `"another-skill"`      |
| description  | `"別のテスト用スキル"` |
| allowedTools | `["Read", "Glob"]`     |
| agents       | `[]`                   |
| references   | `[]`                   |

#### invalid-skill

SkillScanner にスキップされるため、`scanAll()` の結果に含まれない。

### 既存ユニットテストフィクスチャとの違い

| 観点   | ユニットテスト用                                        | E2E用（本フィクスチャ）                  |
| ------ | ------------------------------------------------------- | ---------------------------------------- |
| 配置先 | `src/main/services/skill/__tests__/__fixtures__/`       | `src/__tests__/__fixtures__/skills/`     |
| 目的   | SkillScanner 単体テスト                                 | E2Eテスト（TASK-8C-B/C/D）共通利用       |
| 独立性 | SkillScanner テスト専用。変更はユニットテストのみに影響 | E2Eテスト共通。変更は複数E2Eテストに影響 |

### 注意事項

- E2E フィクスチャはユニットテストフィクスチャとは独立しているため、片方を変更しても他方に影響しない
- `invalid-skill` は意図的に SKILL.md を配置していない。`README.md` が目的説明のために存在する
- テスト実行時に `[SkillScanner] Skipping skill at ...invalid-skill` の警告ログが出力されるのは正常動作
