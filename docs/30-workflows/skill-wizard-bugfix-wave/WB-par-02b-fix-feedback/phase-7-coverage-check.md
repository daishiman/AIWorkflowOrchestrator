# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 7                                                              |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                                       |
| 機能名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| 前提Phase  | Phase 6（テスト拡充完了）                                      |
| 後続Phase  | Phase 8                                                        |
| 作成日     | 2026-04-12                                                     |
| ステータス | pending                                                        |

## 目的

追加したテストケース（TC-FEEDBACK-001〜013）が、変更箇所を十分にカバーしているかを確認する。

## カバレッジ対象範囲

変更したファイルおよびブロックに限定する。

| 対象ファイル                            | 確認項目                                                     |
| --------------------------------------- | ------------------------------------------------------------ |
| `SkillCreateWizard.tsx`（変更箇所のみ） | `handleExecutePlan`成功パスの`fetchSkills()`呼び出しブロック |
| `CompleteStep.tsx`（変更箇所のみ）      | `skillPath === null`分岐・成功ヘッダー条件表示ブロック       |

## カバレッジ目標

| 対象                                    | line カバレッジ | branch カバレッジ |
| --------------------------------------- | --------------- | ----------------- |
| `handleExecutePlan`の変更ブロック       | 100%            | 100%              |
| `CompleteStep`の`skillPath`分岐ブロック | 100%            | 100%              |
| 変更ファイル全体                        | 80%以上         | 70%以上           |

## カバレッジ計測コマンド

```bash
# 変更ファイルに絞ったカバレッジ計測
pnpm vitest run --coverage \
  --coverage.include="apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx" \
  --coverage.include="apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx" \
  --reporter=verbose

# カバレッジレポート確認
cat coverage/coverage-summary.json | jq '.total'
```

## 未到達分析

カバレッジ計測後、未到達ブロックが発見された場合：

1. 未到達理由を分析する（dead codeか・テスト不足か）
2. テスト不足の場合 → Phase 6へ戻りテスト追加
3. dead codeの場合 → Phase 8（リファクタリング）で対処

## 参照資料

| 資料名                   | パス                                                                         | 用途             |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------- |
| Phase 6 拡充テストケース | `outputs/phase-6/expanded-test-cases.md`                                     | テスト一覧の確認 |
| coverage-standards       | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ基準   |

## 成果物

| 成果物           | パス                                 | 説明                                     |
| ---------------- | ------------------------------------ | ---------------------------------------- |
| カバレッジ報告書 | `outputs/phase-7/coverage-report.md` | 実測値・未到達分析・対処方針を含む報告書 |

## 完了条件

- [ ] 変更箇所のlineカバレッジ・branchカバレッジが実測記録されていること
- [ ] 未到達ブロックの分析結果が記録されていること
- [ ] カバレッジ目標の達成可否が明記されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
