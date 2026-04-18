# Phase 4: テストシナリオ定義

**タスクID**: TASK-CONFLICT-PREVENT-001
**フェーズ**: Phase 4 — テスト設計
**作成日**: 2026-04-18

---

## 概要

本ドキュメントでは、マージコンフリクト防止実装に対するテストシナリオ TC-4-01〜TC-4-05 を定義する。
各シナリオは「前提条件」「操作手順」「期待結果」「合否基準」で構成する。

---

## TC-4-01: merge.ours.driver 設定済み repo での merge simulation

**目的**: `merge=ours` アトリビュートが設定された `indexes/*.md` で、ours ドライバーが正しく動作し current branch 側を保持することを確認する。

| 項目         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 対象ファイル | `.gitattributes` (indexes/\*.md merge=ours)                                                  |
| 前提条件     | `git config merge.ours.driver true` が登録済み                                               |
| 操作         | feature ブランチと main ブランチを作り、両方で `indexes/topic-map.md` を別内容に変更後 merge |
| 期待結果     | current branch (merge を実行したブランチ) 側の内容が残る                                     |
| 合否基準     | merge 後の `indexes/topic-map.md` が current branch 側と一致する (diff 0行)                  |
| 失敗パターン | driver 未登録の場合は merge conflict が発生する                                              |

---

## TC-4-02: LOGS.md への追記が両ブランチ分残る (merge=union)

**目的**: `LOGS.md` が `merge=union` アトリビュートを持つため、両ブランチの追記がすべて保持されることを確認する。

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 対象ファイル | `LOGS.md` (.gitattributes: LOGS.md merge=union)                            |
| 前提条件     | feature ブランチと main ブランチが独立して `LOGS.md` に1行ずつ追記している |
| 操作         | feature → main へ merge                                                    |
| 期待結果     | 両ブランチの追記行がどちらも `LOGS.md` に存在する                          |
| 合否基準     | feature 側の追記行 & main 側の追記行、両方が grep で1件以上ヒット          |
| 失敗パターン | どちらか一方の追記だけが残っていた場合は NG                                |

---

## TC-4-03: generate-index.js 実行後の topic-map.md に日付行が含まれない

**目的**: `generate-index.js` のリファクタで date ヘッダー行を削除した結果、`topic-map.md` が deterministic になっていることを確認する。

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| 対象ファイル | `indexes/topic-map.md`、`scripts/generate-index.js`               |
| 前提条件     | `generate-index.js` の date ヘッダー除去が適用済み                |
| 操作         | `node scripts/generate-index.js` を実行                           |
| 期待結果 1   | `topic-map.md` に `自動生成:` を含む行が0件                       |
| 期待結果 2   | `topic-map.md` に `\| L\d+` 形式の行番号索引が1件以上残っている   |
| 合否基準     | 期待結果 1 AND 期待結果 2 が両方 PASS                             |
| 失敗パターン | date 行が残る場合は同一コンテンツでも merge conflict の原因になる |

---

## TC-4-04: .claude/skills と .agents/skills のファイルパリティ確認

**目的**: `.claude/skills` (ソース) と `.agents/skills` (ミラー) のファイル構成・内容が一致していることを確認する。

| 項目             | 内容                                                           |
| ---------------- | -------------------------------------------------------------- |
| 対象ディレクトリ | `.claude/skills/`、`.agents/skills/`                           |
| 前提条件         | 最新の mirror sync が完了している                              |
| 操作             | `diff -qr .claude/skills .agents/skills` を実行                |
| 期待結果         | 出力が0行 (差分なし)                                           |
| 合否基準         | exit code 0 かつ stdout が空                                   |
| 失敗パターン     | 出力に `Files ... differ` または `Only in` が含まれる場合は NG |

---

## TC-4-05: EVALS.json の schema キーが本タスク前後で変わらない

**目的**: 本タスク (TASK-CONFLICT-PREVENT-001) の変更が `EVALS.json` の schema に影響を与えていないことを確認する。

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 対象ファイル | `EVALS.json` またはプロジェクト内の同等ファイル                      |
| 前提条件     | 本タスク着手前の EVALS.json schema snapshot が存在する               |
| 操作         | `jq 'keys'` で本タスク実装後の schema キーを取得し、snapshot と比較  |
| 期待結果     | キー一覧が snapshot と完全一致                                       |
| 合否基準     | diff 0行                                                             |
| 失敗パターン | キーの追加・削除・名称変更があれば NG、consumer 側の修正も必要になる |

---

## テストシナリオ実行順序

```
TC-4-01 → TC-4-02  (merge driver 動作確認)
TC-4-03            (deterministic index 確認)
TC-4-04            (parity 確認)
TC-4-05            (schema 不変確認)
```

TC-4-01 と TC-4-02 はそれぞれ独立した一時 git repo で実施するため、並行実行可能。

---

## 関連ドキュメント

- `outputs/phase-4/command-expectations.md` — 各 TC のコマンド詳細
- `outputs/phase-4/mirror-and-consumer-guard.md` — parity guard と consumer audit の手順
