# 用語統一監査レポート（Phase 8）

## メタ情報

| 項目      | 値                                     |
| --------- | -------------------------------------- |
| 成果物    | `outputs/phase-8/terminology-audit.md` |
| タスク ID | TASK-SKILL-LIFECYCLE-06                |
| Phase     | 8: リファクタリング                    |
| 作成日    | 2026-03-16                             |
| 対象範囲  | Phase 1-2 成果物 10 ファイル全て       |

---

## 1. 検索対象ファイル一覧

| #   | ファイルパス                                       | Phase |
| --- | -------------------------------------------------- | ----- |
| 1   | `outputs/phase-1/risk-level-classification.md`     | 1     |
| 2   | `outputs/phase-1/permission-state-flow.md`         | 1     |
| 3   | `outputs/phase-1/approval-history-policy.md`       | 1     |
| 4   | `outputs/phase-1/accountability-insertion-map.md`  | 1     |
| 5   | `outputs/phase-1/skill-safety-contract.md`         | 1     |
| 6   | `outputs/phase-2/risk-level-design.md`             | 2     |
| 7   | `outputs/phase-2/permission-persistence-design.md` | 2     |
| 8   | `outputs/phase-2/accountability-ui-design.md`      | 2     |
| 9   | `outputs/phase-2/abort-fallback-design.md`         | 2     |
| 10  | `outputs/phase-2/safety-gate-contract.md`          | 2     |

---

## 2. 廃止表記の検索結果

### 2-1. `dangerLevel` / `risk_level` / `riskClass` / `threatLevel`（正規表記: `riskLevel`）

| ファイル       | 検出内容 |
| -------------- | -------- |
| 全 10 ファイル | 検出なし |

全 10 ファイルにおいて `riskLevel`（キャメルケース）が一貫して使用されている。`dangerLevel`、`risk_level`（スネークケース）、`riskClass`、`threatLevel` はいずれも使用されていない。

### 2-2. `DangerLevel` / `RiskLevel`（型名） / `ThreatLevel`（正規表記: `ToolRiskLevel`）

| ファイル                                     | 検出内容                                                                                                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `outputs/phase-1/approval-history-policy.md` | `type RiskLevel = "critical" \| "high" \| "medium" \| "low"` — ローカル型エイリアスとして定義（後述の備考参照） |
| `outputs/phase-1/skill-safety-contract.md`   | `type ToolRiskLevel = "critical" \| "high" \| "medium" \| "low"` — 正規表記で定義                               |
| `outputs/phase-2/risk-level-design.md`       | `export type ToolRiskLevel = ...` — 正規表記で定義                                                              |
| `outputs/phase-2/safety-gate-contract.md`    | `ToolRiskLevel` — 正規表記で参照                                                                                |
| その他 6 ファイル                            | 検出なし（`riskLevel` フィールド名としての使用は問題なし）                                                      |

**備考**: `approval-history-policy.md`（Phase 1）の `type RiskLevel` は、同ファイル内のローカル型エイリアスとして定義されており、Phase 1 要件定義段階では `ToolRiskLevel` 型が `packages/shared` に未定義だったための暫定定義。Phase 2 で `ToolRiskLevel` に統一された。**廃止表記** `RiskLevel`（型名）として 1 件検出。ただし Phase 1 要件定義書内のローカル型エイリアスであり、実装コードに転記されるものではない。Phase 5 実装時に `ToolRiskLevel` を `import` することで自動解消される。

`DangerLevel`、`ThreatLevel` は検出なし。

検出件数: 1 件（`RiskLevel` ローカル型エイリアス、Phase 1 approval-history-policy.md）

### 2-3. `ToolEntry` / `AllowedEntry` / `PermissionEntry`（正規表記: `AllowedToolEntryV2`）

| ファイル       | 検出内容 |
| -------------- | -------- |
| 全 10 ファイル | 検出なし |

全ファイルで `AllowedToolEntry`（V1 既存型）および `AllowedToolEntryV2`（V2 拡張型）が正しく使用されている。`ToolEntry`、`AllowedEntry`、`PermissionEntry` はいずれも検出なし。

検出件数: 0 件

### 2-4. `SafetyGate`（単体使用） / `PublishGate` / `SecurityGate`（正規表記: `SafetyGatePort`）

| ファイル                                      | 検出内容                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| `outputs/phase-1/skill-safety-contract.md`    | `interface SafetyGatePort` — 正規表記で定義                                     |
| `outputs/phase-2/safety-gate-contract.md`     | `interface SafetyGatePort` / `export interface SafetyGatePort` — 正規表記で定義 |
| `outputs/phase-2/accountability-ui-design.md` | `SafetyGatePort.evaluate(skillName)` — 正規表記で参照                           |
| その他 7 ファイル                             | 検出なし                                                                        |

`SafetyGate`（単体使用、インターフェース名として）、`PublishGate`、`SecurityGate` は全ファイルで検出なし。

検出件数: 0 件

### 2-5. `approve_once` / `approveOnce` / `session_approval`（正規表記: `approved_once`）

| ファイル                                           | 検出内容                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `outputs/phase-2/permission-persistence-design.md` | 失効ポリシー表の「値」列に `approve_once` / `approve_temp` / `approve_week` / `approve_all` が記載されている（後述の備考参照） |
| その他 9 ファイル                                  | 検出なし（`approved_once` が正規表記として使用されている）                                                                     |

