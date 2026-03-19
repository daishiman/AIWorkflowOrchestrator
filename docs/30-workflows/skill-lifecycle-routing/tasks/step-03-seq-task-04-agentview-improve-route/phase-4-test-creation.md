# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 4                                    |
| Phase 名   | テスト作成                           |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| 前提 Phase | Phase 3（設計レビュー PASS）         |
| 後続 Phase | Phase 5（実装）                      |
| ステータス | not_started                          |
| 作成日     | 2026-03-17                           |
| 機能名     | agentview-improve-route              |

## 目的

TDD 原則に従い、実装前にテストコードを作成する。AgentView の改善 CTA バナー表示条件・SkillAnalysisView の prop 拡張・App.tsx の prop 注入・遷移フロー統合の各テストケースを設計し、Red 状態（実装前にすべて失敗）であることを確認する。

## 参照資料

| 参照資料            | パス                                                                                        | 内容                                        |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 2（設計）     | `phase-2-design.md`                                                                         | prop 設計・遷移フロー・表示条件を確認する   |
| Phase 3（レビュー） | `phase-3-design-review.md`                                                                  | レビュー指摘の修正内容を確認する            |
| AgentView           | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                       | 既存コードを確認してテスト対象を特定する    |
| AgentView テスト    | `apps/desktop/src/renderer/views/AgentView/__tests__/`                                      | 既存テストのパターンを確認する              |
| SkillAnalysisView   | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                          | 既存 prop と onClose テストを確認する       |
| App.tsx             | `apps/desktop/src/renderer/App.tsx`                                                         | renderView の skillAnalysis case を確認する |
| 状態管理ルール      | `.claude/rules/03-state-management.md`                                                      | P31 対策・個別セレクタ使用義務を確認する    |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand テストパターンを確認する            |

## 実行タスク

### Task 4-1: AgentView CTAバナー表示条件テスト

**テストファイル**: `apps/desktop/src/renderer/views/AgentView/__tests__/ctaBanner.test.tsx`

#### テストケース設計

```
describe("AgentView 改善CTAバナー", () => {
  describe("表示条件", () => {
    it("isExecutionComplete=true かつ selectedSkillName が存在する場合に CTAバナーを表示する")
    it("isExecutionComplete=false の場合は CTAバナーを表示しない（AC-6）")
    it("selectedSkillName が null の場合は CTAバナーを表示しない（AC-6）")
    it("isExecutionComplete=true かつ selectedSkillName=null の場合は CTAバナーを表示しない（AC-6）")
    it("isExecutionComplete=false かつ selectedSkillName が存在する場合は CTAバナーを表示しない（AC-6）")
  })

  describe("CTAバナーのコンテンツ", () => {
    it("CTAバナーに「スキルを分析・改善する」テキストが含まれる")
    it("CTAバナーに chevron.right 相当の矢印が含まれる")
    it("CTAバナーのボタンに aria-label='スキルを分析・改善する' が付与されている（AC-7 / アクセシビリティ）")
  })

  describe("CTA クリック動作（AC-2）", () => {
    it("CTAバナーのボタンをクリックすると setCurrentView('skillAnalysis') が呼ばれる")
    it("CTAバナーのボタンをクリックすると selectedSkillName が状態に保持される")
  })

  describe("P31対策: 個別セレクタ使用", () => {
    it("useIsExecutionComplete 個別セレクタから isExecutionComplete を取得している")
    it("useSelectedSkillName 個別セレクタから selectedSkillName を取得している")
    it("useSetCurrentView 個別セレクタから setCurrentView を取得している")
  })

  describe("アニメーション（AC-7）", () => {
    it("CTAバナーは実行完了後に表示状態となるクラスを持つ")
  })
})
```

#### モック設計

```typescript
// Zustand 個別セレクタのモック
vi.mock("../../store/slices/navigationSlice", () => ({
  useIsExecutionComplete: vi.fn(),
  useSelectedSkillName: vi.fn(),
  useSetCurrentView: vi.fn(),
}));

// beforeEach でリセット（P9 対策: テスト間状態共有禁止）
beforeEach(() => {
  vi.clearAllMocks();
  mockUseIsExecutionComplete.mockReturnValue(false);
  mockUseSelectedSkillName.mockReturnValue(null);
  mockSetCurrentView.mockReturnValue(vi.fn());
});
```

