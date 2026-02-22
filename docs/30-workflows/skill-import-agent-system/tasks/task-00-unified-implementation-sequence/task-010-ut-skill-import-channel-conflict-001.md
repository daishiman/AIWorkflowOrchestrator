---
id: UT-SKILL-IMPORT-CHANNEL-CONFLICT-001
title: "skill:import IPCチャネル名競合の解消"
tier: 3
depends_on: [TASK-9F]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, ipc, skill-management, channel-naming, security]
---

# skill:import IPCチャネル名競合の解消

## 1. Why（なぜ必要か）

### 1.1 背景

既存の `skill:import` チャネル（UT-FIX-SKILL-IMPORT-INTERFACE-001 で修正済み）は、ローカルスキル一覧からのインポートを行う。引数は `skillName: string`（単一のスキル名）で、`SkillImportManager.importSkills([skillName])` を呼び出す。

一方、TASK-9F（スキル共有・インポート機能）で新たに定義される `skill:import` チャネルは、`ShareTarget` オブジェクト（GitHub/Gist/URL/ローカルパスからの外部ソースインポート）を引数に取り、`SkillShareManager.import(source)` を呼び出す。

### 1.2 問題点

- **同一チャネル名 `skill:import` で引数型・用途が完全に異なる**: 既存は `string`、TASK-9F は `ShareTarget` オブジェクト
- **P44パターン（IPCハンドラとPreloadのインターフェース不整合）の再発リスク**: `ipcMain.handle()` は同一チャネルに二重登録すると例外を送出する（P5）。どちらかのハンドラしか登録できないため、実装順序によって片方が使用不能になる
- **05-skill-center-view.md のセクション15B.2（ImportExportDialog）の IPC テーブルにも `skill:import` と記載されており、既存チャネルとの混同が発生する**
- **05-skill-center-view.md のセクション11 IPC連携テーブルに、15B.2 で必要な新規チャネル（`skill:validateSource`, `skill:export`）が未登録**

### 1.3 放置した場合の影響

- TASK-9F 実装時に `ipcMain.handle()` の二重登録例外が発生し、既存のスキルインポート機能が使用不能になる
- チャネル名の競合により、Preload 側の `skill-api.ts` でどちらの引数型を使用すべきか不明確になる
- IPC 契約の信頼性が低下し、P44/P45 パターンの再発を招く

---

## 2. What（何をするか）

### 2.1 目的

TASK-9F の外部ソースインポート用チャネルを `skill:importFromSource` に改名し、既存の `skill:import` チャネルとの競合を解消する。合わせて、05-skill-center-view.md の IPC テーブルを正確に更新する。

### 2.2 最終ゴール

- 既存の `skill:import`（ローカルスキル一覧からのインポート、引数: `string`）が変更なく動作する
- TASK-9F の外部インポートが `skill:importFromSource`（引数: `ShareTarget`）で独立動作する
- 05-skill-center-view.md のセクション11 IPC連携テーブルに新規3チャネルが登録されている
- 05-skill-center-view.md のセクション15B.2 のチャネル名が `skill:importFromSource` に更新されている

### 2.3 スコープ

#### 含むもの

- task-022-task-9f-skill-share.md の Step 3 チャネル名修正（`skill:import` → `skill:importFromSource`）
- 05-skill-center-view.md のセクション15B.2 IPC テーブル修正
- 05-skill-center-view.md のセクション11 IPC連携テーブルに `skill:importFromSource`, `skill:validateSource`, `skill:export` の3チャネル追加
- task-022-task-9f-skill-share.md の artifacts.modifies に `channels.ts` 追加

#### 含まないもの

- 既存の `skill:import` ハンドラの変更（変更不要）
- TASK-9F の実装自体（本タスクは仕様書修正のみ）
- channels.ts / skill-api.ts / preload/types.ts の実コード変更（TASK-9F 実装時に行う）

### 2.4 成果物

| 成果物             | パス                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| task-9f 仕様書修正 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`     |
| 05 仕様書修正      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` |

---

## 3. How（どう実現するか）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-INTERFACE-001 が完了していること（既存 `skill:import` の引数が `string` に修正済み）
- task-022-task-9f-skill-share.md が存在すること

### 3.2 依存タスク

| タスクID                          | 関係     | 説明                                     |
| --------------------------------- | -------- | ---------------------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 完了済   | 既存 skill:import のインターフェース修正 |
| TASK-9F                           | 修正対象 | スキル共有・インポート機能仕様           |

### 3.3 必要な知識

- IPC チャネル命名規則（`skill:` プレフィックス + 動作名）
- P44 パターン（IPCハンドラとPreloadのインターフェース不整合）の理解
- P5 パターン（`ipcMain.handle()` 二重登録例外）の理解
- channels.ts のホワイトリスト管理方式

### 3.4 推奨アプローチ

仕様書レベルでの修正のみ。TASK-9F の `skill:import` を `skill:importFromSource` に改名し、05-skill-center-view.md の IPC テーブルを整合させる。実コード変更は TASK-9F 実装時に行う。

### 3.5 実装課題と解決策

#### 課題1: ShareTarget 型の packages/shared 未定義

- **問題**: `ShareTarget` 型が task-022-task-9f-skill-share.md 内でのみ定義されており、`packages/shared` に未配置。TASK-9F 実装時に P32（型定義の二箇所同時更新必須）リスクがある
- **解決策**: TASK-9F の実装時に `packages/shared/src/types/skillShare.ts` に `ShareTarget`/`ImportResult`/`ExportResult` を配置し、Main/Preload 両方から参照する。本タスクでは仕様書に注記を追加する

