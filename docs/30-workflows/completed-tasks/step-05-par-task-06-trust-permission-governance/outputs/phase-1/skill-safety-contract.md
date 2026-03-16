# スキル安全性契約定義書

## メタ情報

| 項目         | 値                                                                         |
| ------------ | -------------------------------------------------------------------------- |
| 成果物ID     | OUT-5                                                                      |
| タスクID     | TASK-SKILL-LIFECYCLE-06                                                    |
| Phase        | 1: 要件定義                                                                |
| 作成日       | 2026-03-16                                                                 |
| 対応AC       | AC-4（公開前安全性ゲート）                                                 |
| 依存成果物   | OUT-1（risk-level-classification.md）、OUT-3（approval-history-policy.md） |
| 消費先タスク | TASK-SKILL-LIFECYCLE-08（スキル公開・バージョン互換）                      |

---

## 1. SkillSafetyContract 型定義

```typescript
type ToolRiskLevel = "critical" | "high" | "medium" | "low";

interface SkillSafetyContract {
  /** スキル識別子（スキル名） */
  skillName: string;

  /** 要求ツール一覧（ALLOWED_TOOLS_WHITELIST に含まれるツール名） */
  requiredTools: RequiredToolEntry[];

  /** スキルのリスクプロファイル */
  riskProfile: SkillRiskProfile;
}

interface RequiredToolEntry {
  toolName: string;
  riskLevel: ToolRiskLevel;
}

interface SkillRiskProfile {
  /** スキルが要求する全ツールのうち最高リスクレベル */
  maxRiskLevel: ToolRiskLevel;

  /** スキル実行に必要な全ツールが approved_once または session のみか（恒久許可なし） */
  hasOnlyOncePerm: boolean;

  /** 承認拒否率（0.0 - 1.0 の範囲） */
  deniedRatio: number;

  /** 公開前に明示同意が必要か */
  requiresExplicitConsent: boolean;
}
```

### フィールド仕様詳細

| フィールド                            | 型                    | 説明                                           | 算出ロジック                                                                                                   |
| ------------------------------------- | --------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `skillName`                           | `string`              | スキル識別子（スキル名と一致）                 | `SkillMetadata.name` から取得                                                                                  |
| `requiredTools`                       | `RequiredToolEntry[]` | スキルが要求するツール一覧                     | スキルマニフェストから抽出し、各ツールの `riskLevel` を `TOOL_RISK_CONFIG` から取得                            |
| `riskProfile.maxRiskLevel`            | `ToolRiskLevel`       | スキルが要求する全ツールのうち最高リスクレベル | `critical > high > medium > low` の順序で最大値を取得                                                          |
| `riskProfile.hasOnlyOncePerm`         | `boolean`             | 恒久許可（`approved`）が存在しないか           | `requiredTools` の全ツールに対して `PermissionStore.isToolAllowed(t.toolName) === false` が成立する場合 `true` |
| `riskProfile.deniedRatio`             | `number`              | 承認拒否率（0.0 - 1.0）                        | `permissionHistorySlice` から該当スキルの履歴を抽出し `denied件数 / 全件数` で算出。履歴0件の場合は `0.0`      |
| `riskProfile.requiresExplicitConsent` | `boolean`             | 公開前に明示同意が必要か                       | セクション4「requiresExplicitConsent 算出条件」を参照                                                          |

### maxRiskLevel 算出条件式

```typescript
const RISK_LEVEL_ORDER: Record<ToolRiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const maxRiskLevel: ToolRiskLevel = requiredTools.reduce(
  (max, tool) =>
    RISK_LEVEL_ORDER[tool.riskLevel] > RISK_LEVEL_ORDER[max]
      ? tool.riskLevel
      : max,
  "low" as ToolRiskLevel,
);
```

---

## 2. SafetyGatePort インターフェース

```typescript
interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}
```

