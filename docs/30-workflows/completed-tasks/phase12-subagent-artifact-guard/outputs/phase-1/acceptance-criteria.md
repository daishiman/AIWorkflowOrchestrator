# 受け入れ基準 — Phase 12 SubAgent成果物固定ガード

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| Phase      | 1                                          |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |
| 対象要件   | FR-01〜FR-10、NFR-01〜NFR-04               |

---

## 1. 合否基準の定式化

本タスクの最上位合否基準は以下の4条件を全て満たすこととする:

| 基準No | 条件                                                                    | 合否判定方法                                    |
| ------ | ----------------------------------------------------------------------- | ----------------------------------------------- |
| C-1    | `spec-update-summary.md` がテンプレート準拠構造で再利用可能             | テンプレート7セクション全項目チェック           |
| C-2    | `spec-sync-subagent-report.md` が1仕様書=1SubAgentの責務/完了条件を保持 | 4列テーブル+S2チームの存在確認                  |
| C-3    | Step 2判定が三点突合で説明可能                                          | phase-12-doc/changelog/summaryの3成果物整合確認 |
| C-4    | `currentViolations=0` を合否基準として運用                              | `audit-unassigned-tasks.js` の実行結果確認      |

---

## 2. 機能要件の受け入れ基準（Given/When/Then形式）

### AC-FR-01: spec-update-summary テンプレート準拠構造

**対応要件:** FR-01

```
Given: Phase 12 Task 2が完了し、spec-update-summary.md が作成されている
When:  spec-update-summary.md の構造を phase12-system-spec-retrospective-template.md と比較する
Then:  以下の全条件を満たす
       - §1（メタ情報）に「タスクID」「実施日」「ステータス」「監査対象workflow」「SubAgent分担」の5フィールドが存在する
       - §3（仕様書別SubAgent分担）に「SubAgent」「担当仕様書」「主担当作業」「依存関係」の4列テーブルが存在する
       - §5（苦戦箇所）に「苦戦箇所」「再発条件」「解決策」「今後の標準ルール」の4列テーブルが存在する
       - §6（簡潔解決手順）に番号付き5ステップが存在する
       - §7（検証コマンド）に実行可能なコマンド一覧が存在する
```

**検証コマンド:**

```bash
# セクション存在確認
rg -n '^## [1-7]\.' docs/30-workflows/<workflow>/outputs/phase-12/spec-update-summary.md
# 期待: ## 1. 〜 ## 7. の7セクションが検出される
```

---

### AC-FR-02: spec-sync-subagent-report SubAgent責務固定

**対応要件:** FR-02

```
Given: Phase 12 Task 2が完了し、spec-sync-subagent-report.md が作成されている
When:  spec-sync-subagent-report.md の内容を検査する
Then:  以下の全条件を満たす
       - §2（SubAgent分担）テーブルに「SubAgent」「担当仕様書」「主担当作業」「完了条件」の4列が存在する
       - 各SubAgentに割り当てられた担当仕様書が1件のみである（複数仕様書の混在なし）
       - §2.1（Step 2判定同期チーム）として SubAgent-S2-A / SubAgent-S2-B / SubAgent-S2-C が存在する
       - 完了チェックリスト（§6）に `currentViolations=0` 確認項目が含まれている
```

**検証コマンド:**

```bash
# SubAgent数の確認
rg -n '^\| SubAgent-' docs/30-workflows/<workflow>/outputs/phase-12/spec-sync-subagent-report.md
# 期待: SubAgent-A 〜 SubAgent-F（または同種）+ SubAgent-S2-A/B/C が検出される
```

---

### AC-FR-03: Step 2判定の三点突合説明可能性

**対応要件:** FR-03

```
Given: Phase 12 Task 2が完了し、phase-12-documentation.md / documentation-changelog.md / spec-update-summary.md の3成果物が存在する
When:  3成果物のStep 2関連記載を相互比較する
Then:  以下の全条件を満たす
       - phase-12-documentation.md の更新対象テーブルに Step 2対象仕様書（arch/api/interfaces/security等）が記載されている
       - documentation-changelog.md の Step 2行（| 2 |）が「完了」または「該当なし」で記載されており、理由が明示されている
       - spec-update-summary.md の §4（仕様反映先）に Step 2で実際に更新した仕様書一覧が記載されている
       - documentation-changelog.md の Step 2判定と spec-update-summary.md の仕様反映先一覧が矛盾していない
```

**検証コマンド:**

```bash
# Step 2判定行の確認
rg -n '^\| 2\s+\|' docs/30-workflows/<workflow>/outputs/phase-12/documentation-changelog.md
# 期待: Step 2の判定行が1件検出される
```

---

### AC-FR-04: currentViolations=0合否基準の運用

**対応要件:** FR-04

