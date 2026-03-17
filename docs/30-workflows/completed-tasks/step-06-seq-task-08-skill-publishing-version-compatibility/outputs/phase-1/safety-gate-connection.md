# 安全性ゲート・観測指標 接続定義書

## メタ情報

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書       | Phase 1 - Task 3 成果物                                                                                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                                                                     |
| 作成日     | 2026-03-17                                                                                                                                  |
| 受入基準   | AC-3                                                                                                                                        |
| 依存タスク | TASK-SKILL-LIFECYCLE-06（安全性ゲート）, TASK-SKILL-LIFECYCLE-07（観測指標）                                                                |
| 参照仕様   | `step-05-par-task-06-trust-permission-governance/phase-2-design.md`, `TASK-SKILL-LIFECYCLE-07-lifecycle-history-feedback/phase-2-design.md` |

---

## 1. 依存タスク型マッピング

本節では、Task-06（安全性ゲート）と Task-07（観測指標）が定義した型を、Task-08 が公開可否判定に使う中間型へどのようにマッピングするかを規定する。

### 1.1 Task-06（安全性ゲート）からの入力

Task-06 の Phase 2 設計書（`step-05-par-task-06-trust-permission-governance/phase-2-design.md` ステップ 6）で定義された型を入力として使用する。

#### Task-06 実装型サマリー

```typescript
// packages/shared/src/types/safety-gate.ts（Task-06 定義）

/** Task-06 → Task-08 に渡す安全性チェック結果 */
interface SafetyGateResult {
  skillName: string;
  evaluatedAt: number; // Unix timestamp (ms)
  overallGrade: SafetyGrade;
  details: SafetyCheckDetail[];
}

type SafetyGrade =
  | "SAFE" // 全チェック通過。公開可能
  | "SAFE_WITH_WARNINGS" // 警告あり。ユーザー確認後に公開可能
  | "UNSAFE"; // 公開不可（Critical ツール要求が承認済みでも公開不可）

interface SafetyCheckDetail {
  checkId: string; // 例: "DANGEROUS_PATTERN_FOUND"
  toolName: string;
  riskLevel: ToolRiskLevel; // "critical" | "high" | "medium" | "low"
  status: "passed" | "warned" | "blocked";
  message: string; // ユーザー向けメッセージ
}

type ToolRiskLevel = "critical" | "high" | "medium" | "low";
```

#### SafetyGrade → ToolRiskLevel へのマッピング規則

`SafetyGateResult.overallGrade` を `SkillSafetyContract.maxRiskLevel` に変換するには、以下の規則を適用する。

| `overallGrade`         | `details` 内の最高 `riskLevel`    | `maxRiskLevel` 変換結果 |
| ---------------------- | --------------------------------- | ----------------------- |
| `"UNSAFE"`             | `"critical"` を含む               | `"critical"`            |
| `"UNSAFE"`             | `"high"` を含む（critical なし）  | `"high"`                |
| `"SAFE_WITH_WARNINGS"` | `"high"` を含む                   | `"high"`                |
| `"SAFE_WITH_WARNINGS"` | `"medium"` のみ                   | `"medium"`              |
| `"SAFE"`               | `"low"` のみ（または details 空） | `"low"`                 |

変換アルゴリズム（疑似コード）:

```
function convertToMaxRiskLevel(result: SafetyGateResult): ToolRiskLevel {
  // details から blocked または warned になっているチェックの最高リスクレベルを取得
  const activeDetails = result.details.filter(d => d.status !== "passed")
  if (activeDetails.some(d => d.riskLevel === "critical")) return "critical"
  if (activeDetails.some(d => d.riskLevel === "high"))     return "high"
  if (activeDetails.some(d => d.riskLevel === "medium"))   return "medium"
  return "low"
}
```

#### deniedRatio の算出規則

`SkillSafetyContract.deniedRatio` は `SafetyGateResult.details` の `passed: false`（`status === "blocked"`）の比率から算出する。

```
deniedRatio = details.filter(d => d.status === "blocked").length / details.length
```

