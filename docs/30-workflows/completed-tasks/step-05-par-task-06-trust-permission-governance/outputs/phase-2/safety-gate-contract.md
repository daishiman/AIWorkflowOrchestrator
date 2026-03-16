# SafetyGateContract 設計仕様書

## 1. メタ情報

| 項目         | 値                                                                                   |
| ------------ | ------------------------------------------------------------------------------------ |
| タスク ID    | TASK-SKILL-LIFECYCLE-06                                                              |
| Phase        | 2: 設計                                                                              |
| Lane         | Lane-C: 統合                                                                         |
| 担当         | Lead                                                                                 |
| ステータス   | Draft                                                                                |
| 作成日       | 2026-03-16                                                                           |
| 依存成果物   | Phase 1 OUT-5（`outputs/phase-1/skill-safety-contract.md`）                          |
| 消費先タスク | TASK-SKILL-LIFECYCLE-08（スキル公開・バージョン互換）                                |
| 参照仕様     | `security-skill-execution.md`、`workflow-skill-lifecycle-evaluation-scoring-gate.md` |

---

## 2. SafetyGateContract 正式 TypeScript 型定義

配置先: `packages/shared/src/types/safety-gate.ts`（新規ファイル）

```typescript
// packages/shared/src/types/safety-gate.ts

import type { ToolRiskLevel } from "../constants/security";

// --- SafetyGrade ---

/** 安全性チェックの総合グレード */
export type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

// --- SafetyCheckId ---

/** 安全性チェックの識別子（5種類） */
export type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";

// --- SafetyCheckDetail ---

/** 個別チェックの詳細結果 */
export interface SafetyCheckDetail {
  /** 実行されたチェックの識別子 */
  checkId: SafetyCheckId;
  /** 検出対象のツール名。チェック対象ツールがない場合は空文字列 */
  toolName: string;
  /** 検出対象ツールのリスクレベル */
  riskLevel: ToolRiskLevel;
  /** チェック結果: passed=安全、warned=警告あり、blocked=公開不可 */
  status: "passed" | "warned" | "blocked";
  /** ユーザー向けメッセージ（曖昧表現禁止） */
  message: string;
}

// --- SafetyGateResult ---

/** SafetyGatePort.evaluate() の戻り値 */
export interface SafetyGateResult {
  /** 評価対象スキルの名前 */
  skillName: string;
  /** 評価実行時刻（Unix timestamp、ミリ秒）。Date.now() で取得 */
  evaluatedAt: number;
  /** 5つのチェック結果から算出された総合グレード */
  overallGrade: SafetyGrade;
  /** 各チェックの詳細結果。要素数は常に5（5つのチェック全てを実行） */
  details: SafetyCheckDetail[];
}

// --- SafetyGatePort ---

/** Task-08 が Task-06 に問い合わせる安全性チェックのポートインターフェース */
export interface SafetyGatePort {
  /**
   * 指定スキルの安全性を評価し、SafetyGateResult を返す。
   * - 引数 skillName は P42 準拠の3段バリデーションを呼び出し元で実施する
   * - 戻り値の details は常に5要素を含む
   * - スキルが存在しない場合は SKILL_NOT_FOUND エラーで reject する
   * - 承認履歴が取得不能な場合は HISTORY_UNAVAILABLE エラーで reject する
   */
  evaluate(skillName: string): Promise<SafetyGateResult>;
}

// --- SkillSafetyContract ---

/** Task-08 公開判定で消費される安全性契約オブジェクト（Phase 1 OUT-5 と整合） */
export interface SkillSafetyContract {
  /** スキル識別子（SkillMetadata.name から取得） */
  skillId: string;
  /** スキルバージョン（スキルファイル群の SHA-256 ハッシュ値） */
  skillVersion: string;
  /** スキルが要求する全ツールのうち最高リスクレベル */
  maxRiskLevel: ToolRiskLevel;
  /** 全ツールが approved_once または session のみで動作するか */
  hasOnlyOncePerm: boolean;
  /** 承認拒否率（0.0 - 1.0）。履歴0件の場合は 0.0 */
  deniedRatio: number;
  /** 公開前に明示同意が必要か（セクション8の算出条件で決定） */
  requiresExplicitConsent: boolean;
}
```

---

