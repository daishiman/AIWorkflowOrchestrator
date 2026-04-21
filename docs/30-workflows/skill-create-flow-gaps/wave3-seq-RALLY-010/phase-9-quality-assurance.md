# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 9                        |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | Phase 8                  |
| 後続Phase  | Phase 10                 |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

実装・テスト・リファクタリングを通じた品質状態を総合評価し、Phase 10 最終レビューゲートへの入力とする品質レポートを作成する。

## 実行タスク

- 品質指標集計: typecheck・lint・test の結果を集計する
- リスク評価: 後続タスク（RALLY-011〜013）への影響リスクを評価する
- 因果ループ確認: 今回の変更が予期しない副作用を生まないか確認する

## 品質チェックコマンド

```bash
# TypeScript チェック
pnpm --filter @repo/desktop typecheck

# ESLint チェック
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test

# カバレッジ確認
pnpm --filter @repo/desktop test --coverage
```

## リスク評価観点

| リスク項目                   | 内容                                                              |
| ---------------------------- | ----------------------------------------------------------------- |
| RALLY-011 との衝突           | 同一ファイルへの変更。RALLY-010 完了後に RALLY-011 が着手すること |
| `isRallyCompleted` の型依存  | workflowSnapshot 型変更時に判定ロジックの更新が必要               |
| 待機メッセージ変更による回帰 | 既存テストが旧メッセージ文字列をハードコードしていないか          |

## 参照資料

| 資料名         | パス                                         | 説明           |
| -------------- | -------------------------------------------- | -------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`        | Phase 8 成果物 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md` | Phase 8 成果物 |

## 成果物

| 成果物         | パス                                   | 説明               |
| -------------- | -------------------------------------- | ------------------ |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質指標の総合評価 |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスクと対策一覧   |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 副作用確認結果     |

## 完了条件

- [ ] 品質レポートが作成されていること
- [ ] リスク台帳が作成されていること
- [ ] typecheck・lint・test すべて 0 エラーであること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p10-seq-RALLY-010
```

## 次のPhase

Phase 10: 最終レビューゲート
