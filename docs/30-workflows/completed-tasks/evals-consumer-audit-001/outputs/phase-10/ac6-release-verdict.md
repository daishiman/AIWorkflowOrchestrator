# AC-6 Release Verdict

> TASK-EVALS-CONSUMER-AUDIT-001 Phase 10 の**AC-6 解除可否判定**専用成果物。
> TASK-CONFLICT-PREVENT-001 AC-6「consumer 監査完了まで EVALS schema 変更禁止」の解除条件 4 項目を個別に判定し、最終判定を明記する。

---

## 0. 判定サマリ

| 項目               | 値                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------- |
| **最終判定**       | **AC-6 解除可能（PASS）**                                                             |
| 判定日時           | 2026-04-19                                                                            |
| 判定者             | Phase 10 レビューエージェント（Claude Opus 4.7）                                      |
| 作業ブランチ       | `.worktrees/task-20260419-160952-wt-9`                                                |
| 解除条件 pass 数   | **4 / 4**                                                                             |
| 解除条件 fail 数   | 0                                                                                     |
| Phase 10 判定      | PASS（戻り先なし）                                                                    |
| Phase 11 への進行  | 可（本判定後に `phase-11/spec.md` 手動検証を実施）                                    |
| スナップショット日 | 2026-04-19（consumer 32 件 / フィールド 56 件 / dual root 6 スキル bit-for-bit 一致） |

解除条件 4 項目のうち **1 件でも fail があれば解除不可（MAJOR）**、**2 件以上 fail で CRITICAL** の仕様（Phase 10 spec §3 Step 4 / §7.4）に照らし、本判定は **解除可能** と確定する。

---

## 1. AC-6 原文引用

TASK-CONFLICT-PREVENT-001 AC-6 の原文は、本タスクの指示書 `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md` §4 Step 6「成果物をレビューし AC-6 解除条件を確認」において以下のとおり列挙されている。

> TASK-CONFLICT-PREVENT-001 の AC-6（「consumer 監査完了まで EVALS schema 変更禁止」）が解除可能かどうかを確認する。解除条件は以下のとおり。
>
> - [ ] 全 consumer が consumer-audit-report.md に記載されている
> - [ ] 各 consumer の参照フィールドが evals-field-map.md に記載されている
> - [ ] schema-change-guide.md でフィールド変更手順が定義されている
> - [ ] dual-root-parity.md で `.claude/skills/` と `.agents/skills/` の差分が 0 または許容範囲内であることが確認されている

本ガイドはこの 4 項目を `AC6-COND-1`〜`AC6-COND-4` に ID 付けし、個別判定する。

> 備考: `docs/30-workflows/conflict-prevent-skills-001/outputs/phase-12/unassigned-task-detection.md` は本 worktree に存在しない（`docs/30-workflows/conflict-prevent-skills-001/` ディレクトリ自体が未配置）。そのため原文取得は TASK-EVALS-CONSUMER-AUDIT-001 指示書の §4 Step 6 を一次ソースとする。

---

## 2. 解除条件 4 項目の個別判定結果

### 2.1 判定表（Phase 10 spec §4.3 スキーマ準拠）

