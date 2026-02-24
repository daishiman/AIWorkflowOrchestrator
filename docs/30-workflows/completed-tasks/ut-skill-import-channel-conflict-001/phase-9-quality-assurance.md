# Phase 9: 品質保証 - UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## メタ情報

| 項目               | 値                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                      |
| Phase              | 9（品質保証）                                                                             |
| 機能名             | ut-skill-import-channel-conflict-001                                                      |
| 作成日             | 2026-02-24                                                                                |
| 前提Phase          | Phase 5（実装完了）                                                                       |
| 後続Phase          | Phase 10（最終レビュー）                                                                  |
| 目的               | 仕様書修正の品質を多角的に検証し、全品質ゲートをクリアする                                |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-9/` |

## 目的

Phase 5 で実行した仕様書修正の品質を、以下の4つの品質ゲートで検証する:

1. **整合性検証**: TASK-9F 文脈でのチャネル名混同がないこと
2. **新チャネル確認**: 新チャネル名 `skill:importFromSource` が正しく使用されていること
3. **既存互換確認**: 既存 `skill:import`（ローカルインポート）の仕様が変更されていないこと
4. **Markdown構文確認**: 修正ファイルのフォーマットが正常であること

## 背景

- Phase 5 の Task 5-4 で grep 検証を実行済みだが、Phase 9 では範囲を広げて全仕様書に対する整合性を検証する
- 通常の品質保証（ESLint、TypeScript型チェック、全テスト実行）はコード変更がないため不要
- 代わりに、仕様書特有の品質ゲート（チャネル名の一貫性、Markdown 構文）を検証する

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 9-1: 整合性検証（全仕様書スキャン）

**目的**: TASK-9F 関連の全仕様書で、外部ソースインポート文脈でのチャネル名混同がないことを確認する

**実行コマンド**:

```bash
# skill-import-agent-system 配下の全仕様書で skill:import を検索
# skill:importFromSource を除外し、TASK-9F 文脈での旧チャネル名残存を検出
grep -rn "skill:import" \
  docs/30-workflows/skill-import-agent-system/ \
  | grep -v "skill:importFromSource" \
  | grep -v "ローカル" \
  | grep -v "既存" \
  | grep -v "UT-FIX-SKILL-IMPORT" \
  | grep -v "P44" \
  | grep -v "P45"
```

**期待結果**: 出力される行は全て、以下のいずれかに該当すること:

- 既存の `skill:import`（ローカルインポート機能）に関する記述
- 既存タスク（UT-FIX-SKILL-IMPORT-INTERFACE-001 等）のリファレンス
- TASK-9F の外部ソースインポートとは無関係な文脈

**判定基準**:

| 結果                           | 判定 | 対応                         |
| ------------------------------ | ---- | ---------------------------- |
| TASK-9F 文脈の旧チャネル名なし | PASS | 整合性確認完了               |
| TASK-9F 文脈で旧チャネル名あり | FAIL | 該当箇所を修正して再検証する |

---

### Task 9-2: 新チャネル名使用確認

**目的**: 新チャネル名 `skill:importFromSource` および関連する2チャネルが正しく使用されていることを確認する

**実行コマンド**:

```bash
# 新チャネル名の使用箇所を全て確認
echo "=== skill:importFromSource ==="
grep -rn "skill:importFromSource" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/

echo "=== skill:validateSource ==="
grep -rn "skill:validateSource" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/

echo "=== skill:export ==="
grep -rn "skill:export" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/
```

**期待結果**:

| チャネル名               | 期待ファイル数 | 期待件数                             |
| ------------------------ | -------------- | ------------------------------------ |
| `skill:importFromSource` | 2ファイル      | task-022: 3件以上、task-030: 5件以上 |
| `skill:validateSource`   | 1ファイル以上  | task-030: 1件以上                    |
| `skill:export`           | 1ファイル以上  | task-030: 1件以上                    |

**判定基準**:

| 結果                 | 判定 | 対応                               |
| -------------------- | ---- | ---------------------------------- |
| 全チャネルが期待以上 | PASS | 新チャネル名が正しく使用されている |
| いずれかが期待未満   | FAIL | 修正漏れ箇所を特定して修正する     |

---

### Task 9-3: 既存互換確認

**目的**: 既存の `skill:import`（ローカルスキルインポート）の仕様が変更されていないことを確認する

**実行コマンド**:

```bash
# task-030 でローカルインポート用 skill:import が残っていることを確認
grep -n "skill:import" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md \
  | grep -v "skill:importFromSource" \
  | grep -v "skill:export" \
  | grep -v "skill:validateSource"
