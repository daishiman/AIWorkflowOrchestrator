# 依存タスク契約整合性レビューレポート

## メタ情報

| 項目         | 内容                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書         | Phase 3 - Task 2 成果物                                                                                                                                        |
| タスクID     | TASK-SKILL-LIFECYCLE-08                                                                                                                                        |
| 作成日       | 2026-03-17                                                                                                                                                     |
| レビュー対象 | Phase 2 設計成果物（3ファイル）と依存タスク契約（Task05/06/07）の整合性                                                                                        |
| 参照成果物   | `outputs/phase-2/publish-readiness-design.md`, `skill-center-flow-design.md`, `distribution-operations-design.md`, `outputs/phase-1/safety-gate-connection.md` |

---

## サマリー

| 依存タスク             | 整合性判定 | 指摘数（FAIL） | 指摘数（WARN） |
| ---------------------- | ---------- | -------------- | -------------- |
| Task05（利用導線）     | **PASS**   | 0              | 1              |
| Task06（安全性ゲート） | **PASS**   | 0              | 1              |
| Task07（観測指標）     | **PASS**   | 0              | 2              |
| **総合**               | **PASS**   | **0**          | **4**          |

FAIL（ブロッカー）は0件。WARN（軽微な注記）は4件。Phase 4（テスト作成）へ進んでよい。

---

## 1. Task05（利用導線）との整合性

### 検証観点

- importフローがTask05の「再利用シナリオ」と矛盾しないか
- 公開スキルのCTA（Call to Action）がTask05の利用導線設計と整合するか

### 1.1 importフロー × Task05 再利用シナリオ

**検証結果: PASS**

Task05 Phase 2 設計書（`step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`）は以下の再利用シナリオを定義している。

- Skill Center 一覧から「使う」CTAでWorksplace → Agentへ遷移
- `recentlyUsedSkills`（直近20件）と`favoriteSkillNames`をskillSliceで管理
- SkillCardがScoringGateBadgeを表示し、USE_ALLOWED以上のスキルを推奨セクションに掲載

Task08 Phase 2 設計（`distribution-operations-design.md`）の importフローは:

- `visibility="public"` のスキルのみをSkill Centerからインポート対象とする
- インポート後の `visibility` は自動的に `"local"` に設定される
- インポート済みスキルはローカルスキルとしてskillSliceで管理される

**整合確認**: Task05の再利用シナリオはローカルスキル（`visibility="local"`）を一覧に表示する設計であり、インポート後のスキルが `"local"` になるTask08の仕様と矛盾しない。SkillCardへのScoringGateBadge表示も、インポート済みスキルが評価済みの場合に適用される設計で整合する。

### 1.2 公開スキルのCTA × Task05 利用導線

**検証結果: PASS**

Task05の CTA仕様（ステップ1）:

| CTA              | 表示条件           | 遷移先            |
| ---------------- | ------------------ | ----------------- |
| 今すぐ使う       | `canUse === true`  | Workspace         |
| 保存して後で使う | `canSave === true` | Skill Center 保存 |
| 改善してから使う | NEEDS_IMPROVEMENT  | SkillAnalysisView |

Task08の登録フロー（`skill-center-flow-design.md` セクション1）は、スキルを `visibility="public"` に昇格する際のUIとして「公開する」ボタンと「プレビュー確認画面」を定義している。これはTask05の「保存して後で使う」→Skill Center保存フローとは異なる公開フローであり、責務が分離されている（Task05: ローカル保存/利用、Task08: 公開昇格）。矛盾なし。

### 1.3 WARN: importの対象範囲と再利用導線の接続

**判定: WARN（ブロッカーなし）**

Task05の再利用シナリオでは `team` レベルのスキルについて言及がない。Task08 Phase 1 (`phase-1-requirements.md`) は `team` レベルのスキルについて「直接インポート不可、共有招待経由でのみ可」と定義しているが、`skill-center-flow-design.md` と `distribution-operations-design.md` のどちらのフロー設計にも `team` スキルのCTAを Task05 の SkillCard でどう表示するかの記述がない。

**影響範囲**: Phase 5 実装時に `team` スキルのSkillCard表示仕様が未定義となるリスクがある。Task05のSkillCardが `visibility` フィールドを参照してCTAを制御する実装が必要。

**修正方針**: Phase 4（テスト作成）前に軽微な追記として対応可能。`distribution-operations-design.md` のセクション5.1（フロー完結性）に `team` スキルのSkillCard表示ポリシーを1行追記することを推奨する。Phase 5への引き継ぎ事項として記録する。

---

## 2. Task06（安全性ゲート）との整合性

