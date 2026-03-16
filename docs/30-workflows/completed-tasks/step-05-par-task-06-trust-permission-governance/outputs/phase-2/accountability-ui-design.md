# 説明責任 UI 挿入点（INS-01〜03）ワイヤーフレームと発火条件設計

## 1. メタ情報

| 項目       | 値                                                                |
| ---------- | ----------------------------------------------------------------- |
| タスク ID  | TASK-SKILL-LIFECYCLE-06                                           |
| Phase      | 2（設計）                                                         |
| Lane       | Lane-A: UI                                                        |
| 成果物     | `outputs/phase-2/accountability-ui-design.md`                     |
| 作成日     | 2026-03-16                                                        |
| 依存成果物 | `outputs/phase-1/accountability-insertion-map.md`（OUT-4）        |
|            | `outputs/phase-1/skill-safety-contract.md`（OUT-5）               |
|            | `outputs/phase-2/risk-level-design.md`（TOOL_RISK_CONFIG 型定義） |
| ステータス | Draft                                                             |
| 担当       | SubAgent-A（説明責任 UI 挿入点設計）                              |

---

## 2. 挿入点 Topology 表

| INS-ID | 挿入先画面               | タイミング                                          | 表示要素                                                   | 表示条件                                                                                  |
| ------ | ------------------------ | --------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| INS-01 | Task-05 CTA 画面         | スキル実行前（「今すぐ使う」ボタン上部）            | 要求される権限サマリーバナー（ツール名とリスクレベル）     | `skill.tools.some(t => t.riskLevel === "critical" \|\| t.riskLevel === "high")` が `true` |
| INS-02 | Task-03 Agent 実行中画面 | PermissionDialog 表示前（既存ストリーミング UI 内） | 「権限確認中...」インジケーター                            | `PermissionResolver.pendingCount > 0`                                                     |
| INS-03 | Task-05 実行結果画面     | 実行完了後（ExecutionResultSummary 下部）           | 実行中に承認した権限のサマリー（ツール名・判断結果・回数） | `session.permissionDecisions.length >= 1`                                                 |

---

## 3. INS-01 ワイヤーフレーム: CTA 画面権限サマリーバナー

### 3.1 標準表示（折りたたみ状態）

```
┌─ CTA 画面（「今すぐ使う」の上部に追加） ──────────────────────────┐
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ [▲] このスキルは次の権限を要求する可能性があります:         │  │
│  │     Bash（High）  Write（Medium）                           │  │
│  │     実行時に権限確認ダイアログが表示されます。               │  │
│  │                               [権限の詳細を見る ▼]          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ──────────────────────────────────────────────────────────────── │
│                   [今すぐ使う]   [保存して後で使う]                │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 展開状態（「権限の詳細を見る」クリック後）

```
┌─ CTA 画面（バナー展開状態） ──────────────────────────────────────┐
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ [▲] このスキルは次の権限を要求する可能性があります:         │  │
│  │                                                             │  │
│  │  ツール名    リスクレベル   操作内容                        │  │
│  │  ─────────  ──────────   ─────────────────────────         │  │
│  │  Bash        High          任意のシェルコマンドを実行       │  │
│  │  Write       Medium        ファイルの新規作成・上書き       │  │
│  │                                                             │  │
│  │  High 以上のツール: 実行時に権限確認ダイアログが表示される  │  │
│  │  Medium ツール: 初回実行時に自動承認（設定で変更可能）      │  │
│  │                               [権限の詳細を閉じる ▲]        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ──────────────────────────────────────────────────────────────── │
│                   [今すぐ使う]   [保存して後で使う]                │
└────────────────────────────────────────────────────────────────────┘
```

### 3.3 バナー表示条件の条件式

```typescript
interface INS01Props {
  skill: Skill;
  safetyGrade: SafetyGrade;
  scoringGate: ScoringGate;
}

interface INS01RenderState {
  shouldShowBanner: boolean;
  shouldDisableCTA: boolean;
  bannerVariant: "error" | "warning" | "info" | "none";
  bannerText: string;
  improvementSuffix: string;
}

