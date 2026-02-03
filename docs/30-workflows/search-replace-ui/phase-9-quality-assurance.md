# Phase 9: 品質保証

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 9                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

| ゲート           | 基準                     | 検証方法             |
| ---------------- | ------------------------ | -------------------- |
| 機能検証         | 全自動テスト成功         | `pnpm test:run`      |
| E2Eテスト        | 全E2Eテスト成功          | `pnpm test:e2e`      |
| コード品質       | ESLint警告0件            | `pnpm lint`          |
| 型安全性         | TypeScript型チェック通過 | `pnpm typecheck`     |
| カバレッジ       | Line 80%+, Branch 60%+   | カバレッジレポート   |
| アクセシビリティ | WCAG 2.1 AA準拠          | axe-core自動チェック |
| パフォーマンス   | 検索応答200ms以内        | パフォーマンステスト |

## 実行タスク

### Task 9-1: 全テスト実行

```bash
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop test:e2e
```

### Task 9-2: 静的解析

```bash
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

### Task 9-3: アクセシビリティ検証

既存の`Accessibility.test.tsx`でaxe-coreによる自動チェックを実行。

### Task 9-4: パフォーマンス検証

既存の`Performance.test.tsx`でパフォーマンステストを実行。

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目         | 確認内容          | 結果 |
| ---------------- | ----------------- | ---- |
| 機能検証         | 全自動テスト成功  | TBD  |
| E2Eテスト        | 全E2Eテスト成功   | TBD  |
| 統合テスト       | 全統合テスト成功  | TBD  |
| Lint             | ESLint警告0件     | TBD  |
| TypeCheck        | 型エラー0件       | TBD  |
| アクセシビリティ | axe違反0件        | TBD  |
| パフォーマンス   | 検索応答200ms以内 | TBD  |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全ユニットテストが成功
- [ ] 全統合テストが成功
- [ ] 全E2Eテストが成功
- [ ] ESLint警告0件
- [ ] TypeScript型チェック通過
- [ ] アクセシビリティ検証通過
- [ ] パフォーマンス基準達成
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート
