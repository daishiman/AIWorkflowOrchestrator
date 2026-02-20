# Phase 4: テスト作成（TDD: Red）— SkillEditor コンポーネント実装

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスク ID  | TASK-9A-C                              |
| Phase      | 4（テスト作成）                        |
| 前提 Phase | Phase 3（設計レビュー）                |
| 後続 Phase | Phase 5（実装）                        |
| ステータス | 未着手                                 |
| 作成日     | 2026-02-19                             |
| 機能名     | SkillEditor コンポーネント             |
| 依存タスク | TASK-9A-B（ファイル編集 IPC ハンドラ） |

## 目的

Phase 2 で設計した SkillEditor / SkillCodeEditor コンポーネントと buildFileTree / getLanguage ユーティリティ関数の期待動作を検証するテストを、実装より先に作成する（TDD Red 状態）。

テストは `@testing-library/react` と `fireEvent` を使用し、happy-dom 環境で動作するように設計する。全テストが**失敗する**ことを確認する（実装ファイルが存在しないため、インポートエラーで失敗する）。

## ⚠️ テスト環境の注意事項

### P39: happy-dom 環境での userEvent 非互換

**重要**: `apps/desktop` の Vitest 環境は **happy-dom** を使用している。`@testing-library/user-event` の `userEvent.setup()` は happy-dom 環境で Symbol 操作エラーを起こすため、**使用禁止**。

```typescript
// ❌ 使用禁止（happy-dom でエラー）
const user = userEvent.setup();
await user.click(element);

// ✅ 正しい方法
fireEvent.click(element);

// ✅ 非同期ハンドラを含む操作
await act(async () => {
  fireEvent.click(element);
});
```

### P40: テスト実行ディレクトリ

テスト実行は必ず `apps/desktop/` ディレクトリから行うこと:

```bash
# ✅ 正しい
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/

# ❌ プロジェクトルートからの実行は設定が読み込まれない
pnpm vitest run apps/desktop/src/renderer/components/skill/
```

## 実行タスク

### Task 1: テストデータファクトリとモック設計

**目的**: 全テストファイルで共通利用するテストデータファクトリと IPC モックを設計する。

**実行手順**:

1. テストデータファクトリを定義する

   **テスト用 ImportedSkill データ（3パターン）**:

   ```typescript
   import type {
     ImportedSkill,
     SkillSubResource,
     SkillOtherFile,
   } from "@repo/shared";

   /** 最小構成のスキル（agents と references のみ） */
   const createMinimalSkill = (): ImportedSkill => ({
     name: "test-skill",
     description: "テスト用スキル",
     path: "/home/user/.aiworkflow/skills/test-skill",
     updatedAt: new Date("2026-02-19"),
     importedAt: new Date("2026-02-19"),
     status: "active",
     agents: [
       {
         filename: "main.md",
         relativePath: "agents/main.md",
         description: "メインエージェント",
         size: 500,
       },
     ],
     references: [
       {
         filename: "patterns.md",
         relativePath: "references/patterns.md",
         description: "パターン集",
         size: 1200,
       },
     ],
     scripts: [],
     assets: [],
     schemas: [],
     indexes: [],
     otherFiles: [],
   });

   /** 全カテゴリにファイルがあるスキル */
   const createFullSkill = (): ImportedSkill => ({
     ...createMinimalSkill(),
     name: "full-skill",
     scripts: [
       {
         filename: "setup.sh",
         relativePath: "scripts/setup.sh",
         size: 300,
       },
     ],
     assets: [
       {
         filename: "icon.png",
         relativePath: "assets/icon.png",
         size: 2048,
       },
     ],
     schemas: [
       {
         filename: "config.json",
         relativePath: "schemas/config.json",
         description: "設定スキーマ",
         size: 400,
       },
     ],
     indexes: [
       {
         filename: "keywords.md",
         relativePath: "indexes/keywords.md",
         size: 150,
       },
     ],
     otherFiles: [
       { filename: "LOGS.md", type: "logs", size: 800 },
       { filename: "package.json", type: "package", size: 200 },
     ],
   });

   /** ファイルが全て空のスキル */
   const createEmptySkill = (): ImportedSkill => ({
     ...createMinimalSkill(),
     name: "empty-skill",
     agents: [],
     references: [],
   });
   ```