function computeINS01State(props: INS01Props): INS01RenderState {
  const { skill, safetyGrade, scoringGate } = props;

  const maxRiskLevel: ToolRiskLevel = skill.tools.reduce(
    (max, tool) =>
      RISK_LEVEL_ORDER[tool.riskLevel] > RISK_LEVEL_ORDER[max]
        ? tool.riskLevel
        : max,
    "low" as ToolRiskLevel,
  );

  const hasHighOrCritical: boolean =
    maxRiskLevel === "critical" || maxRiskLevel === "high";

  // NEEDS_IMPROVEMENT 時の改善推奨テキスト
  const improvementSuffix: string =
    scoringGate === "NEEDS_IMPROVEMENT"
      ? "このスキルは改善が推奨されています"
      : "";

  // SafetyGrade 最優先判定
  if (safetyGrade === "UNSAFE") {
    return {
      shouldShowBanner: true,
      shouldDisableCTA: true,
      bannerVariant: "error",
      bannerText: "このスキルは安全性基準を満たしていないため実行できません",
      improvementSuffix,
    };
  }

  if (safetyGrade === "SAFE_WITH_WARNINGS") {
    return {
      shouldShowBanner: true,
      shouldDisableCTA: false,
      bannerVariant: "warning",
      bannerText: hasHighOrCritical
        ? "このスキルには危険度の高い操作が含まれます。実行前に権限確認が行われます"
        : "このスキルには注意が必要な操作が含まれます。実行前に権限確認が行われます",
      improvementSuffix,
    };
  }

  // SAFE かつリスクツール含有
  if (hasHighOrCritical) {
    return {
      shouldShowBanner: true,
      shouldDisableCTA: false,
      bannerVariant: "warning",
      bannerText: "このスキルは次の権限を要求する可能性があります",
      improvementSuffix,
    };
  }

  // NEEDS_IMPROVEMENT かつリスクツールなし
  if (scoringGate === "NEEDS_IMPROVEMENT") {
    return {
      shouldShowBanner: true,
      shouldDisableCTA: false,
      bannerVariant: "info",
      bannerText: "このスキルは改善が推奨されています",
      improvementSuffix: "",
    };
  }

  // デフォルト: バナー非表示
  return {
    shouldShowBanner: false,
    shouldDisableCTA: false,
    bannerVariant: "none",
    bannerText: "",
    improvementSuffix: "",
  };
}
```

### 3.4 バナーの視覚スタイル

| `bannerVariant` | 背景色                                      | テキスト色            | アイコン | 左ボーダー色                               |
| --------------- | ------------------------------------------- | --------------------- | -------- | ------------------------------------------ |
| `error`         | `rgba(var(--status-destructive-rgb), 0.08)` | `var(--text-primary)` | `[!]`    | `var(--status-destructive)` 4px 左ボーダー |
| `warning`       | `rgba(var(--status-warning-rgb), 0.08)`     | `var(--text-primary)` | `[▲]`    | `var(--status-warning)` 4px 左ボーダー     |
| `info`          | `rgba(var(--status-info-rgb), 0.08)`        | `var(--text-primary)` | `[i]`    | `var(--status-info)` 4px 左ボーダー        |
| `none`          | -                                           | -                     | -        | -（レンダリングしない）                    |

---

## 4. INS-02 ワイヤーフレーム: 権限確認中インジケーター

### 4.1 ストリーミング UI 内のインジケーター表示

```
┌─ Agent 実行中画面（既存ストリーミング UI） ──────────────────────┐
│                                                                   │
│  Agent: スキルを実行しています...                                 │
│                                                                   │
│  ┌─ INS-02 インジケーター ──────────────────────────────────┐    │
│  │ [回転アイコン] 権限確認中... （Bash の実行許可を         │    │
│  │                               待っています）              │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  [テキスト入力: 無効化]               [送信ボタン: 無効化]        │
│                                                                   │
│  ※ PermissionDialog がこの上にモーダルとして重ねて表示される     │
└───────────────────────────────────────────────────────────────────┘
```

### 4.2 pendingCount による表示分岐

| `pendingCount` の値 | インジケーター表示内容                                         |
| ------------------- | -------------------------------------------------------------- |
| `0`                 | インジケーター非表示                                           |
| `1`                 | 「権限確認中... （{toolName} の実行許可を待っています）」      |
| `2` 以上            | 「権限確認中... （{pendingCount}件の権限確認を待っています）」 |

### 4.3 タイムアウト時の表示

```
┌─ INS-02 タイムアウト表示（3秒間表示後に非表示） ───────────────┐
│ [×アイコン] 権限確認がタイムアウトしました                      │
│             （拒否として処理されました）                         │
└─────────────────────────────────────────────────────────────────┘
```

- `DEFAULT_TIMEOUT_MS`（300000ms = 5分）経過後に表示する
- 3000ms 表示した後に自動的に非表示にする
- タイムアウト後、`PermissionResolver` は `denied` として処理する（既存動作を維持）

### 4.4 既存 UI との干渉回避

| 既存 UI 要素           | INS-02 との関係                                                          |
| ---------------------- | ------------------------------------------------------------------------ |
| ストリーミングテキスト | INS-02 はストリーミングテキスト領域の上部に fixed position で表示する    |
| 送信ボタン             | `awaiting_permission` 状態では送信ボタンが無効化される（既存動作維持）   |
| テキスト入力           | `awaiting_permission` 状態ではテキスト入力が無効化される（既存動作維持） |
| PermissionDialog       | INS-02 の上にモーダルとして重ねて表示される（z-index で制御）            |

---

## 5. INS-03 ワイヤーフレーム: 実行後権限サマリー

### 5.1 標準表示

```
┌─ 実行結果画面（ExecutionResultSummary 下部に追加） ───────────────┐
│                                                                    │
│  実行中の権限承認:                                                 │
│    Bash x 2回（今回のみ）  Write x 1回（常に許可）                │
│                                                                    │
│                              [権限設定を確認する ->]               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