```

**期待結果**: 1行以上の出力があること（既存のローカルインポート用 `skill:import` が残っている）

**判定基準**:

| 結果    | 判定 | 対応                                                 |
| ------- | ---- | ---------------------------------------------------- |
| 1行以上 | PASS | 既存チャネルの仕様は保持されている                   |
| 0行     | FAIL | ローカルインポートの記述が誤って削除された可能性あり |

---

### Task 9-4: Markdown 構文確認

**目的**: 修正した2つの仕様書ファイルの Markdown フォーマットが正常であることを確認する

**実行手順**:

1. 修正ファイルの Markdown テーブルが正しいフォーマットであることを目視確認する:
   - ヘッダー行とセパレーター行が存在する
   - カラム数がヘッダーと一致する
   - パイプ (`|`) の位置が揃っている

2. 以下のコマンドで構文チェックする:

```bash
# テーブルのパイプ数が一致しているか簡易確認
# task-022 の修正箇所周辺
grep -n "|" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md \
  | tail -20

# task-030 の修正箇所周辺（セクション11）
grep -n "skill:importFromSource\|skill:validateSource\|skill:export" \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md
```

**判定基準**:

| 結果                     | 判定 | 対応                          |
| ------------------------ | ---- | ----------------------------- |
| テーブル構文が正常       | PASS | Markdown フォーマット問題なし |
| テーブル構文にエラーあり | FAIL | フォーマットを修正する        |

---

### Task 9-5: 品質検証結果まとめ

**目的**: Task 9-1 〜 Task 9-4 の検証結果を集約し、品質レポートを作成する

**品質レポートテンプレート**:

| #   | 品質ゲート           | 判定 | 備考 |
| --- | -------------------- | ---- | ---- |
| 9-1 | 整合性検証           |      |      |
| 9-2 | 新チャネル名使用確認 |      |      |
| 9-3 | 既存互換確認         |      |      |
| 9-4 | Markdown構文確認     |      |      |

**総合判定**:

- 全 PASS → Phase 10（最終レビュー）へ進む
- いずれかが FAIL → 該当箇所を修正して再検証する

**成果物**: `outputs/phase-9/quality-report.md`

## 参照資料

> 依存Phase成果物: Phase 5

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

| 資料名               | パス                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Phase 4 テスト仕様   | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-4-test-creation.md`  |
| Phase 5 実装サマリー | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-5-implementation.md` |
| P44（IPC不整合）     | `.claude/rules/06-known-pitfalls.md#P44`                                                           |
| P45（契約ドリフト）  | `.claude/rules/06-known-pitfalls.md#P45`                                                           |

## 統合テスト連携

本タスクは仕様書修正中心のため、統合テストは仕様間整合の確認を対象とする。

- Phase 10 の最終レビュー結果との整合を確認する。
- Phase 11 の目視確認結果を `outputs/phase-11/manual-test-result.md` に集約する。
- Phase 12 の未タスク検出・仕様更新判断へ引き継ぐ。

## 成果物

| 成果物           | パス                                |
| ---------------- | ----------------------------------- |
| 品質検証レポート | `outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] Task 9-1: 整合性検証が PASS
- [ ] Task 9-2: 新チャネル名使用確認が PASS
- [ ] Task 9-3: 既存互換確認が PASS
- [ ] Task 9-4: Markdown構文確認が PASS
- [ ] Task 9-5: 品質検証結果まとめが作成されている
- [ ] `outputs/phase-9/quality-report.md` が作成されている
- [ ] 全品質ゲートをクリアしている

## 次Phase

Phase 10（最終レビュー）へ進む。修正内容の最終確認を実施する。
