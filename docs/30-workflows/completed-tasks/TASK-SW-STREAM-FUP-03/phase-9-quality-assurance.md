# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 9                         |
| Phase名    | 品質保証                  |
| 対象機能   | TASK-SW-STREAM-FUP-03     |
| 前提Phase  | Phase 8: リファクタリング |
| 次Phase    | Phase 10: 最終レビュー    |
| ステータス | 未実施                    |
| 作成日     | 2026-04-17                |

## 目的

lint / typecheck / test の品質ゲートを通過し、PR 前の品質基準を満たす。

## 品質ゲート実行コマンド

### 1. TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**確認ポイント**:

- `SkillCreatorProgressCallback` の型が各ワークフローメソッドの引数型と一致しているか
- フェーズ定数の `as const` が型推論に影響していないか

### 2. ESLint

```bash
pnpm --filter @repo/desktop lint
```

**確認ポイント**:

- 未使用変数（フェーズ定数のうちいずれかが未使用）がないか
- `any` 型の使用がないか

### 3. 全テスト実行

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"
```

**確認ポイント**:

- 既存14テストが全件 PASS
- 新規 TC-01〜TC-25 が全件 PASS
- テスト実行時に SIGKILL が発生しないか（メモリ制約）

### 4. 型チェック（packages/shared 関連）

```bash
pnpm --filter @repo/shared build
```

`packages/shared` に変更がない場合はスキップ可。

## 品質ゲート判定基準

| チェック項目         | 合格基準                      |
| -------------------- | ----------------------------- |
| TypeScript typecheck | エラー 0 件                   |
| ESLint               | エラー 0 件（warning は許容） |
| 全テスト             | PASS 100%（SKIP なし）        |
| カバレッジ           | Phase 7 目標値を維持          |

## BLOCKED 対応方針

| 問題                              | 対応                                                       |
| --------------------------------- | ---------------------------------------------------------- |
| typecheck エラー（型不一致）      | Phase 2 設計に戻り型定義を修正する                         |
| lint エラー（未使用フェーズ定数） | 未使用定数を削除またはテストを追加してカバーする           |
| テスト FAIL（既存14件）           | Phase 5 実装に戻り `create` モード回帰を修正する           |
| テスト FAIL（新規テスト）         | Phase 5 実装を確認し progress flow 定義・helper を修正する |

## 実行タスク

既存成果物と前後 Phase の差分を照合する。

- 受入条件と実装結果の整合を確認する。
- 必要な修正を後続 Phase へ引き継ぐ。

## 参照資料

- `artifacts.json`
- `outputs/artifacts.json`
- 関連する前後 Phase の成果物

## 統合テスト連携

- 検証結果は後続 Phase の品質ゲートへ引き継ぐ。
- 自動テスト結果と矛盾しないことを確認する。

## 成果物

| 成果物                                  | パス                                                      |
| --------------------------------------- | --------------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-quality-report.md | `outputs/phase-9/TASK-SW-STREAM-FUP-03-quality-report.md` |

## 完了条件

- [ ] TypeScript typecheck がエラー 0 件で通過した
- [ ] ESLint がエラー 0 件で通過した
- [ ] 全テストが PASS 100% を達成した
- [ ] 品質ゲート結果をレポートに記録した
- [ ] 成果物が生成されている

## タスク100%実行確認【必須】

- [ ] typecheck を実行した
- [ ] lint を実行した
- [ ] 全テストを実行した
- [ ] 品質ゲートの合否を記録した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
