---
id: UT-SKILL-IPC-PRELOAD-EXTENSION-001
title: "task-9D-J 30チャネル IPC/Preload 拡張計画の策定"
tier: 3
depends_on: [TASK-9B, UT-SKILL-IMPORT-CHANNEL-CONFLICT-001]
status: pending
priority: high
estimated_complexity: large
tags: [backend, ipc, preload, channels, skill-management, architecture]
---

# task-9D-J 30チャネル IPC/Preload 拡張計画の策定

## 1. Why（なぜ必要か）

### 1.1 背景

task-9D-J の実装には合計30の新規 IPC チャネルと、それに対応する Preload API の拡張が必要である。現在、チャネル定義は `channels.ts` のホワイトリストで管理され、Preload API は `skill-api.ts` に集約されている。30チャネルの一括追加は、これらのファイルの肥大化を招き、保守性の低下と IPC 契約ドリフト（P44/P45）のリスクを増大させる。

### 1.2 問題点

**チャネル内訳**:

| task-9             | 追加チャネル数 | プレフィックス                                                   | 通信パターン          |
| ------------------ | -------------- | ---------------------------------------------------------------- | --------------------- |
| 9D（チェーン）     | 5              | `skill:chain:*`                                                  | handle（5）           |
| 9E（フォーク）     | 1              | `skill:fork`                                                     | handle（1）           |
| 9F（共有）         | 3              | `skill:importFromSource`, `skill:export`, `skill:validateSource` | handle（3）           |
| 9G（スケジュール） | 5              | `skill:schedule:*`                                               | handle（5）           |
| 9H（デバッグ）     | 7              | `skill:debug:*`                                                  | handle（6）+ on（1）  |
| 9I（ドキュメント） | 4              | `skill:docs:*`                                                   | handle（4）           |
| 9J（分析）         | 5              | `skill:analytics:*`                                              | handle（5）           |
| **合計**           | **30**         |                                                                  | **handle: 29, on: 1** |

**具体的な問題**:

1. **channels.ts の肥大化**: 既存チャネル数に30チャネルが追加され、ホワイトリストが倍増する。個別チャネルの文字列リテラル管理では、追加漏れや typo のリスクが高まる
2. **skill-api.ts の肥大化**: 30メソッドの追加により、1ファイルに集約された Preload API が巨大化する。単一責務原則（SRP）に違反し、変更影響範囲が不明確になる
3. **P32（型定義二箇所同時更新）の30倍リスク**: 各チャネルについて `channels.ts`、`skill-api.ts`、`preload/types.ts` の3箇所を同時更新する必要があり、30チャネル分の更新漏れリスクがある
4. **packages/shared への型定義未配置**: task-9D-J で使用する型（`SkillChainDefinition`, `ScheduledSkill`, `DebugSession`, `GeneratedDoc`, `AnalyticsData` 等）が `packages/shared` に未定義で、各タスクの仕様書内でのみ定義されている
5. **task-9D-J の artifacts.modifies に channels.ts が未記載**: 多くの task-9 仕様書の artifacts.modifies に `channels.ts` が含まれておらず、実装時のチェックリスト漏れが発生する

### 1.3 放置した場合の影響

- task-9D-J の実装が進むにつれて channels.ts と skill-api.ts が無秩序に肥大化し、どのチャネルがどの機能に属するか不明確になる
- P32 パターンの更新漏れにより、Preload API と Main ハンドラのインターフェース不整合（P44）が多発する
- 型定義が仕様書とコードで二重管理され、実装と仕様の乖離が恒常化する
- チャネルの追加・削除・名前変更時に、影響範囲の特定が困難になる

---

## 2. What（何をするか）

### 2.1 目的

task-9D-J の30チャネル追加に対応する IPC/Preload 拡張計画を策定し、channels.ts のホワイトリスト拡張方針、skill-api.ts の分割方針、packages/shared の型定義配置計画を明文化する。

### 2.2 最終ゴール

- 30チャネルの定義一覧が channels.ts の拡張計画として文書化されている
- skill-api.ts のサブネームスペース分割方針が決定されている
- packages/shared への型定義配置計画（ファイル名、export 構成）が明確になっている
- 各 task-9 仕様書の artifacts.modifies に channels.ts が追加されている
- 名前空間ベースのホワイトリスト（`skill:chain:*` プレフィックスマッチ）の採否が判断されている

