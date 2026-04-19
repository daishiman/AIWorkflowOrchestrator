# Skill Feedback Report

> TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 Task 5 成果物。
> 本タスク（NON_VISUAL / 監査タスク / docs-only）の全 Phase 実行を通じて使用したスキルに対するフィードバックを記録する。
> 報告のみ。スキル本体（`.claude/skills/*/`）は本 Phase では変更しない。

---

## メタ情報

| 項目                | 内容                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| task_id             | TASK-EVALS-CONSUMER-AUDIT-001                                                                                                     |
| phase_id            | 12                                                                                                                                |
| task                | Task 12-5（skill-feedback-report）                                                                                                |
| 生成日時            | 2026-04-19                                                                                                                        |
| taskType            | NON_VISUAL / 監査タスク / docs-only                                                                                               |
| implementation_mode | verify_existing                                                                                                                   |
| 対象スキル          | `task-specification-creator` / `aiworkflow-requirements` / `github-issue-manager`                                                 |
| 参考対象            | `skill-fixture-runner`（consumer 対象として評価のみ。本タスクでは使用せず）                                                       |
| 対応 AC             | AC-7（未タスク記録）を補完 / AC-6 解除運用の将来再発防止                                                                          |
| 備考                | Phase 3 設計書 §1 冒頭「Phase 11 は再現コマンド手動実行、Phase 4-6 は検索・整理・差分抽出」への再解釈が必要だった事実を根拠に記録 |

---

## 1. 評価対象スキル一覧

| #   | スキル名                     | 適用範囲                               | 使用 Phase                                                         | 本タスクでの役割                             |
| --- | ---------------------------- | -------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| 1   | `task-specification-creator` | Phase 1〜12 の仕様書雛形・契約・ゲート | Phase 1〜12 全て                                                   | NON_VISUAL 監査タスクの Phase 構造を規定     |
| 2   | `aiworkflow-requirements`    | `references/` 配下の正本仕様の参照     | Phase 9（突合）                                                    | EVALS 関連記述と監査成果物の整合性検証の入力 |
| 3   | `github-issue-manager`       | Issue #2279 の状態確認・台帳整合       | Phase 1（issue_status 記載）／Phase 12（close-out 台帳整合の参照） | CLOSED 維持のまま仕様書作成する運用の根拠    |

※ `skill-fixture-runner` は本監査の consumer として `evals-field-map.md` §3 / `consumer-audit-report.md` §3 に登場するが、本タスク実行中はスクリプトを直接実行していないため評価対象から除外する（将来の EVALS 構造バリデーション拡張時に再評価）。

---

## 2. 評価観点と表記

各スキルを以下の 4 観点で評価する。記号で要約し、Finding と改善提案を §3〜§5 に記載する。

| 観点         | 記号 | 説明                                                 |
| ------------ | ---- | ---------------------------------------------------- |
| 良かった点   | `+`  | このタスク実行でスキルがどう役立ったか（事実ベース） |
| 困難だった点 | `-`  | 仕様不明確・情報不足・抽象度の問題点（事実ベース）   |
| 改善提案     | `!`  | スキル本体への追加・修正提案（実施は別タスク）       |
| 適用度       | `★`  | このタスク（NON_VISUAL 監査 / docs-only）への適合度  |

適用度の基準:

| ★     | 意味                                                     |
| ----- | -------------------------------------------------------- |
| ★★★★★ | そのまま適用可能。再解釈ほぼ不要                         |
| ★★★★☆ | 大半はそのまま適用可能。一部に再解釈が必要               |
| ★★★☆☆ | 主要ポイントで再解釈が必要。テンプレと実態のギャップ複数 |
| ★★☆☆☆ | 再解釈なしでは適用困難                                   |
| ★☆☆☆☆ | 本タスク種別に不適合                                     |

---

## 3. スキル 1: `task-specification-creator`

### 3.1 スキル概要

- 役割: Phase 1〜13 のタスク仕様書雛形・契約・ゲート・並列判定を提供する。
- 本タスクでの依存度: **最重要**（Phase 1〜12 の全仕様書が本スキルの references/ テンプレに依拠）。
- 本タスクで参照した references/:
  - `phase-template-core.md`（Phase 構造基盤）
  - `phase-template-phase1.md`（Phase 1 要件定義）
  - `phase-template-phase8-10.md`（Phase 8-10）
  - `phase-template-phase11.md` / `phase-template-phase11-detail.md`（Phase 11 手動検証）
  - `phase-template-phase12.md` / `phase-template-phase12-detail.md`（Phase 12 close-out）
  - `phase-12-documentation-guide.md`（Task 12-1〜12-6 詳細）
  - `phase-11-12-guide.md`（Phase 11/12 通しガイド）