`details` が空（`length === 0`）の場合は `deniedRatio = 0` とする。

#### hasOnlyOncePerm の算出規則

`SkillSafetyContract.hasOnlyOncePerm` は `PermissionStore` のセッション権限エントリを参照して算出する。

```
hasOnlyOncePerm = スキルに関連する全権限エントリが expiryPolicy === "session" のみで構成されている
               = permissionEntries.filter(e => e.skillName === skillName).every(e => e.expiryPolicy === "session")
```

`permissionEntries` が空（権限設定なし）の場合は `hasOnlyOncePerm = false` とする（権限確認が発生しないスキルは未検証ではない）。

---

### 1.2 Task-07（観測指標）からの入力

Task-07 の Phase 2 設計書（`TASK-SKILL-LIFECYCLE-07-lifecycle-history-feedback/phase-2-design.md`）で定義された型を入力として使用する。

#### Task-07 実装型サマリー

```typescript
// Task-07 が定義する集約ビュー型（タスク2: 集約ビュー設計より）
interface SkillAggregateView {
  skillId: string;
  skillName: string;
  totalExecutions: number;
  successRate: number; // 0.0 - 1.0（直近30日間の成功率）
  lastExecutedAt: string; // ISO 8601
  latestScore: number; // 0 - 100
  scoreHistory: ScoreDataPoint[];
  recentEvents: SkillLifecycleEvent[];
  trend: "improving" | "stable" | "declining";
}

// Task-07 が定義する公開判断メトリクス型（タスク4: Task08公開判断メトリクスインターフェース設計より）
interface PublishReadinessMetrics {
  skillId: string;
  qualityScore: number; // 最新評価スコア（0 - 100）
  stabilityScore: number; // 実行成功率（直近N回、0.0 - 1.0）
  usageCount: number; // 総実行回数
  hasCriticalFeedback: boolean; // 重大問題報告の有無
  readinessLevel: "not_ready" | "review_needed" | "ready";
}
```

#### Task-07 → AggregateView マッピング規則

| `AggregateView` フィールド | Task-07 実装型                                   | マッピング方法                                                                                 |
| -------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `testPassRate`             | `PublishReadinessMetrics.stabilityScore`         | 直接マッピング（`stabilityScore` の値をそのまま使用）                                          |
| `avgScore`                 | `SkillAggregateView.latestScore` を5点満点に変換 | `latestScore / 20`（100点満点 → 5点満点への換算）                                              |
| `hasCriticalFeedback`      | `PublishReadinessMetrics.hasCriticalFeedback`    | 直接マッピング（公開ブロック条件の補助情報として使用可。本仕様書の判定ロジックへは直接不使用） |

> **注意**: Task-07 の `PublishReadinessMetrics.success_rate` フィールドは Phase 1 要件定義書の表記であり、実際の Task-07 Phase 2 設計書では `stabilityScore` として定義されている。Phase 5（実装）でアダプタを作成する際は `stabilityScore` フィールドを参照すること。

---

### 1.3 SkillSafetyContract 中間型定義

Task-06 の `SafetyGateResult` + `PermissionStore` から合成する、Task-08 専用の中間型。

```typescript
// 本仕様書が定義する中間型（packages/shared/src/types/publish-eligibility.ts に追加予定）

/**
 * Task-06 出力を公開可否判定用に変換した中間型。
 * Phase 5 で SafetyGateResult + PermissionStore から合成するアダプタ関数を実装する。
 */
interface SkillSafetyContract {
  /** スキルが使用するツールの最高リスクレベル。SafetyGateResult.overallGrade と details から変換。 */
  maxRiskLevel: "low" | "medium" | "high" | "critical";

  /**
   * 実行セッション中に権限が拒否された操作の比率（0.0〜1.0）。
   * SafetyGateResult.details の status === "blocked" の件数 / details.length で算出。
   * details が空の場合は 0。
   */
  deniedRatio: number;

  /**
   * スキルに関連する権限エントリが全てセッション限定（once）のみで構成されているか。
   * PermissionStore の当該スキルの全エントリの expiryPolicy === "session" の場合に true。
   * 権限エントリが存在しない場合は false。
   */
  hasOnlyOncePerm: boolean;

  /** 算出に使用した SafetyGateResult の evaluatedAt タイムスタンプ（ms）。 */
  evaluatedAt: number;
}
```

