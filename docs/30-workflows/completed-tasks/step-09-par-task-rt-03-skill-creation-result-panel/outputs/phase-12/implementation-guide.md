# Phase 12: 実装ガイド

## 対象タスク: TASK-RT-03 Skill Creation Result Panel

---

## Part 1: 中学生レベル概念説明

### PlanResultDetailPanel（計画結果パネル）

「料理前の材料・手順チェックリスト」のようなものです。

AI がスキル（自動化のレシピ）を作る前に、「こういう計画で作ります」という内容を見せるパネルです。以下の情報が表示されます:

- **スキル名**: 作ろうとしているスキルの名前
- **説明**: そのスキルが何をするかの説明文
- **エージェント（助手）**: スキルを作るために働く AI の助手たち。それぞれの名前と役割が表示される
- **スクリプト（作業手順書）**: AI が実行する作業手順のリスト
- **トリガー（開始条件）**: どういう時にこのスキルが動き出すかの条件
- **アンカー（品質基準）**: スキルの品質を保つための基準
- **推定ステップ数**: 作成に何ステップくらいかかるかの予測

### ExecuteResultDetailPanel（実行結果パネル）

「実行結果の通知」です。

AI がスキルを作った後に「成功しました」か「失敗しました」を教えてくれるパネルです。

- **成功した場合**: 緑色の「成功」バッジと完了メッセージが表示される
- **失敗した場合**: 赤色の「失敗」バッジ、エラーメッセージ、そして「やり直し」ボタンが表示される

### ErrorBanner（エラーバナー）

「赤い警告メッセージ」です。

何か問題が起きた時に画面上部に出る赤い帯です。エラーの内容が書かれていて、問題が解決できそうな場合は「やり直し」ボタンも表示されます。

---

## Part 2: 技術詳細

### Props インターフェース

```typescript
// 共通エラー型
interface PanelError {
  code?: string;
  message: string;
  retryable?: boolean;
}

// Plan 結果パネル
interface PlanResultDetailPanelProps {
  planResult: RuntimeSkillCreatorPlanResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

// Execute 結果パネル
interface ExecuteResultDetailPanelProps {
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}
```

### レンダリングロジック

両パネル共通の状態遷移:

1. `isLoading === true` → スケルトンローダー表示
2. `data === null && error !== null` → ErrorBanner 表示
3. `data === null && error === null` → `null` を返す（非表示）
4. `data !== null` → 完全なパネル表示

### 共有ユーティリティ: result-panel-parts.tsx

コンポーネント間で共有される UI 部品:

| エクスポート       | 役割                                 |
| ------------------ | ------------------------------------ |
| PANEL_CARD_CLASSES | カードコンテナの共通 Tailwind クラス |
| SectionHeader      | セクション見出しコンポーネント       |
| TagList            | タグ配列を横並びバッジとして表示     |
| DetailFooter       | ID 表示用フッター                    |
| StatusBadge        | 成功/失敗を色分けして表示するバッジ  |

### Tailwind CSS デザイントークン

CSS カスタムプロパティを使用し、ダークモード対応を実現:

| 用途           | CSS 変数           | 使用例                           |
| -------------- | ------------------ | -------------------------------- |
| ボーダー       | `--border-primary` | `border-[var(--border-primary)]` |
| 背景（カード） | `--bg-secondary`   | `bg-[var(--bg-secondary)]`       |
| テキスト       | `--text-primary`   | `text-[var(--text-primary)]`     |
| 成功色         | `--status-success` | `bg-[var(--status-success)]/10`  |
| エラー色       | `--status-error`   | `bg-[var(--status-error)]/10`    |
| 背景（内部）   | `--bg-primary`     | `bg-[var(--bg-primary)]`         |

### テスト構成

- フレームワーク: Vitest + @testing-library/react
- 環境: happy-dom
- テスト数: 53 件（ErrorBanner 5, PlanResultDetailPanel 14, ExecuteResultDetailPanel 11, SkillLifecyclePanel 統合）
- カバレッジ: 全レンダリングパス、状態遷移、コールバック実行を網羅

### SkillLifecyclePanel 統合パターン

```typescript
// ローカル state で raw detail を保持
const [rawPlanDetail, setRawPlanDetail] = useState<RuntimeSkillCreatorPlanResult | null>(null);
const [rawExecuteDetail, setRawExecuteDetail] = useState<RuntimeSkillCreatorExecuteResult | null>(null);

// currentPhase に応じた条件レンダリング
{currentPhase === "review" && rawPlanDetail !== null && (
  <PlanResultDetailPanel planResult={rawPlanDetail} />
)}

{currentPhase === "verify" && rawExecuteDetail !== null && (
  <ExecuteResultDetailPanel executeResult={rawExecuteDetail} />
)}
```

### 型絞り込み（Type Narrowing）

IPC レスポンスの判別に使用するガード:

- **Plan レスポンス判別**: `"planId" in response` で RuntimeSkillCreatorPlanResult を識別
- **Execute terminal_handoff 判別**: `isExecuteTerminalHandoff(response)` ガード関数で terminal_handoff レスポンスを除外