```
Given: Phase 12 Task 2が完了し、未タスク指示書が docs/30-workflows/unassigned-task/ に存在する
When:  以下のコマンドを実行する
       (1) node audit-unassigned-tasks.js --json --target-file <unassigned-file>
       (2) node audit-unassigned-tasks.js --json --diff-from HEAD
Then:  以下の全条件を満たす
       - (1) の currentViolations.total が 0
       - (2) の currentViolations.total が 0
       - (2) の baselineViolations.total は 0以上であってもよく、「監視値」として別記録する
       - 成果物に記録フォーマット「audit-unassigned-tasks: 全体 PASS/FAIL（baseline: N件, current: M件）→ current PASS/FAIL」が存在する
```

**検証コマンド:**

```bash
# 対象ファイル監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md | \
  jq '{scope, current_total: .currentViolations.total, baseline_total: .baselineViolations.total}'
# 期待: current_total が 0
```

---

### AC-FR-05: IPC仕様の層別契約明示

**対応要件:** FR-05

```
Given: IPC仕様書（api-ipc-agent.md 等）にIPCチャネルの戻り値が記載されている
When:  IPC仕様書の戻り値記載を検査する
Then:  以下の条件を満たす
       - 「Main契約」と「Preload公開」が分離して記述されている
       - Main側は IpcResult<T> または同等のラッパー型が明記されている
       - Preload側は T（アンラップ後の型）が明記されている
       - 単一の「戻り値: T」のみの記述では条件を満たさない
```

**検証方法:**
仕様書の該当IPC行を読み、`IpcResult<T>` と `T` が別行または別セルに存在することを目視確認する。

---

### AC-FR-06: 完了前の成果物名照合固定化

**対応要件:** FR-06

```
Given: Phase 12 Task 2が完了し、outputs/phase-12/ に成果物が配置されている
When:  phase-12-documentation.md の成果物記載と outputs/phase-12/ の実体ファイル名を比較する
Then:  以下の全条件を満たす
       - phase-12-documentation.md に記載された全成果物パスが outputs/phase-12/ に実在する
       - outputs/phase-12/ 配下の全ファイルが phase-12-documentation.md に記載されている
       - 照合結果が documentation-changelog.md の完了チェックリストに記録されている
```

**検証コマンド:**

```bash
# 実体ファイル一覧
ls docs/30-workflows/<workflow>/outputs/phase-12/
# 期待: phase-12-documentation.md の成果物記載と完全一致
```

---

### AC-FR-07: 未タスク`## メタ情報`1セクション原則

**対応要件:** FR-07

```
Given: 未タスク指示書が docs/30-workflows/unassigned-task/<task>.md として存在する
When:  以下のコマンドを実行する
       rg -n '^## メタ情報$|^## [1-9]\. ' <task>.md
Then:  以下の全条件を満たす
       - `## メタ情報` が1件のみ検出される（重複なし）
       - `## 1.` 〜 `## 9.` が各1件ずつ、計9件検出される
       - 合計10件の見出しが検出される
```

**検証コマンド:**

```bash
# 10見出し確認
rg -n '^## メタ情報$|^## [1-9]\. ' \
  docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md
# 期待: 10行が検出される（## メタ情報 × 1 + ## 1. 〜 ## 9. × 9）
```

---

### AC-FR-08: SubAgent責務の成果物化

**対応要件:** FR-08

```
Given: Phase 12 Task 2が実施される
When:  outputs/phase-12/ の内容を確認する
Then:  以下の全条件を満たす
       - spec-sync-subagent-report.md が outputs/phase-12/ に存在する
       - spec-update-summary.md の §3（仕様書別SubAgent分担）と spec-sync-subagent-report.md の §2（SubAgent分担）で、SubAgent数・担当仕様書が一致している
       - spec-update-summary.md のみ存在し spec-sync-subagent-report.md が存在しない状態は不合格
```

**検証コマンド:**

```bash
# 両ファイルの存在確認
ls docs/30-workflows/<workflow>/outputs/phase-12/spec-update-summary.md \
   docs/30-workflows/<workflow>/outputs/phase-12/spec-sync-subagent-report.md
# 期待: 両ファイルともに存在する
```

---

### AC-FR-09: 監査スクリプトの順次実行

**対応要件:** FR-09

```
Given: Phase 12 Task 2が完了している
When:  以下の4スクリプトをこの順序で実行する
       (1) node verify-unassigned-links.js
       (2) node audit-unassigned-tasks.js --json --target-file <path>
       (3) node audit-unassigned-tasks.js --json --diff-from HEAD
       (4) node verify-all-specs.js --workflow <workflow-path> --json
Then:  以下の全条件を満たす
       - (1) が `missing: 0` または `ALL_LINKS_EXIST` で終了する
       - (2) の `currentViolations.total` が 0
       - (3) の `currentViolations.total` が 0
       - (4) が `errors: 0` で終了する
       - 全4コマンドの実行結果が task-workflow.md または documentation-changelog.md に記録されている
```

**検証コマンド（標準実行順）:**

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard --json
```

---

### AC-FR-10: テンプレート構造検証（三点突合）

**対応要件:** FR-10

