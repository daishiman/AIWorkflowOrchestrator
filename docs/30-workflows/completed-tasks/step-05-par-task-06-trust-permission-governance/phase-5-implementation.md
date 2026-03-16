# Phase 5: 実装 - TASK-SKILL-LIFECYCLE-06 信頼・権限・ガバナンス統合

## メタ情報

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                                                                  |
| Phase      | 5                                                                                        |
| Phase名    | 実装                                                                                     |
| ステータス | not_started                                                                              |
| 依存成果物 | `outputs/phase-2/`（5ファイル）、`outputs/phase-4/`（7ファイル）                         |
| ブロック先 | `phase-6-test-expansion.md`                                                              |
| タスク種別 | design（設計文書の正式版作成・型定義ファイル作成・インターフェース契約書作成が主な活動） |
| 作成日     | 2026-03-16                                                                               |

---

## 目的

設計タスクとして、Phase 2 の設計草案を以下の4種類の**正式版成果物**に昇格させる。

1. **型定義ファイル**: `ToolRiskConfig` / `AllowedToolEntryV2` / `SafetyGatePort` の TypeScript 型定義正本
2. **権限状態遷移図**: 権限状態4モードの遷移条件・禁止遷移を確定した正式図
3. **設計文書正式版**: Phase 2 のワイヤーフレーム・フロー設計を Phase 4 テスト仕様の検証を踏まえて確定
4. **契約整合性チェックスクリプト**: Phase 4 の `validate-design-script-spec.md` に基づく検証スクリプト

実コードへの変更は行わない。`.claude` の正本仕様書と `outputs/phase-5/` 配下の型定義ファイルを成果物とする。

---

## 実行タスク

- 実装仕様確定: 型定義と状態遷移を実装可能な契約へ固定する
- 同期計画定義: 正本仕様と成果物の反映順序を確定する

### Task 1: 型定義・状態遷移・fallback 契約の正式化

### Task 2: 正本仕様への反映計画と成果物配置

1. `ToolRiskConfig` / `ToolRiskLevel` 型定義の正式版作成
2. `AllowedToolEntryV2` 型定義の正式版作成（後方互換性を明示）
3. `SafetyGatePort` / `SafetyGateResult` / `SafetyCheckDetail` 型定義の正式版作成
4. 権限状態遷移図の正式版作成（状態×イベント×ガード条件の完全定義）
5. abort/skip/retry fallback 契約書の正式版作成
6. 契約整合性チェックスクリプト（`validate-trust-governance-design.ts`）の実装仕様作成
7. 説明責任 UI 挿入点（INS-01〜INS-03）の確定仕様作成
8. `.claude/skills/aiworkflow-requirements/references/` 正本への反映計画策定
9. 全成果物を `outputs/phase-5/` に配置する

---

## 参照資料

| 資料名                            | パス                                                                                                                | 読む理由                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Phase 2 設計成果物（全5ファイル） | `outputs/phase-2/`                                                                                                  | 正式版に昇格する元設計の確認              |
| Phase 4 テスト仕様（全7ファイル） | `outputs/phase-4/`                                                                                                  | 型定義に課される不変条件の確認            |
| Phase 3 設計レビューレポート      | `outputs/phase-3/design-review-report.md`                                                                           | MINOR 指摘事項を正式版に反映するため      |
| security-skill-execution          | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                     | DANGEROUS_PATTERNS 正本との型定義整合確認 |
| arch-state-management-permissions | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | permissionHistorySlice 既存型との整合確認 |

---

## 実行手順

### ステップ 1: ToolRiskConfig 型定義の正式版作成

Phase 2 設計の `TOOL_RISK_CONFIG` を TC-T-001〜003 の検証条件を満たす形で正式化する。

#### 正式版型定義（`outputs/phase-5/security.ts`）