| condition_id | condition_text                                                                                                      | evidence_path                                                                                                                 | verdict  | rationale                                                                                                                                                                                                                                                                                                                                   | remediation |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| AC6-COND-1   | 全 consumer が consumer-audit-report.md に記載されている                                                            | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` + `outputs/phase-7/coverage-recheck.md` | **pass** | consumer-audit-report.md §1.1 で 32 consumer を A(code)=1 / B(script)=10 / C(test)=3 / D(doc)=18 の 4 分類で網羅。動的パス consumer 13 件も §7 に再掲。さらに Phase 7 `coverage-recheck.md` §5.2 で `unlisted-paths.txt` = 0 行（QG-6 PASS）を機械検証し、漏れ 0 件を保証。                                                                 | N/A         |
| AC6-COND-2   | 各 consumer の参照フィールドが evals-field-map.md に記載されている                                                  | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`                                               | **pass** | evals-field-map.md §3.1〜§3.9 で全 56 フィールド（代表 camelCase v2 / legacy-snake-v1 / legacy-snake-min / fixture の 4 系統）に readers / writers / validators を逆引き記載（QG-4 PASS）。§4.1 集計で総フィールド=56、§4.4 で validator=0 件を明示。consumer-audit-report.md §2〜§6 の `referenced_fields` / `updated_fields` と相互整合。 | N/A         |
| AC6-COND-3   | schema-change-guide.md でフィールド変更手順が定義されている                                                         | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`                                           | **pass** | schema-change-guide.md §3 追加 / §4 削除 / §5 リネーム の 3 操作それぞれに「影響範囲」「step 表（10 手順前後）」「チェックリスト」を規定。§6 dual root 同期ルール + §7 3 カテゴリ検証コマンド（静的参照 / dual root 一致 / JSON パース）が完備（QG-7 PASS）。§10 AC-6 解除条件対応表で自己宣言済。                                          | N/A         |
| AC6-COND-4   | dual-root-parity.md で `.claude/skills/` と `.agents/skills/` の差分が 0 または許容範囲内であることが確認されている | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`                                              | **pass** | dual-root-parity.md §1 メタ + §2 サマリ表で 6 スキル全件が分類 **0（完全一致）**。`cmp -s` IDENTICAL、SHA-256 同一、`diff -u` 出力空を §3.1〜§3.6 で各スキル個別確認。§4 片方欠損 0 件、§5 要対応差分 0 件（QG-5 PASS）。                                                                                                                   | N/A         |

### 2.2 集計

| 判定 |  件数 |
| ---- | ----: |
| pass | **4** |
| fail |     0 |
| 合計 |     4 |

- fail=0 のため、**不足事項リスト（§3）は空**。
- Phase 10 spec §3 Step 4 の「上記 4 条件が全て pass → AC-6 解除可能」の条件を充足。

---

## 3. fail の場合の不足事項リスト

- **該当なし**（全 4 条件が pass）。
- 本セクションはフォーマット保持のため存置するが、記録対象項目はゼロ。

---

## 4. 後続スキーマ変更タスクへの通知事項（解除可能時）

### 4.1 ブロック解除対象タスク

AC-6 解除により、以下の系統のタスクがブロック解除される（Phase 10 spec §9.3 / schema-change-guide.md §10 に基づく）。

- EVALS.json にフィールドを**追加**する全タスク
- EVALS.json フィールドを**リネーム**する全タスク
- EVALS.json から フィールドを**削除**する全タスク
- mirror sync ガード系タスク（例: `UT-UIUX-MIRROR-SYNC-CI-001`）のうち EVALS.json に関わるサブタスク

### 4.2 解除後に必ず従うべき手順書

後続タスクは **必ず** 以下の正本手順書に従ってスキーマ変更を実施すること。

