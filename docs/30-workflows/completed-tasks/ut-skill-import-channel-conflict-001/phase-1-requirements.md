# Phase 1: 要件定義 - UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## メタ情報

| 項目               | 値                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                      |
| Phase              | 1（要件定義）                                                                             |
| 機能名             | ut-skill-import-channel-conflict-001                                                      |
| 作成日             | 2026-02-24                                                                                |
| 前提Phase          | なし（初回Phase）                                                                         |
| 目的               | 仕様書修正タスクの要件と受け入れ基準を定義する                                            |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-1/` |

## 目的

既存の `skill:import` IPCチャネル（ローカルスキルインポート、引数: `string`）と TASK-9F で新規定義される `skill:import` チャネル（外部ソースインポート、引数: `ShareTarget`）の名前競合を、仕様書修正のみで事前に解消するための要件を定義する。

## 背景

### 現状

1. **既存チャネル**: `skill:import`（UT-FIX-SKILL-IMPORT-INTERFACE-001 で修正済み）
   - 用途: ローカルスキル一覧からのインポート
   - 引数: `skillName: string`（単一のスキル名）
   - 呼び出し先: `SkillImportManager.importSkills([skillName])`

2. **TASK-9F 新規チャネル**: `skill:import`（task-022-task-9f-skill-share.md で定義）
   - 用途: 外部ソース（GitHub/Gist/URL/ローカルパス）からのインポート
   - 引数: `ShareTarget` オブジェクト
   - 呼び出し先: `SkillShareManager.import(source)`

### 問題の根本原因

- `ipcMain.handle()` は同一チャネルへの二重登録で例外を送出する（P5パターン）
- 引数型が `string` vs `ShareTarget` で完全に異なり、P44パターン（IPCハンドラとPreloadのインターフェース不整合）の再発リスクがある
- 05-skill-center-view.md のセクション15B.2 と セクション11 の IPC テーブルが整合していない

### タスクの性質

**本タスクは仕様書（Markdown）の修正のみを行い、コード変更は含まない。**

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1-1: 機能要件の定義

**目的**: 仕様書修正で達成すべき機能要件を明確に定義する

**機能要件一覧**:

| 要件ID | 要件                                                                              | 優先度 |
| ------ | --------------------------------------------------------------------------------- | ------ |
| FR-001 | TASK-9F の外部ソースインポート用チャネルを `skill:importFromSource` に改名する    | 必須   |
| FR-002 | task-022-task-9f-skill-share.md の Step 3 チャネル名を修正する                    | 必須   |
| FR-003 | 05-skill-center-view.md のセクション15B.2 IPC テーブルのチャネル名を修正する      | 必須   |
| FR-004 | 05-skill-center-view.md のセクション11 IPC 連携テーブルに3チャネルを追加する      | 必須   |
| FR-005 | task-022-task-9f-skill-share.md の artifacts.modifies に `channels.ts` を追加する | 必須   |
| FR-006 | 既存の `skill:import` チャネル（ローカルインポート）の仕様に変更を加えない        | 必須   |

### Task 1-2: 非機能要件の定義

**目的**: 仕様書修正の非機能要件を定義する

**非機能要件一覧**:

| 要件ID  | 要件                                                                                 | 優先度 |
| ------- | ------------------------------------------------------------------------------------ | ------ |
| NFR-001 | 修正後の仕様書で `skill:import` と `skill:importFromSource` の用途が明確に区別される | 必須   |
| NFR-002 | 全仕様書でチャネル名の一貫性が保たれていること                                       | 必須   |
| NFR-003 | TASK-9F 実装時に参照する注記が追加されていること                                     | 必須   |

### Task 1-3: 修正対象ファイルの特定

**目的**: 修正が必要なファイルとその箇所を特定する

**修正対象ファイル**:

| #   | ファイル       | パス                                                                                                                            | 修正箇所                      | 修正内容                                                                   |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| 1   | task-9f 仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`     | Step 3「IPC拡張」チャネル一覧 | `skill:import` → `skill:importFromSource` に変更                           |
| 2   | task-9f 仕様書 | 同上                                                                                                                            | artifacts.modifies セクション | `channels.ts` と `preload/types.ts` の追加                                 |
| 3   | task-9f 仕様書 | 同上                                                                                                                            | Step 3 付近                   | 既存チャネルとの差異を明記する注記の追加                                   |
| 4   | 05 UI仕様書    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` | セクション15B.2 IPC テーブル  | `skill:import` → `skill:importFromSource` に変更                           |
| 5   | 05 UI仕様書    | 同上                                                                                                                            | セクション15B.2 フロー記述    | 該当箇所の `skill:import` → `skill:importFromSource` に変更                |
| 6   | 05 UI仕様書    | 同上                                                                                                                            | セクション11 IPC 連携テーブル | `skill:importFromSource`, `skill:validateSource`, `skill:export` の3行追加 |

### Task 1-4: 受け入れ基準の定義

**目的**: Phase修了時に達成すべき受け入れ基準を定義する

**受け入れ基準**:

| AC-ID | 基準                                                                                                         | 検証方法                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| AC-01 | task-022 の Step 3 で `skill:import` が `skill:importFromSource` に変更されている                            | `grep -c "skill:importFromSource" task-022...` ≥ 3          |
| AC-02 | task-022 の artifacts.modifies に `channels.ts` が含まれている                                               | `grep -c "channels.ts" task-022...` ≥ 1                     |
| AC-03 | task-022 の artifacts.modifies に `preload/types.ts` が含まれている                                          | `grep -c "preload/types.ts" task-022...` ≥ 1                |
| AC-04 | task-030 のセクション15B.2 で `skill:import` が `skill:importFromSource` に変更されている                    | `grep -n "skill:importFromSource" task-030...` にて確認     |
| AC-05 | task-030 のセクション11 に `skill:importFromSource` が追加されている                                         | `grep -c "skill:importFromSource" task-030...` ≥ 5          |
| AC-06 | task-030 のセクション11 に `skill:validateSource` が追加されている                                           | `grep -c "skill:validateSource" task-030...` ≥ 1            |
| AC-07 | task-030 のセクション11 に `skill:export` が追加されている                                                   | `grep -c "skill:export" task-030...` ≥ 1                    |
| AC-08 | 既存の `skill:import`（ローカルインポート）の仕様行がセクション11に残存している                              | `grep "skill:import" task-030... \| grep "ローカル"` ≥ 1    |
| AC-09 | TASK-9F 関連ファイルで `skill:import`（`skill:importFromSource` 以外）が外部インポート文脈で使用されていない | `grep "skill:import[^F]" task-022... \| grep -v 既存` = 0行 |
| AC-10 | 既存の `skill:import` チャネルの引数型（`string`）や呼び出し先（`SkillImportManager`）に変更がない           | 目視確認                                                    |

### Task 1-5: スコープ定義

**目的**: タスクのスコープを明確に定義する

#### 含むもの

- task-022-task-9f-skill-share.md の Step 3 チャネル名修正（`skill:import` → `skill:importFromSource`）
- 05-skill-center-view.md のセクション15B.2 IPC テーブル修正
- 05-skill-center-view.md のセクション11 IPC 連携テーブルに3チャネル追加
- task-022-task-9f-skill-share.md の artifacts.modifies に `channels.ts` と `preload/types.ts` 追加
- 既存チャネルとの差異を明記する注記の追加

#### 含まないもの

- 既存の `skill:import` ハンドラの変更（変更不要）
- TASK-9F の実装自体（本タスクは仕様書修正のみ）
- channels.ts / skill-api.ts / preload/types.ts の実コード変更（TASK-9F 実装時に行う）
- ShareTarget 型の `packages/shared` への配置（TASK-9F 実装時に行う）

### Task 1-6: リスク分析

**目的**: 仕様書修正タスクにおけるリスクを特定し、対策を定義する

| リスクID | リスク                                                            | 影響度 | 発生確率 | 対策                                                   |
| -------- | ----------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------ |
| R-001    | 他の仕様書にも `skill:import` が TASK-9F 文脈で使用されている     | 中     | 中       | `grep -rn` で全仕様書を検索して修正                    |
| R-002    | TASK-9F 実装者が仕様書修正を見落とし旧チャネル名で実装する        | 高     | 低       | task-022 に明確な注記を追加                            |
| R-003    | `skill:importFromSource` の命名が長すぎてコードの可読性が低下する | 低     | 低       | Preload API では `importFromSource()` メソッド名で短縮 |
| R-004    | セクション11 と セクション15B.2 の修正に不整合が残る              | 中     | 低       | grep による自動整合性検証で検出                        |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                                        |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| API IPC仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存 `skill:import` 契約の正本確認          |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer/Preload/Main の契約整合確認        |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | チャネルホワイトリストと契約ドリフト防止    |
| Skill IPC詳細         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `skill:import` 系チャネル検証要件の詳細確認 |
| 型/チャネル調査手順   | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | チャネル名衝突時の横断確認手順              |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 3層同時更新チェック（P23/P32/P42/P44）      |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC不整合再発防止パターン参照               |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 類似タスクの再発防止知見                    |

| 資料名                     | パス                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 元タスク仕様書             | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-010-ut-skill-import-channel-conflict-001.md` |
| task-9f 仕様書（修正対象） | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`                  |
| 05 UI仕様書（修正対象）    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`              |
| P5（二重登録）             | `.claude/rules/06-known-pitfalls.md#P5`                                                                                                      |
| P44（IPC不整合）           | `.claude/rules/06-known-pitfalls.md#P44`                                                                                                     |
| P32（型定義二箇所更新）    | `.claude/rules/06-known-pitfalls.md#P32`                                                                                                     |

## 統合テスト連携

本タスクは仕様書修正中心のため、統合テストは仕様間整合の確認を対象とする。

- Phase 10 の最終レビュー結果との整合を確認する。
- Phase 11 の目視確認結果を `outputs/phase-11/manual-test-result.md` に集約する。
- Phase 12 の未タスク検出・仕様更新判断へ引き継ぐ。

## 成果物

| 成果物       | パス                                         |
| ------------ | -------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` |
| 受入基準     | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        |

## 完了条件

- [ ] Task 1-1: 機能要件が定義されている（FR-001〜FR-006）
- [ ] Task 1-2: 非機能要件が定義されている（NFR-001〜NFR-003）
- [ ] Task 1-3: 修正対象ファイルと箇所が特定されている（6箇所）
- [ ] Task 1-4: 受け入れ基準が定義されている（AC-01〜AC-10）
- [ ] Task 1-5: スコープが定義されている（含む/含まないが明確）
- [ ] Task 1-6: リスク分析が完了している（R-001〜R-004）
- [ ] 成果物ファイルが `outputs/phase-1/` に出力されている

## 次Phase

Phase 2（設計）へ進む。Phase 1 で定義した要件・受入基準を元に、修正対象箇所の詳細特定と修正方針を設計する。
