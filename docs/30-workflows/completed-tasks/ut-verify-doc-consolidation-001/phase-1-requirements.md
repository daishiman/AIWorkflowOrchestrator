# Phase 1: 要件定義 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| 前提Phase  | なし                            |
| 後続Phase  | Phase 2                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

対象4ファイルの現状構造を調査し、改善が必要な箇所を特定して受け入れ基準を確定する。

## 背景

TASK-P0-01 Phase 12 で指摘された verify ドキュメントの構造的課題（正本・履歴の判別困難、責務分離の未明示）を解消する要件を定義する。

## 多角的分析観点（30思考法）

Phase 1 では、skill 準拠の差分抽出と改善余地の発見を別 lane で進めるため、次の 30 思考法を使う。

- 論理分析系: 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考
- 構造分解系: 要素分解、MECE、2軸思考、プロセス思考
- メタ・抽象系: メタ思考、抽象化思考、ダブル・ループ思考
- 発想・拡張系: ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考
- システム系: システム思考、因果関係分析、因果ループ
- 戦略・価値系: トレードオン思考、プラスサム思考、価値提案思考、戦略的思考
- 問題解決系: why思考、改善思考、仮説思考、論点思考、KJ法

## SubAgent分担

| SubAgent            | 関心ごと               | 担当成果物                                |
| ------------------- | ---------------------- | ----------------------------------------- |
| SubAgent-REQ-VERIFY | skill準拠検証          | `outputs/phase-1/investigation-report.md` |
| SubAgent-REQ-THINK  | 30思考法による多角分析 | `outputs/phase-1/requirements-report.md`  |

共通参照の収集後、VERIFY と THINK を並列に進め、要件確定時に結果を統合する。

## 実行タスク

### タスク1: 対象ファイルの現状調査

**目的**: 対象4ファイルの冒頭・インデックス構造を確認し、改善が必要な箇所を特定する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` を読み、インデックステーブルの列構成（「役割」列があるか「区分」列はないか）を確認する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` の冒頭5行を確認し、`> 役割: completed records` の記述形式を把握する
3. `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md` の冒頭5行を確認し、`> 役割: active guide` の記述形式を把握する
4. `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` の概要セクションを確認し、current contract としての明示有無を確認する
5. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の294行目（`verifySkill`）と352行目（`verifyAndImproveLoop`）のシグネチャを確認する
6. `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` の `verify()` メソッドのシグネチャを確認する

**期待される成果物**:

- 調査結果メモ（`outputs/phase-1/investigation-report.md`）

---

### タスク2: 要件確定

**目的**: 機能要件・受け入れ基準を定義する

**実行手順**:

1. 調査結果を基に、以下の機能要件を確認・確定する

**機能要件（FR）**:

| FR ID  | 要件                                                                                            | 優先度 |
| ------ | ----------------------------------------------------------------------------------------------- | ------ |
| FR-001 | `task-workflow.md` インデックステーブルに「区分」列（正本/履歴/契約仕様）を追加                 | must   |
| FR-002 | `task-workflow-completed.md` 冒頭に `> 区分: 履歴記録（history record）` を追記                 | must   |
| FR-003 | `task-workflow-active.md` 冒頭に `> 区分: 正本（current contract）` を追記                      | must   |
| FR-004 | `interfaces-skill-verify-contract.md` 冒頭に `> 区分: 契約仕様（current contract）` を追記      | must   |
| FR-005 | verify エンジン責務分離セクション（3関数比較表）を `interfaces-skill-verify-contract.md` に追記 | must   |

**非機能要件（NFR）**:

| NFR ID  | 要件                                               | 優先度 |
| ------- | -------------------------------------------------- | ------ |
| NFR-001 | 新規ファイルを作成しない（既存ファイルの改善のみ） | must   |
| NFR-002 | 既存のリンク参照を破損しない                       | must   |
| NFR-003 | Prettier フォーマットに準拠する                    | must   |
| NFR-004 | Check ID 体系（19件）に影響を与えない              | must   |

2. 受け入れ基準（AC）を確定する

**受け入れ基準（AC）**:

| AC ID  | 基準                                                                                      | 検証方法 |
| ------ | ----------------------------------------------------------------------------------------- | -------- |
| AC-001 | `task-workflow.md` インデックスに「区分」列が存在する                                     | 目視確認 |
| AC-002 | `task-workflow-completed.md` に「履歴記録」ラベルが含まれる                               | 目視確認 |
| AC-003 | `task-workflow-active.md` に「正本」ラベルが含まれる                                      | 目視確認 |
| AC-004 | `interfaces-skill-verify-contract.md` に「契約仕様」ラベルが含まれる                      | 目視確認 |
| AC-005 | 責務分離比較表に `verifySkill()` / `verifyAndImproveLoop()` / `verify()` が記載されている | 目視確認 |
| AC-006 | 全リンクが有効なファイルを指している                                                      | パス確認 |

**期待される成果物**:

- 要件確定レポート（`outputs/phase-1/requirements-report.md`）

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------- |
| verify 契約仕様           | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`     | Check ID 19件の定義 |
| task-workflow 親仕様書    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | インデックス構造    |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                       | verifySkill 294行目 |
| TASK-P0-01 成果物         | `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/` | 問題発見元          |

---

## 成果物

| 成果物           | パス                                      | 内容               |
| ---------------- | ----------------------------------------- | ------------------ |
| 調査結果レポート | `outputs/phase-1/investigation-report.md` | 現状構造の調査結果 |
| 要件確定レポート | `outputs/phase-1/requirements-report.md`  | FR/NFR/AC 一覧     |

---

## 完了条件

- [ ] 対象4ファイルの現状構造を確認済み
- [ ] `RuntimeSkillCreatorFacade.ts` の `verifySkill()`/`verifyAndImproveLoop()` シグネチャを確認済み
- [ ] `SkillCreatorVerificationEngine.ts` の `verify()` シグネチャを確認済み
- [ ] FR-001〜FR-005 が確定している
- [ ] AC-001〜AC-006 が確定している
- [ ] `outputs/phase-1/` に成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-2-design.md`
