# Phase 5: 実装

## メタ情報

| 項目          | 内容                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 5                                                                                                               |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)            |
| 作成日        | 2026-03-21                                                                                                      |
| 担当          | -                                                                                                               |
| ステータス    | 未着手                                                                                                          |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-4-test.md` |

## 目的

Phase 4 で作成したテスト（Red 状態）を Green（全 PASS）にするための実装を行う。`InlineModelSelector.tsx` を `SelectorTrigger`（atom）と `SelectorDropdown`（molecule）に分割した内部構成で実装し、Apple HIG 準拠のデザインを CSS 変数で表現する。

## 実行タスク

### タスク0: 実装前の現状確認（P50対策）

```bash
# InlineModelSelector が既に実装済みか確認
find apps/desktop/src/renderer/components/llm -name "InlineModelSelector*"

# llm コンポーネント index.ts の確認
cat apps/desktop/src/renderer/components/llm/index.ts

# 利用している Store の個別セレクタを確認（P31対策）
grep -rn "useSelectedProviderId\|useSelectedModelId\|useLLMProviders" \
  apps/desktop/src/renderer/store/
```

### タスク1: コンポーネントファイルの作成

**対象ファイル**: `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`

**Props インターフェース**:

```typescript
export interface InlineModelSelectorProps {
  /** コンパクト表示モード（デフォルト: false） */
  compact?: boolean;
  /** 追加CSSクラス名 */
  className?: string;
  /** Provider/Model選択変更時のコールバック */
  onSelectionChange?: (selection: {
    providerId: string;
    modelId: string;
  }) => void;
  /** 無効化フラグ（デフォルト: false） */
  disabled?: boolean;
  /** プロバイダーリスト（Store経由で取得しない場合に直接渡す） */
  providers?: Provider[];
}
```

**デザイントークン定数（P47対策）**:

```typescript
// テストからインポート可能なようにエクスポートする
export const selectorTriggerStyles = {
  base: "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors",
  default:
    "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
  active:
    "border border-[var(--accent-primary)] bg-[var(--bg-elevated)] text-[var(--text-primary)]",
  disabled:
    "border border-[var(--border-default)] bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed",
  compact: "px-1.5 py-0.5 text-xs",
} as const;

export const healthDotStyles = {
  healthy: "bg-[var(--status-success)]",
  degraded: "bg-[var(--status-warning)]",
  checking: "bg-[var(--status-warning)] animate-pulse",
  error: "bg-[var(--status-error)]",
  unknown: "bg-[var(--text-tertiary)]",
} as const;
```

**内部構成**:

- `SelectorTrigger`: ドロップダウンのトリガーボタン（atom）
  - 現在選択中のProvider/Model名とヘルスドットを表示
  - compact/disabled prop を受け取る
- `SelectorDropdown`: ドロップダウンコンテンツ（molecule）
  - プロバイダーリストとモデルリストを2ペインで表示
  - 選択状態のハイライト

**状態管理**:

```typescript
// ユーティリティと型のインポート
import { cn } from "@/renderer/lib/utils";
import type { LLMProvider } from "@/renderer/store/slices/llmSlice";

// ドロップダウン開閉はローカル状態（useStateで管理）
const [isOpen, setIsOpen] = useState(false);

// Store の個別セレクタを使用（P31対策: 合成Hook禁止）
// Note: Phase 2設計のuseSelectProvider/useSelectModelは
// llmSliceのselectProvider/selectModelアクションに対応する個別セレクタ。
// 実際のセレクタ名はllmSlice.tsの定義に従う（P31対策: タスク0で確認）
const selectedProviderId = useSelectedProviderId();
const selectedModelId = useSelectedModelId();
const setSelectedProviderId = useSetSelectedProviderId();
const setSelectedModelId = useSetSelectedModelId();
const providers = useLLMProviders();
```

**外部クリックで閉じる処理**:

```typescript
// useRef + useEffect で外部クリックを検知
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };
  if (isOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isOpen]);