---

### 1.4 AggregateView 中間型定義

Task-07 の `PublishReadinessMetrics` + `SkillAggregateView` から合成する、Task-08 専用の中間型。

```typescript
/**
 * Task-07 出力を公開可否判定用に変換した中間型。
 * Phase 5 で PublishReadinessMetrics + SkillAggregateView から合成するアダプタ関数を実装する。
 */
interface AggregateView {
  /**
   * テスト通過率（0.0〜1.0）。
   * PublishReadinessMetrics.stabilityScore を直接マッピング。
   */
  testPassRate: number;

  /**
   * 平均スコア（5点満点）。
   * SkillAggregateView.latestScore を 20 で除算して換算（100点満点 → 5点満点）。
   */
  avgScore: number;

  /** 重大問題報告の有無（PublishReadinessMetrics.hasCriticalFeedback の直接マッピング）。 */
  hasCriticalFeedback: boolean;

  /** 総実行回数（PublishReadinessMetrics.usageCount の直接マッピング）。 */
  usageCount: number;
}
```

---

## 2. 公開可否判定ロジック

### 2.1 公開ブロック条件

以下の条件が **true** の場合、公開操作を完全にブロックする（ユーザーが「公開する」ボタンを押下できない状態にする）。

**条件式（テスト可能な形式）**:

```
isBlocked = (
  SkillSafetyContract.maxRiskLevel === "critical" ||
  SkillSafetyContract.maxRiskLevel === "high"
)
```

**ブロック時の UI 挙動**:

- 「公開する」ボタンを非活性（disabled）状態にする
- `blockReasons` に「このスキルは高リスクな操作（{toolName}）を要求しています。公開にはリスクレベルを medium 以下に下げる必要があります」を表示する

**ブロック解除条件**:

- スキルのプロンプト・設定を変更し、High/Critical ツールを使用しない形に修正してから再評価を実行し、`maxRiskLevel` が `"medium"` 以下になった場合

---

### 2.2 公開警告条件

以下の条件のうち **1件以上** が true の場合、警告を表示する。ブロックはせず、ユーザーが「理解した上で公開する」チェックボックスをONにした場合のみ公開処理に進む。

| 警告ID  | 条件式                                         | 警告メッセージ                                                                                                          |
| ------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| WARN-01 | `SkillSafetyContract.deniedRatio >= 0.5`       | 「過去の実行で50%以上（{deniedRatio\*100}%）の操作が権限拒否されています。他のユーザーが実行できない可能性があります」  |
| WARN-02 | `SkillSafetyContract.hasOnlyOncePerm === true` | 「このスキルの権限はセッション限定でのみ承認されています。公開後、他のユーザーが毎回権限確認を求められます」            |
| WARN-03 | `AggregateView.testPassRate < 0.8`             | 「テスト通過率が80%未満（{testPassRate\*100}%）です。品質が不安定な状態での公開はユーザー体験を損なう可能性があります」 |

**警告の優先度順（複数該当時の表示順）**: WARN-01 > WARN-02 > WARN-03

---

### 2.3 公開推奨条件

以下の **全ての条件** を満たす場合に「推奨バッジ」を付与する。バッジはオプションであり、付与されない場合も公開を妨げない。

**条件式（テスト可能な形式）**:

```
isRecommended = (
  SkillSafetyContract.maxRiskLevel === "low" &&
  AggregateView.testPassRate >= 0.95 &&
  AggregateView.avgScore >= 4.0
)
```

| 条件                                         | 閾値・値           | 意味                              |
| -------------------------------------------- | ------------------ | --------------------------------- |
| `SkillSafetyContract.maxRiskLevel === "low"` | `"low"` と一致     | 全ツールが低リスクのみ            |
| `AggregateView.testPassRate >= 0.95`         | `0.95`（95%以上）  | 高い安定性                        |
| `AggregateView.avgScore >= 4.0`              | `4.0`（5点満点中） | 高品質評価（100点換算で80点以上） |

---

## 3. 公開前チェックリスト

公開操作開始時に自動実行するチェック項目の一覧。チェック結果は `PublishEligibility.checklistResults` に格納し、UI に表示する。

| ID     | チェック項目                         | 合否条件                                                    |
| ------ | ------------------------------------ | ----------------------------------------------------------- | --- | -------------------------- |
| CHK-01 | リスクレベルが中程度以下であること   | `SkillSafetyContract.maxRiskLevel === "low"                 |     | maxRiskLevel === "medium"` |
| CHK-02 | テスト通過率が80%以上であること      | `AggregateView.testPassRate >= 0.8`                         |
| CHK-03 | ライセンスが設定されていること       | `metadata.license !== "" && metadata.license !== undefined` |
| CHK-04 | タグが1件以上設定されていること      | `metadata.tags.length >= 1`                                 |
| CHK-05 | スキルの説明文が20文字以上であること | `metadata.description.length >= 20`                         |

**合否判定の評価順序**: CHK-01 → CHK-02 → CHK-03 → CHK-04 → CHK-05（全件を評価し、結果を `checklistResults` に格納する。途中で評価を打ち切らない）

**「公開する」ボタンの活性条件**:

- `isBlocked === false`（必須）
- かつ CHK-01〜CHK-05 が全件 `passed: true`（必須）
- かつ `warnings` が1件以上ある場合は「理解した上で公開する」チェックボックスが ON（必須）

---

## 4. PublishEligibility 型定義

```typescript
// packages/shared/src/types/publish-eligibility.ts（新規追加）

/**
 * スキルの公開可否判定結果。
 * Task-08 の PublishCheckService が SkillSafetyContract + AggregateView を入力として生成する。
 */
interface PublishEligibility {
  /** true: 公開操作を完全にブロック（SkillSafetyContract.maxRiskLevel が "high" または "critical"）。 */
  isBlocked: boolean;

  /**
   * 公開をブロックしている理由の一覧（日本語メッセージ）。
   * isBlocked === false の場合は空配列。
   * isBlocked === true の場合は1件以上含む。
   */
  blockReasons: string[];

  /**
   * 公開を推奨しないが強制ブロックはしない理由の一覧（日本語メッセージ）。
   * 空配列の場合は警告なし。
   * 1件以上ある場合はユーザーに「理解した上で公開する」の確認を求める。
   */
  warnings: string[];

  /**
   * 推奨バッジを付与するか。
   * maxRiskLevel === "low" && testPassRate >= 0.95 && avgScore >= 4.0 の全条件を満たす場合のみ true。
   */
  isRecommended: boolean;

  /**
   * 公開前チェックリストの各項目の結果。
   * CHK-01〜CHK-05 の全件を含む（途中打ち切りなし）。
   */
  checklistResults: {
    /** チェック項目の識別子（例: "CHK-01"）。 */
    item: string;
    /** true: チェック通過、false: チェック不合格。 */
    passed: boolean;
    /** チェック内容の日本語説明（UIに表示するラベル文字列）。 */
    label: string;
  }[];
}
```

---

## 5. 判定フロー図

