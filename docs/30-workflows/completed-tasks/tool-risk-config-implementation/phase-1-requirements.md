# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| タスクID   | UT-06-001                       |
| 前提Phase  | -                               |
| 後続Phase  | Phase 2                         |
| ステータス | 未実施                          |
| 作成日     | 2026-03-16                      |
| 機能名     | tool-risk-config-implementation |

---

## 目的

Issue #1251 の受入基準と TASK-SKILL-LIFECYCLE-06 Phase 4/5 の設計成果物を統合し、`TOOL_RISK_CONFIG` 定数の実装要件を確定する。プロトタイプ（4段階: critical/high/medium/low）と Issue 受入基準（3段階: low/medium/high）の差分を解決し、最終的な型定義・値・制約を要件として固定する。

## 背景

TASK-SKILL-LIFECYCLE-06 で Trust & Permission Governance の仕様策定が完了し、Phase 5 プロトタイプとして `ToolRiskLevel` 型と `TOOL_RISK_CONFIG` 定数が設計された。しかし、Issue #1251 の受入基準では3段階（`"low" | "medium" | "high"`）の `RiskLevel` が要求されており、プロトタイプの4段階（`"critical" | "high" | "medium" | "low"`）との差分がある。本 Phase で要件を確定する。

---

## 実行タスク

### タスク1: Issue #1251 受入基準の分析

**目的**: Issue #1251 で明示された12項目の受入基準を一覧化し、各項目の検証可能性を確認する。

**実行手順**:

1. Issue #1251 の受入基準12項目をチェックリスト形式で転記する
2. 各項目に検証方法（自動テスト / ビルド確認 / 目視確認）を割り当てる
3. 検証不可能な項目がある場合は修正案を記録する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`（受入基準一覧と検証方法）

---

### タスク2: プロトタイプと受入基準の差分分析

**目的**: Phase 5 プロトタイプ（4段階）と Issue 受入基準（3段階）の差分を明確にし、どちらに従うかを決定する。

**実行手順**:

1. Phase 5 プロトタイプの `ToolRiskLevel` 型（4段階: critical/high/medium/low）を確認する
   - 参照: `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/security.ts`
2. Issue #1251 の `RiskLevel` 型（3段階: low/medium/high）を確認する
3. 差分を表形式で整理する:
   - フィールド名の差異: `ToolRiskConfig` vs `ToolRiskConfigEntry`
   - レベル数の差異: 4段階 vs 3段階
   - フィールドの差異: `allowApproveOnce`/`autoDenyDefault` の有無、`allowTime24h`/`allowTime7d` の有無
4. Phase 4 デシジョンテーブルの失効ポリシーマトリクスを参照し、`allowTime24h`/`allowTime7d` フィールドの妥当性を評価する
   - 参照: `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md`
5. 最終判断: Issue #1251 の受入基準をベースとし、プロトタイプの設計意図を維持する統合方針を決定する

**期待される成果物**:

- `outputs/phase-1/gap-analysis.md`（差分分析と統合方針）

---

### タスク3: 要件確定と Inventory 固定

**目的**: 最終的な要件を確定し、実装対象の全ファイル（Inventory）を固定する。

**実行手順**:

1. 確定する型定義:
   - `RiskLevel` = `"low" | "medium" | "high"`（Issue 準拠、3段階）
   - `ToolRiskConfigEntry` interface（各フィールドの型と制約）
   - `TOOL_RISK_CONFIG: Record<RiskLevel, ToolRiskConfigEntry>`

2. 各リスクレベルの確定値:

   | フィールド       | low          | medium          | high          |
   | ---------------- | ------------ | --------------- | ------------- |
   | dialogWidth      | 400          | 480             | 640           |
   | headerColorToken | `--risk-low` | `--risk-medium` | `--risk-high` |
   | allowPermanent   | true         | true            | false         |
   | allowTime24h     | true         | true            | false         |
   | allowTime7d      | true         | true            | false         |

3. セキュリティ不変条件:
   - `TOOL_RISK_CONFIG.high.allowPermanent === false`
   - `TOOL_RISK_CONFIG.high.allowTime24h === false`
   - `TOOL_RISK_CONFIG.high.allowTime7d === false`

4. Inventory（変更対象ファイル）:
   - 更新: `packages/shared/src/constants/security.ts`
   - 新規: `packages/shared/src/constants/security.test.ts`
   - 条件付き更新: `packages/shared/src/constants/index.ts`（re-export が個別指定方式の場合のみ追加）

5. エクスポート要件:
   - `RiskLevel` 型を export
   - `ToolRiskConfigEntry` interface を export
   - `TOOL_RISK_CONFIG` 定数を export
   - 後続タスク UT-06-004 が import して使用可能であること

**期待される成果物**:

- `outputs/phase-1/requirements-spec.md`（確定要件仕様）

---

## 参照資料

| 参照資料                   | パス                                                                                                                                                  | 内容                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 5 プロトタイプ       | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/security.ts`                                       | 型定義・定数のプロトタイプ            |
| Phase 4 デシジョンテーブル | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md`                 | リスクレベル×権限の意思決定マトリクス |
| タスク指示書               | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/unassigned-task/task-ut-06-001-tool-risk-config-implementation.md` | 詳細な実装要件                        |
| 現行 security.ts           | `packages/shared/src/constants/security.ts`                                                                                                           | 既存のセキュリティ定数（323行）       |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                            | 内容                                                                 |
| ---------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`      | セキュリティ設計原則（最小権限・フェイルセキュア）                   |
| セキュリティ実装       | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`  | セキュリティ実装パターンの正本                                       |
| スキル実行セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 既存の ALLOWED_TOOLS_WHITELIST・ToolRiskLevel(4段階)定義との差分確認 |
| インターフェース定義   | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`          | 共有型定義（Result型・RiskLevel型）の設計方針                        |
| タスク台帳             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 残課題・完了タスク記録                                               |

---

## 実行手順

### ステップ1: Issue 受入基準の収集と分析

1. Issue #1251 を開き、受入基準12項目を転記する
2. 各項目に検証方法（自動テスト / ビルド確認 / 目視確認）を割り当てる
3. 検証不可能な項目がある場合は修正案を記録する
4. 成果物: `outputs/phase-1/acceptance-criteria.md`

### ステップ2: プロトタイプ差分分析と統合方針決定

1. Phase 5 プロトタイプ（4段階）の `ToolRiskLevel` 型を確認する
2. Issue #1251 の `RiskLevel` 型（3段階）との差分を表形式で整理する
3. Phase 4 デシジョンテーブルを参照し、`allowTime24h`/`allowTime7d` フィールドの妥当性を評価する
4. 統合方針（Issue 側をベースとし、プロトタイプの設計意図を維持）を決定する
5. 成果物: `outputs/phase-1/gap-analysis.md`

### ステップ3: 要件確定と Inventory 固定

1. `RiskLevel` 型（3段階）、`ToolRiskConfigEntry` interface、`TOOL_RISK_CONFIG` 定数の確定値を記録する
2. セキュリティ不変条件を定義する
3. 変更対象ファイル（Inventory）を固定する: `packages/shared/src/constants/security.ts`（更新）、`packages/shared/src/constants/security.test.ts`（新規）
4. エクスポート要件を記録する
5. 成果物: `outputs/phase-1/requirements-spec.md`

---

## 統合テスト連携

後続タスク（UT-06-004: PermissionDialog コンポーネント実装）が `TOOL_RISK_CONFIG` を import して使用するため、以下の要件を明記する:

- `RiskLevel` 型が `@repo/shared` パッケージから import 可能であること
- `ToolRiskConfigEntry` interface が `@repo/shared` パッケージから import 可能であること
- `TOOL_RISK_CONFIG` 定数が `@repo/shared` パッケージから import 可能であること

---

## 成果物

| 成果物           | パス                                     | 内容                         |
| ---------------- | ---------------------------------------- | ---------------------------- |
| 受入基準一覧     | `outputs/phase-1/acceptance-criteria.md` | 12項目の受入基準と検証方法   |
| 差分分析レポート | `outputs/phase-1/gap-analysis.md`        | プロトタイプ vs Issue の差分 |
| 確定要件仕様     | `outputs/phase-1/requirements-spec.md`   | 最終的な型定義・値・制約     |

---

## 完了条件

- [ ] Issue #1251 の受入基準12項目が全て一覧化され、検証方法が割り当てられている
- [ ] プロトタイプ（4段階）と Issue（3段階）の差分が表形式で整理されている
- [ ] 最終的な `RiskLevel` 型が3段階（low/medium/high）で確定している
- [ ] `ToolRiskConfigEntry` interface の全フィールドが確定している
- [ ] 各リスクレベルの確定値（dialogWidth, headerColorToken, allowPermanent, allowTime24h, allowTime7d）が表形式で固定されている
- [ ] セキュリティ不変条件が明示的に定義されている
- [ ] Inventory（変更対象ファイル2件）が固定されている
- [ ] 後続タスク（UT-06-004）へのエクスポート要件が明記されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（3ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-2-design.md`