2. IPC モックパターンを定義する

   ```typescript
   // TASK-9A-B で追加される IPC メソッドのモック
   const mockReadFile = vi.fn<[string, string], Promise<string>>();
   const mockWriteFile = vi.fn<[string, string, string], Promise<void>>();

   beforeEach(() => {
     vi.clearAllMocks();
     // window.electronAPI.skill にモックメソッドを追加
     Object.assign(window.electronAPI.skill, {
       readFile: mockReadFile,
       writeFile: mockWriteFile,
     });
     mockReadFile.mockResolvedValue("# Default content");
     mockWriteFile.mockResolvedValue(undefined);
   });
   ```

**期待される成果物**: テストファイル内のファクトリ関数とモック設定

### Task 2: getLanguage ユーティリティテスト作成

**目的**: ファイル拡張子から言語識別子を返す `getLanguage` 関数のテストを作成する。

**テストファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/getLanguage.test.ts`

**テストケース一覧**:

| ケース ID | カテゴリ     | テスト内容                              | 入力            | 期待値         |
| --------- | ------------ | --------------------------------------- | --------------- | -------------- |
| GL-01     | 正常系       | `.ts` → `typescript`                    | `"index.ts"`    | `"typescript"` |
| GL-02     | 正常系       | `.tsx` → `typescript`                   | `"App.tsx"`     | `"typescript"` |
| GL-03     | 正常系       | `.js` → `javascript`                    | `"main.js"`     | `"javascript"` |
| GL-04     | 正常系       | `.md` → `markdown`                      | `"SKILL.md"`    | `"markdown"`   |
| GL-05     | 正常系       | `.json` → `json`                        | `"config.json"` | `"json"`       |
| GL-06     | 正常系       | `.yaml` → `yaml`                        | `"config.yaml"` | `"yaml"`       |
| GL-07     | 正常系       | `.yml` → `yaml`                         | `"data.yml"`    | `"yaml"`       |
| GL-08     | 正常系       | `.sh` → `shell`                         | `"setup.sh"`    | `"shell"`      |
| GL-09     | 境界値       | 拡張子なしファイルが `plaintext` を返す | `"Makefile"`    | `"plaintext"`  |
| GL-10     | 境界値       | 未対応拡張子が `plaintext` を返す       | `"file.xyz"`    | `"plaintext"`  |
| GL-11     | 大文字小文字 | 大文字拡張子が正しく処理される          | `"README.MD"`   | `"markdown"`   |
| GL-12     | 境界値       | ドット始まりファイル                    | `".gitignore"`  | `"plaintext"`  |
| GL-13     | 境界値       | 複数ドットのファイル名                  | `"a.test.ts"`   | `"typescript"` |

**テストコード**:

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/getLanguage.test.ts

import { describe, it, expect } from "vitest";
import { getLanguage } from "../SkillEditor";

describe("getLanguage", () => {
  describe("正常系: 対応拡張子", () => {
    it("GL-01: .ts ファイルが 'typescript' を返す", () => {
      expect(getLanguage("index.ts")).toBe("typescript");
    });

    it("GL-02: .tsx ファイルが 'typescript' を返す", () => {
      expect(getLanguage("App.tsx")).toBe("typescript");
    });

    it("GL-03: .js ファイルが 'javascript' を返す", () => {
      expect(getLanguage("main.js")).toBe("javascript");
    });

    it("GL-04: .md ファイルが 'markdown' を返す", () => {
      expect(getLanguage("SKILL.md")).toBe("markdown");
    });

    it("GL-05: .json ファイルが 'json' を返す", () => {
      expect(getLanguage("config.json")).toBe("json");
    });

    it("GL-06: .yaml ファイルが 'yaml' を返す", () => {
      expect(getLanguage("config.yaml")).toBe("yaml");
    });

    it("GL-07: .yml ファイルが 'yaml' を返す", () => {
      expect(getLanguage("data.yml")).toBe("yaml");
    });

    it("GL-08: .sh ファイルが 'shell' を返す", () => {
      expect(getLanguage("setup.sh")).toBe("shell");
    });
  });

  describe("境界値: フォールバック", () => {
    it("GL-09: 拡張子なしファイルが 'plaintext' を返す", () => {
      expect(getLanguage("Makefile")).toBe("plaintext");
    });

    it("GL-10: 未対応拡張子が 'plaintext' を返す", () => {
      expect(getLanguage("file.xyz")).toBe("plaintext");
    });

    it("GL-12: ドット始まりのファイル名が 'plaintext' を返す", () => {
      expect(getLanguage(".gitignore")).toBe("plaintext");
    });
  });

  describe("大文字小文字の正規化", () => {
    it("GL-11: 大文字拡張子 (.MD) が 'markdown' を返す", () => {
      expect(getLanguage("README.MD")).toBe("markdown");
    });

    it("GL-13: 複数ドットのファイル名で末尾拡張子が使用される", () => {
      expect(getLanguage("a.test.ts")).toBe("typescript");
    });
  });
});
```