```
[公開操作トリガー]
        |
        v
[1] SafetyGatePort.evaluate(skillName) を呼び出す
        |
        v
[2] convertToMaxRiskLevel(SafetyGateResult) を実行
        |
        v
[3] PermissionStore からセッション権限を取得し hasOnlyOncePerm を算出
        |
        v
[4] PublishReadinessMetrics を取得し testPassRate, avgScore を算出
        |
        v
[5] SkillSafetyContract を合成
    {maxRiskLevel, deniedRatio, hasOnlyOncePerm, evaluatedAt}
        |
        v
[6] AggregateView を合成
    {testPassRate, avgScore, hasCriticalFeedback, usageCount}
        |
        v
[7] isBlocked を評価
    maxRiskLevel === "critical" || maxRiskLevel === "high"
        |
        ├─ true  ─→ blockReasons に理由を追加 ─→ [10] PublishEligibility を返す
        |
        └─ false ─→ [8]
        |
        v
[8] warnings を評価（WARN-01〜WARN-03 を全件チェック）
        |
        v
[9] isRecommended を評価
    maxRiskLevel === "low" && testPassRate >= 0.95 && avgScore >= 4.0
        |
        v
[10] checklistResults を評価（CHK-01〜CHK-05 を全件チェック）
        |
        v
[11] PublishEligibility を返す
        |
        v
[12] UI に結果を表示:
    isBlocked === true  → 「公開する」ボタンを非活性化 + blockReasons を表示
    warnings.length > 0 → 警告バナー + 「理解した上で公開する」チェックボックスを表示
    isRecommended === true → 推奨バッジを表示
    checklistResults を全件リスト表示（通過/不合格をアイコンで区別）
```

---

## 6. テスト可能な条件式サマリー

Phase 4（テスト作成）でテストケース設計の基盤として使用する条件式の一覧。

### 6.1 公開ブロック条件（テストケース設計用）

| テストケースID | 入力条件                      | 期待される `isBlocked` | 期待される `blockReasons` 件数 |
| -------------- | ----------------------------- | ---------------------- | ------------------------------ |
| TC-BLOCK-01    | `maxRiskLevel === "critical"` | `true`                 | 1件以上                        |
| TC-BLOCK-02    | `maxRiskLevel === "high"`     | `true`                 | 1件以上                        |
| TC-BLOCK-03    | `maxRiskLevel === "medium"`   | `false`                | 0件                            |
| TC-BLOCK-04    | `maxRiskLevel === "low"`      | `false`                | 0件                            |

### 6.2 公開警告条件（テストケース設計用）

| テストケースID | 入力条件                                                                  | 期待される `warnings` 件数 | 期待される警告ID       |
| -------------- | ------------------------------------------------------------------------- | -------------------------- | ---------------------- |
| TC-WARN-01     | `deniedRatio >= 0.5`（例: `deniedRatio === 0.5`）                         | 1件以上                    | WARN-01 を含む         |
| TC-WARN-02     | `deniedRatio === 0.49`                                                    | WARN-01 なし               | WARN-01 を含まない     |
| TC-WARN-03     | `hasOnlyOncePerm === true`                                                | 1件以上                    | WARN-02 を含む         |
| TC-WARN-04     | `testPassRate === 0.79`（`0.8` 未満）                                     | 1件以上                    | WARN-03 を含む         |
| TC-WARN-05     | `testPassRate === 0.8`（`0.8` 以上）                                      | WARN-03 なし               | WARN-03 を含まない     |
| TC-WARN-06     | `deniedRatio === 0.6 && hasOnlyOncePerm === true && testPassRate === 0.7` | 3件                        | WARN-01, 02, 03 を含む |

### 6.3 公開推奨条件（テストケース設計用）

| テストケースID | 入力条件                                                                | 期待される `isRecommended`         |
| -------------- | ----------------------------------------------------------------------- | ---------------------------------- |
| TC-REC-01      | `maxRiskLevel === "low" && testPassRate === 0.95 && avgScore === 4.0`   | `true`                             |
| TC-REC-02      | `maxRiskLevel === "low" && testPassRate === 1.0 && avgScore === 5.0`    | `true`                             |
| TC-REC-03      | `maxRiskLevel === "medium" && testPassRate === 1.0 && avgScore === 5.0` | `false`（maxRiskLevel 条件不成立） |
| TC-REC-04      | `maxRiskLevel === "low" && testPassRate === 0.94 && avgScore === 5.0`   | `false`（testPassRate 条件不成立） |
| TC-REC-05      | `maxRiskLevel === "low" && testPassRate === 1.0 && avgScore === 3.9`    | `false`（avgScore 条件不成立）     |

### 6.4 チェックリスト条件（テストケース設計用）

