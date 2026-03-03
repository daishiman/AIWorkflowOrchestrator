# Phase 5: 実装

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 5                                     |
| 機能名    | TASK-10A-D スキルライフサイクルUI統合 |
| 作成日    | 2026-03-03                            |
| 状態      | 未着手                                |
| 前提Phase | Phase 4（テスト作成）                 |

## 目的

TDD Green フェーズとして、Phase 4 で作成した Red テストを全て通すための最小限の実装を行う。agentSlice へのスキルライフサイクルアクション追加、個別セレクタの公開、SkillManagementPanel のプレースホルダー差し替え、ChatPanel へのアクセスポイント追加を実施する。

## 実行タスク

- agentSlice 拡張実装: スキルライフサイクル状態とアクションを追加し Red テストを Green 化する。
- セレクタ公開実装: `store/index.ts` に個別セレクタを追加して P31 対策を担保する。
- analysis ビュー統合実装: SkillManagementPanel の analysis ビューを SkillAnalysisView へ差し替える。
- create ビュー統合実装: SkillManagementPanel の create ビューを SkillCreateWizard へ差し替える。
- ChatPanel 導線実装: スキル管理パネルへのアクセスボタンと開閉状態を追加する。

## 参照資料

| 資料名                          | パス                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Phase 4 テスト仕様              | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-4-test-creation.md` |
| SkillManagementPanel 統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`       |
| agentSlice ライフサイクルテスト | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts`                  |
| セレクタ安定性テスト            | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle-selectors.test.ts`        |
| ChatPanel テスト                | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`              |
| 既存 agentSlice                 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                 |
| 既存 store/index.ts             | `apps/desktop/src/renderer/store/index.ts`                                                             |
| 既存 SkillManagementPanel       | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                                  |
| 既存 ChatPanel                  | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                              |
| SkillAnalysisView               | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                                     |
| SkillCreateWizard               | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                     |
| useSkillAnalysis フック         | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                                 |
| Preload skill-api               | `apps/desktop/src/preload/skill-api.ts`                                                                |
| 共有型定義 skill-improver       | `packages/shared/src/types/skill-improver.ts`                                                          |

## 実装手順

### Step 1: agentSlice にスキルライフサイクル状態とアクションを追加

**対象ファイル**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

#### 1-1. 型定義の import 追加

`@repo/shared/types/skill-improver` から以下の型を import する:

```typescript
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";
```

#### 1-2. AgentState インターフェースに状態フィールドを追加

既存の `AgentState` インターフェースの末尾（スキル関連フィールドの後）に以下を追加:

```typescript
// === スキルライフサイクル状態（TASK-10A-D） ===
currentAnalysis: SkillAnalysis | null;
isAnalyzing: boolean;
isCreatingSkill: boolean;
```

#### 1-3. AgentActions インターフェースにアクションを追加

既存の `AgentActions` インターフェースの末尾に以下を追加:

```typescript
// === スキルライフサイクルアクション（TASK-10A-D） ===
analyzeSkill: (skillName: string) => Promise<void>;
applyImprovements: (skillName: string, suggestionIndices: number[]) => Promise<void>;
autoImprove: (skillName: string) => Promise<void>;
createSkill: (params: { name: string; description: string; [key: string]: unknown }) => Promise<void>;
clearAnalysis: () => void;
```

#### 1-4. 初期値の追加

`createAgentSlice` 関数内の初期状態オブジェクトに以下を追加:

```typescript
currentAnalysis: null,
isAnalyzing: false,
isCreatingSkill: false,
```

#### 1-5. アクション実装

`createAgentSlice` 関数内に以下のアクションを追加:

**analyzeSkill**:

1. `isAnalyzing` を `true` に設定
2. `skillError` を `null` にクリア
3. `window.electronAPI.skill.analyze(skillName)` を呼び出す
4. 成功時: 戻り値を `currentAnalysis` に設定し、`isAnalyzing` を `false` にする
5. 失敗時: `skillError` に `"スキル分析に失敗しました"` を設定し、`isAnalyzing` を `false` にする

**applyImprovements**:

1. `skillError` を `null` にクリア
2. `window.electronAPI.skill.applyImprovements(skillName, suggestionIndices)` を呼び出す
3. 成功時: `currentAnalysis` を `null` にクリア
4. 失敗時: `skillError` に `"改善の適用に失敗しました"` を設定

**autoImprove**:

1. `skillError` を `null` にクリア
2. `window.electronAPI.skill.autoImprove(skillName)` を呼び出す
3. 成功時: `currentAnalysis` を `null` にクリア
4. 失敗時: `skillError` に `"自動改善に失敗しました"` を設定

**createSkill**:

1. `isCreatingSkill` を `true` に設定
2. `skillError` を `null` にクリア
3. `window.electronAPI.skill.create(params)` を呼び出す
4. 成功時: `get().fetchSkills()` を呼び出してスキルリストを更新し、`isCreatingSkill` を `false` にする
5. 失敗時: `skillError` に `"スキル作成に失敗しました"` を設定し、`isCreatingSkill` を `false` にする

**clearAnalysis**:

1. `currentAnalysis` を `null` に設定

---

### Step 2: store/index.ts に個別セレクタを追加

**対象ファイル**: `apps/desktop/src/renderer/store/index.ts`

既存のスキル関連セレクタ群（`useSkillError` の後）に以下の個別セレクタを追加する:

```typescript
// --- 状態セレクタ（スキルライフサイクル TASK-10A-D） ---
export const useCurrentAnalysis = () =>
  useAppStore((state) => state.currentAnalysis);
export const useIsAnalyzing = () => useAppStore((state) => state.isAnalyzing);
export const useIsCreatingSkill = () =>
  useAppStore((state) => state.isCreatingSkill);

// --- アクションセレクタ（スキルライフサイクル TASK-10A-D） ---
export const useAnalyzeSkill = () => useAppStore((state) => state.analyzeSkill);
export const useApplyImprovements = () =>
  useAppStore((state) => state.applyImprovements);
export const useAutoImprove = () => useAppStore((state) => state.autoImprove);
export const useCreateSkill = () => useAppStore((state) => state.createSkill);
export const useClearAnalysis = () =>
  useAppStore((state) => state.clearAnalysis);
```

P31 対策: 全セレクタは `(state) => state.xxx` 形式の単一プロパティアクセスで、Zustand が参照安定性を保証する。

---

### Step 3: SkillManagementPanel の analysis ビュー修正

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

#### 3-1. import 追加

ファイル先頭の import セクションに以下を追加:

```typescript
import { SkillAnalysisView } from "./SkillAnalysisView";
```

#### 3-2. analysis ビューのプレースホルダーを差し替え

現在のプレースホルダーコード:

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

以下に差し替え:

```tsx
if (currentView === "analysis" && selectedSkill) {
  return (
    <div className="p-4" data-testid="skill-management-panel-analysis-view">
      <SkillAnalysisView
        skillName={selectedSkill.name}
        onBack={handleBackToList}
        onImproved={() => {
          fetchSkills();
          handleBackToList();
        }}
      />
    </div>
  );
}
```

差し替え時の確認事項:

- `data-testid="skill-management-panel-analysis-view"` のラッパー div は維持する
- `selectedSkill` が `null` の場合は analysis ビューを表示しない（`&& selectedSkill` ガード）
- `onBack` コールバックで `handleBackToList` を呼び、リストビューに戻る
- `onImproved` コールバックで `fetchSkills()` を呼んでリスト更新後、リストビューに戻る

#### 3-3. SkillAnalysisView の props 確認

SkillAnalysisView が受け入れる props を確認し、以下が渡されていることを検証する:

- `skillName: string` — 分析対象のスキル名
- `onBack: () => void` — 戻るボタンのコールバック
- `onImproved: () => void` — 改善適用完了時のコールバック

SkillAnalysisView が `onBack` と `onImproved` props を受け入れていない場合は、SkillAnalysisView 側に props を追加する。追加する props の型定義:

```typescript
interface SkillAnalysisViewProps {
  skillName: string;
  onBack?: () => void;
  onImproved?: () => void;
}
```

---

### Step 4: SkillManagementPanel の create ビュー修正

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

#### 4-1. import 追加

ファイル先頭の import セクションに以下を追加:

```typescript
import { SkillCreateWizard } from "./SkillCreateWizard";
```

#### 4-2. create ビューのプレースホルダーを差し替え

現在のプレースホルダーコード:

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

以下に差し替え:

```tsx
if (currentView === "create") {
  return (
    <div className="p-4" data-testid="skill-management-panel-create-view">
      <SkillCreateWizard
        onComplete={() => {
          fetchSkills();
          handleBackToList();
        }}
        onCancel={handleBackToList}
      />
    </div>
  );
}
```

差し替え時の確認事項:

- `data-testid="skill-management-panel-create-view"` のラッパー div は維持する
- `onComplete` コールバックで `fetchSkills()` を呼んでリスト更新後、リストビューに戻る
- `onCancel` コールバックで `handleBackToList` を呼び、リストビューに戻る

#### 4-3. SkillCreateWizard の props 確認

SkillCreateWizard が受け入れる props を確認し、以下が渡されていることを検証する:

- `onComplete: () => void` — ウィザード完了時のコールバック
- `onCancel: () => void` — キャンセル時のコールバック

SkillCreateWizard が `onComplete` と `onCancel` props を受け入れていない場合は、SkillCreateWizard 側に props を追加する。追加する props の型定義:

```typescript
interface SkillCreateWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}
```

---

### Step 5: ChatPanel にスキル管理パネルへのアクセスボタンを追加

**対象ファイル**: `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`

#### 5-1. ナビゲーション関連の確認

ChatPanel が使用しているナビゲーション手段を確認する。App.tsx のルーティング構造を確認し、SkillManagementPanel が `/advanced/skill-management-panel` に配置されていることを前提とする。

以下のいずれかのナビゲーション方法を使用する:

- React Router の `useNavigate` フック（App.tsx で Router が使用されている場合）
- Zustand Store のナビゲーション状態更新（カスタムルーティングの場合）
- 親コンポーネントへのコールバック伝播

#### 5-2. スキル管理ボタンの追加

ChatPanel のヘッダーセクション（SkillSelector の隣）にスキル管理ボタンを追加する:

```tsx
<button
  data-testid="skill-management-button"
  className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors duration-200"
  onClick={() => navigate("/advanced/skill-management-panel")}
  disabled={isExecuting}
  aria-label="スキル管理"
  title="スキル管理"
>
  {/* 歯車アイコンまたはスキル管理アイコン */}
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="text-[var(--text-secondary)]"
  >
    {/* アイコンパスは既存デザインシステムに合わせる */}
  </svg>
</button>
```

追加位置: Header セクション内、SkillSelector コンポーネントの右隣

#### 5-3. ナビゲーション手段の実装

App.tsx のルーティング実装に応じて適切なナビゲーション手段を実装する:

**パターン A: React Router 使用時**

```typescript
import { useNavigate } from "react-router-dom";
// コンポーネント内で
const navigate = useNavigate();
```

**パターン B: Zustand ナビゲーション状態使用時**

```typescript
const setCurrentView = useSetCurrentView(); // 既存セレクタ
// onClick で
setCurrentView("skill-management");
```

App.tsx の実装を確認し、適切なパターンを選択する。

---

## 実装上の注意事項

### P31 対策: Zustand セレクタ安定性

- 全ての個別セレクタは `(state) => state.propertyName` 形式で定義する
- アクションセレクタ（`useAnalyzeSkill` 等）が返す関数参照は Zustand が安定性を保証する
- `useEffect` の依存配列に含めても無限ループが発生しない

### P42 対策: 3段バリデーション

agentSlice のアクション内で IPC を呼び出す前に、引数の検証を行う:

```typescript
analyzeSkill: async (skillName: string) => {
  // 3段バリデーション（P42対策）
  if (typeof skillName !== "string" || skillName.trim() === "") {
    set({ skillError: "スキル名が無効です" });
    return;
  }
  // IPC 呼び出し
};
```

### P44/P45 対策: 引数命名のセマンティクス一致

- IPC に渡す引数名は `skillName`（`skillId` ではない）を使用する
- `applyImprovements` の第2引数は `suggestionIndices: number[]` で、サジェスションのインデックス配列を渡す

### P46 対策: HTMLAttributes Props 型衝突

- SkillAnalysisView や SkillCreateWizard に HTML 標準属性と衝突するカスタム props を追加する場合は、`Omit<>` で衝突属性を除外する

### P5 対策: リスナー二重登録防止

- agentSlice のアクションは関数参照として Zustand が管理するため、リスナー二重登録の問題は発生しない
- SkillAnalysisView や SkillCreateWizard 内で IPC リスナーを使用する場合は、モジュールレベルのガードを確認する

## 統合テスト連携

- Step 1 完了後: `cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle.test.ts` で TC-SL-01〜10 が Green になることを確認
- Step 2 完了後: `cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.skill-lifecycle-selectors.test.ts` で TC-SS-01〜06 が Green になることを確認
- Step 3-4 完了後: `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` で TC-I-01〜07 が Green になることを確認
- Step 5 完了後: `cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx` で TC-CP-01〜03 が Green になることを確認

## 成果物

| 種類                   | パス                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| 修正コード             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                |
| 修正コード             | `apps/desktop/src/renderer/store/index.ts`                            |
| 修正コード             | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` |
| 修正コード             | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`             |
| 修正コード（条件付き） | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`    |
| 修正コード（条件付き） | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    |

※ 「条件付き」は、Step 3-3 / Step 4-3 の props 確認結果に応じて修正が必要な場合のみ。

## 完了条件

- [ ] agentSlice に `currentAnalysis`, `isAnalyzing`, `isCreatingSkill` 状態フィールドが追加されている
- [ ] agentSlice に `analyzeSkill`, `applyImprovements`, `autoImprove`, `createSkill`, `clearAnalysis` アクションが追加されている
- [ ] store/index.ts に `useCurrentAnalysis`, `useIsAnalyzing`, `useIsCreatingSkill`, `useAnalyzeSkill`, `useApplyImprovements`, `useAutoImprove`, `useCreateSkill`, `useClearAnalysis` セレクタが追加されている
- [ ] SkillManagementPanel の analysis ビューが SkillAnalysisView コンポーネントを表示する
- [ ] SkillManagementPanel の create ビューが SkillCreateWizard コンポーネントを表示する
- [ ] ChatPanel にスキル管理パネルへのアクセスボタンが追加されている
- [ ] Phase 4 の全テスト（26 テストケース）が Green（PASS）になる
- [ ] `cd apps/desktop && pnpm vitest run` で既存テストが破損していない（リグレッションなし）
- [ ] `pnpm typecheck` で型エラーが発生しない
- [ ] agentSlice のアクションに P42 準拠の 3 段バリデーションが適用されている

## 次のPhase

Phase 6: テスト拡充 → `phase-6-test-expansion.md`
