# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目         | 内容                                                                                                                                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase        | 12                                                                                                                                                                                                                                                          |
| Phase名      | ドキュメント                                                                                                                                                                                                                                                |
| タスクID     | UT-06-001                                                                                                                                                                                                                                                   |
| 前提Phase    | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー）、Phase 4（テスト作成）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase    | Phase 13（PR作成）                                                                                                                                                                                                                                          |
| ステータス   | 未実施                                                                                                                                                                                                                                                      |
| 作成日       | 2026-03-16                                                                                                                                                                                                                                                  |
| 機能名       | tool-risk-config-implementation                                                                                                                                                                                                                             |
| GitHub Issue | #1251                                                                                                                                                                                                                                                       |

---

## 目的

`TOOL_RISK_CONFIG` 定数の実装内容をシステム仕様書・タスク台帳・変更履歴へ同期し、後続タスク（TASK-SKILL-LIFECYCLE-08・UT-06-004）の実装者が正確な仕様を参照できる状態にする。

---

## 背景

Phase 11（手動テスト）で全 TC が PASS し、`@repo/shared` への定数追加が正常に機能することが確認されている。本 Phase では実装事実をシステム仕様書へ同期し、後続タスクが正確な仕様を参照できる状態にする。

---

## docs-only モードフラグ

本タスクは docs-only タスク（定数追加のみ、UI変更なし）に該当する。

| 項目                        | 通常タスク         | docs-only タスク（本タスク）           |
| --------------------------- | ------------------ | -------------------------------------- |
| Step 1-D 検証コマンド       | 実行して結果記録   | **計画記録のみ**（実行対象コードなし） |
| implementation-guide Part 2 | 実装詳細・コード例 | 型定義・配置ルール・使用例             |
| Step 1-B 実装状況           | `completed`        | `completed`（定数は実装済み）          |

---

## Phase 10 MINOR 追跡テーブル

Phase 10 で MINOR 判定された指摘がある場合、Phase 12 で追跡結果を記録する。

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | -------- | ------------- | ------------- | -------- | ---------- |
| -        | -        | -             | -             | -        | -          |

- Phase 10 MINOR は全て未タスク仕様書に変換するか、Phase 12 内で解決する（省略不可）
- `documentation-changelog.md` に追跡結果を記録する

---

## 実行タスク

### Task 1: 実装ガイド作成