| 項目               | 仕様                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| メソッド           | `evaluate(skillName: string): Promise<SafetyGateResult>`                                                           |
| 非同期の理由       | 承認履歴の取得に `PermissionStore` への IPC 通信が発生するため                                                     |
| 引数バリデーション | `typeof skillName === "string"` かつ `skillName !== ""` かつ `skillName.trim() !== ""`（P42準拠3段バリデーション） |
| `details` の要素数 | 常に5要素（全5チェックを実行し、チェック対象外の場合は `passed: true` で記録）                                     |

---

## 3. SafetyGateResult 型定義

```typescript
interface SafetyGateResult {
  /** 評価対象スキルの名前 */
  skillName: string;

  /** 評価実行時刻（Unix timestamp、ミリ秒） */
  evaluatedAt: number;

  /** 5つのチェック結果から算出された総合グレード */
  overallGrade: SafetyGrade;

  /** 各チェックの詳細結果（常に5要素） */
  details: SafetyCheckDetail[];
}

interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  passed: boolean;
  grade: SafetyGrade;
  message: string;
  affectedTools?: string[];
}
```

| フィールド                 | 型                    | 説明                                                                           |
| -------------------------- | --------------------- | ------------------------------------------------------------------------------ |
| `skillName`                | `string`              | 評価対象スキルの名前。入力の `skillName` と一致する                            |
| `evaluatedAt`              | `number`              | `Date.now()` で取得した評価実行時刻（Unix timestamp、ミリ秒）                  |
| `overallGrade`             | `SafetyGrade`         | 5つのチェック結果から算出された総合グレード（セクション6の算出ロジックを参照） |
| `details`                  | `SafetyCheckDetail[]` | 各チェックの詳細結果。要素数は常に5                                            |
| `details[*].passed`        | `boolean`             | グレードが `SAFE` の場合 `true`、それ以外は `false`                            |
| `details[*].affectedTools` | `string[]` (任意)     | 該当するツール名のリスト。チェック対象ツールがない場合は `undefined`           |

---

## 4. SafetyGrade 型

```typescript
type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";
```

| 値                     | 意味                                                | 公開可否                               |
| ---------------------- | --------------------------------------------------- | -------------------------------------- |
| `"SAFE"`               | 全チェック通過                                      | 公開可能                               |
| `"SAFE_WITH_WARNINGS"` | 警告あり。ユーザー確認後に公開可能                  | 警告表示後、ユーザーが明示同意すれば可 |
| `"UNSAFE"`             | 公開不可。Critical ツール含有または保護パスアクセス | 公開ブロック                           |

---

## 5. SafetyCheckId 5種とチェック定義

```typescript
type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";
```

### チェック定義一覧

| #   | SafetyCheckId            | チェック条件（テスト可能な条件式）                                                                                                           | 結果グレード         |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | `CRITICAL_TOOL_REQUIRED` | `skill.requiredTools.some(t => t.riskLevel === "critical")` が `true`                                                                        | `UNSAFE`             |
| 2   | `HIGH_TOOL_REQUIRED`     | `skill.requiredTools.some(t => t.riskLevel === "high")` が `true` かつ `CRITICAL_TOOL_REQUIRED` が `false`                                   | `SAFE_WITH_WARNINGS` |
| 3   | `NO_PERMANENT_APPROVAL`  | `skill.requiredTools.every(t => !PermissionStore.isToolAllowed(t.toolName))` が `true`                                                       | `SAFE_WITH_WARNINGS` |
| 4   | `ALL_LOW_TOOLS`          | `skill.requiredTools.every(t => t.riskLevel === "low")` が `true`                                                                            | `SAFE`               |
| 5   | `PROTECTED_PATH_ACCESS`  | `skill.requiredTools.some(t => t.toolName === "Write" \|\| t.toolName === "Edit")` かつ `matchesProtectedPaths(skill.accessPaths)` が `true` | `UNSAFE`             |

### メッセージテンプレート