| テストケースID | チェックID | 合格条件の境界値                              | 期待結果        |
| -------------- | ---------- | --------------------------------------------- | --------------- |
| TC-CHK-01A     | CHK-01     | `maxRiskLevel === "medium"`                   | `passed: true`  |
| TC-CHK-01B     | CHK-01     | `maxRiskLevel === "high"`                     | `passed: false` |
| TC-CHK-02A     | CHK-02     | `testPassRate === 0.8`                        | `passed: true`  |
| TC-CHK-02B     | CHK-02     | `testPassRate === 0.79`                       | `passed: false` |
| TC-CHK-03A     | CHK-03     | `license === "MIT"`                           | `passed: true`  |
| TC-CHK-03B     | CHK-03     | `license === ""`                              | `passed: false` |
| TC-CHK-04A     | CHK-04     | `tags.length === 1`                           | `passed: true`  |
| TC-CHK-04B     | CHK-04     | `tags.length === 0`                           | `passed: false` |
| TC-CHK-05A     | CHK-05     | `description.length === 20`（ちょうど20文字） | `passed: true`  |
| TC-CHK-05B     | CHK-05     | `description.length === 19`                   | `passed: false` |

---

## 7. 検証可能性

本文書の受入基準 AC-3 に対する検証方法を定義する。

### AC-3 充足確認チェックリスト

- [x] `SkillSafetyContract.maxRiskLevel` の定義と `SafetyGateResult.overallGrade` からの変換規則が記載されている（セクション 1.1）
- [x] `SkillSafetyContract.deniedRatio` の算出式（`status === "blocked"` の件数比率）が記載されている（セクション 1.1）
- [x] `SkillSafetyContract.hasOnlyOncePerm` の判定条件（`expiryPolicy === "session"` のみの場合 true）が記載されている（セクション 1.1）
- [x] `AggregateView.testPassRate` の変換規則（`PublishReadinessMetrics.stabilityScore` の直接マッピング）が記載されている（セクション 1.2）
- [x] `AggregateView.avgScore` の変換規則（`latestScore / 20` による5点満点換算）が記載されている（セクション 1.2）
- [x] 公開ブロック条件（`maxRiskLevel === "critical" || maxRiskLevel === "high"`）が条件式で定義されている（セクション 2.1）
- [x] 公開警告条件 WARN-01（`deniedRatio >= 0.5`）が数値付きで定義されている（セクション 2.2）
- [x] 公開警告条件 WARN-02（`hasOnlyOncePerm === true`）が定義されている（セクション 2.2）
- [x] 公開警告条件 WARN-03（`testPassRate < 0.8`）が数値付きで定義されている（セクション 2.2）
- [x] 公開推奨条件（全3条件）が数値付きで定義されている（セクション 2.3）
- [x] 公開前チェックリスト CHK-01〜CHK-05 が条件式で定義されている（セクション 3）
- [x] `PublishEligibility` 型の全フィールドが定義されている（セクション 4）
- [x] 判定フロー図が記載されている（セクション 5）
- [x] テスト可能な条件式サマリーが記載されている（セクション 6）

### Phase 5 実装への引き継ぎ事項

Phase 5（実装）でアダプタを作成する際は以下の点に注意する。

1. **SafetyGateResult → SkillSafetyContract の変換関数** は `packages/shared/src/utils/safety-contract-adapter.ts` に配置する（DI対応のため、`SafetyGatePort` インターフェース経由で呼び出す）
2. **PublishReadinessMetrics → AggregateView の変換関数** は `packages/shared/src/utils/aggregate-view-adapter.ts` に配置する
3. **`details` が空配列の場合** の境界値処理（`deniedRatio = 0`、`maxRiskLevel = "low"` の扱い）を実装に含める
4. **`permissionEntries` が空の場合** の境界値処理（`hasOnlyOncePerm = false`）を実装に含める
5. `PublishReadinessMetrics.success_rate`（Phase 1 要件定義書の表記）は `stabilityScore`（Task-07 Phase 2 設計書の実際のフィールド名）に読み替えること（P45 対策: 命名ドリフト防止）
