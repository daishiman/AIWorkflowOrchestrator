# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 4                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-07             |

## 目的

AIアシスタント画面リデザイン（Tap & Discover + Apple HIG準拠）の期待動作を検証するテストを、実装より先に作成する（Red状態）。SkillChip、ExecuteButton、FloatingExecutionBar、AdvancedSettingsPanel、RecentExecutionList の各コンポーネントと AgentView レイアウト統合、agentSlice 拡張に対するユニットテストを TDD 原則に従い先行作成する。

## 実行タスク

- SkillChip テスト作成: 選択状態・アクセシビリティ・無効化のテスト
- ExecuteButton テスト作成: ボタン状態・無効化・テキスト切替のテスト
- FloatingExecutionBar テスト作成: 表示条件・停止操作・経過時間のテスト
- AdvancedSettingsPanel テスト作成: パネル開閉・設定変更・ESCキーのテスト
- RecentExecutionList テスト作成: 表示件数制限・空リスト・ステータスアイコンのテスト
- AgentView レイアウトテスト作成: シングルカラム・要素数・検索バー表示条件のテスト
- agentSlice 拡張テスト作成: 実行履歴管理・パネル開閉状態のテスト

## 参照資料

| 資料名                 | パス                                                                                                                                  | 説明                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 元タスク仕様書         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058a-ui-03-agent-view-enhancement.md` | セクション9テスト計画、セクション5実行タスク |
| Phase 1 要件定義       | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-1-requirements.md`                                         | 要件・受入基準                               |
| Phase 2 設計           | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-2-design.md`                                               | アーキテクチャ・インターフェース設計         |
| Phase 3 設計レビュー   | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-3-design-review.md`                                        | レビュー結果                                 |
| UIコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                               | UIコンポーネント設計仕様                     |
| 機能コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                       | 機能コンポーネント仕様                       |
| UIアーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                             | UIアーキテクチャ設計                         |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                          | Zustand状態管理設計                          |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                                                                  | P39/P40/P31/P47 テスト関連の教訓             |

## 実行手順

### ステップ1: テスト環境の確認

テスト実行は P40 対策として、対象パッケージのディレクトリから実行する。

```bash
# 正しい実行方法（P40対策）
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/

# 間違い（使用禁止）
pnpm vitest run apps/desktop/src/renderer/components/organisms/AgentView/
```

テストツールは P39 対策として、happy-dom 環境では `userEvent` を使用せず `fireEvent` を使用する。

```typescript
// P39対策: happy-dom環境では fireEvent を使用
import { render, screen, fireEvent, act } from "@testing-library/react";

// 非同期ハンドラは act で包む
await act(async () => {
  fireEvent.click(element);
});
```

### ステップ2: SkillChip テスト作成

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/SkillChip.test.tsx`

| テストケース                         | 検証内容                                               |
| ------------------------------------ | ------------------------------------------------------ |
| 未選択チップの表示                   | `aria-checked="false"`, border-transparent             |
| 選択済みチップの表示                 | `aria-checked="true"`, border-color がアクセントカラー |
| チップクリックで onSelect 発火       | `fireEvent.click` -> `onSelect` 呼び出し確認           |
| 無効状態でクリック不可               | `isDisabled=true` -> `onSelect` 呼び出しなし           |
| アイコン未設定時のデフォルトアイコン | `icon` 未指定 -> デフォルトアイコン表示                |
| アクセシビリティ属性                 | `role="radio"`, `aria-label` の存在確認                |

Props インターフェース:

```typescript
interface SkillChipProps {
  skillName: string;
  displayName: string;
  icon?: string;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}
```

### ステップ3: ExecuteButton テスト作成

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx`

| テストケース              | 検証内容                                        |
| ------------------------- | ----------------------------------------------- |
| ツール未選択時の無効化    | `selectedSkillName=null` -> `disabled` 属性あり |
| ツール選択時のテキスト    | 「実行する」テキスト表示                        |
| ツール未選択時のテキスト  | 「ツールを選んでください」テキスト表示          |
| クリックで onExecute 発火 | `fireEvent.click` -> `onExecute` 呼び出し確認   |
| 無効時にクリック不可      | `disabled` 状態 -> `onExecute` 呼び出しなし     |

Props インターフェース:

```typescript
interface ExecuteButtonProps {
  selectedSkillName: string | null;
  onExecute: () => void;
  isExecuting: boolean;
}
```

### ステップ4: FloatingExecutionBar テスト作成

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/FloatingExecutionBar.test.tsx`

| テストケース         | 検証内容                                   |
| -------------------- | ------------------------------------------ |
| executing 状態で表示 | `status="executing"` -> コンポーネント表示 |
| 停止ボタンクリック   | `fireEvent.click` -> `onStop` 呼び出し確認 |
| 経過時間の表示       | `startedAt` から `mm:ss` 形式で表示        |
| プログレスバー表示   | `progress=40` -> 40% 表示                  |
| completed 状態の表示 | `status="completed"` -> 「完了!」テキスト  |

Props インターフェース:

```typescript
interface FloatingExecutionBarProps {
  skillName: string;
  status: AgentExecutionStatus; // "executing" | "completed" | "failed" | "idle"
  startedAt: Date | null;
  progress?: number; // 0-100
  onStop: () => void;
}
```

### ステップ5: AdvancedSettingsPanel テスト作成

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx`

| テストケース                  | 検証内容                                          |
| ----------------------------- | ------------------------------------------------- |
| `isOpen=true` でパネル表示    | パネル要素が DOM に存在                           |
| `isOpen=false` でパネル非表示 | パネル要素が DOM に不在                           |
| 閉じるボタンで onClose 発火   | `fireEvent.click` -> `onClose` 呼び出し確認       |
| モデル選択の変更              | ラジオ選択 -> `onSelectModel` 呼び出し確認        |
| 許可モード変更                | セレクタ変更 -> `onModeChange` 呼び出し確認       |
| リセットボタン                | `fireEvent.click` -> `onResetRemembered` 呼び出し |
| ESCキーで閉じる               | `fireEvent.keyDown(Escape)` -> `onClose` 呼び出し |

Props インターフェース:

```typescript
interface AdvancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelCardItem[];
  selectedProviderId: string | null;
  selectedModelId: string | null;
  onSelectModel: (providerId: string, modelId: string) => void;
  permissionMode: PermissionMode;
  onModeChange: (mode: PermissionMode) => void;
  rememberedCount: number;
  onResetRemembered: () => void;
}
```

### ステップ6: RecentExecutionList テスト作成

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/RecentExecutionList.test.tsx`

| テストケース             | 検証内容                                              |
| ------------------------ | ----------------------------------------------------- |
| 最大3件の表示            | 5件入力 -> 3件のみ表示                                |
| 空リストのメッセージ     | 0件 -> 「まだ実行履歴がありません」表示               |
| エントリクリックで遷移   | `fireEvent.click` -> `onSelectExecution` 呼び出し     |
| ステータスアイコンの表示 | completed -> check, failed -> x, executing -> spinner |
| 相対時間の表示           | 「2分前」「1時間前」形式の表示                        |

Props インターフェース:

```typescript
interface RecentExecutionListProps {
  executions: ExecutionSummary[];
  onSelectExecution: (executionId: string) => void;
  maxItems?: number; // デフォルト: 3
}

interface ExecutionSummary {
  executionId: string;
  skillName: string;
  skillDisplayName: string;
  status: "completed" | "failed" | "executing" | "cancelled";
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null; // ミリ秒
}
```

### ステップ7: AgentView レイアウトテスト作成

ファイル: `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx`

| テストケース                      | 検証内容                                               |
| --------------------------------- | ------------------------------------------------------ |
| シングルカラムレイアウト          | `max-width: 600px` の中央寄せコンテナ確認              |
| Level 1 の要素数                  | ツールチップ群 + 実行ボタン + 最近の実行 = 3セクション |
| ツール0件で EmptyState 表示       | SkillCenter への導線リンク確認                         |
| ツール10個以下で検索バー非表示    | 検索バーの DOM 不在確認                                |
| ツール11個以上で検索バー表示      | 検索バーの DOM 存在確認                                |
| 歯車アイコンで詳細設定パネル表示  | `fireEvent.click` -> パネル表示確認                    |
| UIテキストが UX言語マッピング準拠 | 「AIアシスタント」「できること」のテキスト確認         |

AgentView レイアウトテストでは、子コンポーネント（SkillChip, ExecuteButton 等）をモック化し、レイアウト構造のみを検証する。

### ステップ8: agentSlice 拡張テスト作成

agentSlice のテストは既存テストファイルに追加 or 新規 describe ブロックで作成する。

```typescript
describe("agentSlice extension", () => {
  it("addExecutionToHistory: 実行履歴を先頭に追加する");
  it("addExecutionToHistory: 10件を超えたら古いものを削除する");
  it("clearExecutionHistory: 全履歴をクリアする");
  it("setAdvancedSettingsOpen: パネル開閉状態を切り替える");
  it("useRecentExecutions: 個別セレクタで履歴を取得する");
});
```

P31 対策: 個別セレクタ（`useRecentExecutions`, `useIsAdvancedSettingsOpen`, `useAddExecutionToHistory`, `useSetAdvancedSettingsOpen`）の安定性を検証する。

### ステップ9: テスト実行（Red 状態確認）

全テストが失敗状態（Red）であることを確認する。

```bash
# テスト実行（P40対策: 対象パッケージのディレクトリから実行）
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/
```

## 統合テスト連携

Phase 4 では以下の統合テスト観点を設計に含める:

| シナリオカテゴリ     | 検証内容                                                            | テストファイル              |
| -------------------- | ------------------------------------------------------------------- | --------------------------- |
| コンポーネント間連携 | SkillChip 選択 -> ExecuteButton 有効化 -> FloatingExecutionBar 表示 | `AgentView.layout.test.tsx` |
| 状態管理連携         | agentSlice アクション -> 各コンポーネントの表示更新                 | agentSlice テスト内         |
| IPC 連携（モック）   | skill:execute / skill:abort の呼び出し確認                          | `AgentView.layout.test.tsx` |

IPC 呼び出しは `window.electronAPI` のモックを使用して検証する。実際の IPC 通信テストは Phase 6 で拡充する。

## 多角的チェック観点

| 観点             | 適用判断                     | チェック内容                                                           |
| ---------------- | ---------------------------- | ---------------------------------------------------------------------- |
| UI/UX            | フロントエンド実装のため適用 | UX言語マッピング準拠テスト、レイアウト構造テスト                       |
| アクセシビリティ | UI実装のため適用             | `role="radio"`, `aria-checked`, `aria-label` のテスト                  |
| 状態管理         | Zustand 拡張のため適用       | P31 対策: 個別セレクタの安定性テスト                                   |
| テスト環境       | happy-dom 環境のため適用     | P39 対策: `fireEvent` 使用、P40 対策: パッケージディレクトリからの実行 |

### Electron デスクトップアプリ観点

| 層                         | チェック内容                                      |
| -------------------------- | ------------------------------------------------- |
| フロントエンド（Renderer） | コンポーネントの Props 型定義とテストの型整合性   |
| IPC通信（モック）          | `window.electronAPI.skill.execute` 等のモック定義 |

## 成果物

| 成果物                       | パス                                                                                                | 説明                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------ |
| SkillChip テスト             | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/SkillChip.test.tsx`             | チップ選択・インタラクション   |
| ExecuteButton テスト         | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx`         | ボタン状態・無効化テスト       |
| FloatingExecutionBar テスト  | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/FloatingExecutionBar.test.tsx`  | 表示条件・停止操作テスト       |
| AdvancedSettingsPanel テスト | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx` | パネル開閉・設定変更テスト     |
| RecentExecutionList テスト   | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/RecentExecutionList.test.tsx`   | 実行履歴表示テスト             |
| AgentView レイアウトテスト   | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx`                     | シングルカラムレイアウトテスト |
| agentSlice 拡張テスト        | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.extension.test.ts`                     | 実行履歴・パネル状態テスト     |

## 完了条件

- [ ] SkillChip テスト: 6ケース作成済み（未選択/選択済み/クリック/無効/デフォルトアイコン/アクセシビリティ）
- [ ] ExecuteButton テスト: 5ケース作成済み（未選択無効化/選択テキスト/未選択テキスト/クリック/無効クリック不可）
- [ ] FloatingExecutionBar テスト: 5ケース作成済み（executing表示/停止クリック/経過時間/プログレス/completed表示）
- [ ] AdvancedSettingsPanel テスト: 7ケース作成済み（表示/非表示/閉じる/モデル選択/許可モード/リセット/ESC）
- [ ] RecentExecutionList テスト: 5ケース作成済み（最大3件/空リスト/クリック遷移/ステータスアイコン/相対時間）
- [ ] AgentView レイアウトテスト: 7ケース作成済み（シングルカラム/要素数/EmptyState/検索バー非表示/検索バー表示/詳細設定/UXテキスト）
- [ ] agentSlice 拡張テスト: 5ケース作成済み（履歴追加/上限超過削除/履歴クリア/パネル開閉/個別セレクタ）
- [ ] 全テストが `fireEvent` を使用している（P39 対策: `userEvent` 未使用）
- [ ] テスト実行コマンドが `cd apps/desktop && pnpm vitest run` で実行可能（P40 対策）
- [ ] 全テストが失敗状態（Red）であることを確認
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（元タスク仕様書 セクション9 テスト計画）
2. SkillChip テスト作成（6ケース）
3. ExecuteButton テスト作成（5ケース）
4. FloatingExecutionBar テスト作成（5ケース）
5. AdvancedSettingsPanel テスト作成（7ケース）
6. RecentExecutionList テスト作成（5ケース）
7. AgentView レイアウトテスト作成（7ケース）
8. agentSlice 拡張テスト作成（5ケース）
9. Red 状態確認（全テスト失敗の確認）
10. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
