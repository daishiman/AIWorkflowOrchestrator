# Phase 6: テスト拡充 — Store駆動ライフサイクルUI統合

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 6                                   |
| 機能名    | store-driven-lifecycle-ui           |
| タスクID  | TASK-10A-F                          |
| 作成日    | 2026-03-07                          |
| 前提Phase | Phase 5 完了（全テスト Green 状態） |
| 次Phase   | Phase 7（カバレッジ確認）           |

## 目的

Phase 5 の実装後にカバレッジ分析を行い、Line/Branch/Function カバレッジが目標基準に到達するようテストを追加する。境界値・エラーケース・統合フローの網羅性を高める。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 参照資料

| 資料                                                                                | 用途                            |
| ----------------------------------------------------------------------------------- | ------------------------------- |
| Phase 4-5 成果物（テストファイル + 実装ファイル）                                   | カバレッジ分析のベースライン    |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts:849-959`                      | store action のブランチ網羅対象 |
| `apps/desktop/src/renderer/components/skill/__tests__/helpers/test-data-factory.ts` | テストデータファクトリ          |

### 前提Phase成果物

| 資料名         | パス               | 用途               |
| -------------- | ------------------ | ------------------ |
| Phase 5 成果物 | `outputs/phase-5/` | 実装結果を参照する |

## 実行タスク

### Task 1: カバレッジ分析

#### 手順

1. `cd apps/desktop && pnpm vitest run --coverage -- src/renderer/components/skill/` を実行する
2. `coverage/` ディレクトリの HTML レポートで以下のファイルの Line/Branch/Function カバレッジを確認する:
   - `SkillCreateWizard.tsx`
   - `hooks/useSkillAnalysis.ts`
   - `SkillAnalysisView.tsx`
   - `SkillManagementPanel.tsx`
3. 基準未達の箇所（未カバー行・ブランチ）をリストアップする

### Task 2: 境界値テスト追加

**対象ファイル**: 既存 Store統合テストファイル内に追加

#### 追加テストケース

```typescript
// SkillCreateWizard.store-integration.test.tsx
describe("境界値テスト", () => {
  it(
    "description がスペースのみの場合、store.createSkill は呼ばれない（UI バリデーションで遮断）",
  );
  it(
    "description が非常に長い文字列（10,000文字）でも store.createSkill が正常に呼ばれる",
  );
  it("options の全フィールドが false でも store.createSkill が呼ばれる");
  it("options の全フィールドが true でも store.createSkill が呼ばれる");
});

// SkillAnalysisView.store-integration.test.tsx
describe("境界値テスト", () => {
  it(
    "skillName が空文字の場合の振る舞い（store のバリデーションエラーが表示される）",
  );
  it(
    "skillName にスペースが含まれる場合、trim された値で store action が呼ばれる",
  );
  it("suggestions が0件の分析結果で「改善提案はありません」が表示される");
  it("suggestions が100件の分析結果でも全件レンダリングされる");
  it("risks が0件の分析結果で「リスクは検出されていません」が表示される");
  it("categories が0件の分析結果で「カテゴリ別分析」見出しが非表示になる");
  it("overallScore が0の場合でもスコアが正しく表示される");
  it("overallScore が100の場合でもスコアが正しく表示される");
});
```

### Task 3: エラーケーステスト追加

**対象ファイル**: 既存 Store統合テストファイル内に追加

#### 追加テストケース

```typescript
// SkillCreateWizard.store-integration.test.tsx
describe("エラーケース", () => {
  it(
    "store.createSkill が空文字列を返した場合（store 内部エラー）にフォールバックエラーが表示される",
  );
  it("store.createSkill が例外を throw した場合にエラーメッセージが表示される");
  it(
    "store.createSkill 中にコンポーネントがアンマウントされても例外が発生しない",
  );
});

// SkillAnalysisView.store-integration.test.tsx
describe("エラーケース", () => {
  it(
    "store.analyzeSkill 呼び出し後に store.skillError が設定された場合にアラートが表示される",
  );
  it(
    "store.applySkillImprovements 失敗後も「選択を適用」「全自動改善」ボタンが再度有効化される",
  );
  it("store.autoImproveSkill 失敗後も「全自動改善」ボタンが再度有効化される");
  it(
    "分析中にコンポーネントがアンマウントされてもローカル state 更新で例外が発生しない",
  );
  it(
    "改善適用中にコンポーネントがアンマウントされてもローカル state 更新で例外が発生しない",
  );
  it("store.analyzeSkill が null を返した場合、分析結果もエラーも表示されない");
});
```

### Task 4: 統合フローテスト追加

**対象ファイル**: 既存 Store統合テストファイル内に追加

#### 追加テストケース

```typescript
// SkillAnalysisView.store-integration.test.tsx
describe("統合フロー", () => {
  it(
    "分析 → 提案選択 → 適用 → 再分析の一連フローが store action 経由で完了する",
  );
  it("分析 → 全自動改善 → 再分析の一連フローが store action 経由で完了する");
  it("エラー → 再試行 → 成功 → 提案選択 → 適用の回復フローが動作する");
  it(
    "「自動修正可能を選択」→「選択を適用」の一連フローで正しい suggestions が store action に渡される",
  );
});

// SkillCreateWizard.store-integration.test.tsx
describe("統合フロー", () => {
  it(
    "Step 1 → Step 2 → 生成 → Step 4（完了）の一連フローが store action 経由で完了する",
  );
  it("Step 1 → Step 2 → 生成失敗 → エラー表示のフローが動作する");
  it(
    "Step 2 → Step 1（戻る）→ Step 2 → 生成の再挑戦フローで description が保持される",
  );
});
```

### Task 5: 排他制御テスト追加

**対象ファイル**: 既存 Store統合テストファイル内に追加

#### 追加テストケース

```typescript
// SkillAnalysisView.store-integration.test.tsx
describe("排他制御", () => {
  it(
    "改善適用中（isImproving: true）に「選択を適用」ボタンが disabled で追加呼び出しが防止される",
  );
  it(
    "改善適用中（isImproving: true）に「全自動改善」ボタンが disabled で追加呼び出しが防止される",
  );
  it(
    "分析中（isAnalyzing: true）に「再試行」ボタンが非表示になる（エラー状態でないため）",
  );
});

// SkillCreateWizard.store-integration.test.tsx
describe("排他制御", () => {
  it(
    "生成中（isGenerating: true）に「スキルを生成」ボタンが非表示になる（GenerateStep 表示中）",
  );
});
```

## 成果物

| 成果物                                     | パス                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 拡充済み SkillCreateWizard Store統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx` |
| 拡充済み SkillAnalysisView Store統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx` |
| カバレッジレポート                         | `apps/desktop/coverage/` (HTML)                                                                     |

## 完了条件

- [ ] Task 1: カバレッジ分析を実施し、未カバー箇所をリストアップ済み
- [ ] Task 2: 境界値テスト（12テストケース）を追加済み
- [ ] Task 3: エラーケーステスト（9テストケース）を追加済み
- [ ] Task 4: 統合フローテスト（7テストケース）を追加済み
- [ ] Task 5: 排他制御テスト（4テストケース）を追加済み
- [ ] 追加した全テストが Green 状態
- [ ] 既存テストに回帰がないこと
- [ ] `cd apps/desktop && pnpm vitest run` で全テスト PASS
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 7: カバレッジ確認へ進む。
