# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充） |
| ステータス | 未実施                |
| 作成日     | 2026-01-24            |
| 機能名     | TASK-2A: SkillScanner |

---

## 目的

TDD（テスト駆動開発）の Green フェーズとして、Phase 4 で作成したテストを通す実装を行う。SkillScanner クラスを完全に実装し、全テストが成功する状態にする。

## 背景

Phase 4 で Red 状態（テスト失敗）のテストが作成されている。本フェーズでは、これらのテストを通す最小限の実装を行い、その後品質改善を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 依存パッケージのインストール

**目的**: YAML パースに必要なパッケージをインストールする

**実行手順**:

1. yaml パッケージをインストールする：

```bash
pnpm --filter @repo/desktop add yaml
```

2. パッケージが正常にインストールされたことを確認する

**期待される成果物**:

- `apps/desktop/package.json` に yaml が追加されている

---

### タスク2: SkillScanner クラスの基本構造実装

**目的**: クラスの基本構造とコンストラクタを実装する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillScanner.ts` を作成する

2. 以下の基本構造を実装する：

```typescript
import { SkillMetadata, SkillSubResource, SkillOtherFile } from "@repo/shared";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { parse as parseYaml } from "yaml";

export class SkillScanner {
  private aiworkflowSkillsDir: string;
  private claudeSkillsDir: string;

  constructor(options?: {
    aiworkflowSkillsDir?: string;
    claudeSkillsDir?: string;
  }) {
    this.aiworkflowSkillsDir =
      options?.aiworkflowSkillsDir ??
      path.join(os.homedir(), ".aiworkflow", "skills");
    this.claudeSkillsDir =
      options?.claudeSkillsDir ?? path.join(os.homedir(), ".claude", "skills");
  }

  // 以下のメソッドは後続タスクで実装
}
```

**期待される成果物**:

- `SkillScanner.ts` の基本構造

---

### タスク3: ensureAiworkflowDir メソッド実装

**目的**: ~/.aiworkflow/skills/ ディレクトリの自動作成機能を実装する

**実行手順**:

1. ensureAiworkflowDir メソッドを実装する：

```typescript
private async ensureAiworkflowDir(): Promise<void> {
  try {
    await fs.mkdir(this.aiworkflowSkillsDir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}
```

**期待される成果物**:

- ensureAiworkflowDir メソッドの実装

---

### タスク4: scanAll メソッド実装

**目的**: 全スキルをスキャンするメインメソッドを実装する

**実行手順**:

1. scanAll メソッドを実装する：

```typescript
async scanAll(): Promise<SkillMetadata[]> {
  await this.ensureAiworkflowDir();

  const [aiworkflowSkills, claudeSkills] = await Promise.all([
    this.scanDirectory(this.aiworkflowSkillsDir, false),
    this.scanDirectory(this.claudeSkillsDir, true),
  ]);

  return [...aiworkflowSkills, ...claudeSkills];
}

private async scanDirectory(
  dir: string,
  readonly: boolean
): Promise<SkillMetadata[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const skills: SkillMetadata[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = path.join(dir, entry.name);
      const skillMdPath = path.join(skillPath, 'SKILL.md');

      const skill = await this.parseSkill(skillPath, skillMdPath, readonly);
      if (skill) {
        skills.push(skill);
      }
    }

    return skills;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}
```

**期待される成果物**:

- scanAll メソッドの実装
- scanDirectory メソッドの実装

---

### タスク5: parseSkill メソッド実装

**目的**: 単一スキルのメタデータをパースするメソッドを実装する

**実行手順**:

1. parseSkill メソッドを実装する：

```typescript
private async parseSkill(
  skillPath: string,
  skillMdPath: string,
  readonly: boolean
): Promise<SkillMetadata | null> {
  try {
    const content = await fs.readFile(skillMdPath, 'utf-8');
    const { frontmatter, body } = this.parseFrontmatter(content);

    const stat = await fs.stat(skillMdPath);

    const [agents, references, scripts, assets, schemas, indexes, otherFiles] =
      await Promise.all([
        this.scanSubDirectory(skillPath, 'agents'),
        this.scanSubDirectory(skillPath, 'references'),
        this.scanSubDirectory(skillPath, 'scripts'),
        this.scanSubDirectory(skillPath, 'assets'),
        this.scanSubDirectory(skillPath, 'schemas'),
        this.scanSubDirectory(skillPath, 'indexes'),
        this.scanOtherFiles(skillPath),
      ]);

    return {
      name: (frontmatter.name as string) ?? path.basename(skillPath),
      description: (frontmatter.description as string) ?? '',
      allowedTools: frontmatter['allowed-tools'] as string[] | undefined,
      path: skillPath,
      updatedAt: stat.mtime,
      readonly,
      agents,
      references,
      scripts,
      assets,
      schemas,
      indexes,
      otherFiles,
    };
  } catch (error) {
    // SKILL.md が存在しない or パースエラーの場合はスキップ
    console.warn(`Skipping skill at ${skillPath}: ${(error as Error).message}`);
    return null;
  }
}
```

**期待される成果物**:

- parseSkill メソッドの実装

---

### タスク6: parseFrontmatter メソッド実装

**目的**: YAML Frontmatter をパースするメソッドを実装する

**実行手順**:

1. parseFrontmatter メソッドを実装する：

```typescript
private parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  try {
    const frontmatter = parseYaml(match[1]) as Record<string, unknown>;
    const body = match[2];
    return { frontmatter, body };
  } catch (error) {
    console.warn(`Failed to parse YAML frontmatter: ${(error as Error).message}`);
    return { frontmatter: {}, body: content };
  }
}
```

**期待される成果物**:

- parseFrontmatter メソッドの実装

---

### タスク7: scanSubDirectory メソッド実装

**目的**: サブディレクトリをスキャンするメソッドを実装する

**実行手順**:

1. scanSubDirectory メソッドを実装する：

```typescript
private async scanSubDirectory(
  skillPath: string,
  subDir: string
): Promise<SkillSubResource[]> {
  const dirPath = path.join(skillPath, subDir);

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const resources: SkillSubResource[] = [];

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const filePath = path.join(dirPath, entry.name);
      const stat = await fs.stat(filePath);

      let description: string | undefined;
      if (entry.name.endsWith('.md')) {
        description = await this.extractDescription(filePath);
      }

      resources.push({
        filename: entry.name,
        relativePath: path.join(subDir, entry.name),
        description,
        size: stat.size,
      });
    }

    return resources;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}
