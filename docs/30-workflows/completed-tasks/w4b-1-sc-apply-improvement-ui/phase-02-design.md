# Phase 2: 設計

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 2                             |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI |
| 作成日   | 2026-03-23                    |
| 前提     | Phase 1 完了                  |

## 目的

Phase 1 で定義した要件を、IPC ハンドラ・Preload API・Renderer コンポーネントの3層にわたる具体的なインターフェースとデータフローに落とし込む。

## 実行タスク

### Task 1: IPC チャンネル・ハンドラ設計

#### 1-1. チャンネル定義

```typescript
// apps/desktop/src/preload/channels.ts に追加
SKILL_CREATOR_APPLY_IMPROVEMENT: "skill-creator:apply-improvement",
```

- `ALLOWED_INVOKE_CHANNELS` 配列の `SKILL_CREATOR_IMPROVE_SKILL` の直後に追加する
- `ALLOWED_ON_CHANNELS` への追加は不要（invoke のみ）

#### 1-2. IPC ハンドラ（creatorHandlers.ts）

以下は**規範的参照実装**である。Phase 5 で本コードを基に実装し、Phase 8 で `isSuggestion()` 型ガード関数への抽出を行う:

```typescript
// registerRuntimeSkillCreatorHandlers() 内に追加
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
  async (
    event: IpcMainInvokeEvent,
    args: {
      skillName: string;
      suggestions: RuntimeSkillCreatorImproveSuggestion[];
    },
  ): Promise<IpcResult<ApplyImprovementResult>> => {
    validateSender(
      event,
      IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
      mainWindow,
    );

    // P42 準拠 3段バリデーション: skillName
    if (isBlank(args?.skillName)) {
      return validationError("skillName が指定されていません");
    }

    // suggestions 配列の実行時型検証（P48 準拠）
    if (!Array.isArray(args?.suggestions)) {
      return validationError("suggestions が配列ではありません");
    }
    if (args.suggestions.length === 0) {
      return validationError("suggestions が空です");
    }

    // 各 suggestion 要素の型検証
    for (let i = 0; i < args.suggestions.length; i++) {
      const s = args.suggestions[i];
      if (
        typeof s?.section !== "string" ||
        typeof s?.before !== "string" ||
        typeof s?.after !== "string" ||
        typeof s?.reason !== "string"
      ) {
        return validationError(
          `suggestions[${i}] の構造が不正です（section/before/after/reason は全て string 必須）`,
        );
      }
    }

    if (!runtimeSkillCreatorService) {
      return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
    }

    try {
      const result = await runtimeSkillCreatorService.applyImprovement(
        args.skillName.trim(),
        args.suggestions,
      );
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: sanitizeErrorMessage(error, "改善提案の適用に失敗しました"),
      };
    }
  },
);
```

レスポンス形式は既存の `IpcResult<T>` wrapper パターンに従う（P60 対策）:

```typescript
// 成功時
{ success: true, data: { applied: 2, skipped: 1, skippedDetails: [...], errors: [] } }

// 失敗時
{ success: false, error: "エラーメッセージ" }
```

#### 1-3. unregister

`unregisterRuntimeSkillCreatorHandlers()` に以下を追加:

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT);
```

### Task 2: Preload API 設計

#### 2-1. skill-creator-api.ts

既存の Runtime Skill Creator セクション（`SKILL_CREATOR_IMPROVE_SKILL` の呼び出し後）に追加:

```typescript
// Runtime Skill Creator - Apply Improvement
applyRuntimeImprovement: (
  skillName: string,
  suggestions: RuntimeSkillCreatorImproveSuggestion[],
): Promise<IpcResult<ApplyImprovementResult>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT, {
    skillName,
    suggestions,
  }),
```

メソッド名を `applyRuntimeImprovement` とする理由:

- 既存の `applyImprovements`（SkillImprover 用）との名前衝突を回避する
- Runtime Skill Creator 固有の機能であることを明示する

#### 2-2. 型定義

`preload/types.ts` の既存 Runtime Skill Creator API セクションに以下を追加:

```typescript
applyRuntimeImprovement: (
  skillName: string,
  suggestions: RuntimeSkillCreatorImproveSuggestion[],
) => Promise<IpcResult<ApplyImprovementResult>>;
```

`RuntimeSkillCreatorImproveSuggestion` と `ApplyImprovementResult` は `@repo/shared/types` から import する（P32 準拠: 型定義は shared に集約）。

### Task 3: Renderer コンポーネント設計

#### 3-1. コンポーネント階層（Atomic Design）

```
ImprovementProposalPanel (organisms) ← 状態管理 + IPC 呼び出し
  ├── ToolBar (内部実装) - 全選択/全解除/適用ボタン
  ├── ImprovementProposalList (organisms) - 提案リスト
  │   └── ImprovementProposalItem[] (molecules) - 個別提案
  │       └── before/after diff ブロック (インライン実装)
  └── ImprovementApplyResult (molecules) - 適用結果表示
