# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                                             |
| ---------- | ---------------------------------------------- |
| Phase      | 3                                              |
| タスクID   | TASK-SC-CANCEL-LOGS-SYNC-001                   |
| タスク種別 | NON_VISUAL                                     |
| 前Phase    | [phase-2-design.md](phase-2-design.md)         |
| 次Phase    | phase-4-test-creation.md（別エージェント担当） |
| 作成日     | 2026-04-20                                     |

---

## 目的

Phase 2 の設計を **30思考法 + 4条件 + 既存エントリ形式整合性** で監査し、
Phase 4 以降に進む前の **gate 判定**（PASS / MINOR / MAJOR / CRITICAL）を確定する。
本タスクは docs-sync wave のため、レビューの主軸は「形式整合」「scope 境界の妥当性」
「親タスクとの依存整合」「NON_VISUAL 代替証跡の十分性」に置く。

---

## 実行タスク

| Task | 内容                                                     | 主成果物                                    |
| ---- | -------------------------------------------------------- | ------------------------------------------- |
| 1    | 30 思考法で Phase 2 設計の重複、漏れ、過剰規定を監査する | `outputs/phase-3/design-review-result.md`   |
| 2    | 既存エントリ形式へ落とし込めるかをファイル単位で確認する | `outputs/phase-3/format-alignment-check.md` |
| 3    | PASS / MINOR / MAJOR / CRITICAL の gate を確定する       | `outputs/phase-3/design-review-result.md`   |

- Task 1: 30 思考法で重複、漏れ、過剰規定を監査する
- Task 2: 既存エントリ形式との整合可能性を確認する
- Task 3: gate 判定を確定する

---

## レビュー観点（30思考法の適用方針）

| 系統         | 主な思考法                                                           | 本 task での使用目的                                                                  |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | 設計の追記方針が既存エントリ形式と矛盾していないか抽出                                |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | 5ファイル × 3 lane の責務分担に漏れ・重複がないか確認                                 |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | 「branch 内 / repo-wide」の 2 軸境界が wave 設計の構造的正答か検証                    |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | NON_VISUAL 代替証跡（grep スナップショット）が PR レビュー時に説得力を持つか検証      |
| システム系   | システム思考、因果関係分析、因果ループ                               | 親 index.md の Phase 12 完了宣言が本タスク Phase 13 と循環依存を生まないか確認        |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | `topic-map.md` 等の不要再生成を避ける最小変更原則が価値とコストのバランスに適合するか |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 「なぜこの追記方針か」を既存最新エントリの形式から逆算で説明できるか                  |

---

## 4条件チェック

| 条件         | 判定基準                                                                                                              | 期待判定 |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | -------- |
| 矛盾なし     | Phase 2 設計の追記方針が Phase 1 受入基準（AC-1〜AC-5）と矛盾していない                                               | PASS     |
| 漏れなし     | 5ファイル + lessons-learned 反映先候補 + 親 index.md 更新箇所がすべて Phase 2 設計でカバーされている                  | PASS     |
| 整合性あり   | Lane A/B/C の責務境界、Phase 4 以降への引き継ぎ、NON_VISUAL 代替証跡の TC-ID 対応が一貫している                       | PASS     |
| 依存関係整合 | Phase 1→2→3 の流れと、Lane A/B 並列 → Lane C 直列、Phase 11→12 の代替証跡参照、本タスクと親タスクの責務境界が整合する | PASS     |

> **all PASS** が Phase 4 進行の前提。1 件でも FAIL があれば該当 Phase（多くは Phase 2、ものによっては Phase 1）へ差し戻す。

---

## 既存エントリ形式整合性チェック【必須】

本タスク特有のチェック観点。Phase 2 設計の追記方針が、各ファイルの既存エントリ形式と整合しているかを Phase 4 fixture 作成前に **設計レベル** で確認する。