### 2.3 スコープ

#### 含むもの

- 30チャネルの完全な定義一覧作成（チャネル名、引数型、戻り値型、通信パターン）
- channels.ts の拡張方針策定（個別定義 vs プレフィックスマッチ）
- skill-api.ts のサブネームスペース分割設計
- packages/shared への型定義ファイル配置計画
- preload/types.ts の拡張計画
- 各 task-9D-J 仕様書の artifacts.modifies 修正

#### 含まないもの

- 実際のコード実装（各 task-9 の実装タスクで行う）
- 既存の skill:import / skill:remove / skill:list チャネルの変更
- テストコードの作成

### 2.4 成果物

| 成果物         | パス                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| IPC 拡張計画書 | `docs/30-workflows/skill-import-agent-system/tasks/ipc-extension-plan.md`（新規）                                                |
| task-9D 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md`     |
| task-9E 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md`      |
| task-9F 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`      |
| task-9G 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`  |
| task-9H 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`     |
| task-9I 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md`      |
| task-9J 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md` |

---

## 3. How（どう実現するか）

### 3.1 前提条件

- task-9D-J の仕様書が存在すること
- UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 が完了していること（skill:importFromSource への改名済み）
- 既存の channels.ts / skill-api.ts / preload/types.ts の構造を理解していること

### 3.2 依存タスク

| タスクID                             | 関係     | 説明                                                             |
| ------------------------------------ | -------- | ---------------------------------------------------------------- |
| TASK-9B                              | 前提     | skill-creator 基盤実装                                           |
| UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 | 前提     | skill:import チャネル競合解消（skill:importFromSource への改名） |
| TASK-9D-J                            | 修正対象 | 各機能仕様書                                                     |

### 3.3 必要な知識

- channels.ts のホワイトリスト管理方式
- contextBridge / safeInvoke / safeOn パターン
- P32（型定義の二箇所同時更新必須）パターン
- Atomic Design のファイル分割原則（skill-api.ts の分割に応用）

### 3.4 推奨アプローチ

#### A. channels.ts の拡張方針

**推奨: ネームスペースグループ化 + 個別定義**

```typescript
// channels.ts - ネームスペースグループ化
export const IPC_CHANNELS = {
  // 既存チャネル
  SKILL_LIST: "skill:list",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",

  // 9D: チェーン
  SKILL_CHAIN_LIST: "skill:chain:list",
  SKILL_CHAIN_GET: "skill:chain:get",
  SKILL_CHAIN_SAVE: "skill:chain:save",
  SKILL_CHAIN_DELETE: "skill:chain:delete",
  SKILL_CHAIN_EXECUTE: "skill:chain:execute",

  // 9E: フォーク
  SKILL_FORK: "skill:fork",

  // 9F: 共有
  SKILL_IMPORT_FROM_SOURCE: "skill:importFromSource",
  SKILL_EXPORT: "skill:export",
  SKILL_VALIDATE_SOURCE: "skill:validateSource",

  // 9G: スケジュール
  SKILL_SCHEDULE_LIST: "skill:schedule:list",
  SKILL_SCHEDULE_CREATE: "skill:schedule:create",
  SKILL_SCHEDULE_UPDATE: "skill:schedule:update",
  SKILL_SCHEDULE_DELETE: "skill:schedule:delete",
  SKILL_SCHEDULE_TOGGLE: "skill:schedule:toggle",

  // 9H: デバッグ
  SKILL_DEBUG_START: "skill:debug:start",
  SKILL_DEBUG_STOP: "skill:debug:stop",
  SKILL_DEBUG_PAUSE: "skill:debug:pause",
  SKILL_DEBUG_RESUME: "skill:debug:resume",
  SKILL_DEBUG_STEP: "skill:debug:step",
  SKILL_DEBUG_GET_STATE: "skill:debug:getState",
  SKILL_DEBUG_EVENT: "skill:debug:event", // on パターン（Main→Renderer push）

  // 9I: ドキュメント
  SKILL_DOCS_GENERATE: "skill:docs:generate",
  SKILL_DOCS_LIST: "skill:docs:list",
  SKILL_DOCS_GET: "skill:docs:get",
  SKILL_DOCS_EXPORT: "skill:docs:export",

  // 9J: 分析
  SKILL_ANALYTICS_GET: "skill:analytics:get",
  SKILL_ANALYTICS_SUMMARY: "skill:analytics:summary",
  SKILL_ANALYTICS_TREND: "skill:analytics:trend",
  SKILL_ANALYTICS_COMPARE: "skill:analytics:compare",
  SKILL_ANALYTICS_EXPORT: "skill:analytics:export",
} as const;
```

**プレフィックスマッチのホワイトリストは不採用**: セキュリティ上、`skill:*` のようなワイルドカードマッチはチャネルのホワイトリスト管理の意義を損なう。個別定義を維持し、定数名のグループ化で可読性を確保する。

#### B. skill-api.ts のサブネームスペース分割

**推奨: 機能別サブオブジェクト**

```typescript
// skill-api.ts の構造
export const skillAPI = {
  // 既存（変更なし）
  list: () => safeInvoke(IPC_CHANNELS.SKILL_LIST),
  import: (skillName: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),
  remove: (skillName: string) =>
    safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName),

  // 9D: チェーン
  chain: {
    list: () => safeInvoke(IPC_CHANNELS.SKILL_CHAIN_LIST),
    get: (chainId: string) => safeInvoke(IPC_CHANNELS.SKILL_CHAIN_GET, chainId),
    save: (chain: SkillChainDefinition) =>
      safeInvoke(IPC_CHANNELS.SKILL_CHAIN_SAVE, chain),
    delete: (chainId: string) =>
      safeInvoke(IPC_CHANNELS.SKILL_CHAIN_DELETE, chainId),
    execute: (chainId: string) =>
      safeInvoke(IPC_CHANNELS.SKILL_CHAIN_EXECUTE, chainId),
  },

  // 9H: デバッグ
  debug: {
    start: (config: DebugConfig) =>
      safeInvoke(IPC_CHANNELS.SKILL_DEBUG_START, config),
    stop: (sessionId: string) =>
      safeInvoke(IPC_CHANNELS.SKILL_DEBUG_STOP, sessionId),
    // ...
    onEvent: (callback: (event: DebugEvent) => void) =>
      safeOn(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback),
  },

  // 他のサブネームスペースも同様
};
```

#### C. packages/shared 型定義配置計画

```
packages/shared/src/types/
  skill/
    chain.ts        # SkillChainDefinition, SkillChainStep, etc.
    schedule.ts     # ScheduledSkill, ScheduleConfig, etc.
    debug.ts        # DebugSession, DebugEvent, DebugConfig, etc.
    docs.ts         # GeneratedDoc, DocTemplate, etc.
    analytics.ts    # AnalyticsData, AnalyticsPeriod, etc.
    share.ts        # ShareTarget, ImportResult, ExportResult
    fork.ts         # ForkConfig, ForkResult
    index.ts        # 全エクスポートのバレル
