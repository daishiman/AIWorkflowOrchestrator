# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 5                                    |
| Phase 名   | 実装                                 |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| 前提 Phase | Phase 4（テスト作成 / Red 確認済み） |
| 後続 Phase | Phase 6（テスト拡充）                |
| ステータス | not_started                          |
| 作成日     | 2026-03-17                           |
| 機能名     | agentview-improve-route              |

## 目的

Phase 4 で作成したテスト（Red 状態）を Green にするプロダクションコードを実装する。実装順序は「SkillAnalysisView prop 拡張 → AgentView CTAバナー実装 → App.tsx prop 注入更新」の順に行い、各ステップで Green 状態を確認する。

## 参照資料

| 参照資料             | パス                                                               | 内容                                                   |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| Phase 2（設計）      | `phase-2-design.md`                                                | prop 設計・UI レイアウト・遷移フローの正本             |
| Phase 3（レビュー）  | `phase-3-design-review.md`                                         | レビュー指摘の対応事項を確認する                       |
| Phase 4（テスト）    | `phase-4-test-creation.md`                                         | Green にすべきテストケース一覧を確認する               |
| AgentView            | `apps/desktop/src/renderer/views/AgentView/index.tsx`              | 現状の実装を確認し変更箇所を特定する                   |
| SkillAnalysisView    | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` | 現状の props / 構造を確認し拡張ポイントを特定する      |
| App.tsx              | `apps/desktop/src/renderer/App.tsx`                                | skillAnalysis case の現状を確認する                    |
| navigationSlice      | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`        | 個別セレクタの定義済み状況を確認する                   |
| 状態管理ルール       | `.claude/rules/03-state-management.md`                             | P31 対策・個別セレクタ必須を確認する                   |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                 | Apple HIG カラーパレット・アニメーション指針を確認する |

## 実行タスク

### Task 5-1: SkillAnalysisView prop 拡張

**変更ファイル**: `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`

#### 実装内容

1. `SkillAnalysisViewProps` インターフェースに `onNavigateBack?` / `onNavigateToAgent?` を追加する

```typescript
interface SkillAnalysisViewProps {
  skillName: string;
  onClose: () => void; // 既存（変更なし）
  onNavigateBack?: () => void; // 追加: AgentView に戻る
  onNavigateToAgent?: () => void; // 追加: AgentView で再実行
}
```

2. ヘッダー左部に「← エージェントに戻る」テキストリンクを追加する
   - `onNavigateBack` が渡された場合のみ表示する（後方互換性維持）
   - 8px グリッド準拠のスペーシング
   - `aria-label` によるアクセシビリティ確保

3. フッター右端に「エージェントで再実行 →」ボタンを追加する
   - `onNavigateToAgent` が渡された場合のみ表示する（後方互換性維持）
   - Apple HIG `systemBlue` (`#007AFF` / `#0A84FF`) 相当のアクセントカラー
   - `aria-label` によるアクセシビリティ確保

#### 実装ガイドライン

```tsx
// ヘッダー左部への戻るリンク
{
  onNavigateBack && (
    <button
      onClick={onNavigateBack}
      className="flex items-center gap-1 text-sm text-[var(--color-accent)] hover:opacity-80 transition-opacity"
      aria-label="エージェントに戻る"
    >
      <ChevronLeftIcon className="w-4 h-4" />
      <span>エージェントに戻る</span>
    </button>
  );
}

// フッター右端への再実行ボタン
{
  onNavigateToAgent && (
    <button
      onClick={onNavigateToAgent}
      className="flex items-center gap-1 px-4 py-2 rounded-[8px] bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
      aria-label="エージェントで再実行"
    >
      <span>エージェントで再実行</span>
      <ChevronRightIcon className="w-4 h-4" />
    </button>
  );
}
```

### Task 5-2: AgentView 改善CTAバナー実装

**変更ファイル**: `apps/desktop/src/renderer/views/AgentView/index.tsx`

