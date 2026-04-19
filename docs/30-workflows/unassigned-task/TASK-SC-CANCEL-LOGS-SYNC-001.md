# キャンセルクリーンアップ仕様書 repo-wide LOGS/lessons-learned同期 - タスク指示書

## メタ情報

```yaml
issue_number: 2313
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
task_name: キャンセルクリーンアップ仕様書 repo-wide LOGS/lessons-learned同期
category: ドキュメント整備
target_feature: task-specification-creator / aiworkflow-requirements
priority: 高
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-04-19
```

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-SC-CANCEL-LOGS-SYNC-001                                      |
| タスク名     | キャンセルクリーンアップ仕様書 repo-wide LOGS/lessons-learned同期 |
| 分類         | ドキュメント整備                                                  |
| 対象機能     | task-specification-creator / aiworkflow-requirements スキル管理   |
| 優先度       | 高                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | Phase 12 / TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001                 |
| 発見日       | 2026-04-19                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 12 において、ブランチ内の mandatory 5 tasks（実装ガイド・system-spec-update-summary・documentation-changelog・unassigned-task-detection・skill-feedback-report）は全て完了した。しかし Phase 12 ステータスが `in_progress` のまま留まっている。

その主因は、Phase 12 で実施すべき repo-wide 同期のうち以下が未着手であったためである:

1. `.claude/skills/task-specification-creator/LOGS.md` への今回の review wave 記録追記
2. `.claude/skills/aiworkflow-requirements/LOGS.md` への今回の review wave 記録追記
3. lessons-learned の canonical skill/system spec 側への同期（`task-workflow.md` 更新・苦戦箇所反映）
4. `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 ステータスを `completed` へ更新する最終完了宣言

これらは `outputs/phase-12/system-spec-update-summary.md` の Step 1-A テーブルにも「未実施 / repo-wide same-wave sync は本 review wave のスコープ外」として明示的に記録されており、次 wave への持ち越しとして formalize する必要がある。

### 1.2 問題点・課題

**問題1: LOGS.md への wave 記録が欠落している**

`task-specification-creator/LOGS.md` および `aiworkflow-requirements/LOGS.md` はいずれも、`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の実施記録が存在しない。これらのログファイルはスキルの実績追跡と将来の改善判断に使われるため、欠落したままでは過去の wave に学んだ知見が参照できない。

**問題2: lessons-learned が canonical spec 側に反映されていない**

今回の wave では以下の知見が得られた:

- `NON_VISUAL code task` の代替証跡方針（Phase 11: `manual-test-result.md` を一次ソースにする）の確立
- scope 内/外の境界明確化が各 wave の進捗感を維持する鍵であるという発見
- branch 内 docs と repo-wide skill/system spec の同期対象が不明確だったことによる進捗停滞

これらの知見は `aiworkflow-requirements/references/lessons-learned.md` や `task-workflow.md` に反映されるべきだが、未着手のままである。

**問題3: タスクの完了宣言が実行されていない**

`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の `index.md` で Phase 12 のステータスが `in_progress` のままである。LOGS / lessons-learned の同期完了を確認した後、Phase 12 を `completed` に更新し、タスク全体の完了を宣言する必要がある。

### 1.3 放置した場合の影響

- `task-specification-creator` / `aiworkflow-requirements` の LOGS ファイルに欠落が生じ、将来の改善判断やトラブルシューティングで参照できなくなる
- `NON_VISUAL code task` 代替証跡方針や scope 明確化の知見が次の担当者に伝わらず、同じ苦戦箇所を繰り返す
- `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` が永遠に `in_progress` のまま残り、タスク台帳の信頼性が低下する
- Phase 12 ゲート（「mandatory 5 tasks 完了、artifacts.json parity 完了」が条件）を正式に通過できないため、Phase 13 PR 作成の承認フローが開始できない

---

## 2. 何を達成するか（What）

### 2.1 目的

`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 12 で積み残した repo-wide 同期を完了させ、両スキル（`task-specification-creator` / `aiworkflow-requirements`）の LOGS ファイルと canonical spec（lessons-learned・task-workflow）を最新状態に更新する。これにより `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 12 を正式に `completed` とする。

### 2.2 最終ゴール

1. `.claude/skills/task-specification-creator/LOGS.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の wave 記録が追記されていること
2. `.claude/skills/aiworkflow-requirements/LOGS.md` に同様の wave 記録が追記されていること
3. `aiworkflow-requirements` の canonical spec（`lessons-learned` または `task-workflow.md`）に今回の苦戦箇所と知見が反映されていること
4. `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 ステータスが `completed` に更新され、タスク全体の完了宣言が行われていること

### 2.3 スコープ

**含むもの**:

- `.claude/skills/task-specification-creator/LOGS.md` への wave 記録追記
- `.claude/skills/aiworkflow-requirements/LOGS.md` への wave 記録追記
- `aiworkflow-requirements` の `lessons-learned` 系ファイルへの苦戦箇所反映
- `aiworkflow-requirements/references/task-workflow.md` の `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` エントリ更新（完了記録追加）
- `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 ステータス `completed` 化と最終完了宣言