| File                                                                           | 既存形式（想定）                                                       | Phase 2 設計の整合性チェック観点                                                             |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `task-specification-creator/LOGS.md`                                           | 「コンテキスト・成果・結果」3節 + Markdown 見出し                      | 追記内容（タスクID / Phase 1〜12 完了 / 苦戦 / 結果）が3節構成にマップできるか               |
| `aiworkflow-requirements/LOGS.md`                                              | 表形式（タスクID / 操作 / 対象ファイル / 結果 / 備考）                 | 追記内容が表の列構成にマップできるか。`操作 close-out-wave-sync` の語が既存と整合するか      |
| `task-workflow.md` / `task-workflow-active.md` / `task-workflow-completed*.md` | active/completed 分割構成 + 各タスクのエントリ                         | 親タスクが active から completed への移動か、completed への新規追加かを Phase 5 開始時に判断 |
| `lessons-learned-current-2026-04.md`                                           | h3 タイトル + 背景/学び/適用箇所のセクション（複数バリエーションあり） | 3知見が既存エントリの h3 階層と命名規則に整合するか                                          |
| 親タスク `index.md`                                                            | フロントマター + Phase 一覧テーブル                                    | フロントマター更新と Phase 一覧テーブル更新の **両方** を行う設計か                          |

> Phase 4 で各ファイルの **実際の最新エントリ** を `format-fixture-snapshots.md` に貼り付け、Phase 5 で fixture 完全模倣で追記する。Phase 3 では「設計が形式整合可能か」を判断する段階。

---

## simpler alternative の検討

| 代替案                                                                 | 採否   | 理由                                                                                                               |
| ---------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| 親タスクの Phase 12 で repo-wide sync まで強制完了させる               | 不採用 | branch 内の wave と repo-wide の wave を分離することが scope 境界明確化のメリットを生む（Issue #2313 の本質）      |
| 5ファイルを 1 commit で一括追記（Lane 分けない）                       | 不採用 | Lane 分離により Phase 6 の形式整合性チェックが lane 単位で並列実施可能になる。一括化は形式逸脱検知の解像度を下げる |
| `topic-map.md` / `keywords.json` も併せて再生成する                    | 不採用 | ファイル内容変更がない場合は最小変更原則に従い再生成しない（Issue #2313 で明記）                                   |
| lessons-learned を新規ファイル（lessons-learned-cancel-sync.md）に作成 | 不採用 | 同月の `lessons-learned-current-2026-04.md` に追記する方が canonical spec の集約性を保てる                         |
| 親 `index.md` の更新を本タスクではなく親タスク内で再実施               | 不採用 | 親タスクは `in_progress` のまま停滞しており、本タスクが完了宣言の責務を引き受けることが scope 境界の必要条件       |

---

## Gate 判定

| 判定     | 条件                                                                                                                        | 次のアクション             |
| -------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| PASS     | 4条件 all PASS + 既存形式整合性チェック all PASS + simpler alternative 検討記録あり + NON_VISUAL 代替証跡方針が説得力を持つ | Phase 4 へ進む             |
| MINOR    | 文言修正のみ残る（例: 検証コマンドの grep パターン微調整）                                                                  | 指摘修正後 Phase 4 へ      |
| MAJOR    | 追記方針が既存形式と整合しない / Lane 分離が機能しない / NON_VISUAL 代替証跡が不十分                                        | Phase 2 へ戻す             |
| CRITICAL | scope 境界（branch 内 / repo-wide）の前提が崩れる / 親タスクとの責務境界に矛盾 / Issue #2313 の「未実施」6項目に対応漏れ    | Phase 1 へ戻しユーザー確認 |

### 戻り先決定基準

| 問題の種類                                      | 戻り先              |
| ----------------------------------------------- | ------------------- |
| scope 境界・受入基準の問題                      | Phase 1（要件定義） |
| 追記方針・Lane 構成・NON_VISUAL 代替証跡の問題  | Phase 2（設計）     |
| Issue #2313 「未実施」6項目との対応関係が不明確 | Phase 1（要件定義） |
| 親タスクとの責務境界・依存関係の矛盾            | Phase 1（要件定義） |

---

## MINOR 追跡テーブル（gate-decision.md 用テンプレート）

Phase 3 で MINOR 判定された指摘は以下のテーブルで追跡計画を明示する。

| MINOR ID         | 指摘内容                            | 解決予定Phase | 解決確認Phase | 備考               |
| ---------------- | ----------------------------------- | ------------- | ------------- | ------------------ |
| (例) FORMAT-M-01 | grep パターンに `\|` エスケープ漏れ | Phase 4       | Phase 9       | TC-04 検証コマンド |

> 本セクションはレビュー実施時に埋める。設計時点では空テーブル。

---

## レビュー実施チェックリスト

### 形式整合系

- [ ] Phase 2 設計の各ファイル追記方針が、各ファイルの既存最新エントリ形式と整合可能か
- [ ] 表形式 / 3節形式 / 階層構造の混同がないか
- [ ] 日付フォーマットが `2026-04-20` で統一されているか

