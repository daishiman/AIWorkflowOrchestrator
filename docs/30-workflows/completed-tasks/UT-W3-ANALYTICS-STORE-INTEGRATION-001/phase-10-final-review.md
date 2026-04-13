# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 10                                             |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| 機能名     | renderer analytics slice / SkillAnalytics 連携 |
| 前提Phase  | Phase 9                                        |
| 後続Phase  | Phase 11（PASS / MINOR の場合）                |
| 作成日     | 2026-04-13                                     |
| ステータス | pending                                        |

## 目的

acceptance criteria と blocker を判定する。
Phase 1〜9 の全成果物を統合的にレビューし、受入基準（AC-1〜AC-4）の充足を最終確認する。
MINOR 指摘は未タスク化し、MAJOR は戻りフェーズを確定する。

## 実行タスク

### T-10-1: 全受入基準（AC-1〜AC-4）の検証

| AC番号 | 基準                                                                         | 検証方法                                                              | 判定 |
| ------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---- |
| AC-1   | スキル実行の開始・完了・エラーが自動的に `analyticsAdapter` へ送信されること | テスト PASS（trackSkillStart / trackSkillComplete / trackSkillError） | -    |
| AC-2   | renderer-side `analyticsSlice` が Zustand slice として実装されていること     | コードレビュー（`analyticsSlice.ts` の実装確認）                      | -    |
| AC-3   | 既存の `trackEvent` 公開 API シグネチャが変更されないこと                    | grep 確認（シグネチャ比較）                                           | -    |
| AC-4   | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること                  | CI 確認（全コマンド PASS）                                            | -    |

**検証コマンド**:

```bash
# AC-3: trackEvent シグネチャ確認
grep -n "export function trackEvent\|export type SkillWizardEvents" apps/desktop/src/renderer/utils/trackEvent.ts

# AC-4: 全体チェック
pnpm typecheck && pnpm lint && \
  pnpm --filter @repo/desktop test -- --run \
    apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

### T-10-2: MAJOR / MINOR 判定

| 判定  | 条件                                                              | 戻り先                                 |
| ----- | ----------------------------------------------------------------- | -------------------------------------- |
| MAJOR | AC 未達、テスト失敗、循環依存あり                                 | 問題のある Phase に戻る                |
| MINOR | 命名微修正、コメント追加等（機能に影響なし・Phase 12 で解消可能） | Phase 11（MINOR 未タスク化を同時実施） |
| PASS  | 全 AC 達成、テスト全 PASS                                         | Phase 11                               |

### T-10-3: MINOR 指摘の未タスク化（Phase 12 scope-out 候補を backlog へ）

MINOR 判定の指摘事項は以下の 3 ステップで未タスク化する：

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に未タスク参照リンクを追加

MINOR 指摘がない場合は「指摘なし」と記録する。

## Phase横断成果物一貫性チェック

| Phase | 主な成果物                | 一貫性確認項目                                 | 判定    |
| ----- | ------------------------- | ---------------------------------------------- | ------- |
| 1     | acceptance-criteria.md    | AC-1〜AC-4 が仕様に反映されているか            | pending |
| 2     | design.md                 | 実装コードが設計と一致しているか               | pending |
| 3     | design-review-result.md   | MINOR 指摘が追跡・解消されているか             | pending |
| 4     | テストコード              | テスト名と仕様番号が対応しているか             | pending |
| 5     | analyticsSlice.ts（実装） | analyticsSlice + analyticsAdapter 直送実装済み | pending |
| 6     | テストコード（拡張）      | エッジケーステストが追加されているか           | pending |
| 7     | coverage-report.md        | カバレッジ目標達成                             | pending |
| 8     | refactoring-result.md     | 変更なし or Before/After 記録済み              | pending |
| 9     | qa-result.md              | 品質ゲート全項目 PASS                          | pending |

## 参照資料

| 資料名           | パス                                                       | 用途               |
| ---------------- | ---------------------------------------------------------- | ------------------ |
| Phase 1 要件定義 | `outputs/phase-1/acceptance-criteria.md`                   | AC 確認            |
| Phase 3 レビュー | `outputs/phase-3/design-review-result.md`                  | MINOR 追跡確認     |
| Phase 9 品質保証 | `outputs/phase-9/qa-result.md`                             | 品質ゲート結果確認 |
| 実装ファイル     | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` | 最終コード確認     |
| 型定義ファイル   | `packages/shared/src/types/skill-analytics.ts`             | 型定義確認         |

## 成果物

| 成果物           | パス                                      | 説明                                         |
| ---------------- | ----------------------------------------- | -------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR 判定・AC 充足確認・指摘事項 |
| AC 検証レポート  | `outputs/phase-10/ac-verification.md`     | AC-1〜AC-4 の個別検証結果                    |

## 完了条件

- [ ] T-10-1: AC-1〜AC-4 が全て充足されていること
- [ ] T-10-2: 総合判定（PASS / MINOR / MAJOR）が記録されている
- [ ] T-10-3: MINOR 指摘があれば未タスク化 3 ステップを実施済み
- [ ] Phase 横断成果物の一貫性チェック完了
- [ ] `outputs/phase-10/final-review-result.md` が作成済み
- [ ] `outputs/phase-10/ac-verification.md` が作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. T-10-1: 受入基準（AC-1〜AC-4）の検証
2. T-10-2: MAJOR / MINOR / PASS 判定の記録
3. T-10-3: MINOR 指摘の未タスク化（該当する場合）
4. Phase 横断成果物一貫性チェック
5. 最終レビュー結果・AC 検証レポートの作成

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 11: 手動テスト（PASS または MINOR の場合）
対象 Phase へ戻る（MAJOR の場合）