```

注: `DiffBlock` と `Checkbox` を独立 atoms として抽出するかは Phase 8（リファクタリング）で判断する。Phase 5 では `ImprovementProposalItem` 内にインライン実装する。

#### 3-2. ImprovementProposalItem Props

```typescript
export interface ImprovementProposalItemProps {
  suggestion: RuntimeSkillCreatorImproveSuggestion;
  index: number;
  isSelected: boolean;
  onToggle: (index: number) => void;
}
```

表示レイアウト:

```
┌──────────────────────────────────────────┐
│ [x] セクション: {section}               │
│                                          │
│  変更前 (before):                        │
│  ┌─────────────────────────────────────┐ │
│  │ (赤系背景) {before テキスト}        │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  変更後 (after):                         │
│  ┌─────────────────────────────────────┐ │
│  │ (緑系背景) {after テキスト}         │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  理由: {reason}                          │
└──────────────────────────────────────────┘
```

#### 3-3. ImprovementProposalList Props

```typescript
export interface ImprovementProposalListProps {
  suggestions: RuntimeSkillCreatorImproveSuggestion[];
  selectedIndices: Set<number>;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApply: () => void;
  isApplying: boolean;
  selectedCount: number;
}
```

#### 3-4. ImprovementApplyResult Props

```typescript
export interface ImprovementApplyResultProps {
  result: ApplyImprovementResult;
  onClose: () => void;
}
```

表示内容:

- 適用済み件数: `result.applied`
- スキップ件数: `result.skipped`
- スキップ詳細: `result.skippedDetails` をリスト表示
- エラー: `result.errors` を赤色でリスト表示

#### 3-5. 状態管理設計

コンポーネント固有の UI 状態であるため、`useState` / `useReducer` で管理する（Zustand Store 不要）。

```typescript
// ImprovementProposalPanel 内の状態
const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
const [isApplying, setIsApplying] = useState(false);
const [applyResult, setApplyResult] = useState<ApplyImprovementResult | null>(
  null,
);
const [error, setError] = useState<string | null>(null);
```

#### 3-6. CSS 変数定義（P47 準拠）

```typescript
// diff 表示用スタイル定数（コンポーネント外部にエクスポート）
export const diffStyles = {
  before: "bg-[var(--status-error)]/10 border-l-2 border-[var(--status-error)]",
  after:
    "bg-[var(--status-success)]/10 border-l-2 border-[var(--status-success)]",
} as const;
```

### Task 3.5: 接続先設計

#### パネルの配置先

`ImprovementProposalPanel` は `improveSkill` 実行後の結果表示として、既存の Skill Creator 実行フロー内に組み込む。

```
[Skill Creator 実行画面]
  ├── plan() → PlanResult 表示
  ├── execute() → ExecuteResult 表示
  └── improve() → ImproveSuggestion[] 取得
       └── ImprovementProposalPanel 表示
            ├── 提案一覧（ImprovementProposalList）
            ├── [適用] → applyRuntimeImprovement()
            └── ImprovementApplyResult 表示
```

#### suggestions の出所

`improveSkill` IPC の実行結果（`RuntimeSkillCreatorImproveResponse.suggestions`）を Renderer 側で state に保持し、`ImprovementProposalPanel` に Props として渡す。

```typescript
// 呼び出し元（SkillCreatorView 等）での使用イメージ
const [suggestions, setSuggestions] = useState<
  RuntimeSkillCreatorImproveSuggestion[]
>([]);
const [showProposalPanel, setShowProposalPanel] = useState(false);

// improve 実行後
const result =
  await window.electronAPI.skillCreator.improveRuntimeSkill(skillName);