### Task 3: buildFileTree ユーティリティテスト作成

**目的**: ImportedSkill からファイルツリー構造を構築する `buildFileTree` 関数のテストを作成する。

**テストファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/buildFileTree.test.ts`

**テストケース一覧**:

| ケース ID | カテゴリ | テスト内容                                     | 入力スキル   | 期待結果                  |
| --------- | -------- | ---------------------------------------------- | ------------ | ------------------------- |
| BT-01     | 正常系   | 全カテゴリにファイルがある場合全カテゴリ返却   | fullSkill    | length === 8（other含む） |
| BT-02     | 正常系   | 空カテゴリがフィルタリングされる               | minimalSkill | agents,references のみ    |
| BT-03     | 境界値   | 全カテゴリが空の場合、空配列が返される         | emptySkill   | length === 0              |
| BT-04     | 正常系   | カテゴリの表示順が仕様通り                     | fullSkill    | 順序検証                  |
| BT-05     | 正常系   | 各カテゴリのラベルが正しい                     | fullSkill    | ラベル文字列検証          |
| BT-06     | 正常系   | files 配列に正しい SkillSubResource が含まれる | minimalSkill | filename/relativePath     |
| BT-07     | 正常系   | otherFiles が正しく変換される                  | fullSkill    | filename/type 含む        |

**テストコード**:

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/buildFileTree.test.ts

import { describe, it, expect } from "vitest";
import { buildFileTree } from "../SkillEditor";
import type { ImportedSkill } from "@repo/shared";

// テストデータ（Task 1 のファクトリ関数と同一）
const createMinimalSkill = (): ImportedSkill => ({
  name: "test-skill",
  description: "テスト用スキル",
  path: "/home/user/.aiworkflow/skills/test-skill",
  updatedAt: new Date("2026-02-19"),
  importedAt: new Date("2026-02-19"),
  status: "active",
  agents: [
    {
      filename: "main.md",
      relativePath: "agents/main.md",
      description: "メインエージェント",
      size: 500,
    },
  ],
  references: [
    {
      filename: "patterns.md",
      relativePath: "references/patterns.md",
      description: "パターン集",
      size: 1200,
    },
  ],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
});

const createFullSkill = (): ImportedSkill => ({
  ...createMinimalSkill(),
  name: "full-skill",
  scripts: [
    { filename: "setup.sh", relativePath: "scripts/setup.sh", size: 300 },
  ],
  assets: [
    { filename: "icon.png", relativePath: "assets/icon.png", size: 2048 },
  ],
  schemas: [
    {
      filename: "config.json",
      relativePath: "schemas/config.json",
      description: "設定スキーマ",
      size: 400,
    },
  ],
  indexes: [
    { filename: "keywords.md", relativePath: "indexes/keywords.md", size: 150 },
  ],
  otherFiles: [
    { filename: "LOGS.md", type: "logs", size: 800 },
    { filename: "package.json", type: "package", size: 200 },
  ],
});

const createEmptySkill = (): ImportedSkill => ({
  ...createMinimalSkill(),
  name: "empty-skill",
  agents: [],
  references: [],
});

describe("buildFileTree", () => {
  describe("正常系: カテゴリ構築", () => {
    it("BT-01: 全カテゴリにファイルがある場合、全カテゴリが返される", () => {
      const result = buildFileTree(createFullSkill());
      // agents, references, scripts, assets, schemas, indexes, otherFiles の 7 カテゴリ
      expect(result).toHaveLength(7);
    });

    it("BT-02: 空カテゴリは結果に含まれない", () => {
      const result = buildFileTree(createMinimalSkill());
      const keys = result.map((c) => c.key);
      expect(keys).toContain("agents");
      expect(keys).toContain("references");
      expect(keys).not.toContain("scripts");
      expect(keys).not.toContain("assets");
      expect(keys).not.toContain("schemas");
      expect(keys).not.toContain("indexes");
      expect(keys).not.toContain("otherFiles");
    });

    it("BT-04: カテゴリの表示順が agents → references → scripts → assets → schemas → indexes → otherFiles", () => {
      const result = buildFileTree(createFullSkill());
      expect(result.map((c) => c.key)).toEqual([
        "agents",
        "references",
        "scripts",
        "assets",
        "schemas",
        "indexes",
        "otherFiles",
      ]);
    });

    it("BT-05: 各カテゴリの label が日本語表示名を含む", () => {
      const result = buildFileTree(createFullSkill());
      const agentsCategory = result.find((c) => c.key === "agents");
      expect(agentsCategory?.label).toContain("エージェント");
      const otherCategory = result.find((c) => c.key === "otherFiles");
      expect(otherCategory?.label).toContain("その他");
    });

    it("BT-06: files 配列に正しい SkillSubResource が含まれる", () => {
      const result = buildFileTree(createMinimalSkill());
      const agentsCategory = result.find((c) => c.key === "agents");
      expect(agentsCategory?.files).toHaveLength(1);
      expect(agentsCategory?.files[0]).toMatchObject({
        filename: "main.md",
        relativePath: "agents/main.md",
      });
    });

    it("BT-07: otherFiles が正しく含まれる", () => {
      const result = buildFileTree(createFullSkill());
      const otherCategory = result.find((c) => c.key === "otherFiles");
      expect(otherCategory?.files).toHaveLength(2);
    });
  });

  describe("境界値", () => {
    it("BT-03: 全カテゴリが空の場合、空配列が返される", () => {
      const result = buildFileTree(createEmptySkill());
      expect(result).toEqual([]);
    });
  });
});
```

