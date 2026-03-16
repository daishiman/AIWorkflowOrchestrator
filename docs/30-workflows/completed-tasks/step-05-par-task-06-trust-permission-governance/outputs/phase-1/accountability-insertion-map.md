# 説明責任UI挿入マップ

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| 成果物ID   | OUT-4                                                                    |
| タスクID   | TASK-SKILL-LIFECYCLE-06                                                  |
| Phase      | 1: 要件定義                                                              |
| 作成日     | 2026-03-16                                                               |
| 対応AC     | AC-3（説明責任UI）                                                       |
| 依存成果物 | OUT-1（risk-level-classification.md）、OUT-2（permission-state-flow.md） |

---

## 1. 挿入ポイント一覧

| 挿入ポイントID | 挿入先タスク | 挿入先UI位置                                                   | 表示条件（条件式）                                                                                                                       | 挿入物の種類           |
| -------------- | ------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| INS-01         | Task-05      | CTA 画面の「今すぐ使う」ボタン上部                             | `skill.tools.some(t => t.riskLevel === "High" \|\| t.riskLevel === "Critical")` が `true`、または `safetyGrade === "SAFE_WITH_WARNINGS"` | バナー（警告テキスト） |
| INS-02         | Task-03      | Agent 実行中画面（既存ストリーミング UI の上部）               | `PermissionResolver.pendingCount > 0`                                                                                                    | インジケーター         |
| INS-03         | Task-05      | ExecutionResultSummary の下部（PostExecutionActionBar の上部） | `session.permissionDecisions.length >= 1`                                                                                                | サマリーリスト         |

---

## 2. INS-01 詳細: Task-05 CTA 画面上部

### 表示条件

```typescript
type SafetyGrade = "UNSAFE" | "SAFE_WITH_WARNINGS" | "SAFE";

function shouldShowINS01Banner(
  skill: Skill,
  safetyGrade: SafetyGrade,
): boolean {
  const hasHighOrCritical = skill.tools.some(
    (t) => t.riskLevel === "High" || t.riskLevel === "Critical",
  );
  return hasHighOrCritical || safetyGrade === "SAFE_WITH_WARNINGS";
}
```

### バナー表示内容

| 条件                                                                      | バナーテキスト                                                                     | CTA ボタン状態 |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------- |
| `safetyGrade === "UNSAFE"`                                                | 「このスキルは安全性基準を満たしていないため実行できません」                       | `disabled`     |
| `safetyGrade === "SAFE_WITH_WARNINGS"` かつ `hasHighOrCritical === true`  | 「このスキルには危険度の高い操作が含まれます。実行前に権限確認が行われます」       | 有効           |
| `safetyGrade === "SAFE_WITH_WARNINGS"` かつ `hasHighOrCritical === false` | 「このスキルには注意が必要な操作が含まれます。実行前に権限確認が行われます」       | 有効           |
| `safetyGrade === "SAFE"` かつ `hasHighOrCritical === true`                | 「このスキルは High 以上のリスクツールを含みます。実行時に権限確認が表示されます」 | 有効           |
| `safetyGrade === "SAFE"` かつ `hasHighOrCritical === false`               | バナー非表示                                                                       | 有効           |

### Task-05 との接続ポイント

| 接続先コンポーネント     | 接続方法                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `SkillDetailView`        | `SafetyGatePort.evaluate(skillName)` の結果を props として受け取り、`safetyGrade` を評価する |
| 「今すぐ使う」CTA ボタン | `safetyGrade === "UNSAFE"` の場合に `disabled` 属性を付与する                                |
| `PermissionDialog`       | INS-01 バナー確認後、ユーザーが CTA を押下した時点で起動する                                 |

---

## 3. INS-02 詳細: Task-03 実行中画面

### 表示条件

```typescript
function shouldShowPermissionIndicator(pendingCount: number): boolean {
  return pendingCount > 0;
}
```

### インジケーター表示内容

| `pendingCount` の値 | 表示テキスト                                                                        |
| ------------------- | ----------------------------------------------------------------------------------- |
| `0`                 | インジケーター非表示                                                                |
| `1`                 | 「権限確認中...（{toolName} の実行許可を待っています）」                            |
| `2` 以上            | 「権限確認中...（{pendingCount} 件の権限確認を待っています）」                      |
| タイムアウト発生時  | 「権限確認がタイムアウトしました（拒否として処理されました）」を3秒間表示後に非表示 |

### Task-03 との接続ポイント

| 接続先状態                 | 接続方法                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `awaiting_permission` 状態 | INS-02 インジケーターは `awaiting_permission` 状態と同時に表示される                   |
| 送信ボタン無効化           | `awaiting_permission` 状態では送信ボタンとテキスト入力が無効化される（既存動作を維持） |
| ストリーミング表示         | INS-02 はストリーミングテキストの上部に固定表示される                                  |
| `DEFAULT_TIMEOUT_MS` 連携  | 300,000ms 経過時にタイムアウトテキストを表示し、3秒後に非表示にする                    |

---

## 4. INS-03 詳細: Task-05 実行結果画面下部

### 表示条件

```typescript
function shouldShowPostExecutionSummary(session: ExecutionSession): boolean {
  return session.permissionDecisions.length >= 1;
}
```

### サマリー表示内容

