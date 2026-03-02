# コンポーネントドキュメント: SkillAnalysisView

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-10A-B                            |
| 機能名   | SkillAnalysisView（スキル分析ビュー） |
| 作成日   | 2026-03-02                            |
| 更新日   | 2026-03-02                            |
| 状態     | implemented（実装完了）               |

## コンポーネント一覧

| コンポーネント    | レベル    | パス                                                                   | 責務                         |
| ----------------- | --------- | ---------------------------------------------------------------------- | ---------------------------- |
| SkillAnalysisView | organisms | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`     | 分析結果の統合表示・操作制御 |
| ScoreDisplay      | molecules | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`          | スコアの視覚的表示           |
| SuggestionList    | molecules | `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`        | 改善提案の表示・選択         |
| RiskPanel         | molecules | `apps/desktop/src/renderer/components/skill/RiskPanel.tsx`             | リスク情報のレベル別表示     |
| useSkillAnalysis  | hook      | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | 状態管理・API呼び出し        |

## SkillAnalysisView

### 概要

スキル分析ビューの organism コンポーネント。ScoreDisplay / SuggestionList / RiskPanel を統合し、分析実行・改善適用・全自動改善のワークフローを提供する。ビジネスロジックは `useSkillAnalysis` カスタムフックに分離済み。

### Props

| Prop        | 型           | 必須 | デフォルト | 説明                       |
| ----------- | ------------ | ---- | ---------- | -------------------------- |
| `skillName` | `string`     | Yes  | -          | 分析対象のスキル名         |
| `onClose`   | `() => void` | Yes  | -          | 閉じるボタンのコールバック |

### 使用例

```tsx
<SkillAnalysisView
  skillName="my-awesome-skill"
  onClose={() => setCurrentView("management")}
/>
```

### 状態遷移

1. **ローディング**: マウント時に分析APIを自動呼び出し。スピナーと「分析中...」を表示
2. **エラー**: 分析失敗時に `role="alert"` でエラーメッセージと再試行ボタンを表示
3. **結果表示**: 分析成功時に ScoreDisplay / SuggestionList / RiskPanel を表示。フッターに操作ボタン表示
4. **改善中**: 「選択を適用」または「全自動改善」実行中はボタンをdisabled化
5. **再分析**: 改善適用後に自動で分析APIを再呼び出し

### 内部構成

```
┌─────────────────────────────────┐
│ ヘッダー: skillName + 閉じるボタン │
├─────────────────────────────────┤
│ コンテンツ (overflow-y-auto)     │
│   ├── ローディング / エラー      │
│   ├── ScoreDisplay               │
│   ├── SuggestionList             │
│   └── RiskPanel                  │
├─────────────────────────────────┤
│ フッター: 選択を適用 / 全自動改善 │
└─────────────────────────────────┘
```

---

## ScoreDisplay

### 概要

総合スコアとカテゴリ別分析結果をプログレスバー付きで表示する molecule コンポーネント。`React.memo` でメモ化済み。スコア値に応じて success(80+) / warning(60-79) / error(0-59) の3段階の色分けを適用する。

### Props

| Prop       | 型              | 必須 | デフォルト | 説明                    |
| ---------- | --------------- | ---- | ---------- | ----------------------- |
| `analysis` | `SkillAnalysis` | Yes  | -          | 総合/カテゴリ別分析結果 |

### 使用例

```tsx
<ScoreDisplay analysis={analysis} />
```

### Export 一覧

| Export名             | 型                                | 用途                                |
| -------------------- | --------------------------------- | ----------------------------------- |
| `ScoreDisplay`       | `React.FC<ScoreDisplayProps>`     | メインコンポーネント                |
| `ScoreVariant`       | `type`                            | スコアバリアント型                  |
| `scoreVariantStyles` | `Record<ScoreVariant, string>`    | スコアバリアント別テキスト色（P47） |
| `scoreBarStyles`     | `Record<ScoreVariant, string>`    | スコアバリアント別バー背景色（P47） |
| `getScoreVariant`    | `(score: number) => ScoreVariant` | スコア値からバリアント判定          |

### スコアバリアント判定ロジック

| スコア範囲 | バリアント | テキスト色         | バー背景色         |
| ---------- | ---------- | ------------------ | ------------------ |
| 80-100     | `success`  | `--status-success` | `--status-success` |
| 60-79      | `warning`  | `--status-warning` | `--status-warning` |
| 0-59       | `error`    | `--status-error`   | `--status-error`   |

### 内部コンポーネント

- **OverallScore**: 総合スコアを大きな数値で表示
- **CategoryBar**: カテゴリごとにプログレスバー + 詳細テキスト + 課題リストを表示

---

## SuggestionList

### 概要

改善提案を優先度別にグループ化して表示し、チェックボックスで個別選択を可能にする molecule コンポーネント。`React.memo` でメモ化済み。提案が0件の場合は「改善提案はありません」の EmptyState を表示する。

### Props

| Prop          | 型                        | 必須 | デフォルト | 説明                       |
| ------------- | ------------------------- | ---- | ---------- | -------------------------- |
| `suggestions` | `Suggestion[]`            | Yes  | -          | 改善提案の配列             |
| `selected`    | `Set<number>`             | Yes  | -          | 選択済み提案のインデックス |
| `onToggle`    | `(index: number) => void` | Yes  | -          | 提案選択トグル             |

### 使用例

