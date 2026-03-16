# AC 整合確認レポート（Phase 8）

## メタ情報

| 項目      | 値                                        |
| --------- | ----------------------------------------- |
| 成果物    | `outputs/phase-8/ac-gap-report.md`        |
| タスク ID | TASK-SKILL-LIFECYCLE-06                   |
| Phase     | 8: リファクタリング                       |
| 作成日    | 2026-03-16                                |
| 対象範囲  | AC-1〜AC-4 × Phase 1-2 成果物 10 ファイル |

---

## 1. 整合確認テーブル（6項目）

| #   | AC   | Phase 1 要件概要                                                                             | Phase 2 設計対応箇所                                                                           | 判定 | 根拠 |
| --- | ---- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---- | ---- |
| 1   | AC-1 | risk-level-classification.md の4段階定義（critical / high / medium / low）、autoDeny 挙動    | risk-level-design.md の `TOOL_RISK_CONFIG` 型（`autoDenyDefault` フィールド）                  | OK   | 後述 |
| 2   | AC-1 | リスクレベル別デフォルト権限状態（全レベル `denied`）、PermissionDialog 表示・非表示条件     | risk-level-design.md の `allowApproveOnce` / `allowPermanent` / `autoDenyDefault` 設計         | OK   | 後述 |
| 3   | AC-2 | approval-history-policy.md の履歴エントリ（8フィールド、`ApprovalHistoryEntry`）             | permission-persistence-design.md の `AllowedToolEntryV2` 拡張・取り消しフロー                  | OK   | 後述 |
| 4   | AC-2 | 取り消し条件（`approved` 状態のみ対象、`revoked` への遷移）                                  | permission-persistence-design.md の取り消し UI フロー（セクション 5.2）                        | OK   | 後述 |
| 5   | AC-3 | accountability-insertion-map.md の INS-01〜INS-03 挿入点・表示条件                           | accountability-ui-design.md のワイヤーフレーム・`computeINS01State` / `computeINS03State` 関数 | OK   | 後述 |
| 6   | AC-4 | skill-safety-contract.md の `SkillSafetyContract` / `SafetyGatePort` / `SafetyGateResult` 型 | safety-gate-contract.md の正式 TypeScript 型定義（`packages/shared/src/types/safety-gate.ts`） | OK   | 後述 |

---

## 2. 各項目の詳細根拠

### 項目 1: AC-1 × TOOL_RISK_CONFIG 型（4段階定義）

**Phase 1 要件:**
`risk-level-classification.md` セクション 1 で `critical` / `high` / `medium` / `low` の 4 段階を定義。各レベルの autoDeny 挙動:

- `critical`: `autoDeny=true`（ユーザー確認なしで即時拒否）
- `high` / `medium` / `low`: `autoDeny=false`（PermissionDialog を表示）

**Phase 2 設計対応:**
`risk-level-design.md` の `TOOL_RISK_CONFIG: Record<ToolRiskLevel, ToolRiskConfig>` において:

```
critical: { autoDenyDefault: true, allowApproveOnce: false, allowPermanent: false, dialogWidth: 640 }
high:     { autoDenyDefault: false, allowApproveOnce: true,  allowPermanent: false, dialogWidth: 480 }
medium:   { autoDenyDefault: false, allowApproveOnce: true,  allowPermanent: true,  dialogWidth: 400 }
low:      { autoDenyDefault: false, allowApproveOnce: true,  allowPermanent: true,  dialogWidth: 400 }
```

**判定: OK**

Phase 1 の autoDeny 挙動が Phase 2 の `autoDenyDefault` フィールドに完全に対応している。4 段階の識別子（`critical` / `high` / `medium` / `low`）も一致。`TOOL_RISK_CONFIG` は `Record<ToolRiskLevel, ToolRiskConfig>` 型により全 4 レベルのコンパイル時網羅性が保証されている（RD-09 テストケース）。

---

### 項目 2: AC-1 × autoDenyDefault 設計（デフォルト権限状態）

**Phase 1 要件:**
`risk-level-classification.md` セクション 5「デフォルト権限状態まとめ」: 全レベルのデフォルト状態は `denied`。`critical` は `autoDeny=true` で PermissionDialog を表示しない。他 3 レベルは `autoDeny=false` で PermissionDialog を表示する。

**Phase 2 設計対応:**
`risk-level-design.md` セクション 6.1「表示属性マトリクス」:

- `Critical`: 自動拒否デフォルト ON、PermissionDialog の承認スコープ非表示
- `High` / `Medium` / `Low`: 自動拒否デフォルト OFF、PermissionDialog 表示

また `permission-state-flow.md`（Phase 1）で定義された `PermissionResolver` 8 ステップフローが Phase 2 では「非変更対象（既存契約を破壊しない）」として明示的に維持されている（`risk-level-design.md` セクション 7.2）。

**判定: OK**

全レベルで `denied` がデフォルト（`autoDenyDefault: false` でも PermissionDialog で明示的な許可を得るまで `denied` のまま）。Phase 1 要件と Phase 2 設計が整合している。

---

### 項目 3: AC-2 × AllowedToolEntryV2 型拡張（履歴エントリ）

**Phase 1 要件:**
`approval-history-policy.md` セクション 1「履歴エントリ型定義（8フィールド）」: `id`, `toolName`, `skillName`, `decision`, `riskLevel`, `timestamp`, `expiryPolicy`, `revokedAt` の 8 フィールドを持つ `ApprovalHistoryEntry` インターフェース。

**Phase 2 設計対応:**
`permission-persistence-design.md` セクション 2「AllowedToolEntry 拡張型定義」:

```typescript
interface AllowedToolEntryV2 extends AllowedToolEntry {
  expiresAt?: number;
  skillName?: string;
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}
```

加えてセクション 5「取り消し UI フロー設計」と `PermissionDecisionExtended` 型で `revokedAt` に相当するフィールドを管理している（取り消し後に `revokedAt: Date.now()` を記録）。

**判定: OK**

`ApprovalHistoryEntry`（Phase 1）と `AllowedToolEntryV2`（Phase 2）は別の型（前者は表示用履歴、後者は永続化用許可エントリ）として設計されており、それぞれが AC-2 要件の異なる側面を担当している。`skillName`・`expiryPolicy` は共通フィールドとして整合。`revokedAt` は Phase 2 の取り消しフロー（セクション 5.3 ステップ 2）で `revokedAt: Date.now()` として記録される。Phase 1 要件の 8 フィールドが Phase 2 の設計に分散して反映されており、整合性あり。

---

### 項目 4: AC-2 × 取り消し条件（approved のみ対象）

**Phase 1 要件:**
`approval-history-policy.md` セクション 2「取り消し条件定義」: 「ユーザー手動取り消し」は設定画面で `approved` 状態のみ対象。`decision` を `"revoked"` に更新し `revokedAt = Date.now()` を設定。

**Phase 2 設計対応:**
`permission-persistence-design.md` セクション 5.2「取り消しボタンの表示条件」:

| `decision` 状態 | 「取り消す x」ボタン | 理由                                                       |
| --------------- | -------------------- | ---------------------------------------------------------- |
| `approved`      | 表示する（活性）     | 恒久許可の明示的撤回が可能                                 |
| `denied`        | 表示しない           | 拒否状態の取り消しは再許可操作で行う（Phase 1 OUT-3 準拠） |
| `approved_once` | 表示しない           | セッション終了で自動失効するため手動取り消し不要           |
| `revoked`       | 表示する（非活性）   | 既に取り消し済みであることを視覚的に表示                   |

**判定: OK**

Phase 1 要件「取り消しは `approved` 状態のみ対象」が Phase 2 の取り消しボタン表示条件テーブルに完全に反映されている。Phase 1 が定義した「`denied` の取り消しは再許可操作で行う」方針も Phase 2 で「Phase 1 OUT-3 準拠」として明示的に維持されている。

---

### 項目 5: AC-3 × INS-01〜INS-03 ワイヤーフレーム

**Phase 1 要件:**
`accountability-insertion-map.md` セクション 1「挿入ポイント一覧」:

- INS-01: Task-05 CTA 画面の「今すぐ使う」ボタン上部。条件: `hasHighOrCritical === true` または `safetyGrade === "SAFE_WITH_WARNINGS"`
- INS-02: Agent 実行中画面の上部。条件: `PermissionResolver.pendingCount > 0`
- INS-03: ExecutionResultSummary の下部。条件: `session.permissionDecisions.length >= 1`

**Phase 2 設計対応:**
`accountability-ui-design.md`:

- セクション 3「INS-01 ワイヤーフレーム」: `computeINS01State()` 関数（`safetyGrade` + `scoringGate` + `hasHighOrCritical` の 3 引数で完全実装）
- セクション 4「INS-02 ワイヤーフレーム」: `pendingCount` 別表示分岐（0件/1件/2件以上）とタイムアウト表示
- セクション 5「INS-03 ワイヤーフレーム」: `computeINS03State()` 関数（ツール名ごとの集計・`approved` / `denied` / `approved_once` の分類）