**目的**: 実装内容を中学生レベル（Part 1）と開発者向け技術詳細（Part 2）の2部構成で記録する。

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` を新規作成する
2. **Part 1（中学生レベル概念説明）** を次の観点で記述する:
   - 日常例え: 「ツールの危険度ランク」を、映画の年齢制限（G/PG-13/R）のように、リスクが高いほど使える機能が制限される仕組みとして説明する
   - `low`（低リスク）: 読み取り専用操作（Glob, Grep, Read）、すべての許可オプションが使える
   - `medium`（中リスク）: ファイル書き込み操作（Write, Edit）、すべての許可オプションが使える
   - `high`（高リスク）: システム操作（Bash, 外部コマンド実行）、恒久許可・時間制限許可は禁止
3. **Part 2（開発者向け技術詳細）** を次の観点で記述する:
   - `RiskLevel` 型: `"low" | "medium" | "high"` のユニオン型
   - `ToolRiskConfigEntry` interface: 5フィールドの定義と制約
   - `TOOL_RISK_CONFIG` 定数: `Record<RiskLevel, ToolRiskConfigEntry>` 型の全3エントリの値
   - 配置ファイル: `packages/shared/src/constants/security.ts`（`ALLOWED_TOOLS_WHITELIST` 定数の直後）
   - エクスポートパス: `@repo/shared` からの named export
   - セキュリティ不変条件: `high.allowPermanent === false`・`high.allowTime24h === false`・`high.allowTime7d === false`

**成果物**: `outputs/phase-12/implementation-guide.md`

---

### Task 2: システム仕様書更新

**目的**: 実装事実をシステム仕様書（aiworkflow-requirements）に反映する。

> **警告**: P1/P25/P43 対策として、全ステップ完了前に「完了」と記載しない。実際の更新後に changelog を記録する。

#### Step 1-A: タスク完了記録（2ファイル必須）

**更新対象ファイル1**: `.claude/skills/aiworkflow-requirements/LOGS.md`

追記内容:

- 日付: 2026-03-16
- タスクID: UT-06-001
- 内容: `packages/shared/src/constants/security.ts` に `RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG` を実装完了

**更新対象ファイル2**: `.claude/skills/task-specification-creator/LOGS.md`

追記内容（LOGS.md と同一）:

- 日付: 2026-03-16
- タスクID: UT-06-001
- 内容: tool-risk-config-implementation 仕様書一式（Phase 1-13）作成完了

**完了確認**: 2ファイルの両方に追記されていることを `grep -n "UT-06-001"` で確認する

---

#### Step 1-B: 実装状況更新（任意）

`.claude/skills/aiworkflow-requirements/references/security-implementation.md` に以下を追記する:

- セクション「Tool Risk Configuration」として `TOOL_RISK_CONFIG` 定数の実装状況を記録する
- 記録内容:
  - タスクID: UT-06-001
  - 実装ファイル: `packages/shared/src/constants/security.ts`
  - エクスポート: `@repo/shared` からの named export（`RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG`）
  - ステータス: 実装完了（2026-03-16）
  - 後続タスク: TASK-SKILL-LIFECYCLE-08（PermissionDialog UI）・UT-06-004（UI実装）

---

#### Step 1-C: 関連タスク更新

次のコマンドで UT-06-001 を参照する仕様書を検索する:

```bash
grep -rn "UT-06-001" .claude/skills/aiworkflow-requirements/references/
```

検索で発見した仕様書に、本タスク完了記録を追記する。

---

#### Step 1-D: topic-map.md 再生成

Step 1-B で `security-implementation.md` を更新した場合は、次のコマンドで `topic-map.md` を再生成する（P2対策）:

```bash
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
```

実行後、`indexes/topic-map.md` の更新日時が変わっていることを確認する。

---

#### Step 2: システム仕様更新（条件付き）

`TOOL_RISK_CONFIG` は新規インターフェース追加に該当するため、以下の仕様書を確認し、必要な場合のみ更新する:

| 確認対象仕様書             | パス                                                                           | 更新条件                                        |
| -------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| security-implementation.md | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | `TOOL_RISK_CONFIG` セクションがない場合は追加   |
| security-principles.md     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`     | リスクレベル定義の言及がない場合は追記          |
| interfaces-core.md         | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`         | 共有型定義のセクションに `RiskLevel` がない場合 |

---

### Task 3: documentation-changelog.md 作成

**目的**: 本 Phase で更新した全仕様書の変更内容を記録する。

**実行手順**:

1. Step 1-A〜Step 2 の全更新を実施した後に `outputs/phase-12/documentation-changelog.md` を作成する（P4対策）
2. 各 Step の更新結果を次の形式で記録する:

   ```markdown
   ## UT-06-001 documentation-changelog

   ### Step 1-A

   - aiworkflow-requirements/LOGS.md: UT-06-001 完了記録を追記（✅ 実施済み）
   - task-specification-creator/LOGS.md: UT-06-001 完了記録を追記（✅ 実施済み）

   ### Step 1-B

   - security-implementation.md: Tool Risk Configuration セクション追記（✅ 実施済み / - 対象外）

   ### Step 1-C

   - 検索結果: [発見したファイルと更新内容を記録]

   ### Step 1-D

   - topic-map.md 再生成: （✅ 実施済み / - 対象外）

   ### Step 2

   - [更新した仕様書の名前と更新内容]
   ```

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出

**目的**: 本実装で発見した残課題を formalize する（0件でも出力必須）。

**実行手順**:

1. Phase 1〜11 の成果物を確認し、未解決の問題・改善余地を列挙する
2. 検出した未タスクが1件以上ある場合は、以下の3ステップを全て実施する（P3対策）:
   - ステップ①: `docs/30-workflows/tool-risk-config-implementation/unassigned-task/` に独立した指示書ファイルを作成する
   - ステップ②: `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
   - ステップ③: 関連仕様書に参照リンクを追加する
3. 検出件数（0件含む）を `outputs/phase-12/unassigned-task-detection.md` に記録する
4. 再評価クローズした未タスクがある場合は `gh issue close <number>` で GitHub Issue を同時に Close する（P56対策）

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

---

### Task 5: スキルフィードバックレポート作成

**目的**: 本タスクで発見したスキル・ワークフロー改善観点を記録する（0件でも出力必須）。

**実行手順**:

1. Phase 1〜11 を通じて発見したスキル改善観点を列挙する
2. 改善観点がある場合は `skill-creator` または `aiworkflow-requirements` スキルへの具体的な改善案を記録する
3. 改善観点がない場合は「改善点なし」として理由を明記する（P28対策）
4. `outputs/phase-12/skill-feedback-report.md` に記録する

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

