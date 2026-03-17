# 公開可否判定ロジック設計書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| 文書       | Phase 2 - Task 5 成果物                        |
| タスクID   | TASK-SKILL-LIFECYCLE-08                        |
| 作成日     | 2026-03-17                                     |
| 受入基準   | AC-3                                           |
| 依存成果物 | `outputs/phase-1/safety-gate-connection.md`    |
| 後続Phase  | Phase 3（設計レビュー）、Phase 4（テスト作成） |

---

## 1. Task06入力型（安全性ゲート）

### 1.1 ToolRiskLevel

`ToolRiskLevel` はスキルが要求するツールの危険度を4段階で表す型。Task-06 の `SafetyCheckDetail.riskLevel` と同一の値セットを使用する。

```typescript
/** スキルが使用するツールの最高リスクレベル。SafetyGateResult.overallGrade と details から変換して得る。 */
type ToolRiskLevel = "low" | "medium" | "high" | "critical";
```

各値の意味:

| 値           | 意味                                                           | 例                                         |
| ------------ | -------------------------------------------------------------- | ------------------------------------------ |
| `"low"`      | ファイル読み取り・テキスト処理など、影響が最小限の操作のみ     | 読み取り専用ファイルアクセス、計算処理     |
| `"medium"`   | ファイル書き込み・ネットワーク通信など、限定的な影響を持つ操作 | ローカルファイル変更、外部API呼び出し      |
| `"high"`     | システム設定変更・秘密情報アクセスなど、影響範囲が広い操作     | 環境変数変更、秘密鍵読み取り               |
| `"critical"` | データ削除・権限昇格など、回復不能な操作                       | ファイル一括削除、管理者権限の実行コマンド |

Task-06実装型 `SafetyGateResult.overallGrade` からのマッピング:

```
SafetyGateResult.overallGrade → SafetyCheckDetail[].riskLevel の最高値 → ToolRiskLevel
```

変換アルゴリズム（Phase 1 `safety-gate-connection.md` セクション1.1より再掲）:

```
function convertToToolRiskLevel(result: SafetyGateResult): ToolRiskLevel {
  const activeDetails = result.details.filter(d => d.status !== "passed")
  if (activeDetails.some(d => d.riskLevel === "critical")) return "critical"
  if (activeDetails.some(d => d.riskLevel === "high"))     return "high"
  if (activeDetails.some(d => d.riskLevel === "medium"))   return "medium"
  return "low"
}
```

---

### 1.2 SafetyGateStatus

`SafetyGateStatus` は安全性ゲート全体の承認状態を表す型。Task-06 の `PermissionStore` のセッション権限エントリ群から判定する。

```typescript
/** 安全性ゲートの承認状態。PermissionStore のセッション権限エントリから判定する。 */
type SafetyGateStatus = "approved" | "pending" | "rejected";
```

各値の意味と判定条件:

| 値           | 意味                                 | 判定条件                                                                 |
| ------------ | ------------------------------------ | ------------------------------------------------------------------------ |
| `"approved"` | 公開に必要な権限評価が完了し承認済み | `SafetyGateResult.overallGrade === "SAFE"` または `"SAFE_WITH_WARNINGS"` |
| `"pending"`  | 安全性評価が未実施または評価中       | 評価が存在しない、または評価の `evaluatedAt` が24時間以上前（失効扱い）  |
| `"rejected"` | 安全性評価の結果、公開不可と判定     | `SafetyGateResult.overallGrade === "UNSAFE"`                             |

> **注意**: `"pending"` はスキルが一度も安全性評価を受けていない初期状態、または評価が失効した状態を表す。公開フローで `"pending"` の場合は「安全性評価を実行してください」という誘導UIを表示する。`"rejected"` は即座に `"blocked"` 判定となる（セクション3 ケース12 参照）。

---

### 1.3 SecurityScanResult

`SecurityScanResult` は安全性チェックの集計結果を表す型。Phase 1 の `SkillSafetyContract.deniedRatio` をセキュリティスキャン観点で拡張したもの。

Task-06 の `SafetyGateResult.details[]` の `passed: false`（`status === "blocked"`）比率から算出する。

各フィールドの算出規則:

| フィールド         | 型        | 算出規則                                                                           |
| ------------------ | --------- | ---------------------------------------------------------------------------------- |
| `passed`           | `boolean` | `details` に `status === "blocked"` の項目が0件の場合のみ `true`                   |
| `criticalFindings` | `number`  | `details.filter(d => d.status === "blocked" && d.riskLevel === "critical").length` |
| `warnings`         | `number`  | `details.filter(d => d.status === "warned").length`                                |

境界値処理:

- `details` が空配列（`length === 0`）の場合: `passed = true`、`criticalFindings = 0`、`warnings = 0`

---

### 1.4 SafetyGateInput 型（Task-08 入力型）

Task-06 の `SafetyGateResult` と `PermissionStore` から合成される、`PublishReadinessChecker` への入力型。

```typescript
/**
 * Task-06 出力を公開可否判定用に変換した入力型。
 * Phase 5 でアダプタ関数を実装し、SafetyGateResult + PermissionStore から合成する。
 * （名称注意: Task-06 が実装した SafetyGateResult とは別の型。Task-08 独自の入力型。）
 */
interface SafetyGateInput {
  /**
   * スキルが要求するツールの最高リスクレベル。
   * Task-06 の SafetyGateResult.overallGrade と details から convertToToolRiskLevel() で変換。
   */
  riskLevel: ToolRiskLevel;

  /**
   * 安全性ゲートの承認状態。
   * Task-06 の SafetyGateResult.overallGrade から判定する。
   * "rejected" の場合は即座に "blocked" 判定となる（ケース12）。
   */
  gateStatus: SafetyGateStatus;

  /**
   * セキュリティスキャンの集計結果。
   * Task-06 の SafetyGateResult.details[] から算出する。
   */
  securityScan: {
    /** details に status === "blocked" が0件なら true */
    passed: boolean;
    /** riskLevel === "critical" かつ status === "blocked" の件数 */
    criticalFindings: number;
    /** status === "warned" の件数 */
    warnings: number;
  };
}
```

> **設計注記（フィールド命名）**: `gateStatus` は Phase 1 `safety-gate-connection.md` の `SafetyGateStatus` 型に対応する。セクション5のインターフェース定義で `safetyGate: SafetyGateInput` として参照する。P45対策として、フィールド名は値のセマンティクスに一致させる（`gateStatus` = ゲートの承認状態、`securityScan` = スキャン集計結果）。

---

## 2. Task07入力型（観測指標）

### 2.1 QualityTrend

`QualityTrend` は直近の品質スコアの時系列変化を表す型。Task-07 の `SkillAggregateView.trend` を直接マッピングする。

```typescript
type QualityTrend = "improving" | "stable" | "declining";
```

| 値            | 意味                             | Task-07での算出方法                        |
| ------------- | -------------------------------- | ------------------------------------------ |
| `"improving"` | 直近の品質スコアが上昇傾向にある | `SkillAggregateView.trend === "improving"` |
| `"stable"`    | 直近の品質スコアが横ばいである   | `SkillAggregateView.trend === "stable"`    |
| `"declining"` | 直近の品質スコアが低下傾向にある | `SkillAggregateView.trend === "declining"` |

---

### 2.2 ObservabilityMetrics 型

Task-07 の `PublishReadinessMetrics` と `SkillAggregateView` から合成される、`PublishReadinessChecker` への入力型。

```typescript
/**
 * Task-07 出力を公開可否判定用に変換した入力型。
 * Phase 5 でアダプタ関数を実装し、PublishReadinessMetrics + SkillAggregateView から合成する。
 */
interface ObservabilityMetrics {
  /**
   * 実行成功率（0〜100の整数値）。直近30日間の成功率。
   * PublishReadinessMetrics.stabilityScore を Math.round(stabilityScore * 100) で変換。
   * 実行履歴がない場合は 0。
   */
  successRate: number; // 0-100, 直近30日

  /**
   * 品質スコアトレンド。
   * SkillAggregateView.trend（SkillAggregateView.avgScore の時系列変化）を直接マッピング。
   */
  qualityTrend: QualityTrend; // avgScoreの時系列変化

  /**
   * ユーザーフィードバックスコア（0〜5）。
   * SkillAggregateView.latestScore を latestScore / 20 で換算（100点満点 → 5点満点）。
   * フィードバックデータが存在しない場合は 0（= データなし）。
   */
  feedbackScore: number; // 0-5 (0=データなし)
}
```