```
Given: spec-update-summary.md / spec-sync-subagent-report.md / documentation-changelog.md の3成果物が存在する
When:  3成果物のSubAgent数・担当仕様書数・Step 2判定・タスクIDを相互比較する
Then:  以下の全条件を満たす
       - summaryのSubAgent分担（§3）とreportのSubAgent分担（§2）でSubAgent数が一致する
       - summaryのSubAgent分担（§3）とreportのSubAgent分担（§2）で担当仕様書名が一致する
       - changelogのStep 2判定とsummaryの§4（仕様反映先）が矛盾していない
       - 3成果物のタスクIDが全て同一である
```

**検証方法:** 3成果物のタスクID行・SubAgent分担テーブル・Step 2記載を目視で照合する。

---

## 3. 非機能要件の受け入れ基準（Given/When/Then形式）

### AC-NFR-01: テンプレート再利用性

**対応要件:** NFR-01

```
Given: phase12-system-spec-retrospective-template.md または phase12-spec-sync-subagent-template.md を参照する
When:  別タスク（例: UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001）のPhase 12で使用する
Then:  以下の全条件を満たす
       - テンプレートのプレースホルダー（<TASK-ID>, <workflow-path> 等）をタスク固有値に置換するだけで適用可能
       - タスク固有のスキル名・IPCチャネル名がテンプレート本文にハードコードされていない
       - テンプレートのセクション構造（§1〜§7）を変更せずに使用できる
```

---

### AC-NFR-02: 運用手順の保守性

**対応要件:** NFR-02

```
Given: spec-update-summary.md の §6（同種課題の簡潔解決手順）が作成されている
When:  同種課題（Phase 12仕様同期）の初動として §6 を参照する
Then:  以下の全条件を満たす
       - ステップ1〜5が番号付きで明記されている
       - 各ステップに実行コマンドまたは参照ファイルが含まれている
       - ステップ5に検証コマンド（verify/audit）が明記されている
       - §6を読むだけで「何をするか・どのコマンドを実行するか」が判断可能
```

---

### AC-NFR-03: 成果物名一貫性

**対応要件:** NFR-03

```
Given: Phase 12の成果物が outputs/phase-12/ に配置されている
When:  3箇所の成果物名記載を比較する
       (1) ls outputs/phase-12/ の出力
       (2) phase-12-documentation.md の成果物パス記載
       (3) artifacts.json の成果物リスト
Then:  以下の全条件を満たす
       - (1) と (2) のファイル名が完全一致する
       - (1) と (3) のファイル名が完全一致する
       - 「spec-update-summary.md」と「spec_update_summary.md」のような表記揺れが存在しない
```

**検証コマンド:**

```bash
# 実体ファイル一覧取得
ls docs/30-workflows/<workflow>/outputs/phase-12/
# phase-12-documentation.md の成果物記載と手動比較
```

---

### AC-NFR-04: 依存タスクとの関係明記

**対応要件:** NFR-04

```
Given: 本タスクのPhase 12成果物が作成されている
When:  成果物内の依存タスク記載を確認する
Then:  以下の全条件を満たす
       - UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001 のタスクIDが成果物に記載されている
       - UT-IMP-PHASE12-STEP2-TARGET-TRACE-GUARD-001 のタスクIDが成果物に記載されている
       - UT-IMP-PHASE12-EVIDENCE-VALUE-SYNC-GUARD-001 のタスクIDが成果物に記載されている
       - 「本タスク完了後に着手可能」または「依存関係」という説明が存在する
```

---

## 4. 統合テスト連携（監査スクリプト検証）

本タスクはドキュメント改善タスクのため、以下の監査スクリプト実行結果を「統合テスト」として位置づける:

| テストケース                 | 実行コマンド                                        | 期待結果               | 合否判定                         |
| ---------------------------- | --------------------------------------------------- | ---------------------- | -------------------------------- |
| Case 1: 未タスクリンク整合   | `verify-unassigned-links.js`                        | `missing: 0`           | `missing > 0` で不合格           |
| Case 2: 対象ファイル形式監査 | `audit-unassigned-tasks.js --json --target-file`    | `currentViolations: 0` | `currentViolations > 0` で不合格 |
| Case 3: 今回差分監査         | `audit-unassigned-tasks.js --json --diff-from HEAD` | `currentViolations: 0` | `currentViolations > 0` で不合格 |
| Case 4: テンプレート構造検証 | summary/report/changelogの三点突合（目視）          | 全項目一致             | 不一致があれば不合格             |

---

## 5. Phase 1完了条件チェックリスト

- [ ] 4つの最終ゴールに対応する機能要件（FR-01〜FR-04）が全件抽出されている
- [ ] 親タスク由来の4教訓が要件（FR-05〜FR-08）として反映されている
- [ ] resource-map/topic-map/search-spec を用いた抽出根拠が requirements-definition.md §1 に記録されている
- [ ] 各要件（FR-01〜FR-10、NFR-01〜NFR-04）に検証可能な受け入れ基準が紐づいている
- [ ] 監査スクリプト4件の実行と期待結果が統合テスト連携テーブルに記録されている
- [ ] 依存タスク3件との関係が requirements-definition.md §6 に明記されている

---

## 6. 変更履歴

| バージョン | 日付       | 内容                        |
| ---------- | ---------- | --------------------------- |
| 1.0.0      | 2026-03-03 | Phase 1受け入れ基準初版作成 |
