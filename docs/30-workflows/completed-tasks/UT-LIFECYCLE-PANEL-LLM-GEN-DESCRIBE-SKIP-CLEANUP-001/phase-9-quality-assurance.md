# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 9                                                              |
| 機能名     | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 8                                                        |
| 後続Phase  | Phase 10                                                       |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

静的解析・ESLint・TypeScript型チェックを実行し、品質とリスクを定量化して運用判断を可能にする。

## 背景

`SkillLifecyclePanel.llm-generation.test.tsx` のリファクタリング完了後、テストコードに型エラー・lintエラーが残存していないかを検証する。旧API依存のモック除去やimport整理が副作用を生じていないことを静的解析で保証する。

## SubAgentチーム編成

| SubAgent   | 関心ごと       | 主担当                         |
| ---------- | -------------- | ------------------------------ |
| SubAgent-A | 静的解析責務   | ESLint実行・エラー分類         |
| SubAgent-B | 型チェック責務 | TypeScript型エラー検出・修正   |
| SubAgent-C | テスト実行責務 | Vitestによるテスト全件PASS確認 |
| SubAgent-D | 統合監査       | 矛盾・漏れ・整合・依存判定     |

## 実行タスク

- 品質監査: ESLint・TypeScript型チェック・Vitestテストを実行し評価する
- リスク評価: 残存リスクを影響度×発生頻度で分類する
- 因果ループ監査: 修正が新規障害を生む循環がないか評価する

## 参照資料

| 参照資料         | パス                                             | 説明           |
| ---------------- | ------------------------------------------------ | -------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`      | Phase 5 成果物 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`               | Phase 5 成果物 |
| リファクタ計画   | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 再テスト計画     | `outputs/phase-8/post-refactor-test-plan.md`     | Phase 8 成果物 |
| 責務境界マップ   | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を `outputs/phase-9/` に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

### 具体的なコマンド手順

```bash
# ESLintによる静的解析
pnpm --filter @repo/desktop lint apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# TypeScript型チェック
pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "llm-generation|error TS"

# Vitestによるテスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="llm-generation" --run

# テスト結果の詳細確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel.llm-generation" --run --reporter=verbose

# Prettierフォーマット確認
pnpm --filter @repo/desktop exec prettier --check "src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx"
```

## 多角的チェック観点

| 観点     | 確認内容                                                 |
| -------- | -------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                       |
| 漏れ     | 要件から成果物への未反映項目がないか確認する             |
| 整合性   | テストコードとコンポーネント実装が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する            |

## 統合テスト連携

| 判定項目                                | 基準 | 結果    |
| --------------------------------------- | ---- | ------- |
| `pnpm --filter @repo/desktop test:run`  | PASS | pending |
| `pnpm --filter @repo/desktop typecheck` | PASS | pending |
| 対象テストファイル lint                 | PASS | pending |
| Prettier check                          | PASS | pending |

## 成果物

| 成果物         | パス                                   | 説明                      |
| -------------- | -------------------------------------- | ------------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | ESLint/型チェック評価結果 |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | 残存リスク一覧            |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 因果循環評価結果          |

## 完了条件

- [ ] ESLintエラーが0件であることを確認
- [ ] TypeScript型エラーが0件であることを確認
- [ ] Vitestテスト全件PASSであることを確認
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 10: 最終レビューゲート