※ 「権限設定を確認する」リンクは Permission History Panel へ遷移する
※ PostExecutionActionBar の4ボタンの直上に配置する
```

### 5.2 権限拒否を含む場合

```
┌─ 実行結果画面（拒否を含む場合） ─────────────────────────────────┐
│                                                                    │
│  実行中の権限承認:                                                 │
│    Bash x 2回（今回のみ）  Write x 1回（常に許可）                │
│                                                                    │
│  実行中の権限拒否:                                                 │
│    Bash x 1回（拒否）                                              │
│                                                                    │
│                              [権限設定を確認する ->]               │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 5.3 表示条件の条件式

```typescript
interface PermissionDecisionEntry {
  toolName: string;
  riskLevel: ToolRiskLevel;
  decision: "approved" | "denied" | "approved_once";
  timestamp: number;
}

interface INS03RenderState {
  shouldShow: boolean;
  approvedEntries: Array<{
    toolName: string;
    count: number;
    scope: "今回のみ" | "常に許可";
  }>;
  deniedEntries: Array<{
    toolName: string;
    count: number;
  }>;
}

function computeINS03State(
  decisions: PermissionDecisionEntry[],
): INS03RenderState {
  if (decisions.length === 0) {
    return { shouldShow: false, approvedEntries: [], deniedEntries: [] };
  }

  // ツール名ごとに集計
  const approved = new Map<
    string,
    { count: number; hasOnce: boolean; hasPermanent: boolean }
  >();
  const denied = new Map<string, number>();

  for (const d of decisions) {
    if (d.decision === "approved" || d.decision === "approved_once") {
      const entry = approved.get(d.toolName) ?? {
        count: 0,
        hasOnce: false,
        hasPermanent: false,
      };
      entry.count += 1;
      if (d.decision === "approved_once") entry.hasOnce = true;
      if (d.decision === "approved") entry.hasPermanent = true;
      approved.set(d.toolName, entry);
    } else {
      denied.set(d.toolName, (denied.get(d.toolName) ?? 0) + 1);
    }
  }

  const approvedEntries = Array.from(approved.entries()).map(
    ([toolName, info]) => ({
      toolName,
      count: info.count,
      scope: info.hasPermanent ? ("常に許可" as const) : ("今回のみ" as const),
    }),
  );

  const deniedEntries = Array.from(denied.entries()).map(
    ([toolName, count]) => ({ toolName, count }),
  );

  return { shouldShow: true, approvedEntries, deniedEntries };
}
```

