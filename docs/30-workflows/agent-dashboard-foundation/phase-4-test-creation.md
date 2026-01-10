# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 4                          |
| Phase名    | テスト作成                 |
| 前提Phase  | Phase 3                    |
| 後続Phase  | Phase 5                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（TDD: Red状態）。

## 背景

Phase 3でレビューが通過した設計に基づき、受け入れ基準を満たすテストを先に作成する。このPhaseではテストは全て失敗状態（Red）である。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**選定理由**: TDD原則に従ってテストファーストで開発を進めるため

**Trigger条件**:
TDDサイクルの実践、Red-Green-Refactorフローの適用、テストファースト開発を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 受け入れ基準からテストケースを導出

**期待される成果物**:

- `outputs/phase-4/test-specification.md` - テスト仕様書

---

### スキル2: frontend-testing

**パス**: `.claude/skills/frontend-testing/SKILL.md`

**選定理由**: React Testing Libraryを使用したフロントエンドテストの設計・実装のため

**Trigger条件**:
Reactコンポーネントのテスト設計、React Testing Libraryの活用、フロントエンドテスト戦略の策定を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. AgentViewのコンポーネントテストを作成

**期待される成果物**:

- `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`

---

## 参照資料

| 参照資料     | パス                                         | 内容          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 型定義設計   | `outputs/phase-2/type-definitions.md`        | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容                        |
| -------- | --------------------------------------------------------------------------- | --------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略（TDD実践ガイド） |

---

## テストケース設計

### agentSlice.test.ts

```typescript
// agentSlice.test.ts
describe("agentSlice", () => {
  it("should initialize with empty skills array", () => {});
  it("should set skills", () => {});
  it("should select skill", () => {});
  it("should set executing state", () => {});
  it("should append output", () => {});
  it("should set error", () => {});
  it("should clear execution", () => {});
  it("should set skill filter", () => {});
  it("should set skill category", () => {});
});
```

### AgentView.test.tsx

```typescript
// AgentView.test.tsx
describe("AgentView", () => {
  it("should render without crashing", () => {});
  it("should display loading state when skills are loading", () => {});
  it("should display empty state when no skills", () => {});
  it("should display skill list when skills are available", () => {});
});
```

### navigationSlice.test.ts（追加テスト）

```typescript
// navigationSlice.test.ts に追加
describe("navigationSlice - agent view", () => {
  it("should include 'agent' in ViewType", () => {});
  it("should navigate to agent view", () => {});
});
```

---

## 成果物

| 成果物             | パス                                                                     | 内容                 |
| ------------------ | ------------------------------------------------------------------------ | -------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                  | テスト設計           |
| テストケース       | `outputs/phase-4/test-cases.md`                                          | ケース一覧           |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md`                             | 統合テスト設計       |
| agentSliceテスト   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`    | Sliceテスト          |
| AgentViewテスト    | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | コンポーネントテスト |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                       | テストファイル                   |
| -------------------- | ------------------------------ | -------------------------------- |
| ナビゲーションテスト | AppDock→AgentView遷移          | `navigation.integration.test.ts` |
| 状態同期テスト       | agentSlice↔navigationSlice連携 | `state-sync.integration.test.ts` |
| Store永続化テスト    | agentSliceの永続化・復元       | `store-persistence.test.ts`      |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）がPASS/MINORであること
- **後続**: Phase 5（実装）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: {{result}}
- frontend-testing: {{result}}

### TDD状態確認

- [ ] すべてのテストがRed状態

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-dashboard-foundation/phase-5-implementation.md`
