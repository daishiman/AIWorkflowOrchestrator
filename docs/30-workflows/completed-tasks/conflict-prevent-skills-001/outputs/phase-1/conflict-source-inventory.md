# Phase 1 Output: コンフリクト源インベントリ

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| タスクID | TASK-CONFLICT-PREVENT-001 |
| Phase    | 1                         |
| 作成日   | 2026-04-18                |

## 概要

`.claude/skills/` と `.agents/skills/` で発生するコンフリクト源を4カテゴリ（G1〜G4）に分類し、差分原因・影響範囲・本 wave での対応方針を整理する。

---

## G1: generated index

| 項目             | 内容                                                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル     | `indexes/*.md`、`indexes/*.json`（`topic-map.md`、`resource-map.md`、`quick-reference.md`、`keywords.json` など）                                                                        |
| 差分の原因       | (1) `topic-map.md` の日付ヘッダー `> 自動生成: YYYY-MM-DD` が再実行のたびに変わる（non-deterministic）<br>(2) post-merge regenerate を行うと内容が変化し、マージ前後で diff が大きくなる |
| コンフリクト頻度 | 高（worktree ごとに独立して生成→ branch merge 時に必ず衝突）                                                                                                                             |
| 本 wave の方針   | `merge=ours`（custom driver）を設定し、merge 後に `generate-index.js` で regenerate する。`topic-map.md` の日付ヘッダーを除去して deterministic にする                                   |
| follow-up        | 行番号索引契約（discoverability）は維持する。索引構造の大幅変更は別タスク                                                                                                                |

---

## G2: mirror tree

| 項目             | 内容                                                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象ファイル     | `.agents/skills/**`（`.claude/skills/` の完全な mirror）                                                                                                                                                                  |
| 差分の原因       | canonical `.claude/skills/` への変更が `.agents/skills/` に反映されない状態でブランチがマージされると、両パスが diverge する                                                                                              |
| コンフリクト頻度 | 中〜高（並列 worktree で canonical を同時編集した場合）                                                                                                                                                                   |
| 本 wave の方針   | `.agents/skills/**` に `merge=ours`（custom driver）を設定し、merge 後に sync スクリプト（または手動手順）で canonical → mirror を再伝播する。`merge=ours` は「現ブランチを保持」であり、merge 後の parity チェックが必須 |
| 注意点           | `.agents/skills/` への直接変更は禁止。canonical は `.claude/skills/` のみ                                                                                                                                                 |
| follow-up        | `.agents/skills/` 廃止の判断は consumer 棚卸し後に別タスクで実施                                                                                                                                                          |

---

## G3: append-only log

| 項目             | 内容                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| 対象ファイル     | `LOGS.md`、`SKILL-changelog.md`                                                                                   |
| 差分の原因       | 並列ブランチでそれぞれ追記された行の順序が異なる。内容は重複しないが順序差でコンフリクトマーカーが発生する        |
| コンフリクト頻度 | 中（並列 PR 開発では常に発生し得る）                                                                              |
| 本 wave の方針   | `merge=union`（Git 組み込み）を設定する。custom driver 登録は不要。追記のみ保証されるため内容の重複削除は運用対応 |
| 備考             | `union` は行単位でマージするため、JSON ファイルや構造が重要な MD には適用しない。ログ系 MD のみに限定する         |
| follow-up        | archive policy（ログが肥大化した場合の切り出しルール）は別途設計                                                  |

---

## G4: volatile metadata

| 項目             | 内容                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| 対象ファイル     | `EVALS.json`                                                                                                    |
| 差分の原因       | 並列ブランチで評価結果が同時更新されると JSON 構造がコンフリクトする。行順序差もあり `union` は JSON を破壊する |
| コンフリクト頻度 | 中（評価実行タイミングが重なると発生）                                                                          |
| 本 wave の方針   | `merge=ours`（custom driver）を設定し、現ブランチの評価記録を優先する。schema 変更はこの task で行わない        |
| schema           | **本 wave では変更しない**。consumer 監査なしに schema を変えると読み取り側が壊れる可能性がある                 |
| follow-up        | EVALS の schema 設計・consumer 棚卸しは専用 follow-up タスクで実施                                              |

---

## サマリー表

| カテゴリ             | 代表ファイル                     | 差分の本質                                    | 本 wave での対処                                |
| -------------------- | -------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| G1 generated index   | `indexes/*.md`, `indexes/*.json` | non-deterministic 生成 + 再生成による内容変化 | `merge=ours`（custom）+ post-merge regenerate   |
| G2 mirror tree       | `.agents/skills/**`              | canonical 更新が mirror に未伝播              | `merge=ours`（custom）+ sync 再実行             |
| G3 append-only log   | `LOGS.md`, `SKILL-changelog.md`  | 並列追記の順序差                              | `merge=union`（built-in）                       |
| G4 volatile metadata | `EVALS.json`                     | 並列評価の順序差・JSON 構造破壊リスク         | `merge=ours`（custom）、schema 変更は follow-up |

---

## custom driver が必要な理由

`merge=ours` は `.gitattributes` に書くだけでは **機能しない**。  
Git は `merge.ours.driver` という設定を参照するため、以下のコマンドをリポジトリ初期化時（またはセッション開始時）に実行する必要がある。

```bash
git config merge.ours.driver true
```

この設定が未登録の場合、Git は `merge=ours` を unknown driver として扱い、通常の 3-way merge を行う。  
`session-init.sh` または `README` のセットアップ節にこの手順を含めることが必須要件（R-1）である。