```

**キーボード操作**:

```typescript
// Escape キーでドロップダウンを閉じる
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [isOpen]);
```

**JSX 構造**:

```tsx
return (
  <div ref={containerRef} className={cn("relative inline-block", className)}>
    <SelectorTrigger
      selectedProviderName={selectedProvider?.name}
      selectedModelName={selectedModel?.name}
      healthStatus={healthStatus}
      isOpen={isOpen}
      compact={compact}
      disabled={disabled}
      onClick={() => !disabled && setIsOpen((prev) => !prev)}
    />
    {isOpen && (
      <SelectorDropdown
        providers={providers}
        selectedProviderId={selectedProviderId}
        selectedModelId={selectedModelId}
        onProviderSelect={handleProviderSelect}
        onModelSelect={handleModelSelect}
      />
    )}
  </div>
);
```

### タスク2: index.ts へのエクスポート追加

**対象ファイル**: `apps/desktop/src/renderer/components/llm/index.ts`

```typescript
// 既存のエクスポートに追加
export { InlineModelSelector } from "./InlineModelSelector";
export type { InlineModelSelectorProps } from "./InlineModelSelector";
// デザイントークン定数もエクスポート（P47対策: テストから参照可能にする）
export { selectorTriggerStyles, healthDotStyles } from "./InlineModelSelector";
```

### タスク3: テスト実行でGreen確認

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop

# InlineModelSelector のテスト
pnpm vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx

# 既存テストへの影響確認（リグレッション防止）
pnpm vitest run src/renderer/components/llm/
```

## 参照資料

### システム仕様

| 資料名                     | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| UIコンポーネント設計       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    |
| 状態管理                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |
| Atoms/Patternsリファレンス | `.claude/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`  |
| Apple HIG カラーパレット   | `.claude/rules/01-architecture.md`                                           |

### 前Phase成果物

| 資料名             | パス                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト設計 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-4-test.md` |

### 関連ソースコード

| ファイル             | パス                                                 |
| -------------------- | ---------------------------------------------------- |
| llmコンポーネントdir | `apps/desktop/src/renderer/components/llm/`          |
| Store個別セレクタ    | `apps/desktop/src/renderer/store/slices/llmSlice.ts` |

### 既知の落とし穴

| 落とし穴ID | 説明                                         | 対策                                                          |
| ---------- | -------------------------------------------- | ------------------------------------------------------------- |
| P31        | Zustand Store Hooks 無限ループ               | 個別セレクタ（`useSelectedProviderId()` 等）を使用する        |
| P47        | CSS変数ベースのスタイルテストアサーション    | `selectorTriggerStyles` 等をモジュールスコープに `export`     |
| P48        | useShallow未適用による派生セレクタ無限ループ | `.filter()` / `.map()` を返すセレクタには `useShallow` を適用 |
| P50        | 既実装防御の発見による Phase 転換            | タスク0のチェックを必ず実施する                               |
| P40        | テスト実行ディレクトリ依存                   | `apps/desktop` ディレクトリからテストを実行する               |

## 実行手順

1. **タスク0の実施**: P50チェックを行い、既実装状況を確認する
2. **SelectorTrigger の実装**: atom コンポーネントを先に実装し、テストを通す
3. **SelectorDropdown の実装**: molecule コンポーネントを実装し、テストを通す
4. **InlineModelSelector の統合**: 2つのサブコンポーネントを組み合わせてテストを通す
5. **外部クリック・キーボード処理**: useRef/useEffect による処理を追加し、T1-4 / T8-1 のテストを通す
6. **タスク2の実施**: index.ts にエクスポートを追加する
7. **タスク3の実施**: 全テスト PASS を確認し、リグレッションを確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこの Phase で確認・更新する
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと 1 対 1 で突合する

## 成果物

| 成果物                       | パス                                                                                                                      | 説明                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 5 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-5-implementation.md` | 実装手順書                       |
| InlineModelSelector.tsx      | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                        | メインコンポーネント（新規作成） |
| index.ts 更新                | `apps/desktop/src/renderer/components/llm/index.ts`                                                                       | エクスポート追加                 |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT --phase 5
```

## 完了条件

- [ ] タスク0の P50 チェックを実施し、既実装状況を確認した
- [ ] `InlineModelSelector.tsx` が作成された
- [ ] `SelectorTrigger` サブコンポーネントが実装された
- [ ] `SelectorDropdown` サブコンポーネントが実装された
- [ ] `selectorTriggerStyles` / `healthDotStyles` 定数が `export` されている（P47対策）
- [ ] 個別セレクタ（`useSelectedProviderId()` 等）を使用している（P31対策）
- [ ] 外部クリックで閉じる処理（useRef + useEffect）が実装された
- [ ] Escape キーで閉じる処理が実装された
- [ ] `disabled` prop が正しく動作する
- [ ] `compact` prop が正しく動作する
- [ ] `onSelectionChange` コールバックが正しく呼ばれる
- [ ] index.ts にエクスポートが追加された
- [ ] T1-1 〜 T8-3 の全テストが Green（PASS）になった
- [ ] 既存の llm コンポーネント関連テストがすべて PASS のまま（リグレッションなし）

## 次のPhase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