```typescript
// packages/shared/src/constants/security.ts への追加内容（正本）

export type ToolRiskLevel = "critical" | "high" | "medium" | "low";

export interface ToolRiskConfig {
  level: ToolRiskLevel;
  /** 「今回のみ許可」ボタンをダイアログに表示するか */
  allowApproveOnce: boolean;
  /** 「常に許可（恒久許可）」ボタンをダイアログに表示するか */
  allowPermanent: boolean;
  /**
   * デフォルトで自動拒否するか。
   * true の場合、PermissionDialog を表示せずに decision: "denied" を返す。
   * ユーザー設定 SKILL_EXECUTOR_AUTO_DENY で上書き可能。
   */
  autoDenyDefault: boolean;
  /** ダイアログヘッダー背景色の CSS 変数トークン名（形式: "--status-xxx"） */
  headerColorToken: string;
  /** ダイアログ幅（px）: Critical=640, High=480, Medium/Low=400 */
  dialogWidth: 400 | 480 | 640;
}

/**
 * 不変条件（TC-T-001 で検証）:
 * - critical.allowPermanent === false（Critical ツールへの恒久許可を禁止）
 * - critical.allowApproveOnce === false（Critical ツールへの一時許可を禁止）
 * - critical.autoDenyDefault === true（Critical ツールはデフォルト自動拒否）
 */
export const TOOL_RISK_CONFIG: Record<ToolRiskLevel, ToolRiskConfig> = {
  critical: {
    level: "critical",
    allowApproveOnce: false, // 不変条件: 変更禁止
    allowPermanent: false, // 不変条件: 変更禁止
    autoDenyDefault: true,
    headerColorToken: "--status-destructive",
    dialogWidth: 640,
  },
  high: {
    level: "high",
    allowApproveOnce: true,
    allowPermanent: false,
    autoDenyDefault: false,
    headerColorToken: "--status-warning",
    dialogWidth: 480,
  },
  medium: {
    level: "medium",
    allowApproveOnce: true,
    allowPermanent: true,
    autoDenyDefault: false,
    headerColorToken: "--status-caution",
    dialogWidth: 400,
  },
  low: {
    level: "low",
    allowApproveOnce: true,
    allowPermanent: true,
    autoDenyDefault: false,
    headerColorToken: "--status-info",
    dialogWidth: 400,
  },
};
```

---

### ステップ 2: AllowedToolEntryV2 型定義の正式版作成

TC-T-004 の後方互換検証条件を全て満たす形で正式化する。

#### 正式版型定義（`outputs/phase-5/permission-store-interface.ts`）

```typescript
// 既存型（変更なし。破壊禁止）
export interface AllowedToolEntry {
  toolName: string;
  allowedAt: number; // Unix timestamp (ms)
}

/**
 * 拡張型。既存の AllowedToolEntry に expiresAt を追加。
 *
 * 後方互換性:
 * - expiresAt が undefined の既存エントリは「無期限有効」として扱う
 * - skillName が undefined のエントリは「全スキルに適用」として扱う
 * - expiryPolicy が undefined の既存エントリは "permanent" として扱う
 *
 * TC-T-004 不変条件:
 * - AllowedToolEntry 型（expiresAt なし）は AllowedToolEntryV2 型に代入可能
 */
export interface AllowedToolEntryV2 extends AllowedToolEntry {
  /** 失効タイムスタンプ（Unix ms）。undefined = 無期限 */
  expiresAt?: number;
  /** 適用対象スキル名。undefined = 全スキルに適用 */
  skillName?: string;
  /** 失効ポリシー種別 */
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}

/**
 * PermissionStore の isToolAllowed メソッド仕様（TC-ST-001 の検証対象）
 *
 * 6分岐フロー:
 * 1. entry が存在しない → false
 * 2. expiresAt === undefined → true（無期限）
 * 3. expiresAt < Date.now() → electron-store から削除 → false
 * 4. expiresAt >= Date.now() → true（有効期限内）
 * 5. skillName が定義されており呼び出し時の skillName と不一致 → false
 * 6. それ以外 → true
 */
export interface PermissionStoreInterface {
  isToolAllowed(toolName: string, skillName?: string): boolean;
  allowTool(entry: AllowedToolEntryV2): void;
  revokeTool(toolName: string): void;
  revokeAll(): void;
  getAllowedTools(): AllowedToolEntryV2[];
}

/**
 * 失効ポリシー別 expiresAt 計算ルール（TC-ST-002 の検証対象）
 *
 * | ポリシー    | expiresAt 計算式                          | 備考                       |
 * | ----------- | ----------------------------------------- | -------------------------- |
 * | session     | undefined                                 | electron-store に書かない  |
 * | time_24h    | allowedAt + 86_400_000                    | 24時間後                   |
 * | time_7d     | allowedAt + 604_800_000                   | 7日後                      |
 * | permanent   | undefined                                 | 明示取り消しまで有効       |
 */
export function calcExpiresAt(
  policy: NonNullable<AllowedToolEntryV2["expiryPolicy"]>,
  allowedAt: number,
): number | undefined {
  switch (policy) {
    case "session":
      return undefined;
    case "time_24h":
      return allowedAt + 86_400_000;
    case "time_7d":
      return allowedAt + 604_800_000;
    case "permanent":
      return undefined;
  }
}
```

