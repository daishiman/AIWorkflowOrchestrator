# Result Panel Storybook 統合 - タスク指示書

## メタ情報

```yaml
issue_number: 1750
task_id: TASK-RT-03-STORYBOOK-001
task_name: Result Panel Storybook 統合
priority: 低
scale: 小規模
status: 未実施
```

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | TASK-RT-03-STORYBOOK-001                                                            |
| タスク名     | Result Panel Storybook 統合                                                         |
| 分類         | 開発環境整備                                                                        |
| 対象機能     | PlanResultDetailPanel / ExecuteResultDetailPanel / ErrorBanner / result-panel-parts |
| 優先度       | LOW                                                                                 |
| 見積もり規模 | S（Story ファイル 4〜6件作成）                                                      |
| ステータス   | unassigned                                                                          |
| 発見元       | TASK-RT-03 Phase 11 未タスク検出                                                    |
| 作成日       | 2026-03-30                                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RT-03（Skill Creation Result Panel）で実装した3コンポーネント（`PlanResultDetailPanel`・`ExecuteResultDetailPanel`・`ErrorBanner`）および共有部品（`result-panel-parts.tsx`）は、テストは53件実装済みだが、視覚的なカタログ（Storybook）が存在しない。

ローディング・エラー・空配列・ダークモード等の複数バリエーションを目視確認するには、現在 Electron アプリを起動してスキル作成ワークフローを実行する必要があり、UI レビューや新規開発者のオンボーディングに高いコストがかかっている。

### 1.2 問題点・課題

- 各コンポーネントの全バリエーション（正常/エラー/ローディング/空配列）を単独で確認する手段がない
- ダークモード表示の確認が Electron 起動なしにできない
- UI 変更時のビジュアルリグレッション検出が困難
- デザイナーとのコラボレーションに Storybook が有効だが現状未整備

### 1.3 放置した場合の影響

- **短期**: UI 変更のたびに Electron 起動が必要でレビューコストが高い
- **中期**: 後続の Verify/Improve 結果パネル実装時にも同様の問題が繰り返される
- **長期**: Storybook 不在のまま UI コンポーネントが増加し、ビジュアルカタログの整備コストが増大する

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-RT-03 で実装した4つのコンポーネントの全バリエーションを Storybook Story として作成し、ローカルおよび CI でビジュアル確認できる状態にする。

### 2.2 最終ゴール

- PlanResultDetailPanel: 正常表示・空配列・ローディング・エラー の 4 Story
- ExecuteResultDetailPanel: 成功・失敗・ローディング・エラー の 4 Story
- ErrorBanner: 再試行あり・再試行なし・長いメッセージ の 3 Story
- result-panel-parts: SectionHeader / TagList / StatusBadge / DetailFooter の基礎 Story

### 2.3 スコープ

| 対象       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| スコープ内 | 上記4コンポーネントの Story ファイル作成（.stories.tsx） |
| スコープ内 | ダークモード切り替え対応（Storybook backgrounds addon）  |
| スコープ外 | VisualRegression テスト（Chromatic 等）の CI 統合        |
| スコープ外 | Verify/Improve 結果パネルの Story（後続タスクで対応）    |
| スコープ外 | Storybook 自体のセットアップ（既存設定が前提）           |

---

## 3. どう実装するか（How）

### 3.1 対応方針

各コンポーネントと同ディレクトリに `.stories.tsx` ファイルを作成する。CSF (Component Story Format) 3.0 を使用し、`Meta` と `StoryObj` 型で型安全に記述する。

### 3.2 ファイル構成

```
apps/desktop/src/renderer/components/skill/
├── ErrorBanner.stories.tsx
├── PlanResultDetailPanel.stories.tsx
├── ExecuteResultDetailPanel.stories.tsx
└── result-panel-parts.stories.tsx
```

### 3.3 Story 作成例（ErrorBanner）

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ErrorBanner } from "./ErrorBanner";

const meta: Meta<typeof ErrorBanner> = {
  title: "Skill/ResultPanel/ErrorBanner",
  component: ErrorBanner,
};
export default meta;

type Story = StoryObj<typeof ErrorBanner>;

export const WithRetry: Story = {
  args: {
    error: {
      code: "NETWORK_ERROR",
      message: "ネットワーク接続に失敗しました",
      retryable: true,
    },
    onRetry: () => console.log("retry clicked"),
  },
};

export const NoRetry: Story = {
  args: {
    error: {
      code: "PERMISSION_DENIED",
      message: "権限がありません",
      retryable: false,
    },
  },
};
```

---

## 4. 関連する苦戦箇所・Pitfall

- **TASK-RT-03 での苦戦**: Storybook を持たない状態で複数のバリエーション（ローディング・エラー・空配列）のテストを unit test のみで書く際、DOM アサーションが煩雑になった。Storybook の `play` 関数と組み合わせた Interaction Testing に移行すれば、テストコードの可読性が向上する可能性がある
- **Electron + Storybook の互換性**: Electron 環境固有の API（`window.electronAPI` 等）をモックする設定が必要。`.storybook/preview.ts` でグローバルモックを設定しないとパネルが起動しない
- **デザイントークン**: Tailwind カスタムプロパティ（`--bg-primary` 等）を Storybook で有効化するには、global CSS の import 設定が必要

---

## 5. 受入基準

- [ ] ErrorBanner の 3 Story が Storybook 上で正常表示されること
- [ ] PlanResultDetailPanel の 4 Story が Storybook 上で正常表示されること
- [ ] ExecuteResultDetailPanel の 4 Story が Storybook 上で正常表示されること
- [ ] result-panel-parts の基礎 Story が正常表示されること
- [ ] ダークモード切り替えで各 Story が正常表示されること
- [ ] TypeScript 型チェックがエラー 0件であること

---

## 6. 参照

### 6.1 システム仕様書

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` - コンポーネント設計パターン

### 6.2 ルール・規約

- `.claude/rules/01-architecture.md` - Atomic Design 原則

### 6.3 タスク成果物（発見元）

- `docs/30-workflows/step-09-par-task-rt-03-skill-creation-result-panel/outputs/phase-12/unassigned-task-detection.md` - 未タスク #2