### 5.4 PostExecutionActionBar との配置関係

```
┌─ 実行結果画面レイアウト ─────────────────────────────────────────┐
│                                                                    │
│  ExecutionResultSummary（既存）                                    │
│  ──────────────────────────────────────────────────────────────── │
│  INS-03: 権限サマリー（本設計で追加）                              │
│  ──────────────────────────────────────────────────────────────── │
│  PostExecutionActionBar（既存4ボタン）                              │
│    [再実行]  [改善]  [完了]  [Terminal Handoff]                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

- INS-03 は PostExecutionActionBar の4ボタン操作に影響を与えない
- Terminal Handoff では INS-03 サマリーを引き継がない

---

## 6. ScoringGate 連動ルール

### 6.1 ScoringGate x INS-01 バナー連動

| ScoringGate         | INS-01 への影響                                                            |
| ------------------- | -------------------------------------------------------------------------- |
| `NEEDS_IMPROVEMENT` | バナーテキストの末尾に「このスキルは改善が推奨されています」を追加表示する |
| `SAVE_ALLOWED`      | CTA ボタン自体が非表示のため、INS-01 バナーも非表示とする                  |
| `USE_ALLOWED`       | リスクツール（High/Critical）含有時のみバナーを表示する                    |
| `RECOMMENDED`       | リスクツール（High/Critical）含有時のみバナーを表示する                    |

### 6.2 SafetyGrade 連動ルール

| SafetyGrade          | INS-01 への影響                                      | CTA ボタン状態 |
| -------------------- | ---------------------------------------------------- | -------------- |
| `UNSAFE`             | バナー表示（`error` variant）+ CTA 無効化            | `disabled`     |
| `SAFE_WITH_WARNINGS` | バナー表示（`warning` variant）+ CTA 有効化          | `enabled`      |
| `SAFE`               | リスクツール含有時のみバナー表示、含有なしなら非表示 | `enabled`      |

### 6.3 SafetyGrade 判定の優先順位

SafetyGrade と ScoringGate の両方が INS-01 に影響する場合の優先順位:

1. `SafetyGrade === "UNSAFE"` -- CTA 無効化（最優先。ScoringGate の値に関わらず適用）
2. `ScoringGate === "SAVE_ALLOWED"` -- CTA 非表示（INS-01 も非表示）
3. `SafetyGrade === "SAFE_WITH_WARNINGS"` -- バナー表示 + CTA 有効化
4. `hasHighOrCritical === true` -- バナー表示（リスクツール警告）
5. `ScoringGate === "NEEDS_IMPROVEMENT"` かつ `hasHighOrCritical === false` -- 改善推奨テキストのみ
6. デフォルト -- バナー非表示 + CTA 有効化

---

## 7. ScoringGate x maxRiskLevel 組合せマトリクス（4x4 = 16パターン）

### 7.1 INS-01 バナー表示マトリクス

| ScoringGate \ maxRiskLevel | Critical                                | High                                    | Medium                         | Low                            |
| -------------------------- | --------------------------------------- | --------------------------------------- | ------------------------------ | ------------------------------ |
| `RECOMMENDED`              | バナー表示（warning）                   | バナー表示（warning）                   | バナー非表示                   | バナー非表示                   |
| `USE_ALLOWED`              | バナー表示（warning）                   | バナー表示（warning）                   | バナー非表示                   | バナー非表示                   |
| `SAVE_ALLOWED`             | CTA 非表示（バナーも非表示）            | CTA 非表示（バナーも非表示）            | CTA 非表示（バナーも非表示）   | CTA 非表示（バナーも非表示）   |
| `NEEDS_IMPROVEMENT`        | バナー表示（warning）+ 改善推奨テキスト | バナー表示（warning）+ 改善推奨テキスト | バナー表示（info）改善推奨のみ | バナー表示（info）改善推奨のみ |

### 7.2 CTA ボタン状態マトリクス

| ScoringGate \ maxRiskLevel | Critical | High    | Medium  | Low     |
| -------------------------- | -------- | ------- | ------- | ------- |
| `RECOMMENDED`              | enabled  | enabled | enabled | enabled |
| `USE_ALLOWED`              | enabled  | enabled | enabled | enabled |
| `SAVE_ALLOWED`             | hidden   | hidden  | hidden  | hidden  |
| `NEEDS_IMPROVEMENT`        | enabled  | enabled | enabled | enabled |

### 7.3 SafetyGrade 適用後の上書きルール

上記マトリクスの結果は、SafetyGrade によって以下のとおり上書きされる:

| SafetyGrade          | 上書き内容                                                        |
| -------------------- | ----------------------------------------------------------------- |
| `UNSAFE`             | CTA 状態を `disabled` に強制変更。バナーを `error` variant に変更 |
| `SAFE_WITH_WARNINGS` | バナーが非表示の場合でも `warning` variant で強制表示             |
| `SAFE`               | 上書きなし（マトリクスの結果をそのまま適用）                      |

---

## 8. PermissionDialog 説明責任テキスト挿入ルール

### 8.1 reason フィールドへのテキスト追加

既存の `PermissionDialog` は `reason` フィールドに `getDescription(toolName, args)` の出力を表示する。本設計では、以下の条件に基づいて `reason` フィールドの先頭または末尾にテキストを追加する。

### 8.2 挿入条件テーブル

| 条件 ID | 条件式                                                                                                      | 挿入位置      | 挿入テキスト                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| RT-01   | `tool.riskLevel === "critical"`                                                                             | reason 先頭   | 「このツールはシステム全体に影響する不可逆的な操作を実行できます」 |
| RT-02   | `tool.riskLevel === "high"`                                                                                 | reason 先頭   | 「このツールは権限昇格または機密データへのアクセスを伴います」     |
| RT-03   | `scoringGate === "NEEDS_IMPROVEMENT"`                                                                       | reason 末尾   | 「このスキルは改善が推奨されています。スコア: {score}点」          |
| RT-04   | `(tool.riskLevel === "critical" \|\| tool.riskLevel === "high")` かつ `scoringGate === "NEEDS_IMPROVEMENT"` | 先頭 + 末尾   | RT-01 または RT-02 のテキスト + RT-03 のテキスト（両方表示）       |
| RT-05   | `(tool.riskLevel === "medium" \|\| tool.riskLevel === "low")` かつ `scoringGate !== "NEEDS_IMPROVEMENT"`    | -（挿入なし） | 挿入テキストなし（既存の `getDescription(toolName, args)` のみ）   |

### 8.3 テキスト生成の実装仕様

```typescript
function generateAccountabilityText(
  tool: { name: string; riskLevel: ToolRiskLevel },
  scoringGate: ScoringGate,
  score: number,
): { prefix: string; suffix: string } {
  let prefix = "";
  let suffix = "";

  // リスクレベル説明（reason フィールド先頭に挿入）
  if (tool.riskLevel === "critical") {
    prefix = "このツールはシステム全体に影響する不可逆的な操作を実行できます";
  } else if (tool.riskLevel === "high") {
    prefix = "このツールは権限昇格または機密データへのアクセスを伴います";
  }

  // ScoringGate 連動（reason フィールド末尾に追加）
  if (scoringGate === "NEEDS_IMPROVEMENT") {
    suffix = `このスキルは改善が推奨されています。スコア: ${score}点`;
  }

  return { prefix, suffix };
}