```

### 3.5 実装課題と解決策

#### 課題1: channels.ts ホワイトリストの肥大化

- **問題**: 既存チャネル + 30チャネル = 約50チャネルの定数定義でファイルが肥大化する
- **解決策**: コメントによるネームスペースグループ化で視認性を維持する。ファイル分割（`skill-channels.ts` 等）は不採用（ホワイトリスト検証ロジックが複数ファイルに分散するため）

#### 課題2: skill-api.ts のサブネームスペースと contextBridge の互換性

- **問題**: `contextBridge.exposeInMainWorld` はネストしたオブジェクトの関数を正しくシリアライズするが、プロトタイプチェーンは保持しない。サブオブジェクト内の関数が正しく公開されるか検証が必要
- **解決策**: contextBridge はプレーンオブジェクトのネストされた関数をサポートする（Electron 公式ドキュメントで確認済み）。ただし、2階層以上のネスト（`skill.chain.step.edit()`）は避け、1階層のサブオブジェクトに留める

#### 課題3: P32 対策の30チャネル適用

- **問題**: 30チャネル分の `channels.ts` / `skill-api.ts` / `preload/types.ts` 同時更新を確実に実行する必要がある
- **解決策**: IPC 拡張計画書にチャネル定義チェックリストを含め、各チャネルについて3ファイルの更新ステータスを管理する。task-9 の各実装タスクで、自身が担当するチャネル分のチェックリストを消化する

#### 課題4: skill:debug:event の on パターン特殊対応

- **問題**: 30チャネル中29チャネルは `ipcMain.handle`（リクエスト/レスポンス）だが、`skill:debug:event` のみ `ipcMain.on` / `safeOn`（プッシュ通知）パターン。ホワイトリスト検証とPreload API で特別な扱いが必要
- **解決策**: channels.ts にチャネルのパターン種別コメントを追加。skill-api.ts の `debug.onEvent()` メソッドは `safeOn` を使用し、クリーンアップ関数を返す

---

## 4. Steps（実行手順）

### Step 1: 既存の channels.ts / skill-api.ts / preload/types.ts の構造調査

1. `channels.ts` の現在のチャネル数と構造を確認
2. `skill-api.ts` の現在のメソッド数と構造を確認
3. `preload/types.ts` の SkillAPI 型定義を確認
4. contextBridge でのネストオブジェクト公開の動作を Electron ドキュメントで確認

### Step 2: 30チャネル完全定義一覧の作成

1. task-9D-J の各仕様書から IPC チャネル定義を抽出
2. 各チャネルについて以下を明文化:
   - チャネル名（定数名 + 文字列リテラル）
   - 引数型
   - 戻り値型
   - 通信パターン（handle / on）
   - 所属する task-9
3. チャネル名の一貫性を検証（命名規則: `skill:{feature}:{action}`）

### Step 3: IPC 拡張計画書の作成

1. `ipc-extension-plan.md` を新規作成
2. 以下を記載:
   - 30チャネル完全定義テーブル
   - channels.ts 拡張方針（ネームスペースグループ化）
   - skill-api.ts サブネームスペース分割設計
   - packages/shared 型定義配置計画
   - P32 対応チェックリスト（チャネル x 3ファイル = 90項目）
   - 実装順序（task-9D → 9E → 9F → ... の推奨順）

### Step 4: task-9D-J 仕様書の artifacts.modifies 修正

1. 各 task-9 仕様書の artifacts.modifies に以下を追加:
   - `apps/desktop/src/main/ipc/channels.ts`
   - `apps/desktop/src/preload/types.ts`
2. artifacts.creates に packages/shared の型定義ファイルを追加:
   - 例: `packages/shared/src/types/skill/chain.ts`（task-9D）

### Step 5: packages/shared の型定義配置計画の詳細設計

1. 各 task-9 仕様書から型定義を抽出
2. `packages/shared/src/types/skill/` 配下のファイル分割を決定
3. `packages/shared/src/types/skill/index.ts` のバレルファイル設計
4. `packages/shared/package.json` の exports フィールド拡張計画

### Step 6: 整合性確認

1. 30チャネルの定義が task-9D-J の仕様書と完全に一致することを確認
2. チャネル名の重複がないことを確認
3. 型定義の依存関係（例: `SkillChainStep` が `Skill` 型に依存）を検証
4. UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 の修正（skill:importFromSource）が反映されていることを確認

---

## 5. Checklist（チェックリスト）

### 計画書チェックリスト

- [ ] 30チャネルの完全定義テーブルが作成されている
- [ ] 各チャネルの引数型・戻り値型・通信パターンが明記されている
- [ ] チャネル名の重複がないことが検証されている
- [ ] channels.ts の拡張方針（ネームスペースグループ化）が決定されている
- [ ] プレフィックスマッチホワイトリストの採否が判断されている
- [ ] skill-api.ts のサブネームスペース分割設計が決定されている
- [ ] contextBridge でのネストオブジェクト公開の互換性が確認されている
- [ ] packages/shared の型定義ファイル配置計画が完成している
- [ ] P32 対応チェックリスト（90項目）が作成されている

### 仕様書修正チェックリスト

- [ ] task-9D の artifacts.modifies に channels.ts / preload/types.ts が追加されている
- [ ] task-9E の artifacts.modifies に channels.ts / preload/types.ts が追加されている
- [ ] task-9F の artifacts.modifies に channels.ts / preload/types.ts が追加されている
- [ ] task-9G の artifacts.modifies に channels.ts / preload/types.ts が追加されている
- [ ] task-9H の artifacts.modifies に channels.ts / preload/types.ts が追加されている
- [ ] task-9I の artifacts.modifies に channels.ts / preload/types.ts が追加されている
- [ ] task-9J の artifacts.modifies に channels.ts / preload/types.ts が追加されている
- [ ] 各 task-9 の artifacts.creates に packages/shared の型定義ファイルが追加されている

---

## 6. Verification（検証方法）

### 計画書検証

```bash
# 30チャネルの定義が漏れなく含まれていることを確認
grep -c "skill:" docs/30-workflows/skill-import-agent-system/tasks/ipc-extension-plan.md

