# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-04                      |
| 機能名     | frontend-testing-best-practices |

---

## 目的

要件を実現可能な構造に落とし込む。テストインフラのアーキテクチャを設計する。

## 背景

Phase 1で定義した要件を、具体的なディレクトリ構造、ファイル配置、API設計に落とし込む。

---

## 使用エージェント

| エージェント | パス                            | 選定理由                   |
| ------------ | ------------------------------- | -------------------------- |
| unit-tester  | `.claude/agents/unit-tester.md` | テスト設計・アーキテクチャ |

**代替候補**: `.claude/agents/frontend-tester.md`

---

## 使用スキル

| スキル名               | パス                                             | 活用方法           | 選定理由               |
| ---------------------- | ------------------------------------------------ | ------------------ | ---------------------- |
| architectural-patterns | `.claude/skills/architectural-patterns/SKILL.md` | テストインフラ設計 | 拡張性のある構造       |
| test-doubles           | `.claude/skills/test-doubles/SKILL.md`           | モック設計         | MSW設計の基礎          |
| api-client-patterns    | `.claude/skills/api-client-patterns/SKILL.md`    | APIハンドラー設計  | Supabase/Anthropic対応 |

---

## 参照資料

| 参照資料     | パス                                         | 内容          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

---

## 実行手順

### ステップ1: ディレクトリ構造設計

```
apps/desktop/
├── src/
│   └── test/
│       ├── mocks/
│       │   ├── handlers.ts      # MSW APIハンドラー
│       │   ├── server.ts        # MSWサーバー設定
│       │   └── browser.ts       # MSWブラウザ設定（必要に応じて）
│       ├── utils.tsx            # カスタムレンダー関数
│       ├── test-helpers.ts      # テストヘルパー
│       ├── factories.ts         # テストデータファクトリー
│       └── setup.ts             # テストセットアップ（更新）
├── e2e/
│   ├── critical-flows.spec.ts   # クリティカルフロー
│   ├── workflow-operations.spec.ts
│   ├── data-persistence.spec.ts
│   └── error-handling.spec.ts
└── vitest.config.ts             # カバレッジ閾値追加
```

### ステップ2: MSWハンドラー設計

**対象API**:

1. Supabase Auth API
   - POST `/auth/v1/token` - 認証トークン取得
   - POST `/auth/v1/signup` - ユーザー登録
   - POST `/auth/v1/signout` - ログアウト

2. Anthropic Messages API
   - POST `/v1/messages` - チャット送信

### ステップ3: テストユーティリティ設計

| ユーティリティ        | 用途                           |
| --------------------- | ------------------------------ |
| renderWithRouter      | Router込みレンダリング         |
| renderWithProviders   | 全Provider込みレンダリング     |
| mockStore             | Zustandストアモック            |
| resetStore            | ストアリセット                 |
| createMockChatSession | チャットセッションファクトリー |
| createMockChatMessage | チャットメッセージファクトリー |

### ステップ4: E2Eテストシナリオ設計

| 優先度 | シナリオ                 | ファイル                    |
| ------ | ------------------------ | --------------------------- |
| 最優先 | 初回セットアップ         | critical-flows.spec.ts      |
| 最優先 | ワークスペース検索       | critical-flows.spec.ts      |
| 最優先 | チャット履歴エクスポート | critical-flows.spec.ts      |
| 高     | テキストコンバーター     | workflow-operations.spec.ts |
| 高     | 設定変更永続化           | data-persistence.spec.ts    |
| 高     | エラーハンドリング       | error-handling.spec.ts      |

---

## 成果物

| 成果物             | パス                                     | 内容               |
| ------------------ | ---------------------------------------- | ------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | テストインフラ構造 |
| MSWハンドラー設計  | `outputs/phase-2/msw-handlers-design.md` | APIモック設計      |
| E2Eシナリオ設計    | `outputs/phase-2/e2e-scenarios.md`       | E2Eテスト設計      |

---

## 完了条件

- [ ] ディレクトリ構造が定義されている
- [ ] MSWハンドラーの対象APIが特定されている
- [ ] テストユーティリティの仕様が定義されている
- [ ] E2Eテストシナリオが10本以上設計されている
- [ ] 要件との整合性が確認されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## スキルフィードバック記録

| スキル                 | 結果 | 備考 |
| ---------------------- | ---- | ---- |
| architectural-patterns | -    | -    |
| test-doubles           | -    | -    |
| api-client-patterns    | -    | -    |

---

## 次のPhase

`docs/30-workflows/frontend-testing-best-practices/phase-3-design-review.md`
