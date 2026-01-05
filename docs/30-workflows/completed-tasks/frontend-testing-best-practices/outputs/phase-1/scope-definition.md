# スコープ定義 - フロントエンドテストベストプラクティス

## 実装範囲

### 1. MSW (Mock Service Worker)

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| インストール | mswパッケージ                      |
| handlers.ts  | Supabase Auth, Anthropic APIモック |
| server.ts    | MSWサーバー設定                    |
| setup.ts更新 | beforeAll/afterEach/afterAll設定   |

### 2. Vitest UI

| 項目           | 内容                                     |
| -------------- | ---------------------------------------- |
| インストール   | @vitest/uiパッケージ                     |
| スクリプト追加 | test:ui, test:ui:desktop, test:ui:shared |

### 3. E2Eテスト拡充

| 項目         | 内容                       |
| ------------ | -------------------------- |
| 追加テスト数 | 3-8本（合計10本以上）      |
| 対象フロー   | クリティカルユーザーフロー |

### 4. カバレッジ閾値

| 項目        | 内容                    |
| ----------- | ----------------------- |
| desktop閾値 | 行80%, 関数80%, 分岐60% |
| shared閾値  | 行80%, 関数80%, 分岐60% |

### 5. テストユーティリティ

| 項目            | 内容                    |
| --------------- | ----------------------- |
| utils.tsx       | renderWithRouter等      |
| test-helpers.ts | mockStore, resetStore   |
| factories.ts    | createMockChatSession等 |

### 6. CI/CD統合

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| test.yml更新 | ユニットテスト、カバレッジ、E2E |

### 7. ドキュメント

| 項目       | 内容              |
| ---------- | ----------------- |
| TESTING.md | テスト実行ガイド  |
| E2E.md     | E2Eテスト追加方法 |
| MSW.md     | MSW使用方法       |

---

## 範囲外

| 項目                      | 理由               |
| ------------------------- | ------------------ |
| Storybook                 | 別フェーズで検討   |
| Visual Regression Testing | 有料サービス不使用 |
| パフォーマンステスト      | 別タスクとして分離 |
| セキュリティテスト        | 別タスクとして分離 |

---

## 成果物配置

### ドキュメント成果物

```
docs/30-workflows/frontend-testing-best-practices/
├── outputs/
│   ├── phase-1/           # 要件定義
│   ├── phase-2/           # 設計
│   ├── phase-3/           # 設計レビュー
│   ├── phase-4/           # テスト仕様
│   ├── phase-5/           # 実装記録
│   ├── phase-6/           # リファクタリング
│   ├── phase-7/           # 品質レポート
│   ├── phase-8/           # 最終レビュー
│   └── phase-9/           # 手動テスト結果
```

### コード成果物

```
apps/desktop/
├── src/test/
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   ├── utils.tsx
│   ├── test-helpers.ts
│   └── factories.ts
└── e2e/
    └── *.spec.ts

docs/testing/
├── TESTING.md
├── E2E.md
└── MSW.md
```