### 3.2 良かった点（`+`）

- `+` Phase 1〜12 の責務分離が明確で、Phase 3（設計）で `.claude/skills/task-specification-creator/references/phase-template-phase12.md` の「必須 6 成果物」をそのまま Phase 12 契約として流用できた。
- `+` `phase-12-documentation-guide.md` の Part 1（中学生レベル説明）/ Part 2（技術説明）の 2 部構成ルールが明快で、NON_VISUAL 監査タスクであっても Part 1 の例え話要件を形骸化せず実装できた。
- `+` `docs-only モードフラグ` が明示されており、`spec_created` を `completed` の代替として採用する判断を根拠付けられた（Phase 12 spec.md §メタ情報）。
- `+` `FB-04 ledger / lane / artifacts 三者同期チェック` が Task 12-2 必須要件として明記されており、Phase 12 `system-spec-update-summary.md` の粒度を事前固定できた。
- `+` `phase12-task-spec-compliance-check` が Task 12-1〜12-5 の集約先として最終直列で位置づけられており、Phase 12 の並列/直列判定が機械的に可能だった。
- `+` `self-improvement-cycle.md` に EVALS.json 構造の例示（`skillName` / `currentLevel` / `metrics.*` / `phaseMetrics.*` / `patterns.*`）が載っており、Phase 9 の正本突合（spec-alignment-report.md §5）で camelCase v2 系の「最小部分集合」を特定できた（監査成果物側の集合 A が正本側の集合 R を包含する構造を立証できた）。

### 3.3 困難だった点（`-`）

- `-` **テンプレートが実装タスク前提**: `phase-template-core.md` / `phase-template-phase8-10.md` は `RED/GREEN` / `カバレッジ` / `line budget` / `mirror parity` / `fail path` を前提としており、監査タスクの「検索・整理・差分抽出」への機械適用が困難だった。Phase 3 設計書 §1 冒頭で「テンプレートの機械適用ではなく、監査タスク特性に合わせて再解釈」と明示しなければ Phase 4-6 の責務が空転するリスクがあった。
- `-` **NON_VISUAL 監査タスク固有の Phase 11 仕様が曖昧**: `phase-template-phase11.md` は UI 変更時の screenshot 中心。`UI/UX変更なしのため Phase 11 スクリーンショット不要` を固定記載する指針は `phase-12-documentation-guide.md` の散在したメモで読み取るしかなく、手動検証が「再現コマンド実行 → 0 差分確認」に特化する監査タスクでの primary evidence 仕様（`manual-test-result.md` と `reproduction-verification.md` の棲み分け）が事前に与えられなかった。
- `-` **Phase 5/6/8 の canonical 4 成果物と Phase 12 の必須 6 成果物の区別が曖昧**: Phase 12 spec §1 の「canonical 4 成果物そのものを Phase 12 へコピーして増殖させるのではなく、Phase 5 / 6 / 8 の canonical 成果物を参照しながら、close-out 用の必須 6 成果物を生成する」注記は phase-template に明示がなく、タスク仕様書側で補強する必要があった（本タスクでは P12-R2 としてリスク記録済）。
- `-` **`docs-only` での `detect-unassigned` モードの位置づけ**: `unassigned-task-detection-guide.md` があるものの、監査タスク由来の未タスク（正本未記載フィールド・validator 不在等の「運用補強」候補）を `docs/30-workflows/unassigned-task/` と `docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` のどちらに記録すべきかの判断基準が `phase-template-phase12.md` §「未タスク配置先ディレクトリの明示（P38 再発防止）」にのみ散在し、判定まで時間を要した。
- `-` **Phase 10 の MINOR 追跡テーブル**の運用記述が Phase 10 / Phase 12 の両方にまたがり、MINOR 0 件の場合の扱い（本タスクは MINOR 0 件）が冗長になった。

### 3.4 改善提案（`!`）

