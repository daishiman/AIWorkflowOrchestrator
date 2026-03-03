# Phase 2: 設計

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | TASK-10A-D スキルライフサイクルUI統合 |
| 作成日 | 2026-03-03                            |
| 状態   | 未着手                                |

## 目的

Phase 1 で定義された機能要件 FR-1〜FR-6 と非機能要件 NFR-1〜NFR-5 に基づき、具体的なコンポーネント設計・型設計・状態管理設計を行う。

## 実行タスク

- ビュー切替設計: SkillManagementPanel の `analysis -> SkillAnalysisView` と `create -> SkillCreateWizard` を設計する。
- ChatPanel 統合設計: `showSkillManagement` の状態管理とレンダリング分岐を設計する。
- 型設計: agentSlice 拡張に必要な状態・アクション・インターフェースを定義する。
- セレクタ設計: 個別セレクタの公開方針と命名を設計する。

## 参照資料

| 資料名                    | パス                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義          | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-1-requirements.md` |
| SkillManagementPanel 実装 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                                 |
| SkillAnalysisView 実装    | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                                    |
| SkillCreateWizard 実装    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                    |
| agentSlice 定義           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                |
| Store index（セレクタ）   | `apps/desktop/src/renderer/store/index.ts`                                                            |
| ChatPanel 実装            | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                             |
| skill-improver 型定義     | `packages/shared/src/types/skill-improver.ts`                                                         |

## 設計方針

### 採用する設計

1. **プレースホルダー差し替え方式**: SkillManagementPanel の既存条件分岐構造を維持し、プレースホルダー部分のみを実コンポーネントに差し替える
2. **agentSlice 拡張方式**: 新規 Slice は作成せず、既存の agentSlice に状態とアクションを追加する
3. **ローカルステート方式**: ChatPanel の `showSkillManagement` は Zustand ではなく `useState` で管理する
4. **既存 Hook 活用方式**: SkillAnalysisView は内部で `useSkillAnalysis` フックを使用しており、agentSlice への分析アクション追加は将来的な Store 統合のためのバックエンド準備とする

### 判断根拠

1. **プレースホルダー差し替え**: 既存コードの構造変更を最小限にし、data-testid や条件分岐ロジックを維持できる。SkillManagementPanel の View 型（`"list" | "editor" | "analysis" | "create"`）が既に定義済みで、各ビューの切替ロジックも実装済みであるため、差し替えのみで統合できる
2. **agentSlice 拡張**: P31 対策として合成 Hook を避け個別セレクタを使用する設計が agentSlice で既に確立されている。新規 Slice を作成すると Store 結合型（AppStore）への追加が必要になり、変更範囲が拡大する
3. **ローカルステート**: `showSkillManagement` は ChatPanel 固有の UI 状態であり、他のコンポーネントから参照されない。状態管理ルール（03-state-management.md）の「コンポーネント固有 UI → useState」に該当する
4. **既存 Hook 活用**: `useSkillAnalysis` フックは `window.electronAPI.skill.analyze()` を直接呼び出す自己完結型のフックであり、SkillAnalysisView に Props として `skillName` を渡すだけで分析が自動実行される

## コンポーネント設計

### 1. SkillManagementPanel のビュー切替設計

#### 現状の条件分岐構造

```
currentView === "editor" && selectedSkill → SkillEditor（実装済み）
currentView === "analysis"                → プレースホルダー「分析ビュー（準備中）」
currentView === "create"                  → プレースホルダー「新規スキル作成（準備中）」
else                                      → リストビュー（実装済み）
```

#### 変更後の条件分岐構造

```
currentView === "editor" && selectedSkill → SkillEditor（変更なし）
currentView === "analysis" && selectedSkill → SkillAnalysisView
currentView === "create"                    → SkillCreateWizard
else                                        → リストビュー（変更なし）
```

#### analysis ビューの差し替え

**変更前（SkillManagementPanel.tsx 155-167行目）:**

```tsx
if (currentView === "analysis") {
  return (
    <div className="p-4" data-testid="skill-management-panel-analysis-view">
      <div>分析ビュー（準備中）</div>
      <button
        className={`mt-4 ${buttonStyles.secondary}`}
        onClick={handleBackToList}
      >
        戻る
      </button>
    </div>
  );
}
```

**変更後:**

```tsx
if (currentView === "analysis" && selectedSkill) {
  return (
    <div data-testid="skill-management-panel-analysis-view">
      <SkillAnalysisView
        skillName={String(selectedSkill.name)}
        onClose={handleBackToList}
      />
    </div>
  );
}
```

設計ポイント:

- `selectedSkill` の null チェックを追加する（analysis ビューにはスキル選択が必須）
- `selectedSkill` が null の場合はリストビューにフォールスルーする
- SkillAnalysisView の `onClose` に `handleBackToList` を渡し、閉じる操作でリストに戻る
- data-testid `skill-management-panel-analysis-view` をラッパー div に維持する
- SkillAnalysisView 内部の `useSkillAnalysis` フックがマウント時に自動分析を実行するため、外部からの分析トリガーは不要

#### create ビューの差し替え

**変更前（SkillManagementPanel.tsx 170-181行目）:**

```tsx
if (currentView === "create") {
  return (
    <div className="p-4" data-testid="skill-management-panel-create-view">
      <div>新規スキル作成（準備中）</div>
      <button
        className={`mt-4 ${buttonStyles.secondary}`}
        onClick={handleBackToList}
      >
        戻る
      </button>
    </div>
  );
}
```

**変更後:**

```tsx
if (currentView === "create") {
  return (
    <div data-testid="skill-management-panel-create-view">
      <SkillCreateWizard onClose={handleBackToList} />
    </div>
  );
}
```

設計ポイント:

- SkillCreateWizard の `onClose` に `handleBackToList` を渡す
- SkillCreateWizard は内部で4ステップのウィザードを管理するため、外部制御は不要
- data-testid `skill-management-panel-create-view` をラッパー div に維持する

#### 必要なインポート追加

```tsx
import { SkillAnalysisView } from "./SkillAnalysisView";
import { SkillCreateWizard } from "./SkillCreateWizard";
```

### 2. ChatPanel 統合設計

#### ローカルステート追加

```tsx
const [showSkillManagement, setShowSkillManagement] = useState(false);
```

#### ヘッダーのトグルボタン

チャットヘッダーの SkillSelector の後に配置する:

```tsx
<button
  onClick={() => setShowSkillManagement((prev) => !prev)}
  aria-label={
    showSkillManagement ? "スキル管理パネルを閉じる" : "スキル管理パネルを開く"
  }
  aria-expanded={showSkillManagement}
  className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
  data-testid="skill-management-toggle"
>
  スキル管理
</button>
```

#### メッセージエリアの条件レンダリング

```tsx
{/* Message Area */}
<div className="flex-1 overflow-y-auto" data-testid="message-area">
  {showSkillManagement ? (
    <SkillManagementPanel />
  ) : (
    <>
      {/* MessageList placeholder */}
      <div data-testid="message-list-slot" />
      {/* Skill Streaming View */}
      {isExecuting && selectedSkillName && (
        <SkillStreamingView ... />
      )}
    </>
  )}
</div>
```

#### 必要なインポート追加

```tsx
import { SkillManagementPanel } from "../skill/SkillManagementPanel";
```

## 型設計 / インターフェース設計

### agentSlice 追加型

#### 追加状態（AgentState 拡張）

```typescript
// packages/shared/src/types/skill-improver.ts から import
import type {
  SkillAnalysis,
  Suggestion,
} from "@repo/shared/types/skill-improver";

// AgentState に追加
interface AgentState {
  // ... 既存の状態 ...

  // === スキルライフサイクル状態（TASK-10A-D） ===
  /** 最新の分析結果 */
  currentAnalysis: SkillAnalysis | null;
  /** 分析中フラグ */
  isAnalyzing: boolean;
  /** 改善適用中フラグ */
  isImproving: boolean;
}
```

#### 追加アクション（AgentActions 拡張）

```typescript
interface AgentActions {
  // ... 既存のアクション ...

  // === スキルライフサイクルアクション（TASK-10A-D） ===
  /** スキルを分析し結果を currentAnalysis に格納する */
  analyzeSkill: (skillName: string) => Promise<void>;
  /** 選択した改善提案を適用する */
  applySkillImprovements: (
    skillName: string,
    suggestions: Suggestion[],
  ) => Promise<void>;
  /** 全自動改善を実行する */
  autoImproveSkill: (skillName: string) => Promise<void>;
  /** スキルを新規作成し、作成されたスキルのパスを返す */
  createSkill: (
    description: string,
    options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    },
  ) => Promise<string>;
}
```

#### WizardOptions 型

SkillCreateWizard が使用する `WizardOptions` 型は `apps/desktop/src/renderer/components/skill/wizard/` からインポートされる既存の型である:

```typescript
// apps/desktop/src/renderer/components/skill/wizard/types.ts
export interface WizardOptions {
  generateTasks: boolean;
  addAgents: boolean;
  addReferences: boolean;
}
```

agentSlice の `createSkill` アクションでは WizardOptions をインポートせず、インライン型定義を使用する（agentSlice がコンポーネント固有の型に依存することを避けるため）。

## 状態管理設計

### agentSlice 拡張

#### 初期状態追加

```typescript
const initialAgentState: AgentState = {
  // ... 既存の初期状態 ...

  // === スキルライフサイクル初期状態（TASK-10A-D） ===
  currentAnalysis: null,
  isAnalyzing: false,
  isImproving: false,
};
```

#### analyzeSkill アクション実装

```typescript
analyzeSkill: async (skillName: string) => {
  // P42準拠: 3段バリデーション
  if (typeof skillName !== "string" || skillName.trim() === "") {
    set({ skillError: "スキル名が無効です" });
    return;
  }

  set({ isAnalyzing: true, skillError: null, currentAnalysis: null });
  try {
    if (!window.electronAPI?.skill) {
      throw new Error("Skill API not available");
    }
    const result = await window.electronAPI.skill.analyze(skillName.trim());
    set({ currentAnalysis: result, isAnalyzing: false });
  } catch (error) {
    set({
      skillError: formatErrorMessage("スキル分析に失敗", error),
      isAnalyzing: false,
    });
  }
},
```

#### applySkillImprovements アクション実装

```typescript
applySkillImprovements: async (skillName: string, suggestions: Suggestion[]) => {
  // P42準拠: 3段バリデーション
  if (typeof skillName !== "string" || skillName.trim() === "") {
    set({ skillError: "スキル名が無効です" });
    return;
  }
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    set({ skillError: "改善提案が選択されていません" });
    return;
  }

  set({ isImproving: true, skillError: null });
  try {
    if (!window.electronAPI?.skill) {
      throw new Error("Skill API not available");
    }
    await window.electronAPI.skill.applyImprovements(skillName.trim(), suggestions);
    // 改善適用後に再分析
    const result = await window.electronAPI.skill.analyze(skillName.trim());
    set({ currentAnalysis: result, isImproving: false });
  } catch (error) {
    set({
      skillError: formatErrorMessage("改善適用に失敗", error),
      isImproving: false,
    });
  }
},
```

#### autoImproveSkill アクション実装

```typescript
autoImproveSkill: async (skillName: string) => {
  // P42準拠: 3段バリデーション
  if (typeof skillName !== "string" || skillName.trim() === "") {
    set({ skillError: "スキル名が無効です" });
    return;
  }

  set({ isImproving: true, skillError: null });
  try {
    if (!window.electronAPI?.skill) {
      throw new Error("Skill API not available");
    }
    await window.electronAPI.skill.autoImprove(skillName.trim());
    // 全自動改善後に再分析
    const result = await window.electronAPI.skill.analyze(skillName.trim());
    set({ currentAnalysis: result, isImproving: false });
  } catch (error) {
    set({
      skillError: formatErrorMessage("全自動改善に失敗", error),
      isImproving: false,
    });
  }
},
```

#### createSkill アクション実装

```typescript
createSkill: async (description: string, options: { generateTasks: boolean; addAgents: boolean; addReferences: boolean }) => {
  // P42準拠: 3段バリデーション
  if (typeof description !== "string" || description.trim() === "") {
    set({ skillError: "スキルの説明が無効です" });
    return "";
  }

  set({ skillError: null });
  try {
    if (!window.electronAPI?.skill) {
      throw new Error("Skill API not available");
    }
    const result = await window.electronAPI.skill.create({
      description: description.trim(),
      options,
    });
    // 作成後にスキル一覧を再取得
    await get().fetchSkills();
    return result.path;
  } catch (error) {
    set({
      skillError: formatErrorMessage("スキル作成に失敗", error),
    });
    return "";
  }
},
```

### 個別セレクタ設計

store/index.ts に追加するセレクタ:

```typescript
// ==========================================================================
// スキルライフサイクルセレクタ（TASK-10A-D）
// P31対策: 無限ループ防止のため個別セレクタで取得
// ==========================================================================

// --- 状態セレクタ ---

/** 現在の分析結果 */
export const useCurrentAnalysis = () =>
  useAppStore((state) => state.currentAnalysis);

/** スキル分析中フラグ */
export const useIsAnalyzingSkill = () =>
  useAppStore((state) => state.isAnalyzing);

/** スキル改善中フラグ */
export const useIsImprovingSkill = () =>
  useAppStore((state) => state.isImproving);

// --- アクションセレクタ ---

/** スキル分析アクション */
export const useAnalyzeSkill = () => useAppStore((state) => state.analyzeSkill);

/** 選択改善適用アクション */
export const useApplySkillImprovements = () =>
  useAppStore((state) => state.applySkillImprovements);

/** 全自動改善アクション */
export const useAutoImproveSkill = () =>
  useAppStore((state) => state.autoImproveSkill);

/** スキル作成アクション */
export const useCreateSkill = () => useAppStore((state) => state.createSkill);
```

### 状態フロー図

```
[ChatPanel]
  │
  ├── showSkillManagement=false → メッセージエリア（既存）
  │
  └── showSkillManagement=true → [SkillManagementPanel]
        │
        ├── currentView="list" → スキル一覧（既存）
        │     │
        │     ├── 「分析」ボタン → setCurrentView("analysis") + setSelectedSkill(skill)
        │     ├── 「編集」ボタン → setCurrentView("editor") + setSelectedSkill(skill)（既存）
        │     └── 「新規作成」ボタン → setCurrentView("create")
        │
        ├── currentView="analysis" && selectedSkill
        │     └── [SkillAnalysisView]
        │           ├── 内部: useSkillAnalysis(skillName) → 自動分析実行
        │           └── onClose → handleBackToList → setCurrentView("list")
        │
        ├── currentView="editor" && selectedSkill（既存）
        │     └── [SkillEditor]
        │
        └── currentView="create"
              └── [SkillCreateWizard]
                    ├── 内部: 4ステップウィザード
                    └── onClose → handleBackToList → setCurrentView("list")
```

## 統合テスト連携

### テストファイル構成

| テストファイル                              | テスト対象                                                          | テスト数（推定） |
| ------------------------------------------- | ------------------------------------------------------------------- | ---------------- |
| `agentSlice.lifecycle.test.ts`              | analyzeSkill, applySkillImprovements, autoImproveSkill, createSkill | 16               |
| `SkillManagementPanel.integration.test.tsx` | analysis/create ビュー統合                                          | 8                |
| `ChatPanel.skillManagement.test.tsx`        | showSkillManagement トグル、SkillManagementPanel レンダリング       | 6                |

### テスト戦略

- agentSlice のアクションテストは Zustand の `act` + `getState` パターンで検証する
- コンポーネントテストは `@testing-library/react` + `fireEvent`（P39 対策で userEvent 不使用）
- `window.electronAPI.skill` は各テストファイルで `vi.fn()` モックを定義する
- テスト間で状態をリセットするため `beforeEach` で初期状態に戻す

## アーキテクチャ層別設計

### Renderer 層の変更一覧

| ファイル                     | 変更種別 | 変更内容                                                                                                                               |
| ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `SkillManagementPanel.tsx`   | 修正     | import 2行追加、analysis ビュー差し替え（12行）、create ビュー差し替え（7行）                                                          |
| `ChatPanel.tsx`              | 修正     | import 1行追加、useState 1行追加、ヘッダーにボタン追加（10行）、条件レンダリング分岐追加（6行）                                        |
| `store/slices/agentSlice.ts` | 修正     | import 2行追加、AgentState に3フィールド追加、AgentActions に4メソッド追加、初期状態に3フィールド追加、アクション実装4個追加（約80行） |
| `store/index.ts`             | 修正     | 個別セレクタ7個追加（約30行）                                                                                                          |

### IPC 通信層（変更なし）

本タスクでは新規 IPC チャンネルの追加や既存ハンドラの変更は不要である。

## 成果物

| 成果物 | パス                                 | 説明           |
| ------ | ------------------------------------ | -------------- |
| 設計書 | `outputs/phase-2/design-document.md` | 本ドキュメント |

## 完了条件

- [ ] SkillManagementPanel のビュー切替設計が、変更前・変更後のコード差分を含めて記載されている
- [ ] ChatPanel 統合設計が、ローカルステート・トグルボタン・条件レンダリングの具体的なコードを含めて記載されている
- [ ] agentSlice 追加型（AgentState 3フィールド、AgentActions 4メソッド）の全インターフェースが定義されている
- [ ] 各アクションの実装コード（P42準拠3段バリデーション含む）が記載されている
- [ ] 個別セレクタ7件の定義が記載されている
- [ ] 状態フロー図が全ビュー遷移パスを網羅している
- [ ] テスト戦略（テストファイル構成・テスト数推定・モック方針）が記載されている
- [ ] アーキテクチャ層別の変更一覧が全ファイルの変更行数推定を含めて記載されている

## 次のPhase

Phase 3: 設計レビュー → `phase-3-design-review.md`
