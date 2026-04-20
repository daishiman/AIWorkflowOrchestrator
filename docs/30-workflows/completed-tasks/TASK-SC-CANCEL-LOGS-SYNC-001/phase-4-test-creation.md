---
phase: 4
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
status: pending
created_date: 2026-04-20
---

# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 4                                                    |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001                         |
| タスク種別 | NON_VISUAL（ドキュメント追記タスク）                 |
| 前Phase    | [phase-3-design-review.md](phase-3-design-review.md) |
| 次Phase    | phase-5-implementation.md                            |
| 作成日     | 2026-04-20                                           |

---

## 目的

Phase 5（追記実装）に進む前に、本タスクの **「テスト」=「grep ベースの形式整合・存在検証」** を仕様化する。
具体的には以下 2 点を確定する。

1. **fixture 化**: 5 ファイルそれぞれの「直近最新エントリ」を抜粋し、追記時に完全模倣する形式参照スナップショットとして固定
2. **検証コマンド suite**: Phase 11 の NON_VISUAL 代替証跡（`manual-test-result.md`）に貼り付ける grep コマンド一式を TC-ID と紐付けて定義

コード変更を伴わないため、ユニットテスト・E2E テストは対象外。
代替として **「既存形式 fixture × grep 検証コマンド」** の 2 軸で「テスト」を構成する。

---

## 前提

- Phase 1-3（要件定義 / 設計 / 設計レビュー）が完了し、Gate 判定が PASS
- `outputs/phase-2/sync-design.md` で確定した Lane A/B/C 構成と TC-01〜TC-05 の枠組みが固定済み
- 各対象ファイル（5 ファイル + active/completed 候補）は **読み取りのみ**。Phase 4 では編集しない
- `topic-map.md` / `keywords.json` は本 Phase の検証対象外（最小変更原則）

---

## 実行タスク

### タスク1: fixture 化（既存最新エントリの抜粋）

**目的**: Phase 5 で追記する際の「形式テンプレート」を確定し、形式逸脱を構造的に防ぐ。

**実行手順**:

1. `.claude/skills/task-specification-creator/LOGS.md` の **直近最新 1 エントリ**（コンテキスト・成果・結果の3節構成）を抜粋
2. `.claude/skills/aiworkflow-requirements/LOGS.md` の **表の末尾 1 行** を抜粋（タスクID / 操作 / 対象ファイル / 結果 / 備考の 5 列）
3. `aiworkflow-requirements/references/task-workflow.md`（および `task-workflow-active.md` / `task-workflow-completed*.md`）の **active / completed 双方の最新 1 エントリ** を抜粋
4. `lessons-learned-current-2026-04.md`（または同等の 2026-04 ファイル）の **直近 1 知見エントリ**（h3 タイトル + 背景 / 学び / 適用箇所）を抜粋
5. 親タスク `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の **フロントマターと Phase 一覧テーブル** の現状を抜粋
6. 上記 5 種類を `outputs/phase-4/format-fixture-snapshots.md` に「File 1 〜 File 5」セクションで集約

**期待される成果物**:

- `outputs/phase-4/format-fixture-snapshots.md`（5 ファイルの最新エントリ抜粋・追記時の形式参照用）

---

### タスク2: 検証コマンド suite の確定

**目的**: Phase 11 で NON_VISUAL 代替証跡として貼り付ける grep コマンドを TC-ID と紐付けて定義する。

**実行手順**:

1. Phase 2 設計の TC-01〜TC-05 を `verification-commands.md` に転記
2. 各 TC に対し以下を併記:
   - 検証対象ファイル（絶対パスではなくリポジトリルート相対）
   - 実行コマンド（`grep -n` または `grep -rn`）
   - 期待結果（「1 件以上ヒット」「該当行存在」等）
   - 失敗時の戻り先（多くは Phase 5 への差し戻し）
3. AC-1〜AC-5 と TC-01〜TC-05 の対応マトリクスを作成（漏れ・重複の検出）
4. Phase 9 の最終品質ゲート用に「全 5 コマンドを連続実行する 1 行版（`&&` 連結）」も併記

**期待される成果物**:

- `outputs/phase-4/verification-commands.md`（TC × コマンド × 期待結果 × AC 対応マトリクス）

---

### タスク3: テストマトリクスの完成

**目的**: TC-ID とその検証目的・検証手段の対応を 1 表に集約し、Phase 11 で漏れなく実行できる状態を作る。

**実行手順**:

1. 下記 TC マトリクスを `verification-commands.md` 末尾に追加（または `format-fixture-snapshots.md` 冒頭に再掲）
2. TC ごとに「対応 AC」「fixture 参照先 File 番号」「実行 Phase（11 / 9）」を併記

| TC ID | 検証対象               | 対応 AC | 参照 fixture | 実行 Phase |
| ----- | ---------------------- | ------- | ------------ | ---------- |
| TC-01 | task-spec-creator LOGS | AC-1    | File 1       | 11 / 9     |
| TC-02 | aiworkflow-req LOGS    | AC-2    | File 2       | 11 / 9     |
| TC-03 | task-workflow.md 系    | AC-3    | File 3       | 11 / 9     |
| TC-04 | lessons-learned        | AC-4    | File 4       | 11 / 9     |
| TC-05 | 親タスク index.md      | AC-5    | File 5       | 11 / 9     |

**期待される成果物**:

- `verification-commands.md` 内の TC マトリクス（AC-fixture-Phase の 3 軸対応表）

---

## 検証コマンド（リポジトリルート起点）

```bash
# TC-01: task-spec-creator LOGS（追記後に 1 件以上ヒットすることを Phase 11 で確認）
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/task-specification-creator/LOGS.md