## 3. 安全性チェックルール5件の詳細定義

### 3-1. チェック定義表

| #   | チェック ID              | 判定条件（テスト可能な条件式）                                                                                                   | Grade 影響           | status 値 | メッセージテンプレート                                                                                    |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| 1   | `CRITICAL_TOOL_REQUIRED` | `skill.requiredTools.some(t => t.riskLevel === "critical")` が `true`                                                            | `UNSAFE`             | `blocked` | `"スキル '{skillName}' はシステム破壊的な操作 '{toolName}' を要求します。公開できません。"`               |
| 2   | `HIGH_TOOL_REQUIRED`     | `skill.requiredTools.some(t => t.riskLevel === "high")` が `true` かつ `CRITICAL_TOOL_REQUIRED` が `false`                       | `SAFE_WITH_WARNINGS` | `warned`  | `"スキル '{skillName}' は高リスク操作 '{toolName}' を要求します。公開時に利用者への警告が表示されます。"` |
| 3   | `NO_PERMANENT_APPROVAL`  | `skill.requiredTools.every(t => !PermissionStore.isToolAllowed(t.name))` が `true`                                               | `SAFE_WITH_WARNINGS` | `warned`  | `"スキル '{skillName}' のツールは恒久許可されていません。「未検証」ラベルが付与されます。"`               |
| 4   | `ALL_LOW_TOOLS`          | `skill.requiredTools.every(t => t.riskLevel === "low")` が `true`                                                                | `SAFE`               | `passed`  | `"スキル '{skillName}' は低リスク操作のみを使用します。"`                                                 |
| 5   | `PROTECTED_PATH_ACCESS`  | `skill.requiredTools.some(t => t.name === "Write" \|\| t.name === "Edit") && matchesProtectedPaths(skill.accessPaths)` が `true` | `UNSAFE`             | `blocked` | `"スキル '{skillName}' は保護パス '{path}' への書き込みを要求します。公開できません。"`                   |

### 3-2. チェック実行順序

チェックは番号順（1 → 2 → 3 → 4 → 5）で実行する。全5チェックを常に実行し、途中で打ち切らない。`overallGrade` は全チェック完了後にセクション4のロジックで算出する。

### 3-3. status 値と Grade の対応

| status    | SafetyGrade          | 意味                       |
| --------- | -------------------- | -------------------------- |
| `passed`  | `SAFE`               | チェック通過。問題なし     |
| `warned`  | `SAFE_WITH_WARNINGS` | 警告あり。確認後に公開可能 |
| `blocked` | `UNSAFE`             | 公開不可。ブロック対象     |

### 3-4. チェック対象外の場合の記録

チェック対象ツールが存在しない場合（Low ツールのみのスキルで `CRITICAL_TOOL_REQUIRED` を実行する場合など）、以下のデフォルト値で記録する:

```typescript
{
  checkId: "CRITICAL_TOOL_REQUIRED",
  toolName: "",
  riskLevel: "low",
  status: "passed",
  message: "スキル '{skillName}' には Critical リスクツールは含まれていません。"
}
```

---

## 4. overallGrade 判定ロジック

### 4-1. 条件式

```typescript
function calculateOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
  if (details.some((d) => d.status === "blocked")) return "UNSAFE";
  if (details.some((d) => d.status === "warned")) return "SAFE_WITH_WARNINGS";
  return "SAFE";
}
```

### 4-2. 判定優先順位

| 優先度    | 条件                                                   | 結果                 |
| --------- | ------------------------------------------------------ | -------------------- |
| 1（最高） | `details` に `status === "blocked"` が1件以上          | `UNSAFE`             |
| 2         | `details` に `status === "warned"` が1件以上           | `SAFE_WITH_WARNINGS` |
| 3（最低） | 上記いずれにも該当しない（全て `status === "passed"`） | `SAFE`               |

### 4-3. テスト可能なアサーション

