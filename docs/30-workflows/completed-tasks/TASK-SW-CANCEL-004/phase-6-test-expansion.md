# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 6                                                      |
| タスクID | TASK-SW-CANCEL-004                                     |
| 前Phase  | [phase-5-implementation.md](phase-5-implementation.md) |
| 次Phase  | [phase-7-coverage.md](phase-7-coverage.md)             |
| 目的     | エッジケースと回帰テストを拡充する                     |

## 目的

エッジケースと回帰テストを拡充する。

## 実行タスク

### タスク1: エッジケース拡充

**目的**: cancel hook の分岐と再入パスを網羅する。

**実行手順**:

1. TC-EDGE-01〜04 を定義する。
2. 実装変更の有無に応じて必要なテストを追加する。
3. null-safe と二重呼び出し系の分岐を検証する。

**期待される成果物**:

- エッジケース拡充計画
- 追加テスト一覧

### タスク2: 修正起点の回帰確認

**目的**: Phase 5 の修正があった場合の回帰観点を閉じる。

**実行手順**:

1. パターン A/B/C に対応する回帰テストを選定する。
2. テスト追加後に targeted test を再実行する。

**期待される成果物**:

- 回帰テスト結果

## 拡充対象テスト

### エッジケーステスト

| TC         | 観点                                                                | 期待結果                                        |
| ---------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| TC-EDGE-01 | `cancelGeneration()` の二重呼び出し（連続 2 回）                    | 2 回目は副作用なく完了                          |
| TC-EDGE-02 | `window.skillCreatorAPI` が undefined の場合の `cancelGeneration()` | 例外 throw なし                                 |
| TC-EDGE-03 | `startGeneration()` を呼ばずに `cancelGeneration()` を呼ぶ          | 例外 throw なし（AbortController が null 安全） |
| TC-EDGE-04 | `cancelGeneration()` 後に再度 `startGeneration()` を呼ぶ            | 新しい AbortController が生成される             |

### 回帰テスト

Phase 5 で修正を行った場合（パターン A/B/C）に対応する回帰テストを追加する：

- パターン A（ALLOWED_INVOKE_CHANNELS 追加）: `channels.ts` に `SKILL_CREATOR_CANCEL` が含まれることを確認するテスト
- パターン B（AbortSignal consumer 追加）: signal が consumer に渡されていることを確認するテスト
- パターン C（UI バインディング追加）: ボタン click が IPC invoke を呼ぶことを確認するテスト

## 拡充実行

```bash
# エッジケーステスト追加後の確認
pnpm --filter @repo/desktop test -- useCancelGeneration
```

## 参照資料

- `docs/30-workflows/TASK-SW-CANCEL-004/phase-4-test-creation.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-5-implementation.md`
- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`

## 成果物

| 成果物               | パス                                          |
| -------------------- | --------------------------------------------- |
| エッジケース拡充計画 | `outputs/phase-6/edge-case-expansion-plan.md` |

## 統合テスト連携

- Phase 7 の coverage 80% 基準を満たすための補完テストとして扱う。
- 追加テストは targeted test 実行系に統合し、Phase 9 の品質ゲートへ引き継ぐ。

## 完了条件

- [ ] TC-EDGE-01〜04 が定義・実装されている
- [ ] Phase 5 の修正内容に対応する回帰テストが追加されている（修正があった場合）
- [ ] 拡充後のテストが全 pass