# チャネル名の重複チェック
grep "skill:" docs/30-workflows/skill-import-agent-system/tasks/ipc-extension-plan.md | sort | uniq -d

# artifacts.modifies の更新確認
grep -l "channels.ts" docs/30-workflows/skill-import-agent-system/tasks/task-9{d,e,f,g,h,i,j}*.md
```

### 実装時の検証

```bash
# channels.ts にすべてのチャネルが定義されていることを確認
grep -c "SKILL_" apps/desktop/src/main/ipc/channels.ts

# skill-api.ts のメソッド数確認
grep -c "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts

# packages/shared の型定義ファイルが存在することを確認
ls packages/shared/src/types/skill/

# 型チェック
pnpm typecheck

# preload/types.ts と skill-api.ts の整合性確認
pnpm --filter @repo/desktop typecheck
```

---

## 7. Risks（リスクと対策）

| リスク                                                                      | 影響度 | 発生確率 | 対策                                                                         |
| --------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------- |
| contextBridge がネストオブジェクトの関数を正しくシリアライズできない        | 高     | 低       | Electron 公式ドキュメントで確認済み。実装前に PoC で検証する                 |
| 30チャネルの一括追加で channels.ts のホワイトリスト検証パフォーマンスが低下 | 低     | 低       | ホワイトリストは Set/Map で O(1) 検索。50チャネル程度では問題なし            |
| task-9D-J の実装順序変更により、依存する型定義が未定義になる                | 中     | 中       | packages/shared の型定義を先行して作成する。型定義のみの PR を先にマージ     |
| skill-api.ts の分割が既存のテストモックに影響                               | 中     | 中       | 既存メソッドのインターフェースは変更しない。サブネームスペースは追加のみ     |
| P32 の90項目チェックリストが形骸化する                                      | 中     | 高       | 各 task-9 の Phase 9（品質検証）で自身のチャネル分を必ず検証するフローにする |

---

## 8. References（参照）

| ドキュメント            | パス                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| task-9D 仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md`     |
| task-9E 仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md`      |
| task-9F 仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`      |
| task-9G 仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`  |
| task-9H 仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`     |
| task-9I 仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md`      |
| task-9J 仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md` |
| channels.ts             | `apps/desktop/src/main/ipc/channels.ts`                                                                                          |
| skill-api.ts            | `apps/desktop/src/preload/skill-api.ts`                                                                                          |
| preload/types.ts        | `apps/desktop/src/preload/types.ts`                                                                                              |
| P32（型定義二箇所更新） | `.claude/rules/06-known-pitfalls.md#P32`                                                                                         |
| P44（IPC不整合）        | `.claude/rules/06-known-pitfalls.md#P44`                                                                                         |
| P5（二重登録）          | `.claude/rules/06-known-pitfalls.md#P5`                                                                                          |