| SafetyCheckId            | メッセージテンプレート                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `CRITICAL_TOOL_REQUIRED` | `"スキル '{skillName}' は不可逆的破壊操作（{toolNames}）を要求します。公開できません。"`     |
| `HIGH_TOOL_REQUIRED`     | `"スキル '{skillName}' は高リスク操作（{toolNames}）を要求します。公開前に確認が必要です。"` |
| `NO_PERMANENT_APPROVAL`  | `"スキル '{skillName}' のツールは全て一時許可のみです。長期的な安全性が未検証です。"`        |
| `ALL_LOW_TOOLS`          | `"スキル '{skillName}' は読み取り専用ツールのみを使用します。"`                              |
| `PROTECTED_PATH_ACCESS`  | `"スキル '{skillName}' は保護パス（{paths}）への書き込みを要求します。公開できません。"`     |

### チェック実行順序

チェックは番号順（1 → 2 → 3 → 4 → 5）で実行する。全5チェックを常に実行し、途中で打ち切らない。`overallGrade` は全チェック完了後に算出する。

---

## 6. overallGrade 決定ロジック

```typescript
function computeOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
  // UNSAFE > SAFE_WITH_WARNINGS > SAFE（最も厳しいグレードを採用）
  if (details.some((d) => d.grade === "UNSAFE")) {
    return "UNSAFE";
  }
  if (details.some((d) => d.grade === "SAFE_WITH_WARNINGS")) {
    return "SAFE_WITH_WARNINGS";
  }
  return "SAFE";
}
```

### 判定優先順位

| 優先度    | 条件                                                    | 結果                 |
| --------- | ------------------------------------------------------- | -------------------- |
| 1（最高） | `details` に `grade === "UNSAFE"` が1件以上             | `UNSAFE`             |
| 2         | `details` に `grade === "SAFE_WITH_WARNINGS"` が1件以上 | `SAFE_WITH_WARNINGS` |
| 3（最低） | 上記いずれにも該当しない                                | `SAFE`               |

> **原則**: 最も厳しいグレードを採用する（UNSAFE > SAFE_WITH_WARNINGS > SAFE）。UNSAFE が1件でも含まれれば、他の全チェックが SAFE でも overallGrade は UNSAFE になる。

---

## 7. requiresExplicitConsent 算出条件

```typescript
const requiresExplicitConsent: boolean =
  maxRiskLevel === "critical" ||
  maxRiskLevel === "high" ||
  deniedRatio >= 0.5 ||
  hasOnlyOncePerm === true;
```

| 条件                          | 意味                              | 同意が必要な理由                                                         |
| ----------------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| `maxRiskLevel === "critical"` | Critical リスクツールを含む       | 不可逆的破壊操作の公開は全面禁止。明示同意を要求した上でブロックする     |
| `maxRiskLevel === "high"`     | High リスクツールを含む           | ネットワーク送信・機密パスアクセスを含むため、公開前にリスクを認識させる |
| `deniedRatio >= 0.5`          | 権限要求の50%以上が拒否されている | スキルの安全性に対する作成者自身の懸念を第三者に開示するため             |
| `hasOnlyOncePerm === true`    | 恒久許可が一度も付与されていない  | 長期的安全性が未検証であることを明示し、公開の意思を再確認するため       |

---

## 8. AC対応マッピング

| AC   | 対応内容                                                  | 本文書の対応セクション                                                    |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| AC-1 | 危険操作の権限境界定義（4段階リスク分類、確認方式の定義） | セクション1（`riskProfile.maxRiskLevel`、`requiredTools[*].riskLevel`）   |
| AC-2 | 承認取り消しフロー（失効条件、手動取り消し、状態遷移）    | セクション1（`riskProfile.hasOnlyOncePerm`、`riskProfile.deniedRatio`）   |
| AC-3 | 説明責任UI（INS-01〜03、ScoringGate連携）                 | セクション3（`SafetyGateResult.overallGrade` が INS-01 の表示条件に使用） |
| AC-4 | 公開前安全性ゲート（SafetyGatePort、SafetyGateResult）    | セクション2〜7 全体                                                       |
