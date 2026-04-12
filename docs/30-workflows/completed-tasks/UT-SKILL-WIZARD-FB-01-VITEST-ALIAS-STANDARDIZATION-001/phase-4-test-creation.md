# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 4                                                                     |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 3                                                               |
| 後続Phase  | Phase 5                                                               |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

`@repo/shared` エイリアス経由のインポートが vitest で正常解決されることを検証する
テストを設計・実行し、Red（失敗）→ Green（成功）サイクルを確認する。

## Private Method テスト方針

本タスクは設定ファイル変更であり、テスト対象に private method は存在しない。
`pnpm --filter @repo/shared test` による統合実行で AC を検証する。

## Phase 4 事前確認: 既存ユーティリティ重複検出

```bash
# @repo/shared インポートを含む既存テストファイルを確認
grep -rn "@repo/shared" packages/shared/src --include="*.test.ts"
grep -rn "@repo/shared" packages/shared --include="*.test.ts"
```

## テストマトリクス

| TC番号 | テスト名                                            | 対象                | 期待結果 |
| ------ | --------------------------------------------------- | ------------------- | -------- |
| TC-1   | @repo/shared からのインポートが vitest で解決できる | vitest resolve設定  | PASS     |
| TC-2   | 既存の全テストファイルが PASS する                  | packages/shared全体 | 全PASS   |
| TC-3   | vitest.config.ts に resolve.alias が存在する        | 設定ファイル確認    | PASS     |

## テスト検証コマンド

```bash
# TC-1/TC-2: 全テスト実行
pnpm --filter @repo/shared test

# TC-3: resolve.alias 設定の静的チェック
grep -n "\"@repo/shared\"" packages/shared/vitest.config.ts

# verbose出力で詳細確認
pnpm --filter @repo/shared test --reporter=verbose
```

## Red テスト実行手順（事前確認用）

Phase 5（実装）前に alias 設定を一時削除して Red を確認する場合:

```bash
# 1. vitest.config.ts から resolve.alias を一時削除
# 2. @repo/shared import を含むテストを実行
pnpm --filter @repo/shared test

# 3. 期待されるエラー
# Error: Cannot find module '@repo/shared'
```

**注意**: 実装は既に完了しているため、本フローは確認用の参考手順として記録する。

## IPC レスポンス形式

本タスクはIPCを含まないため N/A。

## 参照資料

| 資料名       | パス                                 | 用途           |
| ------------ | ------------------------------------ | -------------- |
| 設計書       | `outputs/phase-2/design-document.md` | Phase 2 成果物 |
| 設計レビュー | `outputs/phase-3/gate-decision.md`   | Phase 3 成果物 |

## 実行手順

1. `@repo/shared` インポートを含む既存テストを特定する
2. `pnpm --filter @repo/shared test` を実行して Red/Green を記録する
3. テストマトリクスの各 TC を検証する
4. 成果物を outputs/phase-4/ に出力する

## 統合テスト連携

- 全テスト PASS を `pnpm --filter @repo/shared test` で確認
- `packages/shared/vitest.config.ts` の設定が実際に機能していることを確認

## 多角的チェック観点

| 観点       | 確認内容                                                       |
| ---------- | -------------------------------------------------------------- |
| 網羅性     | @repo/shared import を含む全テストファイルが対象に入っているか |
| 命名一貫性 | テスト名が AC番号と対応しているか                              |

## 成果物

| 成果物       | パス                                    | 説明                      |
| ------------ | --------------------------------------- | ------------------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テストマトリクスと手順    |
| Red結果      | `outputs/phase-4/red-test-result.md`    | alias未設定時のエラー記録 |

## 完了条件

- [x] テストマトリクスの TC-1〜TC-3 が定義済み
- [x] 検証コマンドが確定している
- [x] テスト仕様書が成果物として記録されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 既存テストの確認（完了）
2. テストマトリクス作成（完了）
3. 検証コマンド定義（完了）
4. 成果物出力（完了）

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

Phase 5: 実装