## 参照資料

| 参照資料                 | パス                                             | 内容                                   |
| ------------------------ | ------------------------------------------------ | -------------------------------------- |
| Phase 1（要件定義）      | `phase-1-requirements.md`                        | 依存する前提成果物を確認する           |
| Phase 2（設計）          | `phase-2-design.md`                              | 型定義・定数値・配置位置を確認する     |
| Phase 5（実装）          | `phase-5-implementation.md`                      | 実装内容と変更点を確認する             |
| Phase 9（品質検証）      | `phase-9-quality-assurance.md`                   | Lint・型チェック・テスト結果を確認する |
| Phase 10（最終レビュー） | `phase-10-final-review.md`                       | 最終判定と指摘事項を確認する           |
| Phase 11（手動テスト）   | `phase-11-manual-test.md`                        | 手動確認結果を確認する                 |
| security.ts              | `packages/shared/src/constants/security.ts`      | 実装済みの型・定数を確認する           |
| security.test.ts         | `packages/shared/src/constants/security.test.ts` | テスト内容を確認する                   |

### システム仕様（aiworkflow-requirements）

> 以下の正本仕様との整合を確認してからシステム仕様書を更新する。

| 参照資料                | パス                                                                           | 内容                                   |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| security-implementation | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ実装の正本（主要更新対象） |
| security-principles     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`     | セキュリティ設計原則                   |
| interfaces-core         | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`         | 共有型定義の設計方針                   |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | タスク台帳（残課題・完了記録）         |

---

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1〜11 の成果物と system spec（security-implementation.md、security-principles.md）を読み、実装の全体像を把握する。

### ステップ2: Task 1〜5 を上から順に実施する

Task の順序を崩さず実施する。特に Task 3（documentation-changelog）は Task 2 の全 Step 完了後に記録する（P4対策）。

### ステップ3: システム仕様との整合を確認する

更新した仕様書が aiworkflow-requirements の既存設計と矛盾していないことを確認する。

### ステップ4: 成果物と完了条件を確認する

全 Task の成果物が生成されていることを確認し、完了条件チェックリストをチェックする。

---

## 成果物

| 成果物                   | パス                                                     | 内容                                         |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1（概念説明）と Part 2（技術詳細）      |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の更新結果を記録する         |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | 全 Step の更新結果を記録する                 |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 残件と検出件数（0件含む）を記録する          |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | スキル改善観点（0件でも出力）を記録する      |
| タスク仕様準拠チェック   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の準拠チェック結果を記録する |

---

## 完了条件

- [ ] Task 1: `outputs/phase-12/implementation-guide.md` が生成され、Part 1（日常例えあり）・Part 2（技術詳細）の2部構成で記述されている
- [ ] Task 2 Step 1-A: `aiworkflow-requirements/LOGS.md` に UT-06-001 完了記録が追記されている
- [ ] Task 2 Step 1-A: `task-specification-creator/LOGS.md` に UT-06-001 完了記録が追記されている（2ファイル必須）
- [ ] Task 2 Step 1-B: `security-implementation.md` に `TOOL_RISK_CONFIG` 実装状況が記録されている
- [ ] Task 2 Step 1-C: `grep -rn "UT-06-001"` で検索した結果が記録されている
- [ ] Task 2 Step 1-D: `topic-map.md` が再生成されている（更新があった場合）
- [ ] Task 3: `outputs/phase-12/documentation-changelog.md` が生成され、全 Step の実施結果が記録されている
- [ ] Task 4: `outputs/phase-12/unassigned-task-detection.md` が生成されている（0件でも必須）
- [ ] Task 5: `outputs/phase-12/skill-feedback-report.md` が生成されている（0件でも必須）
- [ ] `outputs/phase-12/system-spec-update-summary.md` が生成されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 1〜5）を上から順に実行する
- [ ] `documentation-changelog.md` は全 Task 完了後の最終ステップとして記録する（P4対策）
- [ ] `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認し、changelog の記録と一致していることを検証する（P51対策）
- [ ] LOGS.md の更新が2ファイル両方に行われていることを確認する（P1/P25対策）

---

## 依存関係

- **前提**: Phase 10（最終レビュー）が PASS 判定で完了していること
- **前提**: Phase 11（手動テスト）の全TC（TC-11-01〜TC-11-05）が PASS していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-13-pr-creation.md`