### Task 4-2: SkillAnalysisView prop 拡張テスト

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.navigation.test.tsx`

#### テストケース設計

```
describe("SkillAnalysisView ナビゲーション prop", () => {
  describe("onNavigateBack prop（AC-3）", () => {
    it("onNavigateBack が渡された場合に「← エージェントに戻る」リンクを表示する")
    it("onNavigateBack が渡されない場合に「← エージェントに戻る」リンクを表示しない（後方互換性）")
    it("「← エージェントに戻る」リンクをクリックすると onNavigateBack が呼ばれる")
  })

  describe("onNavigateToAgent prop（AC-4）", () => {
    it("onNavigateToAgent が渡された場合に「エージェントで再実行」ボタンを表示する")
    it("onNavigateToAgent が渡されない場合に「エージェントで再実行」ボタンを表示しない（後方互換性）")
    it("「エージェントで再実行」ボタンをクリックすると onNavigateToAgent が呼ばれる")
  })

  describe("既存 onClose との共存", () => {
    it("onNavigateBack / onNavigateToAgent を渡しても既存の onClose は機能する")
    it("onNavigateBack / onNavigateToAgent を渡さない場合も既存 onClose は機能する")
  })

  describe("UI レイアウト", () => {
    it("「← エージェントに戻る」リンクはヘッダー左側に配置される")
    it("「エージェントで再実行」ボタンはフッター右端に配置される")
  })

  describe("アクセシビリティ（AC-7）", () => {
    it("戻るリンクにキーボードでアクセスできる")
    it("再実行ボタンにキーボードでアクセスできる")
  })
})
```

### Task 4-3: App.tsx prop 注入テスト

**テストファイル**: `apps/desktop/src/renderer/App/__tests__/skillAnalysisCase.test.tsx`（または既存の App.tsx テストに追記）

#### テストケース設計

```
describe("App.tsx skillAnalysis case prop 注入", () => {
  describe("previousView === 'agent' の場合", () => {
    it("onNavigateBack が注入され SkillAnalysisView に渡される")
    it("onNavigateToAgent が注入され SkillAnalysisView に渡される")
    it("onNavigateBack を呼ぶと setCurrentView('agent') が実行される")
    it("onNavigateToAgent を呼ぶと setIsExecutionComplete(false) が実行される")
    it("onNavigateToAgent を呼ぶと setCurrentView('agent') が実行される")
  })

  describe("previousView !== 'agent' の場合", () => {
    it("onNavigateBack が undefined として渡される")
    it("onNavigateToAgent が undefined として渡される")
  })

  describe("スキル選択状態の維持（AC-5）", () => {
    it("SkillAnalysisView から AgentView に戻った後も selectedSkillName が維持される")
  })
})
```

### Task 4-4: 遷移フロー統合テスト

**テストファイル**: `apps/desktop/src/renderer/__tests__/agentToSkillAnalysisFlow.integration.test.tsx`

#### テストケース設計

```
describe("AgentView → SkillAnalysis → AgentView 遷移フロー統合", () => {
  it("スキル実行完了後に CTAバナーが表示され、クリックで skillAnalysis に遷移する（AC-1 / AC-2）")
  it("SkillAnalysisView で '← エージェントに戻る' をクリックすると AgentView に戻る（AC-3）")
  it("SkillAnalysisView で 'エージェントで再実行' をクリックすると AgentView に戻り isExecutionComplete がリセットされる（AC-4）")
  it("AgentView → SkillAnalysis → AgentView の遷移全体でスキル選択状態が維持される（AC-5）")
  it("スキル未実行時（isExecutionComplete=false）は CTAバナーが表示されない（AC-6）")
})
```

## 実行手順

### ステップ1: 既存テストの確認

AgentView と SkillAnalysisView の既存テストファイルを確認し、モックパターン・テスト構成・setupFiles を把握する。

### ステップ2: テストファイルを作成する（Red フェーズ）

Task 4-1 から Task 4-4 の順にテストファイルを作成する。各テストが Red（失敗）状態であることを確認する。

```bash
# AgentView CTAバナーテスト
pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/ctaBanner.test.tsx

# SkillAnalysisView ナビゲーション prop テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.navigation.test.tsx

# App.tsx prop 注入テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/App/__tests__/skillAnalysisCase.test.tsx

# 統合テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/__tests__/agentToSkillAnalysisFlow.integration.test.tsx
```

### ステップ3: テスト設計の妥当性を確認する

- 受入基準 AC-1〜AC-7 がすべてテストでカバーされているか確認する
- P31対策（個別セレクタ使用）の確認テストが含まれているか確認する
- P9対策（`beforeEach` でのリセット）が実装されているか確認する
- P39（happy-dom 環境では `fireEvent` を使用、`userEvent` 禁止）を遵守しているか確認する
- P40（テスト実行はパッケージディレクトリから実施）を遵守しているか確認する

### ステップ4: 成果物の記録

テストファイルのパスと Red 状態の確認結果を `outputs/phase-4/test-plan.md` に記録する。

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                     | パス                                                                                         | 内容                                               |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| テスト計画書               | `outputs/phase-4/test-plan.md`                                                               | テストケース一覧・カバレッジ目標・モック設計       |
| CTAバナーテスト            | `apps/desktop/src/renderer/views/AgentView/__tests__/ctaBanner.test.tsx`                     | AgentView の CTAバナー表示条件・動作テスト         |
| ナビゲーション prop テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.navigation.test.tsx` | SkillAnalysisView の onNavigateBack/ToAgent テスト |
| App.tsx prop 注入テスト    | `apps/desktop/src/renderer/App/__tests__/skillAnalysisCase.test.tsx`                         | App.tsx の skillAnalysis case テスト               |
| 統合テスト                 | `apps/desktop/src/renderer/__tests__/agentToSkillAnalysisFlow.integration.test.tsx`          | 遷移フロー全体の統合テスト                         |

## 完了条件

- [ ] Task 4-1: AgentView CTAバナー表示条件テストが作成されている（最低 8 ケース）
- [ ] Task 4-2: SkillAnalysisView prop 拡張テストが作成されている（最低 10 ケース）
- [ ] Task 4-3: App.tsx prop 注入テストが作成されている（最低 5 ケース）
- [ ] Task 4-4: 遷移フロー統合テストが作成されている（最低 5 ケース）
- [ ] 受入基準 AC-1〜AC-7 がすべてテストケースでカバーされている
- [ ] P31 対策（個別セレクタ使用確認）のテストが含まれている
- [ ] P9 対策（`beforeEach` でのリセット）がすべてのテストファイルで実装されている
- [ ] P39 対策（`fireEvent` を使用、`userEvent` 不使用）が遵守されている
- [ ] すべてのテストが Red（実装前に失敗）状態であることを確認している
- [ ] `outputs/phase-4/test-plan.md` にテスト計画が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
