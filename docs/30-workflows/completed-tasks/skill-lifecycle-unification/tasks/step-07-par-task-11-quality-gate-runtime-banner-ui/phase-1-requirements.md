# Phase 1 - 要件定義

## メタ情報

| 項目       | 値                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-QUALITY-RUNTIME-UI-001                                                                                                         |
| Phase      | 1 / 13                                                                                                                                            |
| 名称       | 要件定義                                                                                                                                          |
| 目的       | QualityGateLabel と RuntimeBanner の要件を分析・定義する                                                                                          |
| 前 Phase   | なし（起点）                                                                                                                                      |
| 次 Phase   | Phase 2（設計）                                                                                                                                   |
| 成果物パス | `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-11-quality-gate-runtime-banner-ui/outputs/phase-1/requirements-analysis.md` |

## 目的

以下の2つのギャップを要件として定義する。

- **C-05**: `improve` ステップで quality gate の判定結果（NEEDS_IMPROVEMENT / SAVE_ALLOWED / USE_ALLOWED / RECOMMENDED）が文字ラベルで表示されていない。ScoreDisplay.tsx（L84-110）は `getScoreVariant` による色変化のみで間接表示している。
- **C-06**: `execute` ステップで runtime banner が小さな StatusBadge（SkillStreamingView.tsx L50-67）にとどまり、実行経路（API / Terminal / Subscription）と trust 境界（permission mode）を同時に示していない。

## 参照資料

| 資料                   | パス                                                                                  | 参照目的                                              |
| ---------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| UI/UX 契約             | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`（L32-38）        | execute/improve ステップの必須 UI 定義                |
| コンポーネント図       | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md`（L56-71, L134-147） | RuntimeBanner / QualityGateLabel のコンポーネント配置 |
| ScoringGate 型         | `packages/shared/src/types/skill-improver.ts`（L299-366）                             | getScoreGate / getScoreGateResult の仕様              |
| CTA 可視性             | `packages/shared/src/types/cta-visibility.ts`（L42-88）                               | gate 別の CTA 表示状態マトリクス                      |
| ScoreDisplay.tsx       | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`（L84-110）              | 現状の色変化ロジック（スコアバリアント）              |
| SkillStreamingView.tsx | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`（L30-67）         | 現状の StatusBadge 実装と不足要素                     |

## 実行タスク

### Task 1-1: getScoreGate / getScoreGateResult の戻り値仕様の調査

**調査対象ファイル**: `packages/shared/src/types/skill-improver.ts`

**調査内容**:

`getScoreGate(score: number): ScoringGate` の戻り値パターンを全列挙する。

| スコア範囲 | ScoringGate       | canSave | canUse | isRecommended |
| ---------- | ----------------- | ------- | ------ | ------------- |
| 0-59       | NEEDS_IMPROVEMENT | false   | false  | false         |
| 60-79      | SAVE_ALLOWED      | true    | false  | false         |
| 80-99      | USE_ALLOWED       | true    | true   | false         |
| 100        | RECOMMENDED       | true    | true   | true          |

`ScoringGateResult` は `{ gate, score, canSave, canUse, isRecommended }` の5フィールドを持つ。QualityGateLabel は `gate` フィールドを主入力として使用する。

### Task 1-2: getCTAVisibilityFromScore の実装と表示ロジックの確認

**調査対象ファイル**: `packages/shared/src/types/cta-visibility.ts`

**確認内容**:

`CTA_VISIBILITY_MAP` が定義する gate 別 CTA 状態は以下の通り。

| ScoringGate       | useNow   | saveLater | improveFirst | improveRecommended | isHighlighted |
| ----------------- | -------- | --------- | ------------ | ------------------ | ------------- |
| NEEDS_IMPROVEMENT | disabled | disabled  | primary      | hidden             | false         |
| SAVE_ALLOWED      | disabled | primary   | secondary    | secondary          | false         |
| USE_ALLOWED       | primary  | secondary | hidden       | hidden             | false         |
| RECOMMENDED       | primary  | secondary | hidden       | hidden             | true          |

QualityGateLabel は `CTAVisibility.isHighlighted` を参照して RECOMMENDED 状態の強調表示を制御する。

### Task 1-3: ScoreDisplay.tsx の現状の色変化ロジックの確認（L84-110）

**確認対象ファイル**: `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`

**現状の実装**:

`getScoreVariant(score: number): ScoreVariant` が score 値をもとに `"success" | "warning" | "error"` を返し、`scoreVariantStyles` / `scoreBarStyles` が CSS 変数ベースの色クラスを適用する。

**不足している表示要素**:

- ゲート名のテキストラベル（例: "改善が必要" / "保存可能" / "利用可" / "推奨"）が存在しない
- `canSave` / `canUse` フラグに基づくアクション可否の明示テキストがない
- RECOMMENDED 時の強調スタイルがない

