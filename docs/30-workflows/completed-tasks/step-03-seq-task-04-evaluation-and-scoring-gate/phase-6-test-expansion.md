# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| Phase名    | テスト拡充              |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 5                 |
| 後続Phase  | Phase 7                 |

## 目的

境界値、回帰観点、失敗観点を追加し、評価ゲートの信頼性を高める。

## 実行タスク

- タスク1: 閾値境界（59/60/79/80/100）のテストを追加する。
- タスク2: 再評価ループ（改善前後比較）のテストを追加する。
- タスク3: IPC失敗時のエラーサニタイズテストを追加する。
- タスク4: UI分岐の回帰テストを追加する。
- タスク5: Task03/05 往復導線の回帰テストを追加する。

## 参照資料

| 参照資料                 | パス                                                                                       | 目的                       |
| ------------------------ | ------------------------------------------------------------------------------------------ | -------------------------- |
| ScoreDisplayテスト       | `apps/desktop/src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx`               | 境界値テスト追加           |
| SkillAnalysisViewテスト  | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`          | UI回帰テスト追加           |
| ライフサイクル統合テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 往復導線回帰               |
| IPCセキュリティ仕様      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`             | 失敗系期待値               |
| 教訓仕様                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                     | 既存回帰パターン参照       |
| 依存Phase成果物          | phase-5-implementation.md（Phase 5）                                                       | Phase 5 の実装成果物を参照 |

## 実行手順

1. 境界値ケースを unit test へ追加する。
2. 再評価ループを integration test へ追加する。
3. エラーサニタイズ検証を ipc test へ追加する。
4. UI分岐ケースを component test へ追加する。
5. 全ケース実行後に失敗要因を分類する。

## 統合テスト連携

- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`
- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts`
- 検証観点: 境界値、再評価ループ、失敗時サニタイズ。

## 多角的チェック観点（AIが判断）

- 閾値境界で判定がぶれないか。
- 再評価前後でスコア比較が成立するか。
- エラー時に内部情報が漏れないか。

## サブタスク管理

| SubAgent   | 責務                  | 実行方式 | 出力                  |
| ---------- | --------------------- | -------- | --------------------- |
| SubAgent-A | 境界値テスト追加      | 並列     | boundary-test-log.md  |
| SubAgent-B | 再評価/導線テスト追加 | 並列     | lifecycle-test-log.md |
| SubAgent-C | 失敗系テスト追加      | 並列     | failure-test-log.md   |

## 成果物

| 成果物         | パス                                        | 内容           |
| -------------- | ------------------------------------------- | -------------- |
| テスト拡充仕様 | `./phase-6-test-expansion.md`               | 拡充対象と手順 |
| 回帰テスト一覧 | `outputs/phase-6/regression-test-matrix.md` | 追加ケース一覧 |

## 完了条件

- [x] 閾値境界テストが追加されている
- [x] 再評価ループテストが追加されている
- [x] IPC失敗系テストが追加されている
- [x] 既存テストと合わせて回帰がない

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 7（カバレッジ確認）で観点別の網羅率を監査する。