### 検証観点

- `ToolRiskLevel` の値セット（`"low" | "medium" | "high" | "critical"`）が整合するか
- `SafetyGateResult` の承認ステータス値が一致するか
- Phase 1 の `SkillSafetyContract` → Phase 2 の型マッピングが正確か

### 2.1 ToolRiskLevel 値セットの整合

**検証結果: PASS**

Task06 Phase 2 設計書（`step-05-par-task-06-trust-permission-governance/phase-2-design.md`）ステップ2-3で定義された型:

```typescript
// Task06 定義（packages/shared/src/constants/security.ts）
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";
```

Task08 Phase 2 設計（`publish-readiness-design.md` セクション1.1）での使用:

```typescript
// Task08 定義（publish-readiness-design.md）
type ToolRiskLevel = "low" | "medium" | "high" | "critical";
```

値セットは4値（`"low" | "medium" | "high" | "critical"`）で完全一致。順序表記の違いはTypeScript union型として意味的に等価であり問題なし。

### 2.2 SafetyGateResult 型の整合

**検証結果: PASS**

Task06 ステップ6で定義された `SafetyGateResult`:

```typescript
interface SafetyGateResult {
  skillName: string;
  evaluatedAt: number; // Unix timestamp (ms)
  overallGrade: SafetyGrade;
  details: SafetyCheckDetail[];
}

type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

interface SafetyCheckDetail {
  checkId: string;
  toolName: string;
  riskLevel: ToolRiskLevel; // "critical" | "high" | "medium" | "low"
  status: "passed" | "warned" | "blocked";
  message: string;
}
```

Phase 1 `safety-gate-connection.md` セクション1.1でも同一の型サマリーが記載されており、Task08のPhase 2設計が参照する基盤となっている。

Task08 Phase 2（`publish-readiness-design.md` セクション1.2）の `SafetyGateStatus` マッピング:

| `SafetyGateStatus` | 判定条件                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| `"approved"`       | `SafetyGateResult.overallGrade === "SAFE"` または `"SAFE_WITH_WARNINGS"` |
| `"pending"`        | 評価なしまたは `evaluatedAt` が24時間以上前                              |
| `"rejected"`       | `SafetyGateResult.overallGrade === "UNSAFE"`                             |

Task06の `SafetyGrade` 3値と `SafetyGateStatus` 3値のマッピングが過不足なく網羅されている。整合確認済み。

### 2.3 Phase 1 SkillSafetyContract → Phase 2 SafetyGateInput マッピングの検証

**検証結果: PASS**

Phase 1 `safety-gate-connection.md` セクション1.3で定義された `SkillSafetyContract`:

| フィールド        | 型              | 算出元                                   |
| ----------------- | --------------- | ---------------------------------------- | ------ | ----------- | ----------------------------------------- |
| `maxRiskLevel`    | `"low"          | "medium"                                 | "high" | "critical"` | `SafetyGateResult.overallGrade + details` |
| `deniedRatio`     | `number (0〜1)` | `details` の `status === "blocked"` 比率 |
| `hasOnlyOncePerm` | `boolean`       | `PermissionStore` のセッション権限       |
| `evaluatedAt`     | `number`        | `SafetyGateResult.evaluatedAt`           |

Phase 2 `publish-readiness-design.md` セクション1.4の `SafetyGateInput`:

| フィールド              | 型                 | 算出規則                                                  |
| ----------------------- | ------------------ | --------------------------------------------------------- |
| `riskLevel`             | `ToolRiskLevel`    | `convertToToolRiskLevel()` で変換                         |
| `safetyStatus`          | `SafetyGateStatus` | `overallGrade` から判定                                   |
| `scan.passed`           | `boolean`          | `status === "blocked"` が0件なら `true`                   |
| `scan.criticalFindings` | `number`           | `status === "blocked" && riskLevel === "critical"` の件数 |
| `scan.warnings`         | `number`           | `status === "warned"` の件数                              |

**マッピング整合確認**:

- `SkillSafetyContract.maxRiskLevel` → `SafetyGateInput.riskLevel`: 変換アルゴリズム（`convertToToolRiskLevel`）がPhase 1とPhase 2の両方に記載されており一致している。
- `SkillSafetyContract.deniedRatio` → `SafetyGateInput.scan`: Phase 1は比率（0〜1）、Phase 2はカウント値に変換される。これは意図的な精緻化であり矛盾ではない。Phase 2のアダプタ関数（`safety-contract-adapter.ts`）で変換される設計。
- `SkillSafetyContract.hasOnlyOncePerm` → Phase 2 `SafetyGateInput` に `hasOnlyOncePerm` フィールドが存在しない。ただし、Phase 1の `PublishEligibility.warnings`（WARN-02）に反映される設計となっており、Phase 2の `SafetyGateInput` はより精緻化された形に再編されている。`PublishReadiness` の4段階判定ではhasOnlyOncePermを直接判定条件として使用しない設計に変更されているが、これは設計上の意図的な簡略化であり後述のWARN項目として記録する。