**含まないもの**:

- コードへの変更（`SkillCreatorService.ts` 等の実装ファイル）
- GitHub Issue #2229 の再実装や追加コード変更
- Phase 13 PR 作成（ユーザー承認待ちのまま維持）
- 他スキルや他タスクの LOGS 更新（スコープ外）
- `aiworkflow-requirements` の `topic-map.md` / `keywords.json` の再生成（ファイル内容変更が発生しない場合は不要）

### 2.4 成果物

| 成果物                                                              | 種別 | 内容                            |
| ------------------------------------------------------------------- | ---- | ------------------------------- |
| `.claude/skills/task-specification-creator/LOGS.md`                 | 更新 | wave 記録追記（1エントリ）      |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                    | 更新 | wave 記録追記（1エントリ）      |
| `aiworkflow-requirements` の lessons-learned 系ファイル             | 更新 | 苦戦箇所と知見の反映            |
| `aiworkflow-requirements/references/task-workflow.md`               | 更新 | タスク完了記録の追加            |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` | 更新 | Phase 12 `completed` / 完了宣言 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 1〜11 がすべて `completed` であること
- `outputs/phase-12/` 以下の mandatory 5 成果物（`implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md`）が存在すること
- `outputs/phase-11/manual-test-result.md` が存在すること
- `aiworkflow-requirements` のスキル構成（`SKILL.md` / `LOGS.md` / `references/` 以下）を一読していること
- `task-specification-creator/LOGS.md` の既存エントリ形式を把握していること

### 3.2 依存タスク

| タスクID                               | 関係     | 理由                                                                  |
| -------------------------------------- | -------- | --------------------------------------------------------------------- |
| TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 | 親タスク | 本タスクは同タスクの Phase 12 repo-wide 同期の積み残し対応            |
| TASK-SW-CANCEL-SKILL-CLEANUP           | 参照のみ | 本タスクで言及する技術負債（`existedBefore=true` ロールバック）の出所 |

### 3.3 必要な知識

- `task-specification-creator/LOGS.md` の既存エントリ形式（コンテキスト・成果・結果の3節構成）
- `aiworkflow-requirements/LOGS.md` の既存エントリ形式（表形式）
- `aiworkflow-requirements/references/task-workflow.md` への完了記録追記方式
- `aiworkflow-requirements/references/lessons-learned.md`（または同等ファイル）の記述方式
- `NON_VISUAL code task` の定義と代替証跡方針（Phase 11 一次ソース方式）

### 3.4 推奨アプローチ

**読み取り先行**: 各 LOGS ファイル・canonical spec ファイルを一読し、追記先の現在の末尾と形式を把握してから書き込む。

**エントリ形式の統一**: 既存の最新エントリと形式を揃える。独自形式で書かない。

**最小変更原則**: `topic-map.md` / `keywords.json` はファイル内容変更が発生する場合のみ再生成する。本タスクはログ追記のみのため、原則として再生成は不要。

**完了宣言は最後**: `index.md` の Phase 12 `completed` 更新は LOGS / lessons-learned 更新完了後に実施する。

---

## 4. 実行手順（Phase構成）

### Phase 1: 現状確認

**目的**: 各 LOGS ファイルと canonical spec の現在の記録状態を確認し、追記すべき内容を特定する。

**手順**:

1. `.claude/skills/task-specification-creator/LOGS.md` を読み、最新エントリの日付・形式・`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の記録有無を確認する
2. `.claude/skills/aiworkflow-requirements/LOGS.md` を読み、同様に確認する
3. `aiworkflow-requirements/references/task-workflow.md` を読み、`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` のエントリ状態を確認する
4. `aiworkflow-requirements` 内の lessons-learned 系ファイルのパスと存在を確認する
5. `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 ステータスを確認する
6. `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/system-spec-update-summary.md` の「未実施」項目を再確認する

**成果物**: 追記要否の確認メモ（インラインコメントで可）

**完了条件**: 6点すべての現状が把握されていること

---

### Phase 2: task-specification-creator/LOGS.md への追記

**目的**: `task-specification-creator/LOGS.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の wave 記録を追記する。

