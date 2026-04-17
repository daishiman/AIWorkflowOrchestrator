# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 8                                |
| 後続Phase  | Phase 10                               |
| 作成日     | 2026-04-15                             |
| ステータス | pending                                |

## 目的

lint・typecheck・全テストを通過させ、CI に相当する品質基準を満たすことを確認する。

## 実行タスク

- lint の実行と確認
- TypeScript 型チェックの実行と確認
- 全テストの実行と確認
- ビルドの確認
- 品質レポートの作成

## 実行手順

### 1. lint の実行

```bash
pnpm --filter @repo/desktop lint
# 期待: 0 error・0 warning（警告がある場合は内容を確認）
```

### 2. TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
# 期待: 0 error
```

### 3. 全テストの実行

```bash
# 本タスクのテスト
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts
# 期待: TC-01〜TC-12 全 PASS

# 関連テストの全件実行
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
# 期待: 全 PASS（回帰なし）

# 全テスト実行
pnpm --filter @repo/desktop exec vitest run
# 期待: 全 PASS
```

### 4. ビルドの確認

```bash
pnpm --filter @repo/desktop build
# 期待: ビルド成功（エラーなし）
```

### 5. 品質ゲート判定

| チェック項目       | 基準                 | 結果    |
| ------------------ | -------------------- | ------- |
| lint               | 0 error              | pending |
| typecheck          | 0 error              | pending |
| テスト（本タスク） | TC-01〜TC-12 全 PASS | pending |
| テスト（全体）     | 回帰なし             | pending |
| ビルド             | 成功                 | pending |

**全項目 PASS の場合のみ Phase 10 へ進む。**

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認。

| 判定項目        | 基準       | 結果    |
| --------------- | ---------- | ------- |
| 統合テスト PASS | 全件 PASS  | pending |
| 型チェック PASS | 0 error    | pending |
| ビルド PASS     | ビルド成功 | pending |

## 多角的チェック観点

| 観点       | チェック内容                                           |
| ---------- | ------------------------------------------------------ |
| CI 再現性  | ローカルで CI 相当のチェックを全て実行しているか       |
| 回帰確認   | 本タスク以外のテストへの影響がないことを確認しているか |
| ビルド確認 | 実装変更がビルドエラーを引き起こしていないか           |

## 成果物

| 成果物           | パス                                | 説明                                      |
| ---------------- | ----------------------------------- | ----------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | lint・typecheck・テスト・ビルドの結果記録 |

## 完了条件

- [ ] `pnpm lint` が 0 error
- [ ] `pnpm typecheck` が 0 error
- [ ] 本タスクのテスト（TC-01〜TC-12）が全 PASS
- [ ] 全テストが回帰なしで PASS
- [ ] `pnpm build` が成功
- [ ] 品質レポートが `outputs/phase-9/quality-report.md` に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. lint 実行と確認
2. TypeScript 型チェック実行と確認
3. 本タスクのテスト実行確認
4. 全テスト実行確認（回帰なし）
5. ビルド確認
6. 品質ゲート判定
7. 品質レポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 10: 最終レビューゲート
