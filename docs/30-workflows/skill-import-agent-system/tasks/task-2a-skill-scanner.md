---
id: TASK-2A
tier: 1
title: SkillScanner 実装
phase: 2
depends_on: [TASK-1-1]
parallel_with: [TASK-2B, TASK-2C]
blocks: [TASK-3-1, TASK-4-2]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, main-process, service]
---

# SkillScanner 実装

## 概要

スキルディレクトリをスキャンし、SKILL.md と配下の全サブディレクトリ情報を取得するサービスクラスを実装する。

## スキャン対象ディレクトリ

| パス                    | 読み書き         | 説明                          |
| ----------------------- | ---------------- | ----------------------------- |
| `~/.aiworkflow/skills/` | 読み書き可能     | アプリ独自のスキル格納先      |
| `~/.claude/skills/`     | **読み取り専用** | Claude CLI スキル（参照のみ） |

## 入力

- TASK-1-1 で作成した型定義（`SkillMetadata`, `SkillSubResource`, `SkillOtherFile`）
- `~/.aiworkflow/skills/` ディレクトリ構造（主要）
- `~/.claude/skills/` ディレクトリ構造（参照用）

## 出力

- `apps/desktop/src/main/services/skill/SkillScanner.ts`
- 単体テストファイル

## 実装詳細

### クラス構造

```typescript
export class SkillScanner {
  private skillsDir: string;

  constructor(skillsDir?: string);

  // 全スキルをスキャン
  async scanAll(): Promise<SkillMetadata[]>;

  // 単一スキルをパース
  private async parseSkill(
    skillPath: string,
    skillMdPath: string,
  ): Promise<SkillMetadata | null>;

  // サブディレクトリをスキャン
  private async scanSubDirectory(
    skillPath: string,
    subDir: string,
  ): Promise<SkillSubResource[]>;

  // その他ファイルをスキャン
  private async scanOtherFiles(skillPath: string): Promise<SkillOtherFile[]>;

  // Markdownから説明を抽出
  private async extractDescription(filePath: string): Promise<string>;

  // YAML Frontmatterをパース
  private parseFrontmatter(content: string): {
    frontmatter: Record<string, unknown>;
    body: string;
  };
}
```

### スキャン対象サブディレクトリ

| ディレクトリ  | 説明                     |
| ------------- | ------------------------ |
| `agents/`     | サブエージェント定義     |
| `references/` | 参照資料                 |
| `scripts/`    | ユーティリティスクリプト |
| `assets/`     | 静的アセット             |
| `schemas/`    | JSONスキーマ定義         |
| `indexes/`    | キーワードインデックス   |

### SKILL.md Frontmatter 構造

```yaml
---
name: skill-name
description: スキルの説明
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---
```

## ファイル

| 操作 | パス                                                                  |
| ---- | --------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/services/skill/SkillScanner.ts`                |
| 作成 | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` |
| 作成 | `apps/desktop/src/main/services/skill/index.ts`                       |

## 依存パッケージ

```bash
pnpm --filter @repo/desktop add yaml
```

- `yaml` - YAML Frontmatter パース
- `fs/promises` - ファイルシステム操作（Node.js標準）
- `path` - パス操作（Node.js標準）

## 完了条件

- [ ] `SkillScanner` クラスが実装されている
- [ ] `~/.aiworkflow/` が存在しない場合は自動作成される
- [ ] `~/.aiworkflow/skills/` と `~/.claude/skills/` の両方をスキャンできる
- [ ] `~/.claude/skills/` のスキルには `readonly: true` フラグが設定される
- [ ] `scanAll()` が全スキルのメタデータを返す
- [ ] 6つのサブディレクトリ（agents, references, scripts, assets, schemas, indexes）がスキャンされる
- [ ] `SKILL.md` の Frontmatter が正しくパースされる
- [ ] Markdown ファイルから説明が抽出される
- [ ] 存在しないディレクトリは空配列を返す
- [ ] 単体テストが全て通過する

## テスト要件

### 単体テスト

```typescript
describe("SkillScanner", () => {
  describe("scanAll", () => {
    it("should return all skills in the directory");
    it("should return empty array when directory is empty");
    it("should skip invalid skill directories");
  });

  describe("parseSkill", () => {
    it("should parse SKILL.md frontmatter correctly");
    it("should return null for invalid SKILL.md");
    it("should extract allowed-tools");
  });

  describe("scanSubDirectory", () => {
    it("should scan agents directory");
    it("should scan references directory");
    it("should return empty array for non-existent directory");
  });

  describe("extractDescription", () => {
    it("should extract first heading as description");
    it("should fallback to first paragraph");
  });
});
```

### モックデータ

テスト用のスキルディレクトリ構造を `__fixtures__/` に作成

## TASK-2Bからの改善提案

### IMP-001: lastScanAt フィールドの使用

| 項目   | 内容                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------- |
| 優先度 | 低                                                                                                 |
| 発見元 | TASK-2B Phase 11                                                                                   |
| 内容   | SkillImportStore.lastScanAt フィールドを使用して、スキャン日時を記録し、差分スキャンの最適化に活用 |

#### 実装方針

```typescript
// SkillScanner.scanAll() 完了時に lastScanAt を更新
async scanAll(): Promise<SkillMetadata[]> {
  const results = await this.internalScanAll();

  // SkillImportStore に lastScanAt を記録
  skillImportStore.set('lastScanAt', new Date().toISOString());

  return results;
}

// 差分スキャン最適化（将来）
async scanDiff(): Promise<SkillMetadata[]> {
  const lastScan = skillImportStore.get('lastScanAt');
  // lastScan 以降に変更されたスキルのみをスキャン
}
```

## 参考資料

- [specification.md - 5.6 SkillScanner実装仕様](../specification.md)
- [interfaces-agent-sdk.md - SkillImportStore（TASK-2B）](.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md) - スキーマ・API仕様
- アプリ独自スキル: `~/.aiworkflow/skills/`
- Claude CLI スキル（参照用）: `~/.claude/skills/presentation-slide-generator/`