**判定: OK**

INS-01〜INS-03 の挿入位置・表示条件・表示内容が Phase 1 要件を完全に具体化している。Phase 1 の簡易条件式（`hasHighOrCritical`）が Phase 2 では `SafetyGrade` と `ScoringGate` の優先順位付きロジックに拡張されており、Phase 1 要件を包含した上位互換設計になっている（Phase 1 の条件は Phase 2 ロジックの一部として内包されている）。

---

### 項目 6: AC-4 × SafetyGatePort / SafetyGateResult 型定義

**Phase 1 要件:**
`skill-safety-contract.md` で定義:

- `interface SafetyGatePort { evaluate(skillName: string): Promise<SafetyGateResult>; }`
- `interface SafetyGateResult { skillName, evaluatedAt, overallGrade, details }`
- `type SafetyCheckId` (5種)
- `type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"`

**Phase 2 設計対応:**
`safety-gate-contract.md` で正式 TypeScript 型として確定:

- `export interface SafetyGatePort` — 配置先 `packages/shared/src/types/safety-gate.ts`
- `export interface SafetyGateResult` — 同一フィールド構成（`skillName`, `evaluatedAt`, `overallGrade`, `details`）
- `export type SafetyCheckId` — 同一 5 種（`CRITICAL_TOOL_REQUIRED` / `HIGH_TOOL_REQUIRED` / `NO_PERMANENT_APPROVAL` / `ALL_LOW_TOOLS` / `PROTECTED_PATH_ACCESS`）
- `export type SafetyGrade` — 同一 3 値
- `export interface SkillSafetyContract` — Phase 1 の同名型を確定化

加えて `overallGrade` の決定ロジック（`calculateOverallGrade`）、Task-08 向け消費コード例、DI パターン（Constructor Injection）を追加定義。

**判定: OK**

Phase 1 で定義された全型（`SafetyGatePort` / `SafetyGateResult` / `SafetyCheckId` / `SafetyGrade` / `SkillSafetyContract`）が Phase 2 で `export` キーワード付きの正式 TypeScript 型として確定されている。Phase 1 の `SafetyCheckDetail` で `passed: boolean` + `grade: SafetyGrade` だった 2 フィールドが Phase 2 では `status: "passed" | "warned" | "blocked"` の 1 フィールドに統合されているが、これは型設計の改良であり AC-4 要件（「公開前安全性ゲート」）の充足には影響しない。

---

## 3. GAP / CONFLICT の詳細

**GAP: 0 件**

**CONFLICT: 0 件**

`SafetyCheckDetail` の型構造変更（Phase 1: `passed` + `grade` の 2 フィールド → Phase 2: `status` の 1 フィールド）は CONFLICT ではなく設計改良として判定する。理由: Phase 1 の `grade: SafetyGrade` は `"SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"` の 3 値を持ち、Phase 2 の `status: "passed" | "warned" | "blocked"` は同じ意味を別の語彙で表現している（`passed ↔ SAFE`, `warned ↔ SAFE_WITH_WARNINGS`, `blocked ↔ UNSAFE`）。機能要件の充足に違いはない。

---

## 4. 結論

全 6 項目が OK 判定。Phase 1 要件定義（AC-1〜AC-4）に対して Phase 2 設計が完全に対応しており、GAP・CONFLICT はゼロ。

**追加の所見:**

1. **Phase 2 の設計拡張**: Phase 2 は Phase 1 要件を具体化するのみならず、Phase 1 には存在しなかった設計要素を追加している。具体的には:
   - `ToolRiskConfig.headerColorToken` / `dialogWidth`（UI 実装詳細）
   - `AllowedToolEntryV2.expiresAt` の失効チェック関数・マイグレーション仕様
   - abort/skip/retry の 3 フロー（Phase 1 は abort フローのみ）
   - DI パターン（Constructor Injection / モック注入パターン）
     これらは全て AC-1〜AC-4 の要件を充足するために必要な設計詳細であり、要件からの逸脱ではない。

2. **Phase 5 実装への準備状態**: AC-1〜AC-4 全要件に対して実装レベルの型定義・検証条件・テストケース ID が揃っており、Phase 5 実装担当者は本設計書セットを参照することで実装を開始できる状態にある。