---

### ステップ 3: SafetyGatePort 型定義の正式版作成

TC-T-005 と TC-R-001 の検証条件を全て満たす形で正式化する。

#### 正式版型定義（`outputs/phase-5/safety-gate.ts`）

```typescript
// packages/shared/src/types/safety-gate.ts（新規ファイル正本）

import type { ToolRiskLevel } from "../constants/security";

/**
 * 公開前安全性チェックの総合グレード。
 * Task-08（スキル公開）が本型を参照してブロック判定を行う。
 *
 * 優先度: UNSAFE > SAFE_WITH_WARNINGS > SAFE
 * （複数ルールが同時適用された場合、より厳しいグレードが採用される）
 */
export type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

/**
 * 個別安全性チェック結果。
 * message は「〜の可能性があります」等の曖昧表現を禁止し、
 * 「ツール X が PROTECTED_PATH Y に書き込みを要求しています」のように具体的に記述する。
 */
export interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  toolName: string;
  riskLevel: ToolRiskLevel;
  status: "passed" | "warned" | "blocked";
  /** ユーザー向けメッセージ。曖昧表現禁止、具体的な操作・パス・理由を含める */
  message: string;
}

/**
 * 公開前安全性チェックの全結果。
 * Task-08 がこの型を受け取り、overallGrade で公開可否を判定する。
 */
export interface SafetyGateResult {
  skillName: string;
  /** チェック実行タイムスタンプ（Unix ms） */
  evaluatedAt: number;
  overallGrade: SafetyGrade;
  details: SafetyCheckDetail[];
}

/**
 * 安全性チェック関数の契約インターフェース（TC-T-005 の検証対象）。
 * Task-08 は本インターフェースを通じて Task-06 の安全性チェックを呼び出す。
 * モックを注入可能にするためインターフェースとして定義（テスト容易性確保）。
 */
export interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}

/**
 * 安全性チェック ID の種別（TC-R-001 のデシジョンテーブル対応）。
 *
 * | チェックID               | 期待 overallGrade    | 判定条件                                   |
 * | ------------------------ | -------------------- | ------------------------------------------ |
 * | CRITICAL_TOOL_REQUIRED   | UNSAFE               | Critical ツールを1件以上要求する           |
 * | PROTECTED_PATH_ACCESS    | UNSAFE               | PROTECTED_PATHS に Write/Edit を要求する   |
 * | HIGH_TOOL_REQUIRED       | SAFE_WITH_WARNINGS   | High ツールを要求するが Critical ではない  |
 * | NO_PERMANENT_APPROVAL    | SAFE_WITH_WARNINGS   | 全ツールが session or approve_once のみ    |
 * | ALL_LOW_TOOLS            | SAFE                 | 全ツールが Low リスク                      |
 *
 * グレード優先度ルール（TC-R-002 の複合チェック対応）:
 * - UNSAFE が1件でもあれば overallGrade = "UNSAFE"
 * - UNSAFE がなく SAFE_WITH_WARNINGS が1件以上あれば overallGrade = "SAFE_WITH_WARNINGS"
 * - 全チェックが passed であれば overallGrade = "SAFE"
 */
export type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";
```