#### 事前調査

実装前に以下を確認する:

- `isExecutionComplete` フラグの管理方法（navigationSlice 定義済みか / AgentView 内部 state か）
- `selectedSkillName` の取得方法（navigationSlice の既存セレクタか）
- `setCurrentView` の個別セレクタが定義済みか

#### 実装内容

1. 個別セレクタで状態を取得する（P31 対策必須）

```typescript
// NG: const { isExecutionComplete, selectedSkillName, setCurrentView } = useNavigationStore();

// OK: 個別セレクタを使用
const isExecutionComplete = useIsExecutionComplete();
const selectedSkillName = useSelectedSkillName();
const setCurrentView = useSetCurrentView();
```

2. 実行結果エリアの下部に改善CTAバナーを追加する

```tsx
{
  /* 改善CTAバナー: 実行完了後かつスキル選択済みの場合のみ表示（AC-1 / AC-6） */
}
{
  isExecutionComplete && selectedSkillName && (
    <div
      className={`
      mt-4 p-4 rounded-[12px]
      bg-[var(--color-secondary-background)]
      border border-[var(--color-border)]
      transition-opacity duration-200
      ${isExecutionComplete ? "opacity-100" : "opacity-0"}
    `}
      role="complementary"
      aria-label="スキル改善の提案"
    >
      <p className="text-sm text-[var(--color-secondary-label)] mb-3">
        このスキルの精度を上げたいですか？
      </p>
      <button
        onClick={() => setCurrentView("skillAnalysis")}
        className="flex items-center gap-1 px-4 py-2 rounded-[8px] bg-[var(--color-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        aria-label="スキルを分析・改善する"
      >
        <span>スキルを分析・改善する</span>
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
```

#### CTA 200ms フェードインアニメーション（AC-7）

`isExecutionComplete` が `true` になった瞬間にフェードインするアニメーションを実装する。

```tsx
// CSS Transition を使ったフェードイン
// duration-200 クラスで 200ms フェードイン（AC-7: Apple HIG 200-300ms）
// opacity-0 → opacity-100 の遷移

// または tailwind animate-fadeIn カスタムクラスを使用する場合:
// tailwind.config.ts の keyframes に fadeIn を追加する
```

#### 個別セレクタが未定義の場合の対応

`isExecutionComplete` / `useIsExecutionComplete` が navigationSlice に未定義の場合:

- navigationSlice に `isExecutionComplete` 状態と `useIsExecutionComplete` / `useSetIsExecutionComplete` 個別セレクタを追加する
- AgentView の実行完了コールバックで `setIsExecutionComplete(true)` を呼ぶ

### Task 5-3: App.tsx skillAnalysis case の prop 注入更新

**変更ファイル**: `apps/desktop/src/renderer/App.tsx`

#### 事前調査

実装前に以下を確認する:

- `previousView` の管理方法（navigationSlice で `previousView` が管理されているか）
- `setIsExecutionComplete` の個別セレクタが定義済みか

#### 実装内容

```tsx
// App.tsx の renderView 内（skillAnalysis case）
case "skillAnalysis":
  return (
    <SkillAnalysisView
      skillName={selectedSkillName ?? ""}
      onClose={() => setCurrentView("skillCenter")}
      onNavigateBack={
        previousView === "agent"
          ? () => setCurrentView("agent")
          : undefined
      }
      onNavigateToAgent={
        previousView === "agent"
          ? () => {
              setIsExecutionComplete(false);
              setCurrentView("agent");
            }
          : undefined
      }
    />
  );
```

**注意**: `previousView === "agent"` の条件が成立する場合のみ `onNavigateBack` / `onNavigateToAgent` を注入する。SkillCenter から開いた場合などは `undefined` を渡し、ボタンを非表示にする（後方互換性維持）。

## 実装順序と確認ポイント

