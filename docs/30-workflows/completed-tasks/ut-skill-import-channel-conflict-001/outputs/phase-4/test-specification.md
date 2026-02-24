# Phase 4 成果物: テスト仕様書（grep 検証コマンド設計）

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| タスクID | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 |
| Phase    | 4（テスト作成）                      |
| 作成日   | 2026-02-24                           |
| 検証方式 | grep による仕様書整合性検証          |

## 検証コマンド一覧

### Task 4-1: 旧チャネル名残存検証

**目的**: TASK-9F の仕様書修正後に、外部ソースインポート文脈で旧チャネル名 `skill:import` が残存していないことを確認する

**検証コマンド**:

```bash
# TASK-9F 文脈での旧チャネル名残存を検出
# 期待: 0件（TASK-9F 関連ファイルで skill:import が skill:importFromSource 以外で使用されていない）
grep -rn "skill:import[^F]" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md \
  | grep -v "skill:importFromSource" \
  | grep -v "ローカル" \
  | grep -v "既存" \
  | grep -v "UT-FIX-SKILL-IMPORT"
```

**期待結果**: 出力が 0 行であること

**判定基準**:

| 結果    | 判定 | 対応                                             |
| ------- | ---- | ------------------------------------------------ |
| 0行     | PASS | 旧チャネル名は完全に置換されている               |
| 1行以上 | FAIL | 出力行を確認し、Phase 5 で追加修正箇所を特定する |

---

### Task 4-2: 新チャネル名使用確認

**目的**: 新チャネル名 `skill:importFromSource` が TASK-9F 関連の仕様書で正しく使用されていることを確認する

**検証コマンド**:

```bash
# task-022 での新チャネル名使用を確認
# 期待: 1件以上（Step 3 のチャネル名 + 注記）
grep -c "skill:importFromSource" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md

# task-030 での新チャネル名使用を確認
# 期待: 5件以上（セクション15B.2 の4行テーブル + フロー記述1箇所 + セクション11追加分）
grep -c "skill:importFromSource" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md
```

**期待結果**:

| ファイル | 期待件数 | 根拠                                                           |
| -------- | -------- | -------------------------------------------------------------- |
| task-022 | 1件以上  | Step 3 のチャネル名1箇所 + 注記内の記述                        |
| task-030 | 5件以上  | セクション15B.2 の4行テーブル + フロー記述1箇所 + セクション11 |

**判定基準**:

| 結果                 | 判定 | 対応                                      |
| -------------------- | ---- | ----------------------------------------- |
| 両ファイルが期待以上 | PASS | 新チャネル名が正しく使用されている        |
| いずれかが期待未満   | FAIL | 修正漏れ箇所を特定して Phase 5 で対応する |

---

### Task 4-3: 既存チャネル影響なし確認

**目的**: 既存の `skill:import`（ローカルスキルインポート、UT-FIX-SKILL-IMPORT-INTERFACE-001 で修正済み）の仕様が変更されていないことを確認する

**検証コマンド**:

```bash
# 既存チャネルの仕様記述が残っていることを確認
# 期待: 1件以上（セクション11 の IPC テーブルにローカルインポート用 skill:import が存在）
grep -n "skill:import" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md \
  | grep -i "ローカル\|local\|既存\|string"

# セクション11 の IPC テーブルに skill:importFromSource が追加されていることを確認
# 期待: 1件以上
grep -n "skill:importFromSource" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md \
  | grep -i "セクション\|IPC\|外部\|ShareTarget"
```

**期待結果**:

| 検証項目                                   | 期待    |
| ------------------------------------------ | ------- |
| ローカルインポート用 `skill:import` の記述 | 1件以上 |
| 外部インポート用 `skill:importFromSource`  | 1件以上 |

**判定基準**:

| 結果            | 判定 | 対応                                       |
| --------------- | ---- | ------------------------------------------ |
| 両方1件以上     | PASS | 既存チャネルに影響なく新チャネルも追加済み |
| ローカルが0件   | FAIL | 既存仕様が誤って削除されている可能性       |
| 新チャネルが0件 | FAIL | セクション11 への追加が漏れている          |

---

### Task 4-4: セクション11 IPC テーブル追加確認

**目的**: task-030 のセクション11 IPC 連携テーブルに3つの新チャネルが追加されていることを確認する

**検証コマンド**:

```bash
SPEC_FILE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md"

# skill:importFromSource の存在
grep -c "skill:importFromSource" "$SPEC_FILE"
# 期待: 5件以上（セクション15B.2 + セクション11）

# skill:validateSource の存在
grep -c "skill:validateSource" "$SPEC_FILE"
# 期待: 1件以上（セクション11 に追加。セクション15B.2 にも既存あり）

# skill:export の存在
grep -c "skill:export" "$SPEC_FILE"
# 期待: 1件以上（セクション11 に追加）
```

**期待結果**:

| チャネル名               | 期待件数 | 根拠                                         |
| ------------------------ | -------- | -------------------------------------------- |
| `skill:importFromSource` | 5件以上  | セクション15B.2(5箇所) + セクション11(1箇所) |
| `skill:validateSource`   | 1件以上  | セクション15B.2 既存 + セクション11 追加     |
| `skill:export`           | 1件以上  | セクション11 追加                            |

---

### Task 4-5: artifacts.modifies 追加確認

**目的**: task-022 の artifacts.modifies に `channels.ts` と `preload/types.ts` が追加されていることを確認する

**検証コマンド**:

```bash
SPEC_FILE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md"

# channels.ts の追加確認
grep -c "channels.ts" "$SPEC_FILE"
# 期待: 1件以上

# preload/types.ts の追加確認
grep -c "preload/types.ts" "$SPEC_FILE"
# 期待: 1件以上
```

**期待結果**:

| ファイル参照       | 期待件数 |
| ------------------ | -------- |
| `channels.ts`      | 1件以上  |
| `preload/types.ts` | 1件以上  |

## 完了条件チェック

- [x] Task 4-1: 旧チャネル名残存検証コマンドが設計されている
- [x] Task 4-2: 新チャネル名使用確認コマンドが設計されている
- [x] Task 4-3: 既存チャネル影響なし確認コマンドが設計されている
- [x] Task 4-4: セクション11 IPC テーブル追加確認コマンドが設計されている
- [x] Task 4-5: artifacts.modifies 追加確認コマンドが設計されている
- [x] 各コマンドの期待結果と判定基準が明確に定義されている