---

### ステップ 4: 権限状態遷移図の正式版作成

TC-ST-003 の検証テーブルを正式な状態遷移図として確定する。

#### 正式版状態遷移定義（`outputs/phase-5/permission-state-machine.md`）の内容概要

```
状態定義:
  denied          : 拒否または未許可（デフォルト状態）
  approved_once   : 今回のセッションのみ許可（アプリ再起動で denied に戻る）
  approved        : 恒久許可（electron-store に永続化）
  revoked         : 取り消し済み（履歴は保持、再度の使用には denied から再開）

有効遷移（ガード条件付き）:
  denied → approved_once   : [ガード] riskLevel != "critical"
                             [トリガー] PermissionDialog で「今回のみ許可」選択
  denied → approved        : [ガード] allowPermanent === true（medium/low のみ）
                             [トリガー] PermissionDialog で「常に許可」選択
  approved_once → denied   : [ガード] なし
                             [トリガー] アプリ再起動（セッション終了）
  approved → revoked       : [ガード] なし
                             [トリガー] Permission History Panel で「取り消す」クリック
  revoked → denied         : [ガード] なし
                             [トリガー] revoke 後の初回ツール使用（自動遷移）

禁止遷移（不変条件）:
  denied → approved        : [禁止理由] riskLevel === "critical"（Critical は恒久許可禁止）
  denied → approved_once   : [禁止理由] riskLevel === "critical" かつ autoDenyDefault === true
  approved → approved      : [禁止理由] 同一状態への遷移は操作なし（冪等）
  revoked → approved       : [禁止理由] 取り消し後は denied から再承認フロー経由のみ許可
```

---

### ステップ 5: abort/skip/retry fallback 契約書の正式版作成

TC-F-001〜004 の検証条件を全て満たす形で正式化する。

#### 正式版契約定義（`outputs/phase-5/abort-fallback-contract.md`）の内容概要

```typescript
// abort フロー①の4ステップ契約（TC-F-001 の検証対象）
async function onAbort(sessionId: string): Promise<void> {
  // Step 1: PermissionResolver.cancelAll() で全待機中リクエストをキャンセル
  await permissionResolver.cancelAll();

  // Step 2: セッション中の approve_once エントリを PermissionStore から削除
  //         （expiryPolicy === "session" のエントリのみ対象）
  permissionStore.revokeSessionEntries(sessionId);

  // Step 3: 実行ログに abort イベントを記録
  //         フォーマット: { event: "aborted", reason: "permission_denied", timestamp: Date.now() }
  executionLog.record({
    event: "aborted",
    reason: "permission_denied",
    timestamp: Date.now(),
  });

  // Step 4: Renderer に IPC イベントを送信
  //         チャンネル: "skill:execution:aborted"
  mainWindow.webContents.send("skill:execution:aborted", { sessionId });
}

// skip フロー②の契約（TC-F-002 の検証対象）
// SkillExecutor が受け取る応答形式: { approved: false, skip: true }
// 後続処理: 当該ツール呼び出しをスキップし、次の処理ステップに進む

// retry フロー③の最大回数制限（TC-F-003 の検証対象）
// 最大リトライ回数: 3回（定数 MAX_PERMISSION_RETRY_COUNT = 3）
// 3回目の拒否後: 自動的に abort フロー①に移行する
// 履歴記録: 初回の denied のみ記録（重複記録しない）

// タイムアウト制約（TC-F-004 の検証対象）
// DEFAULT_TIMEOUT_MS: 300000（5分）。変更禁止
// タイムアウト後: abort フロー①が自動実行される
```

---

### ステップ 6: 契約整合性チェックスクリプトの実装仕様作成

Phase 4 の `validate-design-script-spec.md` に基づき、スクリプトの実装仕様を詳細化する。

#### スクリプト仕様（`outputs/phase-5/validate-script-spec-v2.md`）の内容概要