- `!` **PROPOSAL-TSC-01（NON_VISUAL 監査タスク用テンプレ追加）**: `phase-template-phase4.md` / `phase-template-phase5.md` 相当の **監査タスク用の再解釈ガイド** を `phase-template-audit-task.md` として新設するか、既存 `phase-template-core.md` に `taskType: NON_VISUAL / 監査` ブランチを追加する。Phase 4（raw evidence 収集）/ Phase 5（consumer 整理 + field map）/ Phase 6（dual root 差分）/ Phase 7（漏れ再検索）の責務を「テスト作成／実装／テスト拡張」の代替として明示する。
- `!` **PROPOSAL-TSC-02（Phase 11 NON_VISUAL 固定文言の格上げ）**: `UI/UX変更なしのため Phase 11 スクリーンショット不要` の固定記載ルールを `phase-12-documentation-guide.md` の Task 12-1 直下に明示する（現状は部分的に散在）。併せて、監査タスクの primary evidence が `manual-test-result.md` であることを明記。
- `!` **PROPOSAL-TSC-03（canonical 成果物 vs 必須 6 成果物の分離明文化）**: `phase-template-phase12.md` §「出力テンプレ」に **「canonical N 成果物（各 workflow 固有）」と「必須 6 成果物（Phase 12 固定）」の区別** を明記し、「canonical は Phase 5 / 6 / 8 のパス参照に統一し、Phase 12 ではコピーしない」ルールを `P12-R2` 相当のリスク対策として共通化する。
- `!` **PROPOSAL-TSC-04（未タスク配置先決定フローの集約）**: `phase-template-phase12.md` §「未タスク配置先ディレクトリの明示（P38 再発防止）」の表と、`unassigned-task-detection-guide.md` の本文記述が別位置にあるので、決定フロー図（If-Then-Else）を 1 枚にまとめる。

### 3.5 スキル適用度（★）

- **★★★☆☆**（3/5）
- 理由: テンプレ本体は実装タスクを前提としており、NON_VISUAL 監査タスクで適用するには Phase 3 設計書で再解釈（Phase 4 = raw evidence、Phase 5 = consumer 整理、Phase 6 = dual root diff、Phase 11 = 再現コマンド実行）を明示する工程が必須だった。とはいえ Phase 12 close-out の 6 成果物契約・Part 1/Part 2 構成・ledger 三者同期チェック等、close-out 系の契約は高い適用度を示したため ★3。PROPOSAL-TSC-01 が実施されれば ★4 以上に上がる見込み。

---

## 4. スキル 2: `aiworkflow-requirements`

### 4.1 スキル概要

- 役割: `references/` 配下の正本仕様を検索・参照・更新する。本タスクでは「参照のみ」（Phase 9 の突合元）。
- 本タスクでの依存度: **中**（Phase 9 の唯一の突合元）。
- 本タスクで参照した indexes/ references/:
  - `indexes/resource-map.md`（候補ファイル絞り込み）
  - `indexes/topic-map.md` / `indexes/keywords.json`（キーワード逆引き）
  - `references/claude-code-overview.md`（EVALS.json 存在性チェック）
  - `references/arch-electron-services-details-part1.md`（SkillScanner の OTHER_FILES 定数）
  - `references/lessons-learned-current-2026-04.md` ほか L-WC-001 系 5 ファイル
  - 補助: `.claude/skills/task-specification-creator/references/self-improvement-cycle.md`

### 4.2 良かった点（`+`）

- `+` `indexes/resource-map.md` / `indexes/topic-map.md` / `indexes/keywords.json` の 3 層索引により、`EVALS` キーワード・`currentLevel` 等の EVALS スキーマ由来キーの逆引きが `rg` 一発で完結した（Phase 9 §2.3 の再現コマンド）。
- `+` `spec-splitting-guidelines.md` / `spec-elegance-consistency-audit.md` が references/ に整備されており、「正本側に EVALS 詳細が記載されていない」判定の根拠（「正本は "存在性 + merge 戦略 + フォルダ構造" 粒度」という設計判断）を立証できた。
- `+` dual root（`.claude` / `.agents`）の正本方針（`L-WC-001`）が 5 ファイルに冗長化されていたことで、少なくとも 1 ファイルがヒットする確度が高く、正本側の merge 戦略（`ours` + post-merge 再生成）を確実に把握できた。
- `+` `SKILL.md` の description が trigger キーワード多数列挙方式であり、`EVALS` / `currentLevel` 等を直接キーワード検索しなくても、関連スキル（skill lifecycle、Skill Creator）経由で EVALS 言及へ辿り着けた。

