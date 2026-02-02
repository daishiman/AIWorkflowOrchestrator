# Phase 9: 品質保証

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 9                            |
| タスク | TASK-8B コンポーネントテスト |
| 機能名 | skill-import-agent-system    |
| 作成日 | 2026-02-01                   |

## 目的

定義された品質基準をすべて満たすことを検証する。テストコード自体の品質（Lint、型チェック）、テストの網羅性、実行の安定性を確認する。

## 品質ゲート

| 品質項目           | 確認内容                                      | 基準      | 結果       |
| ------------------ | --------------------------------------------- | --------- | ---------- |
| テスト成功         | 全テストケースが成功                          | 100%      | {{RESULT}} |
| Line Coverage      | 4コンポーネント全体                           | 80%以上   | {{RESULT}} |
| Branch Coverage    | 4コンポーネント全体                           | 60%以上   | {{RESULT}} |
| Function Coverage  | 4コンポーネント全体                           | 80%以上   | {{RESULT}} |
| TypeScriptチェック | テストファイルの型エラーなし                  | エラー0件 | {{RESULT}} |
| ESLintチェック     | テストファイルのLintエラーなし                | エラー0件 | {{RESULT}} |
| テスト安定性       | 3回連続実行で全て成功（フレイキーテストなし） | 3/3成功   | {{RESULT}} |

## 参照資料

| 資料名               | パス                                 | 説明          |
| -------------------- | ------------------------------------ | ------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | Phase 8成果物 |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md` | Phase 7成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                        | 内容           |
| -------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | コード品質基準 |

## 実行手順

### ステップ1: TypeScript型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

テストファイル内の型エラーを確認:

- `vi.fn()` の型定義が正しいか
- モックデータの型が `@repo/shared` の型定義に準拠しているか
- `screen.getByRole` 等のクエリの型が正しいか

### ステップ2: ESLintチェック

```bash
pnpm --filter @repo/desktop lint
```

テストファイル固有のチェック:

- 未使用のimport/変数がないか
- `@testing-library/react` のベストプラクティスに準拠しているか
- `no-testing-library-wait-for-empty-callback` ルール準拠

### ステップ3: テスト安定性確認

```bash
# 3回連続実行
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/
```

フレイキーテストが見つかった場合:

- `waitFor` のタイムアウトを調整
- テスト間の状態リークを修正
- `vi.useFakeTimers` の使用を検討

### ステップ4: カバレッジ最終確認

```bash
pnpm --filter @repo/desktop test -- --run --coverage src/renderer/components/skill/__tests__/
```

## 統合テスト連携【必須】

| 品質項目     | 確認内容                     | 結果       |
| ------------ | ---------------------------- | ---------- |
| テスト成功   | 全コンポーネントテスト成功   | {{RESULT}} |
| 型安全性     | テストコードの型チェック通過 | {{RESULT}} |
| コード品質   | ESLintエラーなし             | {{RESULT}} |
| テスト安定性 | フレイキーテストなし         | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                        | 確認項目                             |
| ---------------- | ------------------------------- | ------------------------------------ |
| UI/UX            | テストでUI品質を検証 → **適用** | テストがUI仕様を正しく検証しているか |
| アクセシビリティ | a11yテストの品質 → **適用**     | WCAG基準のテストが十分か             |
| セキュリティ     | テストコードのみ → **適用外**   | -                                    |
| パフォーマンス   | テスト実行速度 → **限定的適用** | テスト実行時間が10秒以内か           |

### Electronデスクトップアプリ観点

| 観点                       | 適用判断                          | 確認項目                               |
| -------------------------- | --------------------------------- | -------------------------------------- |
| フロントエンド（Renderer） | UIコンポーネントテスト → **適用** | Renderer Process内のテスト品質が十分か |
| バックエンド（Main）       | テスト対象外 → **適用外**         | -                                      |
| IPC通信                    | Storeレベルでモック → **適用外**  | -                                      |
| Preload/セキュリティ       | テスト対象外 → **適用外**         | -                                      |
| ローカルストレージ         | テスト対象外 → **適用外**         | -                                      |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全テストが成功（100%）
- [ ] TypeScript型チェックがエラーなしで通過
- [ ] ESLintチェックがエラーなしで通過
- [ ] 3回連続実行で全て成功（フレイキーテストなし）
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）達成
- [ ] 品質レポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. TypeScript型チェックの実行
2. ESLintチェックの実行
3. テスト安定性確認（3回連続実行）
4. カバレッジ最終確認
5. 品質レポートの作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