#### 課題2: channels.ts ホワイトリストへの3チャネル追加

- **問題**: `skill:importFromSource`, `skill:validateSource`, `skill:export` の3チャネルを channels.ts に追加する必要がある
- **解決策**: TASK-9F の artifacts.modifies に `channels.ts` を追加し、実装時に漏れなく対応する

---

## 4. Steps（実行手順）

### Step 1: task-022-task-9f-skill-share.md の修正

1. Step 3「IPC拡張」のチャネル一覧で `skill:import` を `skill:importFromSource` に変更
2. artifacts.modifies に以下を追加:
   - `apps/desktop/src/main/ipc/channels.ts`
   - `apps/desktop/src/preload/types.ts`
3. 注記を追加: 「`skill:import` チャネルは既存のローカルスキルインポート（UT-FIX-SKILL-IMPORT-INTERFACE-001）で使用済み。外部ソースインポートは `skill:importFromSource` を使用する」

### Step 2: 05-skill-center-view.md の修正

1. セクション15B.2 の IPC テーブルで `skill:import` を `skill:importFromSource` に変更
2. セクション11 IPC連携テーブルに以下の3チャネルを追加:
   - `skill:importFromSource` — 外部ソースからのスキルインポート（引数: `ShareTarget`）
   - `skill:validateSource` — インポート元の検証（引数: `ShareTarget`）
   - `skill:export` — スキルのエクスポート（引数: `{ skillName: string, destination: ShareTarget }`）

### Step 3: 整合性確認

1. `grep -rn "skill:import" docs/30-workflows/skill-import-agent-system/` で全仕様書を検索し、チャネル名の混同がないことを確認
2. 既存の `skill:import`（ローカルインポート）と `skill:importFromSource`（外部インポート）の用途が明確に区別されていることを確認

---

## 5. Checklist（チェックリスト）

- [ ] task-022-task-9f-skill-share.md の `skill:import` が `skill:importFromSource` に変更されている
- [ ] task-022-task-9f-skill-share.md の artifacts.modifies に `channels.ts` が含まれている
- [ ] 05-skill-center-view.md のセクション15B.2 のチャネル名が `skill:importFromSource` に更新されている
- [ ] 05-skill-center-view.md のセクション11 に `skill:importFromSource`, `skill:validateSource`, `skill:export` が追加されている
- [ ] 既存の `skill:import` チャネルの仕様に変更がないことを確認
- [ ] 全仕様書でチャネル名の一貫性が保たれている

---

## 6. Verification（検証方法）

### 仕様書検証

```bash
# チャネル名の整合性確認
grep -rn "skill:import" docs/30-workflows/skill-import-agent-system/tasks/

# 既存チャネル（string引数）と新規チャネル（ShareTarget引数）の区別確認
grep -rn "skill:importFromSource" docs/30-workflows/skill-import-agent-system/tasks/
```

### TASK-9F 実装時の検証

```bash
# channels.ts に新規チャネルが登録されていることを確認
grep -n "importFromSource\|validateSource\|skill:export" apps/desktop/src/main/ipc/channels.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# 既存のスキルインポートテストが影響を受けていないことを確認
pnpm --filter @repo/desktop test -- --grep "skill:import"
```

---

## 7. Risks（リスクと対策）

| リスク                                                          | 影響度 | 発生確率 | 対策                                                   |
| --------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------ |
| 他の仕様書にも `skill:import` が TASK-9F の文脈で使用されている | 中     | 中       | `grep -rn` で全仕様書を検索して修正                    |
| TASK-9F 実装者が仕様書修正を見落とし旧チャネル名で実装する      | 高     | 低       | task-022-task-9f-skill-share.md に明確な注記を追加     |
| `skill:importFromSource` の命名が長すぎてコードの可読性が低下   | 低     | 低       | Preload API では `importFromSource()` メソッド名で短縮 |

---

## 8. References（参照）

| ドキュメント                      | パス                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| task-9f 仕様書                    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`     |
| 05 UI仕様書                       | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` |
| P44（IPC不整合）                  | `.claude/rules/06-known-pitfalls.md#P44`                                                                                        |
| P5（二重登録）                    | `.claude/rules/06-known-pitfalls.md#P5`                                                                                         |
| P32（型定義二箇所更新）           | `.claude/rules/06-known-pitfalls.md#P32`                                                                                        |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 既存 skill:import 修正タスク                                                                                                    |

### 関連タスク

| タスクID                           | 関係     | 説明                           |
| ---------------------------------- | -------- | ------------------------------ |
| UT-FIX-SKILL-IMPORT-INTERFACE-001  | 完了済   | 既存 skill:import の引数型修正 |
| TASK-9F                            | 修正対象 | スキル共有・インポート機能     |
| UT-SKILL-IPC-PRELOAD-EXTENSION-001 | 関連     | 30チャネル追加の全体計画       |

---

## 9. Notes（補足）

### チャネル命名規則

既存のスキル関連チャネルは以下の命名パターンに従う:

- `skill:list` — 一覧取得
- `skill:import` — ローカルインポート（既存）
- `skill:remove` — 削除
- `skill:chain:*` — チェーン関連（TASK-9D）

TASK-9F の外部インポートは `skill:importFromSource` として、ローカルインポートとの差異を命名で明示する。

### P44 パターン再発防止

本タスクは P44（skill:import/remove IPCハンドラとPreloadのインターフェース不整合）の教訓を踏まえ、チャネル名の競合を仕様書レベルで事前に解消する予防的タスクである。実装開始前に仕様を修正することで、ランタイムエラーの発生を未然に防止する。
