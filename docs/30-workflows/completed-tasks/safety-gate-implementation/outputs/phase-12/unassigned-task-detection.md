# Phase 12 Task 4: 未タスク検出レポート

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | UT-06-003                  |
| 機能名     | safety-gate-implementation |
| 検出日     | 2026-03-16                 |
| 検出件数   | 3件                        |
| レポート名 | unassigned-task-detection  |

## 検出ソース別結果

### 1. index.md スコープ外

| 検出有無 | 件数 | 備考                                         |
| -------- | ---- | -------------------------------------------- |
| あり     | 2件  | Preload API 実装、SkillMetadataProvider 実装 |

### 2. Phase 3 設計レビュー MINOR 指摘

| 検出有無 | 件数 | 備考     |
| -------- | ---- | -------- |
| なし     | 0件  | 指摘なし |

### 3. Phase 10 最終レビュー MINOR 指摘

| 検出有無 | 件数 | 備考                                                                |
| -------- | ---- | ------------------------------------------------------------------- |
| あり     | 1件  | DIP 準拠リファクタリング + unregister 関数追加（P5/P49 対策残存分） |

### 4. Phase 11 発見事項 Note/Info

| 検出有無 | 件数 | 備考     |
| -------- | ---- | -------- |
| なし     | 0件  | 発見なし |

### 5. コードコメント TODO

| 検出有無 | 件数 | 備考     |
| -------- | ---- | -------- |
| なし     | 0件  | 発見なし |

## 検出された未タスク一覧

| #   | 未タスクID                       | 概要                                                                                         | 優先度 | 指示書パス（正規ディレクトリ）                                               |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| 1   | UT-06-003-PRELOAD-API-IMPL       | Preload 層に evaluateSafety の safeInvoke 呼び出しを追加。Renderer → Main の通信チェーン完成 | 高     | `docs/30-workflows/unassigned-task/task-ut-06-003-preload-api-impl.md`       |
| 2   | UT-06-003-METADATA-PROVIDER-IMPL | stub metadataProvider を実際の SkillMetadataProvider 実装に置換。SKILL.md からツール情報取得 | 中     | `docs/30-workflows/unassigned-task/task-ut-06-003-metadata-provider-impl.md` |
| 3   | UT-06-003-DIP-REFACTOR           | unregister 関数追加（P5 対策）。DIP/P49 は Phase 12 監査で解決済み                           | 中     | `docs/30-workflows/unassigned-task/task-ut-06-003-dip-refactor.md`           |

## P3 準拠 3 ステップ管理

| ステップ                            | 内容                                                               | ステータス |
| ----------------------------------- | ------------------------------------------------------------------ | ---------- |
| 1. 指示書作成                       | `docs/30-workflows/unassigned-task/` 配下に 3 ファイル作成         | 完了       |
| 2. task-workflow 残課題テーブル登録 | `task-workflow-backlog.md` に 3 件登録                             | 完了       |
| 3. 関連仕様書リンク追加             | `api-ipc-agent-core.md` 等に未タスク参照リンクが存在することを確認 | 完了       |

## 備考

- UT-06-003-PRELOAD-API-IMPL は TASK-SKILL-LIFECYCLE-08（PermissionDialog）の前提条件として優先度「高」に設定
- UT-06-003-METADATA-PROVIDER-IMPL は評価精度に影響するが、stub でも基本動作は可能なため優先度「中」
- UT-06-003-DIP-REFACTOR は DIP/P49 が Phase 12 監査で解決済みのため、残存課題は unregister 関数追加（P5 対策）のみ。優先度「中」
- 元の指示書は `docs/30-workflows/safety-gate-implementation/unassigned-task/` にも残存（P38 修正前の配置）