### 4.3 困難だった点（`-`）

- `-` **references/ に EVALS スキーマ構造の詳細記述が欠落**: Phase 9 §5.1 で立証した通り、`references/` 配下には **EVALS の構造体フィールド名（`skillName` / `currentLevel` / `metrics.*` 等）のキー名記載は一切存在しない**（正規表現ヒット 0 件）。監査で発見した camelCase v2 / snake_case v1 の 2 方言併存、`qualityInsights.*` 11 フィールド、validator=0 件リスクが正本未記載という事実を Phase 9 §6.1 で 3 件の `needs-review`（NR-1/NR-2/NR-3）として記録することになった。つまり **正本が実態を網羅していない** 状態。
- `-` **EVALS.json の構造例が `task-specification-creator/references/self-improvement-cycle.md` に存在するが、`aiworkflow-requirements/references/` に cross-reference がない**: 監査者（本タスクのエージェント）は `self-improvement-cycle.md` を「補助」として自力で発見する必要があった。`indexes/topic-map.md` や `indexes/resource-map.md` に `EVALS.json` トピックエントリが存在しなかった。
- `-` **`arch-electron-services-details-part1.md` の OTHER_FILES 定数表が consumer 実態と表記揺れ**: 正本は `| EVALS.json | evals |` と 2 列表記だが、consumer-audit-report.md は 9 列表（path / root / consumer_type / operation / read_fields / write_fields / dynamic_path / notes / source_evidence）で記述される。正本表記のメンテ責務が不明確。
- `-` **`SKILL.md` description の trigger キーワードが長大**: 4000+ 文字の description は Progressive Disclosure の原則（SKILL.md は入口だけ）と矛盾しがちで、EVALS 関連キーワード（`EVALS` / `currentLevel`）が正面からヒットしない。本タスクでは description に頼らず `rg` に直接フォールバックした。

### 4.4 改善提案（`!`）

- `!` **PROPOSAL-AWR-01（EVALS スキーマ正本記述の追加）**: 本タスク Phase 9 §7 に列挙した UNASSIGNED-EVALS-SPEC-ALIGN-001 / 002 / 003 の 3 件（snake_case v1 系 / qualityInsights.\* / validator=0 件）を正本に追記する。配置先は新規 reference ファイル `references/evals-schema-spec.md`（仮）、または既存 `references/claude-code-overview.md` の §Skill 標準構造 内に EVALS.json サブセクションを追加。
- `!` **PROPOSAL-AWR-02（EVALS.json トピック化 + cross-reference 整備）**: `indexes/topic-map.md` に `topic: evals-json` エントリを新設し、`self-improvement-cycle.md`（structure 例示）/ `arch-electron-services-details-part1.md`（OTHER_FILES consumer）/ `claude-code-overview.md`（存在性チェック）/ `lessons-learned-current-2026-04.md`（merge 戦略）を cross-reference として列挙する。`indexes/keywords.json` にも `EVALS` / `currentLevel` / `qualityInsights` を追加。
- `!` **PROPOSAL-AWR-03（consumer 表記フォーマット統一）**: `arch-electron-services-details-part1.md` の OTHER_FILES 定数表に、consumer-audit-report.md の 9 列表への cross-reference を追加し、正本 ⇄ 監査成果物の表記整合を運用ルール化する。schema-change-guide.md に「consumer 追加時は evals-field-map.md と arch-electron-services-details-part1.md の両方を更新」ルールを追記（schema-change-guide.md §9 で実施済だが、正本側から参照を張り返す）。
- `!` **PROPOSAL-AWR-04（SKILL.md description の Progressive Disclosure 準拠）**: `SKILL.md` description の trigger キーワード群を `indexes/keywords.json` へ移し、description 本体は 200〜400 字程度に抑える。description 肥大化は他の全スキルにも波及しうるので `task-specification-creator` の self-improvement-cycle の品質指標へ組み込むことを推奨。

### 4.5 スキル適用度（★）

- **★★★☆☆**（3/5）
- 理由: `indexes/` 3 層索引と `references/` 正本が Phase 9 の突合元として機能したが、EVALS スキーマ構造の詳細記述が欠落しており、正本 coverage がスキル本体の設計思想（Progressive Disclosure + `references/` が正本）と乖離していた。本タスク Phase 9 が `partial` 判定となった根拠も、この coverage 不足に起因する。PROPOSAL-AWR-01 + AWR-02 実施後は ★4〜5 に到達する見込み。