### Task 4: SkillCodeEditor コンポーネントテスト作成

**目的**: テキストエリアベースのコードエディターコンポーネントのテストを作成する。

**テストファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx`

**テストケース一覧**:

| ケース ID | カテゴリ         | テスト内容                                       |
| --------- | ---------------- | ------------------------------------------------ |
| CE-01     | 正常系・描画     | value の内容が textarea に表示される             |
| CE-02     | コールバック     | テキスト入力で onChange が呼び出される           |
| CE-03     | Props 制御       | isReadOnly=true で textarea が読み取り専用になる |
| CE-04     | キーボード操作   | Tab キーで 2 スペースが挿入される                |
| CE-05     | アクセシビリティ | aria-label と aria-multiline が付与されている    |
| CE-06     | 描画             | spellCheck が false に設定されている             |

**テストコード**:

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillCodeEditor } from "../SkillCodeEditor";

describe("SkillCodeEditor", () => {
  const defaultProps = {
    value: "# Test content\nLine 2\nLine 3",
    onChange: vi.fn(),
    language: "markdown",
  };

  describe("表示", () => {
    it("CE-01: value の内容が textarea に表示される", () => {
      render(<SkillCodeEditor {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("# Test content\nLine 2\nLine 3");
    });

    it("CE-06: spellCheck が false に設定されている", () => {
      render(<SkillCodeEditor {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("spellcheck", "false");
    });
  });

  describe("テキスト入力", () => {
    it("CE-02: テキスト入力で onChange が呼び出される", () => {
      const onChange = vi.fn();
      render(
        <SkillCodeEditor {...defaultProps} onChange={onChange} />,
      );
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "new content" } });
      expect(onChange).toHaveBeenCalledWith("new content");
    });

    it("CE-04: Tab キーで onChange が呼び出される（2スペース挿入）", () => {
      const onChange = vi.fn();
      render(
        <SkillCodeEditor {...defaultProps} value="hello" onChange={onChange} />,
      );
      const textarea = screen.getByRole("textbox");
      fireEvent.keyDown(textarea, { key: "Tab" });
      expect(onChange).toHaveBeenCalled();
      // 挿入されたテキストに2スペースが含まれること
      const calledValue = onChange.mock.calls[0][0] as string;
      expect(calledValue).toContain("  ");
    });
  });

  describe("読み取り専用モード", () => {
    it("CE-03: isReadOnly=true で textarea が読み取り専用になる", () => {
      render(<SkillCodeEditor {...defaultProps} isReadOnly />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("readonly");
    });
  });

  describe("アクセシビリティ", () => {
    it("CE-05: aria-label と aria-multiline が付与されている", () => {
      render(<SkillCodeEditor {...defaultProps} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-label");
      expect(textarea).toHaveAttribute("aria-multiline", "true");
    });
  });
});
```

