---
phase: 12
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
status: completed
created_date: 2026-04-20
---

# Phase 12: ドキュメント・スキル仕様反映

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 12                                                                       |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001                                             |
| タスク種別 | NON_VISUAL（ドキュメント追記タスク）                                     |
| 親タスク   | TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001                                   |
| Issue      | [#2313](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2313) |
| 前Phase    | [phase-11-manual-test.md](phase-11-manual-test.md)                       |
| 次Phase    | phase-13-pr-creation.md（blocked / 別エージェント担当）                  |
| 作成日     | 2026-04-20                                                               |

---

## 目的

本タスク（`TASK-SC-CANCEL-LOGS-SYNC-001`）の Phase 12 は、**本タスク自身の close-out** と
**親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 12 完了宣言** を
同一 wave で完結させることに価値の核心がある。
mandatory 6 成果物を `outputs/phase-12/` に揃え、

1. **branch 内追記**（5 ファイル: 両 LOGS / task-workflow / lessons-learned / 親 index.md）と
2. **repo-wide sync**（同 wave 内完結）

の境界を Step 1-A テーブルで明示し、
3 知見（NON_VISUAL 代替証跡 / scope 境界明確化 / repo-wide sync 持ち越し管理）を
`lessons-learned-current-2026-04.md` へ恒久ルール化として追記する。

---

## 事前チェック【必須】

Phase 12 着手前に以下を確認する（`.claude/rules/06-known-pitfalls.md` の P1 / P2 / P3 / P4 / P25 / P26 / P27 / P28 / P29 / P48 関連）:

| #   | 確認項目                                                                                       | 確認コマンド / 方法                                                                                          | 期待結果          |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------- |
| 1   | `outputs/phase-11/manual-test-result.md` が存在し TC-01〜TC-05 が全 PASS                       | `ls outputs/phase-11/manual-test-result.md` + Read で判定列確認                                              | 5/5 PASS          |
| 2   | `outputs/phase-10/final-review-result.md` の blocker が 0 件                                   | Read で目視                                                                                                  | blocker 0         |
| 3   | `artifacts.json` と `outputs/artifacts.json` の parity がある（drift 0）                       | `diff artifacts.json outputs/artifacts.json` または `grep -n "status" artifacts.json outputs/artifacts.json` | 同値              |
| 4   | 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 1〜11 がすべて `completed` | Read で目視                                                                                                  | 全行 completed    |
| 5   | 親タスクの `outputs/phase-12/` に mandatory 5 成果物が存在                                     | `ls docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/`                              | 5 ファイル存在    |
| 6   | `taskType: "NON_VISUAL"` が `artifacts.json` / `outputs/artifacts.json` 両方にある             | `grep -n "taskType\|nonVisual" artifacts.json outputs/artifacts.json`                                        | 両方に NON_VISUAL |

---

## 中学生レベル概念説明【必須】

> phase-template-phase12-detail.md の「中学生レベル概念説明」要件に基づく。
> 本節は `implementation-guide.md` Part 1 の素材としても再利用される。

### 「LOGS.md」って何？

**たとえば**、学校で部活の練習日誌を毎日書きますよね。誰がいつ何を練習して、どこでつまづいて、次はどうするか。
LOGS.md はそれと同じで、**スキル（task-specification-creator や aiworkflow-requirements）が
「いつ・どのタスクを・どんな結果で終えたか」を記録する練習日誌** です。
日誌を書き忘れると、後から「あのタスクどうなったっけ？」が分からなくなります。本タスクは、
書き忘れていた日誌の続きを 2 冊（2 つの LOGS.md）にまとめて書く作業です。

### 「lessons-learned」って何？

**たとえば**、料理本の最後にある「失敗しないコツ集」のようなものです。
一度やって学んだ「次回も同じ失敗をしないためのコツ」を記録しておく場所が `lessons-learned-current-2026-04.md` です。
本タスクでは「スクリーンショットが撮れない時の代わりの証拠の残し方」を含む 3 つのコツを書き足します。

### 「canonical spec」って何？

**たとえば**、学校の校則は 1 冊の正式な本にまとまっていて、みんなそれを見て判断しますよね。
canonical spec（正本仕様）は **「これが正しい」と全員が参照する公式の本** です。
`.claude/skills/aiworkflow-requirements/references/` がその本棚にあたります。
本棚にある複数の本（`task-workflow.md` / `lessons-learned-current-2026-04.md` 等）を更新するのが本タスクです。

### 「repo-wide sync」って何？

**たとえば**、クラスの黒板（branch 内）に書いた連絡事項を、職員室の掲示板（repo-wide）にも貼る作業です。
クラス内だけで完結する話と、学校全体に知らせる話は別物。
本タスクは「クラスでやった作業を、学校全体の掲示板（両スキルの LOGS / canonical spec）にも貼る」
ところまでを 1 回の wave で終わらせる役割を持ちます。

### 「scope 境界」って何？

**たとえば**、引っ越しのときに「自分の部屋だけ片付ける日」と「家族共用スペースを片付ける日」を分けますよね。
scope 境界は **「今回の wave で触る範囲（branch 内）と、別 wave に分ける範囲（repo-wide sync）」を
あらかじめ決めておくこと** です。境界が曖昧だと「終わったのか終わってないのか分からない」状態になります。
本タスクの Step 1-A テーブルで、この境界を表にして可視化します。

---

## 実行タスク

| Task      | 内容                                                                                                                  | 主成果物                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成（Part 1 中学生レベル / Part 2 開発者向け、追記実行ガイド + 親タスク完了宣言ガイドの 2 パート）         | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec update summary（4 ステップ: 両 LOGS 追記 / task-workflow 更新 / lessons-learned 追記 / 親 index.md 更新） | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | documentation changelog（変更ファイル 5 件の changelog）                                                              | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | unassigned task detection（本 wave 完了後の残課題スキャン結果）                                                       | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | skill feedback report（task-specification-creator / aiworkflow-requirements 両 skill 向け FB）                        | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | phase12-task-spec-compliance-check（Task 12-1〜12-5 の compliance チェック）                                          | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイドを Part 1 / Part 2 構成で作成し、Part 2 を「追記実行ガイド」と「親タスク完了宣言ガイド」の 2 セクションに分割
- Task 12-2: 4 ステップ（両 LOGS 追記 / task-workflow 更新 / lessons-learned 追記 / 親 index.md 更新）の実施結果を Step 1-A テーブルで記録
- Task 12-3: 変更した 5 ファイル（両 LOGS / task-workflow / lessons-learned / 親 index.md）の changelog を `outputs/phase-12/documentation-changelog.md` に記録
- Task 12-4: 本 wave 完了後の残課題をスキャンし、0 件でも summary を記録
- Task 12-5: 両 skill 向け FB を記録（改善点なしでも明示）
- Task 12-6: Task 12-1〜12-5 の compliance を `phase12-task-spec-compliance-check.md` に集約

> 上記は **表と箇条書きの両方を残すこと**（テンプレート規約）。

---

## Task 12-1: 実装ガイド作成【必須・2 パート構成】

| パート | 対象読者                       | 必須内容                                                                                                                                                                                               |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Part 1 | 初学者・中学生レベル           | 上記「中学生レベル概念説明」を再利用。`たとえば` を最低 1 回含み、「なぜ必要か → 何をするか」の順序                                                                                                    |
| Part 2 | 開発者・技術者（2 セクション） | **(A) 追記実行ガイド**: 5 ファイルへの追記マップ・grep 検証コマンド・既存エントリ形式整合の標準化 / **(B) 親タスク完了宣言ガイド**: 親 index.md の Phase 12 → completed 化手順・current_phase 維持判断 |

### Part 2-A: 追記実行ガイド（5 ファイル）

| #   | ファイル                                                                                     | 追記方針                                                             |
| --- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | `.claude/skills/task-specification-creator/LOGS.md`                                          | 「コンテキスト・成果・結果」3 節構成で wave 記録を末尾追記           |
| 2   | `.claude/skills/aiworkflow-requirements/LOGS.md`                                             | 表形式（タスクID / 操作 / 対象ファイル / 結果 / 備考）の末尾行に追記 |
| 3   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（+ active/completed\*） | active 側からの移動 or completed 側への新規追加                      |
| 4   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`       | 3 知見を h3 階層で末尾エントリ直後に追加                             |
| 5   | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                          | フロントマター + Phase 一覧テーブル両方更新                          |

### Part 2-B: 親タスク完了宣言ガイド

| 操作                             | 詳細                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| フロントマター `status` の更新   | `in_progress` → `completed`（または `pending_pr`。Phase 13 が user 承認待ち blocked のため判断はチームで明示） |
| フロントマター `current_phase`   | `13` のまま **維持**（Phase 13 自体は blocked）                                                                |
| Phase 一覧テーブルの Phase 12 行 | ステータス列を `completed` 化                                                                                  |
| 完了日記録                       | 備考欄に 2026-04-20 を追記（任意）                                                                             |
| 注意                             | 親タスクは `current_phase: 13` のまま。本タスク完了で「Phase 12 までの完了宣言」を確定する                     |

### NON_VISUAL 視覚証跡【必須】

`implementation-guide.md` に `## 視覚証跡` を設け、以下を明記:

- **固定フレーズ**: 「UI/UX変更なしのため Phase 11 スクリーンショット不要」
- 代替証跡: `outputs/phase-10/final-review-result.md` + `outputs/phase-11/manual-test-result.md`（5 つの grep スナップショット集約）
- `screenshots/.gitkeep` は削除（NON_VISUAL 共通ルール）

### validator 要件

- `Part 1` 内に `たとえば` を最低 1 回明示
- Part 1 必須見出し: `### なぜ必要か` / `### 何をするか` / `### 日常の例え` / `### 今回作ったもの`
- Part 2 必須見出し: `### 型定義`（NON_VISUAL のため「該当なし」明記可）/ `### APIシグネチャ`（同左）/ `### 使用例`（grep コマンド例で代替）/ `### エラーハンドリング` / `### エッジケース` / `### 設定項目と定数一覧`（追記順序ルール等）/ `### テスト構成`（5 grep TC = 5 ケース）

---

## Task 12-2: system spec update summary【必須・4 ステップ】

### Step 1-A: 両 LOGS.md 追記 + scope 境界テーブル【必須】

#### scope 境界テーブル（branch 内 / repo-wide sync 明示）

| 区分                   | 対象                                                                                                                   | 本 wave 内で完了 | 別 wave へ持ち越し     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------- |
| **branch 内追記**      | 本タスクの `outputs/phase-1/`〜`outputs/phase-12/` 配下の成果物（mandatory 6 成果物含む）                              | ✅ 完了          | -                      |
| **repo-wide sync (1)** | `.claude/skills/task-specification-creator/LOGS.md` への wave 記録追記                                                 | ✅ 完了          | -                      |
| **repo-wide sync (2)** | `.claude/skills/aiworkflow-requirements/LOGS.md` への close-out 記録追記                                               | ✅ 完了          | -                      |
| **repo-wide sync (3)** | `aiworkflow-requirements/references/task-workflow.md` 系への完了記録追加                                               | ✅ 完了          | -                      |
| **repo-wide sync (4)** | `lessons-learned-current-2026-04.md` への 3 知見追記                                                                   | ✅ 完了          | -                      |
| **repo-wide sync (5)** | 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 完了宣言                                        | ✅ 完了          | -                      |
| **本タスク自身**       | `task-specification-creator/LOGS.md` / `aiworkflow-requirements/LOGS.md` への **本タスクの**完了記録追加（self-close） | ✅ 完了          | -                      |
| **scope 外**           | コード実装変更 / Issue #2229 再実装 / 親タスク Phase 13 PR 作成 / `topic-map.md` / `keywords.json` の不要再生成        | -                | scope 外（実施しない） |

> **Phase 12 self-close-out**: 本タスク自身の LOGS.md エントリは、本タスクの Phase 12 で追記する（自己同期）。
> 「親タスクの追記」と「本タスクの追記」を **別行で** 両 LOGS.md に書くこと。

#### LOGS.md 2 ファイル更新チェック（P1 / P25 対策）

- [ ] `aiworkflow-requirements/LOGS.md` に親タスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` に親タスク完了エントリを追加
- [ ] `aiworkflow-requirements/LOGS.md` に **本タスク自身の** 完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` に **本タスク自身の** 完了エントリを追加
- [ ] `aiworkflow-requirements/SKILL.md` / `task-specification-creator/SKILL.md` の change history 更新を実施

### Step 1-B: task-workflow.md（active/completed）更新

- `task-workflow.md` / `task-workflow-active.md` / `task-workflow-completed*.md` を grep で全件確認
- 親タスクが active 側に残っていれば completed 側へ移動
- 本タスクの完了記録も同時に completed 側へ追記

### Step 1-C: lessons-learned-current-2026-04.md への 3 知見追記【恒久ルール化】

| #   | 知見                            | 恒久ルール化文言                                                                                                                                       |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | NON_VISUAL 代替証跡方針の標準化 | 「**Phase 11 `manual-test-result.md` を一次ソースとする**。grep スナップショットを集約し placeholder-only を PASS 扱いにしない」を恒久ルールとして明記 |
| 2   | scope 内 / scope 外の境界明確化 | 「**branch 内 / repo-wide の 2 カラム管理**」を恒久ルールとして明記。Phase 12 Step 1-A テーブルで境界を可視化                                          |
| 3   | repo-wide sync 持ち越し管理     | 「**同 wave 完結できない sync は unassigned task として formalize**」を恒久ルールとして明記。本タスクが formalize 例として参照される                   |

### Step 1-D: 親タスク index.md の Phase 12 完了宣言

- 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の更新箇所:
  - フロントマター `status: in_progress` → `completed`（または `pending_pr`。Phase 13 が user 承認待ち blocked のため）
  - フロントマター `current_phase: 13` は維持
  - Phase 一覧テーブルの Phase 12 行のステータス列を `completed`
  - 備考に 2026-04-20 を任意で追記

### Step 2: interface / API / IPC 契約変更の判定

- 本タスクは **コード変更ゼロ**（追記のみ）
- → `system-spec-update-summary.md` に「**Step 2 は更新不要**。理由: 本タスクは canonical spec への追記のみで、interface / API / IPC 契約に変更なし」と明記
- topic-map.md / keywords.json は **再生成不要**（最小変更原則。ファイル内容変更が発生する場合のみ再生成）

### same-wave sync チェック（FB-04 ledger / lane / artifacts 三者同期）

| 対象                                                                                  | 本 wave での更新内容                                     |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `task-workflow.md`（backlog ledger）                                                  | 親タスク + 本タスクが open 側に残っていないことを確認    |
| `task-workflow-completed.md`（completed ledger）                                      | 親タスク + 本タスクの完了記録を current facts に合わせる |
| `lane/index.md`（lane index）                                                         | N/A（本タスクは lane 非採用 workflow）— N/A 理由を明記   |
| `outputs/artifacts.json`（workflow artifacts）                                        | status / phase artifacts を current facts に合わせる     |
| `.claude/skills/task-specification-creator/outputs/artifacts.json`（skill artifacts） | status / artifact metadata を current facts に合わせる   |
| `artifacts.json` 系 2 ファイル                                                        | 片側のみ更新を禁止。両方同時に更新                       |

---

## Task 12-3: documentation changelog【必須】

### 変更ファイル 5 件の changelog 記録

| #   | ファイル                                                                               | 変更内容                                                      | バージョン      |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------- |
| 1   | `.claude/skills/task-specification-creator/LOGS.md`                                    | 親タスク wave 記録 + 本タスク close-out 記録 (2 エントリ追記) | n/a（追記のみ） |
| 2   | `.claude/skills/aiworkflow-requirements/LOGS.md`                                       | 親タスク + 本タスクの表行追加 (2 行)                          | n/a（追記のみ） |
| 3   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 系                | 親タスク + 本タスクの完了記録                                 | n/a（追記のみ） |
| 4   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md` | 3 知見の h3 エントリ追加                                      | n/a（追記のみ） |
| 5   | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                    | フロントマター status + Phase 12 行のステータス更新           | n/a（更新のみ） |

### メタ情報必須フィールド

- 変更者
- 関連 Issue / PR: #2313
- validator 実行結果: `quick_validate.js` × 3 skill の結果を貼り付け
- current / baseline: current = 0 件、baseline = 別記録（`audit-unassigned-tasks.js --json` で取得）
- artifacts 同期結果: `artifacts.json` / `outputs/artifacts.json` parity = OK

### 未来形語残存確認【完了前必須】

```bash
rg -n "計画|予定|TODO|will be|を予定|仕様策定のみ|保留として記録" \
  docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "未来形語なし"
```

- 出力が 0 件であること

---

## Task 12-4: unassigned task detection【必須・0 件でも出力】

### スキャン手順

1. Phase 3 / Phase 10 の MINOR 判定指摘事項を再確認
2. Phase 11 `discovered-issues.md` の発見課題を再確認
3. 各 Phase 成果物の「将来対応」「TODO」「FIXME」を全文検索
4. `audit-unassigned-tasks.js --json --diff-from HEAD` を実行し `currentViolations.total = 0` を確認
5. `audit-unassigned-tasks.js --json` を実行し baseline 違反件数を別記録

### 0 件の場合の出力

```markdown
## 検出結果サマリー

| ソース              | 検出数   |
| ------------------- | -------- |
| Phase 3 MINOR       | 0 件     |
| Phase 10 MINOR      | 0 件     |
| Phase 11 発見課題   | 0 件     |
| TODO/FIXME スキャン | 0 件     |
| **合計**            | **0 件** |

## 検出タスク一覧

**検出タスクなし**（本 wave で repo-wide sync が完結したため、follow-up 未タスクは発生しない見込み）

> 本タスク自身が親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の follow-up として formalize された wave である。
> 本タスク完了で repo-wide sync 持ち越しが解消されるため、新規 unassigned task は通常 0 件。
> ただし Phase 12 再監査で cross-cutting guard が必要と判明した場合は 0→1 へ再同期する。
```

### 1 件以上の場合

- `docs/30-workflows/unassigned-task/` に物理ファイルを作成（10 見出し標準テンプレート準拠）
- `task-workflow.md` の残課題テーブルへ登録
- 関連仕様書に未タスク参照リンクを追加（3 ステップ全完了 / P3 対策）

---

## Task 12-5: skill feedback report【必須・改善点なしでも出力】

### 両 skill 向け FB のセクション構成

| skill                        | FB 観点                                                                                                                                                               |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task-specification-creator` | NON_VISUAL docs-sync wave 用テンプレート不足の有無 / Phase 11 の grep スナップショット集約方式の標準化提案 / Phase 12 self-close-out のガイド強化提案                 |
| `aiworkflow-requirements`    | LOGS.md エントリ形式の自動 lint 化提案 / lessons-learned エントリの h3 階層命名規則の標準化提案 / `spec-update-workflow.md` への repo-wide sync wave パターン追加提案 |

### 必須記載

- ワークフロー改善点（Phase 実行中に発見した改善提案、なければ「なし」と明記）
- 技術的教訓（追記時の形式整合の難しさ等）
- スキル改善提案（両 skill への具体的な提案、なければ「なし」と明記）
- 新規 Pitfall 候補（`06-known-pitfalls.md` 追加候補、なければ「なし」と明記）

> Task 5 で `skill-creator` を更新した場合は `skill-creator` も同レポートへ含める（本タスクは通常スコープ外）。

---

## Task 12-6: phase12-task-spec-compliance-check【必須・最終確認】

### 4 点突合

1. `phase-12-documentation.md`（本ファイル）と `outputs/phase-12/` 実体の突合
2. `implementation-guide.md` の Part 1 / Part 2 必須見出し + `たとえば` の存在確認
3. 未タスク配置監査（本タスクは通常 0 件）
4. system spec / outputs 同期（両 LOGS / task-workflow / lessons-learned / 親 index.md）

### Task 12-1〜12-5 準拠確認テーブル

| Task | 判定        | 根拠                                                                                                               | 証跡                                             |
| ---- | ----------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 12-1 | PASS / FAIL | Part 1 / Part 2、`たとえば` 1 回以上、視覚証跡固定フレーズ、追記実行ガイド + 親タスク完了宣言ガイドの 2 セクション | `outputs/phase-12/implementation-guide.md`       |
| 12-2 | PASS / FAIL | Step 1-A scope 境界テーブル / Step 1-B〜1-D / Step 2 / same-wave sync 5 対象すべて記録                             | `outputs/phase-12/system-spec-update-summary.md` |
| 12-3 | PASS / FAIL | 5 ファイル変更内容 / メタ 5 フィールド / 未来形語 0 件 / artifacts 同期結果                                        | `outputs/phase-12/documentation-changelog.md`    |
| 12-4 | PASS / FAIL | 0 件 summary 記録、または 1 件以上で 3 ステップ全完了                                                              | `outputs/phase-12/unassigned-task-detection.md`  |
| 12-5 | PASS / FAIL | 両 skill 向け FB が記録されている（改善点なしでも明示）                                                            | `outputs/phase-12/skill-feedback-report.md`      |

### Step 1-A〜1-D / Step 2 準拠確認テーブル

| Step   | 判定        | 根拠                                                                            |
| ------ | ----------- | ------------------------------------------------------------------------------- |
| 1-A    | PASS / FAIL | scope 境界テーブル + LOGS.md 2 ファイル更新（親タスク + 本タスク = 4 エントリ） |
| 1-B    | PASS / FAIL | task-workflow.md / active / completed すべて確認・更新                          |
| 1-C    | PASS / FAIL | lessons-learned-current-2026-04.md に 3 知見が恒久ルール文言で追記              |
| 1-D    | PASS / FAIL | 親タスク index.md のフロントマター + Phase 12 行両方更新                        |
| Step 2 | PASS / N/A  | コード変更ゼロのため N/A。理由を明記                                            |

### 判定ルール（PASS 断言の防止）

- 未充足が 1 つでもある場合、`PASS` を書かず `FAIL` または `BLOCKED` とし blocker を列挙
- `PASS` は「成果物実体 + validator 実測値 + same-wave sync 証跡」が揃った後にのみ許可

---

## 成果物【mandatory 6 成果物】

| 成果物                     | パス                                                     | 必須 | 説明                                                                         |
| -------------------------- | -------------------------------------------------------- | ---- | ---------------------------------------------------------------------------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`               | ✅   | Part 1 中学生レベル / Part 2 (A) 追記実行ガイド + (B) 親タスク完了宣言ガイド |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | 4 ステップ + scope 境界テーブル + same-wave sync 5 対象                      |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | ✅   | 変更ファイル 5 件の changelog                                                |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | 0 件でも summary 必須                                                        |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 両 skill 向け FB                                                             |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | Task 12-1〜12-5 + Step 1-A〜1-D + Step 2 + 4 点突合                          |

---

## 完了条件【Phase 12 ハードゲート】

### mandatory 6 成果物

- [ ] `implementation-guide.md` が Part 1 / Part 2 構成で作成され、Part 1 に `たとえば` を 1 回以上含む
- [ ] `implementation-guide.md` の Part 2 が「(A) 追記実行ガイド」「(B) 親タスク完了宣言ガイド」の 2 セクション構成
- [ ] `implementation-guide.md` に `## 視覚証跡` セクションがあり「UI/UX変更なしのため Phase 11 スクリーンショット不要」を含む
- [ ] `system-spec-update-summary.md` に Step 1-A scope 境界テーブル（branch 内 / repo-wide / scope 外）が記載
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-D / Step 2 / same-wave sync 5 対象がすべて記載
- [ ] `documentation-changelog.md` にメタ 5 フィールド（変更者 / Issue / validator 結果 / current/baseline / artifacts 同期結果）がすべて埋まっている
- [ ] `documentation-changelog.md` に 5 ファイル変更内容が網羅
- [ ] `unassigned-task-detection.md` が 0 件でも summary 必須記録
- [ ] `skill-feedback-report.md` が両 skill 向けに記載（改善点なしでも明示）
- [ ] `phase12-task-spec-compliance-check.md` に Task 12-1〜12-5 + Step 1-A〜1-D + Step 2 + 4 点突合がすべて記録

### Step 1-A 必須（LOGS.md 2 ファイル更新 / P1 / P25 対策）

- [ ] `aiworkflow-requirements/LOGS.md` に **親タスク** 完了エントリ追加
- [ ] `task-specification-creator/LOGS.md` に **親タスク** 完了エントリ追加
- [ ] `aiworkflow-requirements/LOGS.md` に **本タスク自身** の完了エントリ追加（self-close）
- [ ] `task-specification-creator/LOGS.md` に **本タスク自身** の完了エントリ追加（self-close）

### Step 1-B / 1-C / 1-D 必須

- [ ] `task-workflow.md` 系（active / completed）に親タスク + 本タスクの完了記録が追加
- [ ] `lessons-learned-current-2026-04.md` に 3 知見が恒久ルール文言で追記
- [ ] 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` のフロントマター + Phase 12 行両方更新

### parity / 同期確認

- [ ] `artifacts.json` と `outputs/artifacts.json` の parity が drift 0
- [ ] `artifacts.json` / `outputs/artifacts.json` 両方に `taskType: "NON_VISUAL"` が存在
- [ ] `artifacts.json` の `phases.12.status=completed` と本ファイルの `status: completed` が同期
- [ ] `index.md`（本タスクの index.md）の Phase 12 行ステータスが `completed`

### 未来形語 / parity guard

- [ ] `outputs/phase-12/*.md` に未来形語（計画 / 予定 / TODO / 仕様策定のみ / 保留として記録）が 0 件
- [ ] `artifacts.json` / `outputs/artifacts.json` に Phase 13 先送り wording が残っていない（FB-UT-UIUX-001-B 対策）

### 自動化コマンド実行記録

- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` を 3 skill すべて実行し Error 0 件を確認
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001 --json` が PASS
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` で `currentViolations.total = 0`
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` で baseline 違反件数を別記録

### Phase 13 開始条件

- [ ] 本タスク Phase 12 が `completed`
- [ ] 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の `index.md` の Phase 12 が `completed`
- [ ] ユーザー承認の取得（Phase 13 は blocked。本タスク内では実施しない）

### 進捗チェック

- [ ] **本Phase内の全タスクを100%実行完了**

---

## NON_VISUAL 代替証跡方針【固定文言】

`implementation-guide.md` の `## 視覚証跡` セクションと `system-spec-update-summary.md` の Phase 11 参照欄に以下を固定化:

```
UI/UX変更なしのため Phase 11 スクリーンショット不要
```

代替証跡:

- `outputs/phase-10/final-review-result.md`（Phase 10 最終レビュー結果）
- `outputs/phase-11/manual-test-result.md`（5 つの grep スナップショット集約）

---

## 参照資料

| 資料                                                                                             | 用途                                                      |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/phase-template-phase12.md`                 | Phase 12 骨格テンプレート                                 |
| `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md`          | Phase 12 詳細テンプレート（Task 1〜6）                    |
| `.claude/skills/task-specification-creator/references/phase-12-guide.md`                         | Phase 12 完了条件チェックリスト                           |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`           | Task 12-1〜12-6 詳細手順                                  |
| `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`          | Phase 12 ハードゲートチェックリスト                       |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                   | Step 1-A〜1-G / Step 2 実行フロー                         |
| `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`              | implementation-guide.md フォーマット                      |
| `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`           | documentation-changelog.md フォーマット                   |
| `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md`      | phase12-task-spec-compliance-check.md フォーマット        |
| 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/phase-12-documentation.md`                      | NON_VISUAL code task の参照フォーマット                   |
| 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/system-spec-update-summary.md` | Step 1-A「未実施」記録の根拠（本タスク formalize の起点） |
| 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/unassigned-task-detection.md`  | 本タスク formalize の根拠                                 |

---

## 苦戦箇所セクション（Phase 12 完了時に記録）

> 本セクションは Phase 12 実施中に発見した苦戦箇所をリアルタイム記録する。
> 0 件の場合も「苦戦箇所なし」を明記する（lessons-learned 標準化のため）。

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題}}
- **原因**: {{根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連 Pitfall**: {{P1 / P25 等}}
```

---

## 次Phase

phase-13-pr-creation.md（**blocked** / 別エージェント担当）— ユーザー承認後に PR 作成。本タスク内では実施しない。

> 本タスク完了の必要条件:
>
> 1. 本ファイルの完了条件すべて `[x]`
> 2. 親タスク `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 が `completed`
> 3. ユーザー明示承認の取得（Phase 13 開始条件）