```typescript
// scripts/validate-trust-governance-design.ts
// 実行: pnpm ts-node scripts/validate-trust-governance-design.ts
// 成功時: exitCode = 0, "PASS: 全6項目が検証成功" を出力
// 失敗時: exitCode = 1, 失敗した項目名・期待値・実際値を出力

// 検証項目:
// 1. TOOL_RISK_CONFIG の全4キー存在確認
//    期待: ["critical", "high", "medium", "low"] の全キーが存在する
// 2. critical.allowPermanent === false の確認
//    期待: false / 実際値を出力
// 3. critical.allowApproveOnce === false の確認
//    期待: false / 実際値を出力
// 4. SafetyGatePort.evaluate のシグネチャ確認
//    期待: (skillName: string) => Promise<SafetyGateResult>
// 5. AllowedToolEntryV2.expiresAt が optional であることの確認
//    期待: TypeScript 型に "?" が含まれる（tsserver 型情報から抽出）
// 6. 安全性チェックルール5件の SafetyCheckId union 型確認
//    期待: 5件全てが SafetyCheckId 型に含まれる
```

---

### ステップ 7: 説明責任 UI 挿入点の確定仕様作成

Phase 2 の INS-01〜INS-03 設計を Phase 3 レビュー結果を踏まえて確定する。

#### 確定仕様（`outputs/phase-5/accountability-ui-spec.md`）の内容概要

| 挿入点 ID | 挿入先                 | 発火条件（具体的判定ロジック）                                                                    | 非表示条件                        |
| --------- | ---------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------- |
| INS-01    | Task-05 CTA 画面上部   | `skill.requiredTools.some(t => TOOL_RISK_CONFIG[t.riskLevel].dialogWidth >= 480)` が true         | 全ツールが Low リスクの場合       |
| INS-02    | Task-03 実行中画面     | `permissionResolver.pendingCount > 0` が true                                                     | `pendingCount === 0` の場合       |
| INS-03    | Task-05 実行結果画面下 | `sessionPermissionHistory.length > 0`（実行セッション中に1件以上の権限承認が発生した場合）が true | セッション中の権限承認が0件の場合 |

---

### ステップ 8: `.claude` 正本への反映計画策定

#### 反映対象ファイルと変更内容

