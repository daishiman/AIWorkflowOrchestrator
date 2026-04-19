# Phase 5: 実装（差分修正パッチ適用）

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 4（テスト作成・期待挙動確定）       |
| 後続Phase  | Phase 6（テスト拡充）                     |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 4 で確定した期待挙動マトリクスに合わせ、`.gitattributes` の glob を精緻化して `merge=union` の適用範囲を append-only ファイルに限定する。同時に各エントリへ「適用意図」と「新規ファイル追加時の判断ガイド」を示すコメントを追加し、`setup-merge-drivers.sh` の登録動作確認も行う。実装行数は数行〜十数行に収まる小規模変更だが、確実に diff を取得し implementation-summary に残す。

## 背景

現行 `.gitattributes` は `.claude/skills/*/references/*.md` に対して一律 `merge=union` を適用しているため、構造化ドキュメント（`task-workflow.md` / `lessons-learned.md` 等）に誤適用される長期リスクがある。Phase 2/3 で「append-only ファイルのみを明示列挙し、構造化ファイルは glob 対象から除外する」方針が確定済み。本 Phase はその設計を最小差分で実装し、Phase 4 で TDD Red になっていた TC-02 を Green 化する。

## 実行タスク

### タスク0: 修正前 `.gitattributes` のスナップショット取得

**目的**: 差分検証のベースラインを固定する。

**実行手順**:

1. 修正前の `.gitattributes` 全体を `outputs/phase-5/snapshots/gitattributes.before` に保存（コピーのみ、変更なし）。
2. `git check-attr merge -- <代表ファイル群>` の出力を `outputs/phase-5/snapshots/check-attr.before.txt` に保存。代表ファイルは以下を含める。
   - `.claude/skills/aiworkflow-requirements/references/LOGS.md`
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
   - `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
   - `.agents/skills/<任意>/references/SKILL-changelog.md`
   - `.claude/skills/<任意>/references/indexes/topic-map.json`

**期待される成果物**: `outputs/phase-5/snapshots/` 配下のスナップショット 2 種。

### タスク1: `.gitattributes` の修正実装

**目的**: 構造化ドキュメントから `merge=union` を除去し、append-only ファイルへ個別指定する。

**実行手順**:

1. 既存の `references/*.md` 一括 `merge=union` 行を削除。
2. 以下の append-only ファイルに対して個別 glob を追加する。
   - `**/references/LOGS.md merge=union`
   - `**/references/SKILL-changelog.md merge=union`
   - `**/references/task-workflow-completed.md merge=union`
3. 構造化ドキュメント（`task-workflow.md` / `lessons-learned.md` など）はデフォルトマージとなるよう、`merge=union` の対象に含めない（明示的な reset エントリは Git の優先順位ルール上不要だが、誤適用防止のためコメントで明記）。
4. `indexes/*.json` の `merge=ours` 行は維持し、コメントを補強。
5. 各エントリ直前に以下フォーマットでコメントを付与。

   ```
   # [<カテゴリ>] <意図>
   # 新規ファイル追加判断: <append-only か構造化かの判断基準>
   <pattern> <attr>
   ```

**期待される成果物**: 修正後の `.gitattributes`、および差分パッチ `outputs/phase-5/gitattributes.patch`。

### タスク2: `setup-merge-drivers.sh` の動作確認とコメント追記

**目的**: `merge.ours.driver` がローカルで正しく登録されることを再確認し、未登録時のフォールバック挙動をスクリプト先頭コメントで明示する。

**実行手順**:

1. `setup-merge-drivers.sh` を一時ディレクトリで実行し、`git config merge.ours.driver` が `true` を返すことを確認。
2. スクリプト冒頭に以下情報をコメントで追記（ロジック変更は行わない）。
   - 登録される driver 名と用途
   - 未登録時に `indexes/*.json` のマージで何が起きるか（warning + デフォルトマージ）
   - 利用者が自分のローカル clone 後に必ず実行すべき旨
3. 確認ログを `outputs/phase-5/setup-merge-drivers-verify.log` に保存。

**期待される成果物**: `setup-merge-drivers.sh` のコメント追記、検証ログ。

### タスク3: 修正前後の diff 取得と implementation-summary 作成

**目的**: 差分・影響範囲・テスト対比を 1 ドキュメントに集約する。

**実行手順**:

1. `git diff -- .gitattributes .claude/scripts/setup-merge-drivers.sh` の出力を `outputs/phase-5/diff.patch` に保存。
2. `outputs/phase-5/implementation-summary.md` に以下章を作成。
   - 変更概要（何を / なぜ / どう）
   - 変更前後の `git check-attr merge` 出力比較
   - Phase 4 のテストケースとの対応表（TC-ID → 期待挙動 → 本実装での扱い）
   - 既存運用への影響（`LOGS.md` 並列追記が引き続き union で動作することを明示）
   - リスク・残課題（カスタムドライバー未登録環境への注意喚起）

**期待される成果物**: `outputs/phase-5/implementation-summary.md`、`outputs/phase-5/diff.patch`。

### タスク4: ファイル新規作成・修正・削除一覧

**目的**: [Feedback RT-03] 対応として、本 Phase での全ファイル変更を明示する。

**実行手順**:

1. 以下の表を `implementation-summary.md` 末尾に追加する。

   | 種別     | パス                                        | 内容                                            |
   | -------- | ------------------------------------------- | ----------------------------------------------- |
   | 修正     | `.gitattributes`                            | `merge=union` 適用範囲縮小 + 各エントリコメント |
   | 修正     | `.claude/scripts/setup-merge-drivers.sh`    | 冒頭コメント追記（ロジック変更なし）            |
   | 新規作成 | `outputs/phase-5/implementation-summary.md` | 本 Phase の総括                                 |
   | 新規作成 | `outputs/phase-5/diff.patch`                | 修正前後の差分                                  |
   | 新規作成 | `outputs/phase-5/snapshots/*`               | 修正前スナップショット                          |
   | 削除     | （なし）                                    | -                                               |

2. 「コードファイルの新規作成は 0 件」「ロジック変更は `.gitattributes` のみ」と明記する。

**期待される成果物**: `implementation-summary.md` 内の変更一覧表。

## 参照資料

| 参照資料             | パス                                            | 内容                         |
| -------------------- | ----------------------------------------------- | ---------------------------- |
| Phase 2 設計書       | `outputs/phase-2/merge-strategy-design.md`      | 採用する分類とパッチ案       |
| Phase 4 マトリクス   | `outputs/phase-4/expected-behavior-matrix.md`   | 期待挙動の根拠               |
| Git 公式ドキュメント | <https://git-scm.com/docs/gitattributes#_merge> | `merge` 属性とドライバー仕様 |

## 成果物

| 成果物                 | パス                                             | 内容                       |
| ---------------------- | ------------------------------------------------ | -------------------------- |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`      | 変更概要・対応表・影響範囲 |
| 差分パッチ             | `outputs/phase-5/diff.patch`                     | `git diff` 出力            |
| 修正前スナップショット | `outputs/phase-5/snapshots/`                     | `gitattributes.before` 等  |
| ドライバー検証ログ     | `outputs/phase-5/setup-merge-drivers-verify.log` | 登録確認ログ               |

## 統合テスト連携【必須】

| 判定項目                                         | 基準                                                          | 結果    |
| ------------------------------------------------ | ------------------------------------------------------------- | ------- |
| Phase 4 の TC-02 が Green 化する見込み           | 修正後 `.gitattributes` で `task-workflow.md` が union 対象外 | pending |
| TC-01（`LOGS.md` 並列追記）が引き続き Green      | 個別 glob で `LOGS.md` に union が維持されている              | pending |
| `git check-attr` 出力差分が想定通り              | 構造化ファイルから `merge: union` が消える                    | pending |
| `setup-merge-drivers.sh` のロジック変更が無い    | diff で実行行の変更が 0、コメント行の追加のみ                 | pending |
| 変更ファイル一覧（Feedback RT-03）の表が記載済み | implementation-summary.md 末尾に新規/修正/削除区分の表が存在  | pending |

## 完了条件

- [ ] 修正前スナップショットを `outputs/phase-5/snapshots/` に保存
- [ ] `.gitattributes` を Phase 2 設計通りに修正し、各エントリへコメントを付与
- [ ] `setup-merge-drivers.sh` 冒頭にコメントのみ追記（ロジック変更なし）
- [ ] `outputs/phase-5/diff.patch` と `outputs/phase-5/implementation-summary.md` を作成
- [ ] ファイル新規作成・修正・削除一覧（[Feedback RT-03]）を summary に記載
- [ ] `complete-phase.js` で Phase 5 を complete に更新