**備考**: `permission-persistence-design.md` セクション 3 の「失効ポリシー4種の定義」テーブルに `approve_once` / `approve_temp` / `approve_week` / `approve_all` が「値」列（内部識別子）として記載されている。これらは `AllowedToolEntryV2.expiryPolicy` の識別子値ではなく、ポリシー実装内部の値（旧設計の痕跡）として混在している。正式な `expiryPolicy` 識別子は `"session"` / `"time_24h"` / `"time_7d"` / `"permanent"` であり、`approve_once` 等はこのテーブル独自の非公式名称。実装上の混乱を防ぐため、Phase 5 実装時はテーブルの「値」列ではなく「ポリシー名（値）」列の正規識別子を使用すること。

`approveOnce`（キャメルケース）、`session_approval` は検出なし。

検出件数: 廃止表記 `approve_once` が 1 件（phase-2/permission-persistence-design.md 内、ポリシー表の内部値として）

### 2-6. `expiry_policy` / `expirationPolicy` / `expireMode`（正規表記: `expiryPolicy`）

| ファイル       | 検出内容 |
| -------------- | -------- |
| 全 10 ファイル | 検出なし |

全ファイルで `expiryPolicy`（キャメルケース）が一貫して使用されている。`expiry_policy`（スネークケース）、`expirationPolicy`、`expireMode` はいずれも検出なし。

検出件数: 0 件

### 2-7. `DANGEROUS_TOOL` / `CRITICAL_CHECK` / `RISK_BLOCK`（正規表記: `CRITICAL_TOOL_REQUIRED`）

| ファイル                                   | 検出内容                                          |
| ------------------------------------------ | ------------------------------------------------- |
| `outputs/phase-1/skill-safety-contract.md` | `"CRITICAL_TOOL_REQUIRED"` — 正規表記で定義       |
| `outputs/phase-2/safety-gate-contract.md`  | `"CRITICAL_TOOL_REQUIRED"` — 正規表記で定義・参照 |
| 他の参照ファイル                           | 正規表記で参照                                    |

`DANGEROUS_TOOL`、`CRITICAL_CHECK`、`RISK_BLOCK` は全ファイルで検出なし。なお `outputs/phase-2/safety-gate-contract.md` セクション 8-1 に `DANGEROUS_PATTERNS.PROTECTED_PATHS` という記述があるが、これは `CRITICAL_TOOL_REQUIRED` の廃止表記ではなく、`PROTECTED_PATHS` パターン集合名として使用されており、廃止対象外。

検出件数: 0 件

### 2-8. `SafetyStatus` / `PublishStatus` / `SecurityGrade`（正規表記: `SafetyGrade`）

| ファイル       | 検出内容 |
| -------------- | -------- |
| 全 10 ファイル | 検出なし |

全ファイルで `SafetyGrade`（型名）および `"SAFE"` / `"SAFE_WITH_WARNINGS"` / `"UNSAFE"`（値）が一貫して使用されている。`SafetyStatus`、`PublishStatus`、`SecurityGrade` はいずれも検出なし。

検出件数: 0 件

---

## 3. 最終確認結果

### 廃止表記の検出件数合計

| 廃止表記カテゴリ                                                  | 検出件数 | 検出箇所                                                     |
| ----------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `dangerLevel` / `risk_level` / `riskClass` / `threatLevel`        | 0 件     | なし                                                         |
| `DangerLevel` / `RiskLevel`（型名） / `ThreatLevel`               | 1 件     | phase-1/approval-history-policy.md（ローカル型エイリアス）   |
| `ToolEntry` / `AllowedEntry` / `PermissionEntry`                  | 0 件     | なし                                                         |
| `SafetyGate`（単体） / `PublishGate` / `SecurityGate`             | 0 件     | なし                                                         |
| `approve_once`（識別子混在） / `approveOnce` / `session_approval` | 1 件     | phase-2/permission-persistence-design.md（ポリシー表内部値） |
| `expiry_policy` / `expirationPolicy` / `expireMode`               | 0 件     | なし                                                         |
| `DANGEROUS_TOOL` / `CRITICAL_CHECK` / `RISK_BLOCK`                | 0 件     | なし                                                         |
| `SafetyStatus` / `PublishStatus` / `SecurityGrade`                | 0 件     | なし                                                         |
| **合計**                                                          | **2 件** |                                                              |

---

## 4. 結論

Phase 1-2 の 10 ファイルは全体として正規表記で記述されており、廃止表記の混入はほぼゼロの状態。

**検出された 2 件は、いずれも意図的な段階的設計の痕跡であり、実装コードへの転記時に自動解消される性質のもの:**

1. **`RiskLevel`（型名） in approval-history-policy.md**: Phase 1 要件定義書内のローカル型エイリアス。Phase 5 実装時に `ToolRiskLevel` を `packages/shared` から `import` することで解消される。設計文書の修正は不要（Phase 1 は要件定義であり、型の完全一致よりも概念の明確化を優先する段階）。

2. **`approve_once` 等 in permission-persistence-design.md**: 失効ポリシー表の「値」列に使用された非公式識別子。正規の `expiryPolicy` 識別子（`"session"` / `"time_24h"` / `"time_7d"` / `"permanent"`）と混在しているため、実装時に混乱しないよう Phase 5 の実装担当者への注意喚起として本レポートに記録する。設計文書の修正は任意（明確化のためにセクション 3 の「値」列を削除または注釈を付与することを推奨）。

**置換が絶対必要な廃止表記: なし。**