---

## 5. スキル 3: `github-issue-manager`

### 5.1 スキル概要

- 役割: GitHub Issue を `gh` CLI で管理し、タスク仕様書と双方向連携する。
- 本タスクでの依存度: **低**（Issue #2279 は CLOSED 維持方針で Issue 操作は行わず、状態確認のみ）。
- 本タスクで参照した点:
  - `SKILL.md` の sync / list / select モード（Issue 状態の読み取り）
  - Phase 1 で `issue_status: CLOSED` / `issue_closed_reason: 運用上クローズ済みだが、ユーザー指示により仕様書は作成する` を記録する根拠

### 5.2 良かった点（`+`）

- `+` **CLOSED Issue からの仕様書作成運用を明示的にサポート**: SKILL.md の「仕様書作成 → Issue 自動作成/更新」フローは逆方向（`CLOSED Issue を読み取り → 仕様書作成`）も許容できるスクリプト粒度（`sync_issues.js` / `list_issues.js`）で整理されており、Issue #2279 を CLOSED 維持のまま Phase 1 で `issue_number: 2279` / `issue_closed_reason` を仕様書メタ情報に書き込む判断を根拠付けられた。
- `+` **task-specification-creator との双方向連携**: Anchors `task-specification-creator / 適用: メタ情報・Issue構造 / 目的: フォーマット互換性確保` が明記されており、Phase 1 仕様書の「Issue #2279 が CLOSED のまま設計書を作成する理由」節を書く判断に直接寄与した。
- `+` **`docs/30-workflows/issues/` ローカル同期**: 高速検索が可能で、本タスクの issue 参照が `gh` API 呼び出し 0 回で完結した（オフラインで再現可能）。

### 5.3 困難だった点（`-`）

- `-` **CLOSED Issue の「仕様書存続モード」が明示されていない**: SKILL.md の基本ワークフローは「仕様書作成 → Hook で Issue 作成」が標準であり、「CLOSED Issue について後付けで仕様書を作成する」特殊モードが明示されていない。本タスクでは Phase 1 でユーザー指示（「仕様書として残せ」）を理由に記録したが、運用ルールとしては不明確。
- `-` **`select_issue.js` のスコアリング対象に CLOSED Issue が含まれない**: 本タスクのように AC-6 解除条件を満たすための間接的な仕様書作成タスクが、select フローで上位に出にくい（最適 Issue 選択のスコア対象外）。
- `-` **`relink_issues.js` の文書書き戻し**: Phase 12 で `issue_status: CLOSED` を `resolved` 等へ変更したい場合の運用が不明確（Issue を reopen せずに台帳整合を取る方法）。

### 5.4 改善提案（`!`）

- `!` **PROPOSAL-GIM-01（CLOSED Issue 仕様書存続モードの明文化）**: SKILL.md に **「CLOSED Issue に対して後付けで仕様書を作成するモード（`spec-from-closed-issue`）」** を追加する。メタ情報に `issue_status: CLOSED` / `issue_closed_reason` / `spec_purpose`（例: AC 解除根拠・運用正本化）を必須化し、`task-specification-creator` の `phase-template-phase1.md` とフォーマット互換性を保つ。
- `!` **PROPOSAL-GIM-02（select_issue.js の拡張）**: CLOSED Issue 由来の「仕様書存続タスク」を選択対象に含めるフラグ（`--include-closed-spec`）を `select_issue.js` に追加する。
- `!` **PROPOSAL-GIM-03（relink_issues.js の台帳整合ドキュメント）**: Phase 12 close-out 時に Issue reopen せず台帳整合のみ取る運用を SKILL.md に Part として追加する（本タスクの Phase 12 system-spec-update-summary.md / documentation-changelog.md に cross-reference を張れるフローを想定）。

### 5.5 スキル適用度（★）

- **★★★★☆**（4/5）
- 理由: 本タスクでの使用範囲が Issue 状態の読み取り + CLOSED Issue からの仕様書作成の根拠付けに限定されるため、スキル本体の機能の大半（sync-new / create / update / close / relink / label）は未使用。ただし使用した範囲（状態読み取り + task-specification-creator との互換性）では高い適用度を示した。PROPOSAL-GIM-01 実施後は ★5 に到達する見込み。