### ステップ1: SkillAnalysisView prop 拡張（Task 5-1）

```bash
# テストを Green にする
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.navigation.test.tsx
```

- [ ] Task 4-2 のテストがすべて Green になること

### ステップ2: navigationSlice の個別セレクタ確認・追加（Task 5-2 の前提）

```bash
# navigationSlice の現状確認
# isExecutionComplete / useIsExecutionComplete が存在するか確認する
```

- [ ] `isExecutionComplete` 状態が navigationSlice に存在する
- [ ] `useIsExecutionComplete` 個別セレクタが定義済みである
- [ ] `useSetIsExecutionComplete` 個別セレクタが定義済みである
- [ ] 未定義の場合は navigationSlice に追加する

### ステップ3: AgentView CTAバナー実装（Task 5-2）

```bash
# テストを Green にする
pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/ctaBanner.test.tsx
```

- [ ] Task 4-1 のテストがすべて Green になること

### ステップ4: App.tsx prop 注入更新（Task 5-3）

```bash
# テストを Green にする
pnpm --filter @repo/desktop exec vitest run src/renderer/App/__tests__/skillAnalysisCase.test.tsx

# 統合テストを Green にする
pnpm --filter @repo/desktop exec vitest run src/renderer/__tests__/agentToSkillAnalysisFlow.integration.test.tsx
```

- [ ] Task 4-3 のテストがすべて Green になること
- [ ] Task 4-4（統合テスト）がすべて Green になること

### ステップ5: 全テスト実行で既存テストが壊れていないことを確認する

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/
```

- [ ] 既存テストが壊れていないこと

## 実装上の禁止事項

- `any` 型を使用しない（02-code-quality.md）
- `@ts-ignore` / `@ts-expect-error` を理由コメントなしに使用しない
- 合成 Store Hook（`useNavigationStore()` 等）を新規使用箇所に追加しない（P31 対策）
- `useEffect` の依存配列に合成 Hook の戻り値関数を含めない（P31 対策）
- `.filter()` / `.map()` で新しい配列を返す派生セレクタに `useShallow` を適用していない（P48 対策）
- `userEvent` を happy-dom 環境のテストで使用しない（P39 対策）

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                 | パス                                                               | 内容                                                   |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| SkillAnalysisView 変更 | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` | `onNavigateBack` / `onNavigateToAgent` prop 追加       |
| AgentView 変更         | `apps/desktop/src/renderer/views/AgentView/index.tsx`              | 改善 CTAバナー追加（200ms フェードイン）               |
| App.tsx 変更           | `apps/desktop/src/renderer/App.tsx`                                | skillAnalysis case への prop 注入更新                  |
| navigationSlice 変更   | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`        | `isExecutionComplete` 状態・個別セレクタ追加（必要時） |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                        | 変更箇所・設計判断・注意事項を記録する                 |

## 完了条件

- [ ] Task 5-1: SkillAnalysisView に `onNavigateBack` / `onNavigateToAgent` prop が追加されている
- [ ] Task 5-1: 後方互換性が維持されている（既存の呼び出し元が壊れていない）
- [ ] Task 5-2: AgentView に改善 CTAバナーが実装されている
- [ ] Task 5-2: `isExecutionComplete === true && selectedSkillName !== null` の表示条件が実装されている（AC-1 / AC-6）
- [ ] Task 5-2: 200ms フェードインアニメーションが実装されている（AC-7）
- [ ] Task 5-2: 個別セレクタを使用している（P31 対策）
- [ ] Task 5-3: App.tsx の skillAnalysis case に `onNavigateBack` / `onNavigateToAgent` が注入されている
- [ ] Task 5-3: `previousView !== "agent"` の場合は `undefined` を渡している
- [ ] Phase 4 で作成したすべてのテストが Green 状態になっている
- [ ] 既存テストが壊れていないこと
- [ ] `outputs/phase-5/implementation-summary.md` に実装サマリーが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