| 対象ファイル                                                                                                        | 変更内容                                                         | 反映タイミング |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------- |
| `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                     | `TOOL_RISK_CONFIG` 型定義セクションを追加                        | Phase 12       |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                        | `PermissionStoreInterface` の `isToolAllowed` メソッド仕様を追加 | Phase 12       |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | `AllowedToolEntryV2` 型定義と失効ポリシー定義を追加              | Phase 12       |

**Phase 5 時点での実施事項**: 反映計画書（`outputs/phase-5/spec-update-plan.md`）の作成のみ。
実際の `.claude` 正本への反映は Phase 12（ドキュメント）で実施する。

---

## 統合テスト連携

| Phase 4 テストケース | Phase 5 成果物（検証対象）                      | 合格基準                                                                        |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------- |
| TC-T-001〜003        | `outputs/phase-5/security.ts`                   | `TOOL_RISK_CONFIG.critical.allowPermanent === false` を型注釈で保証していること |
| TC-T-004             | `outputs/phase-5/permission-store-interface.ts` | `AllowedToolEntryV2.expiresAt` が `number                                       | undefined`（optional）であること |
| TC-T-005             | `outputs/phase-5/safety-gate.ts`                | `SafetyGatePort.evaluate` のシグネチャが仕様通りであること                      |
| TC-ST-001〜002       | `outputs/phase-5/permission-store-interface.ts` | `calcExpiresAt` 関数の4分岐が正しく実装されていること                           |
| TC-ST-003            | `outputs/phase-5/permission-state-machine.md`   | 全有効遷移のガード条件が定義されていること                                      |
| TC-R-001             | `outputs/phase-5/safety-gate.ts`                | `SafetyCheckId` 型に5件全てが含まれていること                                   |
| TC-F-001〜004        | `outputs/phase-5/abort-fallback-contract.md`    | abort フロー4ステップの契約が全て定義されていること                             |

---

## 成果物

成果物は全て `outputs/phase-5/` 配下に配置する。

| 成果物ファイル名                                | 内容                                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `outputs/phase-5/security.ts`                   | `ToolRiskLevel` / `ToolRiskConfig` / `TOOL_RISK_CONFIG` 型定義正本                 |
| `outputs/phase-5/permission-store-interface.ts` | `AllowedToolEntry` / `AllowedToolEntryV2` / `PermissionStoreInterface` 型定義正本  |
| `outputs/phase-5/safety-gate.ts`                | `SafetyGrade` / `SafetyGateResult` / `SafetyGatePort` / `SafetyCheckId` 型定義正本 |
| `outputs/phase-5/permission-state-machine.md`   | 権限状態4モードの遷移定義（有効遷移・禁止遷移・ガード条件）                        |
| `outputs/phase-5/abort-fallback-contract.md`    | abort/skip/retry フローの4ステップ契約正書                                         |
| `outputs/phase-5/accountability-ui-spec.md`     | INS-01〜INS-03 の発火条件確定仕様                                                  |
| `outputs/phase-5/validate-script-spec-v2.md`    | 契約整合性チェックスクリプト詳細仕様（Phase 4 仕様の拡充版）                       |
| `outputs/phase-5/spec-update-plan.md`           | `.claude` 正本への反映計画（Phase 12 で実施）                                      |

---

## 完了条件

- [ ] `outputs/phase-5/security.ts` に `TOOL_RISK_CONFIG.critical.allowPermanent === false` の不変条件が型コメントで明記されている
- [ ] `outputs/phase-5/permission-store-interface.ts` の `AllowedToolEntryV2.expiresAt` が optional（`?`）フィールドであること
- [ ] `outputs/phase-5/safety-gate.ts` の `SafetyGatePort.evaluate` が `(skillName: string) => Promise<SafetyGateResult>` シグネチャであること
- [ ] `outputs/phase-5/permission-state-machine.md` に禁止遷移（Critical→approved 等）が明記されていること
- [ ] `outputs/phase-5/abort-fallback-contract.md` に abort フロー4ステップが全て定義されていること
- [ ] `outputs/phase-5/accountability-ui-spec.md` の INS-01〜03 の発火条件が具体的な真偽値判定ロジックで記述されていること
- [ ] `outputs/phase-5/validate-script-spec-v2.md` に6項目の検証内容が定義されていること
- [ ] `outputs/phase-5/spec-update-plan.md` に `.claude` 正本への反映対象3ファイルが列挙されていること
- [ ] 成果物8ファイルが `outputs/phase-5/` 配下に存在すること
- [ ] 曖昧語が全成果物に含まれていないこと

---

## タスク100%実行確認【必須】

以下を全て確認してから「完了」と記録すること。

- [ ] Phase 4 の全テストケース（TC-T/TC-ST/TC-R/TC-F）に対応する成果物が存在することを確認した
- [ ] `TOOL_RISK_CONFIG.critical.allowPermanent === false` が型コメントで明示されていることを確認した
- [ ] `SafetyGatePort` がインターフェースとして定義されており、モック注入可能であることを確認した
- [ ] `.claude` 正本への変更が Phase 5 時点ではなく Phase 12 で実施することを反映計画に明記したことを確認した
- [ ] 実コードへの変更が含まれていないことを確認した（設計タスクの範囲内）
- [ ] 全8成果物ファイルが `outputs/phase-5/` 配下に存在することを `ls` で確認した

---

## 次 Phase

**Phase 6: テスト拡充** (`phase-6-test-expansion.md`)

Phase 6 開始条件: 本ファイルの「完了条件」チェックリストが全項目 CHECKED であること。

Phase 6 への引き継ぎ事項:

- `outputs/phase-5/security.ts` / `permission-store-interface.ts` / `safety-gate.ts` を Phase 6 の追加テスト設計の基準とすること
- Phase 5 で特定した設計の境界値（session スコープの expiresAt=undefined、Critical の approve_once 条件付き許可等）を Phase 6 で重点検証すること