---

## 6. 本タスクで発見した命名揺れ・成果物契約ドリフト・参照先ミスマッチ

### 6.1 命名揺れ

| #   | 対象                | 揺れ内容                                                                                                                                                             | 初出 Phase    | 対応                                                                                                                   |
| --- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | EVALS スキーマ方言  | camelCase v2（`currentLevel` / `totalUsageCount`）と snake_case v1（`current_level` / `total_usage_count`）が併存                                                    | Phase 5 §8 #1 | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 として未タスク化（Phase 9 §7 / Phase 12 unassigned-task-detection.md） |
| 2   | consumer 表記       | 正本 `arch-electron-services-details-part1.md` の `\| EVALS.json \| evals \|` 2 列表記 vs 監査 `consumer-audit-report.md` の 9 列表                                  | Phase 9 §4.2  | PROPOSAL-AWR-03 で正本側から cross-reference を張り返す                                                                |
| 3   | canonical vs mirror | `.claude/skills/` = canonical / `.agents/skills/` = mirror（`task-specification-creator/SKILL.md` §設計原則）vs dual root のどちらが正本か断定しない（Phase 2 §3.1） | Phase 2       | 本タスクでは断定せず「dual root 差分可視化」に留めた（Phase 6 dual-root-parity.md）。将来の正本断定は別タスクへ委譲    |

### 6.2 成果物契約ドリフト

| #   | 対象                                                             | ドリフト内容                                                                                                                                                         | 対応                                                                                                  |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Phase 12 必須 6 成果物 vs canonical 4 成果物                     | `task-specification-creator/references/phase-template-phase12.md` §「出力テンプレ」は 6 成果物のみ記載。canonical N 成果物（各 workflow 固有）との混在リスクが未明記 | PROPOSAL-TSC-03                                                                                       |
| 2   | Phase 11 primary evidence                                        | `phase-template-phase11.md` が screenshot 中心。NON_VISUAL の primary evidence が `manual-test-result.md` である旨が散在                                             | PROPOSAL-TSC-02                                                                                       |
| 3   | `system-spec-update-summary.md` の `spec_created` vs `completed` | `phase-template-phase12.md` §「docs-only モードフラグ」に記載あるが、NON_VISUAL 監査タスクのように「正本更新ゼロ（正本補強を未タスク化）」のパターン明示なし         | PROPOSAL-TSC-01 内で吸収可能                                                                          |
| 4   | `phase12-task-spec-compliance-check.md` の Task 範囲             | `phase-template-phase12.md` §「出力テンプレ」の表で「Task 12-1〜12-6」「Task 12-1〜12-5」の 2 表記が併存                                                             | `phase-template-phase12.md` 自体の誤植修正を推奨（本タスクの改善提案としては PROPOSAL-TSC-05 とする） |

### 6.3 参照先ミスマッチ

| #   | 対象                     | ミスマッチ内容                                                                                                                                      | 対応                                                                                  |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | EVALS スキーマ構造の正本 | `aiworkflow-requirements/references/` 配下に詳細なし。補助としての `task-specification-creator/references/self-improvement-cycle.md` しか存在しない | PROPOSAL-AWR-01 / AWR-02                                                              |
| 2   | validator=0 件の事実     | `claude-code-overview.md:272` は「有効な JSON」要件のみ。validator 不在・NaN サイレント破損リスクは正本未記載                                       | PROPOSAL-AWR-01 で UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001 として未タスク化 |
| 3   | mirror cross-root link   | `.agents/.../resource-map.md` が `.claude/...` を参照しているケースがある                                                                           | Phase 5 §8 #3 / UNASSIGNED-MIRROR-RESOURCE-MAP-CROSS-ROOT-LINK-001 として未タスク化   |

### 6.4 追加の改善提案

- `!` **PROPOSAL-TSC-05（phase-template-phase12.md §出力テンプレ重複行の修正）**: `| phase12-task-spec-compliance-check.md | Task 12-1〜12-6 の準拠チェック |` と `| phase12-task-spec-compliance-check.md | Task 12-1〜12-5 の準拠チェック |` の 2 行が併存している（本 Phase 12 spec §4 の準拠でも 6 成果物確認なので 12-6 が正しい）。誤植として修正。

---

## 7. 改善提案の優先度マトリクス