**手順**:

1. Phase 1 で確認した既存エントリ形式（コンテキスト・成果・結果の3節）に合わせてエントリを作成する
2. 追記内容の要点:
   - タスクID: `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001`
   - タスク名: キャンセル後の半作成スキルディレクトリ残存クリーンアップ（仕様書再構成）
   - Phase: 1〜12（13 は user 承認待ち blocked）
   - 成果: 既存コードに合わせた「差分確認 + 回帰確認型」仕様書への再構成・mandatory 5 成果物作成・artifacts.json parity 確立
   - 特記: `NON_VISUAL code task` としての代替証跡方針確立（Phase 11 `manual-test-result.md` を一次ソース化）
   - 苦戦: branch 内 docs と repo-wide skill/system spec の同期対象が不明確だったことによる Phase 12 in_progress 長期化
   - 結果: branch 内は success / repo-wide sync は本タスク（TASK-SC-CANCEL-LOGS-SYNC-001）へ移譲
3. `.claude/skills/task-specification-creator/LOGS.md` にエントリを追記する

**成果物**: `.claude/skills/task-specification-creator/LOGS.md`（追記後）

**完了条件**: `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の wave 記録エントリが追記されていること

---

### Phase 3: aiworkflow-requirements 側の更新

**目的**: `aiworkflow-requirements/LOGS.md`・`task-workflow.md`・lessons-learned 系ファイルに必要な記録と知見を反映する。

**手順**:

1. **LOGS.md への追記**: `aiworkflow-requirements/LOGS.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の close-out 記録を追記する
   - 表形式（タスクID / 操作 / 対象ファイル / 結果 / 備考）に従う
   - 操作: `close-out-wave-sync`
   - 対象ファイル: `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` / 両 LOGS.md
   - 備考: branch 内作業完了済み / repo-wide sync を本タスクで完了

2. **task-workflow.md の更新**: `aiworkflow-requirements/references/task-workflow.md` を読み、`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` のエントリに完了記録を追記する（ステータス更新・Phase 12 完了日記録）

3. **lessons-learned への反映**: lessons-learned 系ファイル（`references/lessons-learned.md` または同等ファイル）に以下の知見を追記する:
   - `NON_VISUAL code task` の代替証跡方針: Phase 11 `manual-test-result.md` を一次ソースとする方式を確立
   - scope 内/外の境界明確化: Phase 12 で実施する「branch 内 docs 更新」と「repo-wide LOGS/ledger 同期」を区別することが wave の進捗感を維持する鍵
   - repo-wide sync の持ち越し管理: 同 wave 内で完了できない repo-wide sync は unassigned task として formalize することで次 wave への確実な引き継ぎが可能

**成果物**:

- `.claude/skills/aiworkflow-requirements/LOGS.md`（追記後）
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（更新後）
- lessons-learned 系ファイル（更新後）

**完了条件**: 3ファイルすべての更新が完了していること

---

### Phase 4: Phase 12 完了宣言（TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 の index.md 更新）

