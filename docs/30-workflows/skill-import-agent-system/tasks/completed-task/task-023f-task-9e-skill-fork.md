---
id: TASK-9E
title: スキルフォーク・派生機能実装
tier: 3
phase: 9
depends_on: [TASK-9B]
parallel_with: [TASK-9D, TASK-9F, TASK-9G, TASK-9H, TASK-9I, TASK-9J]
blocks: []
status: pending
priority: low
estimated_complexity: medium
tags: [backend, main, skill-management, fork, derive, future]

execution:
  mode: sequential
  timeout_minutes: 60
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillForker.ts
    - packages/shared/src/types/skill-fork.ts
  # UI成果物は ./task-030-ui-05-skill-center-view.md#15B.1 で定義
  modifies:
    - packages/shared/src/types/index.ts
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/channels.ts
    - apps/desktop/src/preload/skill-api.ts
    - apps/desktop/src/preload/types.ts
---

# スキルフォーク・派生機能実装

## 概要

既存スキルをベースに新しいスキルを作成する機能。元スキルの設定や構造を引き継ぎながらカスタマイズできる。

## 入力

- TASK-9B: skill-creator スキル（forkコマンド追加済み）
- specification.md §19: フォーク・派生機能仕様
- technical-decisions.md §20: 設計判断

## aiworkflow-requirements 仕様抽出（実装前提）

| 仕様書                                    | 抽出事項                                                               | TASK-9E への適用                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `api-ipc-agent.md`                        | IPC の Request/Response を `IpcResult<T>` で統一する                   | `skill:fork` の戻り値を `IpcResult<ForkResult>` として扱う                                    |
| `architecture-overview.md`                | Main/IPC/Preload の責務分離と登録位置を統一する                        | `SkillForker`（Main）/`skillHandlers.ts`（IPC）/`skill-api.ts`（Preload）の責務境界を固定する |
| `architecture-implementation-patterns.md` | 既知の IPC 実装パターンと反パターンを回避する                          | P42/P44/P45 の実装チェックを Phase 10/12 に組み込む                                           |
| `interfaces-agent-sdk-skill.md`           | SkillCreator 系に `skill-creator:fork` が存在する                      | TASK-9E は Skill API ドメインの `skill:fork` を追加し、責務を分離する                         |
| `security-electron-ipc.md`                | `validateIpcSender` + P42 3段バリデーション + sanitizeError を適用する | `skillHandlers.ts` の `skill:fork` ハンドラに同一パターンを適用する                           |
| `security-api-electron.md`                | Preload は `safeInvoke` 経由で最小権限公開する                         | `skill-api.ts` に `forkSkill` を追加し、チャンネルは `channels.ts` 定数参照に統一する         |
| `error-handling.md`                       | バリデーションエラーと FS エラーを分離し、内部情報を露出しない         | `ForkResult.warnings` と `IpcResult.error` の責務分離を維持する                               |
| `ipc-contract-checklist.md`               | P44/P45 対策としてハンドラ/Preload/型定義の同時更新を必須化            | Phase 10 レビューと Phase 12 仕様更新でチェック項目として実施する                             |
| `quality-requirements.md`                 | カバレッジ閾値（Line/Branch/Function）を固定する                       | Phase 6/7 の完了条件とゲート判定を数値基準で固定する                                          |
| `testing-component-patterns.md`           | テスト拡充時のケース設計観点を固定する                                 | エッジケース、異常系、統合テストの不足を Phase 6 で埋める                                     |

### IPCチャネル命名方針

- `skill-creator:fork`: `skillCreatorHandlers.ts` / `skill-creator-api.ts` の既存責務を維持
- `skill:fork`: `skillHandlers.ts` / `skill-api.ts` に追加する TASK-9E 対象チャネル
- Phase 12 で `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `security-electron-ipc.md` へ `skill:fork` 契約を追記し、ドリフトを解消する

## 出力

- SkillForker サービス
- ForkSkillDialog UI コンポーネント

## 実装手順

### Step 1: 型定義追加と SkillForker 実装

**ファイル**: `packages/shared/src/types/skill-fork.ts`, `apps/desktop/src/main/services/skill/SkillForker.ts`

`ForkOptions` / `ForkResult` / `ForkMetadata` は `packages/shared/src/types/skill-fork.ts` に定義し、`SkillForker.ts` から import して利用する。

```typescript
export interface ForkOptions {
  sourceSkill: string;
  newName: string;
  description?: string;
  copyAgents: boolean;
  copyReferences: boolean;
  copyScripts: boolean;
  copyAssets: boolean;
  modifyAllowedTools?: string[];
}

export interface ForkResult {
  success: boolean;
  newSkillPath: string;
  copiedFiles: string[];
  warnings?: string[];
}

export interface ForkMetadata {
  forkedFrom: string;
  /** @format ISO 8601 — IPC経由では string として送受信 */
  forkedAt: string; // ISO 8601
  originalDescription?: string;
}

export class SkillForker {
  async fork(options: ForkOptions): Promise<ForkResult>;
  private modifySkillMd(content: string, options: ForkOptions): string;
  private copyDirectory(
    src: string,
    dest: string,
    subDir: string,
  ): Promise<string[]>;
  private writeForkMetadata(
    destPath: string,
    metadata: ForkMetadata,
  ): Promise<void>;
}
```

### IPC シリアライズ方針（Date 型）

本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。

- **バックエンド（Main Process）内部**: `Date` オブジェクトを使用
- **IPC 境界（保存/返却）**: `.toISOString()` で ISO 8601 文字列に変換
- **Renderer 側**: `string` として受け取り、表示時に `new Date(isoString)` で復元

### Step 2: IPC拡張

**チャネル追加**:

- `skill:fork` - スキルフォーク実行

### Step 3: ForkSkillDialog 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05-skill-center-view.md#15b1-forkskilldialog](./task-030-ui-05-skill-center-view.md#15b1-forkskilldialog)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

## 検証条件

### 必須条件

- [ ] 既存スキルをフォークして新スキルを作成できる
- [ ] SKILL.md の名前・説明が更新される
- [ ] 選択したサブディレクトリのみコピーされる
- [ ] フォークメタデータ（forked-from）が記録される
- [ ] 同名スキルへのフォークがエラーになる

### 自動検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --grep "SkillForker"
```

## 関連仕様

- specification.md §19: フォーク・派生機能
- technical-decisions.md §20: 設計判断