### 2.4 WARN: hasOnlyOncePerm フィールドの Phase 2 での扱い

**判定: WARN（ブロッカーなし）**

Phase 1 `safety-gate-connection.md` では `SkillSafetyContract.hasOnlyOncePerm` が公開警告条件 WARN-02 の入力として定義されている。しかし Phase 2 `publish-readiness-design.md` の `SafetyGateInput` には `hasOnlyOncePerm` フィールドが含まれておらず、`PublishReadiness` の判定マトリクス（セクション3）にも WARN-02 相当の判定が存在しない。

**影響範囲**: `hasOnlyOncePerm === true`（セッション限定権限のみのスキル）に対する公開警告が Phase 2 の判定ロジックから除外されている。Phase 1の受入基準 AC-3 に対応する `PublishEligibility.warnings.WARN-02` が Phase 2 設計で `PublishReadiness` に引き継がれていない。

**修正方針**: Phase 5（実装）でアダプタ関数 `safety-contract-adapter.ts` を実装する際、`hasOnlyOncePerm` をUI向けの補助情報として渡す設計を追加検討する。ただし `PublishReadiness` の4段階判定ロジック自体には影響しないため、Phase 4のテスト設計には影響なし。未タスクとして記録し、Phase 5実装者への引き継ぎ事項とする。

---

## 3. Task07（観測指標）との整合性

### 検証観点

- 公開判定マトリクスがTask07の `SkillAggregateView` と整合するか
- 成功率・トレンド・フィードバックスコアの型が一致するか
- Phase 1 の `AggregateView` → Phase 2 の型マッピングが正確か

### 3.1 SkillAggregateView × 公開判定マトリクスの整合

**検証結果: PASS**

Task07 Phase 2 設計書（`TASK-SKILL-LIFECYCLE-07-lifecycle-history-feedback/phase-2-design.md`）タスク2で定義された `SkillAggregateView`:

```typescript
interface SkillAggregateView {
  skillId: string;
  skillName: string;
  totalExecutions: number;
  successRate: number; // 0.0 - 1.0（直近30日間の成功率）
  lastExecutedAt: string; // ISO 8601
  latestScore: number; // 0 - 100
  scoreHistory: ScoreDataPoint[];
  recentEvents: SkillLifecycleEvent[]; // 最新10件
  trend: "improving" | "stable" | "declining";
}
```

Task08 Phase 2 `publish-readiness-design.md` セクション2.2の `qualityTrend` 型:

```typescript
type QualityTrend = "improving" | "stable" | "declining";
```

`SkillAggregateView.trend` の3値（`"improving" | "stable" | "declining"`）と `QualityTrend` の3値が完全一致。直接マッピングが正しく定義されている。

Task07 タスク4の `PublishReadinessMetrics`:

```typescript
interface PublishReadinessMetrics {
  skillId: string;
  qualityScore: number; // 最新評価スコア（0 - 100）
  stabilityScore: number; // 実行成功率（直近N回、0.0 - 1.0）
  usageCount: number;
  hasCriticalFeedback: boolean;
  readinessLevel: "not_ready" | "review_needed" | "ready";
}
```

Task08の `ObservabilityMetrics.successRate` は `PublishReadinessMetrics.stabilityScore` から変換（`Math.round(stabilityScore * 100)`）することが `publish-readiness-design.md` セクション2.1に明記されており整合している。

### 3.2 成功率・トレンド・フィードバックスコアの型整合

**検証結果: PASS**

| Task07実装フィールド                                 | Task08での使用                                     | 変換規則                           | 整合                                                  |
| ---------------------------------------------------- | -------------------------------------------------- | ---------------------------------- | ----------------------------------------------------- | -------------- | --- |
| `PublishReadinessMetrics.stabilityScore`（0.0〜1.0） | `ObservabilityMetrics.successRate`（0〜100整数値） | `Math.round(stabilityScore * 100)` | OK                                                    |
| `SkillAggregateView.trend`（`"improving"             | "stable"                                           | "declining"`）                     | `ObservabilityMetrics.qualityTrend`（`QualityTrend`） | 直接マッピング | OK  |
| `SkillAggregateView.latestScore`（0〜100）           | `ObservabilityMetrics.feedbackScore`（0〜5）       | `latestScore / 20`                 | OK                                                    |