// PermissionDialog での reason フィールド組み立て
function buildReasonText(
  tool: { name: string; riskLevel: ToolRiskLevel },
  args: Record<string, unknown>,
  scoringGate: ScoringGate,
  score: number,
): string {
  const description = getDescription(tool.name, args);
  const { prefix, suffix } = generateAccountabilityText(
    tool,
    scoringGate,
    score,
  );

  const parts: string[] = [];
  if (prefix !== "") parts.push(prefix);
  parts.push(description);
  if (suffix !== "") parts.push(suffix);

  return parts.join("\n");
}
```

---

## 9. 設計制約

| 制約 ID | 制約内容                                                                             | 根拠                                               |
| ------- | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| DC-01   | 既存 CTA 画面への表示追加に限定し、新規画面遷移は追加しない                          | Phase 1 要件定義書の設計制約                       |
| DC-02   | 権限確認の取り消しが3タップ以内で完了できる導線設計とする                            | UX/説明責任観点の受入基準                          |
| DC-03   | PermissionDialog の既存3ボタン構成基盤を破壊しない                                   | 既存 UI 契約の維持（ボタン数はリスクレベルで制御） |
| DC-04   | INS-01/02/03 は全て既存画面内への表示追加であり、新規ルーティングを追加しない        | Phase 2 設計方針（新規画面追加禁止）               |
| DC-05   | INS-03 の「権限設定を確認する」リンクから Permission History Panel への遷移は1タップ | DC-02 の導出制約                                   |
| DC-06   | INS-02 は既存の `awaiting_permission` 状態と同期し、独自の状態管理を追加しない       | 既存 PermissionResolver 契約の維持                 |

---

## 10. 検証可能性

### 10.1 INS-01 の検証条件

| テスト ID  | 検証内容                                                                              | 期待結果                                                   |
| ---------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| V-INS01-1  | `skill.tools` に `riskLevel === "critical"` のツールが1件存在する場合                 | `shouldShowBanner === true`、`bannerVariant === "warning"` |
| V-INS01-2  | `skill.tools` に `riskLevel === "high"` のツールが1件存在する場合                     | `shouldShowBanner === true`、`bannerVariant === "warning"` |
| V-INS01-3  | `skill.tools` の全ツールが `riskLevel === "low"` かつ `safetyGrade === "SAFE"` の場合 | `shouldShowBanner === false`                               |
| V-INS01-4  | `safetyGrade === "UNSAFE"` の場合                                                     | `shouldDisableCTA === true`、`bannerVariant === "error"`   |
| V-INS01-5  | `safetyGrade === "SAFE_WITH_WARNINGS"` の場合                                         | `shouldShowBanner === true`、`shouldDisableCTA === false`  |
| V-INS01-6  | `scoringGate === "NEEDS_IMPROVEMENT"` かつ `hasHighOrCritical === true` の場合        | バナーテキストに「改善が推奨されています」を含む           |
| V-INS01-7  | `safetyGrade === "UNSAFE"` かつ `scoringGate === "NEEDS_IMPROVEMENT"` の場合          | `shouldDisableCTA === true`（SafetyGrade が最優先）        |
| V-INS01-8  | `scoringGate === "SAVE_ALLOWED"` の場合                                               | `shouldShowBanner === false`（CTA 自体が非表示）           |
| V-INS01-9  | 「権限の詳細を見る」クリック後のツール一覧表示                                        | 全リスクツールの名前・レベル・操作内容が表示される         |
| V-INS01-10 | `NEEDS_IMPROVEMENT` かつ `maxRiskLevel === "low"` の場合                              | `bannerVariant === "info"`、改善推奨テキストのみ表示       |

### 10.2 INS-02 の検証条件

| テスト ID | 検証内容                                       | 期待結果                                               |
| --------- | ---------------------------------------------- | ------------------------------------------------------ |
| V-INS02-1 | `PermissionResolver.pendingCount === 0` の場合 | インジケーター非表示                                   |
| V-INS02-2 | `PermissionResolver.pendingCount === 1` の場合 | 「権限確認中...」+ ツール名を表示                      |
| V-INS02-3 | `PermissionResolver.pendingCount === 3` の場合 | 「権限確認中...（3件の権限確認を待っています）」を表示 |
| V-INS02-4 | `DEFAULT_TIMEOUT_MS`（300000ms）経過後         | 「タイムアウトしました」を3000ms 表示後に非表示        |
| V-INS02-5 | INS-02 表示中に送信ボタンが無効化されている    | 送信ボタンの `disabled` 属性が `true`                  |

### 10.3 INS-03 の検証条件

| テスト ID | 検証内容                                                                       | 期待結果                                                 |
| --------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| V-INS03-1 | `session.permissionDecisions.length === 0` の場合                              | サマリー非表示                                           |
| V-INS03-2 | `session.permissionDecisions.length === 1` で `decision === "approved"` の場合 | 「{toolName} x 1回（常に許可）」を表示                   |
| V-INS03-3 | `session.permissionDecisions` に `approved` と `denied` が混在する場合         | 承認セクションと拒否セクションの両方を表示               |
| V-INS03-4 | `session.permissionDecisions` に `approved_once` が含まれる場合                | 「今回のみ」として表示                                   |
| V-INS03-5 | 「権限設定を確認する」リンクのクリック先                                       | Permission History Panel への遷移（1タップ、DC-02 充足） |

### 10.4 ScoringGate x maxRiskLevel マトリクスの検証条件

| テスト ID | 検証内容                                                                     | 期待結果                                                   |
| --------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| V-MAT-01  | `RECOMMENDED` x `critical`                                                   | `shouldShowBanner === true`、`bannerVariant === "warning"` |
| V-MAT-02  | `RECOMMENDED` x `low`                                                        | `shouldShowBanner === false`                               |
| V-MAT-03  | `SAVE_ALLOWED` x `critical`                                                  | `shouldShowBanner === false`（CTA 非表示）                 |
| V-MAT-04  | `NEEDS_IMPROVEMENT` x `high`                                                 | バナーテキストに「改善が推奨されています」を含む           |
| V-MAT-05  | `NEEDS_IMPROVEMENT` x `low`                                                  | `bannerVariant === "info"`                                 |
| V-MAT-06  | `USE_ALLOWED` x `medium`                                                     | `shouldShowBanner === false`                               |
| V-MAT-07  | `UNSAFE` 上書きで `RECOMMENDED` x `low` の CTA が `disabled` に変更される    | `shouldDisableCTA === true`                                |
| V-MAT-08  | `SAFE_WITH_WARNINGS` 上書きで `RECOMMENDED` x `low` のバナーが強制表示される | `shouldShowBanner === true`                                |

### 10.5 PermissionDialog 説明責任テキストの検証条件

| テスト ID | 検証内容                                                                          | 期待結果                                                |
| --------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| V-RT-01   | `tool.riskLevel === "critical"` の場合                                            | reason に「不可逆的な操作」テキストを含む               |
| V-RT-02   | `tool.riskLevel === "high"` の場合                                                | reason に「権限昇格または機密データ」テキストを含む     |
| V-RT-03   | `scoringGate === "NEEDS_IMPROVEMENT"` かつ `score === 45` の場合                  | reason に「改善が推奨されています。スコア: 45点」を含む |
| V-RT-04   | `tool.riskLevel === "low"` かつ `scoringGate === "RECOMMENDED"` の場合            | 追加テキストなし（`getDescription` の出力のみ）         |
| V-RT-05   | `tool.riskLevel === "critical"` かつ `scoringGate === "NEEDS_IMPROVEMENT"` の場合 | prefix と suffix の両方が reason に含まれる             |
