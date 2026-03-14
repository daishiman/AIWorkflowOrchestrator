# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| Phase名    | テスト作成              |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 1, 2, 3           |
| 後続Phase  | Phase 5                 |

## 目的

評価計算、ゲート判定、導線分岐、再評価導線を検証するテスト仕様を先に固定する。

## 実行タスク

- タスク1: スコア計算の単体テストケースを作成する。
- タスク2: ゲート判定の境界値テストケースを作成する。
- タスク3: Task03/05 連携の統合テストケースを作成する。
- タスク4: 画面表示と導線分岐のUIテストケースを作成する。
- タスク5: 失敗系（入力不正、評価失敗、サニタイズ）テストケースを作成する。

## 参照資料

| 参照資料                | パス                                                                                                  | 目的                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| ScoreDisplayテスト      | `apps/desktop/src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx`                          | スコア境界の既存検証を再利用 |
| SkillAnalysisViewテスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`                     | 評価UIフローを再利用         |
| Hookテスト              | `apps/desktop/src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`                       | 状態遷移を再利用             |
| IPC契約                 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`             | API契約の期待値を確認        |
| セキュリティ契約        | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`                        | 失敗系の期待値を確認         |
| 依存Phase成果物         | phase-1-requirements.md（Phase 1）, phase-2-design.md（Phase 2）, phase-3-design-review.md（Phase 3） | Phase 1〜3 の確定内容を参照  |

## 実行手順

1. Phase 2 の設計マトリクスをテストID付きで展開する。
2. 単体・統合・UIの 3 レーンでテスト仕様を分割する。
3. 正常系、境界系、異常系の期待結果を明示する。
4. 期待結果を Phase 5 実装タスクへ引き渡す。

## 統合テスト連携

- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`
- 想定コマンド: `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts`
- Phase 5 では Red から Green への遷移をこのテスト仕様で管理する。

## 多角的チェック観点（AIが判断）

- 3軸評価がテストケースで欠けずに検証されるか。
- ゲート閾値境界が全件テスト化されているか。
- Task03/05 の連携がテストで確認できるか。

## サブタスク管理

| SubAgent   | 責務                | 実行方式 | 出力                      |
| ---------- | ------------------- | -------- | ------------------------- |
| SubAgent-A | 単体テスト設計      | 並列     | unit-test-plan.md         |
| SubAgent-B | 統合テスト設計      | 並列     | integration-test-plan.md  |
| SubAgent-C | UI/失敗系テスト設計 | 並列     | ui-and-error-test-plan.md |

## 成果物

| 成果物     | パス                           | 内容                     |
| ---------- | ------------------------------ | ------------------------ |
| テスト仕様 | `./phase-4-test-creation.md`   | テスト戦略とケース定義   |
| テスト計画 | `outputs/phase-4/test-plan.md` | テストID、対象、期待結果 |

## 完了条件

- [x] 単体/統合/UI のテスト仕様が定義されている
- [x] 境界値ケースが定義されている
- [x] 失敗系ケースが定義されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 5（実装）でテスト仕様に沿って実装する。
