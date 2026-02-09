# Phase 4: テスト仕様書

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase        | 4                                  |
| タスク名     | SkillAPI二重定義の解消             |
| 作成日       | 2026-02-09                         |
| テストツール | Vitest                             |

## 1. テスト目的

本テスト仕様は、TASK-FIX-5-1-SKILL-API-UNIFICATIONの要件を検証するためのテスト設計を定義する。

### 1.1 主要検証項目

| 項目         | 説明                                            | 優先度 |
| ------------ | ----------------------------------------------- | ------ |
| 統一API公開  | `window.electronAPI.skill` が13メソッド全て公開 | 高     |
| 旧API削除    | `window.skillAPI` が未定義であること            | 高     |
| 型安全性     | 各メソッドの戻り値型が仕様通りであること        | 中     |
| 境界値       | 空文字列・null/undefined・最大長の処理          | 中     |
| 統合シナリオ | 実際のユースケースフローが動作すること          | 中     |

## 2. テストファイル構成

| ファイル                        | 説明                       | 状態         |
| ------------------------------- | -------------------------- | ------------ |
| `skill-api.test.ts`             | 13メソッドの基本動作テスト | 既存（維持） |
| `skill-api.permission.test.ts`  | 権限系メソッドテスト       | 既存（維持） |
| `skill-api.unification.test.ts` | 統一API検証テスト          | **新規作成** |

## 3. テストスコープ

### 3.1 スコープ内

- `window.electronAPI.skill` の13メソッド公開検証
- `window.skillAPI` の未定義検証（Phase 5実装後にPASS）
- 各メソッドの戻り値型検証
- 境界値テスト（空文字列、null、undefined）
- 統合シナリオテスト

### 3.2 スコープ外

- Main Process側のIPCハンドラ実装
- 実際のスキル実行処理
- E2Eテスト

## 4. テスト環境

### 4.1 モック構成

```typescript
// Electron IPC モック
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  },
}));
```

### 4.2 セットアップ

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  mockInvoke.mockResolvedValue(undefined);
  mockOn.mockImplementation(() => {});
});
```

## 5. TDD状態

### 5.1 Red状態（Phase 5実装前）

| テストケース               | 期待結果          | 現在状態                         |
| -------------------------- | ----------------- | -------------------------------- |
| `window.skillAPI` が未定義 | `toBeUndefined()` | FAIL（types.d.tsにまだ定義あり） |

### 5.2 Green状態（Phase 5実装後）

Phase 5で `types.d.ts` から `window.skillAPI` の型宣言を削除後、上記テストがPASSになる。

## 6. カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 7. 関連資料

| 資料             | パス                                                               |
| ---------------- | ------------------------------------------------------------------ |
| Phase 1 要件定義 | `outputs/phase-1/requirements-definition.md`                       |
| Phase 2 設計     | `outputs/phase-2/unified-api-design.md`                            |
| Phase 3 レビュー | `outputs/phase-3/design-review-result.md`                          |
| 既存テスト       | `apps/desktop/src/preload/__tests__/skill-api.test.ts`             |
| 新規テスト       | `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts` |
