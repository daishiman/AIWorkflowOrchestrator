# Phase 1 成果物: スコープ定義

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| タスクID | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 |
| Phase    | 1（要件定義）                        |
| 作成日   | 2026-02-24                           |

## 1. スコープ定義

### 含むもの

| #   | 作業内容                                                                                               | 対応要件         | 修正対象ファイル                    |
| --- | ------------------------------------------------------------------------------------------------------ | ---------------- | ----------------------------------- |
| 1   | task-022-task-9f-skill-share.md の Step 3 チャネル名修正（`skill:import` -> `skill:importFromSource`） | FR-001, FR-002   | task-022-task-9f-skill-share.md     |
| 2   | task-022-task-9f-skill-share.md の artifacts.modifies に `channels.ts` と `preload/types.ts` 追加      | FR-005           | task-022-task-9f-skill-share.md     |
| 3   | task-022-task-9f-skill-share.md の Step 3 付近に既存チャネルとの差異を明記する注記の追加               | NFR-001, NFR-003 | task-022-task-9f-skill-share.md     |
| 4   | task-030-ui-05-skill-center-view.md のセクション15B.2 IPC テーブル修正（4行）                          | FR-003           | task-030-ui-05-skill-center-view.md |
| 5   | task-030-ui-05-skill-center-view.md のセクション15B.2 フロー記述修正（1行）                            | FR-003           | task-030-ui-05-skill-center-view.md |
| 6   | task-030-ui-05-skill-center-view.md のセクション11 IPC 連携テーブルに3チャネル追加                     | FR-004           | task-030-ui-05-skill-center-view.md |

### 含まないもの

| #   | 除外事項                                                     | 理由                                                                        |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 1   | 既存の `skill:import` ハンドラの変更                         | 既存チャネルは変更不要（FR-006）                                            |
| 2   | TASK-9F の実装自体                                           | 本タスクは仕様書修正のみ                                                    |
| 3   | channels.ts / skill-api.ts / preload/types.ts の実コード変更 | TASK-9F 実装時に行う（本タスクでは artifacts.modifies に記載のみ）          |
| 4   | ShareTarget 型の `packages/shared` への配置                  | TASK-9F 実装時に行う                                                        |
| 5   | completed-task 配下の過去タスク仕様書の修正                  | 過去の記録であり、修正対象外                                                |
| 6   | task-012（UT-SKILL-IPC-PRELOAD-EXTENSION-001）の修正         | 既に `skill:importFromSource` で整合しているため修正不要                    |
| 7   | api-ipc-agent.md 等のシステム仕様書の更新                    | 本タスクは仕様書間の整合修正のみ。システム仕様書は TASK-9F 実装時に更新する |

## 2. リスク分析

### リスク一覧

| リスクID | リスク                                                            | 影響度 | 発生確率 | 総合リスク | 対策                                                                   |
| -------- | ----------------------------------------------------------------- | ------ | -------- | ---------- | ---------------------------------------------------------------------- |
| R-001    | 他の仕様書にも `skill:import` が TASK-9F の文脈で使用されている   | 中     | 中       | 中         | `grep -rn` で全仕様書を検索して修正。task-012 は確認済みで整合している |
| R-002    | TASK-9F 実装者が仕様書修正を見落とし旧チャネル名で実装する        | 高     | 低       | 中         | task-022 に明確な注記を追加（NFR-003）                                 |
| R-003    | `skill:importFromSource` の命名が長すぎてコードの可読性が低下する | 低     | 低       | 低         | Preload API では `importFromSource()` メソッド名で短縮可能             |
| R-004    | セクション11 と セクション15B.2 の修正に不整合が残る              | 中     | 低       | 低         | grep による自動整合性検証で検出（Phase 4 / Phase 9 で実施）            |

### リスク対応方針

#### R-001（他仕様書への波及）

**調査結果**: `grep -rn "skill:import" docs/30-workflows/skill-import-agent-system/tasks/` の結果を分析した結果、外部インポート文脈で `skill:import` が使用されているのは以下の2ファイルのみ:

- task-022-task-9f-skill-share.md（Step 3 のチャネル一覧）
- task-030-ui-05-skill-center-view.md（セクション15B.2 の IPC テーブルとフロー記述）

task-012（UT-SKILL-IPC-PRELOAD-EXTENSION-001）では既に `skill:importFromSource` が使用されている（行436）。その他の `skill:import` 出現箇所は全てローカルインポート文脈（セクション11 の既存行、completed-task 配下の過去タスク記録）であるため、追加修正は不要。

**対策ステータス**: R-001 は影響範囲調査により「追加修正不要」と判定。

#### R-002（実装者の見落とし）

**対策**: task-022 の Step 3 に以下の注記を追加する:

> ⚠️ **注意**: `skill:import` チャネルは既存のローカルスキルインポート（UT-FIX-SKILL-IMPORT-INTERFACE-001）で使用済みです。引数は `skillName: string` で、`SkillImportManager.importSkills([skillName])` を呼び出します。外部ソースインポートは `skill:importFromSource` を使用してください。この改名は UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 で実施されました。

#### R-003（命名の長さ）

**評価**: `skill:importFromSource` は23文字であり、既存の最長チャネル名（`skill:readMarkdown` = 18文字）より5文字長い。しかし、以下の理由でコードの可読性への影響は軽微:

- チャネル名は `channels.ts` で定数定義される（`IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE`）
- Preload API メソッド名は `importFromSource()` で短縮可能
- `FromSource` により外部ソースインポートであることが一目で識別可能

**対策ステータス**: 許容範囲と判定。追加対策不要。

#### R-004（セクション間不整合）

**対策**: Phase 4 で grep ベースの整合性検証コマンドを設計し、Phase 9 で実行する。具体的には:

1. セクション15B.2 で使用されているチャネル名がセクション11 のテーブルに全て登録されていること
2. task-022 と task-030 で同一のチャネル名が使用されていること

**対策ステータス**: Phase 4 / Phase 9 で対応予定。

## 3. 前提条件

| #   | 前提条件                                                                                                 | 確認状況                    |
| --- | -------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | UT-FIX-SKILL-IMPORT-INTERFACE-001 が完了していること（既存 `skill:import` の引数が `string` に修正済み） | 確認済み（2026-02-21 完了） |
| 2   | task-022-task-9f-skill-share.md が存在し、Step 3 に `skill:import` が記載されていること                  | 確認済み（行128）           |
| 3   | task-030-ui-05-skill-center-view.md が存在し、セクション11 と 15B.2 が記載されていること                 | 確認済み（行685、行939）    |

## 4. 成功判定基準

本タスクの成功は以下の条件を全て満たした場合に判定する:

1. 全受入基準（AC-01 ~ AC-10）が PASS であること
2. 全機能要件（FR-001 ~ FR-006）が実現されていること
3. 全非機能要件（NFR-001 ~ NFR-003）が満たされていること
4. 全リスク対策（R-001 ~ R-004）が実施または計画されていること