| ID              | 対象スキル                 | 提案                                                | 効果                              | 実装難易度 | 優先度                         |
| --------------- | -------------------------- | --------------------------------------------------- | --------------------------------- | ---------- | ------------------------------ |
| PROPOSAL-TSC-01 | task-specification-creator | NON_VISUAL 監査タスク用テンプレ                     | 監査系タスクの再解釈コストを 0 化 | 中         | **高**                         |
| PROPOSAL-AWR-01 | aiworkflow-requirements    | EVALS スキーマ正本記述の追加                        | 正本 coverage 穴埋め              | 中         | **高**                         |
| PROPOSAL-AWR-02 | aiworkflow-requirements    | EVALS.json トピック化                               | 索引経由の発見性向上              | 低         | **高**                         |
| PROPOSAL-TSC-02 | task-specification-creator | NON_VISUAL 固定文言の格上げ                         | Phase 11 仕様明確化               | 低         | 中                             |
| PROPOSAL-TSC-03 | task-specification-creator | canonical vs 必須 6 成果物の分離明文化              | Phase 12 契約明確化               | 低         | 中                             |
| PROPOSAL-TSC-04 | task-specification-creator | 未タスク配置先決定フロー集約                        | 判定速度向上                      | 低         | 中                             |
| PROPOSAL-AWR-03 | aiworkflow-requirements    | consumer 表記フォーマット統一                       | 正本 ⇄ 監査整合運用化             | 低         | 中                             |
| PROPOSAL-AWR-04 | aiworkflow-requirements    | SKILL.md description の Progressive Disclosure 準拠 | 他スキルへも波及効果              | 中         | 中                             |
| PROPOSAL-GIM-01 | github-issue-manager       | CLOSED Issue 仕様書存続モード                       | 本タスク類似ケースの標準化        | 低         | 中                             |
| PROPOSAL-TSC-05 | task-specification-creator | phase-template-phase12.md 誤植修正                  | 即時修正可能                      | 低         | 低（トリビアルだが即効性あり） |
| PROPOSAL-GIM-02 | github-issue-manager       | select_issue.js の拡張                              | 限定的な効果                      | 中         | 低                             |
| PROPOSAL-GIM-03 | github-issue-manager       | relink_issues.js の台帳整合ドキュメント             | 運用時の参照頻度低                | 低         | 低                             |

### 7.1 最重要な改善提案 1 件（要約）

**PROPOSAL-AWR-01（`aiworkflow-requirements` への EVALS スキーマ正本記述の追加）**

- 理由: 本タスクの存在意義（TASK-CONFLICT-PREVENT-001 AC-6 解除）は EVALS consumer 監査結果を正本に定着させることにある。PROPOSAL-AWR-01 が実施されなければ、本タスク完了後も同種の監査タスクが再発生する（正本が実態を網羅していない状態が継続する）。
- 3 件の未タスク（UNASSIGNED-EVALS-SPEC-ALIGN-001 / 002 / 003）として Phase 9 §7 で引き継ぎ済み。Phase 12 `unassigned-task-detection.md` で正式記録される。

---

## 8. 総合判定

### 8.1 本タスクでのスキル適用度総合評価

| スキル                     | 適用度 | 本タスクでの充足度 | コメント                                                                               |
| -------------------------- | ------ | ------------------ | -------------------------------------------------------------------------------------- |
| task-specification-creator | ★★★☆☆  | 70%                | 実装タスク前提のテンプレを再解釈して適用。Phase 3 設計書での補強が必須                 |
| aiworkflow-requirements    | ★★★☆☆  | 60%                | 正本 coverage 不足で Phase 9 が `partial` 判定。3 件の未タスク化で Phase 12 へ引き継ぎ |
| github-issue-manager       | ★★★★☆  | 85%                | 使用範囲が限定的（CLOSED Issue の状態読み取り）だが、その範囲では高い適用度            |

### 8.2 改善提案件数サマリ

| カテゴリ                             | 件数                                      |
| ------------------------------------ | ----------------------------------------- |
| 改善提案（スキル本体への追加・修正） | **11 件**                                 |
| うち高優先度                         | 3 件（PROPOSAL-TSC-01 / AWR-01 / AWR-02） |
| うち中優先度                         | 6 件                                      |
| うち低優先度                         | 2 件                                      |
| 命名揺れ検出                         | 3 件                                      |
| 成果物契約ドリフト検出               | 4 件                                      |
| 参照先ミスマッチ検出                 | 3 件                                      |