Task07実装型からのマッピング:

| `ObservabilityMetrics` フィールド | Task-07 実装型                           | マッピング方法                                                  |
| --------------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| `successRate`                     | `PublishReadinessMetrics.stabilityScore` | `Math.round(stabilityScore * 100)`（0.0〜1.0 → 0〜100の整数値） |
| `qualityTrend`                    | `SkillAggregateView.trend`               | 直接マッピング（`"improving"` / `"stable"` / `"declining"`）    |
| `feedbackScore`                   | `SkillAggregateView.latestScore`         | `latestScore / 20`（100点満点 → 5点満点への換算）               |

> **命名注意（P45対策）**: Phase 1 要件定義書では `PublishReadinessMetrics.success_rate` と記載されているが、Task-07 Phase 2 設計書の実際のフィールド名は `stabilityScore`。Phase 5 実装時は `stabilityScore` を参照すること。

---

## 3. PublishReadiness 型定義

### 3.1 4ステータスの判別式

```typescript
/**
 * 公開可否判定の結果型。
 * PublishReadinessChecker.check() の戻り値として使用する。
 * packages/shared/src/types/publish-eligibility.ts に追加する（DI境界: Main↔Renderer間で共有）。
 */
type PublishReadiness =
  | { status: "auto-approved" }
  | { status: "review-required"; reasons: string[] }
  | { status: "manual-approval-required"; reasons: string[] }
  | { status: "blocked"; reasons: string[] };
```

Phase 1 `PublishEligibility` からのマッピング:

| Phase 1 `PublishEligibility` の状態                              | Phase 2 `PublishReadiness` のステータス                 | マッピング根拠                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `isBlocked === true`（riskLevel が critical）                    | `"blocked"`                                             | クリティカルリスクまたは安全性ゲート拒否は公開ブロック |
| `isBlocked === true`（riskLevel が high）                        | `"manual-approval-required"`                            | Phase 2 で high を blocked から細分化                  |
| `isBlocked === false` かつ `warnings.length > 0`（中程度の懸念） | `"review-required"` または `"manual-approval-required"` | riskLevel・指標値により分岐                            |
| `isRecommended === true`                                         | `"auto-approved"`                                       | 全条件を満たす最高品質スキル                           |

各ステータスへの振り分け条件（条件式形式）:

```
"blocked" の条件:
  safetyGate.riskLevel === "critical"
  OR safetyGate.gateStatus === "rejected"

"manual-approval-required" の条件（blocked でない場合）:
  safetyGate.riskLevel === "high"
  OR (safetyGate.riskLevel === "medium" AND metrics.successRate < 90)
  OR (safetyGate.riskLevel === "medium" AND NOT safetyGate.securityScan.passed)
  OR (safetyGate.riskLevel === "medium" AND metrics.qualityTrend !== "improving")
  OR (safetyGate.riskLevel === "medium" AND metrics.successRate >= 90
        AND safetyGate.securityScan.passed AND metrics.qualityTrend === "improving"
        AND metrics.feedbackScore > 0 AND metrics.feedbackScore < 3.5)

"review-required" の条件（blocked / manual-approval-required でない場合）:
  safetyGate.riskLevel === "low" AND metrics.successRate < 80
  OR safetyGate.riskLevel === "low" AND NOT safetyGate.securityScan.passed
  OR safetyGate.riskLevel === "low" AND metrics.qualityTrend === "declining"
  OR safetyGate.riskLevel === "low" AND metrics.feedbackScore > 0 AND metrics.feedbackScore < 3.0
  OR safetyGate.riskLevel === "medium" AND metrics.successRate >= 90
       AND safetyGate.securityScan.passed AND metrics.qualityTrend === "improving"
       AND (metrics.feedbackScore === 0 OR metrics.feedbackScore >= 3.5)

"auto-approved" の条件（その他全ての場合）:
  safetyGate.riskLevel === "low"
  AND metrics.successRate >= 80
  AND safetyGate.securityScan.passed === true
  AND (metrics.qualityTrend === "stable" OR metrics.qualityTrend === "improving")
  AND (metrics.feedbackScore === 0 OR metrics.feedbackScore >= 3.0)
```

