# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 6                          |
| Phase名    | テスト拡充                 |
| 前提Phase  | Phase 5                    |
| 後続Phase  | Phase 7                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-10                 |
| 機能名     | agent-dashboard-foundation |

---

## 目的

Phase 5の実装に対して追加のテストケース（エッジケース、境界値テスト、異常系テスト）を作成する。

## 背景

TDDの基本テストに加えて、より堅牢なテストカバレッジを確保するために追加テストを実装する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: frontend-testing

**パス**: `.claude/skills/frontend-testing/SKILL.md`

**選定理由**: React Testing Libraryを使用した追加テストケースの設計・実装のため

**Trigger条件**:
Reactコンポーネントのテスト設計、React Testing Libraryの活用、フロントエンドテスト戦略の策定を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. エッジケース・異常系テストを追加

**期待される成果物**:

- 拡充されたテストファイル

---

### スキル2: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**選定理由**: 境界値分析に基づいたテストケース設計のため

**Trigger条件**:
入力値の境界テスト、エッジケースの特定、テストケース設計を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 境界値テストケースを特定して追加

**期待される成果物**:

- `outputs/phase-6/boundary-value-tests.md` - 境界値テスト仕様

---

## 参照資料

| 参照資料       | パス                                         | 内容          |
| -------------- | -------------------------------------------- | ------------- |
| テスト仕様     | `outputs/phase-4/test-specification.md`      | Phase 4成果物 |
| テストケース   | `outputs/phase-4/test-cases.md`              | Phase 4成果物 |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md` | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容                        |
| -------- | --------------------------------------------------------------------------- | --------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略（TDD実践ガイド） |

---

## 追加テストケース設計

### agentSlice追加テスト

```typescript
// agentSlice.test.ts に追加
describe("agentSlice - edge cases", () => {
  it("should handle empty skills array", () => {});
  it("should handle duplicate skill selection", () => {});
  it("should handle very long output strings", () => {});
  it("should handle rapid state changes", () => {});
  it("should handle special characters in skill filter", () => {});
  it("should handle null/undefined skill categories", () => {});
});

describe("agentSlice - error handling", () => {
  it("should handle error state correctly", () => {});
  it("should clear error when clearExecution is called", () => {});
  it("should not lose output when error occurs", () => {});
});
```

### AgentView追加テスト

```typescript
// AgentView.test.tsx に追加
describe("AgentView - edge cases", () => {
  it("should handle skills with missing optional fields", () => {});
  it("should handle very long skill names", () => {});
  it("should handle skills with empty descriptions", () => {});
  it("should handle rapid filter changes", () => {});
});

describe("AgentView - accessibility", () => {
  it("should have proper ARIA labels", () => {});
  it("should be keyboard navigable", () => {});
  it("should announce loading state to screen readers", () => {});
});
```

### 統合テスト追加

```typescript
// navigation.integration.test.ts
describe("Navigation Integration - agent view", () => {
  it("should navigate from dashboard to agent view", () => {});
  it("should navigate from agent view to other views", () => {});
  it("should preserve agent state during navigation", () => {});
  it("should handle keyboard shortcut Cmd+5", () => {});
});

// state-sync.integration.test.ts
describe("State Sync - agent slice", () => {
  it("should sync agent state with navigation", () => {});
  it("should persist skill selection across view changes", () => {});
});
```

---

## 成果物

| 成果物             | パス                                                                     | 内容             |
| ------------------ | ------------------------------------------------------------------------ | ---------------- |
| 境界値テスト仕様   | `outputs/phase-6/boundary-value-tests.md`                                | 境界値分析結果   |
| エッジケーステスト | `outputs/phase-6/edge-case-tests.md`                                     | エッジケース一覧 |
| agentSliceテスト   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`    | 拡充テスト       |
| AgentViewテスト    | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 拡充テスト       |
| 統合テスト         | `apps/desktop/src/renderer/__tests__/integration/`                       | 統合テスト       |

---

## 統合テスト連携【必須】

統合テストシナリオを実装する:

| シナリオカテゴリ     | 検証内容                       | テストファイル                   |
| -------------------- | ------------------------------ | -------------------------------- |
| ナビゲーションテスト | AppDock→AgentView遷移          | `navigation.integration.test.ts` |
| 状態同期テスト       | agentSlice↔navigationSlice連携 | `state-sync.integration.test.ts` |
| Store永続化テスト    | agentSliceの永続化・復元       | `store-persistence.test.ts`      |

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 境界値テストが追加されている
- [ ] 異常系テストが追加されている
- [ ] アクセシビリティテストが追加されている
- [ ] 統合テストが実装されている
- [ ] すべてのテストがパスしている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## スキルフィードバック記録（Phase完了後に記入）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 使用スキル

- frontend-testing: {{result}}
- boundary-value-analysis: {{result}}

### 追加テスト数

- エッジケーステスト: {{count}}
- 境界値テスト: {{count}}
- 異常系テスト: {{count}}
- 統合テスト: {{count}}

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

`docs/30-workflows/agent-dashboard-foundation/phase-7-coverage-check.md`
