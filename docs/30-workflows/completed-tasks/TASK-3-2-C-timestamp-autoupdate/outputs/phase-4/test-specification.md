# テスト仕様書: TASK-3-2-C タイムスタンプ自動更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| タスク | TASK-3-2-C-timestamp-autoupdate |
| Phase  | 4                               |
| 作成日 | 2026-01-28                      |

---

## 1. テスト対象

### 1.1 新規作成ファイル

| ファイル             | パス                                  | テストファイル            |
| -------------------- | ------------------------------------- | ------------------------- |
| useInterval.ts       | `apps/desktop/src/renderer/hooks/`    | useInterval.test.ts       |
| usePageVisibility.ts | `apps/desktop/src/renderer/hooks/`    | usePageVisibility.test.ts |
| TimestampContext.tsx | `apps/desktop/src/renderer/contexts/` | TimestampContext.test.tsx |

### 1.2 既存ファイルへの追加

| ファイル      | パス                               | 追加テスト                        |
| ------------- | ---------------------------------- | --------------------------------- |
| formatTime.ts | `apps/desktop/src/renderer/utils/` | calculateUpdateInterval関連テスト |

---

## 2. テスト戦略

### 2.1 TDD Red-Green-Refactorサイクル

| Phase | 状態  | 説明                         |
| ----- | ----- | ---------------------------- |
| 4     | Red   | テスト作成、全テスト失敗     |
| 5     | Green | 実装作成、全テスト成功       |
| 8     | -     | リファクタリング、テスト維持 |

### 2.2 テストカバレッジ目標

| 対象ファイル            | 目標カバレッジ |
| ----------------------- | -------------- |
| useInterval.ts          | 100%           |
| usePageVisibility.ts    | 100%           |
| TimestampContext.tsx    | 100%           |
| formatTime.ts（追加分） | 100%           |

---

## 3. テスト環境

### 3.1 テストフレームワーク

| ツール           | 用途                       |
| ---------------- | -------------------------- |
| Vitest           | テストランナー             |
| @testing-library | React コンポーネントテスト |
| happy-dom        | DOM環境                    |

### 3.2 モック戦略

| 対象             | モック方法               |
| ---------------- | ------------------------ |
| タイマー         | vi.useFakeTimers()       |
| システム時刻     | vi.setSystemTime()       |
| document.hidden  | Object.defineProperty()  |
| visibilitychange | document.dispatchEvent() |

---

## 4. 受け入れ基準対応

| AC-ID | テストファイル             | テストケース                      |
| ----- | -------------------------- | --------------------------------- |
| AC-1  | TimestampContext.test.tsx  | currentTimeが定期的に更新される   |
| AC-2  | formatTime.test.ts         | calculateUpdateInterval関連テスト |
| AC-3  | TimestampContext.test.tsx  | 非表示時に更新が停止する          |
| AC-4  | TimestampContext.test.tsx  | 再表示時に更新が再開される        |
| AC-5  | formatTime.test.ts（既存） | formatRelativeTime表示形式        |
| AC-9  | usePageVisibility.test.ts  | イベントリスナー解除              |
| AC-10 | 全テスト                   | 既存テスト全PASS                  |
| AC-11 | カバレッジレポート         | カバレッジ100%                    |

---

## 変更履歴

| 日付       | 変更内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-28 | 初版作成 | AI   |