`reasons` フィールドに含めるメッセージの例:

| ステータス                   | reasons の例                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `"blocked"`                  | `["クリティカルリスクのツールを使用しています。スキルを修正してください"]`     |
|                              | `["安全性ゲートが公開を拒否しています（overallGrade: UNSAFE）"]`               |
| `"manual-approval-required"` | `["ハイリスクなツールを使用しています（管理者承認が必要です）"]`               |
|                              | `["実行成功率が90%未満です（現在: {successRate}%）"]`                          |
|                              | `["セキュリティスキャンで問題が検出されました（重大: {criticalFindings}件）"]` |
|                              | `["フィードバックスコアが3.5未満です（現在: {feedbackScore}）"]`               |
| `"review-required"`          | `["実行成功率が80%未満です（現在: {successRate}%）"]`                          |
|                              | `["品質スコアが低下傾向にあります"]`                                           |
|                              | `["セキュリティスキャンで警告が検出されました"]`                               |
|                              | `["フィードバックスコアが3.0未満です（現在: {feedbackScore}）"]`               |

---

## 4. 公開可否判定マトリクス（全ケース）

判定に使用する入力フィールドと閾値の対応:

| 入力フィールド                   | 判定で使用する値                           |
| -------------------------------- | ------------------------------------------ |
| `safetyGate.riskLevel`           | `ToolRiskLevel` の4段階                    |
| `safetyGate.gateStatus`          | `"approved"` / `"pending"` / `"rejected"`  |
| `safetyGate.securityScan.passed` | `boolean`                                  |
| `metrics.successRate`            | 数値（0〜100）との比較                     |
| `metrics.qualityTrend`           | `"improving"` / `"stable"` / `"declining"` |
| `metrics.feedbackScore`          | 数値（0〜5、0=データなし）との比較         |

判定マトリクス（全ケース網羅、RiskLevel × 条件分岐の全組み合わせ）:

| #   | RiskLevel    | 成功率 | トレンド                        | SecurityScan                        | feedbackScore           | 判定                                         |
| --- | ------------ | ------ | ------------------------------- | ----------------------------------- | ----------------------- | -------------------------------------------- |
| 1   | `"low"`      | >= 80% | `"stable"` または `"improving"` | `passed: true`                      | >= 3.0 または 0（なし） | **自動公開可（auto-approved）**              |
| 2   | `"low"`      | >= 80% | `"stable"` または `"improving"` | `passed: true`                      | > 0 かつ < 3.0          | **レビュー後公開（review-required）**        |
| 3   | `"low"`      | >= 80% | `"declining"`                   | `passed: true`                      | 任意                    | **レビュー後公開（review-required）**        |
| 4   | `"low"`      | >= 80% | 任意                            | `passed: false`                     | 任意                    | **レビュー後公開（review-required）**        |
| 5   | `"low"`      | < 80%  | 任意                            | 任意                                | 任意                    | **レビュー後公開（review-required）**        |
| 6   | `"medium"`   | >= 90% | `"improving"`                   | `passed: true`                      | >= 3.5 または 0（なし） | **レビュー後公開（review-required）**        |
| 7   | `"medium"`   | >= 90% | `"improving"`                   | `passed: true`                      | > 0 かつ < 3.5          | **手動承認必須（manual-approval-required）** |
| 8   | `"medium"`   | >= 90% | `"stable"` または `"declining"` | `passed: true`                      | 任意                    | **手動承認必須（manual-approval-required）** |
| 9   | `"medium"`   | >= 90% | 任意                            | `passed: false`                     | 任意                    | **手動承認必須（manual-approval-required）** |
| 10  | `"medium"`   | < 90%  | 任意                            | 任意                                | 任意                    | **手動承認必須（manual-approval-required）** |
| 11  | `"high"`     | 任意   | 任意                            | 任意                                | 任意                    | **手動承認必須（manual-approval-required）** |
| 12  | 任意         | 任意   | 任意                            | 任意（`gateStatus === "rejected"`） | 任意                    | **公開不可（blocked）**                      |
| 13  | `"critical"` | 任意   | 任意                            | 任意                                | 任意                    | **公開不可（blocked）**                      |