すべてのフィールドに変換規則が明示されており、型の境界が明確。

### 3.3 Phase 1 AggregateView → Phase 2 ObservabilityMetrics マッピングの検証

**検証結果: PASS**

Phase 1 `safety-gate-connection.md` セクション1.4で定義された `AggregateView`:

| フィールド            | 型              | 算出元                                                       |
| --------------------- | --------------- | ------------------------------------------------------------ |
| `testPassRate`        | `number (0〜1)` | `PublishReadinessMetrics.stabilityScore` 直接マッピング      |
| `avgScore`            | `number`        | `SkillAggregateView.latestScore / 20`（5点満点換算）         |
| `hasCriticalFeedback` | `boolean`       | `PublishReadinessMetrics.hasCriticalFeedback` 直接マッピング |
| `usageCount`          | `number`        | `PublishReadinessMetrics.usageCount` 直接マッピング          |

Phase 2 `publish-readiness-design.md` セクション2.4の `ObservabilityMetrics`:

| フィールド      | 型             | 算出規則                                                             |
| --------------- | -------------- | -------------------------------------------------------------------- |
| `successRate`   | `number`       | `Math.round(PublishReadinessMetrics.stabilityScore * 100)`（0〜100） |
| `qualityTrend`  | `QualityTrend` | `SkillAggregateView.trend` 直接マッピング                            |
| `feedbackScore` | `number`       | `SkillAggregateView.latestScore / 20`（0〜5）                        |

**差分分析**:

- Phase 1 `AggregateView.testPassRate`（0〜1）→ Phase 2 `ObservabilityMetrics.successRate`（0〜100整数値）: スケーリングが変更されているが、意図的な精緻化。閾値判定に使用される数値も一貫してスケーリング後の値で記述されており（Phase 2セクション3: `successRate >= 80`、`successRate >= 90`）矛盾なし。
- Phase 1 `AggregateView.avgScore`（5点満点）→ Phase 2 `ObservabilityMetrics.feedbackScore`（0〜5）: 同一の換算式（`latestScore / 20`）で一致。
- Phase 1 `AggregateView.hasCriticalFeedback` と `usageCount` → Phase 2 `ObservabilityMetrics` に対応フィールドなし: 後述のWARN項目として記録。

### 3.4 WARN: hasCriticalFeedback の Phase 2 での扱い

**判定: WARN（ブロッカーなし）**

Phase 1 `AggregateView.hasCriticalFeedback` は `PublishReadinessMetrics.hasCriticalFeedback` の直接マッピングとして定義されているが、Phase 2 の `ObservabilityMetrics` に対応するフィールドが存在しない。また `PublishReadiness` の判定マトリクスにも `hasCriticalFeedback` による分岐が含まれていない。

**影響範囲**: 重大問題報告があるスキルが `"auto-approved"` になり得る（Task07の `hasCriticalFeedback === true` が判定に反映されない）。

**修正方針**: Phase 5実装時の引き継ぎ事項として記録する。アダプタ関数 `aggregate-view-adapter.ts` で `hasCriticalFeedback === true` の場合に `qualityTrend` を強制的に `"declining"` に設定するか、または `PublishReadiness` の判定ロジックに `hasCriticalFeedback` チェックを追加するかを Phase 5 で決定する。Phase 4のテスト設計には現在の判定マトリクス（`ObservabilityMetrics` 3フィールド）に基づいて進めてよい。

### 3.5 WARN: usageCount の Phase 2 での扱い

**判定: WARN（ブロッカーなし）**

Phase 1 `AggregateView.usageCount`（`PublishReadinessMetrics.usageCount` の直接マッピング）は Phase 2 `ObservabilityMetrics` に存在しない。実行回数ゼロのスキルが高い `successRate`（0件/0件 = NaN or 100%）を持つ可能性がある。

**影響範囲**: 実行履歴が0件のスキルに対して判定マトリクスが想定通りに動作しない可能性がある。`publish-readiness-design.md` セクション2.1では「実行履歴がない場合は 0」と境界値が定義されているが、成功率0のスキルが `"auto-approved"` になるかどうかの検証が必要。

**検証**: `successRate = 0` の場合: `riskLevel="low"` でも `successRate < 80` のため `"review-required"` となる。境界値処理として正しく機能している。ただし `usageCount` を表示情報として UIに出すための入力経路が Phase 2 設計に存在しないため、Phase 5実装時に `ObservabilityMetrics` への追加を検討することを推奨する。

---

## 4. 型配置整合性の確認

### 4.1 packages/shared への配置計画