**目的**: Phase 2・Phase 3 の repo-wide 同期完了を受けて、`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 12 ステータスを `completed` に更新し、タスク全体の完了を宣言する。

**手順**:

1. `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` を読む
2. Phase 一覧テーブルの Phase 12 ステータスを `in_progress` → `completed` に更新する
3. フロントマターの `status` フィールドを `in_progress` → `completed`（または `pending_pr`）に更新する
4. `current_phase` フィールドを `12` → `13` に更新する（Phase 13 は user 承認待ち blocked のまま）
5. 必要であれば、完了日を記録するフィールドを追加する

**成果物**: `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`（更新後）

**完了条件**: Phase 12 が `completed`、Phase 13 が `pending` / `blocked`、全体ステータスが適切に更新されていること

---

### Phase 5〜9: 設計・実装・品質保証フェーズ（本タスクでは軽量実施）

**本タスクはドキュメント追記のみであるため、Phase 5〜9 は以下の軽量版で実施する。**

**Phase 5（実装）**: Phase 2〜4 の手順が Phase 5 に相当する。Phase 4 完了時点で Phase 5 は完了とみなす。

**Phase 6（テスト拡充）**:

- 追記した LOGS エントリの形式が既存エントリと整合しているかを目視確認する
- lessons-learned の追記内容が具体的かつ再利用可能な記述になっているかを確認する

**Phase 7（カバレッジ確認）**:

- Phase 1 で確認した「未実施」6項目がすべて対応済みになっているかをチェックリストで確認する

**Phase 8（リファクタリング）**:

- 追記内容の重複や冗長な表現を削除する
- エントリ日付が正確（2026-04-19）であることを確認する

**Phase 9（品質保証）**:

- 追記した全ファイルの Markdown 構文が壊れていないことを確認する
- LOGS エントリが最新日付順（降順）または追記順（末尾追記）の既存ルールに従っていることを確認する

---

### Phase 10: 最終レビュー

**目的**: 本タスクの完了条件をすべて確認する。

**手順**:

1. `task-specification-creator/LOGS.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` のエントリが追記されていることを確認する
2. `aiworkflow-requirements/LOGS.md` に同様のエントリが追記されていることを確認する
3. `task-workflow.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の完了記録が追記されていることを確認する
4. lessons-learned 系ファイルに3つの知見（NON_VISUAL 代替証跡・scope 境界・repo-wide sync 持ち越し管理）が追記されていることを確認する
5. `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 が `completed` になっていることを確認する
6. 上記5点がすべて PASS の場合、最終レビュー PASS とする。FAIL があれば該当 Phase に差し戻す

**成果物**: 最終レビュー結果メモ（インラインコメントで可）

**完了条件**: 5点すべての確認が PASS

---

### Phase 11: 手動確認

**目的**: `NON_VISUAL code task` として、ファイルの存在と内容を確認する代替証跡を記録する。

**手順**:

以下のコマンドを実行し、各ファイルが存在することを確認する:

```bash
# task-specification-creator LOGS 確認
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/task-specification-creator/LOGS.md

# aiworkflow-requirements LOGS 確認
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/aiworkflow-requirements/LOGS.md

# task-workflow.md 確認
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md

# lessons-learned 確認
grep -n "NON_VISUAL\|scope.*外\|repo-wide sync" \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md

# index.md の Phase 12 ステータス確認
grep -n "phase.*12\|completed\|in_progress" \
  docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md
```

各コマンドに結果（行番号・マッチ内容）が表示されることを以て手動確認の証跡とする。

**成果物**: 手動確認結果（コマンド出力スナップショット。本タスクの `outputs/phase-11/` に記録することが望ましい）

**完了条件**: 全5コマンドにマッチ結果が存在すること

---

### Phase 12: ドキュメント更新

**目的**: 本タスク自身の Phase 12 クローズアウトを行う。

**手順**:

1. 本仕様書（`TASK-SC-CANCEL-LOGS-SYNC-001.md`）の「ステータス」を「未実施」→「実施済み」に更新する
2. 本タスクの `task-specification-creator/LOGS.md` エントリに完了記録を追記する（本タスク自身の記録）
3. `aiworkflow-requirements/references/task-workflow.md` に本タスク `TASK-SC-CANCEL-LOGS-SYNC-001` の完了記録を追加する

**成果物**: 本仕様書（更新後）

**完了条件**: ステータスが「実施済み」に更新されていること

---

### Phase 13: PR作成（ユーザー承認後）

**目的**: ユーザーの明示的承認を得た後に、変更を PR として提出する。

**手順**（ユーザー承認後に実施）:

```bash
# ブランチ作成
git checkout -b docs/task-sc-cancel-logs-sync-001

# 変更ファイルの確認
git status

# コミット
git commit -m "docs(skill-logs): TASK-SC-CANCEL-LOGS-SYNC-001 repo-wide LOGS/lessons-learned同期・CANCEL-CLEANUP Phase 12完了宣言"

