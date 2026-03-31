# Phase 5: 実装

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 5                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

`TEST_TARGETS` を読み取り専用で利用しながら、Layer 1 Semantic テスト（SEM-001〜007）を実装する。Phase 4 のテスト契約（`TEST_TARGETS` 型）を前提に、SubAgent-B として Layer 1 Semantic テストを実装する。本 Phase は SubAgent-A（設定・共通: Phase 4 完了）に依存する。

## 実行タスク

- 実装対象ファイル（新規）: `apps/desktop/e2e/ui-ux/layer1-semantic.spec.ts`
- `layer1-semantic.spec.ts` のスケルトンを作成する
- SEM-001〜007 の各検証ロジックを実装する
- `TEST_TARGETS` を参照して動的に `test.describe` を生成する
- `semanticTargets` に基づいて ARIA / フォーカス / キーボードの検証を行う

## 参照資料

| 資料名            | パス                                             | 説明                      |
| ----------------- | ------------------------------------------------ | ------------------------- |
| Phase 4 共通基盤  | [phase-4-impl-config.md](phase-4-impl-config.md) | 参照専用の契約            |
| Phase 2 設計      | [phase-2-design.md](phase-2-design.md)           | `TestTarget` 型と設計方針 |
| 既存 E2E ヘルパー | `apps/desktop/e2e/helpers/electron-app.ts`       | Electron 起動の再利用元   |

## 実行手順

1. `layer1-semantic.spec.ts` を `TEST_TARGETS` 駆動で構成する。
2. SEM-001〜007 を target ごとに実装する。
3. `playwright` の locator と keyboard 操作で実測する。
4. Phase 4 の `test-targets.config.ts` を変更せずに完了させる。

## 統合テスト連携

- Phase 6 と並列実行可能
- Phase 7 の baseline 生成の前提となる

## 多角的チェック観点（AIが判断）

| 観点             | 確認内容                                                       |
| ---------------- | -------------------------------------------------------------- |
| アクセシビリティ | role / aria-label / aria-describedby が実測されているか        |
| UI/UX            | Tab / Shift+Tab の移動順が視覚順と整合するか                   |
| システム         | `test-targets.config.ts` を読み取り専用で扱っているか          |
| 問題解決         | エラー時の通知系（`aria-live` / `role=alert`）が漏れていないか |

## サブタスク管理

1. スケルトン作成
2. SEM-001〜003
3. SEM-004〜005
4. SEM-006〜007
5. 参照専用化確認

## 成果物

| 成果物          | パス                                             | 説明           |
| --------------- | ------------------------------------------------ | -------------- |
| Semantic テスト | `apps/desktop/e2e/ui-ux/layer1-semantic.spec.ts` | Layer 1 実装   |
| 実装サマリー    | `outputs/phase-5/semantic-summary.md`            | 実装内容の記録 |

## 完了条件

- [ ] SEM-001〜007 が実装されている
- [ ] `TEST_TARGETS` を読み取り専用で利用している
- [ ] `test-targets.config.ts` を Phase 5 で更新していない
- [ ] タグ別の `test.describe` が動的生成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Layer 1 の全テストケースが実装されている
- [ ] Phase 4 との責務境界が崩れていない
- [ ] 変更内容が `semanticTargets` 契約に依存している

## 次のPhase

Phase 6: テスト拡充
