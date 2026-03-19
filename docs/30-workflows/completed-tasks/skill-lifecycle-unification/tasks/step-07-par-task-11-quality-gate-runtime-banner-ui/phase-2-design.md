# Phase 2 - 設計

## メタ情報

| 項目       | 値                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-QUALITY-RUNTIME-UI-001                                                                                                   |
| Phase      | 2 / 13                                                                                                                                      |
| 名称       | 設計                                                                                                                                        |
| 目的       | QualityGateLabel と RuntimeBanner のコンポーネント設計を定義する                                                                            |
| 前 Phase   | Phase 1（要件定義）: `outputs/phase-1/requirements-analysis.md` が完了していること                                                          |
| 次 Phase   | Phase 3（設計レビュー）                                                                                                                     |
| 成果物パス | `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-11-quality-gate-runtime-banner-ui/outputs/phase-2/design-document.md` |

## 目的

Phase 1 の要件定義をもとに、以下2コンポーネントのインターフェース・ビジュアル・統合設計を定義する。

1. **QualityGateLabel** (molecule): ScoringGate の判定結果を明示ラベルで表示する
2. **RuntimeBanner** (molecule): 実行経路と trust 境界を同時に表示するバナーコンポーネント

## 参照資料

| 資料                   | パス                                                                | 参照目的                                 |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| Phase 1 成果物         | `outputs/phase-1/requirements-analysis.md`                          | 要件定義の確定内容                       |
| Apple HIG カラー       | `.claude/rules/01-architecture.md`（カラーパレットセクション）      | Apple HIG システムカラー準拠             |
| ScoringGate 型         | `packages/shared/src/types/skill-improver.ts`（L322-366）           | Props 型の参照元                         |
| CTA 可視性             | `packages/shared/src/types/cta-visibility.ts`（L16-88）             | isHighlighted フラグの参照元             |
| ScoreDisplay.tsx       | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`       | 統合先の既存コンポーネント構造           |
| SkillStreamingView.tsx | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` | 統合先の既存コンポーネント構造           |
| P47 準拠               | `.claude/rules/06-known-pitfalls.md`（P47）                         | variantStyles を Record 型で export する |

## 実行タスク

### Task 2-1: QualityGateLabel の Props 設計

**コンポーネント種別**: molecule
**配置先**: `apps/desktop/src/renderer/components/skill/QualityGateLabel.tsx`

**Props インターフェース**:

```typescript
import type {
  ScoringGate,
  ScoringGateResult,
} from "@repo/shared/types/skill-improver";
import type { CTAVisibility } from "@repo/shared/types/cta-visibility";

export interface QualityGateLabelProps {
  /** ScoringGate 判定結果（必須）: NEEDS_IMPROVEMENT / SAVE_ALLOWED / USE_ALLOWED / RECOMMENDED */
  gate: ScoringGate;
  /** 詳細フラグ（任意）: canSave / canUse / isRecommended を含む完全な判定結果 */
  gateResult?: ScoringGateResult;
  /** CTA 可視性（任意）: isHighlighted による RECOMMENDED 強調表示制御 */
  ctaVisibility?: Pick<CTAVisibility, "isHighlighted">;
  /** サイズバリアント（任意、デフォルト: "md"）: "sm" | "md" */
  size?: "sm" | "md";
}
```

**ゲート別ラベル定義**:

| ScoringGate       | 日本語ラベル | 英語 ARIA ラベル                |
| ----------------- | ------------ | ------------------------------- |
| NEEDS_IMPROVEMENT | 改善が必要   | Quality gate: Needs improvement |
| SAVE_ALLOWED      | 保存可能     | Quality gate: Save allowed      |
| USE_ALLOWED       | 利用可能     | Quality gate: Use allowed       |
| RECOMMENDED       | 推奨         | Quality gate: Recommended       |

### Task 2-2: QualityGateLabel のビジュアル設計

**Apple HIG カラーパレット準拠** (`.claude/rules/01-architecture.md` カラーパレットセクション):

| ScoringGate       | 背景色（ライト）   | テキスト色       | Apple 名称              |
| ----------------- | ------------------ | ---------------- | ----------------------- |
| NEEDS_IMPROVEMENT | `--status-error`   | `--text-inverse` | systemRed（#FF3B30）    |
| SAVE_ALLOWED      | `--status-warning` | `--text-inverse` | systemOrange（#FF9500） |
| USE_ALLOWED       | `--status-success` | `--text-inverse` | systemGreen（#34C759）  |
| RECOMMENDED       | `--status-success` | `--text-inverse` | systemGreen（#34C759）  |

RECOMMENDED は `isHighlighted: true` の場合にリング装飾（`ring-2 ring-offset-1 ring-[var(--status-success)]`）を追加する。

**P47 準拠の variantStyles 定義**（モジュールスコープ export）:

```typescript
export const qualityGateLabelStyles: Record<ScoringGate, string> = {
  NEEDS_IMPROVEMENT: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  SAVE_ALLOWED: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  USE_ALLOWED: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  RECOMMENDED: "bg-[var(--status-success)] text-[var(--text-inverse)]",
};
```

