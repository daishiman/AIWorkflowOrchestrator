# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 6                                      |
| 機能名 | TASK-RT-03-skill-creation-result-panel |
| 作成日 | 2026-04-04                             |

## 目的

Phase 5 の実装に対して fail path・エッジケース・regression guard を追加し、テストの堅牢性を高める。

## 実行タスク

- **fail path 追加**: props 各種 null/undefined パターンの境界ケース
- **エッジケース追加**: 空配列・空文字・長いファイルパス等
- **regression guard**: `SkillLifecyclePanel` への統合が既存動作を壊していないことを確認
- **補助コマンド**: Phase 7 のカバレッジ計測に備えてテスト構成を整理

## 実行手順

### ステップ 1: fail path テスト追加

**追加するテストケース**:

| TC ID | ケース                                                                                 |
| ----- | -------------------------------------------------------------------------------------- |
| TC-12 | planResult.agents が空配列の場合にクラッシュしない                                     |
| TC-13 | planResult.scripts が空配列の場合にクラッシュしない                                    |
| TC-14 | executeResult.persistResult が null の場合にクラッシュしない                           |
| TC-15 | executeResult.persistResult.skillPath が空文字、files が空配列の場合にクラッシュしない |
| TC-16 | verifyDetail.checks が空配列の場合にクラッシュしない                                   |
| TC-17 | planResult.description が空文字の場合にクラッシュしない                                |
| TC-18 | executeResult.sessionId が undefined の場合にクラッシュしない                          |
| TC-19 | verifyDetail.nextAction が undefined の場合にクラッシュしない                          |

### ステップ 2: 全体ステータスバッジの境界テスト

Phase 2 の部分成功判定テーブルの残パターンをテスト:

| TC ID | ケース                                                   |
| ----- | -------------------------------------------------------- |
| TC-20 | planResult あり・executeResult null → 「Plan完了」バッジ |
| TC-21 | planResult null → 「進行中」バッジ                       |
| TC-22 | verifyDetail.status="pending" → 「検証中」バッジ         |

### ステップ 3: regression guard

```bash
# SkillLifecyclePanel の既存テスト確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel"

# PlanResultDetailPanel の既存テスト確認（存在する場合）
pnpm --filter @repo/desktop test -- --testPathPattern="PlanResultDetailPanel"

# ExecuteResultDetailPanel の既存テスト確認（存在する場合）
pnpm --filter @repo/desktop test -- --testPathPattern="ExecuteResultDetailPanel"

# VerifyResultDetailPanel の既存テスト確認（存在する場合）
pnpm --filter @repo/desktop test -- --testPathPattern="VerifyResultDetailPanel"
```

### ステップ 4: テスト実行・全件 GREEN 確認

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreationResultPanel"

# 期待: TC-01〜TC-22 全て GREEN
```

## 統合テスト連携【必須】

| 判定項目                                                               | 基準 | 結果 |
| ---------------------------------------------------------------------- | ---- | ---- |
| TC-01〜TC-22 が全て GREEN                                              | 100% | TBD  |
| 既存テスト（SkillLifecyclePanel / VerifyResultDetailPanel 等）が GREEN | 100% | TBD  |

## 成果物

| 成果物                   | パス                                                                           | 説明                    |
| ------------------------ | ------------------------------------------------------------------------------ | ----------------------- |
| テストファイル（拡充後） | `apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.test.tsx` | TC-01〜TC-22 全22ケース |
| テスト拡充レポート       | `outputs/phase-6/test-expansion-report.md`                                     | 追加ケース一覧・結果    |

## 完了条件

- [ ] TC-12〜TC-22 が全て実装されている
- [ ] TC-01〜TC-22 が全て GREEN
- [ ] 既存テストが回帰していない（regression guard PASS）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認
