# テスト仕様書 - エージェントダッシュボード基盤

## 概要情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | AGENT-001                  |
| 機能名   | agent-dashboard-foundation |
| Phase    | 4                          |
| 作成日   | 2026-01-10                 |

---

## テスト戦略

### TDD原則に基づくテスト設計

本テストはTDD（Test-Driven Development）の原則に従い、Red-Green-Refactorサイクルで開発を進める。

| フェーズ | 状態     | 説明                                       |
| -------- | -------- | ------------------------------------------ |
| Phase 4  | Red      | テストを作成し、全テストが失敗状態         |
| Phase 5  | Green    | 最小限の実装でテストを通過                 |
| Phase 8  | Refactor | 設計を改善しテストが通過し続けることを確認 |

### テストピラミッド

```
        ┌─────────┐
        │  E2E    │ ← 手動テスト（AC-003, AC-008/009, AC-010）
       ┌┴─────────┴┐
       │ 統合テスト │ ← ナビゲーション連携、状態同期
      ┌┴───────────┴┐
      │ コンポーネント │ ← AgentView.test.tsx
     ┌┴─────────────┴┐
     │  ユニットテスト  │ ← agentSlice.test.ts, channels.test.ts
    └─────────────────┘
```

---

## テスト対象

### ユニットテスト

| 対象        | ファイル                                    | カバレッジ目標 |
| ----------- | ------------------------------------------- | -------------- |
| agentSlice  | `store/slices/__tests__/agentSlice.test.ts` | 100%           |
| IPCチャネル | `preload/__tests__/channels.test.ts`        | 100%           |

### コンポーネントテスト

| 対象      | ファイル                                       | カバレッジ目標 |
| --------- | ---------------------------------------------- | -------------- |
| AgentView | `views/AgentView/__tests__/AgentView.test.tsx` | 90%            |

### 統合テスト

| 対象               | ファイル                         | 目的                     |
| ------------------ | -------------------------------- | ------------------------ |
| ナビゲーション遷移 | `navigation.integration.test.ts` | AppDock→AgentView連携    |
| 状態同期           | `state-sync.integration.test.ts` | slice間の状態連携        |
| Store永続化        | `store-persistence.test.ts`      | agentSlice永続化除外確認 |

---

## テスト環境

### 使用ツール

| ツール                    | バージョン | 用途                 |
| ------------------------- | ---------- | -------------------- |
| Vitest                    | ^2.x       | テストランナー       |
| @testing-library/react    | ^16.x      | コンポーネントテスト |
| @testing-library/jest-dom | ^6.x       | DOM マッチャー       |

### モック戦略

| 対象           | モック方法                       |
| -------------- | -------------------------------- |
| useAppStore    | vi.mock + セレクタオーバーライド |
| IPCRenderer    | vi.mock (preload環境)            |
| コンポーネント | vi.mock (依存コンポーネント)     |

---

## 受け入れ基準とテストケースのマッピング

| 受け入れ基準 | テストケースID | テストファイル                 | テストタイプ     |
| ------------ | -------------- | ------------------------------ | ---------------- |
| AC-001       | TC-NAV-001     | AppDock.integration.test.tsx   | 統合テスト       |
| AC-002       | TC-NAV-002     | navigation.integration.test.ts | 統合テスト       |
| AC-003       | TC-NAV-003     | （手動テスト）                 | E2Eテスト        |
| AC-004       | TC-VIEW-001    | AgentView.test.tsx             | コンポーネント   |
| AC-005       | TC-STORE-001   | agentSlice.test.ts             | ユニットテスト   |
| AC-006       | TC-IPC-001     | channels.test.ts               | ユニットテスト   |
| AC-007       | TC-NAV-004     | navigationSlice.test.ts        | ユニットテスト   |
| AC-008       | TC-RESP-001    | （手動テスト）                 | レスポンシブ     |
| AC-009       | TC-RESP-002    | （手動テスト）                 | レスポンシブ     |
| AC-010       | TC-A11Y-001    | AgentView.test.tsx             | アクセシビリティ |
| EC-001       | TC-EDGE-001    | navigationSlice.test.ts        | エッジケース     |

---

## カバレッジ目標

| カテゴリ       | 目標 | 測定方法            |
| -------------- | ---- | ------------------- |
| ステートメント | 80%+ | `vitest --coverage` |
| ブランチ       | 75%+ | `vitest --coverage` |
| 関数           | 90%+ | `vitest --coverage` |
| 行             | 80%+ | `vitest --coverage` |

---

## テスト実行コマンド

```bash
# 単体テスト実行
pnpm --filter @repo/desktop test

# カバレッジ測定
pnpm --filter @repo/desktop test --coverage

# 特定ファイルのテスト
pnpm --filter @repo/desktop test agentSlice.test.ts

# ウォッチモード
pnpm --filter @repo/desktop test --watch
```

---

## TDD: Red状態の確認

Phase 4完了時点では、すべてのテストが以下の状態であること：

- [ ] agentSlice.test.ts: 全テストFAIL（実装未）
- [ ] AgentView.test.tsx: 全テストFAIL（コンポーネント未作成）
- [ ] navigation追加テスト: 全テストFAIL（ViewType未更新）
- [ ] channels追加テスト: 全テストFAIL（チャネル未定義）

---

## 使用スキル記録

### tdd-principles

- Phase 1（テスト意図の設計）を実行
- 受け入れ基準からテストチャーターを導出
- 失敗条件と優先度を付与

### frontend-testing

- Phase 3（テストの実装）を実行
- コンポーネントテスト戦略を策定
- Testing Libraryのクエリ優先順位を適用

---

## Phase 4 実行記録

### 使用スキル

- tdd-principles: テストチャーターを設計、Red-Green-Refactorサイクルを計画
- frontend-testing: コンポーネントテスト戦略を策定、Testing Libraryパターンを適用

### TDD状態確認

- [x] agentSlice.test.ts: Red状態（実装ファイル未作成でインポートエラー）
- [x] AgentView.test.tsx: Red状態（コンポーネント未作成でインポートエラー）

### 発見事項

- 良かった点: 既存テストパターン（navigationSlice.test.ts, DashboardView.test.tsx）を参考に一貫性のあるテスト設計ができた
- 問題点: なし
- 改善提案: なし

### 次Phase への引き継ぎ事項

- agentSlice.ts の実装を優先（テストのインポートが解決する）
- AgentView/index.tsx の実装
- 全テストがGreen状態になるまで実装を続ける
