# Phase 1 成果物: 受入基準

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| タスクID | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 |
| Phase    | 1（要件定義）                        |
| 作成日   | 2026-02-24                           |

## 受入基準一覧（AC-01 ~ AC-10）

### AC-01: task-022 Step 3 のチャネル名変更

| 項目     | 内容                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| AC-ID    | AC-01                                                                             |
| 基準     | task-022 の Step 3 で `skill:import` が `skill:importFromSource` に変更されている |
| 対応要件 | FR-001, FR-002                                                                    |
| 検証方法 | `grep -c "skill:importFromSource" task-022-task-9f-skill-share.md` >= 3           |
| 判定     | 検証コマンドの結果が 3 以上であれば PASS                                          |

### AC-02: task-022 artifacts.modifies に channels.ts 追加

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| AC-ID    | AC-02                                                          |
| 基準     | task-022 の artifacts.modifies に `channels.ts` が含まれている |
| 対応要件 | FR-005                                                         |
| 検証方法 | `grep -c "channels.ts" task-022-task-9f-skill-share.md` >= 1   |
| 判定     | 検証コマンドの結果が 1 以上であれば PASS                       |

### AC-03: task-022 artifacts.modifies に preload/types.ts 追加

| 項目     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| AC-ID    | AC-03                                                               |
| 基準     | task-022 の artifacts.modifies に `preload/types.ts` が含まれている |
| 対応要件 | FR-005                                                              |
| 検証方法 | `grep -c "preload/types.ts" task-022-task-9f-skill-share.md` >= 1   |
| 判定     | 検証コマンドの結果が 1 以上であれば PASS                            |

### AC-04: task-030 セクション15B.2 のチャネル名変更

| 項目     | 内容                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| AC-ID    | AC-04                                                                                                        |
| 基準     | task-030 のセクション15B.2 で外部インポート用の `skill:import` が `skill:importFromSource` に変更されている  |
| 対応要件 | FR-003                                                                                                       |
| 検証方法 | `grep -n "skill:importFromSource" task-030-ui-05-skill-center-view.md` にて該当行を確認                      |
| 判定     | セクション15B.2 の IPC テーブル（4行）とフロー記述（1行）で `skill:importFromSource` が使用されていれば PASS |

### AC-05: task-030 セクション11 に skill:importFromSource 追加

| 項目     | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| AC-ID    | AC-05                                                                                |
| 基準     | task-030 のセクション11 IPC 連携テーブルに `skill:importFromSource` が追加されている |
| 対応要件 | FR-004                                                                               |
| 検証方法 | `grep -c "skill:importFromSource" task-030-ui-05-skill-center-view.md` >= 5          |
| 判定     | セクション15B.2（5箇所）+ セクション11（1箇所）で合計 6 以上の出現であれば PASS      |

### AC-06: task-030 セクション11 に skill:validateSource 追加

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| AC-ID    | AC-06                                                                                  |
| 基準     | task-030 のセクション11 IPC 連携テーブルに `skill:validateSource` が追加されている     |
| 対応要件 | FR-004                                                                                 |
| 検証方法 | `grep -c "skill:validateSource" task-030-ui-05-skill-center-view.md` >= 1              |
| 判定     | セクション11 に該当行が存在すれば PASS（セクション15B.2 のフロー記述分もカウント可能） |

### AC-07: task-030 セクション11 に skill:export 追加

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| AC-ID    | AC-07                                                                      |
| 基準     | task-030 のセクション11 IPC 連携テーブルに `skill:export` が追加されている |
| 対応要件 | FR-004                                                                     |
| 検証方法 | `grep -c "skill:export" task-030-ui-05-skill-center-view.md` >= 1          |
| 判定     | セクション11 に該当行が存在すれば PASS                                     |

### AC-08: 既存 skill:import の仕様行が残存

| 項目     | 内容                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| AC-ID    | AC-08                                                                                                           |
| 基準     | 既存の `skill:import`（ローカルインポート）の仕様行がセクション11 に残存している                                |
| 対応要件 | FR-006                                                                                                          |
| 検証方法 | セクション11 のテーブルに `skill:import` 行（引数: `skillName: string`、備考に P44 解決済み記載）が存在すること |
| 判定     | 既存行が変更されず残存していれば PASS                                                                           |

### AC-09: 外部インポート文脈での旧チャネル名不使用

| 項目     | 内容                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| AC-ID    | AC-09                                                                                                                        |
| 基準     | TASK-9F 関連ファイルで `skill:import`（`skill:importFromSource` 以外）が外部インポート文脈で使用されていない                 |
| 対応要件 | NFR-002                                                                                                                      |
| 検証方法 | task-022 と task-030 で `skill:import` を grep し、結果が全てローカルインポート文脈（セクション11 の既存行）であることを確認 |
| 判定     | 外部インポート文脈での `skill:import` 使用が 0 件であれば PASS                                                               |

### AC-10: 既存チャネルの仕様不変

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| AC-ID    | AC-10                                                                                              |
| 基準     | 既存の `skill:import` チャネルの引数型（`string`）や呼び出し先（`SkillImportManager`）に変更がない |
| 対応要件 | FR-006                                                                                             |
| 検証方法 | 目視確認: セクション11 の `skill:import` 行の引数・備考が修正前と同一であること                    |
| 判定     | 引数型が `skillName: string`、備考が「P44解決済み: string を直接渡す」のまま変更がなければ PASS    |

## 検証コマンドまとめ

```bash
# AC-01: task-022 での skill:importFromSource 出現数
grep -c "skill:importFromSource" task-022-task-9f-skill-share.md
# 期待: >= 3

# AC-02: task-022 での channels.ts 出現数
grep -c "channels.ts" task-022-task-9f-skill-share.md
# 期待: >= 1

# AC-03: task-022 での preload/types.ts 出現数
grep -c "preload/types.ts" task-022-task-9f-skill-share.md
# 期待: >= 1

# AC-04/AC-05: task-030 での skill:importFromSource 出現数
grep -c "skill:importFromSource" task-030-ui-05-skill-center-view.md
# 期待: >= 5

# AC-06: task-030 での skill:validateSource 出現数
grep -c "skill:validateSource" task-030-ui-05-skill-center-view.md
# 期待: >= 1

# AC-07: task-030 での skill:export 出現数
grep -c "skill:export" task-030-ui-05-skill-center-view.md
# 期待: >= 1

# AC-09: 外部インポート文脈での旧チャネル名不使用確認
grep -n "skill:import[^F]" task-022-task-9f-skill-share.md | grep -v "ローカル\|既存\|P44\|UT-FIX"
# 期待: 0行
```