# push
git push -u origin docs/task-sc-cancel-logs-sync-001

# PR 作成
gh pr create \
  --title "docs(skill-logs): TASK-SC-CANCEL-LOGS-SYNC-001 repo-wide LOGS/lessons-learned同期" \
  --body "..."
```

**完了条件**: ユーザーの承認があるまで blocked。Phase 13 は実施しない。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.claude/skills/task-specification-creator/LOGS.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の wave 記録エントリが追記されている
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の close-out 記録エントリが追記されている
- [ ] `aiworkflow-requirements/references/task-workflow.md` に `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の完了記録が追記されている
- [ ] lessons-learned 系ファイルに `NON_VISUAL code task` 代替証跡方針・scope 境界明確化・repo-wide sync 持ち越し管理の3知見が反映されている
- [ ] `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` の Phase 12 ステータスが `completed` に更新されている
- [ ] `index.md` のフロントマター `status` / `current_phase` が適切に更新されている

### 品質要件

- [ ] 追記した LOGS エントリの形式が各ファイルの既存エントリと整合している
- [ ] lessons-learned の追記内容が具体的・再利用可能な記述になっている
- [ ] 追記した全ファイルの Markdown 構文が壊れていない
- [ ] エントリ日付が正確（2026-04-19）である
- [ ] Phase 11 の手動確認コマンドが全件マッチしている

### ドキュメント要件

- [ ] 本タスク仕様書（`TASK-SC-CANCEL-LOGS-SYNC-001.md`）のステータスが「実施済み」に更新されている

---

## 6. 検証方法

### 確認コマンド

```bash
# task-specification-creator LOGS のエントリ確認
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/task-specification-creator/LOGS.md

# aiworkflow-requirements LOGS のエントリ確認
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/aiworkflow-requirements/LOGS.md

# task-workflow.md の完了記録確認
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md

# lessons-learned の知見追記確認
grep -n "NON_VISUAL\|scope.*外\|repo-wide sync" \
  .claude/skills/aiworkflow-requirements/references/lessons-learned.md

# index.md の Phase 12 完了確認
grep -A2 "Phase 12\|phase.*12" \
  docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md
```

### 確認観点

| 確認ID | 対象                                              | 期待結果                                                        |
| ------ | ------------------------------------------------- | --------------------------------------------------------------- |
| LC-01  | `task-specification-creator/LOGS.md`              | `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の行が存在する         |
| LC-02  | `aiworkflow-requirements/LOGS.md`                 | `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の行が存在する         |
| LC-03  | `task-workflow.md`                                | `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の完了記録行が存在する |
| LC-04  | `lessons-learned.md`（または同等ファイル）        | `NON_VISUAL` または `scope` 関連の新規追記行が存在する          |
| LC-05  | `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` | Phase 12 が `completed`、全体 `status` が適切に更新されている   |

---

## 7. リスクと対策

| リスク                                                          | 影響度 | 発生確率 | 対策                                                                                       |
| --------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------ |
| lessons-learned 系ファイルのパスが不明確で追記先を誤る          | 中     | 中       | Phase 1 で `aiworkflow-requirements/` 以下のファイル一覧を確認してから追記先を決定する     |
| LOGS エントリの形式を既存エントリと揃えられず、可読性が低下する | 低     | 低       | 追記前に既存の最新エントリを一読し、形式を完全に模倣する                                   |
| `index.md` の `status` / `current_phase` 更新を見落とす         | 中     | 低       | Phase 4 の完了条件チェックリストで明示的に確認する                                         |
| 本タスク自身の LOGS 記録（Phase 12）を忘れる                    | 低     | 低       | Phase 12 の手順 2 に「本タスク自身の記録」を明示する                                       |
| `topic-map.md` / `keywords.json` の再生成が不必要に実施される   | 低     | 低       | スコープに「最小変更原則」を明記し、ファイル内容変更がない場合は再生成しないことを徹底する |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                                          | パス                                                                                                      | 説明                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 index.md | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                                       | 親タスクのインデックス。Phase 12 の更新対象                             |
| system-spec-update-summary                      | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/system-spec-update-summary.md` | Phase 12 で「未実施」と記録した repo-wide sync の一覧                   |
| unassigned-task-detection                       | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/unassigned-task-detection.md`  | 「repo-wide LOGS/ledger same-wave sync」を follow-up として記録した文書 |
| skill-feedback-report                           | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/outputs/phase-12/skill-feedback-report.md`      | 両スキルへのフィードバック記録                                          |
| TASK-SW-CANCEL-SKILL-CLEANUP                    | `docs/30-workflows/unassigned-task/TASK-SW-CANCEL-SKILL-CLEANUP.md`                                       | 技術負債（existedBefore=true ロールバック）の出所タスク                 |

