---
id: TASK-9F
title: スキル共有・インポート機能実装
tier: 3
phase: 9
depends_on: [TASK-9B]
parallel_with: [TASK-9D, TASK-9E, TASK-9G, TASK-9H, TASK-9I, TASK-9J]
blocks: []
status: pending
priority: low
estimated_complexity: large
tags: [backend, main, skill-management, share, import, github, gist, future]

execution:
  mode: sequential
  timeout_minutes: 90
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillShareManager.ts
  # UI成果物は ./task-030-ui-05-skill-center-view.md#15B.2 で定義
  modifies:
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/main/ipc/channels.ts
    - apps/desktop/src/preload/skillAPI.ts
    - apps/desktop/src/preload/types.ts
---

# スキル共有・インポート機能実装

## 概要

スキルをGitHub/Gist/ローカルファイルからインポートしたり、作成したスキルを共有する機能。

## インポート先ディレクトリ

| パス                    | 説明                                         |
| ----------------------- | -------------------------------------------- |
| `~/.aiworkflow/skills/` | インポートしたスキルの保存先（読み書き可能） |

**注意**: `~/.claude/skills/` は Claude CLI が管理するため、本アプリからのインポート先としては使用しません。

## 入力

- TASK-9B: skill-creator スキル（shareコマンド追加済み）
- specification.md §20: 共有・インポート機能仕様
- technical-decisions.md §21: 設計判断

## 出力

- SkillShareManager サービス
- ImportSkillDialog / ExportSkillDialog UI コンポーネント

## 実装手順

### Step 1: SkillShareManager 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillShareManager.ts`

```typescript
export interface ShareTarget {
  type: "github" | "gist" | "local" | "url";
  repo?: string;
  branch?: string;
  path?: string;
  gistId?: string;
  localPath?: string;
  url?: string;
}

export interface ImportResult {
  success: boolean;
  skillName: string;
  skillPath: string;
  source: ShareTarget;
  importedAt: Date;
}

export interface ExportResult {
  success: boolean;
  destination: ShareTarget;
  exportedFiles: string[];
  shareUrl?: string;
}

export class SkillShareManager {
  async import(source: ShareTarget): Promise<ImportResult>;
  async export(
    skillName: string,
    destination: ShareTarget,
  ): Promise<ExportResult>;

  private importFromGitHub(source: ShareTarget): Promise<ImportResult>;
  private importFromGist(source: ShareTarget): Promise<ImportResult>;
  private importFromLocal(source: ShareTarget): Promise<ImportResult>;
  private importFromUrl(source: ShareTarget): Promise<ImportResult>;

  private exportToGist(
    skillPath: string,
    skillName: string,
  ): Promise<ExportResult>;
  private exportToLocal(
    skillPath: string,
    destPath: string,
  ): Promise<ExportResult>;

  private validateImport(skillPath: string): Promise<ImportValidation>;
}
```

### Step 2: GitHub認証統合

- Octokit クライアント初期化
- Personal Access Token 設定UI
- OAuth フロー（オプション）

### Step 3: IPC拡張

> **注記**: `skill:import` チャネルは既存のローカルスキルインポート
> （UT-FIX-SKILL-IMPORT-INTERFACE-001）で使用済み。
> 外部ソースインポートは `skill:importFromSource` を使用する。

**チャネル追加**:

- `skill:importFromSource` - 外部ソースからのスキルインポート
- `skill:export` - スキルエクスポート
- `skill:validateSource` - インポート元検証

### Step 4: ImportSkillDialog 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05-skill-center-view.md#15b2-importexport](./task-030-ui-05-skill-center-view.md#15b2-importexport)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

### Step 5: ExportSkillDialog 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05-skill-center-view.md#15b2-importexport](./task-030-ui-05-skill-center-view.md#15b2-importexport)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

## 検証条件

### 必須条件

- [ ] GitHubリポジトリからスキルをインポートできる
- [ ] Gistからスキルをインポートできる
- [ ] URLからSKILL.mdを指定してインポートできる
- [ ] ローカルディレクトリからインポートできる
- [ ] Gistへエクスポートして共有URLが取得できる
- [ ] インポート時のセキュリティ検証が機能する

### 自動検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --grep "SkillShare"
```

## 関連仕様

- specification.md §20: 共有・インポート機能
- technical-decisions.md §21: 設計判断