### Task 5: SkillEditor コンポーネントテスト作成

**目的**: SkillEditor のファイルツリー表示、ファイル選択、IPC 連携、保存、閉じる操作のテストを作成する。

**テストファイルパス**: `apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx`

**テストケース一覧**:

| ケース ID | カテゴリ             | テスト内容                                               |
| --------- | -------------------- | -------------------------------------------------------- |
| SE-01     | 正常系・描画         | スキルのファイルツリーがカテゴリ別に表示される           |
| SE-02     | 正常系・描画         | 空カテゴリは表示されない                                 |
| SE-03     | 正常系・IPC 連携     | ファイルクリックで readFile が呼ばれエディタに表示される |
| SE-04     | 正常系・IPC 連携     | 別ファイルクリックでエディタ内容が切り替わる             |
| SE-05     | 正常系・状態変更     | テキスト編集で「未保存」ラベルが表示される               |
| SE-06     | 正常系・IPC 連携     | 保存ボタンで writeFile が呼ばれ未保存が消える            |
| SE-07     | 正常系・コールバック | 閉じるボタンで onClose が呼ばれる                        |
| SE-08     | 異常系               | ファイル読込エラー時にエラーメッセージが表示される       |
| SE-09     | 異常系               | ファイル保存エラー時にエラーメッセージが表示される       |
| SE-10     | 正常系               | ファイル未選択時に「ファイルを選択してください」が表示   |
| SE-11     | 正常系               | 読み込み中に「読み込み中...」が表示される                |
| SE-12     | キーボード操作       | Cmd+S で保存が実行される                                 |
| SE-13     | キーボード操作       | Escape で onClose が呼ばれる                             |

**テストコード**:

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx

import React from "react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { SkillEditor } from "../SkillEditor";
import type { ImportedSkill } from "@repo/shared";

// Cleanup DOM between tests
afterEach(() => {
  cleanup();
});

// IPC モック
const mockReadFile = vi.fn<[string, string], Promise<string>>();
const mockWriteFile = vi.fn<[string, string, string], Promise<void>>();

// テストデータ
const createTestSkill = (): ImportedSkill => ({
  name: "test-skill",
  description: "テスト用スキル",
  path: "/home/user/.aiworkflow/skills/test-skill",
  updatedAt: new Date("2026-02-19"),
  importedAt: new Date("2026-02-19"),
  status: "active",
  agents: [
    {
      filename: "main.md",
      relativePath: "agents/main.md",
      description: "メインエージェント",
      size: 500,
    },
  ],
  references: [
    {
      filename: "patterns.md",
      relativePath: "references/patterns.md",
      description: "パターン集",
      size: 1200,
    },
  ],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
});