```typescript
// blocked が1件でもあれば UNSAFE
assert(
  calculateOverallGrade([
    {
      checkId: "CRITICAL_TOOL_REQUIRED",
      toolName: "rm -rf",
      riskLevel: "critical",
      status: "blocked",
      message: "...",
    },
    {
      checkId: "ALL_LOW_TOOLS",
      toolName: "",
      riskLevel: "low",
      status: "passed",
      message: "...",
    },
  ]) === "UNSAFE",
);

// warned が1件でもあれば SAFE_WITH_WARNINGS
assert(
  calculateOverallGrade([
    {
      checkId: "HIGH_TOOL_REQUIRED",
      toolName: "Bash",
      riskLevel: "high",
      status: "warned",
      message: "...",
    },
    {
      checkId: "ALL_LOW_TOOLS",
      toolName: "",
      riskLevel: "low",
      status: "passed",
      message: "...",
    },
  ]) === "SAFE_WITH_WARNINGS",
);

// 全て passed なら SAFE
assert(
  calculateOverallGrade([
    {
      checkId: "ALL_LOW_TOOLS",
      toolName: "",
      riskLevel: "low",
      status: "passed",
      message: "...",
    },
  ]) === "SAFE",
);
```

---

## 5. SkillSafetyContract 型（Phase 1 OUT-5 との整合）

### 5-1. フィールド仕様

Phase 1 OUT-5 で定義された `SkillSafetyContract` を Phase 2 で正式な TypeScript 型定義として確定する。フィールド仕様は以下の通り。

| フィールド                | 型              | 算出ロジック                                                                      |
| ------------------------- | --------------- | --------------------------------------------------------------------------------- |
| `skillId`                 | `string`        | `SkillMetadata.name` から取得                                                     |
| `skillVersion`            | `string`        | スキルファイル群の SHA-256 ハッシュ値                                             |
| `maxRiskLevel`            | `ToolRiskLevel` | `RISK_LEVEL_ORDER` の最大値を取得（`critical > high > medium > low`）             |
| `hasOnlyOncePerm`         | `boolean`       | `PermissionStore.isToolAllowed(toolName)` が全ツールで `false` の場合 `true`      |
| `deniedRatio`             | `number`        | `permissionHistorySlice` から `denied件数 / 全件数` で算出。履歴0件の場合は `0.0` |
| `requiresExplicitConsent` | `boolean`       | セクション8の算出条件で決定                                                       |

### 5-2. maxRiskLevel 算出の条件式

```typescript
const RISK_LEVEL_ORDER: Record<ToolRiskLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const maxRiskLevel: ToolRiskLevel = tools.reduce(
  (max, tool) =>
    RISK_LEVEL_ORDER[tool.riskLevel] > RISK_LEVEL_ORDER[max]
      ? tool.riskLevel
      : max,
  "low" as ToolRiskLevel,
);
```

---

## 6. Task-08 への受け渡しフロー

### 6-1. フロー概要

```
Task-08 publish フロー
  |
  +--> SafetyGatePort.evaluate(skillName) を呼び出す
        |
        +--> evaluate() 内部で SkillSafetyContract を構築する
        |     - スキルメタデータからツール一覧を取得
        |     - 各ツールのリスクレベルを判定
        |     - PermissionStore から承認状態を取得
        |     - permissionHistorySlice から denied 率を算出
        |
        +--> 5つの安全性チェックを全て実行する
        |     - CRITICAL_TOOL_REQUIRED
        |     - HIGH_TOOL_REQUIRED
        |     - NO_PERMANENT_APPROVAL
        |     - ALL_LOW_TOOLS
        |     - PROTECTED_PATH_ACCESS
        |
        +--> SafetyGateResult を生成して返す
              - overallGrade = calculateOverallGrade(details)
              - details.length === 5（常に5要素）

Task-08 は overallGrade に基づいて公開可否を判定する:
  |
  +--> UNSAFE       --> 公開ブロック（エラーメッセージ表示）
  +--> SAFE_WITH_WARNINGS --> 確認ダイアログ表示後に公開可能
  +--> SAFE         --> 公開可能
```

### 6-2. Task-08 側の消費コード

```typescript
async function checkPublishEligibility(
  skillName: string,
  safetyGate: SafetyGatePort,
): Promise<PublishEligibility> {
  const result: SafetyGateResult = await safetyGate.evaluate(skillName);

  switch (result.overallGrade) {
    case "UNSAFE":
      return {
        canPublish: false,
        reason: result.details.filter((d) => d.status === "blocked"),
      };
    case "SAFE_WITH_WARNINGS":
      return {
        canPublish: true,
        requiresConfirmation: true,
        warnings: result.details.filter((d) => d.status === "warned"),
      };
    case "SAFE":
      return { canPublish: true, requiresConfirmation: false };
  }
}
```

