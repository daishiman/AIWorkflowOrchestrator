# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 4                               |
| 機能名 | TASK-IMP-permission-history-001 |
| 作成日 | 2026-01-31                      |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。PermissionHistoryEntry型・permissionHistorySlice・PermissionHistoryPanelのテストを網羅する。

## 実行タスク

- データモデルテスト作成: PermissionHistoryEntry型・safeString引数安全化のテスト
- Store テスト作成: permissionHistorySlice（addHistoryEntry, clearHistory, setHistoryFilter, 1000件上限）のテスト
- コンポーネントテスト作成: PermissionHistoryPanel・Filter・Itemのレンダリング・操作テスト
- 統合テスト作成: PermissionDialog応答→履歴記録→UI表示の一連フローテスト
- 境界値テスト作成: 空履歴・1000件超過・不正データのテスト

## 参照資料

| 資料名             | パス                                         | 説明          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| ドメインモデル     | `outputs/phase-2/domain-model.md`            | Phase 2成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                    | 内容                       |
| ---------- | ----------------------------------------------------------------------- | -------------------------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md` | テスト分類・カバレッジ基準 |

## 実行手順

### 1. テストファイル構成

以下のテストファイルを作成する:

| テストファイル                                                                                               | テスト対象                        |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/permissionHistory.test.ts`                             | データモデル・ユーティリティ関数  |
| `apps/desktop/src/renderer/stores/slices/__tests__/permissionHistorySlice.test.ts`                           | Zustand Store（状態管理・永続化） |
| `apps/desktop/src/renderer/components/settings/PermissionSettings/__tests__/PermissionHistoryPanel.test.tsx` | UIコンポーネント（表示・操作）    |

### 2. データモデルテスト

```typescript
// permissionHistory.test.ts
describe("PermissionHistoryEntry", () => {
  it("creates entry with all required fields");
  it("generates unique id using crypto.randomUUID");
  it("stores timestamp in ISO8601 format");
  it("sanitizes args using safeString");
});

describe("createHistoryEntry", () => {
  it("creates approved entry from PermissionDialog approve action");
  it("creates denied entry from PermissionDialog deny action");
  it("creates approved_once entry from PermissionDialog approve-once action");
  it("truncates long argsSnapshot to max 200 characters");
  it("handles empty args object");
  it("handles args with nested objects");
});
```

### 3. Store テスト

```typescript
// permissionHistorySlice.test.ts
describe("permissionHistorySlice", () => {
  describe("addHistoryEntry", () => {
    it("adds entry to beginning of history array (newest first)");
    it("enforces max 1000 entries by removing oldest");
    it("preserves existing entries when adding new one");
    it("sets correct timestamp at time of addition");
  });

  describe("clearHistory", () => {
    it("removes all history entries");
    it("does nothing when history is already empty");
  });

  describe("setHistoryFilter", () => {
    it("sets toolName filter");
    it("sets decision filter");
    it("clears filter when set to undefined");
    it("applies multiple filters simultaneously");
  });

  describe("persistence", () => {
    it("persists history to localStorage");
    it("restores history from localStorage on init");
    it("does not persist filter state");
  });

  describe("edge cases", () => {
    it("handles 1001st entry (removes oldest)");
    it("handles concurrent rapid additions");
    it("handles corrupted localStorage data gracefully");
  });
});
```

### 4. コンポーネントテスト

```typescript
// PermissionHistoryPanel.test.tsx
describe("PermissionHistoryPanel", () => {
  describe("rendering", () => {
    it("displays empty state message when no history");
    it("renders list of history entries");
    it("shows entry timestamp in human-readable format");
    it("shows tool name with icon");
    it("shows decision badge (approved/denied/approved_once)");
    it("shows args snapshot text");
  });

  describe("filtering", () => {
    it("filters by tool name");
    it("filters by decision type");
    it("combines tool name and decision filters");
    it('shows "no results" when filter matches nothing');
    it('resets filter when "all" selected');
  });

  describe("clear history", () => {
    it("shows confirmation dialog on clear button click");
    it("clears history on confirm");
    it("cancels clear on dialog dismiss");
  });

  describe("accessibility", () => {
    it("has proper ARIA labels");
    it("supports keyboard navigation");
    it("announces filter changes to screen reader");
  });

  describe("virtual scroll", () => {
    it("renders only visible entries for large lists");
    it("maintains scroll position after filter change");
  });
});
```

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                                             | テストファイル          |
| ------------------ | -------------------------------------------------------------------- | ----------------------- |
| データフローテスト | PermissionDialog応答→Store記録→UI表示の往復                          | `*.integration.test.ts` |
| 状態永続化テスト   | Store記録→localStorage保存→リロード→Store復元→UI表示                 | `*.persistence.test.ts` |
| エラーハンドリング | localStorage破損時のフォールバック、JSON.parseエラー時の空配列初期化 | `*.error.test.ts`       |

## アーキテクチャ層別テスト（AIが判断）

| 層               | テスト観点                                        | テストファイル配置                                               |
| ---------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| Renderer Process | UIコンポーネント、Zustand Store、フィルタロジック | `apps/desktop/src/renderer/**/*.test.ts`                         |
| Shared           | PermissionHistoryEntry型、safeString関数          | `packages/shared/**/*.test.ts`（型定義がsharedに配置される場合） |

## 成果物

| 成果物         | パス                                    | 説明               |
| -------------- | --------------------------------------- | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md` | テスト設計         |
| テストケース   | `outputs/phase-4/test-cases.md`         | ケース一覧         |
| テストファイル | 上記テストファイル構成表の各ファイル    | 実際のテストコード |

## 完了条件

- [ ] データモデルテスト（6ケース以上）が作成されている
- [ ] Storeテスト（12ケース以上）が作成されている
- [ ] コンポーネントテスト（15ケース以上）が作成されている
- [ ] 統合テストシナリオ（データフロー・永続化・エラー）が定義されている
- [ ] 境界値テスト（空履歴・1000件超・不正データ）が含まれている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Lines 95%以上）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-history-001 --phase 4
```

## 次のPhase

Phase 5: 実装（TDD: Green）