describe("SkillEditor", () => {
  let mockSkill: ImportedSkill;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSkill = createTestSkill();

    // TASK-9A-B IPC メソッドのモック設定
    Object.assign(window.electronAPI.skill, {
      readFile: mockReadFile,
      writeFile: mockWriteFile,
    });
    mockReadFile.mockResolvedValue("# Default content");
    mockWriteFile.mockResolvedValue(undefined);
  });

  describe("ファイルツリー表示", () => {
    it("SE-01: スキルのファイルツリーがカテゴリ別に表示される", () => {
      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);
      // カテゴリラベルが表示される
      expect(
        screen.getByText(/エージェント/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/参照資料/),
      ).toBeInTheDocument();
      // ファイル名が表示される
      expect(screen.getByText("main.md")).toBeInTheDocument();
      expect(screen.getByText("patterns.md")).toBeInTheDocument();
    });

    it("SE-02: 空カテゴリ（scripts 等）は表示されない", () => {
      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);
      expect(screen.queryByText(/スクリプト/)).not.toBeInTheDocument();
      expect(screen.queryByText(/アセット/)).not.toBeInTheDocument();
    });

    it("SE-10: ファイル未選択時に案内テキストが表示される", () => {
      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);
      expect(
        screen.getByText("ファイルを選択してください"),
      ).toBeInTheDocument();
    });
  });

  describe("ファイル選択・読込", () => {
    it("SE-03: ファイルクリックで readFile が skill.name と relativePath で呼ばれる", async () => {
      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);
      await act(async () => {
        fireEvent.click(screen.getByText("main.md"));
      });
      await waitFor(() => {
        expect(mockReadFile).toHaveBeenCalledWith(
          "test-skill",
          "agents/main.md",
        );
      });
    });

    it("SE-04: 別ファイルクリックでエディタ内容が切り替わる", async () => {
      mockReadFile
        .mockResolvedValueOnce("# Agent content")
        .mockResolvedValueOnce("# Reference content");

      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);

      await act(async () => {
        fireEvent.click(screen.getByText("main.md"));
      });
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toHaveValue("# Agent content");
      });

      await act(async () => {
        fireEvent.click(screen.getByText("patterns.md"));
      });
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toHaveValue(
          "# Reference content",
        );
      });
    });

    it("SE-11: ファイル読み込み中に「読み込み中...」が表示される", async () => {
      // readFile を遅延させる
      let resolveRead: (value: string) => void;
      mockReadFile.mockReturnValue(
        new Promise<string>((resolve) => {
          resolveRead = resolve;
        }),
      );

      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);
      await act(async () => {
        fireEvent.click(screen.getByText("main.md"));
      });

      expect(screen.getByText("読み込み中...")).toBeInTheDocument();

      await act(async () => {
        resolveRead!("# Content");
      });
    });
  });

  describe("編集・保存", () => {
    it("SE-05: テキスト編集で「未保存」ラベルが表示される", async () => {
      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);

      // ファイルを選択して読み込む
      await act(async () => {
        fireEvent.click(screen.getByText("main.md"));
      });
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });

      // テキストを変更
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "modified content" },
      });

      // 未保存ラベルが表示される
      expect(screen.getByText(/未保存/)).toBeInTheDocument();
    });

    it("SE-06: 保存ボタンクリックで writeFile が呼ばれ、未保存ラベルが消える", async () => {
      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);

      // ファイル選択→編集
      await act(async () => {
        fireEvent.click(screen.getByText("main.md"));
      });
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "new content" },
      });

      // 保存ボタンクリック
      await act(async () => {
        fireEvent.click(screen.getByLabelText("保存"));
      });

      await waitFor(() => {
        expect(mockWriteFile).toHaveBeenCalledWith(
          "test-skill",
          "agents/main.md",
          "new content",
        );
      });

      // 未保存ラベルが消える
      await waitFor(() => {
        expect(screen.queryByText(/未保存/)).not.toBeInTheDocument();
      });
    });

    it("SE-12: Cmd+S で保存が実行される", async () => {
      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);

      await act(async () => {
        fireEvent.click(screen.getByText("main.md"));
      });
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "keyboard saved content" },
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: "s", metaKey: true });
      });

      await waitFor(() => {
        expect(mockWriteFile).toHaveBeenCalled();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("SE-08: ファイル読込エラー時にエラーメッセージが表示される", async () => {
      mockReadFile.mockRejectedValue(
        new Error("ファイルの読み込みに失敗しました"),
      );

      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);
      await act(async () => {
        fireEvent.click(screen.getByText("main.md"));
      });

      await waitFor(() => {
        expect(
          screen.getByText("ファイルの読み込みに失敗しました"),
        ).toBeInTheDocument();
      });
    });

    it("SE-09: ファイル保存エラー時にエラーメッセージが表示される", async () => {
      mockWriteFile.mockRejectedValue(
        new Error("ファイルの保存に失敗しました"),
      );

      render(<SkillEditor skill={mockSkill} onClose={vi.fn()} />);

      await act(async () => {
        fireEvent.click(screen.getByText("main.md"));
      });
      await waitFor(() => {
        expect(screen.getByRole("textbox")).toBeInTheDocument();
      });
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "will fail to save" },
      });

      await act(async () => {
        fireEvent.click(screen.getByLabelText("保存"));
      });

      await waitFor(() => {
        expect(
          screen.getByText("ファイルの保存に失敗しました"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("閉じる", () => {
    it("SE-07: 閉じるボタンで onClose が呼ばれる", () => {
      const onClose = vi.fn();
      render(<SkillEditor skill={mockSkill} onClose={onClose} />);
      fireEvent.click(screen.getByLabelText("閉じる"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("SE-13: Escape キーで onClose が呼ばれる", () => {
      const onClose = vi.fn();
      render(<SkillEditor skill={mockSkill} onClose={onClose} />);
      fireEvent.keyDown(window, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
```

## 参照資料

| ドキュメント                  | パス                                                                              | 利用目的                           |
| ----------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 2 設計書                | `docs/30-workflows/TASK-9A-C-skill-editor-ui/phase-2-design.md`                   | コンポーネント・関数設計           |
| Phase 3 設計レビュー          | `docs/30-workflows/TASK-9A-C-skill-editor-ui/phase-3-design-review.md`            | 設計妥当性とレビュー指摘の反映確認 |
| 型定義ファイル                | `packages/shared/src/types/skill.ts`                                              | ImportedSkill / SkillSubResource   |
| テストパターン                | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト設計ガイド                   |
| 既存 SkillImportDialog テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` | テストデータ構造の参考             |
| P39 注意事項                  | `.claude/rules/06-known-pitfalls.md#P39`                                          | happy-dom 環境での制約             |
| P40 注意事項                  | `.claude/rules/06-known-pitfalls.md#P40`                                          | テスト実行ディレクトリ             |
| 既存コンポーネント分析        | `outputs/phase-1/existing-component-analysis.md`                                  | Phase 1 成果物                     |
| UI要件定義                    | `outputs/phase-1/skill-editor-requirements.md`                                    | Phase 1 成果物                     |
| コンポーネント階層定義        | `outputs/phase-1/component-hierarchy-requirements.md`                             | Phase 1 成果物                     |
| インタラクション仕様          | `outputs/phase-1/interaction-specifications.md`                                   | Phase 1 成果物                     |

### システム仕様（aiworkflow-requirements）

| ドキュメント                     | パス                                                                                        | 利用目的                     |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| UIコンポーネント仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | コンポーネント構成の参照     |
| デザインシステム                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラーパレット・スタイル参照 |
| 機能コンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能コンポーネント設計参照   |
| アーキテクチャ概要               | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構造の参照           |
| 実装パターン                     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンの参照           |
| 状態管理                         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 状態管理設計の参照           |
| Agent SDK Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill 型定義の参照           |
| セキュリティ API                 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Electron セキュリティ設計    |
| IPC セキュリティ                 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC 通信パターンの参照       |
| エラーハンドリング               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー処理パターンの参照     |
| テストコンポーネントパターン     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト設計パターンの参照     |

## 実行手順

### 1. テストデータとモック設計

テストデータファクトリ（createMinimalSkill / createFullSkill / createEmptySkill）と IPC モック（readFile / writeFile）を設計する（Task 1）。

### 2. ユーティリティ関数テスト作成

getLanguage テスト（13 ケース: GL-01〜GL-13）と buildFileTree テスト（7 ケース: BT-01〜BT-07）を作成する（Task 2, 3）。

### 3. コンポーネントテスト作成

SkillCodeEditor テスト（6 ケース: CE-01〜CE-06）と SkillEditor テスト（13 ケース: SE-01〜SE-13）を作成する（Task 4, 5）。

### 4. TDD Red 状態の確認

全テスト（39 ケース）を実行し、実装ファイル未存在によりインポートエラーで失敗する（Red 状態）ことを確認する。

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                 | テストファイル                                 | 適用判断                     |
| ------------------ | ---------------------------------------- | ---------------------------------------------- | ---------------------------- |
| API接続            | readFile / writeFile チャネルモック疎通  | `SkillEditor.test.tsx`                         | 適用                         |
| データフロー       | ファイル選択→読込→編集→保存の一連フロー  | `SkillEditor.test.tsx`                         | 適用                         |
| エラーハンドリング | IPC エラー時のUI表示                     | `SkillEditor.test.tsx`                         | 適用                         |
| 認証連携           | 認証トークン検証                         | —                                              | 対象外（本タスクは認証不要） |
| 状態同期           | Store 同期検証                           | —                                              | 対象外（useState のみ使用）  |
| ユーティリティ     | buildFileTree / getLanguage の入出力検証 | `getLanguage.test.ts`, `buildFileTree.test.ts` | 適用                         |

## アーキテクチャ層別テスト（AIが判断）

| 層               | テスト観点                         | テストファイル配置                                 | 該当テストケース数 |
| ---------------- | ---------------------------------- | -------------------------------------------------- | ------------------ |
| Renderer Process | SkillEditor / SkillCodeEditor 描画 | `SkillEditor.test.tsx`, `SkillCodeEditor.test.tsx` | 32                 |
| Main Process     | 対象外（本タスクは Renderer のみ） | —                                                  | 0                  |
| IPC通信          | readFile / writeFile モック検証    | `SkillEditor.test.tsx`                             | 7                  |
| Preload          | 対象外（TASK-9A-B で実装済み）     | —                                                  | 0                  |
| Shared           | ImportedSkill 型テストデータ生成   | `getLanguage.test.ts`, `buildFileTree.test.ts`     | —                  |

## 多角的チェック観点

### 一般観点

| 観点                 | 適用判断 | 仕様参照先                                                                      |
| -------------------- | -------- | ------------------------------------------------------------------------------- |
| Phase 2 設計との整合 | 適用     | `phase-2-design.md` — Props インターフェースが設計と一致しているか              |
| テスト観点の網羅性   | 適用     | `testing-component-patterns.md` — 正常系・異常系・境界値・a11y が含まれているか |
| IPC モックパターン   | 適用     | `SkillImportDialog.test.tsx` — 既存テストのモックパターンと統一されているか     |
| テスト環境の制約     | 適用     | `06-known-pitfalls.md` — P39（fireEvent 使用）・P40（実行ディレクトリ）遵守     |
| テストデータ型整合   | 適用     | `packages/shared/src/types/skill.ts` — ImportedSkill 型と一致しているか         |
| TDD Red 状態         | 適用     | Phase 4 完了基準 — 全テストがインポートエラーで失敗すること                     |
| エラーハンドリング   | 適用     | `error-handling.md` — IPC エラー時の UI 表示テストが含まれているか              |
| アクセシビリティ     | 適用     | `ui-ux-design-system.md` — aria 属性・キーボード操作のテストが含まれているか    |

### Electron デスクトップアプリ観点

| 層       | 適用判断                               | 仕様参照先                      |
| -------- | -------------------------------------- | ------------------------------- |
| Renderer | 適用 — コンポーネント描画テスト        | `ui-ux-components.md`           |
| Main     | 対象外 — 本タスクは Renderer 層のみ    | —                               |
| IPC      | 適用 — readFile / writeFile モック検証 | `security-electron-ipc.md`      |
| Preload  | 対象外 — TASK-9A-B で実装済み          | —                               |
| Shared   | 適用 — ImportedSkill テストデータ生成  | `interfaces-agent-sdk-skill.md` |

## 成果物

| 成果物                 | パス                                                                            |
| ---------------------- | ------------------------------------------------------------------------------- |
| getLanguage テスト     | `apps/desktop/src/renderer/components/skill/__tests__/getLanguage.test.ts`      |
| buildFileTree テスト   | `apps/desktop/src/renderer/components/skill/__tests__/buildFileTree.test.ts`    |
| SkillCodeEditor テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx` |
| SkillEditor テスト     | `apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx`     |

## 完了条件

- [ ] getLanguage テスト（13 ケース）が作成されている
- [ ] buildFileTree テスト（7 ケース）が作成されている
- [ ] SkillCodeEditor テスト（6 ケース）が作成されている
- [ ] SkillEditor テスト（13 ケース）が作成されている
- [ ] テストデータファクトリが ImportedSkill 型と一致している
- [ ] IPC モック（readFile / writeFile）が設定されている
- [ ] happy-dom 環境で fireEvent を使用している（userEvent 不使用）
- [ ] すべてのテストが失敗状態（Red）であることを確認
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## TDD 検証

```bash
# テスト実行コマンド（apps/desktop ディレクトリから実行）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/getLanguage.test.ts src/renderer/components/skill/__tests__/buildFileTree.test.ts src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx src/renderer/components/skill/__tests__/SkillEditor.test.tsx

# 確認項目
# - [ ] テストが失敗することを確認（Red 状態 — 実装ファイル未存在のためインポートエラー）
```

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. テストデータファクトリとモック設計（Task 1）
2. getLanguage ユーティリティテスト作成（Task 2: 13 ケース）
3. buildFileTree ユーティリティテスト作成（Task 3: 7 ケース）
4. SkillCodeEditor コンポーネントテスト作成（Task 4: 6 ケース）
5. SkillEditor コンポーネントテスト作成（Task 5: 13 ケース）
6. TDD Red 状態の確認

---

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物（テストファイル 4 つ）が生成されている
- [ ] テストが失敗状態（Red）であることを確認
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 4
```

---

## 次の Phase

Phase 5: 実装（TDD: Green）