### 6-3. Task-08 が受け取るデータの保証

| 保証事項                                     | 条件式                                                          |
| -------------------------------------------- | --------------------------------------------------------------- |
| `details` は常に5要素を含む                  | `result.details.length === 5`                                   |
| `evaluatedAt` は呼び出し時点のタイムスタンプ | `result.evaluatedAt <= Date.now()`                              |
| `overallGrade` は `details` と整合する       | `calculateOverallGrade(result.details) === result.overallGrade` |
| `skillName` は入力値と一致する               | `result.skillName === inputSkillName`                           |

### 6-4. エラーケース

| エラーケース                       | SafetyGatePort の挙動                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| スキルが存在しない                 | `Promise` が reject される。エラーコード: `SKILL_NOT_FOUND`                     |
| 承認履歴が取得不能（IPC 通信失敗） | `Promise` が reject される。エラーコード: `HISTORY_UNAVAILABLE`                 |
| スキルのツール情報が不完全         | `deniedRatio` を `0.0` として算出し、`hasOnlyOncePerm` を `true` として算出する |

---

## 7. SafetyGatePort のモック注入パターン（テスト容易性）

### 7-1. DI パターン: Constructor Injection

```typescript
class PublishService {
  constructor(private readonly safetyGate: SafetyGatePort) {}

  async publish(skillName: string): Promise<PublishResult> {
    const safetyResult = await this.safetyGate.evaluate(skillName);
    // overallGrade に基づいて公開可否を判定
  }
}
```

### 7-2. テスト時のモック注入

```typescript
const mockGate: SafetyGatePort = {
  evaluate: vi.fn().mockResolvedValue({
    skillName: "test-skill",
    evaluatedAt: Date.now(),
    overallGrade: "SAFE",
    details: [
      {
        checkId: "CRITICAL_TOOL_REQUIRED",
        toolName: "",
        riskLevel: "low",
        status: "passed",
        message: "Critical リスクツールは含まれていません。",
      },
      {
        checkId: "HIGH_TOOL_REQUIRED",
        toolName: "",
        riskLevel: "low",
        status: "passed",
        message: "High リスクツールは含まれていません。",
      },
      {
        checkId: "NO_PERMANENT_APPROVAL",
        toolName: "",
        riskLevel: "low",
        status: "passed",
        message: "恒久許可が付与されています。",
      },
      {
        checkId: "ALL_LOW_TOOLS",
        toolName: "",
        riskLevel: "low",
        status: "passed",
        message: "低リスク操作のみを使用します。",
      },
      {
        checkId: "PROTECTED_PATH_ACCESS",
        toolName: "",
        riskLevel: "low",
        status: "passed",
        message: "保護パスへのアクセスはありません。",
      },
    ],
  } satisfies SafetyGateResult),
};

const service = new PublishService(mockGate);
```

### 7-3. DI パターンの選択根拠

- Constructor Injection を採用する（P34 参照: SafetyGatePort は PublishService 生成時点で利用可能なため、Setter Injection は不要）
- Task-08 の単体テストで SafetyGatePort のモックを注入することで、IPC 通信や PermissionStore への実アクセスなしにテスト実行が可能

---

## 8. 公開不可条件の設計根拠

### 8-1. CRITICAL_TOOL_REQUIRED（overallGrade: UNSAFE）

- Critical リスクツールは `rm -rf /`、`sudo`、`chmod 777`、`dd if=`、`mkfs` を含む不可逆的システム破壊操作を実行する
- 自己利用時はユーザーが操作内容を認識した上で `approved_once` で許可できるが、第三者がスキルを利用する場合はツール呼び出しの文脈を完全には理解できない
- 第三者の環境で Critical 操作が実行された場合、データ消失・システム破壊が不可逆的に発生し、復旧手段が存在しない

### 8-2. HIGH_TOOL_REQUIRED（overallGrade: SAFE_WITH_WARNINGS）

