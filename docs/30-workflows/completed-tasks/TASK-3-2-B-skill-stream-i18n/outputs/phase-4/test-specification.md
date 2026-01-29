# Phase 4: テスト仕様書

## メタ情報

| 項目       | 値            |
| ---------- | ------------- |
| Phase      | 4             |
| 作成日     | 2026-01-28    |
| タスクID   | TASK-3-2-B    |
| テスト状態 | Red（実装前） |

---

## 1. テスト方針

### 1.1 TDDアプローチ

本フェーズではTDD（テスト駆動開発）の「Red」フェーズとして、実装前にテストを作成する。
すべてのテストは実装完了まで失敗状態となる。

### 1.2 テスト構成

| テストカテゴリ          | ファイル                                                                   | テスト数 |
| ----------------------- | -------------------------------------------------------------------------- | -------- |
| formatRelativeTime i18n | `renderer/utils/__tests__/formatTime.i18n.test.ts`                         | 19       |
| SkillStreamDisplay i18n | `renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx` | 21       |
| i18n設定                | `renderer/i18n/config.test.ts`                                             | 16       |
| **合計**                | -                                                                          | **56**   |

---

## 2. テストユーティリティ

### 2.1 i18n-test-utils.tsx

| 関数名           | 用途                             | 使用例                                |
| ---------------- | -------------------------------- | ------------------------------------- |
| `renderWithI18n` | i18nプロバイダー付きレンダリング | `renderWithI18n(<Component />, "en")` |
| `createTestI18n` | テスト用i18nインスタンス生成     | `const i18n = createTestI18n("ja")`   |
| `createMockT`    | モック翻訳関数                   | `const t = createMockT("en")`         |
| `testResources`  | テスト用翻訳リソース             | `testResources.ja.status.running`     |

### 2.2 配置場所

```
apps/desktop/src/renderer/test-utils/
└── i18n-test-utils.tsx
```

---

## 3. テスト実行環境

### 3.1 Vitest設定

| 設定項目               | 値                               |
| ---------------------- | -------------------------------- |
| フレームワーク         | Vitest                           |
| 環境（コンポーネント） | happy-dom                        |
| 環境（ユーティリティ） | node                             |
| テストランナー         | pnpm --filter @repo/desktop test |

### 3.2 モック対象

| モジュール          | モック内容                   |
| ------------------- | ---------------------------- |
| useSkillExecution   | 実行状態、メッセージをモック |
| useSkillPermission  | 権限ダイアログをモック       |
| navigator.clipboard | クリップボードAPIをモック    |

---

## 4. テストカバレッジ目標

| カテゴリ       | 対象                        | カバレッジ目標 |
| -------------- | --------------------------- | -------------- |
| ステートメント | formatRelativeTime          | 100%           |
| ステートメント | SkillStreamDisplay i18n部分 | 90%以上        |
| ブランチ       | 複数形処理（英語）          | 100%           |
| ブランチ       | フォールバック処理          | 100%           |

---

## 5. 検証観点

### 5.1 機能要件（FR）対応

| FR-ID | 要件                           | テストカテゴリ          |
| ----- | ------------------------------ | ----------------------- |
| FR-01 | UIテキスト翻訳                 | SkillStreamDisplay i18n |
| FR-02 | formatRelativeTimeロケール対応 | formatTime i18n         |
| FR-03 | aria-label翻訳                 | SkillStreamDisplay i18n |
| FR-04 | ja/en 2言語サポート            | 全カテゴリ              |
| FR-05 | ブラウザ言語自動検出           | i18n設定                |

### 5.2 非機能要件（NFR）対応

| NFR-ID | 要件               | テスト方法                 |
| ------ | ------------------ | -------------------------- |
| NFR-03 | 既存テスト互換性   | 既存テストスイート実行確認 |
| NFR-04 | TypeScript型安全性 | テストコード型チェック     |

---

## 6. テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# i18n関連テストのみ実行
pnpm --filter @repo/desktop test -- --grep "i18n"

# formatTime テストのみ実行
pnpm --filter @repo/desktop test -- formatTime

# SkillStreamDisplay i18nテストのみ実行
pnpm --filter @repo/desktop test -- SkillStreamDisplay.i18n

# カバレッジ付き実行
pnpm --filter @repo/desktop test -- --coverage
```

---

## 7. テスト成功条件（Phase 5完了後）

- [ ] 全56テストがPASS
- [ ] 既存テスト（SkillStreamDisplay.test.tsx等）が変更なしでPASS
- [ ] カバレッジが目標値を達成
- [ ] TypeScript型チェックがエラーなしでPASS