### 8.3 本タスク由来の未タスク候補（Phase 12 §unassigned-task-detection.md へ引き継ぎ）

| #   | 既存記録                                                            | 本 Phase での扱い                                   |
| --- | ------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | UNASSIGNED-EVALS-SPEC-ALIGN-001（snake_case v1 系正本化）           | Phase 9 §7 引き継ぎ。PROPOSAL-AWR-01 で統合可能     |
| 2   | UNASSIGNED-EVALS-SPEC-ALIGN-002（qualityInsights.\* 正本化）        | Phase 9 §7 引き継ぎ。PROPOSAL-AWR-01 で統合可能     |
| 3   | UNASSIGNED-EVALS-SPEC-ALIGN-003（validator=0 件正本化）             | Phase 9 §7 引き継ぎ。PROPOSAL-AWR-01 で統合可能     |
| 4   | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001（camel/snake 統一） | Phase 5 §8 / Phase 11 discovered-issues.md 引き継ぎ |
| 5   | UNASSIGNED-MIRROR-RESOURCE-MAP-CROSS-ROOT-LINK-001                  | Phase 5 §8 引き継ぎ                                 |
| 6   | UNASSIGNED-SKILL-SCANNER-EVALS-CONTENT-VALIDATE-001                 | Phase 5 §8 引き継ぎ                                 |
| 7   | UNASSIGNED-SKILL-FIXTURE-RUNNER-EVALS-SCHEMA-VALIDATE-001           | Phase 5 §8 引き継ぎ                                 |

※ 本 skill-feedback-report からの新規未タスク候補は上記の範囲で吸収可能（本 Report §3〜§5 の PROPOSAL 11 件は、Phase 12 `unassigned-task-detection.md` で「skill 改善系未タスク」として集約するか、各スキル保守者向けの別タスクとして切り出すかは §9 の意思決定事項とする）。

### 8.4 改善点なしの扱い

本 Report は **改善点が 11 件検出された** ため、`phase-template-phase12.md` の「0 件でも `改善点なし` でファイルを作成する」規定には該当しない。ただし同規定に従い、改善点なしの場合でもファイルを必ず生成する運用を Task 12-5 契約として遵守する。

---

## 9. 結論

### 9.1 主要結論

1. **本タスク（NON_VISUAL 監査 / docs-only）に対するスキル適用度の総合判定: 部分適合（★★★☆☆ 3/5）**。使用 3 スキルのうち `task-specification-creator` / `aiworkflow-requirements` の 2 スキルが ★3、`github-issue-manager` が ★4。再解釈コストが無視できないが、仕様書化を通じて補強可能な範囲に収まった。
2. **最重要改善提案**: **PROPOSAL-AWR-01（`aiworkflow-requirements` への EVALS スキーマ正本記述の追加）**。本タスクの存在意義と直結し、PROPOSAL 実施が次回以降の同種監査タスク発生を防ぐ。
3. **スキル本体の変更は本 Phase では実施しない**（Task 12-5 制約 / Phase 1 制約）。PROPOSAL 群は Phase 12 `unassigned-task-detection.md` および本 Report §7 を根拠に、別タスクで実施する。

### 9.2 後続 Phase（Phase 13）への引き継ぎ事項

- Phase 13 PR 作成時、本 Report §7 の PROPOSAL 11 件をコミットメッセージ / PR description で参照可能にする。
- `skill-feedback-report.md` 自体の配置先は `outputs/phase-12/` で確定（本タスクでは `.claude/skills/*/SKILL-changelog.md` を変更しない）。

### 9.3 参照

- Phase 1 要件定義: `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md`
- Phase 3 設計: `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md` §1 冒頭（監査タスクへの再解釈方針）
- Phase 9 正本突合: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md` §5 / §6 / §7
- Phase 11 発見事項: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/discovered-issues.md`
- スキル本体:
  - `.claude/skills/task-specification-creator/SKILL.md`
  - `.claude/skills/task-specification-creator/references/phase-template-phase12.md`
  - `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
  - `.claude/skills/github-issue-manager/SKILL.md`

---

> 本 Report は **改善提案のみを記録** する。スキル本体（`.claude/skills/*/`）の変更は行っていない（git status で確認可能）。
