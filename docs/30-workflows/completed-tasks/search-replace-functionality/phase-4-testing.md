# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容           |
| ---------- | -------------- |
| Phase      | 4              |
| Phase名    | テスト作成     |
| 前提Phase  | Phase 3        |
| 後続Phase  | Phase 5        |
| ステータス | 未実施         |
| 作成日     | 2026-01-04     |
| 機能名     | 検索・置換機能 |

---

## 目的

TDDのRed段階として、検索・置換機能の失敗するテストを作成する。Phase 5完了時点でテストカバレッジ80%以上を達成するためのテスト設計を行う。

## 背景

テスト駆動開発（TDD）のRed-Green-Refactorサイクルに従い、まず失敗するテストを作成してから実装を行う。

---

## サブタスク

| ID     | サブタスク名         | 責務                         |
| ------ | -------------------- | ---------------------------- |
| T-04-1 | 検索ロジックのテスト | 検索エンジンのユニットテスト |
| T-04-2 | 検索UIのテスト       | UIコンポーネントのテスト     |

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**Trigger条件**:
テスト駆動開発とRed-Green-Refactorサイクルが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- テスト設計ドキュメント
- 失敗するテストコード

---

### スキル2: frontend-testing

**パス**: `.claude/skills/frontend-testing/SKILL.md`

**Trigger条件**:
Vitest、RTL、Chromatic、axe-coreを使用したテストが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- UIコンポーネントテスト

---

### スキル3: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**Trigger条件**:
モック、スタブ、スパイの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- テストダブル設計書

---

### スキル4: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**Trigger条件**:
境界値分析によるテストケース設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 境界値テストケース

---

## 参照資料

| 参照資料      | パス               | 内容         |
| ------------- | ------------------ | ------------ |
| Phase 2成果物 | `outputs/phase-2/` | 設計書       |
| Phase 3成果物 | `outputs/phase-3/` | レビュー結果 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                    | 内容             |
| ---------- | ----------------------------------------------------------------------- | ---------------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md` | テスト方針・基準 |

---

## 成果物

| 成果物                   | パス                                                                                   | 内容                   |
| ------------------------ | -------------------------------------------------------------------------------------- | ---------------------- |
| 検索エンジンテスト       | `packages/shared/src/search/__tests__/search.test.ts`                                  | 検索ロジックのテスト   |
| 置換エンジンテスト       | `packages/shared/src/search/__tests__/replace.test.ts`                                 | 置換ロジックのテスト   |
| 検索パネルテスト         | `apps/desktop/src/components/search/__tests__/SearchPanel.test.tsx`                    | UIコンポーネントテスト |
| ワークスペース検索テスト | `apps/desktop/src/components/workspace-search/__tests__/WorkspaceSearchPanel.test.tsx` | UIコンポーネントテスト |

---

## テスト設計

### カバレッジ目標

> **重要**: Phase 5完了時点でテストカバレッジ80%以上を達成すること

| 対象             | 目標カバレッジ |
| ---------------- | -------------- |
| 検索エンジン     | 90%以上        |
| 置換エンジン     | 90%以上        |
| UIコンポーネント | 80%以上        |
| カスタムフック   | 85%以上        |
| **全体**         | **80%以上**    |

### 検索ロジックテストケース（T-04-1）

```typescript
// packages/shared/src/search/__tests__/search.test.ts

describe("SearchService", () => {
  describe("searchInFile", () => {
    // 基本検索
    it("should find exact matches in text", () => {});
    it("should return empty array when no matches found", () => {});
    it("should find multiple matches in text", () => {});

    // 大文字小文字
    it("should be case-sensitive when option enabled", () => {});
    it("should be case-insensitive by default", () => {});

    // 単語単位
    it("should match whole words only when option enabled", () => {});

    // 正規表現
    it("should support regex patterns when option enabled", () => {});
    it("should escape special characters in normal mode", () => {});
    it("should handle invalid regex gracefully", () => {});

    // 境界値
    it("should handle empty search pattern", () => {});
    it("should handle empty content", () => {});
    it("should handle very long content", () => {});
    it("should handle unicode characters", () => {});
  });

  describe("searchInWorkspace", () => {
    it("should search across multiple files", () => {});
    it("should respect include patterns", () => {});
    it("should respect exclude patterns", () => {});
    it("should exclude node_modules by default", () => {});
    it("should stream results for large workspaces", () => {});
  });
});

describe("ReplaceService", () => {
  describe("replaceInFile", () => {
    it("should replace single occurrence", () => {});
    it("should replace all occurrences", () => {});
    it("should preserve case in replacement", () => {});
    it("should support regex capture groups", () => {});
    it("should return replacement count", () => {});
  });

  describe("replaceInWorkspace", () => {
    it("should replace across multiple files", () => {});
    it("should provide preview mode", () => {});
    it("should be atomic (all or nothing)", () => {});
  });
});
```

### 検索UIテストケース（T-04-2）

```typescript
// apps/desktop/src/components/search/__tests__/SearchPanel.test.tsx

describe("SearchPanel", () => {
  // 表示/非表示
  it("should render when open prop is true", () => {});
  it("should not render when open prop is false", () => {});
  it("should open with Ctrl+F shortcut", () => {});
  it("should close with Escape key", () => {});

  // 検索入力
  it("should focus search input on open", () => {});
  it("should trigger search on input change", () => {});
  it("should show search results count", () => {});

  // ナビゲーション
  it("should navigate to next result with F3", () => {});
  it("should navigate to previous result with Shift+F3", () => {});
  it("should navigate with arrow buttons", () => {});

  // 検索オプション
  it("should toggle case sensitivity option", () => {});
  it("should toggle whole word option", () => {});
  it("should toggle regex option", () => {});

  // 置換
  it("should show replace input when expand button clicked", () => {});
  it("should replace single occurrence", () => {});
  it("should replace all occurrences", () => {});

  // アクセシビリティ
  it("should have proper ARIA labels", () => {});
  it("should be keyboard navigable", () => {});
});

describe("WorkspaceSearchPanel", () => {
  it("should render search results grouped by file", () => {});
  it("should show context lines around matches", () => {});
  it("should navigate to file on result click", () => {});
  it("should collapse/expand file groups", () => {});
  it("should filter by file pattern", () => {});
  it("should exclude patterns", () => {});
});
```

---

## TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run

# カバレッジ確認
pnpm --filter @repo/shared test:coverage
pnpm --filter @repo/desktop test:coverage
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）
- [ ] 全てのテストケースが実装されている
- [ ] テストカバレッジ計測の準備ができている

---

## 完了条件

- [ ] 検索ロジックのテストが作成されている
- [ ] 置換ロジックのテストが作成されている
- [ ] 検索UIコンポーネントのテストが作成されている
- [ ] ワークスペース検索UIのテストが作成されている
- [ ] 全てのテストが失敗している（Red状態）
- [ ] 境界値テストケースが含まれている
- [ ] アクセシビリティテストが含まれている
- [ ] テストカバレッジ80%以上を達成するためのテスト設計がされている

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: {{result}}
- frontend-testing: {{result}}
- test-doubles: {{result}}
- boundary-value-analysis: {{result}}

### テスト作成結果

- 作成テスト数: {{N}}件
- Red状態確認: {{OK/NG}}

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

`docs/30-workflows/search-replace-functionality/phase-5-implementation.md`
