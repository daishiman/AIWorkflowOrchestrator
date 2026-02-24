# Phase 4: 検証基準設計書

## メタ情報

| 項目     | 値                             |
| -------- | ------------------------------ |
| タスクID | UT-IPC-DATA-FLOW-TYPE-GAPS-001 |
| Phase    | 4                              |
| 作成日   | 2026-02-24                     |

## 検証基準概要

仕様書修正の正しさを検証するための基準とコマンドを設計する。本タスクはコード変更を伴わないため、`grep` / `diff` ベースの仕様書検証を行う。

## 共通パス

```bash
TASK_BASE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence"
```

## Gap 別検証基準

### Gap 1: Date 型シリアライズ注記

| 検証項目           | 対象ファイル | 検証コマンド                                                       | 期待結果                    |
| ------------------ | ------------ | ------------------------------------------------------------------ | --------------------------- |
| ISO 8601 注記      | task-9f      | `grep -c "ISO 8601" task-022-*.md`                                 | ≥ 1                         |
| ISO 8601 注記      | task-9g      | `grep -c "ISO 8601" task-023a-*.md`                                | ≥ 1                         |
| ISO 8601 注記      | task-9h      | `grep -c "ISO 8601" task-023b-*.md`                                | ≥ 1                         |
| ISO 8601 注記      | task-9j      | `grep -c "ISO 8601" task-023d-*.md`                                | ≥ 1                         |
| Date 型残存        | 全4ファイル  | `grep -c ": Date" *.md` → Date 型が IPC 型定義内に残っていないこと | 0（IPC 型定義セクション内） |
| 共通方針セクション | 全4ファイル  | `grep -c "IPC シリアライズ方針" *.md`                              | ≥ 4                         |

### Gap 2: DebugSession.status

| 検証項目     | 対象ファイル  | 検証コマンド                  | 期待結果                            |
| ------------ | ------------- | ----------------------------- | ----------------------------------- |
| idle 追加    | task-9h       | `grep "idle" task-023b-*.md`  | status 型定義行にヒット             |
| 値セット一致 | task-9h + 05B | 手動確認: 5値セットが完全一致 | idle/running/paused/completed/error |

### Gap 3: DocPreview onExport

| 検証項目        | 対象ファイル | 検証コマンド                             | 期待結果                    |
| --------------- | ------------ | ---------------------------------------- | --------------------------- |
| docId 引数      | task-030     | `grep "docId" task-030-*.md`             | onExport 引数定義行にヒット |
| ExportFormat 型 | task-030     | `grep "ExportFormat" task-030-*.md`      | 型定義がヒット              |
| IPC フロー図    | task-030     | `grep "skill:docs:export" task-030-*.md` | チャネル名がヒット          |

### Gap 4: ExportResult 変換ロジック

| 検証項目          | 対象ファイル | 検証コマンド                        | 期待結果         |
| ----------------- | ------------ | ----------------------------------- | ---------------- |
| ExportResult 参照 | task-030     | `grep "ExportResult" task-030-*.md` | ≥ 1              |
| success 分岐      | task-030     | `grep "success" task-030-*.md`      | 分岐ロジック記載 |
| リトライ条件      | task-030     | `grep "リトライ" task-030-*.md`     | 条件記載         |

### Gap 5: safeOn 購読パターン

| 検証項目        | 対象ファイル | 検証コマンド                                    | 期待結果 |
| --------------- | ------------ | ----------------------------------------------- | -------- |
| safeOn パターン | 05B          | `grep "safeOn\|onDebugEvent" task-031b-*.md`    | ≥ 1      |
| cleanup 関数    | 05B          | `grep "cleanup\|クリーンアップ" task-031b-*.md` | ≥ 1      |
| P5 参照         | 05B          | `grep "P5\|二重登録" task-031b-*.md`            | ≥ 1      |
| useEffect       | 05B          | `grep "useEffect" task-031b-*.md`               | ≥ 1      |

### Gap 6: IPC 引数形式

| 検証項目            | 対象ファイル | 検証コマンド                                      | 期待結果            |
| ------------------- | ------------ | ------------------------------------------------- | ------------------- |
| オブジェクト形式    | task-9a      | `grep "safeInvoke" task-020b-*.md`                | 全行で `{...}` 形式 |
| positional 残存なし | task-9a      | `grep "safeInvoke" task-020b-*.md \| grep -v "{"` | 0 行                |
| Args interface      | task-9a      | `grep "interface Skill.*Args" task-020b-*.md`     | ≥ 6                 |
| P42 バリデーション  | task-9a      | `grep "trim\|3段バリデーション" task-020b-*.md`   | ≥ 1                 |

## 検証チェックリスト（33項目）

Phase 4 仕様書（phase-4-test-creation.md）に定義された33項目のチェックリストを Phase 5 修正完了後に実行する。

## 完了判定

- [x] 全 6 Gap の検証基準が設計されている
- [x] 各 Gap の検証コマンドと期待結果が定義されている
- [x] 検証チェックリスト（33項目）が作成されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