### 関連タスク

| タスクID                             | 関係     | 説明                                   |
| ------------------------------------ | -------- | -------------------------------------- |
| TASK-9B                              | 前提     | skill-creator 基盤実装                 |
| UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 | 前提     | skill:import チャネル競合解消          |
| UT-IPC-DATA-FLOW-TYPE-GAPS-001       | 関連     | データフロー型ギャップ解消             |
| TASK-9D-J                            | 修正対象 | 各機能仕様書の artifacts.modifies 更新 |

---

## 9. Notes（補足）

### 30チャネル完全定義テーブル（速報版）

以下は各 task-9 仕様書から抽出したチャネル一覧の速報版である。IPC 拡張計画書では、各チャネルの引数型・戻り値型を完全に定義する。

| #   | チャネル名                | 引数概要                        | 戻り値概要               | task | パターン |
| --- | ------------------------- | ------------------------------- | ------------------------ | ---- | -------- |
| 1   | `skill:chain:list`        | なし                            | `SkillChainDefinition[]` | 9D   | handle   |
| 2   | `skill:chain:get`         | `chainId: string`               | `SkillChainDefinition`   | 9D   | handle   |
| 3   | `skill:chain:save`        | `SkillChainDefinition`          | `void`                   | 9D   | handle   |
| 4   | `skill:chain:delete`      | `chainId: string`               | `void`                   | 9D   | handle   |
| 5   | `skill:chain:execute`     | `chainId: string`               | `SkillChainResult`       | 9D   | handle   |
| 6   | `skill:fork`              | `ForkConfig`                    | `ForkResult`             | 9E   | handle   |
| 7   | `skill:importFromSource`  | `ShareTarget`                   | `ImportResult`           | 9F   | handle   |
| 8   | `skill:export`            | `{ skillName, destination }`    | `ExportResult`           | 9F   | handle   |
| 9   | `skill:validateSource`    | `ShareTarget`                   | `ValidationResult`       | 9F   | handle   |
| 10  | `skill:schedule:list`     | なし                            | `ScheduledSkill[]`       | 9G   | handle   |
| 11  | `skill:schedule:create`   | `ScheduleConfig`                | `ScheduledSkill`         | 9G   | handle   |
| 12  | `skill:schedule:update`   | `{ id, config }`                | `ScheduledSkill`         | 9G   | handle   |
| 13  | `skill:schedule:delete`   | `scheduleId: string`            | `void`                   | 9G   | handle   |
| 14  | `skill:schedule:toggle`   | `{ id, enabled }`               | `ScheduledSkill`         | 9G   | handle   |
| 15  | `skill:debug:start`       | `DebugConfig`                   | `DebugSession`           | 9H   | handle   |
| 16  | `skill:debug:stop`        | `sessionId: string`             | `void`                   | 9H   | handle   |
| 17  | `skill:debug:pause`       | `sessionId: string`             | `void`                   | 9H   | handle   |
| 18  | `skill:debug:resume`      | `sessionId: string`             | `void`                   | 9H   | handle   |
| 19  | `skill:debug:step`        | `sessionId: string`             | `StepResult`             | 9H   | handle   |
| 20  | `skill:debug:getState`    | `sessionId: string`             | `DebugState`             | 9H   | handle   |
| 21  | `skill:debug:event`       | —                               | `DebugEvent`（push）     | 9H   | on       |
| 22  | `skill:docs:generate`     | `{ skillName, template? }`      | `GeneratedDoc`           | 9I   | handle   |
| 23  | `skill:docs:list`         | `skillName: string`             | `GeneratedDoc[]`         | 9I   | handle   |
| 24  | `skill:docs:get`          | `docId: string`                 | `GeneratedDoc`           | 9I   | handle   |
| 25  | `skill:docs:export`       | `{ docId, format, outputPath }` | `void`                   | 9I   | handle   |
| 26  | `skill:analytics:get`     | `{ skillName, period }`         | `AnalyticsData`          | 9J   | handle   |
| 27  | `skill:analytics:summary` | `period: AnalyticsPeriod`       | `AnalyticsSummary`       | 9J   | handle   |
| 28  | `skill:analytics:trend`   | `{ skillName, metric, period }` | `TrendData`              | 9J   | handle   |
| 29  | `skill:analytics:compare` | `{ skillNames, period }`        | `CompareResult`          | 9J   | handle   |
| 30  | `skill:analytics:export`  | `{ format, period }`            | `ExportedReport`         | 9J   | handle   |

