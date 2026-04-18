# Phase 6: 拡張テストマトリクス

**タスクID**: TASK-CONFLICT-PREVENT-001
**フェーズ**: Phase 6 — エッジケース拡張
**作成日**: 2026-04-18

---

## 概要

Phase 4 の TC-4-01〜TC-4-05 に加え、エッジケースとして以下の追加シナリオを定義する。
各シナリオは「正常系に対してどこか一つの前提が崩れた場合」を網羅している。

---

## EC-6-01: `merge.ours.driver` 未登録時の fail-fast

**目的**: ドライバーが未登録の状態で merge が発生した場合、コンフリクトが発生することを確認する。
また `session-init.sh` が警告を出力することを確認する。

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 前提条件   | `git config --unset merge.ours.driver` でドライバーを削除した状態            |
| 操作 1     | `indexes/topic-map.md` を両ブランチで変更し merge を試みる                   |
| 期待結果 1 | `CONFLICT (content): Merge conflict in indexes/topic-map.md` が出力される    |
| 操作 2     | `session-init.sh` を実行する                                                 |
| 期待結果 2 | stderr に `[WARN] merge.ours.driver が未設定です。` が含まれる               |
| 合否基準   | 期待結果 1 AND 期待結果 2 が両方 PASS                                        |
| 対処       | `bash .claude/scripts/setup-merge-drivers.sh` を実行してドライバーを登録する |

---

## EC-6-02: regenerate 後にも差分が残るケース

**目的**: `generate-index.js` を実行した後でも `topic-map.md` に差分が残る場合を検出する。
(スキル定義ファイルの変更が index に反映されていないケース)

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 前提条件 | `.claude/skills/` 配下にファイルを追加した直後、`generate-index.js` を**実行していない**状態 |
| 操作     | `git diff indexes/topic-map.md` を実行                                                       |
| 期待結果 | diff が出力される (新しいスキルが index に未反映)                                            |
| 合否基準 | diff が出力されれば「stale index を検出できた」と判断 (このケース自体は失敗パターン)         |
| 対処     | `node scripts/generate-index.js` を実行し、差分が消えることを確認する                        |
| 備考     | `post-merge` フックが正しく設定されていれば自動的に regenerate される                        |

---

## EC-6-03: LOGS.md が archive threshold 未満のケース

**目的**: `LOGS.md` が archive しきい値 (例: 500行) に達していない場合、
`merge=union` が正常に動作し、追記が混在しないことを確認する。

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| 前提条件 | `LOGS.md` が 100行以下 (archive threshold 未満)               |
| 操作     | 両ブランチで `LOGS.md` に追記後 merge                         |
| 期待結果 | 両方の追記行が存在する (TC-4-02 と同条件)                     |
| 合否基準 | grep で両方の追記行がヒット                                   |
| 備考     | archive threshold を超えた場合の挙動は EC-6-04 で別途定義予定 |

---

## EC-6-04: EVALS consumer が見つかったケース (仮想シナリオ)

**目的**: 将来 `EVALS.json` に consumer が追加された場合の対応手順を確認する。

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| 前提条件 | `rg "EVALS\.json"` の結果が1件以上ヒットする状態 (仮想)               |
| 操作     | `consumer-audit-decision.md` の判断フローを適用する                   |
| 期待結果 | schema 変更が必要か否かを判定し、必要であれば別 Issue を作成する      |
| 合否基準 | 判断記録が `consumer-audit-decision.md` に残っていること              |
| 備考     | 現時点 (2026-04-18) では consumer 0件のため、このシナリオは発動しない |

---

## テストマトリクス全体

| ID      | シナリオ                       | 正常系/異常系 | 自動化 | 優先度 |
| ------- | ------------------------------ | ------------- | ------ | ------ |
| TC-4-01 | merge=ours でcurrent側保持     | 正常系        | 可     | High   |
| TC-4-02 | merge=union で両追記保持       | 正常系        | 可     | High   |
| TC-4-03 | topic-map.md deterministic     | 正常系        | 可     | High   |
| TC-4-04 | .claude/.agents parity         | 正常系        | 可     | High   |
| TC-4-05 | EVALS schema 不変              | 正常系        | 可     | Medium |
| EC-6-01 | driver 未登録時 fail-fast      | 異常系        | 可     | High   |
| EC-6-02 | regenerate 後も差分残る        | 異常系        | 可     | Medium |
| EC-6-03 | LOGS.md archive threshold 未満 | 境界値        | 可     | Low    |
| EC-6-04 | EVALS consumer 発見 (仮想)     | 仮想シナリオ  | 手動   | Low    |

---

## 関連ドキュメント

- `outputs/phase-4/test-scenarios.md` — TC-4-01〜TC-4-05 の定義
- `outputs/phase-6/regression-checks.md` — リグレッション確認手順
- `outputs/phase-6/failure-mode-catalog.md` — 失敗モード一覧
