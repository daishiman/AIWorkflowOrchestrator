# Phase 4: テスト作成（TDD: Red） - UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## メタ情報

| 項目               | 値                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                      |
| Phase              | 4（テスト作成）                                                                           |
| 機能名             | ut-skill-import-channel-conflict-001                                                      |
| 作成日             | 2026-02-24                                                                                |
| 前提Phase          | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー PASS）                        |
| 目的               | 仕様書修正後の整合性を検証するための grep コマンドを設計する                              |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-4/` |

## 目的

仕様書修正のみタスクであるため、コードテストではなく grep による仕様書整合性検証を設計する。修正後の仕様書が以下の3条件を満たすことを検証するコマンドセットを定義する:

1. TASK-9F 文脈で旧チャネル名 `skill:import` が残存していないこと
2. 新チャネル名 `skill:importFromSource` が正しく使用されていること
3. 既存の `skill:import`（ローカルスキルインポート）の仕様が変更されていないこと

## 背景

- 本タスクはコード変更を含まないため、Vitest 等のテストフレームワークは使用しない
- 仕様書（Markdown）の修正が「実装」に相当し、grep による文字列検索が「テスト」に相当する
- 検証コマンドは Phase 5（実装）完了後と Phase 9（品質保証）で実行される

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 4-1: 旧チャネル名残存検証コマンドの設計

**目的**: TASK-9F の仕様書修正後に、外部ソースインポート文脈で旧チャネル名 `skill:import` が残存していないことを確認するコマンドを設計する

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

**期待結果**: 出力が0行であること（TASK-9F 文脈で旧チャネル名が使用されていない）

**判定基準**:

| 結果    | 判定 | 対応                                             |
| ------- | ---- | ------------------------------------------------ |
| 0行     | PASS | 旧チャネル名は完全に置換されている               |
| 1行以上 | FAIL | 出力行を確認し、Phase 5 で追加修正箇所を特定する |

---

### Task 4-2: 新チャネル名使用確認コマンドの設計

**目的**: 新チャネル名 `skill:importFromSource` が TASK-9F 関連の仕様書で正しく使用されていることを確認するコマンドを設計する

**検証コマンド**:

```bash
# task-022 での新チャネル名使用を確認
# 期待: 3件以上（Step 3 の3箇所）
grep -c "skill:importFromSource" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md

# task-030 での新チャネル名使用を確認
# 期待: 5件以上（セクション15B.2 の4行 + フロー記述1箇所）
grep -c "skill:importFromSource" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md
```

**期待結果**:

| ファイル | 期待件数 | 根拠                                    |
| -------- | -------- | --------------------------------------- |
| task-022 | 3件以上  | Step 3 のチャネル名3箇所                |
| task-030 | 5件以上  | セクション15B.2 の4行 + フロー記述1箇所 |

**判定基準**:

| 結果                 | 判定 | 対応                                      |
| -------------------- | ---- | ----------------------------------------- |
| 両ファイルが期待以上 | PASS | 新チャネル名が正しく使用されている        |
| いずれかが期待未満   | FAIL | 修正漏れ箇所を特定して Phase 5 で対応する |

---

### Task 4-3: 既存チャネル影響なし確認コマンドの設計

**目的**: 既存の `skill:import`（ローカルスキルインポート、UT-FIX-SKILL-IMPORT-INTERFACE-001 で修正済み）の仕様が変更されていないことを確認するコマンドを設計する

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

### Task 4-4: セクション11 IPC テーブル追加確認コマンドの設計

**目的**: task-030 のセクション11 IPC 連携テーブルに3つの新チャネルが追加されていることを確認するコマンドを設計する

**検証コマンド**:

```bash
# 3チャネルの追加を個別確認
SPEC_FILE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md"

# skill:importFromSource の存在
grep -c "skill:importFromSource" "$SPEC_FILE"
# 期待: 5件以上（セクション15B.2 + セクション11）

# skill:validateSource の存在
grep -c "skill:validateSource" "$SPEC_FILE"
# 期待: 1件以上

# skill:export の存在
grep -c "skill:export" "$SPEC_FILE"
# 期待: 1件以上
```

**期待結果**:

| チャネル名               | 期待件数 | 根拠                                         |
| ------------------------ | -------- | -------------------------------------------- |
| `skill:importFromSource` | 5件以上  | セクション15B.2(5箇所) + セクション11(1箇所) |
| `skill:validateSource`   | 1件以上  | セクション11 に追加                          |
| `skill:export`           | 1件以上  | セクション11 に追加                          |

---

### Task 4-5: artifacts.modifies 追加確認コマンドの設計

**目的**: task-022 の artifacts.modifies に `channels.ts` と `preload/types.ts` が追加されていることを確認するコマンドを設計する

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

## 参照資料

> 依存Phase成果物: Phase 1, Phase 2, Phase 3

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

| 資料名               | パス                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義     | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-1-requirements.md`  |
| Phase 2 設計         | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-2-design.md`        |
| Phase 3 設計レビュー | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-3-design-review.md` |

## 統合テスト連携

本タスクは仕様書修正中心のため、統合テストは仕様間整合の確認を対象とする。

- Phase 10 の最終レビュー結果との整合を確認する。
- Phase 11 の目視確認結果を `outputs/phase-11/manual-test-result.md` に集約する。
- Phase 12 の未タスク検出・仕様更新判断へ引き継ぐ。

## 成果物

| 成果物       | パス                                    |
| ------------ | --------------------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` |

## 完了条件

- [ ] Task 4-1: 旧チャネル名残存検証コマンドが設計されている
- [ ] Task 4-2: 新チャネル名使用確認コマンドが設計されている
- [ ] Task 4-3: 既存チャネル影響なし確認コマンドが設計されている
- [ ] Task 4-4: セクション11 IPC テーブル追加確認コマンドが設計されている
- [ ] Task 4-5: artifacts.modifies 追加確認コマンドが設計されている
- [ ] 各コマンドの期待結果と判定基準が明確に定義されている

## 次Phase

Phase 5（実装）へ進む。Phase 4 で設計した検証コマンドは Phase 5 の Task 3（grep 検証実行）で使用する。
