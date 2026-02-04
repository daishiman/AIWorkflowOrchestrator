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

## 多角的チェック観点（AIが判断）

品質保証時に以下の観点を確認する：

| 観点               | 適用判断 | 確認内容                       | 仕様参照先                     |
| ------------------ | -------- | ------------------------------ | ------------------------------ |
| セキュリティ       | 適用     | ReDoS/パストラバーサル対策確認 | `security-input-validation.md` |
| UI/UX              | 適用     | WCAG 2.1 AA準拠確認            | `ui-ux-search-panel.md`        |
| API設計            | 適用     | IPC通信の安定性確認            | `api-internal-search.md`       |
| エラーハンドリング | 適用     | エラー表示の適切性確認         | `error-handling.md`            |
| パフォーマンス     | 適用     | 検索応答200ms（P50）以内       | `quality-requirements.md`      |
| アクセシビリティ   | 適用     | aria属性、コントラスト比確認   | `ui-ux-search-panel.md`        |

**Electronデスクトップアプリ観点**:

| 層                         | 品質確認観点                     |
| -------------------------- | -------------------------------- |
| フロントエンド（Renderer） | UI表示、レスポンス、a11y         |
| バックエンド（Main）       | 検索処理の安定性                 |
| IPC通信                    | 通信の安定性、エラーハンドリング |
| Preload/セキュリティ       | API公開の安全性                  |

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

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 9-1: 全テスト実行
2. Task 9-2: 静的解析（lint, typecheck）
3. Task 9-3: アクセシビリティ検証
4. Task 9-4: パフォーマンス検証
5. 品質レポート作成

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 9-1〜9-4）を100%実行完了
- [ ] 全品質ゲートをクリアしている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