if (result.success && result.data.suggestions.length > 0) {
  setSuggestions(result.data.suggestions);
  setShowProposalPanel(true);
}
```

#### ImprovementProposalPanel Props

```typescript
export interface ImprovementProposalPanelProps {
  skillName: string;
  suggestions: RuntimeSkillCreatorImproveSuggestion[];
  onClose: () => void;
  onApplyComplete?: (result: ApplyImprovementResult) => void;
}
```

`ImprovementProposalPanel` は内部で `selectedIndices`、`isApplying`、`applyResult`、`error` を `useState` で管理し、`ImprovementProposalList` と `ImprovementApplyResult` を子コンポーネントとして描画する。

### Task 4: データフロー

#### 全体フロー（improve → proposals → apply）

```
[Renderer]                    [Preload]                     [Main Process]
    |                            |                              |
    |-- improveRuntimeSkill --->|-- skill-creator:improve ---->|
    |                            |   -skill                    |-- facade.improve()
    |<-- suggestions[] ---------|<-- IpcResult<Improve...> ---|
    |                            |                              |
    | setState(suggestions)      |                              |
    | showProposalPanel(true)    |                              |
    |                            |                              |
    | ユーザーが提案を選択       |                              |
    | [適用] ボタン押下          |                              |
    |                            |                              |
    |-- applyRuntimeImprovement-|-- skill-creator:apply ------>|
    |   (skillName, selected)   |   -improvement               |
    |                            |                              |-- validateIpcSender()
    |                            |                              |-- validateArgs()
    |                            |                              |-- facade.applyImprovement()
    |                            |                              |
    |<-- IpcResult<Apply...> ---|<-- IpcResult<Apply...> -----|
    |                            |                              |
    | 結果を表示                 |                              |
    | onApplyComplete() 通知     |                              |
```

#### 適用フロー（詳細）

```
[Renderer]                    [Preload]                     [Main Process]
    |                            |                              |
    | improve() 結果を受信       |                              |
    | suggestions を表示         |                              |
    |                            |                              |
    | ユーザーが提案を選択       |                              |
    | [適用] ボタン押下          |                              |
    |                            |                              |
    |-- applyRuntimeImprovement -|                              |
    |   (skillName, selected)    |-- skill-creator:apply ------>|
    |                            |   -improvement               |
    |                            |                              |-- validateIpcSender()
    |                            |                              |-- validateArgs()
    |                            |                              |-- facade.applyImprovement()
    |                            |                              |
    |                            |<-- IpcResult<Apply... ------|
    |<-- Promise<IpcResult> -----|                              |
    |                            |                              |
    | 結果を表示                 |                              |
```

## 参照資料

- `apps/desktop/src/main/ipc/creatorHandlers.ts`（既存 runtime ハンドラパターン）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L309-352
- `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`（既存 UI パターン）
- `packages/shared/src/types/skillCreator.ts` L352-376
- `.claude/rules/01-architecture.md`（Atomic Design / UI/UX 哲学）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ）

## 成果物

- 本ファイル（`phase-02-design.md`）
- ※ ImprovementProposalPanel の接続先設計（Task 3.5）を含む

## 統合テスト連携

本 Phase（設計）で統合テスト観点を設計する:

- IPC ハンドラ引数形式（`{ skillName, suggestions }` オブジェクト）と Preload API 呼び出し形式の一致確認
- `improveSkill` → `ImprovementProposalPanel` 表示 → `applyRuntimeImprovement` の E2E フロー設計
- Phase 6 統合テスト（I-1 ~ I-3）の設計根拠を本 Phase で確定

## 多角的チェック観点

| 観点           | 適用判断                        | 仕様参照先                                          |
| -------------- | ------------------------------- | --------------------------------------------------- |
| セキュリティ   | IPC ハンドラバリデーション設計  | `aiworkflow-requirements: security-electron-ipc.md` |
| UI/UX          | Atomic Design 階層 + diff 表示  | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ | 3層データフロー設計             | `aiworkflow-requirements: architecture-*.md`        |
| IPC通信        | チャンネル定義 + レスポンス形式 | `aiworkflow-requirements: api-*.md`                 |
| Preload        | safeInvoke + 型定義             | `aiworkflow-requirements: security-api-electron.md` |

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成:

1. IPC チャンネル・ハンドラ設計（Task 1）
2. Preload API 設計（Task 2）
3. Renderer コンポーネント設計（Task 3）
4. 接続先設計（Task 3.5）
5. データフロー図作成（Task 4）

## タスク100%実行確認

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 完了条件

- [x] IPC チャンネル定義が具体的に設計されている
- [x] IPC ハンドラのバリデーションロジックが P42/P48 準拠で設計されている
- [x] Preload API のメソッドシグネチャが定義されている
- [x] Renderer コンポーネント階層が Atomic Design で設計されている
- [x] 各コンポーネントの Props インターフェースが定義されている
- [x] 状態管理方針（useState / Zustand 不使用）が決定されている
- [x] CSS 変数ベースのスタイル設計が P47 準拠で記述されている
- [x] データフローが3層で図示されている
- [x] レスポンス形式が P60 準拠の wrapper 形式で統一されている
- [x] ImprovementProposalPanel の接続先（improve 結果からの遷移）が設計されている
- [x] suggestions の出所（improveSkill レスポンス → state → Props）が設計されている

## 次の Phase

Phase 3: 設計レビュー
