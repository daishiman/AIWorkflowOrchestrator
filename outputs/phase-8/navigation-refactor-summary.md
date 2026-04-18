# TASK-CONFLICT-PREVENT-001: Phase 8 ナビゲーション・リファクタリングサマリー

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-CONFLICT-PREVENT-001 |
| Phase      | 8                         |
| 作成日     | 2026-04-18                |
| ステータス | completed                 |

## 目的

wording 統一と参照名 drift の有無を確認し、Phase 9 以降に渡すドキュメント群の
ナビゲーション整合性を保証する。

## wording 統一結果

### merge driver 表記

| 変更前                                                | 変更後                             | 適用箇所          |
| ----------------------------------------------------- | ---------------------------------- | ----------------- |
| `merge=union`（indexes/\*.md に誤適用）               | `merge=ours`（custom driver 前提） | .gitattributes    |
| `keep-ours driver` / `keep ours` / `ours driver` 混在 | `custom keep-ours` に統一          | phase-02/05/06/09 |
| `built in union` / `builtin union`                    | `built-in union` に統一            | phase-02/03/08    |
| `consumer audit 済み場合`                             | `consumer audit PASS 時のみ`       | phase-02/04       |

### ファイル参照名

| 参照名                   | 正本パス                                                           | drift 確認 |
| ------------------------ | ------------------------------------------------------------------ | ---------- |
| `topic-map.md`           | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`      | drift なし |
| `keywords.json`          | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`     | drift なし |
| `resource-map.md`        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`   | drift なし |
| `setup-merge-drivers.sh` | `.claude/scripts/setup-merge-drivers.sh`                           | drift なし |
| `session-init.sh`        | `.claude/hooks/session-init.sh`                                    | drift なし |
| `generate-index.js`      | `.agents/skills/aiworkflow-requirements/scripts/generate-index.js` | drift なし |
| `EVALS.json`             | `.claude/skills/aiworkflow-requirements/EVALS.json`                | drift なし |

## 参照名 drift チェック結果

全参照名について Phase 1〜6 のドキュメントを横断確認した結果、drift は検出されなかった。

## Phase 間の正本参照ルール（統一後）

| Phase                                      | 読むべき正本                                      | 目的           |
| ------------------------------------------ | ------------------------------------------------- | -------------- |
| Phase 3 以降が merge policy を参照する場合 | phase-02-design.md §merge policy                  | 設計の正本     |
| Phase 6 以降が TC を参照する場合           | phase-04-test-creation.md §TC-4-xx                | テスト正本     |
| Phase 9 以降が実装内容を参照する場合       | phase-05-implementation.md                        | 実装正本       |
| Phase 12 が close-out を行う場合           | phase-12-documentation.md + manual-test-result.md | close-out 正本 |

## リファクタリング前後の比較

| 指標                          | 変更前                                 | 変更後                       |
| ----------------------------- | -------------------------------------- | ---------------------------- |
| merge policy テーブルの出現数 | 3 箇所（phase-02/05/06）               | 1 箇所（phase-02 正本のみ）  |
| driver 名の表記ゆれ件数       | 5 種類                                 | 1 種類（`custom keep-ours`） |
| EVALS 扱いの矛盾記述          | 2 箇所                                 | 0 箇所                       |
| Phase 13 ステータス表記       | 3 種類（spec_created/blocked/planned） | 1 種類（`blocked`）          |

## 接続先

- duplication-audit.md: 重複発見と正本決定の詳細
- Phase 9 quality-report.md: 統一後の validator 実測結果