| 手順書                  | パス                                                                                | 役割                                                        |
| ----------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| schema-change-guide.md  | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md` | add / remove / rename の唯一の正本手順書（§3 / §4 / §5）    |
| dual root 同期手順      | 同 §6                                                                               | `.claude/skills/` と `.agents/skills/` を同一 commit で同期 |
| 3 カテゴリ検証          | 同 §7.1                                                                             | 静的参照 / dual root 一致 / JSON パース 3 カテゴリ必須      |
| consumer 追加運用ルール | 同 §8                                                                               | 新 consumer 追加時は本ガイドと evals-field-map.md を更新    |

### 4.3 解除と同時に周知すべき前提条件

1. **validator = 0 件**: EVALS.json のスキーマ構造を機械的に検証する consumer は現状ゼロ。削除・リネーム時のサイレント破損（`undefined` 参照→NaN 伝播）を検出する自動機構は存在しない（evals-field-map.md §4.4、schema-change-guide.md メタ情報）。
2. **camelCase / snake_case 二重スキーマ併存**: `currentLevel` vs `current_level` / `metrics.totalUsageCount` vs `metrics.total_usage_count` 等、3 組 6 フィールドが事実上同一概念で 2 系統並立。schema-change-guide.md §5 リネーム手順は両系統を扱う（evals-field-map.md §5.2）。
3. **dual root 正本を断定しない方針**: 本監査は `.claude/skills/` / `.agents/skills/` のどちらを正本と決めていない。両方を同一 commit で同期する運用に固定（Phase 2 §3.1 / dual-root-parity.md §6）。
4. **fixture snake_case 固定**: `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` の TC-004 が `expect(evals.skill_name).toBeDefined()` で snake_case を契約化。camelCase 化リネームは fixture 更新必須（consumer-audit-report.md §10 発見 #3）。
5. **SkillScanner.ts はスキーマ非依存**: filename / size / type=evals タグのみ扱い、内容 parse しない。本 consumer は影響範囲から除外可（consumer-audit-report.md §3.1）。

### 4.4 Phase 12 で追記される未タスク候補（情報共有）

Phase 9 / Phase 5 から引き継がれる未タスク候補は以下のとおり。本 AC-6 解除判定の直接障害ではないが、後続タスクが着手する際に把握すべき運用補強項目。

| #   | 候補                                                                | 推奨記録先                                                                                 |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | EVALS スキーマの camel/snake 二重標準統一                           | `docs/30-workflows/unassigned-task/task-evals-schema-dialect-unification-001.md`           |
| 2   | mirror cross-root link 解消（resource-map.md）                      | `docs/30-workflows/unassigned-task/task-mirror-resource-map-cross-root-link-001.md`        |
| 3   | SkillScanner の EVALS 内容バリデーション実装                        | `docs/30-workflows/unassigned-task/task-skill-scanner-evals-content-validate-001.md`       |
| 4   | validate-schemas.js / validate-skill-structure.js の EVALS 検証追加 | `docs/30-workflows/unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md` |
| 5   | snake_case v1 系スキーマの正本化                                    | `docs/30-workflows/unassigned-task/task-evals-spec-snake-case-v1-document-001.md`          |
| 6   | qualityInsights.\* 11 フィールドの正本化                            | `docs/30-workflows/unassigned-task/task-evals-spec-quality-insights-document-001.md`       |
| 7   | validator=0 件事実の正本追記                                        | `docs/30-workflows/unassigned-task/task-evals-spec-validator-zero-document-001.md`         |

---

## 5. 参照成果物一覧

| 成果物                               | パス                                                                                  | 関連条件          |
| ------------------------------------ | ------------------------------------------------------------------------------------- | ----------------- |
| consumer-audit-report.md             | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | AC6-COND-1        |
| evals-field-map.md                   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | AC6-COND-2        |
| dual-root-parity.md                  | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      | AC6-COND-4        |
| coverage-recheck.md                  | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/coverage-recheck.md`      | AC6-COND-1 補強   |
| schema-change-guide.md               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`   | AC6-COND-3        |
| spec-alignment-report.md             | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md` | AC-6 間接（AC-7） |
| final-review-log.md                  | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/final-review-log.md`     | 本判定の詳細ログ  |
| Phase 1 要件定義                     | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md`      | AC-1〜AC-8 原文   |
| TASK-EVALS-CONSUMER-AUDIT-001 指示書 | `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md`                  | AC-6 原文ソース   |

---

## 6. 判定の再現性（AC-8 からの補強）

本判定は以下の情報源から機械的に再現可能。

| 観点                 | 再現コマンド / 参照                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| consumer 漏れ 0 件   | `wc -l docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/unlisted-paths.txt`（0 行なら AC6-COND-1 pass）         |
| dual root bit 一致   | `for s in $(ls .claude/skills); do cmp -s ".claude/skills/$s/EVALS.json" ".agents/skills/$s/EVALS.json" && echo OK; done` |
| フィールド集合       | `rg -c '^\| \`' docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`（§3 行数と §4.1 総数 56）  |
| schema-change 3 操作 | `rg -n '^## (3\|4\|5)\. ' docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`              |

Phase 11 でこれらを第三者手動再実行し、本判定を再確認する運用（`phase-11/spec.md` 参照）。

---

## 7. 変更履歴

| Date       | 変更内容                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 2026-04-19 | 初版作成。AC6-COND-1〜4 を全件 pass と判定し、**AC-6 解除可能（PASS）** を確定。Phase 11 への進行可否 = 可（PASS）。 |
