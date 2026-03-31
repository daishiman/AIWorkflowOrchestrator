# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 4                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

テスト契約（型定義・テストID・期待値）を確定し、TDD Red の前提を固定する。
`test-targets.config.ts` の型定義と初期対象 7 画面を確定することが、
SEM-001〜007 / VIS-001〜007 の「期待値仕様書」に相当する。
`playwright.config.ts`・`helpers.ts`・`global-setup.ts` はテスト実行の共通基盤として整備する。

## 実行タスク

- Phase 1〜3 で確認した命名規則（camelCase / kebab-case）との整合を確認する
- SEM-001〜007 の expected result（期待する ARIA 属性・動作）を `semanticTargets` 型で明文化する
- VIS-001〜007 の expected result（対象画面・閾値）を `TEST_TARGETS` 初期定義で確定する
- `playwright.config.ts` に `ui-ux-layer1` / `ui-ux-layer2` プロジェクトを追加する
- `apps/desktop/e2e/ui-ux/` ディレクトリを作成する
- `test-targets.config.ts` に型定義と初期対象 7 画面を定義する
  - 初期対象 7 件は Phase 1 の `FR-004` と 1:1 対応させる
- `helpers.ts` にナビゲーション補助と共通ユーティリティを実装する
- `global-setup.ts` に `ANTHROPIC_API_KEY` のダミー設定を入れる

## 参照資料

| 資料名            | パス                                                             | 説明                    |
| ----------------- | ---------------------------------------------------------------- | ----------------------- |
| Phase 2 設計      | [phase-2-design.md](phase-2-design.md)                           | 契約とディレクトリ構成  |
| Phase 3 実装計画  | [phase-3-implementation-plan.md](phase-3-implementation-plan.md) | 責務分割と依存関係      |
| 既存 E2E ヘルパー | `apps/desktop/e2e/helpers/electron-app.ts`                       | Electron 起動の再利用元 |
| 既存 E2E モック   | `apps/desktop/e2e/mocks/electronAPI.mock.ts`                     | AI 呼び出しのモック元   |

## 実行手順

1. Playwright project の追加と testMatch を確定する。
2. `test-targets.config.ts` を作成し、7 画面の初期定義と `semanticTargets` を入れる。
   - 7 画面は Phase 1 の `FR-004` へ対応づける。
3. `helpers.ts` と `global-setup.ts` を実装し、共通起動・ダミー API key を整える。
4. `pnpm --filter @repo/desktop typecheck` 相当で型整合を確認する。

## 統合テスト連携

- Phase 5 / 6 / 8 は Phase 4 完了後に並列実行可能
- Phase 7 の baseline 生成は Phase 5 / 6 の完了後に実行する

## 多角的チェック観点（AIが判断）

| 観点             | 確認内容                                                  |
| ---------------- | --------------------------------------------------------- |
| UI/UX            | 設定と実行ロジックが分離されているか                      |
| アクセシビリティ | Layer 1 の検証対象が `semanticTargets` で表現されているか |
| セキュリティ     | API key のダミー化がテスト専用に閉じているか              |
| システム         | 共通基盤の責務が Phase 5/6 と混ざっていないか             |
| TDD              | テスト契約が Phase 5/6 の実装前に固定されているか         |

## サブタスク管理

1. Playwright project 追加
2. `test-targets.config.ts` 作成
3. `helpers.ts` 作成
4. `global-setup.ts` 更新
5. 型チェック確認

## 成果物

| 成果物       | パス                                            | 説明               |
| ------------ | ----------------------------------------------- | ------------------ |
| 設定実装     | `apps/desktop/playwright.config.ts`             | UI/UX project 追加 |
| 対象設定     | `apps/desktop/e2e/ui-ux/test-targets.config.ts` | 7 画面の初期定義   |
| 共通ヘルパー | `apps/desktop/e2e/ui-ux/helpers.ts`             | 共通処理           |
| 起動設定     | `apps/desktop/e2e/global-setup.ts`              | ダミー API key     |
| 実装サマリー | `outputs/phase-4/implementation-summary.md`     | 実施内容の記録     |

## 完了条件

- [ ] `ui-ux-layer1` / `ui-ux-layer2` が Playwright 設定に追加されている
- [ ] `test-targets.config.ts` の初期対象 7 画面と `semanticTargets` が定義されている
- [ ] `helpers.ts` と `global-setup.ts` が型チェックを通る
- [ ] Phase 5 / 6 で参照できる共通契約が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 共通基盤ファイルの作成が完了している
- [ ] 追加した設定ファイルが Phase 5 / 6 の前提になっている
- [ ] `test-targets.config.ts` の所有権が Phase 4 に固定されている

## 次のPhase

Phase 5: 実装
