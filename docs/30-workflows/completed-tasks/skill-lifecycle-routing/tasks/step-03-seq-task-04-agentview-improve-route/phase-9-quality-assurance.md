# Phase 9: 品質検証

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| フェーズ | Phase 9                              |
| 機能名   | agentview-improve-route              |
| 作成日   | 2026-03-17                           |
| 依存     | Phase 8 成果物（outputs/phase-8/）   |

## 目的

Lint・TypeScript 型チェック・全テスト実行を通じて、リリース品質に達していることを確認する。

## 実行タスク

### Task 1: Lint チェック

- [ ] `pnpm --filter @repo/desktop lint` を実行
- [ ] ESLint エラーがゼロであることを確認
- [ ] 警告（warning）があれば内容を記録し、無視可能かどうかを判断
- [ ] 自動修正できる警告は `pnpm --filter @repo/desktop lint --fix` で修正

### Task 2: TypeScript 型チェック

- [ ] `pnpm --filter @repo/desktop typecheck` を実行
- [ ] 型エラーがゼロであることを確認
- [ ] `@ts-ignore` / `@ts-expect-error` の使用がないことを確認
- [ ] `any` 型の使用がないことを確認（strict モード）

### Task 3: 共有パッケージの型チェック

- [ ] `pnpm --filter @repo/shared typecheck` を実行（shared に変更がある場合）
- [ ] 型エラーがゼロであることを確認

### Task 4: 全テスト実行

- [ ] `pnpm --filter @repo/desktop test` を実行
- [ ] 全テストが PASS することを確認
- [ ] スキップされたテスト（`.skip`）がある場合、理由と Issue/TODO が記録されているか確認

### Task 5: ビルド確認

- [ ] `pnpm --filter @repo/desktop build` を実行（または `tsc --noEmit`）
- [ ] ビルドエラーがゼロであることを確認

### Task 6: 問題発生時の対応

- [ ] Lint エラーが発生した場合 → 修正して再実行
- [ ] 型エラーが発生した場合 → Phase 8 に戻り修正
- [ ] テスト失敗が発生した場合 → Phase 5 または Phase 6 に戻り修正
- [ ] 全て解消されるまで繰り返す

## 参照資料

- Phase 8 成果物: `outputs/phase-8/`
- コード品質ルール: `.claude/rules/02-code-quality.md`

## 実行手順

1. `pnpm lint` → `pnpm typecheck` → `pnpm test` の順に実行
2. エラーが発生した場合は修正して再実行
3. 全て PASS したら結果を記録して Phase 10 へ

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

```
outputs/phase-9/
  lint-result.txt        # lint 実行ログ
  typecheck-result.txt   # typecheck 実行ログ
  test-result.txt        # test 実行ログ（PASS数・FAIL数・スキップ数）
  qa-summary.md          # 品質検証サマリー（全PASS確認）
```

## 完了条件

- [ ] `pnpm lint` がエラーゼロ
- [ ] `pnpm typecheck` がエラーゼロ
- [ ] `pnpm test` が全 PASS（スキップがある場合は理由が記録済み）
- [ ] ビルドがエラーゼロ
- [ ] **本Phase内の全タスクを100%実行完了**

## 次 Phase

→ Phase 10: 最終レビュー
