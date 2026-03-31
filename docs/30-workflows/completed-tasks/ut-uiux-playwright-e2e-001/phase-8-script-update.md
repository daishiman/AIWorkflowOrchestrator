# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 8                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

Layer 1/2 テストコードの重複・navigation drift を削除し、`evaluate-ui-ux-playwright-e2e.ts` を `test-targets.config.ts` 駆動へリファクタリングする。全変更を Before/After/理由テーブルで記録する。

## 実行タスク

- 既存スクリプトの現状確認を行う
- `test-targets.config.ts` を import するように更新する
- ハードコードされた multi_select 前提を `TEST_TARGETS` 駆動へ書き換える
- `.agents/skills/` への mirror 同期を行う
- Layer 1 / Layer 2 の重複ロジックを整理する
- helper 関数の命名と責務を整える（selector / snapshot / navigation の責務境界）
- フレークしやすい箇所を最小化する
- 全変更を Before/After/理由テーブルで記録する

## 参照資料

| 資料名           | パス                                                                                               | 説明           |
| ---------------- | -------------------------------------------------------------------------------------------------- | -------------- |
| Phase 4 共通基盤 | [phase-4-impl-config.md](phase-4-impl-config.md)                                                   | 設定の正本     |
| Phase 5 / 6      | [phase-5-impl-layer1.md](phase-5-impl-layer1.md), [phase-6-impl-layer2.md](phase-6-impl-layer2.md) | 参照される実装 |
| スクリプト       | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`               | 更新対象       |

## 実行手順

1. 現状スクリプトを確認する。
2. `TEST_TARGETS` へ置き換える。
3. `.agents` mirror を同期する。
4. 型チェックを通す。
5. 変更内容を以下の形式で `outputs/phase-8/refactoring-record.md` に記録する:

| 対象                            | Before              | After                      | 理由             |
| ------------------------------- | ------------------- | -------------------------- | ---------------- |
| （例）M11-1〜M11-4 ハードコード | `const M11_1 = ...` | `TEST_TARGETS.filter(...)` | 設定駆動化のため |

## 統合テスト連携

- Phase 4 で定義した共通契約を前提にする
- Phase 9 で統合テストを再実行する

## 多角的チェック観点（AIが判断）

| 観点             | 確認内容                                             |
| ---------------- | ---------------------------------------------------- |
| 構造分解         | ハードコードと設定の責務が分離されているか           |
| システム         | `.claude` と `.agents` の mirror parity が保たれるか |
| 問題解決         | 既存スクリプトの再利用を捨てるべきか判断できているか |
| リファクタリング | Before/After/理由テーブルが全変更をカバーしているか  |
| 改善思考         | 最小変更で最大の重複削減になっているか               |

## サブタスク管理

1. 現状確認
2. import 更新
3. ハードコード除去
4. mirror 同期
5. 型チェック

## 成果物

| 成果物               | パス                                                                                 | 説明                      |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| 更新スクリプト       | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 動的設定対応              |
| mirror スクリプト    | `.agents/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 正本同期                  |
| 実行サマリー         | `outputs/phase-8/script-update-summary.md`                                           | 更新結果の記録            |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`                                              | Before/After/理由テーブル |

## 完了条件

- [ ] `TEST_TARGETS` を参照するようにスクリプトが更新されている
- [ ] ハードコードされた M11 系の前提が残っていない
- [ ] `.agents` mirror が同期されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] スクリプトの入出力が Phase 4 の契約に一致している
- [ ] mirror 差分が残っていない
- [ ] TypeScript エラーがない

## 次のPhase

Phase 9: 品質保証