### Task 1-4: StatusBadge の現状の表示内容と不足要素（trust 境界情報）の特定

**確認対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`（L30-67）

**現状の実装**:

`STATUS_CONFIG` が `SkillExecutionStatus` を `{ color: string; label: string }` にマップする。バッジは `role="status"` の `span` 要素で、`rounded-full` のコンパクトバッジ形式。

**不足している表示要素**:

- 実行経路の表示がない（API キー実行 / Terminal handoff / Subscription の区別）
- trust 境界の表示がない（permission mode: default / acceptEdits / bypassPermissions / plan）
- バナー形式ではなく小バッジ形式のため、情報密度が不十分

### Task 1-5: SkillStreamingView の runtime 表示領域の確認

**確認対象**: `SkillStreamingView.tsx`（L198-249）

**現状のヘッダー領域**（L207-226）:

```
div.flex.items-center.justify-between
  div.flex.items-center.gap-2
    span[skill-name]
    StatusBadge         ← ここを RuntimeBanner に置き換える
  button[abort]         ← running 時のみ表示（保持する）
```

RuntimeBanner はヘッダー全体に広がるバナーとして StatusBadge を置き換え、スキル名・実行ステータス・実行経路・permission mode を1行または2行で表示する。abort ボタンは RuntimeBanner の右端に統合するか、バナー下部に配置する。

### Task 1-6: ui-ux-realization.md L32 「実行経路と trust 境界を同時に見せる」の具体的要件分解

**参照**: `ui-ux-realization.md`（L37）: `execute ステップ必須 UI: runtime banner、permission、result summary`

**要件分解**:

| 表示要素                      | 説明                                                                  | 必須/任意 |
| ----------------------------- | --------------------------------------------------------------------- | --------- |
| 実行ステータス                | running / permission_pending / completed / cancelled / error のラベル | 必須      |
| 実行経路                      | API キー（integrated）/ Terminal（handoff）/ Subscription のいずれか  | 必須      |
| trust 境界（permission mode） | default / acceptEdits / bypassPermissions / plan のいずれか           | 必須      |
| プロバイダ名                  | 使用中の LLM プロバイダ（anthropic / openai 等）                      | 任意      |
| モデル名                      | 使用中のモデル（claude-opus-4 等）                                    | 任意      |

**実行経路の定義**:

- `integrated`: API キーを使用した直接実行
- `handoff`: Claude Code terminal への委譲
- `subscription`: Claude.ai Subscription を通じた実行

**trust 境界の定義** （SDK PermissionMode に準拠）:

- `default`: デフォルト権限
- `acceptEdits`: 編集操作を自動承認
- `bypassPermissions`: 権限チェックをバイパス
- `plan`: 計画モード（実行せずに計画のみ）

## スコープ注記

**スコープ外注記**: Reuse フェーズ（再利用時）における QualityGateLabel の表示要否は本タスクのスコープ外とする。Reuse 時のスコア表示が必要な場合は後続タスクとして未タスク化する。

## 受入基準

- [ ] quality gate の4段階（NEEDS_IMPROVEMENT / SAVE_ALLOWED / USE_ALLOWED / RECOMMENDED）の表示ラベル仕様が日本語・英語両方で定義されている
- [ ] 各ゲート段階の背景色・テキスト色・アイコンの仕様が Apple HIG カラーパレットに基づいて定義されている
- [ ] runtime banner の表示要素（実行ステータス・実行経路・permission mode）が仕様として定義されている
- [ ] StatusBadge から RuntimeBanner への置き換え範囲が SkillStreamingView.tsx の行番号で特定されている
- [ ] ScoreDisplay.tsx の隣への QualityGateLabel 配置位置が設計資料に反映されている
- [ ] SkillAnalysisView.tsx が QualityGateLabel を組み込む対象コンポーネントとして特定されている

## 成果物

`outputs/phase-1/requirements-analysis.md`

以下の5セクションを含む。

1. **ギャップ分析**: C-05 / C-06 の現状実装と要件の差分
2. **QualityGateLabel 表示仕様**: ゲート別ラベル・色・アイコン定義表
3. **RuntimeBanner 表示要素仕様**: 表示フィールド・データソース・更新タイミング
4. **統合先コンポーネント特定**: QualityGateLabel → SkillAnalysisView、RuntimeBanner → SkillStreamingView
5. **受入基準チェックリスト**

## 完了条件

- [ ] requirements-analysis.md が `outputs/phase-1/` に作成されている
- [ ] QualityGateLabel の表示ラベル仕様（4段階 x 日本語ラベル x 英語 ARIA ラベル）が定義されている
- [ ] RuntimeBanner の表示要素仕様（必須5フィールド + 任意2フィールド）が定義されている
- [ ] 統合対象コンポーネントのファイルパスと変更対象行が特定されている
- [ ] Phase 2（設計）着手の前提条件が満たされている

## 次 Phase

Phase 2 - 設計: `phase-2-design.md`