### 関連ファイル（更新対象）

| ファイル                                                                             | 変更種別 | 内容                                          |
| ------------------------------------------------------------------------------------ | -------- | --------------------------------------------- |
| `.claude/skills/task-specification-creator/LOGS.md`                                  | 追記     | wave 記録エントリ追記                         |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                     | 追記     | close-out 記録エントリ追記                    |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | 追記     | タスク完了記録追加                            |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`（または同等） | 追記     | 苦戦箇所・知見の反映                          |
| `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                  | 更新     | Phase 12 `completed` / 全体ステータス完了宣言 |

---

## 9. 備考

### 苦戦箇所【記入必須】

| 苦戦箇所                                                         | 症状                                                                                                                                                                        | 原因                                                                                                                                                                    | 対応                                                                                                                                                             | 再発防止                                                                                                                                                     |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| branch 内 docs と repo-wide skill/system spec の同期対象が不明確 | Phase 12 の mandatory 5 tasks を完了したにもかかわらず Phase 12 が `in_progress` のまま残り続けた。「あと何が必要か」が不明確になった                                       | Phase 12 の scope として「branch 内 docs 更新」と「repo-wide LOGS/ledger 同期」が区別されておらず、同一 wave で両方を完了しなければならないという前提が暗黙化されていた | `system-spec-update-summary.md` の Step 1-A テーブルに「未実施 / repo-wide は別 wave へ」と明記し、本タスク（TASK-SC-CANCEL-LOGS-SYNC-001）として formalize した | Phase 12 開始時点で「branch 内完結項目」と「repo-wide 同期項目」を分離し、後者は wave の開始前に unassigned task として登録しておく                          |
| NON_VISUAL code task の代替証跡方針が未確立だった                | Phase 11 でスクリーンショットが取れず、手動確認の一次ソースが何かが曖昧になった。Phase 12 の completion 判断に影響した                                                      | `NON_VISUAL code task` に対する代替証跡の標準フォーマットが `task-specification-creator` のテンプレートに明示されていなかった                                           | `outputs/phase-11/manual-test-result.md` を一次ソースとする方針を確立。`implementation-guide.md` に「視覚証跡」セクションを設けて明記した                        | `task-specification-creator/LOGS.md` と `references/phase-template-phase12-detail.md` に NON_VISUAL 代替証跡方針を標準ルールとして追記する（本タスクで実施） |
| 「scope 内/外の明確化」が各 wave の進捗感に与える影響の過小評価  | 「branch 内作業は終わっているのになぜ Phase 12 が終わらないのか」という進捗の停滞感が生じた。完了しているはずの項目が完了として扱われず、モチベーション・判断速度が低下した | Phase 12 の完了基準が「すべての同期が完了すること」と解釈されており、branch 内完結の成功と repo-wide 同期の未着手を分離して記録する仕組みがなかった                     | `system-spec-update-summary.md` の各行に「実施済み / 未実施（スコープ外）」を明示する2値判定を導入し、branch 内成功と repo-wide 持ち越しを視覚的に分離した       | Phase 12 テンプレートに「branch 内完結項目」と「repo-wide 同期項目」の2カラム構成を採用し、進捗を分離して管理できるようにする                                |

### 発見経緯

`TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` の Phase 12 を実施した際、`outputs/phase-12/system-spec-update-summary.md` の Step 1-A テーブルに「LOGS.md x 2 の更新: 未実施 / repo-wide same-wave sync は本 review wave のスコープ外」と記録された。また `outputs/phase-12/unassigned-task-detection.md` の「既存 follow-up」欄に「repo-wide LOGS/ledger same-wave sync: canonical skill/system spec 側の follow-up として扱う」と記載された。これらを根拠として本タスクを 2026-04-19 に formalize した。