> **ケース優先度**: ケース12（`gateStatus === "rejected"`）とケース13（`riskLevel === "critical"`）はブロッキング条件として最優先で評価する。ケース12はケース11〜13のいずれかに該当しても、`gateStatus` チェックが先行する。

各判定ステータスの意味:

| ステータス                   | 意味                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `"auto-approved"`            | 全条件を満たしており、手動操作なしで公開処理に進められる                     |
| `"review-required"`          | 品質・安全性の懸念事項あり。担当者による確認後に公開可                       |
| `"manual-approval-required"` | リスクが高く、管理者の明示的な承認が必要                                     |
| `"blocked"`                  | クリティカルリスクまたはゲート拒否のため公開不可。スキル修正後に再評価が必要 |

---

## 5. PublishReadinessChecker インターフェース

```typescript
/**
 * 公開可否判定ロジックのインターフェース（Port）。
 * IPC ハンドラ登録関数の引数型として使用する（P61準拠: 具象クラスではなくインターフェースに依存）。
 * packages/shared/src/types/publish-eligibility.ts に追加する。
 */
interface PublishReadinessChecker {
  /**
   * 安全性ゲート結果と観測指標を基に公開可否を判定する。
   *
   * @param safetyGate - Task-06 出力から変換した安全性ゲート入力型
   * @param metrics    - Task-07 出力から変換した観測指標入力型
   * @returns PublishReadiness - 4段階の判定結果（reasons には日本語メッセージを含む）
   */
  check(
    safetyGate: SafetyGateInput,
    metrics: ObservabilityMetrics,
  ): PublishReadiness;
}
```

実装クラスの配置先（Phase 5 実装時の参考）:

| クラス名                         | 配置先                                                                     |
| -------------------------------- | -------------------------------------------------------------------------- |
| `DefaultPublishReadinessChecker` | `apps/desktop/src/main/services/publish/DefaultPublishReadinessChecker.ts` |
| インターフェース型               | `packages/shared/src/types/publish-eligibility.ts`                         |
| アダプタ関数（SafetyGate側）     | `packages/shared/src/utils/safety-contract-adapter.ts`                     |
| アダプタ関数（Observability側）  | `packages/shared/src/utils/aggregate-view-adapter.ts`                      |

IPC レスポンス形式（P60準拠）:

```typescript
// skill:publishing:check チャンネルのレスポンス形式
type CheckPublishReadinessResponse = IpcResponse<PublishReadiness>;

// IpcResponse 共通型（P60準拠の wrapper 形式）
type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

テスト作成時（Phase 4）のアサーション記述方法（P60準拠）:

```typescript
// IPC レスポンスのアサーション（P60準拠: result.error.code でアサーション）
expect(result.success).toBe(false);
expect(result.error.code).toBe("VALIDATION_ERROR");

