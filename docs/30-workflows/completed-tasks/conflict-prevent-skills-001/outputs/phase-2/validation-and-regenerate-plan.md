# Phase 2 Output: 検証・再生成計画

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | TASK-CONFLICT-PREVENT-001 |
| Phase    | 2                         |
| 作成日   | 2026-04-18                |

## 概要

G1〜G4 各カテゴリの検証方法と、regenerate 導線（post-merge hook / Phase 12 close-out）を定義する。  
Phase 9 の品質保証で使用する validator matrix と、wave 完了時の close-out 手順を確定する。

---

## Validator Matrix

| category                | 検証対象                    | 検証コマンド / 方法                                                                   | 期待結果                    |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------- | --------------------------- |
| custom driver bootstrap | `merge.ours.driver` 設定    | `git config --get merge.ours.driver`                                                  | `true` が返る               |
| G1 generated index      | `.gitattributes` の設定確認 | `git check-attr merge -- .claude/skills/aiworkflow-requirements/indexes/topic-map.md` | `merge: ours`               |
| G1 generated index      | deterministic 検証          | `generate-index.js` を2回実行して diff 確認                                           | diff がゼロ                 |
| G1 generated index      | `topic-map.md` 日付除去     | `grep "自動生成" .claude/skills/*/indexes/topic-map.md`                               | マッチなし                  |
| G2 mirror tree          | `.gitattributes` の設定確認 | `git check-attr merge -- .agents/skills/aiworkflow-requirements/SKILL.md`             | `merge: ours`               |
| G2 mirror tree          | canonical / mirror parity   | canonical と mirror の diff を確認                                                    | diff がゼロまたは許容範囲内 |
| G3 append-only log      | `merge=union` 設定          | `git check-attr merge -- .claude/skills/aiworkflow-requirements/LOGS.md`              | `merge: union`              |
| G3 append-only log      | union 動作確認              | merge simulation で両ブランチの追記が統合されること                                   | 両方の行が存在する          |
| G4 volatile metadata    | `.gitattributes` の設定確認 | `git check-attr merge -- .claude/skills/aiworkflow-requirements/EVALS.json`           | `merge: ours`               |
| G4 volatile metadata    | schema 不変確認             | EVALS.json の schema を前後比較                                                       | schema 変更なし             |

---

## Regenerate 導線

### 導線 1: post-merge hook（自動）

merge 完了直後に generated index を自動再生成する。

```bash
# .git/hooks/post-merge
#!/bin/bash
echo "[post-merge] Regenerating skill indexes..."
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
echo "[post-merge] Done."
```

- 対象: G1 generated index（`indexes/*.md`, `indexes/*.json`）
- 実行タイミング: `git merge` または `git pull` の完了後
- 前提: `node` と `generate-index.js` がリポジトリに存在すること

### 導線 2: Phase 12 close-out 手順（手動）

wave 完了時に手動で以下の手順を実施する。

#### ステップ 1: generated index の再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

実行後、以下を確認する。

- `topic-map.md` に日付ヘッダーが含まれていないこと
- 行番号索引が正しく生成されていること

#### ステップ 2: canonical / mirror parity チェック

```bash
diff -r .claude/skills/ .agents/skills/ --exclude="*.json"
```

差分がある場合は sync スクリプトで canonical → mirror を再伝播する。

#### ステップ 3: artifacts parity チェック

root `artifacts.json` と `outputs/artifacts.json` の内容が一致していることを確認する。

```bash
diff \
  docs/30-workflows/conflict-prevent-skills-001/artifacts.json \
  docs/30-workflows/conflict-prevent-skills-001/outputs/artifacts.json
```

#### ステップ 4: SKILL-changelog.md への close-out エントリ追記

```markdown
## YYYY-MM-DD: TASK-CONFLICT-PREVENT-001 close-out

- generated index regenerate 完了
- canonical / mirror parity 確認済み
- artifacts parity 確認済み
```

---

## archive policy（G3 append-only log）

| 条件                                       | 対応                                                               |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `LOGS.md` が 500 行を超えた場合            | `LOGS-archive-YYYY.md` を作成し、古いエントリを移動する            |
| `SKILL-changelog.md` が 300 行を超えた場合 | `SKILL-changelog-archive-YYYY.md` を作成し、古いエントリを移動する |

archive ファイルは `.gitattributes` の `merge=union` パターンの対象外となるため、archive 作成後に `.gitattributes` へのパターン追加を検討する。

---

## EVALS schema 不変方針

本 wave では `EVALS.json` の schema を変更しない。  
以下の理由から、schema 変更は follow-up タスクへ分離する。

1. consumer（`EVALS.json` を読み取るスクリプトやUI）の棚卸しが完了していない
2. schema 変更は backward compatibility の確認が必要であり、本 wave のスコープを超える
3. 短期的には `merge=ours` による現ブランチ優先で十分にコンフリクトを回避できる

---

## Phase 連携

| Phase                 | 本計画との接続                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Phase 4（テスト作成） | validator matrix を基にテストケースを設計する。merge simulation、generator snapshot、log merge の3種を含める |
| Phase 5（実装）       | Lane A・B・C の手順に従い `.gitattributes`、`generate-index.js`、`session-init.sh` を修正する                |
| Phase 9（品質保証）   | validator matrix の全項目を実行し、PASS を確認する                                                           |
| Phase 12（close-out） | close-out 手順（ステップ 1〜4）を実施し、parity と artifacts sync を確認する                                 |