**サイズ別スタイル**:

- `sm`: `text-xs px-2 py-0.5 rounded-full`（ScoreDisplay.tsx の ScoreDeltaBadge と同サイズ）
- `md`: `text-sm px-3 py-1 rounded-full font-medium`

#### Badge atom の再利用検討

`atoms/Badge/index.tsx` は variant（"success" | "warning" | "error" 等）と size（"sm" | "md"）を持ち、P47 準拠の `variantStyles` Record 型が定義済みである。QualityGateLabel は Badge atom を内部で使用するラッパーとして実装する。

| ScoringGate       | Badge variant | 理由                      |
| ----------------- | ------------- | ------------------------- |
| NEEDS_IMPROVEMENT | "error"       | systemRed 対応            |
| SAVE_ALLOWED      | "warning"     | systemOrange 対応         |
| USE_ALLOWED       | "success"     | systemGreen 対応          |
| RECOMMENDED       | "success"     | systemGreen + ring で強調 |

この方式により DRY 原則を維持し、Badge の variantStyles を二重定義しない。

### Task 2-3: SkillAnalysisView への QualityGateLabel 統合設計

**統合先確認が必要なファイル**: `SkillAnalysisView.tsx`（実在確認後に行番号を特定する）

**統合位置**: ScoreDisplay コンポーネントの右隣または下部に配置する。

**推奨レイアウト**:

```text
+------------------------------------------+
| [BarChart3] スキル分析結果                |
+------------------------------------------+
| 総合スコア: 75  [保存可能]  [+5点向上]   |   ← QualityGateLabel を ScoreDeltaBadge の左に配置
+------------------------------------------+
| カテゴリ別分析                            |
| ...                                       |
+------------------------------------------+
```

`ScoreDisplay.tsx` の `OverallScore` コンポーネント（L153-170）の `delta` バッジと同じ行に `QualityGateLabel` を追加するか、`ScoreDisplay` の外側から `SkillAnalysisView` が並列で配置する2方式を設計書で比較する。

**Props の受け渡しパターン**:

```typescript
// SkillAnalysisView または ScoreDisplay の親コンポーネントで算出
const gateResult = getScoreGateResult(analysis.overallScore);
const ctaVisibility = getCTAVisibility(gateResult);

<QualityGateLabel
  gate={gateResult.gate}
  gateResult={gateResult}
  ctaVisibility={{ isHighlighted: ctaVisibility.isHighlighted }}
  size="sm"
/>
```

### Task 2-4: RuntimeBanner の Props 設計

**コンポーネント種別**: molecule
**配置先**: `apps/desktop/src/renderer/components/skill/RuntimeBanner.tsx`

**実行経路の型定義**（`@repo/shared` への追加が必要な場合は未タスク化する）:

```typescript
export type RuntimeMode = "integrated" | "handoff" | "subscription";
```

**TrustLevel の型定義**（SDK PermissionMode に準拠）:

```typescript
export type TrustLevel =
  | "default"
  | "acceptEdits"
  | "bypassPermissions"
  | "plan";
```

**Props インターフェース**:

```typescript
import type { SkillExecutionStatus } from "@repo/shared";

export interface RuntimeBannerProps {
  /** 実行ステータス（必須）: running / permission_pending / completed / cancelled / error */
  executionStatus: SkillExecutionStatus | null;
  /** 実行経路（必須）: integrated / handoff / subscription */
  runtimeMode: RuntimeMode;
  /** trust 境界（必須）: default / acceptEdits / bypassPermissions / plan */
  trustLevel: TrustLevel;
  /** LLM プロバイダ名（任意）: anthropic / openai 等 */
  provider?: string;
  /** モデル名（任意）: claude-opus-4 等 */
  model?: string;
  /** 実行中止コールバック（任意）: running 時のみ表示 */
  onAbort?: () => void;
}
```

### Task 2-5: RuntimeBanner のビジュアル設計

**バナー形式**（SkillStreamingView のヘッダー領域全体に展開）:

```text
+-----------------------------------------------------------------------+
| [●] 実行中  |  integrated  |  acceptEdits  |  anthropic / claude-4   [停止] |
+-----------------------------------------------------------------------+
```

**2行レイアウト（モバイル幅対応）**:

```text
+---------------------------+
| [●] 実行中    [停止する]  |
| integrated · acceptEdits  |
+---------------------------+
```

**実行ステータス別スタイル**（既存 `STATUS_CONFIG` を拡張）:

| SkillExecutionStatus | インジケーター色   | Apple 名称              |
| -------------------- | ------------------ | ----------------------- |
| running              | `--status-primary` | systemBlue（#007AFF）   |
| permission_pending   | `--status-warning` | systemOrange（#FF9500） |
| completed            | `--status-success` | systemGreen（#34C759）  |
| cancelled            | `--text-muted`     | systemGray（#8E8E93）   |
| error                | `--status-error`   | systemRed（#FF3B30）    |

**P47 準拠の statusStyles 定義**:

```typescript
export const runtimeBannerStatusStyles: Record<DisplayableStatus, string> = {
  running: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  permission_pending: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  completed: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  cancelled: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
  error: "bg-[var(--status-error)] text-[var(--text-inverse)]",
};
```

**runtimeMode 表示ラベル**:

| RuntimeMode  | 表示ラベル    | ARIA ラベル                    |
| ------------ | ------------- | ------------------------------ |
| integrated   | API 実行      | Runtime mode: API integrated   |
| handoff      | Terminal 委譲 | Runtime mode: Terminal handoff |
| subscription | Subscription  | Runtime mode: Subscription     |

**trustLevel 表示ラベル**:

| TrustLevel        | 表示ラベル   | ARIA ラベル                      |
| ----------------- | ------------ | -------------------------------- |
| default           | 標準権限     | Trust level: Default permissions |
| acceptEdits       | 編集自動承認 | Trust level: Auto accept edits   |
| bypassPermissions | 権限バイパス | Trust level: Bypass permissions  |
| plan              | 計画モード   | Trust level: Plan only           |

**バナー背景スタイル**:

```text
bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 py-2
```

### Task 2-6: SkillStreamingView への RuntimeBanner 統合設計

**置き換え対象**: `SkillStreamingView.tsx` の StatusBadge コンポーネント（L50-67）と HeaderBadge 使用箇所（L212-213）

**変更前**（SkillStreamingView.tsx L207-226）:

```typescript
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <span className="font-medium text-sm" data-testid="skill-name">
      {skillName}
    </span>
    <StatusBadge status={status} />  {/* ← 削除 */}
  </div>
  {status === "running" && (
    <button onClick={abortExecution} ...>停止する</button>
  )}
</div>
```

**変更後**（設計案）:

```typescript
<RuntimeBanner
  executionStatus={status}
  runtimeMode={runtimeMode}   {/* props として追加 */}
  trustLevel={trustLevel}     {/* props として追加 */}
  provider={provider}         {/* props として追加（任意） */}
  model={model}               {/* props として追加（任意） */}
  onAbort={status === "running" ? abortExecution : undefined}
/>
```

**SkillStreamingViewProps の追加 props**:

```typescript
export interface SkillStreamingViewProps {
  skillName: string;
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus | null;
  // 以下を追加
  runtimeMode?: RuntimeMode; // デフォルト: "integrated"
  trustLevel?: TrustLevel; // デフォルト: "default"
  provider?: string;
  model?: string;
}
```

**後方互換性**: `runtimeMode` と `trustLevel` はオプション型にし、未指定時は既存の StatusBadge と同等の表示にフォールバックする。破壊的変更は生じない。

**置き換え義務**: SkillStreamingView.tsx の STATUS_CONFIG（bg-blue-500, bg-yellow-500 等の Tailwind 固定カラー）は、RuntimeBanner 導入時に CSS 変数（var(--status-\*)）へ必ず置き換える。これは Apple HIG 準拠とダークモード対応の必須作業である。

**ui-ux-realization.md 注記との整合**: 同文書の注記「runtime banner は StatusBadge として暫定実装されている」は設計当時の現状記述である。本タスクでは StatusBadge を RuntimeBanner コンポーネントへ昇格させる。Phase 3 レビュー時にこの解釈を確認する。

## 成果物

`outputs/phase-2/design-document.md`

以下の6セクションを含む。

1. **QualityGateLabel コンポーネント設計**: Props インターフェース・ラベル定義・スタイル定義
2. **RuntimeBanner コンポーネント設計**: Props インターフェース・スタイル定義・ラベル定義
3. **統合設計**: SkillAnalysisView への QualityGateLabel 統合、SkillStreamingView への RuntimeBanner 統合
4. **型定義追加**: RuntimeMode / TrustLevel の定義場所（@repo/shared への追加要否）
5. **後方互換性確認**: 既存 Props への影響範囲
6. **Phase 3 レビュー観点**: 設計レビューへの入力チェックリスト

## 完了条件

- [ ] QualityGateLabel の Props インターフェースが定義されている
- [ ] QualityGateLabel のゲート別ラベル・色・サイズ仕様が定義されている（P47 準拠の Record 型 export 含む）
- [ ] RuntimeBanner の Props インターフェースが定義されている
- [ ] RuntimeBanner のステータス別スタイルが定義されている（P47 準拠の Record 型 export 含む）
- [ ] SkillAnalysisView への QualityGateLabel 統合方式が具体的なコード例付きで定義されている
- [ ] SkillStreamingView への RuntimeBanner 統合方式（置き換え範囲・後方互換性）が定義されている
- [ ] RuntimeMode / TrustLevel 型の定義場所が決定されている（@repo/shared 追加 or desktop ローカル）
- [ ] QualityGateLabel のアイコン方針が決定されている（v1 ではアイコンなし、ラベルテキスト + カラーバッジのみ。アイコン追加は後続タスクとする）
- [ ] Phase 3（設計レビュー）着手の前提条件が満たされている

## 次 Phase

Phase 3 - 設計レビュー: `phase-3-design-review.md`