// PublishReadiness の判定結果アサーション
expect(result.data.status).toBe("auto-approved");
expect(result.data.status).toBe("blocked");
```

---

## 6. 判定ロジック（擬似コード）

```typescript
function checkPublishReadiness(
  safetyGate: SafetyGateInput,
  metrics: ObservabilityMetrics,
): PublishReadiness {
  // Step 1: ブロッキング条件（即座に blocked）
  // ケース12: gateStatus === "rejected" は riskLevel より先に評価する
  if (safetyGate.gateStatus === "rejected")
    return blocked(
      "安全性ゲートが公開を拒否しています（overallGrade: UNSAFE）",
    );
  // ケース13: critical riskLevel
  if (safetyGate.riskLevel === "critical")
    return blocked(
      "クリティカルリスクのツールを使用しています。スキルを修正してください",
    );

  // Step 2: 高リスク（常に manual-approval）
  // ケース11
  if (safetyGate.riskLevel === "high")
    return manualApproval(
      "ハイリスクなツールを使用しています（管理者承認が必要です）",
    );

  // Step 3: 中リスク判定（ケース6〜10）
  if (safetyGate.riskLevel === "medium") {
    if (metrics.successRate < 90)
      // ケース10
      return manualApproval(
        `実行成功率が90%未満です（現在: ${metrics.successRate}%）`,
      );
    if (!safetyGate.securityScan.passed)
      // ケース9
      return manualApproval(
        `セキュリティスキャンで問題が検出されました（重大: ${safetyGate.securityScan.criticalFindings}件）`,
      );
    if (metrics.qualityTrend !== "improving")
      // ケース8
      return manualApproval(
        "品質スコアが改善傾向にありません（stable または declining）",
      );
    // successRate >= 90 && securityScan.passed && qualityTrend === "improving"
    if (metrics.feedbackScore > 0 && metrics.feedbackScore < 3.5)
      // ケース7: feedbackScore あり（> 0）かつ 3.5 未満
      return manualApproval(
        `フィードバックスコアが3.5未満です（現在: ${metrics.feedbackScore}）`,
      );
    // ケース6: feedbackScore === 0（データなし）または >= 3.5
    return reviewRequired("中リスクスキルの公開には担当者レビューが必要です");
  }

  // Step 4: 低リスク判定（ケース1〜5）
  if (metrics.successRate < 80)
    // ケース5
    return reviewRequired(
      `実行成功率が80%未満です（現在: ${metrics.successRate}%）`,
    );
  if (!safetyGate.securityScan.passed)
    // ケース4
    return reviewRequired("セキュリティスキャンで警告が検出されました");
  if (metrics.qualityTrend === "declining")
    // ケース3
    return reviewRequired("品質スコアが低下傾向にあります");
  if (metrics.feedbackScore > 0 && metrics.feedbackScore < 3.0)
    // ケース2: feedbackScore あり（> 0）かつ 3.0 未満
    return reviewRequired(
      `フィードバックスコアが3.0未満です（現在: ${metrics.feedbackScore}）`,
    );
  // ケース1: successRate >= 80 && securityScan.passed
  //          && trend は stable または improving
  //          && feedbackScore === 0（データなし）または >= 3.0
  return autoApproved();
}

// ヘルパー関数（内部使用）
function blocked(reason: string): PublishReadiness {
  return { status: "blocked", reasons: [reason] };
}
function manualApproval(reason: string): PublishReadiness {
  return { status: "manual-approval-required", reasons: [reason] };
}
function reviewRequired(reason: string): PublishReadiness {
  return { status: "review-required", reasons: [reason] };
}
function autoApproved(): PublishReadiness {
  return { status: "auto-approved" };
}
```

### 6.1 判定フロー図（テキスト）

```
[PublishReadinessChecker.check(safetyGate, metrics) 呼び出し]
          |
          v
[Step 1] gateStatus === "rejected" ?
          |
          ├─ true  ─→ { status: "blocked", reasons: ["安全性ゲートが..."] }
          |
          └─ false ─→ riskLevel === "critical" ?
                           |
                           ├─ true  ─→ { status: "blocked", reasons: ["クリティカル..."] }
                           |
                           └─ false ─→ [Step 2]

[Step 2] riskLevel === "high" ?
          |
          ├─ true  ─→ { status: "manual-approval-required", reasons: [...] }
          |
          └─ false ─→ [Step 3: medium or low]

[Step 3-M] riskLevel === "medium" の場合
          |
          ├─ successRate < 90          ─→ "manual-approval-required"
          ├─ securityScan.passed=false ─→ "manual-approval-required"
          ├─ qualityTrend != improving ─→ "manual-approval-required"
          ├─ feedbackScore > 0 && < 3.5─→ "manual-approval-required"
          └─ それ以外（0 or >= 3.5）   ─→ "review-required"

[Step 3-L] riskLevel === "low" の場合
          |
          ├─ successRate < 80          ─→ "review-required"
          ├─ securityScan.passed=false ─→ "review-required"
          ├─ qualityTrend=declining    ─→ "review-required"
          ├─ feedbackScore > 0 && < 3.0─→ "review-required"
          └─ それ以外（0 or >= 3.0）   ─→ "auto-approved"