### scope 系

- [ ] Phase 1 で確定した scope 境界（branch 内 / repo-wide）が Phase 2 で保持されているか
- [ ] scope 外項目（コード変更 / Issue #2229 再実装 / 親タスク Phase 13 PR）が Phase 2 設計に紛れ込んでいないか
- [ ] 最小変更原則（`topic-map.md` 等の不要再生成回避）が明記されているか

### 親タスク連携系

- [ ] 親タスク `index.md` の Phase 12 完了宣言の責務が本タスク Phase 5 (Lane C) に集約されているか
- [ ] 親タスク Phase 12 の `system-spec-update-summary.md` / `unassigned-task-detection.md` が参照根拠として明示されているか
- [ ] 本タスクと親タスク間で循環依存（双方が双方の完了を待つ状態）が発生しないか

### NON_VISUAL 代替証跡系

- [ ] Phase 11 で grep 出力スナップショットを `outputs/phase-11/manual-test-result.md` に貼り付ける方針が明記されているか
- [ ] TC-01〜TC-05 の 5 検証コマンドが Issue #2313「未実施」6項目をカバーしているか（5コマンド + 親 index.md 更新確認 = 6項目相当）
- [ ] placeholder-only の証跡を PASS にしないルールが Phase 2 設計に含まれているか

### Phase 12 self-close-out 系

- [ ] 本タスク自身の Phase 12 で両 LOGS.md に本タスク完了記録を追記する方針が定義されているか
- [ ] mandatory 5 tasks（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report）が Canonical Artifacts に含まれているか
- [ ] `phase12-task-spec-compliance-check.md` が Canonical Artifacts に含まれているか

---

## 統合テスト連携

| 後続 Phase | 引き渡し内容                                | 判定条件                     |
| ---------- | ------------------------------------------- | ---------------------------- |
| 4          | fixture 取得対象、TC マトリクス、戻り先基準 | Phase 4 が検証定義に迷わない |
| 5          | 形式逸脱時の差し戻し条件                    | 誤配置・誤形式の追記を防ぐ   |
| 11         | 一次ソースとする証跡の最小単位              | 証跡の水増し防止             |

---

## Phase 4 開始条件 / Phase 13 blocked 条件

### Phase 4 開始条件

- [ ] Phase 3 Gate 判定が PASS または MINOR（修正完了済）
- [ ] レビュー実施チェックリストが all PASS
- [ ] simpler alternative の検討結果が記録されている

### Phase 13 blocked 条件（本タスク内では実施しない）

- ユーザー承認があるまで blocked
- 本タスクの Phase 12 が `completed` になり、親タスク `index.md` の Phase 12 も `completed` になっていることが Phase 13 開始の必要条件
- 上記の必要条件が揃った後、ユーザーから明示的な PR 作成承認を待つ

---

## 参照資料

| 資料                                                                           | 用途                               |
| ------------------------------------------------------------------------------ | ---------------------------------- |
| [phase-2-design.md](phase-2-design.md)                                         | 監査対象の設計原本                 |
| [phase-1-requirements.md](phase-1-requirements.md)                             | AC、scope 境界、対象ファイルの入力 |
| `.claude/skills/task-specification-creator/SKILL.md`                           | Progressive Disclosure / SRP 基準  |
| `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | gate 判定の基準                    |

---

## 成果物

| 成果物                 | パス                                        | 内容                                                                    |
| ---------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| design review result   | `outputs/phase-3/design-review-result.md`   | 4条件 + 30思考法 + Gate 判定の記録                                      |
| format alignment check | `outputs/phase-3/format-alignment-check.md` | 5ファイルの既存形式整合性チェック結果（簡易版・Phase 4 fixture の前段） |

---

## 完了条件

- [ ] 4条件チェックの判定が記録されている（all PASS が期待）
- [ ] 既存エントリ形式整合性チェックが 5 ファイル分実施されている
- [ ] simpler alternative の検討結果が表形式で記録されている
- [ ] Gate 判定（PASS / MINOR / MAJOR / CRITICAL）と次アクションが確定している
- [ ] 戻り先決定基準が明示されている
- [ ] レビュー実施チェックリスト（形式 / scope / 親タスク連携 / NON_VISUAL / Phase 12 self-close-out）が完了している
- [ ] Phase 4 開始条件が満たされている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次Phase

phase-4-test-creation.md（別エージェント担当）— 既存最新エントリの fixture 化と grep 検証コマンドの定義