```tsx
<SuggestionList
  suggestions={analysis.suggestions}
  selected={selectedSuggestions}
  onToggle={handleToggleSuggestion}
/>
```

### Export 一覧

| Export名          | 型                                | 用途                          |
| ----------------- | --------------------------------- | ----------------------------- |
| `SuggestionList`  | `React.FC<SuggestionListProps>`   | メインコンポーネント          |
| `PriorityVariant` | `type`                            | 優先度バリアント型            |
| `priorityStyles`  | `Record<PriorityVariant, string>` | 優先度別バッジスタイル（P47） |

### 優先度グループ表示順

1. **高優先度** (`high`): エラー色（赤系）のバッジ
2. **中優先度** (`medium`): 警告色（橙系）のバッジ
3. **低優先度** (`low`): 情報色（青系）のバッジ

### 内部コンポーネント

- **SuggestionItem** (`memo`): 個別提案の表示。チェックボックス + タイプバッジ + 優先度バッジ + autoFixableバッジ + 説明テキスト

### 各バッジの表示条件

| バッジ   | 表示条件                      | スタイル                             |
| -------- | ----------------------------- | ------------------------------------ |
| タイプ   | 常に表示                      | `--bg-tertiary` / `--text-secondary` |
| 優先度   | 常に表示                      | `priorityStyles[priority]`           |
| 自動修正 | `autoFixable === true` の場合 | `--status-success` 系                |

---

## RiskPanel

### 概要

スキル分析で検出されたリスクをカード形式で表示する molecule コンポーネント。`React.memo` でメモ化済み。リスクレベルに応じた左ボーダー色分け（critical=赤、high=橙、medium=青、low=灰）を適用し、影響範囲と対策を表示する。リスクが0件の場合は「リスクは検出されていません」の EmptyState を表示する。

### Props

| Prop    | 型       | 必須 | デフォルト | 説明             |
| ------- | -------- | ---- | ---------- | ---------------- |
| `risks` | `Risk[]` | Yes  | -          | リスク情報の配列 |

### 使用例

```tsx
<RiskPanel risks={analysis.risks} />
```

### Export 一覧

| Export名           | 型                                 | 用途                                |
| ------------------ | ---------------------------------- | ----------------------------------- |
| `RiskPanel`        | `React.FC<RiskPanelProps>`         | メインコンポーネント                |
| `RiskLevelVariant` | `type`                             | リスクレベルバリアント型            |
| `riskLevelStyles`  | `Record<RiskLevelVariant, string>` | リスクレベル別カードスタイル（P47） |

### リスクレベル別スタイル

| レベル     | 左ボーダー色       | 背景色                | レベルバッジ                                       |
| ---------- | ------------------ | --------------------- | -------------------------------------------------- |
| `critical` | `--status-error`   | `--status-error` 5%   | `--status-error` 背景、`--text-inverse` テキスト   |
| `high`     | `--status-warning` | `--status-warning` 5% | `--status-warning` 背景、`--text-inverse` テキスト |
| `medium`   | `--status-info`    | `--status-info` 5%    | `--status-info` 背景、`--text-inverse` テキスト    |
| `low`      | `--border-primary` | `--bg-secondary`      | `--bg-tertiary` 背景、`--text-secondary` テキスト  |

### 内部コンポーネント

- **RiskCard** (`memo`): 個別リスクの表示。ヘッダー（カテゴリ名 + レベルバッジ）→ 説明 → 影響 → 対策（存在する場合のみ）

### カテゴリラベル

| カテゴリ        | 日本語ラベル   |
| --------------- | -------------- |
| `security`      | セキュリティ   |
| `compatibility` | 互換性         |
| `performance`   | パフォーマンス |
| `maintenance`   | メンテナンス   |

---

## 連携API（Preload）

| API                 | シグネチャ                                                                     | 説明             |
| ------------------- | ------------------------------------------------------------------------------ | ---------------- |
| `analyze`           | `(skillName: string) => Promise<SkillAnalysis>`                                | スキル分析を実行 |
| `applyImprovements` | `(skillName: string, suggestions: Suggestion[]) => Promise<ImprovementResult>` | 選択改善を適用   |
| `autoImprove`       | `(skillName: string) => Promise<ImprovementResult>`                            | 全自動改善を実行 |

## アクセシビリティ要件

| 要件                   | 実装状況                                                                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| キーボード操作         | Tab/Enter/Space で全操作要素（ボタン、チェックボックス）へ到達可能                                                                                            |
| ARIA 属性              | `role="alert"` (エラー)、`role="progressbar"` (スコアバー)、`role="list"` (リスト)、`aria-label="閉じる"` (閉じるボタン)、`aria-hidden="true"` (装飾アイコン) |
| プログレスバー属性     | `aria-valuenow`、`aria-valuemin=0`、`aria-valuemax=100` 付与済み                                                                                              |
| コントラスト比         | CSS変数ベースでWCAG 2.1 AA基準を満たすよう設計                                                                                                                |
| フォーカスリング       | ブラウザデフォルトのフォーカスリング使用                                                                                                                      |
| スクリーンリーダー対応 | エラー状態は `role="alert"` でライブ通知                                                                                                                      |

### アクセシビリティ補足

- `role="list"` 要素（RiskPanel、SuggestionList）へ `aria-label` を追加済み
- a11y回帰は `SuggestionList.test.tsx` / `RiskPanel.test.tsx` で検証済み