### 実装推奨順序

1. **packages/shared の型定義**（全タスク共通の前提）
2. **channels.ts の拡張**（30チャネル一括追加、task-9D-J 共通）
3. **task-9D → 9E → 9F → 9G → 9H → 9I → 9J**（各タスクの実装で skill-api.ts と preload/types.ts を順次拡張）

型定義と channels.ts を先行して整備することで、各 task-9 の実装時にはチャネル定義の追加を気にせずハンドラとサービスの実装に集中できる。

### skill-api.ts 分割の代替案

| 案                          | 説明                    | メリット                             | デメリット                                              |
| --------------------------- | ----------------------- | ------------------------------------ | ------------------------------------------------------- |
| A: サブオブジェクト（推奨） | `skillAPI.chain.list()` | 既存の skillAPI を維持しつつ拡張可能 | contextBridge の互換性確認が必要                        |
| B: 個別ファイル分割         | `skill-chain-api.ts` 等 | 単一責務原則に最も適合               | contextBridge の exposeInMainWorld を複数回呼ぶ必要あり |
| C: フラット（現状維持）     | `skillAPI.chainList()`  | 変更最小                             | 50メソッドが1オブジェクトに集約され可読性低下           |

案A を推奨する。contextBridge はプレーンオブジェクトのネストをサポートしており、`window.electronAPI.skill.chain.list()` のような呼び出しが可能である。