- High リスクツールはネットワーク越しのデータ送信（`curl`、`wget`）、機密パスアクセス（`~/.ssh/`、`~/.aws/`）を含む
- 第三者利用時に機密情報（SSH鍵、AWSクレデンシャル、環境変数）が外部に送信されるリスクがある
- 情報漏洩は発覚が遅延し、被害範囲の特定が困難であるため、警告表示で利用者にリスクを開示する

### 8-3. PROTECTED_PATH_ACCESS（overallGrade: UNSAFE）

- `DANGEROUS_PATTERNS.PROTECTED_PATHS`（25パターン）は `~/.ssh/`、`~/.aws/`、`~/.gnupg/`、`/etc/` 配下の設定ファイルを含む
- これらのパスへの書き込みはシステム設定の改ざんまたは認証情報の上書きを引き起こす

### 8-4. denied 率50%以上（WARN-1: 警告表示）

- `deniedRatio >= 0.5` は「ユーザー自身が権限要求の半数以上を拒否している」ことを意味する
- 閾値50%の根拠: 30%未満では個別の操作ミスと区別が困難。70%以上にすると、3件中2件を拒否しても警告が出ないため保護が不十分。50%は「半数以上が拒否」という直感的に理解可能な閾値
- 公開をブロックしない理由: denied の理由はユーザーごとに異なり、denied 率だけでスキルの品質を断定できないため、情報提供にとどめる

### 8-5. approved_once のみ（「未検証」ラベル付与）

- `hasOnlyOncePerm === true` は「ユーザーがスキルに対して恒久許可を一度も付与していない」ことを意味する
- 恒久許可が未付与 = 長期的な安全性が未検証 = スキルの安定した安全性が未証明

---

## 9. CTA 連動（SafetyGrade x CTA 状態マトリクス）

### 9-1. マトリクス

| SafetyGrade          | 「今すぐ使う」CTA  | INS-01 バナー            | 「公開」CTA            |
| -------------------- | ------------------ | ------------------------ | ---------------------- |
| `SAFE`               | 有効               | 非表示（Low リスクのみ） | 有効                   |
| `SAFE_WITH_WARNINGS` | 有効               | 表示（橙系）             | 確認ダイアログ後に有効 |
| `UNSAFE`             | 無効化（disabled） | 表示（赤系）             | 無効化（disabled）     |

### 9-2. CTA 制御の条件式

```typescript
// INS-01 バナー表示条件
const showINS01Banner: boolean =
  safetyResult.overallGrade === "UNSAFE" ||
  safetyResult.overallGrade === "SAFE_WITH_WARNINGS";

// 「今すぐ使う」CTA 無効化条件
const disableUseCTA: boolean = safetyResult.overallGrade === "UNSAFE";

// 「公開」CTA 無効化条件
const disablePublishCTA: boolean = safetyResult.overallGrade === "UNSAFE";

// 「公開」CTA に確認ダイアログが必要か
const requirePublishConfirmation: boolean =
  safetyResult.overallGrade === "SAFE_WITH_WARNINGS";
```

### 9-3. CTA 無効化時の UI 仕様

- 「今すぐ使う」ボタンは `disabled` 属性を付与し、`opacity: 0.4` で表示する
- ボタン下部に「このスキルは安全性チェックに不合格のため実行できません」テキストを表示する
- 「保存して後で使う」は `UNSAFE` でも有効とする（スキルの閲覧・編集は安全性に影響しないため）
- 「公開」ボタンは `UNSAFE` の場合 `disabled` 属性を付与し、ボタン下部に公開不可理由のリンクを表示する

---

## 10. 統合テスト連携表

| テスト種別  | テスト対象                     | 確認内容                                                                                          |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Unit        | `calculateOverallGrade`        | `blocked` が1件以上 → `UNSAFE`、`warned` が1件以上 → `SAFE_WITH_WARNINGS`、全て `passed` → `SAFE` |
| Unit        | `SafetyCheckDetail` 生成       | 各 `checkId` で正しい `status` と `message` テンプレートが返される                                |
| Unit        | `maxRiskLevel` 算出            | `RISK_LEVEL_ORDER` の最大値が正しく取得される（`critical > high > medium > low`）                 |
| Unit        | `requiresExplicitConsent` 算出 | `critical` → `true`、`low` + `deniedRatio=0.0` + `hasOnlyOncePerm=false` → `false`                |
| Unit        | `matchesProtectedPaths`        | `PROTECTED_PATHS` 25パターンに対してマッチ/非マッチが正しく判定される                             |
| Integration | `SafetyGatePort.evaluate`      | スキル定義から `SafetyGateResult` が生成され、`details.length === 5` である                       |
| Integration | Task-08 接続                   | `PublishService` が `evaluate` 結果の `overallGrade` で公開可否を正しく判定する                   |
| Integration | CTA 連動                       | `UNSAFE` で「今すぐ使う」CTA が `disabled`、`SAFE_WITH_WARNINGS` で INS-01 バナーが表示される     |
| Integration | モック注入                     | `new PublishService(mockGate)` で IPC 通信なしにテスト実行が完了する                              |