```

---

## 7. DI境界配置テーブル

DI境界の型配置判断（phase-2-design.md セクション「DI 境界の型配置判断」準拠）:

| 型名                             | 配置先                  | 判断根拠                                                                            |
| -------------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `PublishReadiness`               | `packages/shared`       | Main↔Renderer間で共有（IPC境界を跨ぐ）。IpcResponse<T>の T として渡される           |
| `ToolRiskLevel`                  | `packages/shared`       | Task-06との共有型。Main/Renderer両レイヤーから参照される                            |
| `SafetyGateStatus`               | `packages/shared`       | Main↔Renderer間で共有。`gateStatus` フィールドの型として使用                        |
| `QualityTrend`                   | `packages/shared`       | Task-07との共有型。レイヤーを跨いで参照される                                       |
| `SafetyGateInput`                | `packages/shared`       | PublishReadinessChecker の引数型（IPC境界跨ぎのため shared に配置）                 |
| `ObservabilityMetrics`           | `packages/shared`       | PublishReadinessChecker の引数型（IPC境界跨ぎのため shared に配置）                 |
| `PublishReadinessChecker`        | `packages/shared`       | Port インターフェース（DIP準拠・P61対策: IPC ハンドラ登録関数の引数型は Interface） |
| `DefaultPublishReadinessChecker` | `apps/desktop/src/main` | 具象クラスは Main プロセス側のみに配置（Renderer には公開しない）                   |

ファイル配置計画:

```
packages/shared/src/types/publish-eligibility.ts
  - PublishReadiness（型）
  - ToolRiskLevel（型）
  - SafetyGateStatus（型）
  - QualityTrend（型）
  - SafetyGateInput（インターフェース）
  - ObservabilityMetrics（インターフェース）
  - PublishReadinessChecker（インターフェース）

apps/desktop/src/main/services/publish/
  - DefaultPublishReadinessChecker.ts（具象クラス）

packages/shared/src/utils/
  - safety-contract-adapter.ts（SafetyGateResult → SafetyGateInput 変換）
  - aggregate-view-adapter.ts（PublishReadinessMetrics → ObservabilityMetrics 変換）
```

---

## 8. Phase 1 参照トレーサビリティ

### 8.1 Phase 1 PublishEligibility → PublishReadiness マッピング詳細

```
Phase 1 → Phase 2 のマッピング変換規則:

IF SafetyGateResult.overallGrade === "UNSAFE" （= gateStatus: "rejected"）
  THEN PublishReadiness.status = "blocked"
  （Phase 1: isBlocked=true の最優先ケース）

IF PublishEligibility.isBlocked === true
  AND SkillSafetyContract.maxRiskLevel === "critical"
  THEN PublishReadiness.status = "blocked"
  （Phase 1: isBlocked=true の場合）

IF PublishEligibility.isBlocked === true
  AND SkillSafetyContract.maxRiskLevel === "high"
  THEN PublishReadiness.status = "manual-approval-required"
  （注: Phase 1の isBlocked は "high" でも true になるが、
         Phase 2では "high" を "blocked" ではなく "manual-approval-required" に細分化する。
         管理者承認があれば公開可能とするため。）

IF PublishEligibility.isBlocked === false
  AND PublishEligibility.warnings.length > 0
  AND riskLevel === "medium"
  THEN PublishReadiness.status = "manual-approval-required" または "review-required"
  （成功率・トレンド・スキャン・feedbackScore の各条件により分岐）

IF PublishEligibility.isBlocked === false
  AND PublishEligibility.warnings.length > 0
  AND riskLevel === "low"
  THEN PublishReadiness.status = "review-required"

IF PublishEligibility.isRecommended === true
  THEN PublishReadiness.status = "auto-approved"
  （Phase 1 の推奨条件: maxRiskLevel=low && testPassRate>=0.95 && avgScore>=4.0）