# TC-02: aiworkflow-req LOGS
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/aiworkflow-requirements/LOGS.md

# TC-03: task-workflow.md / active / completed
grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/aiworkflow-requirements/references/

# TC-04: lessons-learned 3 知見（NON_VISUAL / scope 境界 / repo-wide sync）
grep -rn "NON_VISUAL\|scope.*境界\|repo-wide sync" \
  .claude/skills/aiworkflow-requirements/references/lessons-learned*.md

# TC-05: 親 index.md の Phase 12 完了宣言
grep -n "Phase 12.*completed\|status.*completed" \
  docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md
```

> Phase 4 時点では「コマンド定義のみ」を行う。実行と出力スナップショット記録は Phase 11 で行う。

---

## 統合テスト連携

本タスクはコード変更を含まないため、ユニットテスト / 結合テスト / E2E テストの実行対象外。
Phase 7 / 9 / 11 で以下の整合性検証を代替として実施する。

| 判定項目                       | 基準                | 実行 Phase |
| ------------------------------ | ------------------- | ---------- |
| 既存エントリ形式整合性         | 形式逸脱 0          | 6 / 11     |
| TC-01〜TC-05 の grep ヒット    | 5/5 ヒット          | 11         |
| Issue #2313「未実施」6項目対応 | 6/6 対応            | 7          |
| Markdown 構文                  | lint エラー 0       | 9          |
| 日付フォーマット               | `2026-04-20` で統一 | 9          |

---

## 参照資料

| 資料                                                                             | 用途                            |
| -------------------------------------------------------------------------------- | ------------------------------- |
| [phase-3-design-review.md](phase-3-design-review.md)                             | gate 判定と戻り先基準           |
| [phase-2-design.md](phase-2-design.md)                                           | TC-01〜TC-05 と Lane 設計の正本 |
| `.claude/skills/task-specification-creator/references/phase-template-phase11.md` | Phase 11 への受け渡し骨格       |
| `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`           | 抜粋時の形式確認                |

---

## 成果物

| 成果物                   | パス                                          | 内容                               |
| ------------------------ | --------------------------------------------- | ---------------------------------- |
| verification commands    | `outputs/phase-4/verification-commands.md`    | TC × コマンド × 期待結果 × AC 対応 |
| format fixture snapshots | `outputs/phase-4/format-fixture-snapshots.md` | 5 ファイルの既存最新エントリ抜粋   |

---

## 完了条件

- [ ] 5 ファイルそれぞれの最新エントリが `format-fixture-snapshots.md` に抜粋されている
- [ ] TC-01〜TC-05 の grep コマンドが `verification-commands.md` に列挙されている
- [ ] 各 TC に対応 AC・参照 fixture・実行 Phase が紐付けられている
- [ ] Phase 9 用の連続実行版（`&&` 連結）コマンドが定義されている
- [ ] Phase 5（実装＝追記実行）に進める状態であることが明示されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 検証方法

1. `outputs/phase-4/format-fixture-snapshots.md` を Read で目視し、5 ファイル分すべての fixture が貼り付けられていることを確認
2. `outputs/phase-4/verification-commands.md` の TC マトリクスから AC-1〜AC-5 への対応漏れがないことを確認
3. 列挙された grep コマンドをドライラン（実行のみ・追記前なので 0 ヒットが正常）し、コマンド構文エラーがないことを確認

---

## 次Phase

phase-5-implementation.md — Lane A/B 並列で 4 ファイル追記 → Lane C 直列で親 index.md Phase 12 完了宣言
