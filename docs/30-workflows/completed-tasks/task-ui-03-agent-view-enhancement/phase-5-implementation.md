# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 5                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-07             |

## 目的

Phase 4 で作成したテストを通すための最小限の実装を行い、全テストを Green 状態にする。7つのサブタスクを依存関係に基づく順序で実装し、Tap & Discover 体験を実現する AIアシスタント画面を構築する。

## 実行タスク

- agentSlice 拡張: 新UIに必要な状態フィールドとアクション、個別セレクタを追加
- SkillChip 実装: 80x80px 丸アイコン + スキル名テキストのチップコンポーネント
- ExecuteButton 実装: 全幅プライマリ実行ボタン
- FloatingExecutionBar 実装: 実行中フローティングプログレスバー
- RecentExecutionList 実装: 最近の実行履歴リスト（最大3件）
- AdvancedSettingsPanel 実装: 詳細設定スライドインパネル
- AgentView レイアウト統合: シングルカラムレイアウトへの再構成

## 参照資料

| 資料名                 | パス                                                                                                                                  | 説明                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 元タスク仕様書         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058a-ui-03-agent-view-enhancement.md` | セクション5実行タスク、セクション10スタイルガイド |
| Phase 4 テスト作成     | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-4-test-creation.md`                                        | テストケース定義・Props インターフェース          |
| UIコンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                               | UIコンポーネント設計仕様                          |
| 機能コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                       | 機能コンポーネント仕様                            |
| UIアーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                             | UIアーキテクチャ設計                              |
| 状態管理仕様           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                          | Zustand状態管理設計                               |
| 既存 AgentView         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                                                 | 現行実装（修正対象）                              |
| 既存 agentSlice        | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                                                | 現行状態管理（修正対象）                          |
| Apple HIG デザイン原則 | `.claude/rules/01-architecture.md` UI/UXデザイン哲学セクション                                                                        | カラー・スペーシング・インタラクション            |

## 実行手順

### 実装順序（依存関係に基づく）

以下の順序で実装する。agentSlice 拡張が他の全コンポーネントの前提となるため、最初に実装する。

```
1. agentSlice 拡張（Task 7）  ← 他コンポーネントの前提
2. SkillChip（Task 1）        ← 独立コンポーネント
3. ExecuteButton（Task 2）    ← 独立コンポーネント
4. FloatingExecutionBar（Task 3） ← 独立コンポーネント
5. RecentExecutionList（Task 5）  ← 独立コンポーネント
6. AdvancedSettingsPanel（Task 4） ← ModelSelector/Permission を統合
7. AgentView レイアウト統合（Task 6） ← 全コンポーネントを統合
```

### ステップ1: agentSlice 拡張

ファイル: `apps/desktop/src/renderer/store/slices/agentSlice.ts`（修正）

#### 追加フィールド

```typescript
// 既存の AgentSlice に追加
interface AgentSliceExtension {
  // 実行履歴サマリー（RecentExecutionList 用）
  recentExecutions: ExecutionSummary[];
  // 詳細設定パネルの開閉状態
  isAdvancedSettingsOpen: boolean;

  // アクション
  addExecutionToHistory: (summary: ExecutionSummary) => void;
  clearExecutionHistory: () => void;
  setAdvancedSettingsOpen: (isOpen: boolean) => void;
}
```

#### 追加セレクタ（P31対策: 個別セレクタパターン）

```typescript
// 新規個別セレクタ
export const useRecentExecutions = () =>
  useAppStore((state) => state.recentExecutions);
export const useAddExecutionToHistory = () =>
  useAppStore((state) => state.addExecutionToHistory);
export const useIsAdvancedSettingsOpen = () =>
  useAppStore((state) => state.isAdvancedSettingsOpen);
export const useSetAdvancedSettingsOpen = () =>
  useAppStore((state) => state.setAdvancedSettingsOpen);
```

#### 実装上の注意

- `addExecutionToHistory` は先頭追加（unshift）で、10件を超えたら古いものを削除する
- 既存セレクタ（`useSelectedSkillName`, `useImportedSkills`, `useExecutionState` 等）は変更しない
- 14個のスライス統合パターンを壊さない

### ステップ2: SkillChip コンポーネント

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx`（新規）

#### Props インターフェース

```typescript
export interface SkillChipProps {
  skillName: string;
  displayName: string;
  icon?: string;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}
```

#### 実装要件

- サイズ: 80x80px の丸アイコン + 下部にスキル名テキスト（全体高さ約110px）
- アイコン: スキルメタデータの `icon` フィールドを使用、未設定時はデフォルトアイコン（ツールモチーフ）
- 選択状態: アクセントカラーのリング + チェックマークオーバーレイ
- アクセシビリティ: `role="radio"` + `aria-checked` + `aria-label={displayName}`

#### マイクロインタラクション

| 状態       | スタイル                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------- |
| デフォルト | `border-2 border-transparent bg-[var(--bg-secondary)]`                                    |
| ホバー     | `scale(1.05) transition-transform duration-200`                                           |
| タップ     | `scale(0.97) transition-transform duration-100`                                           |
| 選択時     | `scale(0.97) -> scale(1.05) -> scale(1) + border-[var(--status-primary)]` 色変化（300ms） |
| 無効       | `opacity-50 cursor-not-allowed`                                                           |

### ステップ3: ExecuteButton コンポーネント

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`（新規）

#### Props インターフェース

```typescript
export interface ExecuteButtonProps {
  selectedSkillName: string | null;
  onExecute: () => void;
  isExecuting: boolean;
}
```

#### 実装要件

- サイズ: 全幅（`w-full`）、高さ 56px（`h-14`）、角丸 12px
- カラー: `bg-[var(--status-primary)]`（Apple systemBlue）、テキスト白、フォント 18px semibold
- ツール未選択時: `disabled` 状態（`opacity-50 cursor-not-allowed`、テキスト: 「ツールを選んでください」）
- ツール選択時: テキスト「実行する」
- 実行中: ボタン非表示（FloatingExecutionBar に切り替え）

#### マイクロインタラクション

| 状態           | スタイル                                                                |
| -------------- | ----------------------------------------------------------------------- |
| デフォルト     | `bg-[var(--status-primary)] text-white rounded-xl h-14`                 |
| ホバー         | `scale(1.02) shadow-md transition-all duration-200`                     |
| タップ         | `scale(0.97) bg-[var(--status-primary)]/80 transition-all duration-150` |
| 無効（未選択） | `opacity-50 cursor-not-allowed`（アニメーションなし）                   |
| 実行中         | ボタン非表示（FloatingExecutionBar に切り替え）                         |

### ステップ4: FloatingExecutionBar コンポーネント

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx`（新規）

#### Props インターフェース

```typescript
export interface FloatingExecutionBarProps {
  skillName: string;
  status: AgentExecutionStatus; // "executing" | "completed" | "failed" | "idle"
  startedAt: Date | null;
  progress?: number; // 0-100
  onStop: () => void;
}
```

#### 表示条件

- `status === "executing"`: プログレス表示 + 停止ボタン + 経過時間
- `status === "completed"`: success-bounce アニメーション後にスライドアウト（1.5秒後）
- `status === "failed"`: shake アニメーション + 赤色表示 + 3秒後にスライドアウト
- `status === "idle"`: 非表示

#### マイクロインタラクション

| 状態                     | アニメーション                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------- |
| 表示（スライドイン）     | `translateY(100%) -> translateY(0)`（300ms, ease-out）                                |
| 非表示（スライドアウト） | `translateY(0) -> translateY(100%)`（200ms, ease-in）                                 |
| 実行完了                 | success-bounce: プログレスバーが緑に変化 + チェックマークが scale(0->1.2->1)（300ms） |
| 実行失敗                 | shake: `translateX(0, -4px, 4px, -4px, 4px, 0)`（300ms）+ 赤色表示                    |
| 固定位置                 | `fixed bottom-0 left-0 right-0 z-50`                                                  |

### ステップ5: RecentExecutionList コンポーネント

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx`（新規）

#### Props インターフェース

```typescript
export interface RecentExecutionListProps {
  executions: ExecutionSummary[];
  onSelectExecution: (executionId: string) => void;
  maxItems?: number; // デフォルト: 3
}

export interface ExecutionSummary {
  executionId: string;
  skillName: string;
  skillDisplayName: string;
  status: "completed" | "failed" | "executing" | "cancelled";
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null; // ミリ秒
}
```

#### 実装要件

- 最大3件表示（`maxItems` prop で制御、デフォルト3）
- 各エントリ: スキル表示名 + ステータスアイコン（check / x / spinner）+ 相対時間（「2分前」「1時間前」）
- クリックで `onSelectExecution(executionId)` を呼び出し
- 空の場合: 「まだ実行履歴がありません」メッセージ（`var(--text-secondary)` テキスト）
- セクションヘッダー: 「最近の実行」（`var(--text-secondary)` 小文字テキスト）

#### マイクロインタラクション

| 状態   | スタイル                                                              |
| ------ | --------------------------------------------------------------------- |
| ホバー | `bg-[var(--bg-secondary)] rounded-lg transition-colors duration-150`  |
| タップ | `bg-[var(--bg-tertiary)] transition-colors duration-100`              |
| 新着   | リスト先頭に追加時: `opacity 0 -> 1 + translateY(-8px) -> 0`（200ms） |

### ステップ6: AdvancedSettingsPanel コンポーネント

ファイル: `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`（新規）

#### Props インターフェース

```typescript
export interface AdvancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // AIの種類
  models: ModelCardItem[];
  selectedProviderId: string | null;
  selectedModelId: string | null;
  onSelectModel: (providerId: string, modelId: string) => void;
  // 許可設定
  permissionMode: PermissionMode;
  onModeChange: (mode: PermissionMode) => void;
  rememberedCount: number;
  onResetRemembered: () => void;
}

export interface ModelCardItem {
  providerId: LLMProviderId;
  modelId: string;
  displayName: string; // "Claude Opus 4.6"
  description?: string; // "最高性能"
  healthStatus: "healthy" | "degraded" | "unavailable" | "unknown";
  isSelected: boolean;
}
```

#### パネル内容

1. **AIの種類（ModelSelector）**: カード型ラジオ選択
   - デフォルトモデルを自動選択
   - `role="radiogroup"` + `aria-label="AIの種類"`
   - ヘルスバッジ: 右上に小さな丸（green / yellow / red / gray）
   - 各カードにモデルの特徴テキスト（「最高性能」「バランス型」「高速」）

2. **許可設定（Permission）**: モード選択 + 記憶済み件数
   - PermissionMode セレクタ（SDK の `default` / `acceptEdits` / `bypassPermissions` / `plan` / `delegate` / `dontAsk`）
   - 記憶済みの許可選択: 件数表示 + 「リセット」ボタン
   - 説明テキスト: 「実行中にAIが必要な許可を都度リクエストします」

#### パネル開閉アニメーション

| 状態       | アニメーション                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 開く       | 背景オーバーレイ `opacity 0 -> 0.3`（200ms）+ パネル `translateX(100%) -> 0`（300ms, ease-out） |
| 閉じる     | パネル `translateX(0) -> 100%`（200ms, ease-in）+ オーバーレイ `opacity 0.3 -> 0`（150ms）      |
| 背景タップ | 閉じる動作をトリガー                                                                            |
| ESCキー    | 閉じる動作をトリガー（`useEffect` で `keydown` リスナー登録）                                   |

#### z-index

| レイヤー         | z-index |
| ---------------- | ------- |
| 背景オーバーレイ | `z-30`  |
| パネル本体       | `z-40`  |

### ステップ7: AgentView レイアウト統合

ファイル: `apps/desktop/src/renderer/views/AgentView/index.tsx`（修正）

#### レイアウト構造

```typescript
<div className="flex flex-col items-center h-full p-6">
  <div className="w-full max-w-[600px] flex flex-col gap-6">
    {/* ヘッダー: タイトル + 詳細設定ギアアイコン */}
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        AIアシスタント
      </h1>
      <button
        onClick={() => setAdvancedOpen(true)}
        className="p-2 rounded-lg text-[var(--text-secondary)]
                   hover:text-[var(--status-primary)] hover:scale-110
                   transition-all duration-200"
        aria-label="詳細設定を開く"
      >
        <GearIcon size={24} />
      </button>
    </header>

    {/* ツール選択（SkillChip 群） */}
    <section>
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
        できること
      </h2>
      <div role="radiogroup" aria-label="ツール選択">
        {importedSkills.length > 10 && (
          <SkillSearchBar filter={filter} onFilterChange={setFilter} />
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          {filteredSkills.map(skill => (
            <SkillChip key={skill.name} ... />
          ))}
        </div>
        {importedSkills.length === 0 && (
          <EmptyState
            message="Skill Centerでツールをインポート"
            onAction={onNavigateToSkillCenter}
          />
        )}
      </div>
    </section>

    {/* 実行ボタン */}
    <ExecuteButton
      selectedSkillName={selectedSkillName}
      onExecute={handleExecute}
      isExecuting={isExecuting}
    />

    {/* 最近の実行 */}
    <RecentExecutionList
      executions={recentExecutions}
      onSelectExecution={handleSelectExecution}
      maxItems={3}
    />
  </div>

  {/* 詳細設定パネル（Level 2） */}
  <AdvancedSettingsPanel
    isOpen={isAdvancedOpen}
    onClose={() => setAdvancedOpen(false)}
    ...
  />

  {/* 実行中フローティングバー */}
  {(isExecuting || justCompleted || justFailed) && (
    <FloatingExecutionBar
      skillName={selectedSkillName}
      status={executionStatus}
      startedAt={startedAt}
      progress={progress}
      onStop={handleStop}
    />
  )}
</div>
```

#### 変更内容

- 2カラムレイアウト -> シングルカラム（中央寄せ、max-width: 600px）
- 画面タイトルを「Agent」->「AIアシスタント」に変更
- Level 1: ツールチップ群 + 実行ボタン + 最近の実行 の3セクション
- 既存の AgentStatusCard / ModelSelectorCard / PermissionCard を除去
- インポート/削除ボタンは配置しない（SkillCenter に完全委譲）
- ツール10個以下は検索バー非表示、11個以上で出現

#### 既存コード・Hooksの維持

- `useSkillExecution` Hook: スキル実行ロジック維持
- `useSkillPermission` Hook: 権限管理ロジック維持
- 個別セレクタパターン: P31 対策維持
- IPC インターフェース: `skill:execute`, `skill:abort` 等変更なし

### ステップ8: テスト実行（Green 状態確認）

```bash
# テスト実行（P40対策: 対象パッケージのディレクトリから実行）
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/

# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

Phase 5 では以下のフロント接続を実装する:

| 実装項目 | 内容                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| IPC 接続 | 既存の `window.electronAPI.skill.execute` / `skill.abort` / `skill.list` を使用 |
| 状態同期 | agentSlice の個別セレクタ経由で各コンポーネントに状態を配信                     |
| 画面遷移 | ExecuteButton クリック -> AgentExecutionView 遷移（既存ルーティング使用）       |

## 多角的チェック観点

| 観点             | 適用判断                     | チェック内容                                             |
| ---------------- | ---------------------------- | -------------------------------------------------------- |
| UI/UX            | フロントエンド実装のため適用 | Apple HIG 準拠スタイル、マイクロインタラクションの一貫性 |
| アクセシビリティ | UI実装のため適用             | WCAG 2.1 AA コントラスト比、キーボード操作、ARIA属性     |
| 状態管理         | Zustand 拡張のため適用       | P31 対策: 個別セレクタの使用、合成 Hook の回避           |
| アーキテクチャ   | コンポーネント設計のため適用 | Atomic Design（organisms 配下）、単一責務原則            |

### Electron デスクトップアプリ観点

| 層                         | チェック内容                                                                     |
| -------------------------- | -------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | CSS変数（`var(--xxx)`）が 00-design-foundation と一致                            |
| IPC通信                    | 既存チャンネル（`skill:execute`, `skill:abort`）のみ使用、新規チャンネル作成なし |

## 実装時の注意事項（既知のPitfall対策）

| Pitfall ID | 注意事項                      | 対策                                                                          |
| ---------- | ----------------------------- | ----------------------------------------------------------------------------- |
| P31        | Zustand Store Hooks無限ループ | 個別セレクタ（`useRecentExecutions`等）を使用。合成Hook禁止                   |
| P5         | リスナー二重登録              | ESCキーリスナー（AdvancedSettingsPanel）は `useEffect` のクリーンアップで解除 |
| P24        | Store 型定義の不統一          | `useImportedSkills()` の返す型をそのまま使用、型アサーション回避              |
| P47        | CSS変数ベースのスタイルテスト | variantStyles を Record 定数で管理し、テストからも import して使用            |

## 設計変更記録（該当する場合）

実装中にPhase 2の設計から乖離が発生した場合、以下を記録する:

- [ ] 乖離内容と理由を `outputs/phase-5/design-changes.md` に記録
- [ ] Phase 2設計書への影響を評価し、Phase 10レビューで検証できるようにする

## 成果物

| 成果物                | パス                                                                                 | 説明                                   |
| --------------------- | ------------------------------------------------------------------------------------ | -------------------------------------- |
| SkillChip             | `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx`             | 80x80px 丸アイコン + スキル名チップ    |
| ExecuteButton         | `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`         | 全幅プライマリ実行ボタン               |
| FloatingExecutionBar  | `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx`  | 実行中フローティングバー               |
| AdvancedSettingsPanel | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx` | 詳細設定スライドインパネル             |
| RecentExecutionList   | `apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx`   | 最近の実行履歴リスト（最大3件）        |
| AgentView レイアウト  | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                | シングルカラムレイアウトに再構成       |
| agentSlice 拡張       | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                               | recentExecutions, advancedSettings追加 |

## 完了条件

- [ ] agentSlice に `recentExecutions`, `isAdvancedSettingsOpen` フィールドと対応アクション・個別セレクタが追加されている
- [ ] SkillChip が 80x80px 丸アイコン + スキル名テキストで表示され、選択状態が視覚的に明示される
- [ ] SkillChip に `role="radio"` + `aria-checked` + `aria-label` が設定されている
- [ ] ExecuteButton がツール未選択時に disabled（テキスト: 「ツールを選んでください」）、選択時に有効（テキスト: 「実行する」）
- [ ] FloatingExecutionBar が実行中のみ表示され、停止ボタンで `onStop` が呼ばれる
- [ ] FloatingExecutionBar のスライドイン/スライドアウトアニメーションが動作する
- [ ] AdvancedSettingsPanel がスライドインで開き、背景タップ/ESCキーで閉じる
- [ ] AdvancedSettingsPanel 内でモデル変更・許可モード変更が可能
- [ ] RecentExecutionList が最大3件を表示し、空時に「まだ実行履歴がありません」を表示
- [ ] AgentView がシングルカラム（中央寄せ、max-width: 600px）で表示される
- [ ] 画面タイトルが「AIアシスタント」、セクションヘッダーが「できること」
- [ ] ツール0件で EmptyState（SkillCenter への導線）が表示される
- [ ] ツール10個以下で検索バー非表示、11個以上で検索バー出現
- [ ] 全テストが Green 状態（PASS）
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] `pnpm --filter @repo/desktop lint` が通る
- [ ] **設計書（Phase 2成果物）から意図的に変更した箇所がある場合、変更理由をPhase 5成果物に記録し、Phase 2成果物も更新している**
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. agentSlice 拡張（Task 7）
3. SkillChip 実装（Task 1）
4. ExecuteButton 実装（Task 2）
5. FloatingExecutionBar 実装（Task 3）
6. RecentExecutionList 実装（Task 5）
7. AdvancedSettingsPanel 実装（Task 4）
8. AgentView レイアウト統合（Task 6）
9. テスト実行（Green 状態確認）
10. 型チェック・リント
11. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --phase 5
```

## 次のPhase

Phase 6: テスト拡充