```

**期待される成果物**:

- scanSubDirectory メソッドの実装

---

### タスク8: extractDescription メソッド実装

**目的**: Markdown ファイルから説明を抽出するメソッドを実装する

**実行手順**:

1. extractDescription メソッドを実装する：

```typescript
private async extractDescription(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // 最初の見出しを探す
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // 見出しがなければ最初の段落を探す
    const paragraphMatch = content.match(/^(?!#)(.+)$/m);
    if (paragraphMatch) {
      return paragraphMatch[1].trim().substring(0, 100);
    }

    return '';
  } catch {
    return '';
  }
}
```

**期待される成果物**:

- extractDescription メソッドの実装

---

### タスク9: scanOtherFiles メソッド実装

**目的**: その他ファイル（EVALS.json, LOGS.md, package.json）を検出するメソッドを実装する

**実行手順**:

1. scanOtherFiles メソッドを実装する：

```typescript
private async scanOtherFiles(skillPath: string): Promise<SkillOtherFile[]> {
  const knownFiles: Array<{ filename: string; type: SkillOtherFile['type'] }> = [
    { filename: 'EVALS.json', type: 'evals' },
    { filename: 'LOGS.md', type: 'logs' },
    { filename: 'package.json', type: 'package' },
  ];

  const otherFiles: SkillOtherFile[] = [];

  for (const { filename, type } of knownFiles) {
    const filePath = path.join(skillPath, filename);
    try {
      const stat = await fs.stat(filePath);
      otherFiles.push({ filename, type, size: stat.size });
    } catch {
      // ファイルが存在しない場合はスキップ
    }
  }

  return otherFiles;
}
```

**期待される成果物**:

- scanOtherFiles メソッドの実装

---

### タスク10: バレルエクスポート作成

**目的**: index.ts でクラスをエクスポートする

**実行手順**:

1. `apps/desktop/src/main/services/skill/index.ts` を作成する：

```typescript
export { SkillScanner } from "./SkillScanner";
```

**期待される成果物**:

- `index.ts` の作成

---

### タスク11: テスト実行（Green 状態確認）

**目的**: 全テストが成功することを確認する（TDD Green フェーズ）

**実行手順**:

1. 以下のコマンドでテストを実行する：

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
```

2. 全テストが成功することを確認する

3. `outputs/phase-05/test-green-status.md` にテスト実行結果を記録する

**期待される成果物**:

- `outputs/phase-05/test-green-status.md`

---

## 参照資料

| 参照資料        | パス                                                                  | 内容                 |
| --------------- | --------------------------------------------------------------------- | -------------------- |
| Phase 2 設計    | `outputs/phase-02/`                                                   | クラス・メソッド設計 |
| Phase 4 テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | テストコード         |
| TASK-1-1 型定義 | `packages/shared/src/types/skill.ts`                                  | SkillMetadata 型     |

---

## 成果物

| 成果物              | パス                                                   | 内容           |
| ------------------- | ------------------------------------------------------ | -------------- |
| SkillScanner クラス | `apps/desktop/src/main/services/skill/SkillScanner.ts` | メイン実装     |
| バレルエクスポート  | `apps/desktop/src/main/services/skill/index.ts`        | エクスポート   |
| Green状態確認       | `outputs/phase-05/test-green-status.md`                | テスト実行結果 |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 統合テスト連携

**Phase 5 では統合テストの準備として**:

- 実装が完了したら IPC ハンドラーテストで使用可能
- モック対応のためのコンストラクタオプションを提供

---

## 完了条件

- [ ] yaml パッケージがインストールされている
- [ ] SkillScanner クラスが完全に実装されている
- [ ] 全メソッド（scanAll, parseSkill, scanSubDirectory, extractDescription, scanOtherFiles, parseFrontmatter, ensureAiworkflowDir）が実装されている
- [ ] index.ts でエクスポートされている
- [ ] Phase 4 のテストが全て成功している（Green 状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-2A/phase-06-test-expansion.md`