```

### 8.2 Phase 1 からの拡張点

Phase 1 の `PublishEligibility` は「公開可/不可」の2値判定に近い設計だった。Phase 2 では以下の観点で4段階に細分化する。

| 拡張観点                           | Phase 1 の状態                 | Phase 2 の細分化                                                                                                |
| ---------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `gateStatus === "rejected"` の扱い | `isBlocked = true`（ブロック） | `"blocked"`（即座にブロック、riskLevel より優先評価）                                                           |
| `"high"` リスクの扱い              | `isBlocked = true`（完全拒否） | `"manual-approval-required"`（管理者が明示的に承認すれば公開可）                                                |
| `"medium"` の条件分岐              | `warnings` あり（1種類）       | 成功率・トレンド・スキャン・feedbackScore により `"review-required"` または `"manual-approval-required"` に分岐 |
| `"low"` の自動承認条件             | `isRecommended` が任意         | 成功率≥80 かつ scan.passed かつ declining でない かつ feedbackScore≥3.0（または0）の場合のみ `"auto-approved"`  |
| `feedbackScore` による分岐         | Phase 1 では考慮なし           | low: 3.0閾値、medium: 3.5閾値で `review-required` / `manual-approval-required` を分岐                           |

### 8.3 Phase 1 成果物との対応関係

| Phase 1 成果物                            | 本設計書での参照箇所                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `safety-gate-connection.md` セクション1.1 | セクション1.1 変換アルゴリズム（convertToToolRiskLevel）                |
| `safety-gate-connection.md` セクション1.2 | セクション2.2 ObservabilityMetrics の Task07 マッピング                 |
| `safety-gate-connection.md` セクション2   | セクション3.1 判定条件式（PublishEligibility との対応）                 |
| `safety-gate-connection.md` セクション4   | セクション3.1 `PublishReadiness` 型（PublishEligibility を4段階に拡張） |

---

## 9. テスト可能な条件式サマリー（Phase 4 用）

### 9.1 全ケース網羅確認テーブル（判定マトリクスとの対応）

| ケース# | riskLevel    | gateStatus   | successRate | qualityTrend  | securityScan.passed | feedbackScore   | 期待 status                  |
| ------- | ------------ | ------------ | ----------- | ------------- | ------------------- | --------------- | ---------------------------- |
| M-01    | `"low"`      | approved     | >= 80       | `"stable"`    | `true`              | 0 または >= 3.0 | `"auto-approved"`            |
| M-02    | `"low"`      | approved     | >= 80       | `"improving"` | `true`              | 0 または >= 3.0 | `"auto-approved"`            |
| M-03    | `"low"`      | approved     | >= 80       | `"stable"`    | `true`              | > 0 かつ < 3.0  | `"review-required"`          |
| M-04    | `"low"`      | approved     | >= 80       | `"declining"` | `true`              | 任意            | `"review-required"`          |
| M-05    | `"low"`      | approved     | >= 80       | 任意          | `false`             | 任意            | `"review-required"`          |
| M-06    | `"low"`      | approved     | < 80        | 任意          | 任意                | 任意            | `"review-required"`          |
| M-07    | `"medium"`   | approved     | >= 90       | `"improving"` | `true`              | 0 または >= 3.5 | `"review-required"`          |
| M-08    | `"medium"`   | approved     | >= 90       | `"improving"` | `true`              | > 0 かつ < 3.5  | `"manual-approval-required"` |
| M-09    | `"medium"`   | approved     | >= 90       | `"stable"`    | `true`              | 任意            | `"manual-approval-required"` |
| M-10    | `"medium"`   | approved     | >= 90       | `"declining"` | `true`              | 任意            | `"manual-approval-required"` |
| M-11    | `"medium"`   | approved     | >= 90       | 任意          | `false`             | 任意            | `"manual-approval-required"` |
| M-12    | `"medium"`   | approved     | < 90        | 任意          | 任意                | 任意            | `"manual-approval-required"` |
| M-13    | `"high"`     | approved     | 任意        | 任意          | 任意                | 任意            | `"manual-approval-required"` |
| M-14    | 任意         | `"rejected"` | 任意        | 任意          | 任意                | 任意            | `"blocked"`                  |
| M-15    | `"critical"` | approved     | 任意        | 任意          | 任意                | 任意            | `"blocked"`                  |

計15ケース（RiskLevel 4段階 × 条件分岐 × feedbackScore 閾値 × gateStatus rejected の全組み合わせを網羅）。
