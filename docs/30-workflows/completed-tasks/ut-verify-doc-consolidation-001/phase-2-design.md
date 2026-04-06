# Phase 2: 設計 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

役割ラベルの統一形式・挿入位置・責務分離セクションの構成を設計し、Phase 5 の実装に向けた変更計画を確定する。

## 背景

Phase 1 の調査結果を基に、4ファイルへの変更内容と責務分離セクションの配置を設計する。既存の `> 役割:` 記述との整合性を保ちながら、追記形式を決定する。

---

## SubAgent分担（並列実行）

Phase 2 は成果物が独立しているため、以下を並列で進め、最後に統合して矛盾がないことを確認する。

| SubAgent              | 関心ごと                 | 担当成果物                                 |
| --------------------- | ------------------------ | ------------------------------------------ |
| SubAgent-DESIGN-Label | 役割ラベル形式・挿入位置 | `outputs/phase-2/label-design.md`          |
| SubAgent-DESIGN-Resp  | 責務分離比較表・記述方針 | `outputs/phase-2/responsibility-design.md` |
| SubAgent-DESIGN-Plan  | 変更対象の網羅と順序     | `outputs/phase-2/change-plan.md`           |

## 実行タスク

### タスク1: 役割ラベル形式の設計

**目的**: 4ファイルに統一形式で追記する `> 区分:` ラベルの仕様を確定する

**実行手順**:

1. 既存の `> 役割:` 記述（`task-workflow-active.md`・`task-workflow-completed.md` の冒頭）の形式を確認する
2. 以下の追記仕様を設計する

**追記仕様（設計案）**:

| ファイル                              | 追記位置                           | 追記内容                                               |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `task-workflow-completed.md`          | `> 役割: completed records` の直後 | `> 区分: 履歴記録（history record）`                   |
| `task-workflow-active.md`             | `> 役割: active guide` の直後      | `> 区分: 正本（current contract）`                     |
| `interfaces-skill-verify-contract.md` | 概要セクション冒頭                 | `> 区分: 契約仕様（current contract / Check ID 体系）` |
| `task-workflow.md`                    | インデックステーブル               | 「区分」列を追加                                       |

3. `task-workflow.md` インデックステーブルの「区分」列の値を設計する

**インデックステーブル区分列設計（設計案）**:

| ファイル                              | 区分値   |
| ------------------------------------- | -------- |
| `task-workflow-active.md`             | 正本     |
| `task-workflow-completed.md`          | 履歴     |
| `task-workflow-completed-*.md`        | 履歴     |
| `interfaces-skill-verify-contract.md` | 契約仕様 |

**期待される成果物**:

- ラベル形式設計書（`outputs/phase-2/label-design.md`）

---

### タスク2: 責務分離セクションの構成設計

**目的**: 3関数比較表の内容・配置ファイル・追記位置を確定する

**実行手順**:

1. `RuntimeSkillCreatorFacade.ts`（294行目・352行目）のシグネチャを元に比較表の内容を確定する
2. 以下の比較表を設計する

**責務分離比較表（設計案）**:

| 関数名                   | 実装ファイル                        | 責務                                                      | 返却値                                      |
| ------------------------ | ----------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `verifySkill()`          | `RuntimeSkillCreatorFacade.ts`      | `verificationEngine.verify()` を呼び出し Check 配列を返す | `RuntimeSkillCreatorVerifyCheck[]`          |
| `verifyAndImproveLoop()` | `RuntimeSkillCreatorFacade.ts`      | 検証結果の severity に基づく improve ループ制御           | `RuntimeSkillCreatorVerifyAndImproveResult` |
| `verify()`               | `SkillCreatorVerificationEngine.ts` | 19 件の Check を 4 Layer で実行し結果を収集する           | `RuntimeSkillCreatorVerifyCheck[]`          |

3. 追記先ファイルと追記セクション位置を決定する（追記先は `interfaces-skill-verify-contract.md` に固定する）

**期待される成果物**:

- 責務分離セクション設計書（`outputs/phase-2/responsibility-design.md`）

---

### タスク3: 変更計画の作成

**目的**: Phase 5 で実施する変更の全体一覧を作成し、変更漏れを防ぐ

**実行手順**:

1. 変更対象ファイル・変更内容・変更箇所の一覧を作成する
2. 変更順序（依存関係）を決定する
3. リスクと影響範囲を整理する（特に既存リンクへの影響）

**期待される成果物**:

- 変更計画書（`outputs/phase-2/change-plan.md`）

---

## 参照資料

| 参照資料               | パス                                                                                    | 内容               |
| ---------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 調査結果       | `outputs/phase-1/investigation-report.md`                                               | 現状構造の調査結果 |
| task-workflow 親仕様書 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | インデックス構造   |
| verify 契約仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | Check ID 19件      |

---

## 成果物

| 成果物           | パス                                       | 内容                     |
| ---------------- | ------------------------------------------ | ------------------------ |
| ラベル形式設計書 | `outputs/phase-2/label-design.md`          | 追記形式・挿入位置の設計 |
| 責務分離設計書   | `outputs/phase-2/responsibility-design.md` | 3関数比較表の設計        |
| 変更計画書       | `outputs/phase-2/change-plan.md`           | 変更対象・変更内容の一覧 |

---

## 完了条件

- [ ] 役割ラベルの追記形式（`> 区分:` の値）が4ファイル分確定している
- [ ] `task-workflow.md` インデックスへの「区分」列追加仕様が確定している
- [ ] 責務分離セクションの配置先ファイルと追記位置が決定している
- [ ] 変更計画書に全変更対象が網羅されている
- [ ] `outputs/phase-2/` に成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-3-design-review.md`