---

## 11. 検証可能性（テスト可能な条件式）

### 11-1. 各条件のテスト検証項目

| 検証項目                                             | テスト可能な条件式                                                               | 期待結果                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------- |
| Critical ツール含有で UNSAFE                         | `evaluate(skillWithCriticalTool).overallGrade`                                   | `"UNSAFE"`                |
| High ツール含有で SAFE_WITH_WARNINGS                 | `evaluate(skillWithHighTool).overallGrade`                                       | `"SAFE_WITH_WARNINGS"`    |
| Low ツールのみで SAFE                                | `evaluate(skillWithOnlyLowTools).overallGrade`                                   | `"SAFE"`                  |
| 保護パスアクセスで UNSAFE                            | `evaluate(skillWithProtectedPathWrite).details[4].status`                        | `"blocked"`               |
| details は常に5要素                                  | `result.details.length`                                                          | `5`                       |
| blocked が1件でも含まれれば overallGrade は UNSAFE   | `calculateOverallGrade([blockedDetail, ...passedDetails])`                       | `"UNSAFE"`                |
| モック注入で IPC なしにテスト実行可能                | `new PublishService(mockGate).publish(skillName)` が reject されない             | resolve する              |
| requiresExplicitConsent は Critical で true          | `contract.maxRiskLevel === "critical"` のとき `contract.requiresExplicitConsent` | `true`                    |
| denied 率50%以上で SAFE_WITH_WARNINGS                | `contract.deniedRatio >= 0.5` かつ `maxRiskLevel === "low"` のスキルを evaluate  | `overallGrade !== "SAFE"` |
| approved_once のみで NO_PERMANENT_APPROVAL が warned | 全ツールが `approved_once` のスキルの `details[2].status`                        | `"warned"`                |

### 11-2. 曖昧表現の排除確認

本文書で使用を禁止する曖昧語:

- 「適切に」 → 条件式で記述
- 「必要に応じて」 → 具体的なトリガー条件で記述
- 「など」 → 全項目を列挙
- 「可能な限り」 → 閾値または全数で記述

全セクションにおいて上記4語は使用していない。

---

## 12. requiresExplicitConsent の算出条件

Phase 1 OUT-5 セクション12で定義された算出条件を Phase 2 で正式に確定する。

### 12-1. 条件式

```typescript
function computeRequiresExplicitConsent(contract: {
  maxRiskLevel: ToolRiskLevel;
  deniedRatio: number;
  hasOnlyOncePerm: boolean;
}): boolean {
  return (
    contract.maxRiskLevel === "critical" ||
    contract.maxRiskLevel === "high" ||
    contract.deniedRatio >= 0.5 ||
    contract.hasOnlyOncePerm === true
  );
}
```

### 12-2. 条件の意味

| 条件                          | 意味                              | 同意が必要な理由                                                           |
| ----------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `maxRiskLevel === "critical"` | Critical リスクツールを含む       | 不可逆的破壊操作の公開は全面禁止であり、明示同意を要求した上でブロックする |
| `maxRiskLevel === "high"`     | High リスクツールを含む           | ネットワーク送信・機密パスアクセスを含むため、公開前にリスクを認識させる   |
| `deniedRatio >= 0.5`          | 権限要求の50%以上が拒否されている | スキルの安全性に対する作成者自身の懸念を第三者に開示するため               |
| `hasOnlyOncePerm === true`    | 恒久許可が一度も付与されていない  | 長期的安全性が未検証であることを明示し、公開の意思を再確認するため         |