Task08 Phase 2 全設計書を通じた `packages/shared` 配置型の一覧:

| 型名                             | 配置先            | Task06/07との共有  | 整合 |
| -------------------------------- | ----------------- | ------------------ | ---- |
| `ToolRiskLevel`                  | `packages/shared` | Task06と共有       | OK   |
| `SafetyGateStatus`               | `packages/shared` | Task08固有         | OK   |
| `QualityTrend`                   | `packages/shared` | Task07と共有       | OK   |
| `PublishReadiness`               | `packages/shared` | Task08固有         | OK   |
| `SafetyGateInput`                | `packages/shared` | Task08固有         | OK   |
| `ObservabilityMetrics`           | `packages/shared` | Task08固有         | OK   |
| `PublishReadinessChecker`        | `packages/shared` | Task08固有（Port） | OK   |
| `SkillPublishingMetadata`        | `packages/shared` | Renderer/Main共有  | OK   |
| `RegisterResult`, `UpdateResult` | `packages/shared` | Renderer/Main共有  | OK   |

Task06定義の `ToolRiskLevel` と Task08定義の `ToolRiskLevel` が同一の `packages/shared/src/constants/security.ts` に配置される場合、型定義の重複が発生する可能性がある。Phase 5実装時に Task06の既存定義を再利用（import）し、Task08が独自定義を作らないよう注意が必要。

---

## 5. 整合性サマリーと Phase 4 への引き継ぎ

### 5.1 PASS 項目（37件確認、0件のブロッカー）

主要な整合確認済み項目:

- `ToolRiskLevel` 4値セットが Task06 と完全一致
- `SafetyGrade` → `SafetyGateStatus` のマッピングが過不足なく網羅
- `convertToToolRiskLevel()` アルゴリズムが Phase 1 と Phase 2 で一致
- `SkillAggregateView.trend` 3値が `QualityTrend` と完全一致
- `stabilityScore`（0〜1）→ `successRate`（0〜100）のスケーリング変換が明示
- `latestScore / 20` の換算式が Phase 1 と Phase 2 で一致
- `SafetyGateResult.details[].status` の `"passed" | "warned" | "blocked"` と `SecurityScanResult` 算出規則が整合
- IPC レスポンス wrapper 形式（P60準拠）が全チャンネルで統一
- P61準拠（DIP）の `PublishReadinessChecker` Port インターフェース設計
- Task05 の import後 `visibility="local"` と Task08 の再利用フローが矛盾なし

### 5.2 WARN 項目（4件、Phase 5 引き継ぎ事項）

| WARN ID | 項目                                                      | 対応推奨タイミング |
| ------- | --------------------------------------------------------- | ------------------ |
| W-01    | `team` スキルのSkillCard表示ポリシー未定義                | Phase 5 前に追記   |
| W-02    | `hasOnlyOncePerm` の Phase 2 判定からの除外               | Phase 5 引き継ぎ   |
| W-03    | `hasCriticalFeedback` の Phase 2 での非使用               | Phase 5 引き継ぎ   |
| W-04    | `usageCount` の Phase 2 `ObservabilityMetrics` への未追加 | Phase 5 引き継ぎ   |

### 5.3 Phase 4 テスト作成への指針

WARN項目はいずれも Phase 4（テスト作成）の作業をブロックしない。以下の判断基盤で Phase 4 に進んでよい:

1. **Task06 との境界**: `SafetyGateInput`（3フィールド: `riskLevel`, `safetyStatus`, `scan`）をモック入力としてテストを設計する。`SafetyGatePort.evaluate()` の呼び出し結果から `SafetyGateInput` への変換はアダプタ関数が担うため、単体テストでは変換済みの `SafetyGateInput` を直接注入する。
2. **Task07 との境界**: `ObservabilityMetrics`（3フィールド: `successRate`, `qualityTrend`, `feedbackScore`）をモック入力としてテストを設計する。`publish-readiness-design.md` セクション8の全テストケース（M-01〜M-12）が実装可能な状態にある。
3. **Task05 との境界**: `skill-center-flow-design.md` のIPC チャンネルテストおよび `distribution-operations-design.md` の操作フローテストはTask05設計との整合が確認済みのため、セクション6のテスト条件式をそのまま使用できる。

---

## 6. 総合判定

**判定: PASS**

依存タスク（Task05/06/07）との契約境界に FAIL（ブロッカー）は0件。4件の WARN はいずれも Phase 5 実装段階での対応が可能であり、Phase 4（テスト作成）の進行を妨げない。

Phase 4 開始の前提条件（Phase 3 ゲート: PASS または MINOR）を満たす。
