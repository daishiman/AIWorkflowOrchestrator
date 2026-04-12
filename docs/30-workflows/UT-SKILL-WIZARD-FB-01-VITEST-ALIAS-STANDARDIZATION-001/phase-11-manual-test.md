# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 11                                                                    |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 10                                                              |
| 後続Phase  | Phase 12                                                              |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

設定ファイル変更の手動検証を実施し、
実際の開発フロー（ESLint フック → テスト実行）での動作を確認する。

## タスク種別判定

| 項目                   | 判定               |
| ---------------------- | ------------------ |
| UI変更                 | なし（NON_VISUAL） |
| 設定変更               | あり               |
| スクリーンショット要否 | 不要（NON_VISUAL） |

## 手動テスト計画

| TC番号 | シナリオ                                      | 手順                                      | 期待結果         |
| ------ | --------------------------------------------- | ----------------------------------------- | ---------------- |
| MT-01  | vitest 直接実行で @repo/shared が解決される   | `pnpm --filter @repo/shared test`         | 全テスト PASS    |
| MT-02  | ESLint フック後のファイルでテストが解決される | ESLint 実行後に `pnpm test`               | テスト PASS      |
| MT-03  | resolve.alias の設定内容が正しい              | `cat packages/shared/vitest.config.ts`    | alias が設定済み |
| MT-04  | CI環境シミュレーションでテストが PASS         | `CI=true pnpm --filter @repo/shared test` | 全テスト PASS    |

## 手動テスト実行手順

```bash
# MT-01: vitest 直接実行
pnpm --filter @repo/shared test

# MT-02: ESLint フック後のテスト確認
# (1) テストファイル内のインポートを @repo/shared 形式に変換
# (2) vitest を実行
pnpm --filter @repo/shared test

# MT-03: 設定確認
cat packages/shared/vitest.config.ts | grep -A 5 "resolve"

# MT-04: CI シミュレーション
CI=true pnpm --filter @repo/shared test
```

## Semantic / Visual / AI UX 評価

| 評価種別 | 対象                | 結果                               |
| -------- | ------------------- | ---------------------------------- |
| Semantic | resolve.alias 設定  | ✅ @repo/shared が正しく解決される |
| Visual   | N/A（設定ファイル） | NON_VISUAL                         |
| AI UX    | N/A（設定ファイル） | NON_VISUAL                         |

## スクリーンショット

NON_VISUAL タスクのためスクリーンショットは不要。
代わりに CLI 出力をテキスト証跡として記録する。

```
# 期待される CLI 出力（例）
PASS  src/services/smartDefaultReasoningService.test.ts
PASS  src/services/__tests__/...
...
Test Files  X passed (X)
Tests       X passed (X)
```

## フィードバックループ

Phase 11 で発見された HIGH 問題: **なし**

## 参照資料

| 資料名           | パス                                      | 用途            |
| ---------------- | ----------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10 成果物 |

## 実行手順

1. MT-01〜MT-04 の手動テストを実行する
2. 全テストが PASS することを確認する
3. 手動テスト結果を outputs/phase-11/ に出力する

## 統合テスト連携

```bash
pnpm --filter @repo/shared test --reporter=verbose
```

## 成果物

| 成果物         | パス                                     | 説明                    |
| -------------- | ---------------------------------------- | ----------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | MT-01〜MT-04 の実行結果 |

## 完了条件

- [x] MT-01〜MT-04 が全て PASS
- [x] NON_VISUAL の理由が記録されている
- [x] HIGH 問題なし（または全て unassigned-task として記録済み）

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001
```

## 次のPhase

Phase 12: ドキュメント更新