| 表示項目                    | 内容                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| セクションタイトル          | 「実行中の権限承認」                                                          |
| 各エントリ形式              | 「{toolName}（{riskLevel}）: {decision の日本語}」                            |
| `decision` 日本語マッピング | `approved` → 「許可」、`denied` → 「拒否」、`approved_once` → 「1回のみ許可」 |
| ソート順                    | `timestamp` の降順（最新の判断が最上位）                                      |

### Task-05 との接続ポイント

| 接続先コンポーネント     | 接続方法                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ExecutionResultSummary` | INS-03 サマリーを `ExecutionResultSummary` の直下に配置する                                                                                                            |
| `PostExecutionActionBar` | INS-03 サマリーは `PostExecutionActionBar` の4ボタン（RerunButton / ImproveButton / CompleteButton / TerminalHandoffButton）の直上に表示。ボタン操作には影響を与えない |
| `ImproveButton`          | INS-03 で `denied` が含まれる場合、`ImproveButton` のツールチップに「拒否された権限要求あり」を追加表示する                                                            |

---

## 5. ScoringGate × RiskLevel 16パターンマトリクス

`ScoringGate`: `NEEDS_IMPROVEMENT` / `SAVE_ALLOWED` / `USE_ALLOWED` / `RECOMMENDED`
`maxRiskLevel`: `Critical` / `High` / `Medium` / `Low`

### INS-01 表示条件マトリクス

| ScoringGate \ maxRiskLevel | Critical                                | High                                    | Medium                             | Low                                |
| -------------------------- | --------------------------------------- | --------------------------------------- | ---------------------------------- | ---------------------------------- |
| `RECOMMENDED`              | バナー表示（警告）、CTA 有効            | バナー表示（警告）、CTA 有効            | バナー非表示、CTA 有効             | バナー非表示、CTA 有効             |
| `USE_ALLOWED`              | バナー表示（警告）、CTA 有効            | バナー表示（警告）、CTA 有効            | バナー非表示、CTA 有効             | バナー非表示、CTA 有効             |
| `SAVE_ALLOWED`             | CTA 非表示（実行不可）                  | CTA 非表示（実行不可）                  | CTA 非表示（実行不可）             | CTA 非表示（実行不可）             |
| `NEEDS_IMPROVEMENT`        | バナー表示 + 改善推奨テキスト、CTA 有効 | バナー表示 + 改善推奨テキスト、CTA 有効 | 改善推奨テキストのみ表示、CTA 有効 | 改善推奨テキストのみ表示、CTA 有効 |

### SafetyGrade × hasHighOrCriticalTool マトリクス

| SafetyGrade \ hasHighOrCriticalTool | `true`                               | `false`                              |
| ----------------------------------- | ------------------------------------ | ------------------------------------ |
| `UNSAFE`                            | バナー表示（エラー）、CTA `disabled` | バナー表示（エラー）、CTA `disabled` |
| `SAFE_WITH_WARNINGS`                | バナー表示（警告）、CTA 有効         | バナー表示（警告）、CTA 有効         |
| `SAFE`                              | バナー表示（警告）、CTA 有効         | バナー非表示、CTA 有効               |

### 判定優先順位

```typescript
function resolveINS01Display(
  safetyGrade: SafetyGrade,
  scoringGate: ScoringGate,
  hasHighOrCritical: boolean,
): {
  showBanner: boolean;
  ctaEnabled: boolean;
  bannerType: "error" | "warning" | "info" | "none";
} {
  // 優先順位1: SafetyGrade === "UNSAFE" → CTA 無効化（最優先）
  if (safetyGrade === "UNSAFE") {
    return { showBanner: true, ctaEnabled: false, bannerType: "error" };
  }
  // 優先順位2: SAVE_ALLOWED → CTA 非表示
  if (scoringGate === "SAVE_ALLOWED") {
    return { showBanner: false, ctaEnabled: false, bannerType: "none" };
  }
  // 優先順位3: SAFE_WITH_WARNINGS → バナー表示 + CTA 有効化
  if (safetyGrade === "SAFE_WITH_WARNINGS") {
    return { showBanner: true, ctaEnabled: true, bannerType: "warning" };
  }
  // 優先順位4: High/Critical ツール含有 → バナー表示
  if (hasHighOrCritical) {
    return { showBanner: true, ctaEnabled: true, bannerType: "warning" };
  }
  // 優先順位5: NEEDS_IMPROVEMENT → 改善推奨のみ
  if (scoringGate === "NEEDS_IMPROVEMENT") {
    return { showBanner: true, ctaEnabled: true, bannerType: "info" };
  }
  // デフォルト: バナー非表示 + CTA 有効化
  return { showBanner: false, ctaEnabled: true, bannerType: "none" };
}
```

---

## 6. AC対応マッピング

| AC   | 対応内容                                                  | 本文書の対応セクション                                                                                 |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| AC-1 | 危険操作の権限境界定義（4段階リスク分類、確認方式の定義） | セクション2（INS-01 バナーがリスクレベル判定に基づく）                                                 |
| AC-2 | 承認取り消しフロー（失効条件、手動取り消し、状態遷移）    | セクション4（INS-03 に `denied`/`revoked` の表示あり）                                                 |
| AC-3 | 説明責任UI（INS-01〜03、ScoringGate連携）                 | セクション1〜5 全体                                                                                    |
| AC-4 | 公開前安全性ゲート（SafetyGatePort、SafetyGateResult）    | セクション2（INS-01 が `SafetyGateResult.overallGrade` を使用）、セクション5（SafetyGrade マトリクス） |
